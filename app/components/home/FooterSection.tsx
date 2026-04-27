"use client";

import Image from "next/image";
import Link from "next/link";
import { Lato, Quattrocento } from "next/font/google";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import {
  handleMissionVisionNavClick,
  handleOurProfileNavClick,
  MISSION_VISION_HREF,
  OUR_PROFILE_HREF,
  scrollAboutUsToTopIfSamePage,
} from "../common/aboutNavigation";
import {
  AWARDS_CERTIFICATIONS_HREF,
  handleAwardsCertificationsNavClick,
  handleMediaGalleryNavClick,
  MEDIA_GALLERY_HREF,
} from "../common/mediaNavigation";
import { useEnquireModal } from "../common/EnquireModalProvider";
import { useSiteVisitModal } from "../common/SiteVisitModalProvider";
import { useWorkWithUsModal } from "../common/WorkWithUsModalProvider";
import { useScrollReveal } from "../common/useScrollReveal";
import { API_BASE } from "../../dashboard/lib";

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const quattrocento = Quattrocento({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const FOOTER_EMAIL_API_URL = `${API_BASE}/api/users/footer-Email`;
const FOOTER_EMAIL_REGEX =
  /^(?!\d)[A-Za-z][A-Za-z0-9._%+-]{0,63}@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,24}$/;

function isStrictFooterEmail(value: string): boolean {
  const t = value.trim();
  return FOOTER_EMAIL_REGEX.test(t) && !t.includes("..");
}

type FooterSectionProps = {
  alignWithHeader?: boolean;
};

export function FooterSection({ alignWithHeader = false }: FooterSectionProps = {}) {
  const pathname = usePathname() ?? "";
  const { openEnquireModal } = useEnquireModal();
  const { openWorkWithUsModal } = useWorkWithUsModal();
  const { openSiteVisitModal } = useSiteVisitModal();
  const footerRef = useRef<HTMLElement>(null);
  const [email, setEmail] = useState("");
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [apiFeedback, setApiFeedback] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);
  useScrollReveal(footerRef, { stagger: 0.06, duration: 0.65 });

  const submitFooterEmail = async () => {
    const trimmedEmail = email.trim();
    if (isSubmittingEmail) return;

    setApiFeedback(null);
    if (!trimmedEmail) {
      setEmailError("Email is required.");
      return;
    }
    if (!isStrictFooterEmail(trimmedEmail)) {
      setEmailError("Enter a valid email address.");
      return;
    }
    setEmailError(null);

    setIsSubmittingEmail(true);
    try {
      const res = await fetch(FOOTER_EMAIL_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail }),
      });
      const data = (await res.json().catch(() => null)) as { message?: string } | null;
      if (!res.ok) {
        setApiFeedback({
          ok: false,
          text:
            typeof data?.message === "string" ? data.message : "Could not save email.",
        });
        return;
      }
      setEmail("");
      setApiFeedback({
        ok: true,
        text:
          typeof data?.message === "string" ? data.message : "Email saved successfully.",
      });
    } catch {
      setApiFeedback({ ok: false, text: "Could not save email. Please try again." });
    } finally {
      setIsSubmittingEmail(false);
    }
  };

  const topOuter = alignWithHeader
    ? "relative z-10 w-full px-4 py-12 sm:px-6 sm:py-16 md:px-8 md:py-16 lg:px-10 lg:py-20 xl:px-12 2xl:px-16"
    : "relative z-10 mx-auto w-full max-w-[1500px] px-4 py-12 sm:px-6 sm:py-16 md:px-8 md:py-16 lg:px-10 lg:py-20 xl:px-12 2xl:px-16";
  const topInner = alignWithHeader
    ? "mx-auto w-full max-w-[1480px] xl:max-w-[1520px]"
    : "mx-auto w-full max-w-[1280px] xl:max-w-[1320px]";

  const bottomOuter = alignWithHeader
    ? "relative z-10 w-full px-4 pt-0 pb-12 sm:px-6 sm:pb-14 md:px-8 md:pb-16 lg:px-10 xl:px-12 2xl:px-16"
    : "relative z-10 mx-auto w-full max-w-[1500px] px-4 pt-0 pb-12 sm:px-6 sm:pb-14 md:px-8 md:pb-16 lg:px-10 xl:px-12 2xl:px-16";
  const bottomInner = topInner;

  const copyrightOuter = alignWithHeader
    ? "mx-auto w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16"
    : "mx-auto w-full max-w-[1500px] px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16";
  const copyrightInner = topInner;

  return (
    <footer
      ref={footerRef}
      className="relative overflow-hidden"
      style={{
        background: "radial-gradient(150% 150% at 0% 0%, #FEFCF8 0%, #F5F5F5 100%)"
      }}
    >
<div
        className="pointer-events-none absolute left-[-120px] top-[-180px] z-0 h-[878px] w-[878px] rounded-[878px]"
        style={{
          background: "#FFF9E4",
          filter: "blur(400px)",
        }}
      />      
      {/* Top Section — optional shell aligned with contact hero header (1480/1520) */}
      <div className={topOuter}>
        <div className={topInner}>
          <div className="flex flex-col gap-10 sm:gap-12 md:flex-row md:flex-wrap md:items-start md:justify-between md:gap-x-8 md:gap-y-10 lg:flex-nowrap lg:items-center lg:gap-8">
          {/* Left: Text and Contact */}
          <div className="flex flex-col items-center gap-8 text-center sm:gap-10 md:w-[min(100%,calc(50%-1rem))] md:items-center lg:w-1/3 lg:items-start lg:gap-12 lg:text-left">
            <h2
              data-scroll-reveal
              className={`${quattrocento.className} text-[28px] font-normal uppercase leading-[33px] md:leading-[40px] lg:leading-[50px] text-[#1A1A1A] sm:text-[32px] md:text-[36px] lg:text-[40px] xl:text-[36px]`}
            >
              Our Emails Are Crafted With 
              <br />
              Highest Standards!
            </h2>

            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:flex-row lg:justify-start">
                <span data-scroll-reveal-pop className="inline-flex shrink-0">
                  <Image
                    src="/assets/Frame 105725 (1).svg"
                    alt="Phone"
                    title="Phone"
                    width={59}
                    height={59}
                  />
                </span>
                <a
                  data-scroll-reveal
                  href="tel:+917838700316"
                  className={`${lato.className} text-[15px] text-[#555555] hover:text-[#1A1A1A] sm:text-[16px] md:text-[18px]`}
                >
                  +91 783 870 0316
                </a>
              </div>
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:flex-row lg:justify-start">
                <span data-scroll-reveal-pop className="inline-flex shrink-0">
                  <Image
                    src="/assets/Frame 105725 (2).svg"
                    alt="Email"
                    title="Email"
                    width={59}
                    height={59}
                  />
                </span>
                <a
                  data-scroll-reveal
                  href="mailto:info@sanskarrealty.co.in"
                  className={`${lato.className} text-[15px] text-[#555555] hover:text-[#1A1A1A] sm:text-[16px] md:text-[18px] break-all sm:break-normal`}
                >
                  info@sanskarrealty.co.in
                </a>
              </div>
            </div>
          </div>

          {/* Middle: Form */}
          <div className="flex w-full flex-col gap-4 md:w-[min(100%,calc(50%-1rem))] lg:w-[35.5%]">
            <div>
              <input
                data-scroll-reveal
                type="email"
                value={email}
                autoComplete="email"
                aria-invalid={emailError ? "true" : "false"}
                aria-describedby={emailError ? "footer-email-err" : undefined}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError(null);
                  if (apiFeedback) setApiFeedback(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void submitFooterEmail();
                  }
                }}
                placeholder="ENTER YOUR EMAIL"
                className={`${lato.className} w-full border bg-white px-4 py-4 text-[14px] text-[#1A1A1A] outline-none focus:border-[#1A1A1A] ${
                  emailError ? "border-red-500 focus:border-red-600" : "border-[#E5E5E5]"
                }`}
              />
              {emailError ? (
                <p id="footer-email-err" className={`${lato.className} mt-1 text-[12px] text-red-600`}>
                  {emailError}
                </p>
              ) : null}
              {apiFeedback && !emailError ? (
                <p
                  className={`${lato.className} mt-1 text-[12px] ${
                    apiFeedback.ok ? "text-emerald-700" : "text-red-600"
                  }`}
                >
                  {apiFeedback.text}
                </p>
              ) : null}
            </div>
            <button
              data-scroll-reveal
              type="button"
              disabled={isSubmittingEmail}
              onClick={() => {
                void submitFooterEmail();
              }}
              className={`${lato.className} w-full bg-[#111111] py-4 text-[16px] text-white transition-colors hover:bg-[#333333] disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {isSubmittingEmail ? "Submitting…" : "Submit"}
            </button>
          </div>

          {/* Right: Image — full width row on tablet, third column on desktop */}
          <div className="w-full md:basis-full md:order-3 lg:order-none lg:w-[35%] lg:basis-auto">
            <div data-scroll-reveal-img className="relative aspect-[3/4] w-full overflow-hidden">
              <Image
                src="/assets/footer.png"
                alt="Sanskar Realty — luxury interior living space"
                title="Sanskar Realty — luxury interior living space"
                fill
                className="object-cover"
              />
            </div>
          </div>
          </div>
        </div>
      </div>

  
      {/* Bottom Section */}
      <div className={bottomOuter}>
        <div className={`relative ${bottomInner}`}>
        {/* WhatsApp Icon positioned absolutely at bottom left of the section */}
        <a
          data-scroll-reveal-pop
          href="https://wa.me/9101111112222"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden absolute -bottom-[-12px] left-1/2 -translate-x-1/2 lg:-left-2 lg:translate-x-0 transition-transform hover:scale-110"
        >
          <Image
            src="/assets/whatsapp 1.svg"
            alt="WhatsApp"
            title="WhatsApp"
            width={46}
            height={46}
          />
        </a>

        <div className="grid grid-cols-1 justify-items-center gap-10 text-center sm:grid-cols-2 sm:gap-x-8 sm:gap-y-10 lg:flex lg:flex-row lg:flex-wrap lg:justify-between lg:gap-12 lg:text-left">

          {/* Column 1: About */}
          <div className="flex w-full max-w-md flex-col items-center gap-6 text-center sm:col-span-2 lg:col-span-1 lg:w-[23%] lg:max-w-none lg:items-start lg:text-left">
            <h3 data-scroll-reveal className={`${quattrocento.className} text-[28px] font-bold text-[#1A1A1A]`}>
              About Sanskar
            </h3>
            <p
              data-scroll-reveal
              className={`${lato.className} text-[14px] leading-[24px] text-[#666666] max-w-[min(100%,380px)] lg:max-w-[300px]`}
            >
              At Sanskar Realty, we shape homes where trust, innovation, and quality create lasting value through thoughtfully designed spaces built for comfort and growth.
            </p>
            <div className="mt-4 flex flex-col gap-4">
              <h4 data-scroll-reveal className={`${quattrocento.className} text-[18px] uppercase text-[#1A1A1A]`}>
                FOLLOW US ON
              </h4>
              <div className="flex flex-wrap justify-center gap-3 lg:justify-start lg:text-left">
                <Link
                  data-scroll-reveal-pop
                  href="https://www.facebook.com/profile.php?id=61579314733681"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex transition-transform hover:scale-110"
                >
                  <Image src="/assets/Frame 105725.svg" alt="Facebook" title="Facebook" width={35} height={35} />
                </Link>
                <Link
                  data-scroll-reveal-pop
                  href="https://x.com/SanskarRealty"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex transition-transform hover:scale-110"
                >
                  <Image src="/assets/Frame 105726.svg" alt="X" title="X" width={35} height={35} />
                </Link>
                <Link
                  data-scroll-reveal-pop
                  href="https://www.linkedin.com/company/108393396/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex transition-transform hover:scale-110"
                >
                  <Image src="/assets/Frame 105727.svg" alt="LinkedIn" title="LinkedIn" width={35} height={35} />
                </Link>
                <Link
                  data-scroll-reveal-pop
                  href="https://www.instagram.com/sanskar.realty/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex transition-transform hover:scale-110"
                >
                  <Image src="/assets/Frame 105728.svg" alt="Instagram" title="Instagram" width={35} height={35} />
                </Link>
                <Link
                  data-scroll-reveal-pop
                  href="https://www.youtube.com/@SanskarRealty"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex transition-transform hover:scale-110"
                >
                  <Image src="/assets/Frame 105729.svg" alt="YouTube" title="YouTube" width={35} height={35} />
                </Link>
              </div>
            </div>
          </div>

          {/* Column 2: Work With Us */}
          <div className="flex flex-col items-center gap-6 text-center lg:items-start lg:text-left">
            <button
              type="button"
              data-scroll-reveal
              onClick={openWorkWithUsModal}
              className={`${quattrocento.className} cursor-pointer border-0 bg-transparent text-[18px] font-bold uppercase text-[#1A1A1A] hover:underline`}
            >
              WORK WITH US
            </button>
            <button
              type="button"
              data-scroll-reveal
              onClick={() => openEnquireModal()}
              className={`${quattrocento.className} cursor-pointer border-0 bg-transparent text-[18px] font-bold uppercase text-[#1A1A1A] hover:underline`}
            >
              ENQUIRE NOW
            </button>
            <button
              type="button"
              data-scroll-reveal
              onClick={openSiteVisitModal}
              className={`${quattrocento.className} cursor-pointer border-0 bg-transparent text-[18px] font-bold uppercase text-[#1A1A1A] hover:underline`}
            >
              SCHEDULE A SITE VISIT
            </button>
          </div>

          {/* Column 3: Our Profile */}
          <div className="flex flex-col items-center gap-4 text-center lg:items-start lg:text-left">
            <h4
              data-scroll-reveal
              className={`${quattrocento.className} mb-2 text-[18px] font-bold uppercase text-[#1A1A1A]`}
            >
              Company
            </h4>
            <Link
              data-scroll-reveal
              href="/about-us"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => scrollAboutUsToTopIfSamePage()}
              className={`${lato.className} text-[16px] text-[#666666] hover:text-[#1A1A1A]`}
            >
              About Us
            </Link>
            {/* <Link
              data-scroll-reveal
              href="/about-us"
              onClick={() => scrollAboutUsToTopIfSamePage()}
              className={`${lato.className} text-[16px] text-[#666666] hover:text-[#1A1A1A]`}
            >
              Our Story
            </Link> */}
            <Link
              data-scroll-reveal
              href={MISSION_VISION_HREF}
              target="_blank"
              rel="noopener noreferrer"
              scroll={false}
              onClick={(e) => handleMissionVisionNavClick(e, pathname)}
              className={`${lato.className} text-[16px] text-[#666666] hover:text-[#1A1A1A]`}
            >
              Mission & Vision
            </Link>
            <Link
              data-scroll-reveal
              href={OUR_PROFILE_HREF}
              target="_blank"
              rel="noopener noreferrer"
              scroll={false}
              onClick={(e) => handleOurProfileNavClick(e, pathname)}
              className={`${lato.className} text-[16px] text-[#666666] hover:text-[#1A1A1A]`}
            >
              Our Profile
            </Link>
            {/* <Link
              data-scroll-reveal
              href="/about-us"
              onClick={() => scrollAboutUsToTopIfSamePage()}
              className={`${lato.className} text-[16px] text-[#666666] hover:text-[#1A1A1A]`}
            >
              Leadership
            </Link> */}
            <Link
              data-scroll-reveal
              href={AWARDS_CERTIFICATIONS_HREF}
              target="_blank"
              rel="noopener noreferrer"
              scroll={false}
              onClick={(e) => handleAwardsCertificationsNavClick(e, pathname)}
              className={`${lato.className} text-[16px] text-[#666666] hover:text-[#1A1A1A]`}
            >
              Awards & Certifications
            </Link>
            <Link
              data-scroll-reveal
              href="/carrer"
              target="_blank"
              rel="noopener noreferrer"
              className={`${lato.className} text-[16px] text-[#666666] hover:text-[#1A1A1A]`}
            >
              Careers
            </Link>
          </div>

          {/* Column 4: Quick Links */}
          <div className="flex flex-col items-center gap-4 text-center lg:items-start lg:text-left">
            <h4
              data-scroll-reveal
              className={`${quattrocento.className} mb-2 text-[18px] font-bold uppercase text-[#1A1A1A]`}
            >
              QUICK LINKS
            </h4>
            <Link data-scroll-reveal href="/projects" target="_blank" rel="noopener noreferrer" className={`${lato.className} text-[16px] text-[#666666] hover:text-[#1A1A1A]`}>
              Projects
            </Link>
            <Link data-scroll-reveal href="/media" target="_blank" rel="noopener noreferrer" className={`${lato.className} text-[16px] text-[#666666] hover:text-[#1A1A1A]`}>
              Media
            </Link>
            {/* <Link data-scroll-reveal href="/blogs" target="_blank" rel="noopener noreferrer" className={`${lato.className} text-[16px] text-[#666666] hover:text-[#1A1A1A]`}>
              Blogs
            </Link> */}
            <Link
              data-scroll-reveal
              href={MEDIA_GALLERY_HREF}
              target="_blank"
              rel="noopener noreferrer"
              scroll={false}
              onClick={(e) => handleMediaGalleryNavClick(e, pathname)}
              className={`${lato.className} text-[16px] text-[#666666] hover:text-[#1A1A1A]`}
            >
              Gallery
            </Link>
            {/* <Link data-scroll-reveal href="#" className={`${lato.className} text-[16px] text-[#666666] hover:text-[#1A1A1A]`}>
              Our Events
            </Link> */}
            {/* <Link data-scroll-reveal href="#" className="font-lato text-[16px] text-[#666666] hover:text-[#1A1A1A]">
              NRI Corner
            </Link> */}
            <Link data-scroll-reveal href="/contact-us" target="_blank" rel="noopener noreferrer" className={`${lato.className} text-[16px] text-[#666666] hover:text-[#1A1A1A]`}>
              Contact Us
            </Link>
          </div>

          {/* Column 5: NRI Corner */}
          <div className="flex flex-col items-center gap-4 text-center lg:items-start lg:text-left">
            <h4
              data-scroll-reveal
              className={`${quattrocento.className} mb-2 text-[18px] font-bold uppercase text-[#1A1A1A]`}
            >
              NRI CORNER
            </h4>
            <Link data-scroll-reveal href="/nri-corner" target="_blank" rel="noopener noreferrer" className={`${lato.className} text-[14px] text-[#666666] hover:text-[#1A1A1A]`}>
              NRI
            </Link>
          </div>

        </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="relative z-10 border-t border-[#EAEAEA] py-5 sm:py-6">
        <div className={copyrightOuter}>
          <div className={`${copyrightInner} text-center`}>
          <p data-scroll-reveal className={`${lato.className} text-[13px] leading-snug text-[#00000099] sm:text-[14px] md:text-[16px]`}>
            © 2026 Sanskar Realty.  All rights reserved. Digital media planned by Ritz Media World.
          </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
