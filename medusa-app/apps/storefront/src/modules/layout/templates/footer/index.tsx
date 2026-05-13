import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full bg-white border-t border-gray-100 mt-auto shrink-0 py-4 sm:py-6">
      <div className="content-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <LocalizedClientLink
          href="/"
          className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-lg tracking-tight text-[#1E293B] hover:text-[#2E7D32] transition-colors duration-200 flex items-center gap-2 select-none group"
        >
          <div className="w-6 h-6 rounded-md bg-[#2E7D32] shadow-sm shadow-[#2E7D32]/20 flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300">
            <span className="text-white font-black text-sm tracking-tighter">
              G
            </span>
          </div>
          <span>Green Balance</span>
        </LocalizedClientLink>
        <p className="text-xs font-medium text-gray-400 text-center sm:text-right">
          © {currentYear} Green Balance. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
