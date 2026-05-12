"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { NavOverlay } from "../common/NavOverlay";
import { scrollAboutUsToTopIfSamePage } from "../common/aboutNavigation";

/** Fixed top row only — page content scrolls underneath (z-50). */
export function NriCornerHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50">
        <div className="mx-auto w-full">
          <div
            className={`w-full px-4 transition-all duration-300 ease-out sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 ${
              isScrolled
                ? "pt-[max(8px,env(safe-area-inset-top))] pb-2 sm:pt-2.5 sm:pb-2 md:pt-3 md:pb-2.5 lg:pt-3 lg:pb-2.5 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
                : "pt-[max(14px,env(safe-area-inset-top))] pb-3 sm:pt-4 sm:pb-3.5 md:pt-5 md:pb-4 lg:pt-5 lg:pb-4 bg-black"
            }`}
          >
            <nav
              className={`mx-auto flex w-full max-w-[1280px] items-center justify-between gap-3 transition-all duration-300 ease-out xl:max-w-[1320px] ${
                isScrolled
                  ? "min-h-[40px] sm:min-h-[42px] md:min-h-[44px]"
                  : "min-h-[48px] sm:min-h-[52px] md:min-h-[56px]"
              }`}
            >
              <Link
                href="/"
                
                title="Sanskar Realty — Home"
                className="flex min-w-0 shrink cursor-pointer items-center py-0.5"
              >
                {isScrolled ? (
                  <Image
                    src="/assets/Sanskar-New-Logo.png"
                    alt="Sanskar Realty logo"
                    title="Sanskar Realty — Home"
                    width={153}
                    height={50}
                    priority
                    quality={100}
                    className="h-8 w-auto max-w-[104px] object-contain transition-all duration-300 ease-out sm:h-9 sm:max-w-[122px] md:h-9 md:max-w-[132px] lg:h-[42px] lg:max-w-[136px] brightness-0"
                  />
                ) : (
                  <Image
                    src="/assets/sanskar_logo_white.png"
                    alt="Sanskar Realty logo"
                    title="Sanskar Realty — Home"
                    width={153}
                    height={50}
                    priority
                    quality={100}
                    className="h-9 w-auto max-w-[120px] object-contain transition-all duration-300 ease-out sm:h-10 sm:max-w-[140px] md:h-11 md:max-w-[153px] lg:h-[50px]"
                  />
                )}
              </Link>
              <div className="flex shrink-0 items-center gap-3 sm:gap-6 md:gap-8 lg:gap-10">
                <div className="hidden md:block">
                  <Link
                    href="/about-us"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Our Story — About Sanskar Realty"
                    onClick={() => scrollAboutUsToTopIfSamePage()}
                    className={`group relative text-sm font-medium leading-7 transition-colors duration-300 md:text-[15px] lg:text-[16px] ${
                      isScrolled ? "text-black" : "text-white"
                    }`}
                  >
                    Our Story
                    <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-[#F5AC00] transition-all duration-300 group-hover:w-full" />
                  </Link>
                </div>
                <div className="hidden md:block">
                  <Link
                    href="/projects"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Projects — Sanskar Realty"
                    className={`group relative text-sm font-medium leading-7 transition-colors duration-300 md:text-[15px] lg:text-[16px] ${
                      isScrolled ? "text-black" : "text-white"
                    }`}
                  >
                    Projects
                    <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-[#F5AC00] transition-all duration-300 group-hover:w-full" />
                  </Link>
                </div>
                <div>
                  <button
                    type="button"
                    aria-label="Open menu"
                    onClick={() => setMenuOpen(true)}
                    className="flex h-8 w-8 cursor-pointer items-center justify-center cursor-pointer"
                  >
                    <Image
                      src="/assets/hamburger_menu.svg"
                      alt="Open navigation menu"
                      title="Open navigation menu"
                      width={52}
                      height={52}
                      className={`transition duration-300 ${
                        isScrolled
                          ? "brightness-0"
                          : "brightness-0 invert"
                      }`}
                      aria-hidden
                    />
                  </button>
                </div>
              </div>
            </nav>
          </div>
        </div>
      </header>

      <NavOverlay isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
