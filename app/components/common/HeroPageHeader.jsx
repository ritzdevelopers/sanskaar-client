"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { scrollAboutUsToTopIfSamePage } from "./aboutNavigation";
import { NavOverlay } from "./NavOverlay";

export function HeroPageHeader({
  projectsLinkCurrent = false,
  contactPageStyle = false,
} = {}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const headerShellClass = contactPageStyle
    ? `w-full px-4 transition-all duration-300 ease-out sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 ${
        isScrolled
          ? "pt-[max(8px,env(safe-area-inset-top))] pb-2 sm:pt-2.5 sm:pb-2 md:pt-3 md:pb-2.5 lg:pt-3 lg:pb-2.5 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
          : "pt-[max(14px,env(safe-area-inset-top))] pb-3 sm:pt-4 sm:pb-3.5 md:pt-5 md:pb-4 lg:pt-5 lg:pb-4 bg-transparent"
      }`
    : `w-full px-4 pt-[max(14px,env(safe-area-inset-top))] pb-3 transition-all duration-300 sm:px-6 sm:pt-4 sm:pb-3.5 md:px-8 md:pt-5 md:pb-4 lg:px-10 lg:pt-5 lg:pb-4 xl:px-12 2xl:px-16 ${
        isScrolled
          ? "bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
          : "bg-transparent"
      }`;

  const navClass = contactPageStyle
    ? `mx-auto flex w-full max-w-[1480px] items-center justify-between gap-3 transition-all duration-300 ease-out xl:max-w-[1520px] ${
        isScrolled
          ? "min-h-[40px] sm:min-h-[42px] md:min-h-[44px]"
          : "min-h-[48px] sm:min-h-[52px] md:min-h-[56px]"
      }`
    : "mx-auto flex min-h-[48px] w-full max-w-[1280px] items-center justify-between gap-3 sm:min-h-[52px] md:min-h-[56px] xl:max-w-[1320px]";

  const logoImgClass = contactPageStyle
    ? `w-auto object-contain transition-all duration-300 ease-out ${
        isScrolled
          ? "h-8 max-w-[104px] sm:h-9 sm:max-w-[122px] md:h-9 md:max-w-[132px] lg:h-[42px] lg:max-w-[136px] brightness-0"
          : "h-9 max-w-[120px] sm:h-10 sm:max-w-[140px] md:h-11 md:max-w-[153px] lg:h-[50px]"
      }`
    : `h-9 w-auto max-w-[120px] object-contain transition duration-300 sm:h-10 sm:max-w-[140px] md:h-11 md:max-w-[153px] lg:h-[50px] ${
        isScrolled ? "brightness-0" : ""
      }`;

  const linkClass = `group relative cursor-pointer text-center text-sm font-medium leading-7 transition-colors duration-300 md:text-[15px] lg:text-[16px] ${
    isScrolled ? "text-black" : "text-white"
  }`;

  const projectsHref = "/project";
  const useProjectsCurrent = projectsLinkCurrent;

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50">
        <div className="mx-auto w-full">
          <div className={headerShellClass}>
            <nav className={navClass}>
              {contactPageStyle ? (
                <Link
                  href="/"
                  // target="_blank"
                  // rel="noopener noreferrer"
                  className="flex min-w-0 shrink cursor-pointer items-center py-0.5"
                >
                  <Image
                    src="/assets/Sanskar-New-Logo.png"
                    alt="Sanskar Realty logo"
                    title="Sanskar Realty — Home"
                    width={153}
                    height={50}
                    priority
                    quality={100}
                    className={logoImgClass}
                  /> 
                </Link>
              ) : (
                <Link
                  href="/"
              
                  className="flex min-w-0 shrink cursor-pointer items-center py-0.5"
                >
                  <Image
                    src="/assets/Sanskar-New-Logo.png"
                    alt="Sanskar Realty logo"
                    title="Sanskar Realty — Home"
                    width={153}
                    height={50}
                    priority
                    quality={100}
                    className={logoImgClass}
                  />
                </Link>
              )}
              <div className="flex shrink-0 items-center gap-3 sm:gap-6 md:gap-8 lg:gap-10">
                <div className="hidden md:block">
                  <Link
                    href="/about-us"
                    target="_blank"
                    rel="noopener noreferrer"
                    {...(contactPageStyle
                      ? { onClick: () => scrollAboutUsToTopIfSamePage() }
                      : {})}
                    className={linkClass}
                  >
                    Our Story
                    <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-[#F5AC00] transition-all duration-300 group-hover:w-full" />
                  </Link>
                </div>
                <div className="hidden md:block">
                  <Link
                    href={projectsHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClass}
                    {...(useProjectsCurrent ? { "aria-current": "page" } : {})}
                  >
                    Projects
                    <span
                      className={`absolute -bottom-1 left-0 h-[2px] bg-[#F5AC00] transition-all duration-300 ${
                        useProjectsCurrent
                          ? "w-full"
                          : "w-0 group-hover:w-full"
                      }`}
                    />
                  </Link>
                </div>
                <div>
                  <button
                    type="button"
                    aria-label="Open menu"
                    onClick={() => setMenuOpen(true)}
                    className="flex h-8 w-8 items-center justify-center cursor-pointer"
                  >
                    <Image
                      src="/assets/hamburger_menu.svg"
                      alt="Open navigation menu"
                      title="Open navigation menu"
                      width={52}
                      height={52}
                      className={`transition duration-300 ${
                        isScrolled ? "brightness-0" : ""
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
