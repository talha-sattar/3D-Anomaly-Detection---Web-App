"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function DatasetShowcase() {
  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Supported 3D Object Datasets</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Our system supports anomaly detection across multiple specialized datasets, each designed for different
            types of 3D objects and defects.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Eyecandies Dataset */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="overflow-hidden border-0 shadow-lg bg-white dark:bg-gray-800 h-full">
              <div className="h-2 bg-gradient-to-r from-green-400 to-blue-500" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <span className="text-green-600 dark:text-green-400 text-sm font-bold">E</span>
                  </div>
                  Eyecandies Dataset
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <Image
                      src="/assets/gummy_bear.gif"
                      alt="Gummy Bear 3D Model"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <Image
                      src="/assets/hazelnut_truffle.gif"
                      alt="Hazelnut Truffle 3D Model"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Candy & Confectionery</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Specialized dataset for detecting defects in candy products including gummy bears, truffles,
                    lollipops, and other confectionery items.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded">
                      Candy Cane
                    </span>
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded">
                      Chocolate Cookie
                    </span>
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded">
                      Chocolate Praline
                    </span>
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded">
                      Confetto
                    </span>
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded">
                      Gummy Bear
                    </span>
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded">
                      Hazelnut Truffle
                    </span>
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded">
                      Licorice Sandwich
                    </span>
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded">
                      Lollipop
                    </span>
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded">
                      Marshmallow
                    </span>
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded">
                      Peppermint Candy
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* BrokenChair180k Dataset */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="overflow-hidden border-0 shadow-lg bg-white dark:bg-gray-800 h-full">
              <div className="h-2 bg-gradient-to-r from-purple-400 to-pink-500" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                    <span className="text-purple-600 dark:text-purple-400 text-sm font-bold">C</span>
                  </div>
                  BrokenChair180k
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-video relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <Image
                    src="/assets/data_preview.gif"
                    alt="Chair Dataset Preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Furniture Defect Detection</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Comprehensive dataset for detecting structural defects in chair models, including broken parts,
                    missing components, and deformations.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs rounded">
                      Furniture
                    </span>
                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs rounded">
                      Chairs
                    </span>
                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs rounded">
                      8000+ Shapes
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* MVTec 3D-AD Dataset */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="overflow-hidden border-0 shadow-lg bg-white dark:bg-gray-800 h-full">
              <div className="h-2 bg-gradient-to-r from-blue-400 to-indigo-500" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-400 text-sm font-bold">M</span>
                  </div>
                  MVTec 3D-AD
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <Image src="/assets/capsule.png" alt="Capsule Sample" fill className="object-cover" />
                  </div>
                  <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <Image src="/assets/transister.png" alt="Transistor Sample" fill className="object-cover" />
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Industrial Objects</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Industry-standard dataset for detecting 3D anomalies in industrial objects including mechanical
                    parts, food items, and manufactured goods.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">
                      bagel
                    </span>
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">
                      cable_gland
                    </span>
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">
                      carrot
                    </span>
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">
                      cookie
                    </span>
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">
                      dowel
                    </span>
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">
                      foam
                    </span>
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">
                      peach
                    </span>
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">
                      potato
                    </span>
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">
                      rope
                    </span>
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">
                      tire
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
