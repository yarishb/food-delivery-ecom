"use client"

import React from "react"
import { motion } from "framer-motion"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function TimeEfficiency() {
  return (
    <section className="py-24 bg-[#FAF9F6] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* ВІЗУАЛЬНА ЧАСТИНА: Логіка Терміналу */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative bg-[#1A2E20] rounded-[2.5rem] p-8 shadow-2xl overflow-hidden group"
          >
            {/* Керування вікном */}
            <div className="flex gap-2 mb-8">
              <div className="w-3 h-3 rounded-full bg-[#2B7A3E]/40" />
              <div className="w-3 h-3 rounded-full bg-[#2B7A3E]/20" />
              <div className="w-3 h-3 rounded-full bg-[#2B7A3E]/10" />
            </div>

            <div className="font-mono text-sm space-y-4">
              <p className="text-[#2B7A3E] font-bold tracking-widest uppercase mb-6">
                // Звіт про оптимізацію
              </p>

              <div className="space-y-2">
                <p className="text-white/60 italic">
                  Виконання завдання: підготовка_їжі...
                </p>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                    className="h-full bg-[#2B7A3E]"
                  />
                </div>
              </div>

              <div className="pt-6 space-y-3">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-white/40">Час на закупівлі</span>
                  <span className="text-[#2B7A3E]">-4.5г / тиждень</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-white/40">Час на готування</span>
                  <span className="text-[#2B7A3E]">-5.5г / тиждень</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2 font-black">
                  <span className="text-white">Всього заощаджено</span>
                  <span className="text-[#4ade80]">+10.0г / тиждень</span>
                </div>
              </div>

              <p className="text-[#2B7A3E] pt-4 animate-pulse">
                Статус системи: Оптимізовано для глибокої роботи
              </p>
            </div>
          </motion.div>

          {/* КОНТЕНТНА ЧАСТИНА */}
          <div className="space-y-12">
            <div>
              <h2 className="text-sm font-black text-[#2B7A3E] uppercase tracking-[0.3em] mb-6">
                [ Режим фокусу: Активовано ]
              </h2>
              <h3 className="text-5xl lg:text-7xl font-black text-[#1A2E20] leading-[0.9] tracking-tighter mb-8 italic">
                ДЕБАЖИМО <br />
                <span className="text-gray-300">ТВІЙ РОЗКЛАД</span>
              </h3>
              <p className="text-lg text-gray-500 leading-relaxed max-w-md border-l-2 border-[#2B7A3E] pl-6">
                Ми розробили систему, яка дозволяє забути про побутову рутину та
                зосередитися на творчості, коді чи важливих проектах.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
              <div className="space-y-3">
                <div className="text-[#2B7A3E] font-black text-2xl tracking-tighter">
                  10 Годин
                </div>
                <p className="text-sm text-gray-400 font-medium uppercase tracking-widest">
                  Заощаджено на тиждень
                </p>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Економія часу на закупівлях та готуванні для жителів Львова та
                  Самбора.
                </p>
              </div>

              <div className="space-y-3">
                <div className="text-[#2B7A3E] font-black text-2xl tracking-tighter">
                  Deep Work
                </div>
                <p className="text-sm text-gray-400 font-medium uppercase tracking-widest">
                  Утримання Фокусу
                </p>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Стабільний рівень енергії для безперервного фокусу протягом
                  усього робочого дня.
                </p>
              </div>
            </div>

            {/* КНОПКА ПЕРЕХОДУ ДО КАТАЛОГУ */}
            <LocalizedClientLink href="/store">
              <button className="px-10 py-5 bg-[#1A2E20] text-white mt-8 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-[#2B7A3E] transition-all shadow-xl shadow-[#1A2E20]/10 active:scale-95">
                Оптимізувати свій час
              </button>
            </LocalizedClientLink>
          </div>
        </div>
      </div>
    </section>
  )
}
