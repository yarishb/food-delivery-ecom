"use client"

import React, { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter, useParams } from "next/navigation"

export default function WeeklyPlanClient({ allProducts }: any) {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-black text-[#1A2E20] mb-4">
            Твій <span className="text-[#2B7A3E]">Plan Balance</span>
          </h2>
          <p className="text-gray-500">
            Доставка раціонів у Львові та Самборі.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <AnimatePresence mode="wait">
            {allProducts.map((product: any) => (
              <PlanCard
                key={product.id}
                product={product}
                price={product.variants?.[0]?.calculated_price}
                metadata={product.variants?.[0]?.metadata || {}}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

function PlanCard({ product, price, metadata }: any) {
  const amount = price?.calculated_amount || "—"
  const router = useRouter()
  const params = useParams()
  const countryCode = params.countryCode as string

  const handleSelectPlan = () => {
    const productHandle = product.handle || product.id
    router.push(`/${countryCode}/products/${productHandle}`)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-8 rounded-[2.5rem] border-2 border-gray-50 bg-[#FAF9F6] hover:border-[#2B7A3E] transition-all flex flex-col h-full"
    >
      <h3 className="text-xl font-black mb-2 text-[#1A2E20]">
        {product.title}
      </h3>

      <div className="flex items-baseline gap-1 mb-6">
        <span className="text-4xl font-black text-[#1A2E20]">{amount}</span>
        <span className="text-gray-400 font-bold uppercase text-xs">грн</span>
      </div>

      <div className="space-y-3 mb-8 flex-grow">
        <div className="text-[10px] font-bold text-[#2B7A3E] bg-[#2B7A3E]/10 inline-block px-3 py-1 rounded-full uppercase tracking-widest">
          {metadata.calories || "0"} ккал / день
        </div>
        <p className="text-sm text-gray-500 leading-relaxed">
          {product.description || "Опис плану харчування Green Balance."}
        </p>
      </div>

      <button
        onClick={handleSelectPlan}
        className="w-full py-4 rounded-2xl bg-white border border-gray-200 text-[#1A2E20] font-bold hover:bg-[#2B7A3E] hover:text-white hover:border-[#2B7A3E] transition-all"
      >
        Обрати план
      </button>
    </motion.div>
  )
}
