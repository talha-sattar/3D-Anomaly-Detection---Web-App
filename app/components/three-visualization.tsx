"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"

interface ThreeVisualizationProps {
  tiffFile: File | null
  isLoading: boolean
}

export function ThreeVisualization({ tiffFile, isLoading }: ThreeVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const [isProcessing, setIsProcessing] = useState(false)
  const [showGrid, setShowGrid] = useState(true)
  const [showAxes, setShowAxes] = useState(true)
  const [rotation, setRotation] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 })

  // Point cloud data
  const [pointCloud, setPointCloud] = useState<{ x: number; y: number; z: number; color: string }[]>([])

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      const rect = canvas.parentElement?.getBoundingClientRect()
      if (rect) {
        canvas.width = rect.width
        canvas.height = rect.height
      }
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Animation loop
    const animate = () => {
      drawScene(ctx, canvas.width, canvas.height)
      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [pointCloud, rotation, zoom, showGrid, showAxes])

  useEffect(() => {
    if (!tiffFile) return

    setIsProcessing(true)

    // Simulate TIFF processing and create point cloud
    const processPointCloud = () => {
      const points: { x: number; y: number; z: number; color: string }[] = []
      const pointCount = 5000

      const filename = tiffFile.name.toLowerCase()

      if (filename.includes("chair")) {
        createChairShape(points, pointCount)
      } else if (filename.includes("candy") || filename.includes("lollipop")) {
        createCandyShape(points, pointCount)
      } else {
        createIndustrialShape(points, pointCount)
      }

      setPointCloud(points)
      setIsProcessing(false)
    }

    setTimeout(processPointCloud, 1000)
  }, [tiffFile])

  const createChairShape = (points: { x: number; y: number; z: number; color: string }[], pointCount: number) => {
    // Chair base
    for (let i = 0; i < pointCount * 0.3; i++) {
      points.push({
        x: (Math.random() - 0.5) * 150,
        y: Math.random() * 20,
        z: (Math.random() - 0.5) * 150,
        color: `hsl(${30 + Math.random() * 20}, 70%, 50%)`,
      })
    }

    // Chair back
    for (let i = 0; i < pointCount * 0.4; i++) {
      points.push({
        x: (Math.random() - 0.5) * 120,
        y: 20 + Math.random() * 150,
        z: -50 + Math.random() * 20,
        color: `hsl(${30 + Math.random() * 20}, 70%, 50%)`,
      })
    }

    // Chair legs
    for (let leg = 0; leg < 4; leg++) {
      const xPos = leg < 2 ? -60 : 60
      const zPos = leg % 2 === 0 ? -60 : 60

      for (let i = 0; i < pointCount * 0.075; i++) {
        points.push({
          x: xPos + (Math.random() - 0.5) * 10,
          y: Math.random() * 80,
          z: zPos + (Math.random() - 0.5) * 10,
          color: `hsl(${20 + Math.random() * 20}, 60%, 40%)`,
        })
      }
    }
  }

  const createCandyShape = (points: { x: number; y: number; z: number; color: string }[], pointCount: number) => {
    // Lollipop head
    for (let i = 0; i < pointCount * 0.7; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI
      const radius = 80 + Math.random() * 20

      points.push({
        x: radius * Math.sin(phi) * Math.cos(theta),
        y: radius * Math.cos(phi) + 100,
        z: radius * Math.sin(phi) * Math.sin(theta),
        color: `hsl(${Math.random() * 360}, 80%, 60%)`,
      })
    }

    // Stick
    for (let i = 0; i < pointCount * 0.3; i++) {
      points.push({
        x: (Math.random() - 0.5) * 10,
        y: -100 + Math.random() * 200,
        z: (Math.random() - 0.5) * 10,
        color: `hsl(45, 20%, 80%)`,
      })
    }
  }

  const createIndustrialShape = (points: { x: number; y: number; z: number; color: string }[], pointCount: number) => {
    // Cylindrical shape
    for (let i = 0; i < pointCount * 0.6; i++) {
      const theta = Math.random() * Math.PI * 2
      const height = (Math.random() - 0.5) * 150
      const radius = 70 + Math.random() * 10

      points.push({
        x: radius * Math.cos(theta),
        y: height,
        z: radius * Math.sin(theta),
        color: `hsl(220, 20%, ${60 + Math.random() * 20}%)`,
      })
    }

    // Features and holes
    for (let hole = 0; hole < 6; hole++) {
      const theta = (hole * Math.PI) / 3

      for (let i = 0; i < pointCount * 0.05; i++) {
        const r = 20 + Math.random() * 10
        const t = theta + (Math.random() - 0.5) * 0.5
        const h = (Math.random() - 0.5) * 30

        points.push({
          x: 70 * Math.cos(theta) + r * Math.cos(t),
          y: h,
          z: 70 * Math.sin(theta) + r * Math.sin(t),
          color: `hsl(220, 30%, 30%)`,
        })
      }
    }

    // Surface details
    for (let i = 0; i < pointCount * 0.3; i++) {
      const theta = Math.random() * Math.PI * 2
      const height = (Math.random() - 0.5) * 150
      const radius = 80 + Math.random() * 5

      points.push({
        x: radius * Math.cos(theta),
        y: height,
        z: radius * Math.sin(theta),
        color: `hsl(220, 25%, ${70 + Math.random() * 10}%)`,
      })
    }
  }

  const project3D = (x: number, y: number, z: number, width: number, height: number) => {
    // Simple 3D to 2D projection
    const rotX = rotation.x
    const rotY = rotation.y

    // Rotate around Y axis
    const cosY = Math.cos(rotY)
    const sinY = Math.sin(rotY)
    const x1 = x * cosY - z * sinY
    const z1 = x * sinY + z * cosY

    // Rotate around X axis
    const cosX = Math.cos(rotX)
    const sinX = Math.sin(rotX)
    const y1 = y * cosX - z1 * sinX
    const z2 = y * sinX + z1 * cosX

    // Project to 2D
    const distance = 300
    const scale = (distance / (distance + z2)) * zoom

    return {
      x: width / 2 + x1 * scale,
      y: height / 2 - y1 * scale,
      scale: scale,
    }
  }

  const drawScene = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Clear canvas
    ctx.fillStyle = "#f8fafc"
    ctx.fillRect(0, 0, width, height)

    // Draw grid if enabled
    if (showGrid) {
      drawGrid(ctx, width, height)
    }

    // Draw axes if enabled
    if (showAxes) {
      drawAxes(ctx, width, height)
    }

    // Draw point cloud
    if (pointCloud.length > 0) {
      drawPointCloud(ctx, width, height)
    }
  }

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = "#cccccc"
    ctx.lineWidth = 1

    const gridSize = 50
    const gridCount = 10

    for (let i = -gridCount; i <= gridCount; i++) {
      for (let j = -gridCount; j <= gridCount; j++) {
        const x1 = i * gridSize
        const z1 = j * gridSize
        const x2 = (i + 1) * gridSize
        const z2 = j * gridSize

        const p1 = project3D(x1, 0, z1, width, height)
        const p2 = project3D(x2, 0, z2, width, height)

        ctx.beginPath()
        ctx.moveTo(p1.x, p1.y)
        ctx.lineTo(p2.x, p2.y)
        ctx.stroke()

        const p3 = project3D(x1, 0, z2, width, height)
        ctx.beginPath()
        ctx.moveTo(p1.x, p1.y)
        ctx.lineTo(p3.x, p3.y)
        ctx.stroke()
      }
    }
  }

  const drawAxes = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const axisLength = 100

    // X axis (red)
    const xAxis = project3D(axisLength, 0, 0, width, height)
    const origin = project3D(0, 0, 0, width, height)
    ctx.strokeStyle = "#ef4444"
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(origin.x, origin.y)
    ctx.lineTo(xAxis.x, xAxis.y)
    ctx.stroke()

    // Y axis (green)
    const yAxis = project3D(0, axisLength, 0, width, height)
    ctx.strokeStyle = "#22c55e"
    ctx.beginPath()
    ctx.moveTo(origin.x, origin.y)
    ctx.lineTo(yAxis.x, yAxis.y)
    ctx.stroke()

    // Z axis (blue)
    const zAxis = project3D(0, 0, axisLength, width, height)
    ctx.strokeStyle = "#3b82f6"
    ctx.beginPath()
    ctx.moveTo(origin.x, origin.y)
    ctx.lineTo(zAxis.x, zAxis.y)
    ctx.stroke()
  }

  const drawPointCloud = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Sort points by depth for proper rendering
    const projectedPoints = pointCloud
      .map((point) => ({
        ...point,
        projected: project3D(point.x, point.y, point.z, width, height),
      }))
      .sort((a, b) => b.projected.scale - a.projected.scale)

    projectedPoints.forEach((point) => {
      const { projected, color } = point
      const size = Math.max(1, projected.scale * 2)

      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(projected.x, projected.y, size, 0, Math.PI * 2)
      ctx.fill()
    })
  }

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setLastMouse({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return

    const deltaX = e.clientX - lastMouse.x
    const deltaY = e.clientY - lastMouse.y

    setRotation((prev) => ({
      x: prev.x + deltaY * 0.01,
      y: prev.y + deltaX * 0.01,
    }))

    setLastMouse({ x: e.clientX, y: e.clientY })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setZoom((prev) => Math.max(0.1, Math.min(3, prev * delta)))
  }

  const toggleGrid = () => setShowGrid(!showGrid)
  const toggleAxes = () => setShowAxes(!showAxes)

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full rounded-lg cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />

      {/* Controls */}
      <div className="absolute top-4 left-4 space-y-2">
        <button
          onClick={toggleGrid}
          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
            showGrid ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          }`}
        >
          Grid
        </button>
        <button
          onClick={toggleAxes}
          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
            showAxes ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          }`}
        >
          Axes
        </button>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm text-white p-3 rounded-lg text-sm">
        <div className="space-y-1">
          <div>🖱️ Click + drag: Rotate</div>
          <div>🖱️ Scroll: Zoom</div>
          <div>📊 {pointCloud.length} points rendered</div>
        </div>
      </div>

      {(isProcessing || isLoading) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center rounded-lg"
        >
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg flex items-center space-x-3">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium">Processing point cloud...</span>
          </div>
        </motion.div>
      )}

      {!tiffFile && !isProcessing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg"
        >
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-400"
              >
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.29 7 12 12 20.71 7" />
                <line x1="12" y1="22" x2="12" y2="12" />
              </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-400">Upload a TIFF file to visualize the 3D point cloud</p>
          </div>
        </motion.div>
      )}
    </div>
  )
}
