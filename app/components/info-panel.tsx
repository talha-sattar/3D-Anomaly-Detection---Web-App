"use client"

import { motion } from "framer-motion"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface InfoPanelProps {
  onClose: () => void
}

export function InfoPanel({ onClose }: InfoPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">How 3D Anomaly Detection Works</h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Input Data</h4>
          <p className="text-gray-600 dark:text-gray-400">The system requires two types of input data:</p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600 dark:text-gray-400">
            <li>RGB Image (PNG): A standard color image of the object</li>
            <li>Point Cloud (TIFF): A 3D representation of the object's surface</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Processing Pipeline</h4>
          <ol className="list-decimal list-inside mt-2 space-y-3 text-gray-600 dark:text-gray-400">
            <li>
              <span className="font-medium">Feature Extraction</span>: The system extracts features from both the RGB
              image and point cloud data.
            </li>
            <li>
              <span className="font-medium">Normalization</span>: Data is normalized to ensure consistent processing
              across different objects.
            </li>
            <li>
              <span className="font-medium">Anomaly Detection</span>: Using deep learning models trained on normal
              samples, the system identifies deviations from expected patterns.
            </li>
            <li>
              <span className="font-medium">Residual Calculation</span>: The system calculates residual maps
              highlighting areas of anomaly.
            </li>
            <li>
              <span className="font-medium">Visualization</span>: Results are visualized as color-coded maps for easy
              interpretation.
            </li>
          </ol>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Output Results</h4>
          <p className="text-gray-600 dark:text-gray-400">The system generates four output images:</p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600 dark:text-gray-400">
            <li>Input RGB: The original RGB image</li>
            <li>Point Cloud Mean: A grayscale visualization of the point cloud</li>
            <li>2D Residual: A color-coded map showing anomalies in the 2D space</li>
            <li>Combined Residual: A comprehensive visualization combining 2D and 3D anomaly detection</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Supported Datasets</h4>
          <p className="text-gray-600 dark:text-gray-400">
            The system is trained on and supports objects from three major datasets:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600 dark:text-gray-400">
            <li>MVTec 3D-AD: Industrial objects with 3D anomalies</li>
            <li>Eyecandies: Candy and confectionery objects</li>
            <li>BrokenChair180k: Various chair models with defects</li>
          </ul>
        </div>
      </div>
    </motion.div>
  )
}
