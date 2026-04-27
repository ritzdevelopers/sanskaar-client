"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Lato, Quattrocento } from "next/font/google";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const lato = Lato({ subsets: ["latin"], weight: ["400", "700"] });
const quattrocento = Quattrocento({ subsets: ["latin"], weight: ["400", "700"] });

const showcaseSlides = [
    {
        id: 1,
        headline: "Towering at a Trailblazing Pace",
        subtext: "Construction in full swing",
        projectName: "Eternia",
        description: (
            <>
                Located at <strong>Noida Extension</strong>, Eternia by Sanskar Realty offers premium{" "}
                <strong>3BHK and 4BHK apartments</strong>. This project promises a luxurious living
                experience with its{" "}
                <strong>world-class amenities, roomy layouts, and Vastu-compliant design.</strong>
            </>
        ),
        image: "/assets/eternia.webp",
        url: "https://eternia.greatvaluerealty.com/",
        mapUrl: "https://maps.app.goo.gl/2sN8jEspDHpbvyBeA",
        mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14013.836802936377!2d77.41845003955078!3d28.585997900000006!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cef25407d8d75%3A0x7c8b0b102e9204b1!2sEternia%20Residences!5e0!3m2!1sen!2sin!4v1774602648191!5m2!1sen!2sin",
    },
    {
        id: 2,
        headline: "Modern Living, Elevated Daily",
        subtext: "Premium lifestyle spaces",
        projectName: "High Life",
        description: (
            <>
                High Life In <strong>Greater Noida West</strong>, has{" "}
                <strong>1 &amp; 2 BHK studio apartments</strong> within a{" "}
                <strong>mixed-use development</strong>. Located along a <strong>130-meter road</strong> with{" "}
                <strong>100-meter green belt</strong> views, these homes come{" "}
                <strong>furnished with IKEA</strong>.
            </>
        ),
        image: "/assets/highlife.jpg",
        url: "https://highlife.greatvaluerealty.com/",
        mapUrl: "https://maps.app.goo.gl/7SfwKnXB2Apoinz17",
        mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3503.2773864514766!2d77.4496027!3d28.591454199999994!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cee8cfa617849%3A0xf40451d474c9f11f!2sHCRX%2BHV3%2C%20Amrapali%20Dream%20Valley%2C%20Greater%20Noida%2C%20Ithaira%2C%20Uttar%20Pradesh%20201318!5e0!3m2!1sen!2sin!4v1774603471602!5m2!1sen!2sin",
    },
    {
        id: 3,
        headline: "Built for Tomorrow's Urban Life",
        subtext: "Thoughtfully crafted homes",
        projectName: "Forest Walk",
        description: (
            <>
                The Forest Walk in <strong>Ghaziabad</strong> is an exclusive gated villa community that
                blends urban luxury with nature. With under <strong>400 residences</strong>, large{" "}
                <strong>green spaces</strong> and a <strong>forest trail</strong>, it offers easy
                connectivity to Delhi and Noida via <strong>NH-24</strong>.
            </>
        ),
        image: "/assets/forest_walk 2.png",
        url: "https://theforestwalk.com/",
        mapUrl: "https://maps.app.goo.gl/ZMaHTrzAVjxL871R7",
        mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3500.13283160441!2d77.52133707509397!3d28.685672875635618!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cf300103123d9%3A0xa99dd668fb818e5f!2sForest%20Walk%20Villa%20Dasna!5e0!3m2!1sen!2sin!4v1774603531167!5m2!1sen!2sin",
    },
];

/** Index of the slide whose image is fully settled — updates only after each scrubbed transition ends (not mid-wipe). */
function settledSlideIndexFromProgress(progress: number, totalSlides: number): number {
    if (totalSlides <= 1) return 0;
    const numTrans = totalSlides - 1;
    return Math.min(totalSlides - 1, Math.floor(progress * numTrans + 1e-9));
}

export function ProjectShowcaseSliderSection2() {
    const [activeIndex, setActiveIndex] = useState(0);
    /** 1 = advancing slides (scroll down), -1 = going back (scroll up) — drives headline motion */
    const [slideEnterDir, setSlideEnterDir] = useState<1 | -1>(1);
    const prevActiveIndexRef = useRef(0);

    const wrapperRef = useRef<HTMLDivElement>(null);
    const stickyRef = useRef<HTMLDivElement>(null);
    const bgLayersRef = useRef<(HTMLDivElement | null)[]>([]);
    const thumbLayersRef = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        const wrapper = wrapperRef.current;
        const sticky = stickyRef.current;
        if (!wrapper || !sticky) return;

        const totalSlides = showcaseSlides.length;
        const scrollPerSlide = () => sticky.offsetHeight || window.innerHeight;
        prevActiveIndexRef.current = 0;

        bgLayersRef.current.forEach((el, i) => {
            if (!el) return;
            gsap.set(el, { yPercent: i === 0 ? 0 : 100, force3D: true });
        });

        thumbLayersRef.current.forEach((el, i) => {
            if (!el) return;
            gsap.set(el, { yPercent: i === 0 ? 0 : 100, force3D: true });
        });

        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: wrapper,
                    start: "top top",
                    end: () => `+=${scrollPerSlide() * (totalSlides - 1)}`,
                    pin: sticky,
                    pinSpacing: true,
                    scrub: 0.65,
                    anticipatePin: 1,
                    onUpdate(self) {
                        const idx = settledSlideIndexFromProgress(self.progress, totalSlides);
                        if (idx !== prevActiveIndexRef.current) {
                            setSlideEnterDir(idx > prevActiveIndexRef.current ? 1 : -1);
                            prevActiveIndexRef.current = idx;
                        }
                        setActiveIndex(idx);
                    },
                },
            });

            for (let i = 1; i < totalSlides; i++) {
                const step = i - 1;
                const slideEase = { ease: "none" as const, duration: 1, force3D: true };

                tl.fromTo(bgLayersRef.current[i], { yPercent: 100 }, { yPercent: 0, ...slideEase }, step);
                tl.fromTo(thumbLayersRef.current[i], { yPercent: 100 }, { yPercent: 0, ...slideEase }, step);
            }
        });

        const onResize = () => { ScrollTrigger.refresh(); };
        window.addEventListener("resize", onResize, { passive: true });

        const syncTouchAction = () => {
            const el = stickyRef.current;
            if (!el) return;
            if (window.matchMedia("(max-width: 767px)").matches) {
                el.style.setProperty("touch-action", "pan-y pinch-zoom", "important");
            } else {
                el.style.removeProperty("touch-action");
            }
        };
        ScrollTrigger.addEventListener("refresh", syncTouchAction);
        requestAnimationFrame(syncTouchAction);

        return () => {
            ScrollTrigger.removeEventListener("refresh", syncTouchAction);
            window.removeEventListener("resize", onResize);
            ctx.revert();
        };
    }, []);

    const activeSlide = showcaseSlides[activeIndex];
    const activeGoogleMapsHref = activeSlide.mapUrl;

    return (
        <section
            aria-labelledby="project-showcase-heading-2"
            ref={wrapperRef}
            className="bg-white"
            style={{ height: `${showcaseSlides.length * 100}dvh` }}
        >
            <h2 id="project-showcase-heading-2" className="sr-only">Project showcase</h2>

            {/* Sticky viewport pinned by GSAP */}
            <div
                ref={stickyRef}
                className="relative isolate h-[100dvh] min-h-[100dvh] w-full max-w-none overflow-hidden bg-[#f2f2f2] md:mx-auto md:max-w-[1500px]"
            >
                {/* ── STACKED BACKGROUND IMAGES ── */}
                {showcaseSlides.map((slide, index) => (
                    <div
                        key={`bg-${slide.id}`}
                        ref={(el) => { bgLayersRef.current[index] = el; }}
                        className="pointer-events-none absolute inset-0 backface-hidden will-change-transform"
                        style={{ zIndex: index + 1 }}
                    >
                        <Image
                            src={slide.image}
                            alt={slide.projectName}
                            fill
                            className="object-cover object-center [transform:translateZ(0)]"
                            quality={100}
                            priority={index === 0}
                            sizes="100vw"
                            draggable={false}
                        />
                        <div
                            className="pointer-events-none absolute inset-0 max-md:bg-[linear-gradient(to_top,rgba(0,0,0,0.42)_0%,rgba(0,0,0,0.06)_32%,transparent_48%)] md:bg-gradient-to-t md:from-black/70 md:via-black/20 md:to-transparent"
                            aria-hidden
                        />
                    </div>
                ))}

                {/* ── Mobile: map pin icon → Google Maps (right, raised, gray circle + bounce) ── */}
                <a
                    href={activeGoogleMapsHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="map-pin-mobile-bounce pointer-events-auto absolute right-5 top-auto z-[60] flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#D1D5DB] shadow-md md:hidden"
                    style={{
                        bottom: "calc(350px + max(1.25rem, env(safe-area-inset-bottom, 0px)))",
                    }}
                    aria-label={`Open ${activeSlide.projectName} in Google Maps`}
                >
                    <i
                        className="ri-map-pin-line text-[22px] leading-none text-[#111111] not-italic"
                        aria-hidden
                    />
                </a>

                {/* ── MAP WIDGET — md+ bottom-left premium card + iframe ── */}
                <div
                    className="pointer-events-auto absolute z-30 hidden md:block"
                    style={{
                        bottom: "max(1.25rem, env(safe-area-inset-bottom, 0px))",
                        left: "1.25rem",
                    }}
                >
                    {/* Outer premium card frame */}
                    <div className="overflow-hidden rounded-1xl shadow-[0_12px_40px_rgba(0,0,0,0.55)] ring-[1.5px] ring-[#C9A227]/50 w-[255px] lg:w-[275px]">

                        {/* ── Header bar ── */}
                        <div className="flex items-center gap-2 bg-black/75 px-3 py-2 backdrop-blur-md">
                            {/* Gold pin icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                                className="h-3 w-3 shrink-0 text-[#C9A227]" aria-hidden>
                                <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-2.013 3.5-4.751 3.5-8.136a6.79 6.79 0 00-13.58 0c0 3.385 1.555 6.123 3.5 8.136a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                            </svg>
                            <span className={`${lato.className} truncate text-[9px] font-bold uppercase tracking-[0.14em] text-white/90 sm:text-[10px]`}>
                                {activeSlide.projectName}
                            </span>
                            {/* Pulsing live dot */}
                            {/* <span className="relative ml-auto flex h-2 w-2 shrink-0">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#C9A227] opacity-60" />
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#C9A227]" />
                            </span> */}
                        </div>

                        {/* ── Map iframe stack ── */}
                        <div className="relative h-[110px] sm:h-[125px] md:h-[140px] lg:h-[150px]">
                            {showcaseSlides.map((slide, index) => (
                                <iframe
                                    key={`map-${slide.id}`}
                                    src={slide.mapEmbed}
                                    title={`${slide.projectName} location`}
                                    className="absolute inset-0 h-full w-full border-0 transition-opacity duration-500"
                                    style={{
                                        opacity: activeIndex === index ? 1 : 0,
                                        pointerEvents: activeIndex === index ? "auto" : "none",
                                    }}
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                />
                            ))}
                        </div>

                        {/* ── Footer bar — links to active slide's map ── */}
                        <a
                            href={activeGoogleMapsHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${lato.className} flex items-center justify-center bg-black/70 px-3 py-1.5 text-[8px] font-normal uppercase tracking-[0.12em] text-white/50 backdrop-blur-md transition-colors hover:text-white/80 sm:text-[9px]`}
                        >
                            View on Google Maps ↗
                        </a>
                    </div>
                </div>

                {/* ── HEADLINE + SUBTEXT ── */}
                <div className="absolute z-40 text-left max-md:pointer-events-none max-md:bottom-auto max-md:left-1/2 max-md:right-auto max-md:top-[max(5.25rem,env(safe-area-inset-top,0px)+4.25rem)] max-md:w-[min(92vw,22rem)] max-md:max-w-none max-md:-translate-x-1/2 max-md:px-2 max-md:text-center max-md:drop-shadow-[0_2px_14px_rgba(0,0,0,0.82)] sm:max-md:top-[max(5.5rem,env(safe-area-inset-top,0px)+4.5rem)] md:bottom-[40%] md:left-10 md:top-auto md:max-w-[42vw] md:translate-x-0 md:text-left lg:bottom-auto lg:left-12 lg:top-1/2 lg:z-50 lg:max-w-[40vw] lg:-translate-y-1/2 xl:left-14 xl:max-w-[38vw] 2xl:left-20 2xl:max-w-[34vw]">
                    <h3
                        key={`h2-${activeIndex}-${slideEnterDir}`}
                        className={`${quattrocento.className} font-bold leading-[1.15] text-white text-[16px] sm:text-[20px] md:text-[27px] lg:text-[32px] xl:text-[36px] xl:leading-[1.1] 2xl:text-[42px] ${
                            slideEnterDir === -1 ? "animate-fadeSlideDown" : "animate-fadeSlideUp"
                        }`}
                    >
                        {activeSlide.headline}
                    </h3>
                    <p
                        key={`p2-${activeIndex}-${slideEnterDir}`}
                        className={`${lato.className} mt-1 leading-snug text-white/80 text-[11px] sm:text-[13px] md:text-[16px] xl:text-[18px] 2xl:text-[20px] ${
                            slideEnterDir === -1 ? "animate-fadeSlideDown" : "animate-fadeSlideUp"
                        }`}
                        style={{ animationDelay: "80ms" }}
                    >
                        {activeSlide.subtext}
                    </p>
                </div>

                {/* ── FLOATING INFO CARD ── */}
                <div className="absolute z-50 inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom,0px))] w-auto max-w-none sm:inset-x-4 sm:bottom-[max(1.25rem,env(safe-area-inset-bottom,0px))] md:inset-x-auto md:bottom-auto md:left-auto md:right-8 md:top-[calc(50%+1.25rem)] md:w-[min(310px,38vw)] md:-translate-y-1/2 lg:right-10 lg:top-[calc(50%+1.5rem)] lg:w-[min(360px,34vw)] xl:right-[min(80px,6vw)] xl:top-[calc(50%+1.75rem)] xl:w-[min(380px,32vw)] 2xl:right-[min(100px,7vw)] 2xl:top-[calc(50%+2rem)]">
                    <div
                        className="mx-auto flex w-full max-w-[400px] cursor-pointer flex-col rounded-[12px] bg-[#F4F4F4] shadow-2xl min-h-[min(52dvh,480px)] gap-3 px-4 pb-4 pt-2 sm:min-h-[min(50dvh,460px)] sm:max-w-[420px] sm:gap-3.5 sm:pb-5 sm:pt-2.5 md:mx-0 md:min-h-0 md:max-w-none md:gap-3 md:rounded-[14px] md:px-5 md:py-6 lg:gap-4 lg:px-6 lg:py-8 xl:px-8 xl:py-[52px]"
                        onClick={() => {
                            window.open(activeSlide.url, "_blank", "noopener,noreferrer");
                        }}
                    >

                        {/* Counter + title */}
                        <div className="flex shrink-0 flex-col items-center gap-1.5 pt-0.5 md:gap-2 md:pt-0">
                            <p className={`${lato.className} text-center font-normal leading-none text-[#2F2F2F] text-[11px] sm:text-[12px] md:text-[13px] lg:text-[14px] xl:text-[16px]`}>
                                {String(activeIndex + 1).padStart(2, "0")} — {String(showcaseSlides.length).padStart(2, "0")}
                            </p>

                            <div className="group flex items-center gap-1.5">
                                <h4 className={`${quattrocento.className} text-center font-normal uppercase tracking-wider leading-[1.1] text-[#1A1A1A] transition-colors group-hover:text-[#C9A227] text-[15px] sm:text-[16px] md:text-[17px] lg:text-[19px] xl:text-[21px] 2xl:text-[24px]`}>
                                    {activeSlide.projectName}
                                </h4>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    className="shrink-0 text-[#C9A227] transition-transform duration-300 group-hover:scale-125 h-[12px] w-[12px] sm:h-[13px] sm:w-[13px] md:h-[14px] md:w-[14px] lg:h-[15px] lg:w-[15px]"
                                    aria-hidden
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-2.013 3.5-4.751 3.5-8.136a6.79 6.79 0 00-13.58 0c0 3.385 1.555 6.123 3.5 8.136a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                        </div>

                        {/* Thumbnail — opens project site via parent card onClick */}
                        <div className="group relative block h-[132px] w-full shrink-0 overflow-hidden rounded-[6px] sm:h-[148px] md:h-[135px] lg:h-[155px] xl:h-[175px] [contain:paint]">
                            {showcaseSlides.map((slide, index) => (
                                <div
                                    key={`thumb-${slide.id}`}
                                    ref={(el) => { thumbLayersRef.current[index] = el; }}
                                    className="absolute inset-0 backface-hidden will-change-transform"
                                    style={{ zIndex: index + 1 }}
                                >
                                    <Image
                                        src={slide.image}
                                        alt={slide.projectName}
                                        fill
                                        className="object-cover object-center [transform:translateZ(0)] transition-transform duration-500 group-hover:scale-105"
                                        quality={80}
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 310px, 380px"
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Description */}
                        <p className={`${lato.className} flex-1 text-center leading-[1.55] text-[#555555] min-h-0 overflow-y-auto overscroll-y-contain text-[11px] sm:text-[12px] md:flex-none md:overflow-visible md:text-[11px] lg:text-[13px] xl:text-[14px] 2xl:text-[15px]`}>
                            {activeSlide.description}
                        </p>

                        {/* Arrow button → project website */}
                        <a
                            href={activeSlide.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group mx-auto mt-auto flex shrink-0 items-center justify-center rounded-full pt-1 border border-[#8C8C8C] transition-all duration-300 hover:border-[#111] hover:bg-[#111] h-9 w-9 sm:h-9 sm:w-9 md:h-10 md:w-10 lg:h-11 lg:w-11 xl:h-[48px] xl:w-[48px]"
                            aria-label={`View ${activeSlide.projectName} project`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Image
                                src="/assets/diagonal_icon.svg"
                                alt=""
                                width={18}
                                height={18}
                                className="transition-all duration-300 group-hover:invert h-[11px] w-[11px] sm:h-[12px] sm:w-[12px] md:h-[14px] md:w-[14px] xl:h-[18px] xl:w-[18px]"
                            />
                        </a>
                    </div>
                </div>

            </div>

            <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeSlideUp {
          animation: fadeSlideUp 0.5s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeSlideDown {
          animation: fadeSlideDown 0.5s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes mapPinMobileBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .map-pin-mobile-bounce {
          animation: mapPinMobileBounce 1.15s ease-in-out infinite;
        }
      `}</style>
        </section>
    );
}
