"use client"

import React from "react"
import { motion } from "framer-motion"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function CoffeeRitual() {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          {/* ТЕКСТОВА ЧАСТИНА */}
          <div className="flex-1 space-y-10 order-2 lg:order-1">
            <div>
              <h2 className="text-sm font-black text-[#2B7A3E] uppercase tracking-[0.3em] mb-6">
                [ Brew Mode: Manual ]
              </h2>
              <h3 className="text-5xl lg:text-7xl font-black text-[#1A2E20] leading-[0.9] tracking-tighter mb-8 italic">
                РАНКОВИЙ <br />
                <span className="text-gray-300">РИТУАЛ</span>
              </h3>
              <p className="text-lg text-gray-500 leading-relaxed max-w-md border-l-2 border-[#2B7A3E] pl-6">
                Ми віримо, що день починається не з калорій, а з ритуалу.
                Поєднуйте наші сніданки з ідеально завареною кавою від кращих
                українських ростерів.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="p-6 bg-[#FAF9F6] rounded-3xl border border-gray-50">
                <div className="text-[#2B7A3E] mb-3">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
                    <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
                    <line x1="6" x2="6" y1="2" y2="4" />
                    <line x1="10" x2="10" y1="2" y2="4" />
                    <line x1="14" x2="14" y1="2" y2="4" />
                  </svg>
                </div>
                <h4 className="font-black text-[#1A2E20] mb-2 uppercase text-xs tracking-widest">
                  Manual Brew
                </h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Підтримка методів V60, Chemex та Aeropress для розкриття
                  справжнього терруару зерна.
                </p>
              </div>

              <div className="p-6 bg-[#FAF9F6] rounded-3xl border border-gray-50">
                <div className="text-[#2B7A3E] mb-3">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <h4 className="font-black text-[#1A2E20] mb-2 uppercase text-xs tracking-widest">
                  Local Roasters
                </h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Тільки свіже обсмажування від локальних партнерів у Львові.
                </p>
              </div>
            </div>

            <LocalizedClientLink href="/store?category=breakfasts">
              <button className="px-10 py-5 bg-[#FAF9F6] mt-8 text-[#1A2E20] border border-gray-100 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-[#1A2E20] hover:text-white transition-all active:scale-95">
                Обрати сніданок
              </button>
            </LocalizedClientLink>
          </div>

          {/* ВІЗУАЛЬНА ЧАСТИНА: Абстракція кавового ритуалу */}
          <div className="flex-1 relative order-1 lg:order-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="relative w-full aspect-square bg-[#FAF9F6] rounded-[4rem_2rem_6rem_3rem] overflow-hidden flex items-center justify-center p-12"
            >
              {/* Декоративні кола (як розбризкування кави або хвилі) */}
              <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage: `radial-gradient(#2B7A3E 2px, transparent 2px)`,
                  backgroundSize: "40px 40px",
                }}
              />

              <div className="relative z-10 text-center space-y-6">
                <div className="text-[120px] leading-none select-none">☕</div>
                <div className="space-y-2">
                  <div className="h-1 w-24 bg-[#2B7A3E] mx-auto rounded-full" />
                  <p className="font-mono text-[10px] text-[#2B7A3E] uppercase tracking-[0.4em]">
                    Optimizing Caffeine Intake
                  </p>
                </div>
              </div>

              {/* Технічні мітки */}
              <div className="absolute top-10 right-10 font-mono text-[10px] text-gray-300 rotate-90 origin-right">
                TEMP: 92°C / RATIO: 1:16
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
