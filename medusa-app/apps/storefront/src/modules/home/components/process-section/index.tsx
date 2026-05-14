"use client"

import React from "react"
import { motion } from "framer-motion"

const processSteps = [
  {
    number: "01",
    title: "Прецизійне Приготування",
    description:
      "Кожна страва готується за методом Su-vide або на пару при низьких температурах, щоб зберегти 100% корисних мікроелементів та природний смак.",
    tag: "Thermal Stability",
  },
  {
    number: "02",
    title: "Точні Макроси",
    description:
      "Ми проектуємо баланс білків, жирів та вуглеводів з інженерною точністю. Кожен грам інгредієнта проходить ваговий контроль перед пакуванням.",
    tag: "Bio-Logic Control",
  },
  {
    number: "03",
    title: "Система Без Відходів",
    description:
      "Використання екологічного пакування, що повністю підлягає переробці. Ми мінімізуємо відходи, дотримуючись концепції сталого розвитку.",
    tag: "Eco-Efficiency",
  },
]

export default function ProcessSection() {
  return (
    <section className="relative py-24 bg-white overflow-hidden">
      {/* Тонка фонова сітка (Blueprint style) */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#2B7A3E 1px, transparent 1px)`,
          backgroundSize: "30px 30px",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-20 gap-8">
          <div className="max-w-2xl text-left">
            <h2 className="text-sm font-black text-[#2B7A3E] uppercase tracking-[0.3em] mb-4">
              [ Специфікація Виробництва ]
            </h2>
            <h3 className="text-5xl lg:text-7xl font-black text-[#1A2E20] leading-[0.9] tracking-tighter">
              ІНЖЕНЕРІЯ <br />
              <span className="text-gray-300">ТВОЄЇ ЇЖІ</span>
            </h3>
          </div>
          <p className="text-gray-400 max-w-xs text-sm leading-relaxed border-l border-gray-100 pl-6">
            Ми переосмислили процес приготування їжі у Львові та Самборі,
            перетворивши кулінарію на точну науку про здоров'я.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {processSteps.map((step, index) => (
            <ProcessCard key={index} step={step} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

function ProcessCard({ step, index }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.2 }}
      className="group relative"
    >
      {/* Номер етапу */}
      <div className="text-[120px] font-black text-[#FAF9F6] absolute -top-20 -left-4 pointer-events-none transition-colors group-hover:text-[#2B7A3E]/5">
        {step.number}
      </div>

      <div className="relative pt-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-[1px] bg-[#2B7A3E]" />
          <span className="text-[10px] font-bold text-[#2B7A3E] uppercase tracking-widest">
            {step.tag}
          </span>
        </div>

        <h4 className="text-2xl font-black text-[#1A2E20] mb-6 group-hover:text-[#2B7A3E] transition-colors italic">
          {step.title}
        </h4>

        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          {step.description}
        </p>

        {/* Технічна лінія */}
        <div className="w-full h-[1px] bg-gray-50 relative">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: "100%" }}
            className="absolute top-0 left-0 h-full bg-[#2B7A3E]/30"
          />
        </div>
      </div>
    </motion.div>
  )
}
