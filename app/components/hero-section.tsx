"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()

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

    // Create enhanced 3D objects with better distribution
    const objects: Array<{
      x: number
      y: number
      z: number
      vx: number
      vy: number
      vz: number
      type: string
      rotation: number
      rotationSpeed: number
      size: number
      color: string
      glowIntensity: number
      pulsePhase: number
    }> = []

    const objectTypes = ["chair", "candy", "industrial", "bagel", "tire", "sphere", "cube", "pyramid"]
    const objectCount = 40
    const minDistance = 100

    // Enhanced color palette for futuristic look
    const colors = [
      { primary: "59, 130, 246", secondary: "147, 197, 253" }, // Blue
      { primary: "139, 92, 246", secondary: "196, 181, 253" }, // Purple
      { primary: "236, 72, 153", secondary: "251, 207, 232" }, // Pink
      { primary: "6, 182, 212", secondary: "165, 243, 252" }, // Cyan
      { primary: "16, 185, 129", secondary: "167, 243, 208" }, // Emerald
      { primary: "245, 158, 11", secondary: "253, 230, 138" }, // Amber
    ]

    // Generate objects with enhanced properties
    for (let i = 0; i < objectCount; i++) {
      let attempts = 0
      let newObject

      do {
        let x, y
        // Better distribution avoiding center more effectively
        const side = Math.floor(Math.random() * 4)
        switch (side) {
          case 0: // Left side
            x = -1000 + Math.random() * 300
            y = (Math.random() - 0.5) * 1200
            break
          case 1: // Right side
            x = 700 + Math.random() * 300
            y = (Math.random() - 0.5) * 1200
            break
          case 2: // Top
            x = (Math.random() - 0.5) * 1400
            y = -600 + Math.random() * 200
            break
          case 3: // Bottom
            x = (Math.random() - 0.5) * 1400
            y = 400 + Math.random() * 200
            break
          default:
            x = (Math.random() - 0.5) * 1000
            y = (Math.random() - 0.5) * 800
        }

        const colorPalette = colors[Math.floor(Math.random() * colors.length)]

        newObject = {
          x,
          y,
          z: (Math.random() - 0.5) * 1000,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          vz: (Math.random() - 0.5) * 0.3,
          type: objectTypes[Math.floor(Math.random() * objectTypes.length)],
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.02,
          size: 12 + Math.random() * 8,
          color: colorPalette.primary,
          glowIntensity: 0.3 + Math.random() * 0.7,
          pulsePhase: Math.random() * Math.PI * 2,
        }
        attempts++
      } while (
        attempts < 50 &&
        objects.some((obj) => {
          const dx = obj.x - newObject.x
          const dy = obj.y - newObject.y
          const dz = obj.z - newObject.z
          return Math.sqrt(dx * dx + dy * dy + dz * dz) < minDistance
        })
      )

      objects.push(newObject)
    }

    let time = 0

    // Enhanced drawing functions with glow effects
    const drawWithGlow = (
      ctx: CanvasRenderingContext2D,
      drawFunction: () => void,
      color: string,
      glowIntensity: number,
      opacity: number,
    ) => {
      // Create glow effect
      ctx.shadowColor = `rgba(${color}, ${glowIntensity * opacity})`
      ctx.shadowBlur = 15 * glowIntensity
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0

      drawFunction()

      // Reset shadow
      ctx.shadowColor = "transparent"
      ctx.shadowBlur = 0
    }

    const drawChair = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      rotation: number,
      opacity: number,
      color: string,
      glowIntensity: number,
    ) => {
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(rotation)
      ctx.globalAlpha = opacity

      drawWithGlow(
        ctx,
        () => {
          ctx.strokeStyle = `rgba(${color}, ${opacity})`
          ctx.fillStyle = `rgba(${color}, ${opacity * 0.3})`
          ctx.lineWidth = 1.5

          // Chair seat
          ctx.fillRect(-size * 0.4, -size * 0.1, size * 0.8, size * 0.2)
          ctx.strokeRect(-size * 0.4, -size * 0.1, size * 0.8, size * 0.2)

          // Chair back
          ctx.fillRect(-size * 0.35, -size * 0.6, size * 0.7, size * 0.5)
          ctx.strokeRect(-size * 0.35, -size * 0.6, size * 0.7, size * 0.5)

          // Chair legs
          const legPositions = [
            [-size * 0.3, size * 0.1],
            [size * 0.3, size * 0.1],
            [-size * 0.3, -size * 0.1],
            [size * 0.3, -size * 0.1],
          ]
          legPositions.forEach(([legX, legY]) => {
            ctx.fillRect(legX - 1, legY, 2, size * 0.3)
            ctx.strokeRect(legX - 1, legY, 2, size * 0.3)
          })
        },
        color,
        glowIntensity,
        opacity,
      )

      ctx.restore()
    }

    const drawSphere = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      rotation: number,
      opacity: number,
      color: string,
      glowIntensity: number,
    ) => {
      ctx.save()
      ctx.translate(x, y)
      ctx.globalAlpha = opacity

      drawWithGlow(
        ctx,
        () => {
          const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.4)
          gradient.addColorStop(0, `rgba(${color}, ${opacity})`)
          gradient.addColorStop(0.7, `rgba(${color}, ${opacity * 0.6})`)
          gradient.addColorStop(1, `rgba(${color}, ${opacity * 0.2})`)

          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(0, 0, size * 0.4, 0, Math.PI * 2)
          ctx.fill()

          // Add wireframe
          ctx.strokeStyle = `rgba(${color}, ${opacity * 0.8})`
          ctx.lineWidth = 1
          ctx.stroke()
        },
        color,
        glowIntensity,
        opacity,
      )

      ctx.restore()
    }

    const drawCube = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      rotation: number,
      opacity: number,
      color: string,
      glowIntensity: number,
    ) => {
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(rotation)
      ctx.globalAlpha = opacity

      drawWithGlow(
        ctx,
        () => {
          ctx.strokeStyle = `rgba(${color}, ${opacity})`
          ctx.fillStyle = `rgba(${color}, ${opacity * 0.2})`
          ctx.lineWidth = 1.5

          const s = size * 0.3
          // Front face
          ctx.fillRect(-s, -s, s * 2, s * 2)
          ctx.strokeRect(-s, -s, s * 2, s * 2)

          // 3D effect lines
          ctx.beginPath()
          ctx.moveTo(-s, -s)
          ctx.lineTo(-s * 0.7, -s * 1.3)
          ctx.moveTo(s, -s)
          ctx.lineTo(s * 1.3, -s * 1.3)
          ctx.moveTo(s, s)
          ctx.lineTo(s * 1.3, s * 0.7)
          ctx.moveTo(-s, s)
          ctx.lineTo(-s * 0.7, s * 0.7)
          ctx.stroke()

          // Back face outline
          ctx.strokeRect(-s * 0.7, -s * 1.3, s * 2, s * 2)
        },
        color,
        glowIntensity,
        opacity,
      )

      ctx.restore()
    }

    const drawPyramid = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      rotation: number,
      opacity: number,
      color: string,
      glowIntensity: number,
    ) => {
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(rotation)
      ctx.globalAlpha = opacity

      drawWithGlow(
        ctx,
        () => {
          ctx.strokeStyle = `rgba(${color}, ${opacity})`
          ctx.fillStyle = `rgba(${color}, ${opacity * 0.3})`
          ctx.lineWidth = 1.5

          const s = size * 0.4
          // Base
          ctx.beginPath()
          ctx.moveTo(-s, s)
          ctx.lineTo(s, s)
          ctx.lineTo(s, -s)
          ctx.lineTo(-s, -s)
          ctx.closePath()
          ctx.fill()
          ctx.stroke()

          // Pyramid edges to apex
          ctx.beginPath()
          ctx.moveTo(-s, -s)
          ctx.lineTo(0, -s * 1.5)
          ctx.moveTo(s, -s)
          ctx.lineTo(0, -s * 1.5)
          ctx.moveTo(s, s)
          ctx.lineTo(0, -s * 1.5)
          ctx.moveTo(-s, s)
          ctx.lineTo(0, -s * 1.5)
          ctx.stroke()
        },
        color,
        glowIntensity,
        opacity,
      )

      ctx.restore()
    }

    // Keep existing drawing functions but enhance them
    const drawCandy = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      rotation: number,
      opacity: number,
      color: string,
      glowIntensity: number,
    ) => {
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(rotation)
      ctx.globalAlpha = opacity

      drawWithGlow(
        ctx,
        () => {
          const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.3)
          gradient.addColorStop(0, `rgba(${color}, ${opacity})`)
          gradient.addColorStop(1, `rgba(${color}, ${opacity * 0.4})`)
          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2)
          ctx.fill()

          ctx.strokeStyle = `rgba(${color}, ${opacity * 0.8})`
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(0, size * 0.3)
          ctx.lineTo(0, size * 0.6)
          ctx.stroke()
        },
        color,
        glowIntensity,
        opacity,
      )

      ctx.restore()
    }

    const drawIndustrial = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      rotation: number,
      opacity: number,
      color: string,
      glowIntensity: number,
    ) => {
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(rotation)
      ctx.globalAlpha = opacity

      drawWithGlow(
        ctx,
        () => {
          ctx.strokeStyle = `rgba(${color}, ${opacity})`
          ctx.fillStyle = `rgba(${color}, ${opacity * 0.3})`
          ctx.lineWidth = 1.5

          ctx.fillRect(-size * 0.2, -size * 0.4, size * 0.4, size * 0.8)
          ctx.strokeRect(-size * 0.2, -size * 0.4, size * 0.4, size * 0.8)

          ctx.beginPath()
          ctx.ellipse(0, -size * 0.4, size * 0.2, size * 0.1, 0, 0, Math.PI * 2)
          ctx.fill()
          ctx.stroke()

          ctx.beginPath()
          ctx.ellipse(0, size * 0.4, size * 0.2, size * 0.1, 0, 0, Math.PI * 2)
          ctx.fill()
          ctx.stroke()
        },
        color,
        glowIntensity,
        opacity,
      )

      ctx.restore()
    }

    const drawBagel = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      rotation: number,
      opacity: number,
      color: string,
      glowIntensity: number,
    ) => {
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(rotation)
      ctx.globalAlpha = opacity

      drawWithGlow(
        ctx,
        () => {
          ctx.strokeStyle = `rgba(${color}, ${opacity})`
          ctx.fillStyle = `rgba(${color}, ${opacity * 0.4})`
          ctx.lineWidth = 2

          ctx.beginPath()
          ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2)
          ctx.fill()
          ctx.stroke()

          ctx.globalCompositeOperation = "destination-out"
          ctx.beginPath()
          ctx.arc(0, 0, size * 0.15, 0, Math.PI * 2)
          ctx.fill()

          ctx.globalCompositeOperation = "source-over"
          ctx.strokeStyle = `rgba(${color}, ${opacity})`
          ctx.beginPath()
          ctx.arc(0, 0, size * 0.15, 0, Math.PI * 2)
          ctx.stroke()
        },
        color,
        glowIntensity,
        opacity,
      )

      ctx.restore()
    }

    const drawTire = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      rotation: number,
      opacity: number,
      color: string,
      glowIntensity: number,
    ) => {
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(rotation)
      ctx.globalAlpha = opacity

      drawWithGlow(
        ctx,
        () => {
          ctx.strokeStyle = `rgba(${color}, ${opacity})`
          ctx.fillStyle = `rgba(${color}, ${opacity * 0.3})`
          ctx.lineWidth = 2

          ctx.beginPath()
          ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2)
          ctx.fill()
          ctx.stroke()

          ctx.strokeStyle = `rgba(${color}, ${opacity * 0.8})`
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.arc(0, 0, size * 0.2, 0, Math.PI * 2)
          ctx.stroke()

          for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI * 2) / 8
            const x1 = Math.cos(angle) * size * 0.25
            const y1 = Math.sin(angle) * size * 0.25
            const x2 = Math.cos(angle) * size * 0.35
            const y2 = Math.sin(angle) * size * 0.35
            ctx.beginPath()
            ctx.moveTo(x1, y1)
            ctx.lineTo(x2, y2)
            ctx.stroke()
          }
        },
        color,
        glowIntensity,
        opacity,
      )

      ctx.restore()
    }

    const animate = () => {
      time += 0.008

      // Clear canvas with subtle fade effect
      ctx.fillStyle = "rgba(248, 250, 252, 0.02)" // Very subtle light overlay for white background
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Update and draw objects
      objects.forEach((obj, index) => {
        // Update position with smoother movement
        obj.x += obj.vx
        obj.y += obj.vy
        obj.z += obj.vz
        obj.rotation += obj.rotationSpeed

        // Update pulse phase for glow effect
        obj.pulsePhase += 0.02

        // Smooth rotation around center
        const rotX = obj.x * Math.cos(time * 0.1) - obj.z * Math.sin(time * 0.1)
        const rotZ = obj.x * Math.sin(time * 0.1) + obj.z * Math.cos(time * 0.1)

        // Enhanced 3D projection
        const distance = 1200
        const scale = distance / (distance + rotZ)
        const x2d = canvas.width / 2 + rotX * scale * 0.3
        const y2d = canvas.height / 2 + obj.y * scale * 0.3

        // Enhanced opacity and glow calculation
        if (scale > 0.2) {
          const baseOpacity = Math.max(0.1, Math.min(0.4, scale * 0.5))
          const pulseGlow = Math.sin(obj.pulsePhase) * 0.3 + 0.7
          const finalOpacity = baseOpacity * pulseGlow
          const size = obj.size * scale
          const glowIntensity = obj.glowIntensity * pulseGlow

          switch (obj.type) {
            case "chair":
              drawChair(ctx, x2d, y2d, size, obj.rotation, finalOpacity, obj.color, glowIntensity)
              break
            case "candy":
              drawCandy(ctx, x2d, y2d, size, obj.rotation, finalOpacity, obj.color, glowIntensity)
              break
            case "industrial":
              drawIndustrial(ctx, x2d, y2d, size, obj.rotation, finalOpacity, obj.color, glowIntensity)
              break
            case "bagel":
              drawBagel(ctx, x2d, y2d, size, obj.rotation, finalOpacity, obj.color, glowIntensity)
              break
            case "tire":
              drawTire(ctx, x2d, y2d, size, obj.rotation, finalOpacity, obj.color, glowIntensity)
              break
            case "sphere":
              drawSphere(ctx, x2d, y2d, size, obj.rotation, finalOpacity, obj.color, glowIntensity)
              break
            case "cube":
              drawCube(ctx, x2d, y2d, size, obj.rotation, finalOpacity, obj.color, glowIntensity)
              break
            case "pyramid":
              drawPyramid(ctx, x2d, y2d, size, obj.rotation, finalOpacity, obj.color, glowIntensity)
              break
          }
        }

        // Enhanced respawn logic
        if (Math.abs(obj.x) > 1200 || Math.abs(obj.y) > 800 || Math.abs(obj.z) > 500) {
          const side = Math.floor(Math.random() * 4)
          switch (side) {
            case 0: // Left
              obj.x = -1000 + Math.random() * 200
              obj.y = (Math.random() - 0.5) * 600
              break
            case 1: // Right
              obj.x = 800 + Math.random() * 200
              obj.y = (Math.random() - 0.5) * 600
              break
            case 2: // Top
              obj.x = (Math.random() - 0.5) * 800
              obj.y = -600 + Math.random() * 100
              break
            case 3: // Bottom
              obj.x = (Math.random() - 0.5) * 800
              obj.y = 500 + Math.random() * 100
              break
          }
          obj.z = (Math.random() - 0.5) * 300
        }
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  const scrollToContent = () => {
    const targetElement = document.getElementById("anomaly-detection-section")
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  }

  return (
    <div className="relative h-[90vh] overflow-hidden bg-white">
      {/* 3D Background */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 w-full h-full" />

      {/* Enhanced Grid Overlay */}
      <div className="absolute inset-0 z-5 opacity-8">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
        linear-gradient(rgba(59, 130, 246, 0.15) 1px, transparent 1px),
        linear-gradient(90deg, rgba(59, 130, 246, 0.15) 1px, transparent 1px)
      `,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-white/30 z-10" />

      {/* Enhanced animated particles */}
      <div className="absolute inset-0 z-15">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${2 + Math.random() * 3}px`,
              height: `${2 + Math.random() * 3}px`,
              background: `linear-gradient(45deg, 
          rgba(59, 130, 246, 0.6), 
          rgba(139, 92, 246, 0.5), 
          rgba(236, 72, 153, 0.4))`,
              boxShadow: `0 0 ${10 + Math.random() * 10}px rgba(59, 130, 246, 0.3)`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0.4, 0.8, 0.4],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Number.POSITIVE_INFINITY,
              delay: Math.random() * 3,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-20 h-full flex flex-col items-center justify-center text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          {/* Enhanced Futuristic 3D Logo */}
          <div className="inline-block mb-6">
            <motion.div
              animate={{
                rotateY: 360,
                rotateX: [0, 15, 0],
              }}
              transition={{
                rotateY: { duration: 12, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
                rotateX: { duration: 6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
              }}
              className="relative"
            >
              <svg width="140" height="140" viewBox="0 0 140 140" className="drop-shadow-2xl">
                <defs>
                  <linearGradient id="futuristicGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00f5ff" />
                    <stop offset="20%" stopColor="#0080ff" />
                    <stop offset="40%" stopColor="#8000ff" />
                    <stop offset="60%" stopColor="#ff0080" />
                    <stop offset="80%" stopColor="#ff4000" />
                    <stop offset="100%" stopColor="#00f5ff" />
                  </linearGradient>
                  <linearGradient id="glowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00f5ff" stopOpacity="0.9" />
                    <stop offset="50%" stopColor="#8000ff" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#ff0080" stopOpacity="0.3" />
                  </linearGradient>
                  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <filter id="innerGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Outer ring with enhanced glow */}
                <circle
                  cx="70"
                  cy="70"
                  r="60"
                  fill="none"
                  stroke="url(#futuristicGradient)"
                  strokeWidth="3"
                  filter="url(#glow)"
                  opacity="0.8"
                />

                {/* Secondary ring */}
                <circle
                  cx="70"
                  cy="70"
                  r="45"
                  fill="none"
                  stroke="url(#futuristicGradient)"
                  strokeWidth="1"
                  filter="url(#innerGlow)"
                  opacity="0.6"
                />

                {/* Enhanced geometric shape */}
                <g fill="none" stroke="url(#futuristicGradient)" strokeWidth="2.5" filter="url(#glow)">
                  {/* Central hexagon */}
                  <polygon points="70,30 95,45 95,75 70,90 45,75 45,45" fill="url(#glowGradient)" fillOpacity="0.3" />

                  {/* Inner diamond */}
                  <polygon points="70,40 85,60 70,80 55,60" fill="url(#futuristicGradient)" fillOpacity="0.5" />

                  {/* Enhanced connecting lines */}
                  <line x1="70" y1="30" x2="70" y2="40" strokeWidth="3" />
                  <line x1="95" y1="45" x2="85" y2="60" strokeWidth="3" />
                  <line x1="95" y1="75" x2="85" y2="60" strokeWidth="3" />
                  <line x1="70" y1="90" x2="70" y2="80" strokeWidth="3" />
                  <line x1="45" y1="75" x2="55" y2="60" strokeWidth="3" />
                  <line x1="45" y1="45" x2="55" y2="60" strokeWidth="3" />
                </g>

                {/* Enhanced orbiting elements */}
                <g>
                  <motion.circle
                    cx="70"
                    cy="10"
                    r="4"
                    fill="#00f5ff"
                    filter="url(#glow)"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    style={{ transformOrigin: "70px 70px" }}
                  />
                  <motion.circle
                    cx="130"
                    cy="70"
                    r="3"
                    fill="#ff0080"
                    filter="url(#glow)"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 7, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    style={{ transformOrigin: "70px 70px" }}
                  />
                  <motion.circle
                    cx="70"
                    cy="130"
                    r="3.5"
                    fill="#8000ff"
                    filter="url(#glow)"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    style={{ transformOrigin: "70px 70px" }}
                  />
                  <motion.circle
                    cx="10"
                    cy="70"
                    r="2.5"
                    fill="#ff4000"
                    filter="url(#glow)"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    style={{ transformOrigin: "70px 70px" }}
                  />
                </g>

                {/* Enhanced central core */}
                <circle cx="70" cy="70" r="12" fill="url(#futuristicGradient)" filter="url(#glow)" />
                <circle cx="70" cy="70" r="6" fill="#ffffff" opacity="0.95" filter="url(#innerGlow)" />
                <circle cx="70" cy="70" r="3" fill="url(#futuristicGradient)" opacity="0.8" />
              </svg>
            </motion.div>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-indigo-800 bg-clip-text text-transparent mb-6 tracking-tight"
        >
          3D Anomaly Detection
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-xl md:text-2xl text-gray-700 max-w-3xl mb-8 leading-relaxed font-medium"
        >
          Detect structural anomalies in 3D objects using advanced computer vision and machine learning techniques
        </motion.p>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Button
            onClick={scrollToContent}
            size="lg"
            className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:via-blue-500 hover:to-purple-500 text-white border-0 shadow-2xl shadow-blue-500/25 px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-cyan-500/30 pulse-glow"
          >
            <span className="flex items-center gap-2">
              Get Started
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </span>
          </Button>
        </motion.div>

        {/* Enhanced Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
          className="absolute bottom-8"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={scrollToContent}
            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full border border-blue-200 backdrop-blur-sm shadow-lg"
          >
            <ChevronDown className="h-6 w-6" />
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
