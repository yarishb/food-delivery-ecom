"use client"

import React from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function Footer() {
  return (
    <footer className="bg-[#1A2E20] py-20 text-white overflow-hidden relative">
      {/* Декоративний фон (Grid) */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
          <div className="col-span-1 md:col-span-2 space-y-8">
            <h2 className="text-4xl font-black tracking-tighter italic">
              GREEN <span className="text-[#2B7A3E]">BALANCE</span>
            </h2>
            <p className="text-white/40 text-sm max-w-sm leading-relaxed">
              Технологічне харчування для тих, хто будує майбутнє. Доставка у
              Львові та Самборі. Спроектовано для вашої продуктивності.
            </p>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-[#2B7A3E] uppercase tracking-[0.3em]">
              Навігація
            </h4>
            <ul className="space-y-4 text-sm font-bold">
              <li>
                <LocalizedClientLink
                  href="/store"
                  className="hover:text-[#2B7A3E] transition-colors"
                >
                  Меню
                </LocalizedClientLink>
              </li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-[#2B7A3E] uppercase tracking-[0.3em]">
              Контакти
            </h4>
            <ul className="space-y-4 text-sm font-bold">
              <li className="text-white/60 font-medium">Львів — Самбір</li>
              <li>
                <a
                  href="mailto:hello@greenbalance.ua"
                  className="hover:text-[#2B7A3E] transition-colors"
                >
                  hello@greenbalance.ua
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[10px] text-white/20 uppercase tracking-[0.2em]">
            © 2026 Green Balance. Powered by Medusa.js & Next.js
          </p>
        </div>
      </div>
    </footer>
  )
}
