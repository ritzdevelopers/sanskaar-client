"use client";

import { gsap } from "gsap";
import Image from "next/image";
import { useLayoutEffect, useRef, useState } from "react";

const VENTURE_LINE = "Reality";

type WelcomeGatewayProps = {
  onComplete?: () => void;
};

export function WelcomeGateway({ onComplete }: WelcomeGatewayProps) {
  const [typedText, setTypedText] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const logoRef = useRef<HTMLDivElement | null>(null);
  const lineRef = useRef<HTMLParagraphElement | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useLayoutEffect(() => {
    const overlay = overlayRef.current;
    const logo = logoRef.current;
    const line = lineRef.current;

    if (!overlay || !logo || !line) return;

    gsap.killTweensOf([overlay, logo, line]);

    let typingTimeout: ReturnType<typeof setTimeout> | undefined;
    let hideTimeout: ReturnType<typeof setTimeout> | undefined;
    let charIndex = 0;
    let cancelled = false;

    const typeNextChar = () => {
      if (cancelled) return;
      if (charIndex >= VENTURE_LINE.length) {
        hideTimeout = setTimeout(() => {
          if (cancelled) return;
          gsap.to(overlay, {
            autoAlpha: 0,
            duration: 1.15,
            ease: "power2.out",
            onComplete: () => {
              setIsVisible(false);
              onCompleteRef.current?.();
            },
          });
        }, 750);
        return;
      }

      charIndex += 1;
      setTypedText(VENTURE_LINE.slice(0, charIndex));
      typingTimeout = setTimeout(typeNextChar, 78);
    };

    const ctx = gsap.context(() => {
      gsap.set(overlay, { autoAlpha: 1 });
      gsap.set(logo, { autoAlpha: 0, y: 32, scale: 0.95 });
      gsap.set(line, { autoAlpha: 0, y: 8 });

      const tl = gsap.timeline();

      tl.fromTo(
        logo,
        { autoAlpha: 0, y: 32, scale: 0.95 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 1.2, ease: "power3.out" }
      )
        .to(
          line,
          { autoAlpha: 1, y: 0, duration: 0.55, ease: "power2.out" },
          "+=0.3"
        )
        .call(
          () => {
            typingTimeout = setTimeout(typeNextChar, 220);
          },
          undefined,
          "<0.55"
        );
    }, overlay);

    return () => {
      cancelled = true;
      if (typingTimeout) clearTimeout(typingTimeout);
      if (hideTimeout) clearTimeout(hideTimeout);
      ctx.revert();
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div ref={overlayRef} className="fixed inset-0 z-[120] flex items-center justify-center bg-black px-4 sm:px-6 md:px-8">
      <div className="flex w-full max-w-[min(100%,520px)] flex-col items-center gap-4 text-center sm:max-w-none sm:gap-6 md:gap-8">
        <div ref={logoRef} className="w-full px-2">
          <Image
            src="/assets/sanskar-new.png"
            alt="Sanskar Realty"
            width={520}
            height={158}
            sizes="(max-width: 640px) 260px, (max-width: 768px) 360px, (max-width: 1024px) 440px, (max-width: 1280px) 520px, 540px"
            priority
            fetchPriority="high"
            className="mx-auto h-auto w-full max-w-[260px] sm:max-w-[360px] md:max-w-[440px] lg:max-w-[520px] xl:max-w-[540px]"
          />
        </div>

        <div className="-mt-4 grid w-full max-w-[min(100%,calc(100vw-2rem))] overflow-x-auto [grid-template-areas:'stack'] place-items-stretch sm:w-max sm:max-w-[min(100%,calc(100vw-3rem))] md:-mt-3 md:overflow-visible">
          <div
            className="invisible pointer-events-none flex min-w-0 justify-center [grid-area:stack]"
            aria-hidden
          >
            <p className="whitespace-nowrap text-center font-['Lato'] text-[22px] tracking-[0.12em] sm:text-[24px] sm:tracking-[0.18em] md:text-[28px] lg:text-[32px] xl:text-[36px]">
              {VENTURE_LINE}
            </p>
          </div>
          <div className="flex min-w-0 justify-center [grid-area:stack]">
          <p
  ref={lineRef}
  className="whitespace-nowrap text-center font-['Lato'] text-[22px] tracking-[0.12em] text-white sm:text-[24px] sm:tracking-[25px] md:text-[28px] lg:text-[32px] xl:text-[36px]"
>
  {typedText}
  
  <span className="ml-1 inline-block h-[26px] w-[1px] animate-pulse bg-white align-middle sm:h-[28px] md:h-[32px] lg:h-[36px] xl:h-[40px]" />
</p>
          </div>
        </div>
      </div>
    </div>
  );
}
