"use client"

import React from "react"
import { motion } from "framer-motion"
import Thumbnail from "@modules/products/components/thumbnail"

export default function HeroClient({ randomProduct, macros }: any) {
  if (!randomProduct) return null

  const organicShape = {
    borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
  }

  return (
    <div className="flex-1 relative flex items-center justify-center p-4 lg:p-8 z-10 min-h-[600px] lg:min-h-screen">
      <div className="relative w-full max-w-[750px] aspect-square flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={organicShape}
          className="relative w-full h-full shadow-[0_50px_100px_rgba(43,122,62,0.2)] 
                     border-[4px] border-white overflow-hidden group bg-gray-100 flex items-center justify-center"
        >
          <div className="absolute inset-0 w-full h-full transition-transform duration-[6s] ease-out group-hover:scale-110">
            <Thumbnail
              thumbnail={randomProduct.thumbnail}
              images={randomProduct.images}
              size="full"
              className="w-full h-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-tr from-[#1A2E20]/30 via-transparent to-black/10 pointer-events-none" />
          </div>

          <motion.div
            animate={{ top: ["-10%", "110%"], opacity: [0, 1, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 w-full h-32 bg-gradient-to-b from-transparent via-[#4ade80]/20 to-transparent z-20 pointer-events-none"
          />

          <div className="absolute top-1/2 left-4 w-4 h-[1px] bg-white/30 -translate-y-1/2" />
          <div className="absolute top-1/2 right-4 w-4 h-[1px] bg-white/30 -translate-y-1/2" />
          <div className="absolute top-4 left-1/2 w-[1px] h-4 bg-white/30 -translate-x-1/2" />
          <div className="absolute bottom-4 left-1/2 w-[1px] h-4 bg-white/30 -translate-x-1/2" />
        </motion.div>

        {/* Калорії */}
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-4 -right-2 lg:-top-6 lg:right-4 bg-white/95 backdrop-blur-xl p-6 lg:p-8 rounded-[2.5rem] shadow-2xl border border-white z-30 flex flex-col items-center min-w-[120px]"
        >
          <span className="text-3xl lg:text-4xl font-black text-[#1A2E20] leading-none tracking-tighter">
            {macros.calories || 0}
          </span>
          <span className="text-[10px] font-bold text-[#2B7A3E] uppercase mt-1 tracking-[0.2em]">
            Kcal
          </span>
        </motion.div>

        <motion.div
          animate={{ x: [0, 12, 0] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
          className="absolute top-1/3 -left-8 lg:-left-12 bg-[#2B7A3E] p-5 lg:p-7 rounded-[2rem] shadow-2xl text-white z-30 flex flex-col items-center -rotate-6"
        >
          <span className="text-2xl lg:text-3xl font-black leading-none">
            {macros.protein || 0}g
          </span>
          <span className="text-[9px] font-bold uppercase mt-1 tracking-widest opacity-80">
            Proteins
          </span>
        </motion.div>

        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-8 right-12 lg:right-24 bg-[#1A2E20] p-6 lg:p-8 rounded-[3rem] shadow-2xl z-30 flex gap-8 text-white"
        >
          <div className="flex flex-col items-center">
            <span className="text-2xl font-black">{macros.fat || 0}g</span>
            <span className="text-[9px] font-bold text-[#2B7A3E] uppercase tracking-widest">
              Fats
            </span>
          </div>
          <div className="w-[1px] h-10 bg-white/10 my-auto" />
          <div className="flex flex-col items-center">
            <span className="text-2xl font-black">{macros.carbs || 0}g</span>
            <span className="text-[9px] font-bold text-[#2B7A3E] uppercase tracking-widest">
              Carbs
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-24 -left-10 lg:-left-20 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl z-30 max-w-[200px] hidden md:block border border-white/50"
        >
          <p className="text-[10px] font-black text-[#2B7A3E] uppercase tracking-widest mb-1 italic">
            Active Meal
          </p>
          <p className="text-xs font-bold text-[#1A2E20] line-clamp-2 leading-tight">
            {randomProduct?.title}
          </p>
        </motion.div>
      </div>
    </div>
  )
}
