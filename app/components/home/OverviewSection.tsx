"use client";

import Image from "next/image";
import Link from "next/link";
import { Lato, Quattrocento } from "next/font/google";
import { useRef } from "react";
import { useScrollReveal } from "../common/useScrollReveal";

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const quattrocento = Quattrocento({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export function OverviewSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useScrollReveal(sectionRef);

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-w-0 overflow-x-hidden bg-[url('/assets/homepageoverview.png')] bg-contain bg-center bg-no-repeat pt-2 sm:pt-3"
    >
      <div className="pointer-events-none absolute inset-0 hidden xl:block">
        <div className="absolute left-1/2 top-0 h-full w-full max-w-[1500px] -translate-x-1/2 px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
          {/* <div className="flex h-full w-full justify-evenly">
            <span className="h-full w-px shrink-0 bg-[#F1F1F1]" />
            <span className="h-full w-px shrink-0 bg-[#F1F1F1]" />
            <span className="h-full w-px shrink-0 bg-[#F1F1F1]" />
            <span className="h-full w-px shrink-0 bg-[#F1F1F1]" />
            <span className="h-full w-px shrink-0 bg-[#F1F1F1]" />
          </div> */}
        </div>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1500px] px-4 pt-8 pb-10 sm:px-6 sm:pt-10 sm:pb-12 md:px-8 md:pt-12 md:pb-14 lg:px-10 lg:pt-14 lg:pb-14 xl:px-12 2xl:px-16">
        <div className="mx-auto flex w-full max-w-[1280px] flex-col items-center gap-3 text-center sm:gap-4 md:items-start md:gap-4 lg:text-left lg:gap-5 xl:max-w-[1320px]">
        <p
          data-scroll-reveal
          className={`${lato.className} w-full text-sm font-normal leading-7 text-[#111111] uppercase sm:text-[15px] md:text-[16px]`}
        >
          Project Overview
        </p>

        <h2
          data-scroll-reveal
          className={`${quattrocento.className} max-w-[995px] align-middle text-[20px] font-normal leading-[1.2] text-[#111111] uppercase sm:text-[30px] sm:leading-[1.25] md:text-[34px] md:leading-[1.3] lg:text-[36px] lg:leading-[46px] xl:text-[38px]`}
        >
          Where Trust Meets Extraordinary Design

        </h2>

        <div
          data-scroll-reveal
          className={`${lato.className} max-w-[1180px] space-y-3 text-[14px] font-normal leading-[1.6] text-[#3b3b3b] sm:text-[15px] md:text-[16px] md:leading-6`}
        >
          {/* <p>
            Sanskar Realty, a renowned name in the luxurious <span className="text-[#F7A51D] font-bold"> Delhi NCR </span>real estate region, and comes with a pedigree that matters. As a venture of the Yatharth Group, North India’s 3rd largest public-listed healthcare company, we bring our legacy of care, honesty and community impact into every home we make.
          </p> */}
          {/* <p>
            With over 17 years of real estate experience, we have been redefining premium living in <span className="text-[#F7A51D] font-bold"> Noida Extension</span>, <span className="text-[#F7A51D] font-bold">Greater Noida West</span>, <span className="text-[#F7A51D] font-bold"> Ghaziabad</span> since long. Our houses are not built, they are crafted. Each design, material, and amenity has one purpose only: to create a home that betters your life and appreciates in value with passing time.
          </p> */}
          <p>Sanskar Realty, a leading real estate developer in <span className="text-[#F7A51D] font-bold"> Delhi NCR </span>, dedicated to delivering quality and thoughtfully designed homes that fit modern living standards.
With over 17 years of trusted legacy through our other ventures
, we have been crafting <span className="text-[#F7A51D] font-bold"> residential and commercial spaces </span> emphasizing trust, integrity and quality that holds lasting value and comfort.</p>
          <p>
          Our portfolio encompasses <span className="text-[#F7A51D] font-bold"> Noida Extension</span>, <span className="text-[#F7A51D] font-bold"> Greater Noida West </span> and <span className="text-[#F7A51D] font-bold"> Ghaziabad </span> , with projects that offer prime location, world-class amenities and innovative designs. Our premium spacious <i>3 & 4 BHK apartments, studio homes,</i>  and <i>gated villas</i> are designed to enhance your lifestyle through effortless living, socializing, and health.
          </p>
        </div>

        <Link
          data-scroll-reveal
          href="/about-us "
          target="_blank"
          rel="noopener noreferrer"
          className={`${lato.className} group relative inline-flex h-11 w-full max-w-[184px] items-center justify-center gap-[10px] overflow-hidden rounded-[50px] border border-[#111111] px-[12px] py-[11px] text-[13px] font-semibold leading-[100%] capitalize transition-all duration-700 ease-out hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(17,17,17,0.18)] active:translate-y-0 active:shadow-none mx-auto lg:mx-0 sm:h-[46px] sm:text-[14px]`}
        >
          <span
            className="absolute inset-0 -translate-x-full bg-[#111111] transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0"
            aria-hidden
          />
          <span className="relative z-10 flex items-center gap-[10px] text-[#111111] transition-colors duration-700 group-hover:text-white">
            Discover Our Story
            <span className="relative inline-flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#111111] transition-[border-color,box-shadow] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:border-transparent group-hover:shadow-[0_0_0_1px_rgba(255,255,255,0.45)]">
              {/* Black dot grows from center; faint ring keeps it readable on the filled black button */}
              <span
                className="absolute inset-0 scale-0 rounded-full bg-[#111111] transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-100"
                aria-hidden
              />
              {/* Arrow emerges from inside the dot */}
              <Image
                src="/assets/arrow-discovery.svg"
                alt=""
                width={9}
                height={9}
                className="relative z-10 h-[9px] w-[9px] origin-center opacity-100 brightness-0 transition-[filter] duration-[850ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:invert"
                aria-hidden
              />
            </span>
          </span>
        </Link>
        </div>
      </div>
    </section>
  );
}
