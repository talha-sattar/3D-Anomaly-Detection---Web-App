import argparse
import os
import torch
from torchvision import transforms
import numpy as np
from PIL import Image
import tifffile
from models.features import MultimodalFeatures
import torch.nn as nn
import torch.nn.functional as F
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

def set_seeds(sid=42):
    np.random.seed(sid)
    torch.manual_seed(sid)
    if torch.cuda.is_available():
        torch.cuda.manual_seed(sid)
        torch.cuda.manual_seed_all(sid)

class CBAM(nn.Module):
    def __init__(self, channels, reduction_ratio=16, kernel_size=7):
        super(CBAM, self).__init__()
        self.channel_attention = ChannelAttention(channels, reduction_ratio)
        self.spatial_attention = SpatialAttention(kernel_size)

    def forward(self, x):
        x = self.channel_attention(x)
        x = self.spatial_attention(x)
        return x

class ChannelAttention(nn.Module):
    def __init__(self, channels, reduction_ratio=16):
        super(ChannelAttention, self).__init__()
        self.avg_pool = nn.AdaptiveAvgPool2d(1)
        self.max_pool = nn.AdaptiveMaxPool2d(1)
        self.fc = nn.Sequential(
            nn.Linear(channels, channels // reduction_ratio),
            nn.ReLU(),
            nn.Linear(channels // reduction_ratio, channels)
        )
        self.sigmoid = nn.Sigmoid()

    def forward(self, x):
        avg_out = self.fc(self.avg_pool(x).squeeze(-1).squeeze(-1))
        max_out = self.fc(self.max_pool(x).squeeze(-1).squeeze(-1))
        out = avg_out + max_out
        return x * self.sigmoid(out.unsqueeze(-1).unsqueeze(-1))

class SpatialAttention(nn.Module):
    def __init__(self, kernel_size=7):
        super(SpatialAttention, self).__init__()
        self.conv = nn.Conv2d(2, 1, kernel_size, padding=kernel_size // 2, bias=False)
        self.sigmoid = nn.Sigmoid()

    def forward(self, x):
        avg_out = torch.mean(x, dim=1, keepdim=True)
        max_out, _ = torch.max(x, dim=1, keepdim=True)
        out = torch.cat([avg_out, max_out], dim=1)
        out = self.conv(out)
        return x * self.sigmoid(out)

class FusionEncoder(nn.Module):
    def __init__(self, in_features_2D=768, in_features_3D=1152, out_features=960, hidden_dim=None, num_layers=2, dropout=0.1):
        super(FusionEncoder, self).__init__()
        hidden_dim = hidden_dim if hidden_dim is not None else out_features
        self.input_fc = nn.Linear(in_features_2D + in_features_3D, hidden_dim)
        self.layers = nn.ModuleList([nn.Linear(hidden_dim, hidden_dim) for _ in range(num_layers - 1)])
        self.output_fc = nn.Linear(hidden_dim, out_features)
        self.activation = nn.GELU()
        self.dropout = nn.Dropout(dropout)
        self.layer_norm = nn.LayerNorm(hidden_dim)

    def forward(self, x_2D, x_3D):
        x = torch.cat((x_2D, x_3D), dim=-1)
        x = self.activation(self.input_fc(x))
        x = self.layer_norm(x)
        x = self.dropout(x)
        for layer in self.layers:
            x = self.activation(layer(x))
            x = self.layer_norm(x)
            x = self.dropout(x)
        x = self.output_fc(x)
        return x

class DecoupledDecoder(nn.Module):
    def __init__(self, in_features=960, out_features=768, hidden_dim=None, num_layers=3, dropout=0.1):
        super(DecoupledDecoder, self).__init__()
        hidden_dim = hidden_dim if hidden_dim is not None else out_features
        self.input_fc = nn.Linear(in_features, hidden_dim)
        self.layers = nn.ModuleList([nn.Linear(hidden_dim, hidden_dim) for _ in range(num_layers - 1)])
        self.output_fc = nn.Linear(hidden_dim, out_features)
        self.activation = nn.GELU()
        self.norm = nn.LayerNorm(hidden_dim)
        self.cbam = CBAM(channels=hidden_dim)
        self.skip = nn.Linear(in_features, out_features) if in_features != out_features else nn.Identity()
        self.dropout = nn.Dropout(dropout)

    def forward(self, x):
        residual = self.skip(x)
        x = self.activation(self.norm(self.input_fc(x)))
        x = self.dropout(x)
        for layer in self.layers:
            x = self.activation(self.norm(layer(x)))
            x = self.dropout(x)
        x = x.unsqueeze(-1).unsqueeze(-1)
        x = self.cbam(x)
        x = x.squeeze(-1).squeeze(-1)
        x = self.output_fc(x) + residual
        return x

def load_image(image_path, img_size=224):
    """Load and preprocess an RGB image."""
    transform = transforms.Compose([
        transforms.Resize((img_size, img_size)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    image = Image.open(image_path).convert('RGB')
    image = transform(image).unsqueeze(0)  # Add batch dimension
    return image

def load_point_cloud(tiff_path, img_size=224):
    """Load and preprocess a point cloud from TIFF."""
    point_cloud = tifffile.imread(tiff_path)
    point_cloud = torch.tensor(point_cloud, dtype=torch.float32)
    if point_cloud.ndim == 2:
        point_cloud = point_cloud.unsqueeze(-1)
    point_cloud = point_cloud.permute(2, 0, 1).unsqueeze(0)  # Shape: (1, C, H, W)
    point_cloud = F.interpolate(point_cloud, size=(img_size, img_size), mode='bilinear', align_corners=False)
    return point_cloud

def infer_single_CFM(args):
    set_seeds()
    device = "cuda" if torch.cuda.is_available() else "cpu"

    # Load models
    fusion_encoder = FusionEncoder().to(device)
    decoder_2D = DecoupledDecoder(out_features=768).to(device)
    decoder_3D = DecoupledDecoder(out_features=1152).to(device)

    model_name = f'{args.class_name}_{args.epochs_no}ep_{args.batch_size}bs'
    checkpoint_path = f'{args.checkpoint_folder}/{args.class_name}'
    fusion_encoder.load_state_dict(torch.load(os.path.join(checkpoint_path, f'fusion_encoder_{model_name}.pth')))
    decoder_2D.load_state_dict(torch.load(os.path.join(checkpoint_path, f'decoder_2D_{model_name}.pth')))
    decoder_3D.load_state_dict(torch.load(os.path.join(checkpoint_path, f'decoder_3D_{model_name}.pth')))

    fusion_encoder.eval()
    decoder_2D.eval()
    decoder_3D.eval()

    # Load input data
    rgb = load_image(args.rgb_path).to(device)
    pc = load_point_cloud(args.tiff_path).to(device)

    # Feature extractor
    feature_extractor = MultimodalFeatures()

    # Extract features
    with torch.no_grad():
        rgb_patch, xyz_patch = feature_extractor.get_features_maps(rgb, pc)

        # Fusion and restoration
        fusion_embedding = fusion_encoder(rgb_patch, xyz_patch)
        restored_2D = decoder_2D(fusion_embedding)
        restored_3D = decoder_3D(fusion_embedding)

        # Mask for valid 3D points
        xyz_mask = (xyz_patch.sum(axis=-1) == 0)

        # Calculate reconstruction residuals
        residual_2D = (restored_2D - rgb_patch).pow(2).sum(1).sqrt()
        residual_3D = (restored_3D - xyz_patch).pow(2).sum(1).sqrt()

        # Combine residuals
        residual_comb = (residual_2D * residual_3D)
        residual_comb[xyz_mask] = 0.0

        # Apply Gaussian blur approximation
        w_l, w_u = 5, 7
        pad_l, pad_u = 2, 3
        weight_l = torch.ones(1, 1, w_l, w_l, device=device) / (w_l**2)
        weight_u = torch.ones(1, 1, w_u, w_u, device=device) / (w_u**2)
        residual_comb = residual_comb.reshape(1, 1, 224, 224)
        for _ in range(5):
            residual_comb = F.conv2d(residual_comb, weight=weight_l, padding=pad_l)
        for _ in range(3):
            residual_comb = F.conv2d(residual_comb, weight=weight_u, padding=pad_u)
        residual_comb = residual_comb.reshape(224, 224)

    # Prepare outputs
    residual_2D = residual_2D.reshape(224, 224).cpu().numpy()
    residual_3D = residual_3D.reshape(224, 224).cpu().numpy()
    residual_comb = residual_comb.cpu().numpy()

    # Visualize results if requested
    if args.visualize_plot or args.produce_qualitatives:
        denormalize = transforms.Compose([
            transforms.Normalize(mean=[0., 0., 0.], std=[1/0.229, 1/0.224, 1/0.225]),
            transforms.Normalize(mean=[-0.485, -0.456, -0.406], std=[1., 1., 1.])
        ])
        rgb_vis = denormalize(rgb).squeeze().permute(1, 2, 0).cpu().numpy()
        pc_vis = pc.squeeze().permute(1, 2, 0).mean(dim=-1).cpu().numpy()

        fig, axs = plt.subplots(2, 2, figsize=(7, 7))
        axs[0, 0].imshow(rgb_vis)
        axs[0, 0].set_title('RGB Input')
        axs[0, 1].imshow(pc_vis, cmap='gray')
        axs[0, 1].set_title('Point Cloud (Mean)')
        axs[1, 0].imshow(residual_2D, cmap='jet')
        axs[1, 0].set_title('2D Residual')
        axs[1, 1].imshow(residual_comb, cmap='jet')
        axs[1, 1].set_title('Combined Residual')

        for ax in axs.flat:
            ax.set_xticks([])
            ax.set_yticks([])
            ax.set_xticklabels([])
            ax.set_yticklabels([])

        plt.tight_layout()

        if args.produce_qualitatives:
            os.makedirs(args.output_folder, exist_ok=True)
            output_path = os.path.join(args.output_folder, f"{args.class_name}_residuals.png")
            plt.savefig(output_path, dpi=256)
            print(f"Saved visualization to {output_path}")

        if args.visualize_plot:
            plt.show()
        plt.close()

    return residual_2D, residual_3D, residual_comb

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Inference with Crossmodal Feature Networks (CFMs) on single input files.')
    parser.add_argument('--rgb_path', type=str, required=True, help='Path to the input RGB image (e.g., .png).')
    parser.add_argument('--tiff_path', type=str, required=True, help='Path to the input point cloud TIFF file.')
    parser.add_argument('--class_name', default='cable_gland', type=str, choices=["bagel", "cable_gland", "carrot", "cookie", "dowel", "foam", "peach", "potato", "rope", "tire",
                                                                                 'CandyCane', 'ChocolateCookie', 'ChocolatePraline', 'Confetto', 'GummyBear', 'HazelnutTruffle', 'LicoriceSandwich', 'Lollipop', 'Marshmallow', 'PeppermintCandy'],
                        help='Category name.')
    parser.add_argument('--checkpoint_folder', default='./checkpoints/checkpoints_CFM_mvtec_CBAM', type=str, help='Path to the folder containing CFMs checkpoints.')
    parser.add_argument('--output_folder', default='./results/single_inference', type=str, help='Path to save the output residuals and visualizations.')
    parser.add_argument('--epochs_no', default=100, type=int, help='Number of epochs used in training.')
    parser.add_argument('--batch_size', default=1, type=int, help='Batch size used in training.')
    parser.add_argument('--visualize_plot', action='store_true', help='Whether to display the visualization plot.')
    parser.add_argument('--produce_qualitatives', action='store_true', help='Whether to save the visualization.')
    args = parser.parse_args()

    infer_single_CFM(args)