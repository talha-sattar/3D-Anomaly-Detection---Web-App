"use client"

import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { useState, useEffect } from "react"
import { ZoomIn } from "lucide-react"

interface InferenceResults {
  input_rgb: string
  point_cloud_mean: string
  residual_2d: string
  combined_residual: string
}

interface ResultsGridProps {
  results: InferenceResults | null
  isLoading: boolean
  onTryNewInput?: () => void
}

const resultLabels = [
  { key: "input_rgb", label: "RGB", description: "Original RGB input image" },
  { key: "point_cloud_mean", label: "Point Cloud", description: "Grayscale point cloud visualization" },
  { key: "residual_2d", label: "2D", description: "Residual analysis (jet colormap)" },
  { key: "combined_residual", label: "Anomaly Map", description: "Combined 2D/3D residual analysis" },
]

const loadingMessages = [
  "Processing Image...",
  "Processing Point Clouds...",
  "Feature Extraction...",
  "Detecting Anomaly..."
]

export function ResultsGrid({ results, isLoading, onTryNewInput }: ResultsGridProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [currentLoadingMessage, setCurrentLoadingMessage] = useState(0)

  // Download all images as separate downloads
  function handleDownloadAll(results: InferenceResults) {
    const fileNames: { [key: string]: string } = {
      input_rgb: "input_rgb.png",
      point_cloud_mean: "point_cloud_mean.png",
      residual_2d: "residual_2d.png",
      combined_residual: "combined_residual.png",
    };

    Object.entries(results).forEach(([key, url]) => {
      if (url) {
        const link = document.createElement("a");
        link.href = url;
        link.download = fileNames[key] || `${key}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    });
  }

  // Download collage image
  function handleDownloadCollage(results: InferenceResults) {
    const items = [
      { key: "input_rgb", label: "RGB" },
      { key: "point_cloud_mean", label: "Point Cloud" },
      { key: "residual_2d", label: "2D Residual" },
      { key: "combined_residual", label: "Combined Residual" },
    ];

    const cellSize = 256;
    const labelHeight = 28;
    const canvas = document.createElement("canvas");
    canvas.width = cellSize * 2;
    canvas.height = (cellSize + labelHeight) * 2;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const loadImg = src =>
      new Promise<HTMLImageElement>(resolve => {
        const img = new window.Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.src = src;
      });

    Promise.all(items.map(item => loadImg(results[item.key] || ""))).then(imgs => {
      imgs.forEach((img, i) => {
        const row = Math.floor(i / 2);
        const col = i % 2;
        ctx.font = "bold 18px sans-serif";
        ctx.fillStyle = "#222";
        ctx.textAlign = "center";
        ctx.fillText(
          items[i].label,
          col * cellSize + cellSize / 2,
          row * (cellSize + labelHeight) + 22
        );
        ctx.drawImage(
          img,
          col * cellSize,
          row * (cellSize + labelHeight) + labelHeight,
          cellSize,
          cellSize
        );
      });

      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = "collage.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

  function handleTryNewInput() {
    if (typeof onTryNewInput === "function") {
      onTryNewInput();
    }
  }

  useEffect(() => {
    if (!isLoading) {
      setCurrentLoadingMessage(0)
      return
    }

    const interval = setInterval(() => {
      setCurrentLoadingMessage((prev) => {
        if (prev < loadingMessages.length - 1) {
          return prev + 1
        }
        return prev
      })
    }, 1500)

    return () => clearInterval(interval)
  }, [isLoading])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-gray-50 dark:bg-gray-800 rounded-lg">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <AnimatePresence mode="wait">
            <motion.h3
              key={currentLoadingMessage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2"
            >
              {loadingMessages[currentLoadingMessage]}
            </motion.h3>
          </AnimatePresence>
          <p className="text-sm text-gray-500 dark:text-gray-400">Please wait while we analyze your data...</p>
          <div className="mt-4 w-64 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mx-auto">
            <motion.div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${((currentLoadingMessage + 1) / loadingMessages.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>
      </div>
    )
  }

  if (!results) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[300px] bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 mx-auto flex items-center justify-center">
            <ZoomIn className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">No Results Yet</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
            Upload your files and click "Run Inference" to see the analysis results displayed here.
          </p>
        </div>
      </div>
    )
  }

  if (selectedImage) {
    return (
      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative w-full rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800"
          style={{ aspectRatio: "1/1" }}
        >
          <Image
            src={selectedImage || "/placeholder.svg"}
            alt="Selected result"
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-2 right-2 bg-white dark:bg-gray-800 p-2 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="sr-only">Close</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-700 dark:text-gray-300"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </motion.div>
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Click to return to all results</p>
        </div>
      </div>
    )
  }

  // ---- Button bar with new design ----
  return (
    <div>
      <div className="mb-4 flex flex-col md:flex-row gap-2 md:justify-end">
        {/* Download All Images */}
        <button
          onClick={() => handleDownloadAll(results)}
          className="flex items-center justify-center gap-2 w-full md:w-auto px-6 py-2 rounded-2xl font-semibold text-white bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 shadow-lg hover:from-cyan-400 hover:via-blue-400 hover:to-purple-400 transition-all duration-200"
        >
          {/* Icon: Download */}
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-download">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" x2="12" y1="15" y2="3"/>
          </svg>
          Download All Images
        </button>

        {/* Download Collage */}
        <button
          onClick={() => handleDownloadCollage(results)}
          className="flex items-center justify-center gap-2 w-full md:w-auto px-6 py-2 rounded-2xl font-semibold text-white bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 shadow-lg hover:from-cyan-400 hover:via-blue-400 hover:to-purple-400 transition-all duration-200"
        >
          {/* Icon: Collage/Grid */}
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-grid">
            <rect width="7" height="7" x="3" y="3" rx="1"/>
            <rect width="7" height="7" x="14" y="3" rx="1"/>
            <rect width="7" height="7" x="14" y="14" rx="1"/>
            <rect width="7" height="7" x="3" y="14" rx="1"/>
          </svg>
          Download Collage
        </button>

        {/* Try New Input */}
        <button
          onClick={handleTryNewInput}
          className="flex items-center justify-center gap-2 w-full md:w-auto px-6 py-2 rounded-2xl font-semibold text-white bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 shadow-lg hover:from-cyan-400 hover:via-blue-400 hover:to-purple-400 transition-all duration-200"
        >
          {/* Icon: Refresh/Upload */}
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-rotate-ccw">
            <path d="M3 2v6h6"/>
            <path d="M3 13a9 9 0 1 0 3-7.7L3 8"/>
          </svg>
          Try New Input
        </button>
      </div>

      {/* Results grid */}
      <div className="grid grid-cols-2 gap-4">
        {resultLabels.map((item, index) => {
          const imageUrl = results[item.key as keyof InferenceResults]
          return (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-2"
              onClick={() => setSelectedImage(imageUrl)}
            >
              <div
                className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-pointer group"
                style={{ aspectRatio: "1/1" }}
              >
                <Image
                  src={imageUrl || "/placeholder.svg?height=256&width=256"}
                  alt={item.label}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-white dark:bg-gray-800 rounded-full p-2">
                    <ZoomIn className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  </div>
                </div>
              </div>
              <div className="text-center">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</h4>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
