"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, Play, AlertTriangle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTheme } from "next-themes"
import { ResultsGrid } from "./components/results-grid"
import { FileUpload } from "./components/file-upload"
import { Toast } from "./components/toast"
import { ClientWrapper } from "./components/client-wrapper"
import { HeroSection } from "./components/hero-section"
import { Navbar } from "./components/navbar"
import { Footer } from "./components/footer"
import { InfoPanel } from "./components/info-panel"
import { DatasetShowcase } from "./components/dataset-showcase"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Types
interface InferenceResults {
  input_rgb: string
  point_cloud_mean: string
  residual_2d: string
  combined_residual: string
}

interface ToastMessage {
  id: string
  type: "success" | "error" | "info"
  message: string
}

const OBJECT_CLASSES = [
  "bagel",
  "cable_gland",
  "carrot",
  "cookie",
  "dowel",
  "foam",
  "peach",
  "potato",
  "rope",
  "tire",
  "CandyCane",
  "ChocolateCookie",
  "ChocolatePraline",
  "Confetto",
  "GummyBear",
  "HazelnutTruffle",
  "LicoriceSandwich",
  "Lollipop",
  "Marshmallow",
  "PeppermintCandy",
  "Chair",
]

function InferenceAppContent() {
  const [rgbFile, setRgbFile] = useState<File | null>(null)
  const [tiffFile, setTiffFile] = useState<File | null>(null)
  const [selectedClass, setSelectedClass] = useState<string>("cable_gland")
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<InferenceResults | null>(null)
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState("upload")
  const [showInfoPanel, setShowInfoPanel] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const addToast = (type: "success" | "error" | "info", message: string) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prev) => [...prev, { id, type, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 5000)
  }

  const handleInference = async () => {
    if (!rgbFile || !tiffFile) {
      addToast("error", "Please upload both RGB and TIFF files")
      return
    }

    if (!rgbFile.type.includes("png")) {
      addToast("error", "RGB file must be a PNG image")
      return
    }

    if (!tiffFile.type.includes("tiff") && !tiffFile.name.toLowerCase().endsWith(".tiff")) {
      addToast("error", "Point cloud file must be a TIFF file")
      return
    }

    setIsLoading(true)
    setResults(null)
    setActiveTab("results")

    // Scroll to results section
    setTimeout(() => {
      const resultsSection = document.getElementById("results-section")
      if (resultsSection) {
        resultsSection.scrollIntoView({
          behavior: "smooth",
          block: "center",
        })
      }
    }, 100)

    try {
      const formData = new FormData()
      formData.append("rgb_file", rgbFile)
      formData.append("tiff_file", tiffFile)
      formData.append("class_name", selectedClass)

      const response = await fetch("http://localhost:5000/api/infer", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`)
      }

      const data: InferenceResults = await response.json()
      setResults(data)
      addToast("success", "Anomaly detection completed successfully!")

      // Scroll to results after completion
      setTimeout(() => {
        const resultsSection = document.getElementById("results-section")
        if (resultsSection) {
          resultsSection.scrollIntoView({
            behavior: "smooth",
            block: "center",
          })
        }
      }, 500)
    } catch (error) {
      console.error("Inference error:", error)
      addToast("error", "Anomaly detection failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Handler for the Try New Input button in ResultsGrid
  const handleTryNewInput = () => {
    setActiveTab("upload")
    setResults(null)
    setRgbFile(null)
    setTiffFile(null)
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 transition-colors duration-300">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <HeroSection />

      {/* Dataset Showcase */}
      <DatasetShowcase />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 bg-white" id="anomaly-detection-section">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent mb-2">
              3D Anomaly Detection
            </h2>
            <p className="text-gray-700 text-lg font-medium">
              Upload your files, select an object class, and detect anomalies in 3D objects
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowInfoPanel(!showInfoPanel)}
            className="flex items-center gap-2 glass border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
          >
            <Info className="h-4 w-4" />
            <span>How it works</span>
          </Button>
        </motion.div>

        {/* Info Panel */}
        <AnimatePresence>{showInfoPanel && <InfoPanel onClose={() => setShowInfoPanel(false)} />}</AnimatePresence>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid grid-cols-2 mb-8 glass bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-blue-200 dark:border-blue-700">
            <TabsTrigger
              value="upload"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            >
              <Upload className="h-4 w-4" />
              Upload & Configure
            </TabsTrigger>
            <TabsTrigger
              value="results"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            >
              <AlertTriangle className="h-4 w-4" />
              Anomaly Results
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* File Upload Section */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card className="h-full overflow-hidden border-0 shadow-xl glass bg-white/80 dark:bg-gray-800/80 backdrop-blur-md">
                  <div className="h-2 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600" />
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-100">
                      <Upload className="h-5 w-5 text-blue-500" />
                      File Upload
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FileUpload
                      label="RGB Image (PNG)"
                      accept=".png"
                      file={rgbFile}
                      onFileChange={setRgbFile}
                      placeholder="Upload RGB image..."
                    />

                    <FileUpload
                      label="Point Cloud (TIFF)"
                      accept=".tiff,.tif"
                      file={tiffFile}
                      onFileChange={setTiffFile}
                      placeholder="Upload point cloud..."
                    />

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        onClick={handleInference}
                        disabled={!rgbFile || !tiffFile || isLoading}
                        className="w-full bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:via-blue-500 hover:to-purple-500 text-white border-0 shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-cyan-500/30"
                        size="lg"
                      >
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Processing...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Play className="h-4 w-4" />
                            Run Anomaly Detection
                          </div>
                        )}
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Class Selection Section */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card className="h-full overflow-hidden border-0 shadow-xl glass bg-white/80 dark:bg-gray-800/80 backdrop-blur-md">
                  <div className="h-2 bg-gradient-to-r from-purple-600 via-pink-600 to-red-500" />
                  <CardHeader>
                    <CardTitle className="text-gray-800 dark:text-gray-100">Object Class Selection</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                          Select Object Class
                        </label>
                        <Select value={selectedClass} onValueChange={setSelectedClass}>
                          <SelectTrigger className="w-full glass bg-white/70 dark:bg-gray-700/70 border-blue-200 dark:border-blue-700">
                            <SelectValue placeholder="Select a class..." />
                          </SelectTrigger>
                          <SelectContent className="glass bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-blue-200 dark:border-blue-700">
                            <div className="max-h-[300px] overflow-y-auto">
                              <div className="p-2 font-semibold text-sm text-gray-500 dark:text-gray-400">
                                MVTec 3D-AD
                              </div>
                              {OBJECT_CLASSES.slice(0, 10).map((className) => (
                                <SelectItem key={className} value={className}>
                                  {className.replace("_", " ")}
                                </SelectItem>
                              ))}
                              <div className="p-2 font-semibold text-sm text-gray-500 dark:text-gray-400">
                                Eyecandies
                              </div>
                              {OBJECT_CLASSES.slice(10, 20).map((className) => (
                                <SelectItem key={className} value={className}>
                                  {className}
                                </SelectItem>
                              ))}
                              <div className="p-2 font-semibold text-sm text-gray-500 dark:text-gray-400">
                                BrokenChair180k
                              </div>
                              {OBJECT_CLASSES.slice(20).map((className) => (
                                <SelectItem key={className} value={className}>
                                  {className}
                                </SelectItem>
                              ))}
                            </div>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="p-4 glass bg-blue-50/70 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                          Selected: {selectedClass.replace("_", " ")}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          This class will be used for the 3D anomaly detection analysis.
                        </p>
                      </div>

                      <div className="mt-6">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Dataset Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" />
                            <span className="text-gray-700 dark:text-gray-300">
                              MVTec 3D-AD: Industrial objects with 3D anomalies
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
                            <span className="text-gray-700 dark:text-gray-300">
                              Eyecandies: Candy and confectionery objects
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-gradient-to-r from-pink-500 to-red-500" />
                            <span className="text-gray-700 dark:text-gray-300">
                              BrokenChair180k: Various chair models with defects
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="results" id="results-section">
            <Card className="overflow-hidden border-0 shadow-xl glass bg-white/80 dark:bg-gray-800/80 backdrop-blur-md">
              <div className="h-2 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-100">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Anomaly Detection Results
                </CardTitle>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Click on any image to view it in full size. Anomalies are highlighted in the residual maps.
                </p>
              </CardHeader>
              <CardContent>
                <ResultsGrid
                  results={results}
                  isLoading={isLoading}
                  onTryNewInput={handleTryNewInput}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Process Explanation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16"
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent mb-4">
              How 3D Anomaly Detection Works
            </h2>
            <p className="text-gray-700 max-w-2xl mx-auto text-lg font-medium">
              Our system uses advanced computer vision and machine learning techniques to detect anomalies in 3D objects
              by analyzing both RGB images and point cloud data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="overflow-hidden border-0 shadow-xl glass bg-white/80 dark:bg-gray-800/80 backdrop-blur-md hover:scale-105 transition-transform duration-300">
              <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-100">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                    1
                  </div>
                  Data Processing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  The system processes both RGB images and point cloud data (TIFF) to extract features and create a
                  comprehensive representation of the 3D object.
                </p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-0 shadow-xl glass bg-white/80 dark:bg-gray-800/80 backdrop-blur-md hover:scale-105 transition-transform duration-300">
              <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-100">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                    2
                  </div>
                  Anomaly Detection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Using deep learning models trained on normal samples, the system identifies deviations from expected
                  patterns in both 2D and 3D space.
                </p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-0 shadow-xl glass bg-white/80 dark:bg-gray-800/80 backdrop-blur-md hover:scale-105 transition-transform duration-300">
              <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-500" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-100">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold">
                    3
                  </div>
                  Result Visualization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Results are visualized as residual maps highlighting anomalous regions, with combined 2D/3D analysis
                  for comprehensive defect detection.
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        <AnimatePresence>
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              type={toast.type}
              message={toast.message}
              onClose={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default function InferenceApp() {
  return (
    <ClientWrapper>
      <InferenceAppContent />
    </ClientWrapper>
  )
}
