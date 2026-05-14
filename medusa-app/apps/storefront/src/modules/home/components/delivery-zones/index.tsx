"use client"

import React from "react"
import { motion } from "framer-motion"

export default function DeliveryZones() {
  return (
    <section className="py-24 bg-[#FAF9F6] overflow-hidden border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="flex-1 space-y-8">
            <div>
              <h2 className="text-sm font-black text-[#2B7A3E] uppercase tracking-[0.3em] mb-4">
                [ Logistic Protocol ]
              </h2>
              <h3 className="text-5xl lg:text-7xl font-black text-[#1A2E20] leading-[0.9] tracking-tighter italic">
                ГЕОГРАФІЯ <br />
                <span className="text-gray-300">ДОСТАВКИ</span>
              </h3>
            </div>

            <div className="space-y-6">
              {[
                {
                  city: "Львів",
                  area: "Всі райони міста",
                  time: "06:00 — 09:30",
                },
                {
                  city: "Самбір",
                  area: "Центральна частина та околиці",
                  time: "07:00 — 09:00",
                },
              ].map((zone, i) => (
                <div
                  key={i}
                  className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm flex justify-between items-center group hover:border-[#2B7A3E] transition-all"
                >
                  <div>
                    <h4 className="text-xl font-black text-[#1A2E20] mb-1">
                      {zone.city}
                    </h4>
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">
                      {zone.area}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-[#2B7A3E] mb-1 uppercase tracking-tighter">
                      Slot Time
                    </p>
                    <p className="text-sm font-bold text-[#1A2E20]">
                      {zone.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-sm text-gray-400 leading-relaxed border-l-2 border-[#2B7A3E] pl-6 italic">
              Ми проектуємо маршрути так, щоб ваш сніданок був на столі ще до
              того, як ви заварите свою першу каву.
            </p>
          </div>

          {/* Візуалізація карти/радара */}
          <div className="flex-1 relative flex items-center justify-center">
            <div className="w-full aspect-square bg-white rounded-full border border-gray-100 flex items-center justify-center relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-4 border border-dashed border-[#2B7A3E]/20 rounded-full"
              />
              <div className="text-center z-10">
                <div className="text-4xl mb-2">📍</div>
                <div className="font-mono text-[10px] text-[#2B7A3E] uppercase tracking-[0.4em]">
                  Tracking Active
                </div>
              </div>
              {/* Технічні позначки */}
              <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-[#2B7A3E] rounded-full animate-ping" />
              <div
                className="absolute bottom-1/3 left-1/4 w-2 h-2 bg-[#2B7A3E] rounded-full animate-ping"
                style={{ animationDelay: "1s" }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
