"use client"

import React, { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function WeeklyPlanClient({
  initialCategories,
  allProducts,
}: any) {
  // Вибираємо початкову категорію (наприклад, "Balance")
  const [activeCategoryHandle, setActiveCategoryHandle] = useState("balance")

  // Фільтруємо продукти для обраної категорії
  const filteredProducts = useMemo(() => {
    return allProducts
      .filter((product: any) =>
        product.categories?.some(
          (cat: any) => cat.handle === activeCategoryHandle
        )
      )
      .sort(
        (a: any, b: any) => (a.metadata?.order || 0) - (b.metadata?.order || 0)
      )
  }, [activeCategoryHandle, allProducts])

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

        {/* Динамічні таби на основі категорій з Medusa */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex p-2 bg-[#FAF9F6] rounded-[2rem] border border-gray-100">
            {initialCategories.map((cat: any) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryHandle(cat.handle)}
                className={`px-8 py-3 rounded-full text-sm font-bold transition-all ${
                  activeCategoryHandle === cat.handle
                    ? "bg-[#1A2E20] text-white shadow-lg"
                    : "text-gray-400 hover:text-[#1A2E20]"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Список продуктів обраної категорії */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <AnimatePresence mode="wait">
            {filteredProducts.map((product: any) => (
              <PlanCard
                key={product.id}
                product={product}
                // Витягуємо ціну з першого варіанту
                price={product.variants?.[0]?.calculated_price}
                // Дані з метаданих, які ми прописували
                metadata={product.variants?.[0]?.metadata || {}}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
// Оновлений компонент PlanCard всередині WeeklyPlanClient.tsx

function PlanCard({ product, price, metadata }: any) {
  // Витягуємо числове значення з об'єкта ціни
  // В Medusa v2 це зазвичай price.calculated_amount
  const amount = price?.calculated_amount || "—"

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
        {/* ВИПРАВЛЕННЯ: Тепер ми рендеримо число amount, а не весь об'єкт price */}
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

      <button className="w-full py-4 rounded-2xl bg-white border border-gray-200 text-[#1A2E20] font-bold hover:bg-[#2B7A3E] hover:text-white hover:border-[#2B7A3E] transition-all">
        Обрати план
      </button>
    </motion.div>
  )
}
