import os
import uuid
import shutil
import traceback  # Add this import at the top

import time
import threading
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
import torch
from torchvision import transforms
import numpy as np
from PIL import Image
import tifffile
import matplotlib.pyplot as plt
from models.features import MultimodalFeatures
import torch.nn as nn
import torch.nn.functional as F
import tifffile as tiff
import torch
# Import required model classes from infer.py
from infer import FusionEncoder, DecoupledDecoder, set_seeds

app = Flask(__name__)
CORS(app)

# Configuration with absolute paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'temp_input')
OUTPUT_FOLDER = os.path.join(BASE_DIR, 'temp_output')
CHECKPOINT_FOLDER = os.path.join(BASE_DIR, 'checkpoints', 'General')

# Ensure directories exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

def organized_pc_to_unorganized_pc(organized_pc):
    return organized_pc.reshape(organized_pc.shape[0] * organized_pc.shape[1], organized_pc.shape[2])


def read_tiff_organized_pc(path):
    tiff_img = tiff.imread(path)
    return tiff_img


def resize_organized_pc(organized_pc, target_height=224, target_width=224, tensor_out=True):
    torch_organized_pc = torch.tensor(organized_pc).permute(2, 0, 1).unsqueeze(dim=0).contiguous()
    torch_resized_organized_pc = torch.nn.functional.interpolate(torch_organized_pc, size=(target_height, target_width),
                                                                 mode='nearest')
    if tensor_out:
        return torch_resized_organized_pc.squeeze(dim=0).contiguous()
    else:
        return torch_resized_organized_pc.squeeze().permute(1, 2, 0).contiguous().numpy()


def organized_pc_to_depth_map(organized_pc):
    return organized_pc[:, :, 2]

def allowed_image_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in {'png', 'jpg', 'jpeg'}

def allowed_point_cloud_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in {'tiff', 'tif', 'ply', 'pcd', 'obj'}

def load_image(image_path, img_size=224):
    print(f"Loading image from {image_path}")
    transform = transforms.Compose([
        transforms.Resize((img_size, img_size)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    image = Image.open(image_path).convert('RGB')
    image = transform(image).unsqueeze(0)
    return image

def load_point_cloud(tiff_path, img_size=224):
    print(f"Loading point cloud from {tiff_path}")
    point_cloud = tifffile.imread(tiff_path)
    point_cloud = torch.tensor(point_cloud, dtype=torch.float32)
    if point_cloud.ndim == 2:
        point_cloud = point_cloud.unsqueeze(-1)
    point_cloud = point_cloud.permute(2, 0, 1).unsqueeze(0)
    point_cloud = F.interpolate(point_cloud, size=(img_size, img_size), mode='bilinear', align_corners=False)
    return point_cloud

def infer_single_CFM(rgb_path, tiff_path, class_name, batch_size=1, epochs_no=100):
    organized_pc = read_tiff_organized_pc(tiff_path)
    depth_map_3channel = np.repeat(organized_pc_to_depth_map(organized_pc)[:, :, np.newaxis], 3, axis=2)
    depth_map = resize_organized_pc(depth_map_3channel)

    print(f"\n=== Starting inference for class: {class_name} ===")
    print(f"RGB path: {rgb_path} (exists: {os.path.exists(rgb_path)})")
    print(f"TIFF path: {tiff_path} (exists: {os.path.exists(tiff_path)})")
    
    set_seeds()
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Using device: {device}")

    # Load models
    print("Loading models...")
    fusion_encoder = FusionEncoder(in_features_2D=768, in_features_3D=1152, out_features=960).to(device)
    decoder_2D = DecoupledDecoder(in_features=960, out_features=768).to(device)
    decoder_3D = DecoupledDecoder(in_features=960, out_features=1152).to(device)

    model_name = f'{class_name}_{epochs_no}ep_{batch_size}bs'
    checkpoint_path = os.path.join(CHECKPOINT_FOLDER, class_name)
    print(f"\nChecking checkpoint files exist:")
    fusion_checkpoint = os.path.join(checkpoint_path, f'fusion_encoder_{model_name}.pth')
    decoder_2d_checkpoint = os.path.join(checkpoint_path, f'decoder_2D_{model_name}.pth')
    decoder_3d_checkpoint = os.path.join(checkpoint_path, f'decoder_3D_{model_name}.pth')
    print(f"Fusion encoder: {fusion_checkpoint} (exists: {os.path.exists(fusion_checkpoint)})")
    print(f"Decoder 2D: {decoder_2d_checkpoint} (exists: {os.path.exists(decoder_2d_checkpoint)})")
    print(f"Decoder 3D: {decoder_3d_checkpoint} (exists: {os.path.exists(decoder_3d_checkpoint)})")

    if not all(os.path.exists(p) for p in [fusion_checkpoint, decoder_2d_checkpoint, decoder_3d_checkpoint]):
        raise Exception("One or more checkpoint files are missing")

    try:
        fusion_encoder.load_state_dict(torch.load(fusion_checkpoint))
        decoder_2D.load_state_dict(torch.load(decoder_2d_checkpoint))
        decoder_3D.load_state_dict(torch.load(decoder_3d_checkpoint))
    except Exception as e:
        raise Exception(f"Failed to load model checkpoints: {str(e)}")

    fusion_encoder.eval()
    decoder_2D.eval()
    decoder_3D.eval()

    # Load input data
    rgb = load_image(rgb_path).to(device)
    pc = load_point_cloud(tiff_path).to(device)

    # Feature extractor
    print("Extracting features...")
    feature_extractor = MultimodalFeatures()

    w_l, w_u = 5, 7
    pad_l, pad_u = 2, 3
    weight_l = torch.ones(1, 1, w_l, w_l, device=device) / (w_l**2)
    weight_u = torch.ones(1, 1, w_u, w_u, device=device) / (w_u**2)

    unique_id = str(uuid.uuid4())
    output_subfolder = os.path.join(OUTPUT_FOLDER, unique_id)
    os.makedirs(output_subfolder, exist_ok=True)
    print(f"Saving output files to {output_subfolder}")

    output_paths = {
        'input_rgb': os.path.join(output_subfolder, f"{class_name}_rgb_input.png"),
        'point_cloud_mean': os.path.join(output_subfolder, f"{class_name}_point_cloud.png"),
        'residual_2d': os.path.join(output_subfolder, f"{class_name}_2d_residual.png"),
        'combined_residual': os.path.join(output_subfolder, f"{class_name}_combined_residual.png")
    }


    with torch.no_grad():
            rgb_patch, xyz_patch = feature_extractor.get_features_maps(rgb, pc)
            # Fusion and Restoration
            fusion_embedding = fusion_encoder(rgb_patch, xyz_patch)
            restored_2D = decoder_2D(fusion_embedding)
            restored_3D = decoder_3D(fusion_embedding)

            xyz_mask = (xyz_patch.sum(axis=-1) == 0)  # Mask only the feature vectors that are 0 everywhere

            residual_2D = (restored_2D - rgb_patch).pow(2).sum(1).sqrt()
            residual_3D = (restored_3D - xyz_patch).pow(2).sum(1).sqrt()

            residual_comb = (residual_2D * residual_3D)
            residual_comb[xyz_mask] = 0.0

            residual_comb = residual_comb.reshape(1, 1, 224, 224)
            for _ in range(5):
                residual_comb = torch.nn.functional.conv2d(input=residual_comb, padding=pad_l, weight=weight_l)
            for _ in range(3):
                residual_comb = torch.nn.functional.conv2d(input=residual_comb, padding=pad_u, weight=weight_u)
            residual_comb = residual_comb.reshape(224, 224)

            denormalize = transforms.Compose([
                transforms.Normalize(mean=[0., 0., 0.], std=[1/0.229, 1/0.224, 1/0.225]),
                transforms.Normalize(mean=[-0.485, -0.456, -0.406], std=[1., 1., 1.]),
            ])

            rgb_img = denormalize(rgb).squeeze().permute(1, 2, 0).cpu().detach().numpy()
            depth_map = depth_map.squeeze().permute(1, 2, 0).float().mean(axis=-1).cpu().detach().numpy()
            # depth_map = depth_map.squeeze().permute(1,2,0).mean(axis=-1).cpu().detach().numpy()
            residual_3D_img = residual_3D.reshape(224, 224).cpu().detach().numpy()
            residual_2D_img = residual_2D.reshape(224, 224).cpu().detach().numpy()
            residual_comb_img = residual_comb.reshape(224, 224).cpu().detach().numpy()

            plt.imsave(os.path.join(output_subfolder,  f"{class_name}_rgb_input.png"), rgb_img)
            plt.imsave(os.path.join(output_subfolder,  f"{class_name}_2d_residual.png"), residual_2D_img, cmap=plt.cm.jet)
            plt.imsave(os.path.join(output_subfolder,  f"{class_name}_point_cloud.png"), depth_map)
            plt.imsave(os.path.join(output_subfolder,  f"{class_name}_combined_residual.png"), residual_comb_img, cmap=plt.cm.jet)



    # # Create output subfolder
    # unique_id = str(uuid.uuid4())
    # output_subfolder = os.path.join(OUTPUT_FOLDER, unique_id)
    # os.makedirs(output_subfolder, exist_ok=True)
    # print(f"Saving output files to {output_subfolder}")

    # # Denormalize for visualization
    # denormalize = transforms.Compose([
    #     transforms.Normalize(mean=[0., 0., 0.], std=[1/0.229, 1/0.224, 1/0.225]),
    #     transforms.Normalize(mean=[-0.485, -0.456, -0.406], std=[1., 1., 1.])
    # ])
    # rgb_vis = denormalize(rgb).squeeze().permute(1, 2, 0).cpu().numpy()
    # pc_vis = pc.squeeze().permute(1, 2, 0).mean(dim=-1).cpu().numpy()

    # # Save output plots
    # output_paths = {
    #     'input_rgb': os.path.join(output_subfolder, f"{class_name}_rgb_input.png"),
    #     'point_cloud_mean': os.path.join(output_subfolder, f"{class_name}_point_cloud.png"),
    #     'residual_2d': os.path.join(output_subfolder, f"{class_name}_2d_residual.png"),
    #     'combined_residual': os.path.join(output_subfolder, f"{class_name}_combined_residual.png")
    # }

    # # Save RGB Input
    # print(f"Saving RGB input to {output_paths['input_rgb']}")
    # plt.figure(figsize=(3.5, 3.5))
    # plt.imshow(rgb_vis)
    # plt.title('RGB Input')
    # plt.xticks([])
    # plt.yticks([])
    # plt.savefig(output_paths['input_rgb'], dpi=256)
    # plt.close()

    # # Save Point Cloud
    # print(f"Saving point cloud to {output_paths['point_cloud_mean']}")
    # plt.figure(figsize=(3.5, 3.5))
    # plt.imshow(pc_vis, cmap='gray')
    # plt.title('Point Cloud')
    # plt.xticks([])
    # plt.yticks([])
    # plt.savefig(output_paths['point_cloud_mean'], dpi=256)
    # plt.close()

    # # Save 2D Residual
    # print(f"Saving 2D residual to {output_paths['residual_2d']}")
    # plt.figure(figsize=(3.5, 3.5))
    # plt.imshow(residual_2D, cmap='jet')
    # plt.title('2D Residual')
    # plt.xticks([])
    # plt.yticks([])
    # plt.savefig(output_paths['residual_2d'], dpi=256)
    # plt.close()

    # # Save Combined Residual
    # print(f"Saving combined residual to {output_paths['combined_residual']}")
    # plt.figure(figsize=(3.5, 3.5))
    # plt.imshow(residual_comb, cmap='jet')
    # plt.title('Combined Residual')
    # plt.xticks([])
    # plt.yticks([])
    # plt.savefig(output_paths['combined_residual'], dpi=256)
    # plt.close()

    # Verify files exist
    for key, path in output_paths.items():
        if not os.path.exists(path):
            raise Exception(f"Output file not saved: {path}")

    return output_paths

@app.route('/')
def index():
    return jsonify({'message': 'Flask backend is running. Use /api/infer for inference or /api/test-upload for testing file uploads.'}), 200

@app.route('/api/test-upload', methods=['POST'])
def test_upload():
    print("\n=== TEST UPLOAD DEBUGGING ===")
    print(f"Request files: {request.files}")
    print(f"Request form: {request.form}")
    
    rgb_file = request.files.get('rgb_file')
    tiff_file = request.files.get('tiff_file')
    
    if not rgb_file or not tiff_file:
        print("Missing files in request")
        return jsonify({'error': 'Both files required'}), 400

    print(f"\nFile details:")
    print(f"RGB filename: {rgb_file.filename}")
    print(f"RGB content type: {rgb_file.content_type}")
    print(f"RGB content length: {rgb_file.content_length}")
    print(f"RGB stream: {rgb_file.stream}")
    print(f"TIFF filename: {tiff_file.filename}")
    print(f"TIFF content type: {tiff_file.content_type}")
    print(f"TIFF content length: {tiff_file.content_length}")
    print(f"TIFF stream: {tiff_file.stream}")

    # Try saving files
    test_dir = os.path.join(UPLOAD_FOLDER, 'test_upload')
    os.makedirs(test_dir, exist_ok=True)
    
    rgb_path = os.path.join(test_dir, secure_filename(rgb_file.filename))
    tiff_path = os.path.join(test_dir, secure_filename(tiff_file.filename))
    
    try:
        rgb_file.save(rgb_path)
        tiff_file.save(tiff_path)
        print(f"\nFiles saved to:")
        print(f"RGB: {rgb_path} (size: {os.path.getsize(rgb_path)} bytes)")
        print(f"TIFF: {tiff_path} (size: {os.path.getsize(tiff_path)} bytes)")
        
        # Verify files
        rgb_exists = os.path.exists(rgb_path)
        tiff_exists = os.path.exists(tiff_path)
        print(f"\nFile verification:")
        print(f"RGB exists: {rgb_exists}")
        print(f"TIFF exists: {tiff_exists}")
        
        if not rgb_exists or not tiff_exists:
            return jsonify({'error': 'Files failed to save'}), 500
            
        return jsonify({
            'message': 'Files received and saved successfully',
            'rgb_path': rgb_path,
            'tiff_path': tiff_path
        }), 200
        
    except Exception as e:
        print(f"\nError saving files: {str(e)}")
        return jsonify({'error': f'File save failed: {str(e)}'}), 500

@app.route('/temp_output/<path:filename>')
def serve_output(filename):
    """Serve files from the temp_output directory, handling nested UUID subdirectories."""
    try:
        # Normalize path separators (Windows uses backslashes)
        filename = filename.replace('\\', '/')
        
        # Split the path into components
        path_parts = filename.split('/')
        
        # The first part should be the UUID subdirectory
        if len(path_parts) > 1:
            subdir = path_parts[0]
            actual_filename = '/'.join(path_parts[1:])
            directory = os.path.join(OUTPUT_FOLDER, subdir)
        else:
            directory = OUTPUT_FOLDER
            actual_filename = filename
        
        # Ensure the path exists
        full_path = os.path.join(directory, actual_filename)
        if not os.path.exists(full_path):
            print(f"File not found: {full_path}")
            return jsonify({'error': 'File not found'}), 404
        
        print(f"Serving file from: {directory}/{actual_filename}")
        return send_from_directory(directory, actual_filename)
        
    except Exception as e:
        print(f"Error serving file {filename}: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/infer', methods=['POST'])
def infer():
    print("\n=== Received /api/infer request ===")
    try:
        print(f"Request files: {request.files}")
        print(f"Request form: {request.form}")
        
        # Validate inputs
        if 'rgb_file' not in request.files or 'tiff_file' not in request.files:
            print("Missing files in request")
            return jsonify({'error': 'Both RGB and TIFF files are required'}), 400

        rgb_file = request.files['rgb_file']
        tiff_file = request.files['tiff_file']
        class_name = request.form.get('class_name', 'cable_gland')

        print(f"\nReceived files: RGB={rgb_file.filename}, TIFF={tiff_file.filename}, Class={class_name}")
        print(f"RGB content type: {rgb_file.content_type}, size: {rgb_file.content_length}")
        print(f"TIFF content type: {tiff_file.content_type}, size: {tiff_file.content_length}")
        print(f"RGB stream: {rgb_file.stream}")
        print(f"TIFF stream: {tiff_file.stream}")

        # Validate file extensions
        if not allowed_image_file(rgb_file.filename):
            print(f"Invalid RGB file extension: {rgb_file.filename}")
            return jsonify({'error': 'RGB file must be PNG, JPG, or JPEG'}), 400
        if not allowed_point_cloud_file(tiff_file.filename):
            print(f"Invalid TIFF file extension: {tiff_file.filename}")
            return jsonify({'error': 'Point cloud file must be TIFF, PLY, PCD, or OBJ'}), 400

        # Validate class name
        valid_classes = [
            "bagel", "cable_gland", "carrot", "cookie", "dowel", "foam", "peach", 
            "potato", "rope", "tire", "CandyCane", "ChocolateCookie", "ChocolatePraline", 
            "Confetto", "GummyBear", "HazelnutTruffle", "LicoriceSandwich", "Lollipop", 
            "Marshmallow", "PeppermintCandy", "Chair"
        ]
        if class_name not in valid_classes:
            print(f"Invalid class name: {class_name}")
            return jsonify({'error': 'Invalid class name'}), 400

        # Save uploaded files
        unique_id = str(uuid.uuid4())
        input_subfolder = os.path.join(UPLOAD_FOLDER, unique_id)
        os.makedirs(input_subfolder, exist_ok=True)
        print(f"Saving input files to {input_subfolder}")

        rgb_path = os.path.join(input_subfolder, secure_filename(rgb_file.filename))
        tiff_path = os.path.join(input_subfolder, secure_filename(tiff_file.filename))
        
        try:
            rgb_file.save(rgb_path)
            tiff_file.save(tiff_path)
        except Exception as e:
            print(f"Error saving files: {str(e)}")
            raise Exception(f"File save failed: {str(e)}")

        # Verify files were saved and have content
        if not os.path.exists(rgb_path) or os.path.getsize(rgb_path) == 0:
            print(f"RGB file not saved or empty: {rgb_path}")
            raise Exception(f"RGB file not saved or empty: {rgb_path}")
        if not os.path.exists(tiff_path) or os.path.getsize(tiff_path) == 0:
            print(f"TIFF file not saved or empty: {tiff_path}")
            raise Exception(f"TIFF file not saved or empty: {tiff_path}")
        print(f"\nInput files saved: RGB={rgb_path} (size: {os.path.getsize(rgb_path)} bytes)")
        print(f"TIFF={tiff_path} (size: {os.path.getsize(tiff_path)} bytes)")

        # Run inference
        print("\n=== BEFORE INFERENCE ===")
        print(f"RGB path: {rgb_path} (exists: {os.path.exists(rgb_path)})")
        print(f"TIFF path: {tiff_path} (exists: {os.path.exists(tiff_path)})")
        print(f"File sizes - RGB: {os.path.getsize(rgb_path)} bytes, TIFF: {os.path.getsize(tiff_path)} bytes")
        
        results = infer_single_CFM(rgb_path, tiff_path, class_name)

        # Convert absolute paths to relative paths for frontend
        results = {k: os.path.relpath(v, start=BASE_DIR) for k, v in results.items()}
        print(f"\nReturning results: {results}")

        return jsonify(results), 200
    
    except Exception as e:
        # Clean up input files in case of error
        if 'input_subfolder' in locals():
            try:
                shutil.rmtree(input_subfolder)
                print(f"Deleted input folder due to error: {e}")
            except Exception:
                pass

        # Print full traceback for debugging
        print("\nError occurred:")
        traceback.print_exc()  # This shows the file, line number, and error

        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    print(f"Starting Flask app with BASE_DIR: {BASE_DIR}")
    app.run(host='0.0.0.0', port=5000, debug=True)