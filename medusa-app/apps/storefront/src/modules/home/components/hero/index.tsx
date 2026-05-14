import React from "react"
import { listProducts } from "@lib/data/products"
import HeroClient from "./hero-client"

export default async function Hero() {
  try {
    const { response } = await listProducts({
      countryCode: "ua",
      queryParams: {
        limit: 15,
        fields: "*categories,*variants.calculated_price,+metadata",
      },
    })

    if (!response.products?.length) return null

    const randomProduct =
      response.products[Math.floor(Math.random() * response.products.length)]
    const defaultVariant = randomProduct?.variants?.[0] as any
    const macros = defaultVariant?.metadata || {}

    return (
      <section className="relative w-full min-h-[90vh] flex flex-col lg:flex-row bg-[#FAF9F6] overflow-hidden">
        <div className="flex-1 flex flex-col justify-center z-10 px-6 sm:px-12 lg:px-24 py-16 lg:py-0">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-100 text-[#2B7A3E] text-[10px] font-black uppercase tracking-widest mb-8 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-[#2B7A3E]" />
              Bio-Tech Nutrition
            </div>

            <h1 className="text-5xl lg:text-[80px] font-black text-[#1A2E20] leading-[0.85] mb-8 tracking-tighter">
              GREEN <br />
              <span className="text-[#2B7A3E]">BALANCE</span>
            </h1>

            <p className="text-base lg:text-lg text-gray-500 mb-10 max-w-sm border-l-4 border-[#2B7A3E] pl-6 leading-relaxed">
              Майбутнє твого раціону у Львові та Самборі. Персоналізований
              підхід до кожної калорії.
            </p>

            <div className="flex flex-col gap-3 sm:w-80">
              {["Weight Loss", "Balance", "Muscle Gain"].map((label, i) => (
                <button
                  key={label}
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                    i === 1
                      ? "bg-[#1A2E20] border-[#1A2E20] text-white shadow-xl shadow-[#1A2E20]/20"
                      : "bg-white border-gray-100 text-[#1A2E20]"
                  }`}
                >
                  <span className="font-bold text-sm">{label}</span>
                  <div
                    className={`w-2 h-2 rounded-full ${
                      i === 1 ? "bg-[#2B7A3E]" : "bg-gray-200"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        <HeroClient randomProduct={randomProduct} macros={macros} />
      </section>
    )
  } catch (error) {
    console.error("Hero render error:", error)
    return null
  }
}
