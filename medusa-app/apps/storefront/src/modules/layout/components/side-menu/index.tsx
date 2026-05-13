"use client"

import { Popover, PopoverPanel, Transition } from "@headlessui/react"
import useToggleState from "@lib/hooks/use-toggle-state"
import { ArrowRightMini, XMark } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Text, clx } from "@modules/common/components/ui"
import { Fragment } from "react"
import CountrySelect from "../country-select"
import LanguageSelect from "../language-select"
import { Locale } from "@lib/data/locales"

const SideMenuItems = {
  "Головна сторінка": "/",
  "Каталог продуктів": "/store",
  "Мій аккаунт": "/account",
  Кошик: "/cart",
}

type SideMenuProps = {
  regions: HttpTypes.StoreRegion[] | null
  locales: Locale[] | null
  currentLocale: string | null
}

const SideMenu = ({ regions, locales, currentLocale }: SideMenuProps) => {
  const countryToggleState = useToggleState()
  const languageToggleState = useToggleState()

  return (
    <div className="h-full flex items-center">
      <Popover className="h-full flex items-center">
        {({ open, close }) => (
          <>
            <div className="relative flex h-full items-center">
              <Popover.Button
                data-testid="nav-menu-button"
                className="relative h-full flex items-center text-sm font-medium text-gray-500 transition-all ease-out duration-200 focus:outline-none hover:text-[#1E293B]"
              >
                Меню
              </Popover.Button>
            </div>

            {open && (
              <div
                className="fixed inset-0 z-[9998] bg-black/40 backdrop-blur-md pointer-events-auto transition-opacity duration-300"
                onClick={close}
                data-testid="side-menu-backdrop"
              />
            )}

            <Transition
              show={open}
              as={Fragment}
              enter="transition ease-out duration-300 transform"
              enterFrom="opacity-0 scale-98"
              enterTo="opacity-100 scale-100"
              leave="transition ease-in duration-200 transform"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-98"
            >
              <PopoverPanel
                static
                className="fixed inset-0 z-[9999] w-full h-[100dvh] bg-white flex flex-col focus:outline-none overflow-y-auto m-0 p-0"
              >
                <div
                  data-testid="nav-menu-popup"
                  className="flex flex-col w-full h-full justify-between p-6 sm:p-12 box-border"
                >
                  <div className="flex justify-between items-center w-full">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#2E7D32] flex items-center justify-center">
                        <span className="text-white font-black text-base">
                          G
                        </span>
                      </div>
                      <span className="font-['Plus_Jakarta_Sans',sans-serif] font-extrabold text-lg text-[#1E293B]">
                        Green Balance
                      </span>
                    </div>

                    <button
                      data-testid="close-menu-button"
                      onClick={close}
                      className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-[#1E293B] hover:bg-gray-100 hover:text-black active:scale-95 transition-all"
                    >
                      <XMark className="w-6 h-6" />
                    </button>
                  </div>

                  <ul className="flex flex-col gap-y-6 sm:gap-y-8 items-start my-auto w-full">
                    {Object.entries(SideMenuItems).map(([name, href]) => {
                      return (
                        <li
                          key={name}
                          className="transform hover:translate-x-3 transition-transform duration-200"
                        >
                          <LocalizedClientLink
                            href={href}
                            className="font-['Plus_Jakarta_Sans',sans-serif] text-5xl sm:text-6xl md:text-7xl tracking-tighter font-black text-[#1E293B] hover:text-[#2E7D32] transition-colors"
                            onClick={close}
                            data-testid={`${name.toLowerCase()}-link`}
                          >
                            {name}
                          </LocalizedClientLink>
                        </li>
                      )
                    })}
                  </ul>

                  <div className="grid grid-cols-1 gap-6 items-center border-t border-gray-100 pt-8 w-full">
                    <Text className="text-sm font-medium text-gray-400 w-full text-center sm:text-left mt-2">
                      © {new Date().getFullYear()} Green Balance. All rights
                      reserved.
                    </Text>
                  </div>
                </div>
              </PopoverPanel>
            </Transition>
          </>
        )}
      </Popover>
    </div>
  )
}

export default SideMenu
