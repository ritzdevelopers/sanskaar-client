"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { API_BASE } from "../../dashboard/lib";
import { useScrollReveal } from "../common/useScrollReveal";

const BROCHURE_LEAD_URL = `${API_BASE}/api/users/brachure`;

const FOURQT_WEB_CREATE_URL = "https://eternia04.4erealty.com/WebCreate.aspx";
const FOURQT_UID = "fourqt";
const FOURQT_PWD = "wn9mxO76f34=";

const ENQUIRE_EMAIL_REGEX =
  /^(?!\d)[A-Za-z][A-Za-z0-9._%+-]{0,63}@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,24}$/;

function digitsOnly(value) {
  return String(value).replace(/\D/g, "");
}

function isStrictFullName(value) {
  const t = value.trim();
  return /^(?=.{2,120}$)[A-Za-z]+(?: [A-Za-z]+)*$/.test(t);
}

function isStrictEmail(value) {
  const t = value.trim();
  return ENQUIRE_EMAIL_REGEX.test(t) && !t.includes("..");
}

function hasDigitRepeatedMoreThanFive(value) {
  const digitCounts = [...value].reduce((acc, d) => {
    acc[d] = (acc[d] || 0) + 1;
    return acc;
  }, {});
  return Object.values(digitCounts).some((count) => count > 5);
}

/** Same rules as `EnquireModalProvider` enquiry form. */
function validateBrochureFields(fullName, email, mobileDigits) {
  const errors = {};
  const nameNorm = fullName.trim().replace(/\s+/g, " ");
  if (!isStrictFullName(nameNorm)) {
    errors.name =
      "Enter a valid full name (letters and spaces only, 2-120 characters).";
  }
  const em = email.trim();
  if (!em) {
    errors.email = "Email is required.";
  } else if (!isStrictEmail(em)) {
    errors.email = "Enter a valid email address.";
  }
  if (!mobileDigits) {
    errors.mobile = "Mobile number is required.";
  } else if (hasDigitRepeatedMoreThanFive(mobileDigits)) {
    errors.mobile = "Any single digit cannot repeat more than 5 times.";
  } else if (!/^[6-9]\d{9}$/.test(mobileDigits)) {
    errors.mobile =
      "Enter a valid 10-digit Indian mobile (e.g. 9876543210).";
  }
  return errors;
}

function brochureFieldClass(hasError) {
  return hasError
    ? "border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-500/40"
    : "border-[#111111]/20 focus:border-[#111111] focus:ring-2 ring-[#111111]";
}



function brochureLeadUrlHostPath(href) {
  try {
    const u = new URL(href);
    return `${u.host}${u.pathname}`;
  } catch {
    return "";
  }
}

function normalizeProjectLabel(project) {
  const p = String(project ?? "").trim().toLowerCase();
  if (p.includes("eternia")) return "Eternia Sanskar";
  if (p.includes("high life") || p.includes("high-life") || p.includes("highlife")) {
    return "High Life Sanskar";
  }
  if (p.includes("forest walk") || p.includes("forest-walk") || p.includes("forestwalk")) {
    return "Forest Walk Sanskar";
  }
  return String(project ?? "").trim();
}

/** Same WebCreate.aspx lead pipe as enquiry modal; fire after brochure PDF download. */
async function submitBrochureLeadToFourQt({ name, email, mobile, project }) {
  const href = typeof window !== "undefined" ? window.location.href : "";
  const query =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams();
  const projectLabel = normalizeProjectLabel(project);
  const requestParams = new URLSearchParams({
    UID: FOURQT_UID,
    PWD: FOURQT_PWD,
    Channel: "MS",
    Src: "Website",
    ISD: "91",
    Mob: mobile,
    Email: email,
    name,
    City: "",
    Location: "Projects page",
    Project: projectLabel,
    Remark: `Brochure download — ${projectLabel}`,
    url: brochureLeadUrlHostPath(href),
    UniqueId: "0",
    fld1: query.get("utm_source") ?? "",
    fld2: query.get("utm_campaign") ?? "",
    fld3: query.get("utm_medium") ?? "",
    fld4: query.get("utm_keyword") ?? query.get("utm_term") ?? "",
  });
  const leadRes = await fetch(
    `${FOURQT_WEB_CREATE_URL}?${requestParams.toString()}`,
    {
      method: "GET",
      cache: "no-store",
    },
  );
  if (!leadRes.ok) {
    throw new Error(`4QT lead API failed (${leadRes.status}).`);
  }
}

const PROJECTS = [
  {
    id: "eternia",
    title: "Eternia",
    location: "Tech Zone IV, Greater Noida (W)",
    description:
      "Experience luxury 3 & 4 BHK apartments at Eternia, with world-class amenities. Luxury & convenience at your best!",
    videoEmbedUrl: "https://www.youtube.com/embed/sibHed6fWig?si=O6OJiRHAJknmvd-j",
    image: "/assets/eternia.jpg",
    imageAlt: "Eternia residences",
    url: "https://eternia.greatvaluerealty.com/",
    brochure: "/assets/Eternia-brachoure.pdf",
  },
  {
    id: "highlife",
    title: "HighLife",
    location: "Dream Valley Tech Zone IV, Greater Noida (W)",
    description:
      "Enjoy spacious 1 & 2 BHK studio apartments with modern amenities at HighLife, located near business hubs.",
    videoEmbedUrl: "https://www.youtube.com/embed/sdaU4DYqOOw?si=LxXT_zrtDvSaXN21",
    image: "/assets/highlife.jpg",
    imageAlt: "HighLife residences",
    url: "https://highlife.greatvaluerealty.com/",
    brochure: "/assets/Highlife-brachoure.pdf",
  },
  {
    id: "forest-walk",
    title: "Forest Walk",
    location: "NH-24, Eastern Peripheral Expressway, Ghaziabad",
    description:
      "Enjoy a gated community lifestyle with luxury and nature at Forest Walk. Connects you with serenity and nature both!",
    videoSrc: "/assets/theforestwalk.mp4",
    image: "/assets/projectforestwalk.png",
    imageAlt: "Forest Walk",
    url: "https://theforestwalk.com/",
    brochure: "/assets/FOREST-WALK.pdf",
  },
];

function ProjectRow({
  title,
  location,
  description,
  image,
  imageAlt,
  videoEmbedUrl,
  videoSrc,
  url,
  brochure,
}) {
  const sectionRef = useRef(null);
  useScrollReveal(sectionRef);

  const [brochureModalOpen, setBrochureModalOpen] = useState(false);
  const [brochureName, setBrochureName] = useState("");
  const [brochureEmail, setBrochureEmail] = useState("");
  const [brochureMobile, setBrochureMobile] = useState("");
  const [brochureSubmitting, setBrochureSubmitting] = useState(false);
  const [brochureError, setBrochureError] = useState("");
  const [brochureFieldErrors, setBrochureFieldErrors] = useState({});

  const brochureIdKey = title.replace(/\s+/g, "-");

  const closeBrochureModal = useCallback(() => {
    setBrochureModalOpen(false);
    setBrochureError("");
    setBrochureFieldErrors({});
  }, []);

  useEffect(() => {
    if (!brochureModalOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeBrochureModal();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [brochureModalOpen, closeBrochureModal]);

  const openBrochureModal = () => {
    setBrochureError("");
    setBrochureFieldErrors({});
    setBrochureModalOpen(true);
  };

  async function handleBrochureSubmit(e) {
    e.preventDefault();
    setBrochureError("");
    setBrochureFieldErrors({});
    const name = brochureName.trim().replace(/\s+/g, " ");
    const email = brochureEmail.trim();
    const mobile = digitsOnly(brochureMobile);
    const fieldErrs = validateBrochureFields(name, email, mobile);
    if (Object.keys(fieldErrs).length > 0) {
      setBrochureFieldErrors(fieldErrs);
      return;
    }
    setBrochureSubmitting(true);
    try {
      const res = await fetch(BROCHURE_LEAD_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          mobile,
          project: title,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setBrochureError(
          typeof data.message === "string"
            ? data.message
            : "Something went wrong. Please try again.",
        );
        return;
      }
      const link = document.createElement("a");
      link.href = brochure;
      link.download = brochure.split("/").pop() || "brochure.pdf";
      link.rel = "noopener";
      document.body.appendChild(link);
      link.click();
      link.remove();
      void submitBrochureLeadToFourQt({
        name,
        email,
        mobile,
        project: title,
      }).catch(() => {});
      setBrochureName("");
      setBrochureEmail("");
      setBrochureMobile("");
      setBrochureFieldErrors({});
      setBrochureModalOpen(false);
    } catch {
      setBrochureError("Network error. Please try again.");
    } finally {
      setBrochureSubmitting(false);
    }
  }

  const brochureModal =
    brochureModalOpen && typeof document !== "undefined" ? (
      createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="presentation"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Close brochure form"
            onClick={closeBrochureModal}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="brochure-form-title"
            className="relative z-10 w-full max-w-md rounded-2xl border border-[#111111]/15 bg-white p-6 shadow-xl sm:p-8"
          >
            <h3
              id="brochure-form-title"
              className="font-quattrocento text-xl font-normal uppercase tracking-normal text-[#111111] sm:text-2xl"
            >
              Download brochure
            </h3>
            <p className="font-lato mt-2 text-[14px] leading-[22px] text-[#00000099]">
              {title} — enter your details to get the PDF.
            </p>
            <form onSubmit={handleBrochureSubmit} className="mt-6 space-y-4" noValidate>
              <div>
                <label
                  htmlFor={`brochure-name-${brochureIdKey}`}
                  className="font-lato mb-1 block text-[13px] font-medium text-[#111111]"
                >
                  Name
                </label>
                <input
                  id={`brochure-name-${brochureIdKey}`}
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={brochureName}
                  aria-invalid={Boolean(brochureFieldErrors.name)}
                  aria-describedby={
                    brochureFieldErrors.name
                      ? `brochure-name-err-${brochureIdKey}`
                      : undefined
                  }
                  onChange={(ev) => {
                    const v = ev.target.value
                      .replace(/[^A-Za-z ]/g, "")
                      .replace(/\s{2,}/g, " ");
                    setBrochureName(v);
                    setBrochureFieldErrors((p) => {
                      const { name: _, ...r } = p;
                      return r;
                    });
                  }}
                  className={`font-lato w-full rounded-lg border px-3 py-2.5 text-[15px] text-[#111111] outline-none ring-transparent ${brochureFieldClass(Boolean(brochureFieldErrors.name))}`}
                />
                {brochureFieldErrors.name ? (
                  <p
                    id={`brochure-name-err-${brochureIdKey}`}
                    className="font-lato mt-1 text-[12px] text-red-600"
                  >
                    {brochureFieldErrors.name}
                  </p>
                ) : null}
              </div>
              <div>
                <label
                  htmlFor={`brochure-email-${brochureIdKey}`}
                  className="font-lato mb-1 block text-[13px] font-medium text-[#111111]"
                >
                  Email
                </label>
                <input
                  id={`brochure-email-${brochureIdKey}`}
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={brochureEmail}
                  aria-invalid={Boolean(brochureFieldErrors.email)}
                  aria-describedby={
                    brochureFieldErrors.email
                      ? `brochure-email-err-${brochureIdKey}`
                      : undefined
                  }
                  onChange={(ev) => {
                    setBrochureEmail(ev.target.value);
                    setBrochureFieldErrors((p) => {
                      const { email: _, ...r } = p;
                      return r;
                    });
                  }}
                  className={`font-lato w-full rounded-lg border px-3 py-2.5 text-[15px] text-[#111111] outline-none ring-transparent ${brochureFieldClass(Boolean(brochureFieldErrors.email))}`}
                />
                {brochureFieldErrors.email ? (
                  <p
                    id={`brochure-email-err-${brochureIdKey}`}
                    className="font-lato mt-1 text-[12px] text-red-600"
                  >
                    {brochureFieldErrors.email}
                  </p>
                ) : null}
              </div>
              <div>
                <label
                  htmlFor={`brochure-mobile-${brochureIdKey}`}
                  className="font-lato mb-1 block text-[13px] font-medium text-[#111111]"
                >
                  Mobile
                </label>
                <input
                  id={`brochure-mobile-${brochureIdKey}`}
                  name="mobile"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  value={brochureMobile}
                  aria-invalid={Boolean(brochureFieldErrors.mobile)}
                  aria-describedby={
                    brochureFieldErrors.mobile
                      ? `brochure-mobile-err-${brochureIdKey}`
                      : undefined
                  }
                  onChange={(ev) => {
                    setBrochureMobile(digitsOnly(ev.target.value).slice(0, 10));
                    setBrochureFieldErrors((p) => {
                      const { mobile: _, ...r } = p;
                      return r;
                    });
                  }}
                  className={`font-lato w-full rounded-lg border px-3 py-2.5 text-[15px] text-[#111111] outline-none ring-transparent ${brochureFieldClass(Boolean(brochureFieldErrors.mobile))}`}
                />
                {brochureFieldErrors.mobile ? (
                  <p
                    id={`brochure-mobile-err-${brochureIdKey}`}
                    className="font-lato mt-1 text-[12px] text-red-600"
                  >
                    {brochureFieldErrors.mobile}
                  </p>
                ) : null}
              </div>
              {brochureError ? (
                <p className="font-lato text-[14px] text-red-600" role="alert">
                  {brochureError}
                </p>
              ) : null}
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  disabled={brochureSubmitting}
                  className="font-lato inline-flex min-h-11 items-center justify-center rounded-full border border-[#111111] bg-[#111111] px-6 text-[14px] font-semibold text-white transition-opacity disabled:opacity-60"
                >
                  {brochureSubmitting ? "Please wait…" : "Download"}
                </button>
                <button
                  type="button"
                  onClick={closeBrochureModal}
                  className="font-lato inline-flex min-h-11 items-center justify-center rounded-full border border-[#111111]/30 bg-transparent px-6 text-[14px] font-semibold text-[#111111]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body,
      )
    ) : null;

  return (
    <>
    <section
      ref={sectionRef}
      className="relative w-full min-w-0 bg-white "
    >
      <div className="relative z-10 w-full px-4  pt-10 sm:px-6 sm:pt-12 md:px-8  md:pt-12 lg:px-10  lg:pt-14 xl:px-12 xl:pt-16 2xl:px-16 ">
        <div className="mx-auto w-full max-w-[1480px] xl:max-w-[1520px]">
        <div
          className="mx-auto mb-10 w-full border-t border-[#111111] sm:mb-12"
          aria-hidden
        />
        <div className="mx-auto grid w-full grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-12 xl:gap-14">
          <div className="flex flex-col items-center text-center md:items-start md:text-left lg:col-span-5 xl:col-span-4">
            <h2
              data-scroll-reveal
              className="font-quattrocento w-full max-w-[480px] text-[28px] font-normal uppercase leading-[46px] tracking-normal text-[#111111] md:max-w-none md:text-[36px]"
            >
              {title}
            </h2>
            <p
              data-scroll-reveal
              className="font-quattrocento mt-2 max-w-[400px] text-[18px] font-normal uppercase leading-[25px] tracking-normal text-[#111111] sm:mt-3 lg:leading-normal xl:leading-[25px]"
            >
              {location}
            </p>
            <p
              data-scroll-reveal
              className="font-lato mt-3 max-w-[480px] text-[16px] font-normal leading-[24px] tracking-normal text-[#00000099] md:mt-3"
            >
              {description}
            </p>
            {title === "Eternia" ? (
              <ul className="mt-6 max-w-[520px] list-disc space-y-2 pl-5 text-left marker:text-[#00000099]">
                <li className="font-lato text-[15px] md:text-[16px] leading-[22px] text-[#00000099]">
                Prime area location on a 130m road, opening onto green belt
                </li>
                <li className="font-lato text-[15px] md:text-[16px] leading-[22px] text-[#00000099]">
                6 acre gated community with luxury amenities.
                </li>
                <li className="font-lato text-[15px] md:text-[16px] leading-[22px] text-[#00000099]">
                Vastu compliant construction, 4 lifts per tower.
                </li>
                <li className="font-lato text-[15px] md:text-[16px] leading-[22px] text-[#00000099]">
                Near schools, hospitals, malls, & everyday amenities for convenience.
                </li>
              </ul>
            ) : null}
            {title === "HighLife" ? (
              <ul className="mt-6 max-w-[520px] list-disc space-y-2 pl-5 text-left marker:text-[#00000099]">
                <li className="font-lato text-[15px] md:text-[16px] leading-[22px] text-[#00000099]">
                Earthquake-resistant RCC frame structure for superior safety and stability.
                </li>
                <li className="font-lato text-[15px] md:text-[16px] leading-[22px] text-[#00000099]">
                Well connected through Noida-Greater Noida expressway.
                </li>
                <li className="font-lato text-[15px] md:text-[16px] leading-[22px] text-[#00000099]">
                Great investment potential due to increased connectivity & growth in demand.
                </li>
                <li className="font-lato text-[15px] md:text-[16px] leading-[22px] text-[#00000099]">
                Exclusive integrated commercial spaces.
                </li>
              </ul>
            ) : null}
            {title === "Forest Walk" ? (
              <ul className="mt-6 max-w-[520px] list-disc space-y-2 pl-5 text-left marker:text-[#00000099]">
                <li className="font-lato text-[15px] md:text-[16px] leading-[22px] text-[#00000099]">
                Luxury villas set in a nature-like environment.
                </li>
                <li className="font-lato text-[15px] md:text-[16px] leading-[22px] text-[#00000099]">
                Landscaped walking tracks, water features, and theme forests.
                </li>
                <li className="font-lato text-[15px] md:text-[16px] leading-[22px] text-[#00000099]">
                Good connectivity to NH-24, Delhi, Noida, and proposed metro.
                </li>
                <li className="font-lato text-[15px] md:text-[16px] leading-[22px] text-[#00000099]">
                Quality construction & finishes for comfort and durability over time.
                </li>
              </ul>
            ) : null}
            <button
              type="button"
              onClick={openBrochureModal}
              data-scroll-reveal
              className="group relative mx-auto mt-3 inline-flex h-11 cursor-pointer items-center overflow-hidden rounded-full border border-[#111111] bg-transparent px-5 text-[14px] font-semibold capitalize leading-[100%] tracking-normal sm:mt-6 sm:h-12 sm:pr-3 sm:pl-6 md:mx-0"
            >
              <span
                className="pointer-events-none absolute inset-0 origin-left scale-x-0 bg-[#111111] transition-transform duration-500 ease-out group-hover:scale-x-100"
                aria-hidden
              />
              <span className="relative z-10 inline-flex items-center gap-2.5 text-[#333333] transition-colors duration-300 group-hover:text-white">
                Download Brochure
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-current bg-white transition-[background,border-color] group-hover:border-white group-hover:bg-transparent">
                  <Image
                    src="/assets/diagonal_icon.svg"
                    alt="Arrow icon"
                    title="Arrow icon"
                    width={14}
                    height={14}
                    className="h-3.5 w-3.5 transition-[filter] duration-300 group-hover:brightness-0 group-hover:invert"
                    aria-hidden
                  />
                </span>
              </span>
            </button>
          </div>

          <div
            className="relative w-full overflow-hidden lg:col-span-7 xl:col-span-8"
          >
            <div
              data-scroll-reveal-img
              className="relative aspect-[16/10] w-full overflow-hidden sm:aspect-[5/3]"
            >
              {videoEmbedUrl ? (
                <iframe
                  src={videoEmbedUrl}
                  title={`${title} video`}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  className="h-full w-full border-0 object-cover"
                />
              ) : videoSrc ? (
                <video
                  src={videoSrc}
                  title={`${title} video`}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  className="h-full w-full object-cover"
                />
              ) : (
                <Image
                  src={image}
                  alt={imageAlt}
                  title={imageAlt}
                  fill
                  className="object-cover transition-transform duration-500 hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, (max-width: 1279px) 58vw, 66vw"
                />
              )}
            </div>
          </div>
        </div>
        </div>
      </div>
    </section>
    {brochureModal}
    </>
  );
}
export function ProjectSection() {
  return (
    <>
      {PROJECTS.map((p) => (
        <ProjectRow
          key={p.id}
          title={p.title}
          location={p.location}
          description={p.description}
          image={p.image}
          imageAlt={p.imageAlt}
          videoEmbedUrl={p.videoEmbedUrl}
          videoSrc={p.videoSrc}
          url={p.url}
          brochure={p.brochure}
        />
      ))}
    </>
  );
}
