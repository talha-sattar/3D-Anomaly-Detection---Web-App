"use client"

import { motion } from "framer-motion"
import { CheckCircle, AlertCircle, X, Info } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ToastProps {
  type: "success" | "error" | "info"
  message: string
  onClose: () => void
}

export function Toast({ type, message, onClose }: ToastProps) {
  const Icon = type === "success" ? CheckCircle : type === "error" ? AlertCircle : Info
  const bgColor =
    type === "success"
      ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
      : type === "error"
        ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
        : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
  const iconColor =
    type === "success"
      ? "text-green-600 dark:text-green-400"
      : type === "error"
        ? "text-red-600 dark:text-red-400"
        : "text-blue-600 dark:text-blue-400"
  const textColor =
    type === "success"
      ? "text-green-800 dark:text-green-200"
      : type === "error"
        ? "text-red-800 dark:text-red-200"
        : "text-blue-800 dark:text-blue-200"

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      className={`flex items-center space-x-3 p-4 rounded-lg border shadow-lg max-w-sm ${bgColor}`}
    >
      <Icon className={`h-5 w-5 flex-shrink-0 ${iconColor}`} />
      <p className={`text-sm font-medium flex-1 ${textColor}`}>{message}</p>
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className={`h-6 w-6 p-0 ${iconColor} hover:bg-black/5 dark:hover:bg-white/5`}
      >
        <X className="h-4 w-4" />
      </Button>
    </motion.div>
  )
}
