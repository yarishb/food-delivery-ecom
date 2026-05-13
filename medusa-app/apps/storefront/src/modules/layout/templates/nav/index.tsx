import { Suspense } from "react"

import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"
import Logo from "@modules/common/components/logo"

export default async function Nav() {
  const [regions, locales, currentLocale] = await Promise.all([
    listRegions().then((regions: StoreRegion[]) => regions),
    listLocales(),
    getLocale(),
  ])

  return (
    <div className="sticky top-0 inset-x-0 z-50 transition-all duration-300">
      <header className="relative h-20 mx-auto border-b bg-white/90 backdrop-blur-md border-gray-100 transition-colors duration-300">
        <nav className="content-container flex items-center justify-between w-full h-full px-4 sm:px-6 lg:px-8">
          <div className="flex-1 basis-0 h-full flex items-center md:hidden">
            <div className="h-full flex items-center">
              <SideMenu
                regions={regions}
                locales={locales}
                currentLocale={currentLocale}
              />
            </div>
          </div>

          <div className="flex items-center h-full">
            <LocalizedClientLink
              href="/"
              className="font-['Plus_Jakarta_Sans',sans-serif] font-extrabold text-xl tracking-tight text-[#1E293B] hover:text-[#2E7D32] transition-colors duration-200 flex items-center gap-2 select-none group"
              data-testid="nav-home-link"
            >
              <Logo />
              <span>Green Balance</span>
            </LocalizedClientLink>
          </div>

          <div className="flex items-center gap-x-4 sm:gap-x-6 h-full flex-1 basis-0 justify-end">
            <div className="hidden md:flex items-center gap-x-2 h-full">
              <LocalizedClientLink
                className="text-sm font-medium text-gray-500 hover:text-[#1E293B] hover:bg-gray-50 px-3 py-2 rounded-xl transition-all duration-200 active:scale-95"
                href="/store"
                data-testid="nav-store-link"
              >
                Каталог
              </LocalizedClientLink>

              <LocalizedClientLink
                className="text-sm font-medium text-gray-500 hover:text-[#1E293B] hover:bg-gray-50 px-3 py-2 rounded-xl transition-all duration-200 active:scale-95"
                href="/account"
                data-testid="nav-account-link"
              >
                Мій акаунт
              </LocalizedClientLink>
            </div>

            <Suspense
              fallback={
                <LocalizedClientLink
                  className="text-sm font-medium text-gray-500 hover:text-[#2E7D32] bg-[#F8FAFC] hover:bg-[#E8F5E9] border border-gray-100 px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-200"
                  href="/cart"
                  data-testid="nav-cart-link"
                >
                  <svg
                    className="w-4 h-4 text-[#1E293B]"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                  <span>Кошик (0)</span>
                </LocalizedClientLink>
              }
            >
              <div className="transform active:scale-95 transition-transform">
                <CartButton />
              </div>
            </Suspense>
          </div>
        </nav>
      </header>
    </div>
  )
}
