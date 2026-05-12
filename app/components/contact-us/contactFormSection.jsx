"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NavOverlay } from "../common/NavOverlay";
import { scrollAboutUsToTopIfSamePage } from "../common/aboutNavigation";
import { API_BASE } from "../../dashboard/lib";

const CONTACT_US_API_URL = `${API_BASE}/api/users/contact-us-page`;

const FOURQT_WEB_CREATE_URL = "https://eternia04.4erealty.com/WebCreate.aspx";
const FOURQT_UID = "fourqt";
const FOURQT_PWD = "wn9mxO76f34=";
const CONTACT_EMAIL_REGEX =
  /^(?!\d)[A-Za-z][A-Za-z0-9._%+-]{0,63}@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,24}$/;

function isStrictEmail(value) {
  const t = String(value ?? "").trim();
  return CONTACT_EMAIL_REGEX.test(t) && !t.includes("..");
}

function isValidContactName(value) {
  const t = String(value ?? "").trim().replace(/\s+/g, " ");
  return t.length >= 2 && t.length <= 120;
}

function hasDigitRepeatedMoreThanFive(value) {
  const digitCounts = [...value].reduce((acc, d) => {
    acc[d] = (acc[d] || 0) + 1;
    return acc;
  }, {});
  return Object.values(digitCounts).some((count) => Number(count) > 5);
}

function normalizeIndianMobileDigits(value) {
  let d = String(value ?? "").replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("91")) d = d.slice(2);
  if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  return d;
}

function isStrictIndianMobile(value) {
  const d = normalizeIndianMobileDigits(value);
  if (!/^[6-9]\d{9}$/.test(d)) return false;
  if (hasDigitRepeatedMoreThanFive(d)) return false;
  return true;
}

function isValidContactMessage(value) {
  const t = String(value ?? "").trim();
  return t.length >= 5 && t.length <= 5000;
}

function fourQtUrlHostPath(href) {
  try {
    const u = new URL(href);
    return `${u.host}${u.pathname}`;
  } catch {
    return "";
  }
}

/** Pretty page title + path for CRM `Location` (e.g. Career — /carrer). */
function crmPageLocationLabel(pathname) {
  const raw = pathname && pathname !== "/" ? pathname.replace(/\/+$/, "") : "/";
  const segments = raw.split("/").filter(Boolean);
  const first = (segments[0] ?? "").toLowerCase();
  const bySlug = {
    "contact-us": "Contact Us",
    carrer: "Career",
    career: "Career",
    projects: "Projects",
    "about-us": "About Us",
    nri: "NRI",
    blog: "Blog",
  };
  const title =
    bySlug[first] ??
    (first
      ? first
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(" ")
      : "Home");
  const pathPart = raw === "/" ? "/" : raw;
  return `${title} — ${pathPart}`;
}

/**
 * Same WebCreate.aspx pipe as enquiry / brochure: GET with UID, PWD, Channel=MS, Src=Website.
 * `Location` / `Remark` include current route; `Project` is left blank for this form.
 */
async function submitContactLeadToFourQt({
  fullName,
  email,
  mobile,
  pathname,
  message,
}) {
  const href = typeof window !== "undefined" ? window.location.href : "";
  const qs =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams();
  const pageLoc = crmPageLocationLabel(pathname || "/");
  const remarkBody =
    message.length > 280 ? `${message.slice(0, 280)}…` : message;
  const requestParams = new URLSearchParams({
    UID: FOURQT_UID,
    PWD: FOURQT_PWD,
    Channel: "MS",
    Src: "Sanskar Website",
    ISD: "91",
    Mob: mobile,
    Email: email,
    name: fullName,
    City: "",
    Location: "Sanskar Website",
    Project: "",
    Remark: `Contact form — ${pageLoc}. ${remarkBody}`,
    url: fourQtUrlHostPath(href),
    UniqueId: String(Date.now()),
    fld1: qs.get("utm_source") ?? "",
    fld2: qs.get("utm_campaign") ?? "",
    fld3: qs.get("utm_medium") ?? "",
    fld4: qs.get("utm_keyword") ?? qs.get("utm_term") ?? "",
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

const OFFICES = [
  {
    name: "Eternia Office",
    address:
      "81, Noida-Greater Noida Link Rd, Amrapali Dream Valley, Greater Noida, Ithaira, Uttar Pradesh 201318",
  },
];

/** Keeps fields visually on #111111 (no white flash on focus / autofill). */
const contactFieldClass =
  "w-full border-0 border-b border-[#DCDCDC] bg-[#111111] py-2.5 font-lato text-[15px] text-white caret-white outline-none transition-colors focus:border-white focus:bg-[#111111] focus:text-white active:bg-[#111111] placeholder:font-lato placeholder:text-[14px] placeholder:font-normal placeholder:leading-[100%] placeholder:tracking-normal placeholder:text-[#494949] [&:-webkit-autofill]:[-webkit-text-fill-color:#fff] [&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_#111111] [&:-webkit-autofill]:[transition:background-color_99999s_ease-out_0s]";

const contactTextareaClass = `${contactFieldClass} min-h-[120px] resize-y`;

export function ContactFormSection() {
  const pathname = usePathname() || "/";
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [formNotice, setFormNotice] = useState(null);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    const name = String(fd.get("name") ?? "")
      .trim()
      .replace(/\s+/g, " ")
      .replace(/\d/g, "");
    const email = String(fd.get("email") ?? "").trim();
    const phone = String(fd.get("phone") ?? "").trim();
    const message = String(fd.get("message") ?? "").trim();
    const mobileDigits = normalizeIndianMobileDigits(phone);

    const nextErrors = { name: "", email: "", phone: "", message: "" };
    if (!isValidContactName(name)) {
      nextErrors.name = "Please enter your name (2–120 characters).";
    }
    if (!email) {
      nextErrors.email = "Email is required.";
    } else if (!isStrictEmail(email)) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (!phone.trim()) {
      nextErrors.phone = "Mobile number is required.";
    } else if (hasDigitRepeatedMoreThanFive(mobileDigits)) {
      nextErrors.phone = "Any single digit cannot repeat more than 5 times.";
    } else if (!isStrictIndianMobile(phone)) {
      nextErrors.phone =
        "Enter a valid 10-digit Indian mobile (e.g. 9876543210).";
    }
    if (!isValidContactMessage(message)) {
      nextErrors.message = "Message must be at least 5 and at most 5000 characters.";
    }

    setFieldErrors(nextErrors);
    setFormNotice(null);
    if (Object.values(nextErrors).some(Boolean)) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(CONTACT_US_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          mobile: mobileDigits,
          message: message.trim(),
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setFormNotice({
          type: "error",
          text:
            data && typeof data.message === "string"
              ? data.message
              : `Could not submit (${res.status}).`,
        });
        return;
      }
      try {
        await submitContactLeadToFourQt({
          fullName: name,
          email,
          mobile: mobileDigits,
          pathname,
          message: message.trim(),
        });
      } catch (err) {
        const detail =
          err instanceof Error ? err.message.trim() : String(err);
        setFormNotice({
          type: "error",
          text:
            detail.length > 0
              ? `Saved, but CRM sync failed: ${detail.length > 200 ? `${detail.slice(0, 200)}…` : detail}`
              : "Saved, but CRM sync failed. Please try again later.",
        });
        return;
      }
      if (form.isConnected) {
        form.reset();
      }
      setFormNotice({
        type: "success",
        text:
          data && typeof data.message === "string"
            ? data.message
            : "Thank you — we received your message.",
      });
    } catch {
      setFormNotice({
        type: "error",
        text: "Could not submit. Please check your connection and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldBorder = (key) =>
    fieldErrors[key] ? "!border-b-red-500 focus:!border-red-400" : "";

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#111111]">
      <header className="fixed inset-x-0 top-0 z-50">
        <div className="mx-auto w-full">
          <div
            className={`w-full px-4 transition-all duration-300 ease-out sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 ${isScrolled
                ? "pt-[max(8px,env(safe-area-inset-top))] pb-2 sm:pt-2.5 sm:pb-2 md:pt-3 md:pb-2.5 lg:pt-3 lg:pb-2.5 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
                : "pt-[max(14px,env(safe-area-inset-top))] pb-3 sm:pt-4 sm:pb-3.5 md:pt-5 md:pb-4 lg:pt-5 lg:pb-4 bg-transparent"
              }`}
          >
            <nav
              className={`mx-auto flex w-full max-w-[1480px] items-center justify-between gap-3 transition-all duration-300 ease-out xl:max-w-[1520px] ${isScrolled
                  ? "min-h-[40px] sm:min-h-[42px] md:min-h-[44px]"
                  : "min-h-[48px] sm:min-h-[52px] md:min-h-[56px]"
                }`}
            >
              <Link
                href="/"
             
                title="Sanskar Realty — Home"
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
                  className={`w-auto object-contain transition-all duration-300 ease-out ${isScrolled
                      ? "h-8 max-w-[104px] sm:h-9 sm:max-w-[122px] md:h-9 md:max-w-[132px] lg:h-[42px] lg:max-w-[136px] brightness-0"
                      : "h-9 max-w-[120px] sm:h-10 sm:max-w-[140px] md:h-11 md:max-w-[153px] lg:h-[50px]"
                    }`}
                />
              </Link>
              <div className="flex shrink-0 items-center gap-3 sm:gap-6 md:gap-8 lg:gap-10">
                <div className="hidden md:block">
                  <Link
                    href="/about-us"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Our Story — About Sanskar Realty"
                    onClick={() => scrollAboutUsToTopIfSamePage()}
                    className={`group relative text-center text-sm font-medium leading-7 transition-colors duration-300 md:text-[15px] lg:text-[16px] cursor-pointer ${isScrolled ? "text-black" : "text-white"
                      }`}
                  >
                    Our Story
                    <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-[#F5AC00] transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                </div>
                <div className="hidden md:block">
                  <Link
                    href="/projects"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Projects — Sanskar Realty"
                    className={`group relative text-center text-sm font-medium leading-7 transition-colors duration-300 md:text-[15px] lg:text-[16px] cursor-pointer ${isScrolled ? "text-black" : "text-white"
                      }`}
                  >
                    Projects
                    <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-[#F5AC00] transition-all duration-300 group-hover:w-full"></span>
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
                      className={`transition duration-300 ${isScrolled ? "brightness-0" : ""
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

      <div className="relative z-10 mx-auto w-full pb-16 pt-[max(7.5rem,calc(4.5rem+env(safe-area-inset-top)))] sm:pb-20 sm:pt-[max(8rem,calc(5rem+env(safe-area-inset-top)))] md:pb-10 lg:pb-6 xl:pb-28 lg:pt-[max(8.5rem,calc(5.25rem+env(safe-area-inset-top)))]">
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
          <div className="mx-auto grid w-full max-w-[1480px] grid-cols-1 gap-y-14 xl:max-w-[1520px] lg:grid-cols-2 lg:gap-x-12 lg:gap-y-0 xl:gap-x-[40px]">
            <div className="flex flex-col lg:pr-4">
              <h1 className="text-center font-quattrocento text-[24px] md:text-[36px] font-normal leading-[100%] tracking-normal text-[#ffffff] md:text-left">
                Contact Us
              </h1>
              <p className="mx-auto mt-6 max-w-[726px] text-center font-lato text-[16px] font-normal leading-[28px] tracking-normal text-[#ffffff] md:mx-0 md:text-left xl:max-w-[550px]">
                For any inquiries, information requests, or partnership opportunities, please feel free to reach out to us. We are committed to providing prompt and thorough assistance, ensuring a smooth and hassle-free experience.
              </p>
              <div className="relative mt-8 w-full overflow-hidden sm:mt-10">
                <Image
                  src="/assets/contact-usimage.jpg"
                  alt="Contact Sanskar Realty — modern residential interior and welcoming atmosphere"
                  title="Contact Sanskar Realty — property inquiries and site visits"
                  width={1200}
                  height={675}
                  className="h-auto w-full object-cover"
                  sizes="(min-width: 1024px) 50vw, 100vw"
                />
              </div>
            </div>

            <div className="mt-0 md:mt-0  flex w-full flex-col lg:mt-0 xl:mt-7 lg:max-w-[500px] lg:justify-self-start lg:pl-4">
              <h2 className="text-center font-quattrocento text-[16px] font-bold leading-[28px] tracking-normal text-[#fff] md:text-left">
               Have Questions? We’re Ready to Assist.
              </h2>
              <form
                className="mt-0 md:mt-8 lg:mt-12 flex w-full flex-col gap-9 sm:mt-5 sm:gap-6 [color-scheme:dark]"
                onSubmit={onSubmit}
                noValidate
              >
                {formNotice ? (
                  <p
                    role={formNotice.type === "error" ? "alert" : "status"}
                    className={`font-lato text-[13px] leading-snug ${
                      formNotice.type === "error" ? "text-red-400" : "text-emerald-400"
                    }`}
                  >
                    {formNotice.text}
                  </p>
                ) : null}
                <div>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Enter Your Name"
                    autoComplete="name"
                    aria-invalid={fieldErrors.name ? "true" : "false"}
                    onChange={(e) => {
                      let v = e.currentTarget.value
                        .replace(/\d/g, "")
                        .replace(/\s{2,}/g, " ");
                      if (v.length > 120) v = v.slice(0, 120);
                      e.currentTarget.value = v;
                      setFormNotice(null);
                      setFieldErrors((p) => ({ ...p, name: "" }));
                    }}
                    className={`${contactFieldClass} ${fieldBorder("name")}`}
                  />
                  {fieldErrors.name ? (
                    <p className="mt-1 font-lato text-[12px] text-red-400">{fieldErrors.name}</p>
                  ) : null}
                </div>
                <div>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="Enter Your Email"
                    autoComplete="email"
                    aria-invalid={fieldErrors.email ? "true" : "false"}
                    onChange={() => {
                      setFormNotice(null);
                      setFieldErrors((p) => ({ ...p, email: "" }));
                    }}
                    className={`${contactFieldClass} ${fieldBorder("email")}`}
                  />
                  {fieldErrors.email ? (
                    <p className="mt-1 font-lato text-[12px] text-red-400">{fieldErrors.email}</p>
                  ) : null}
                </div>
                <div>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="Enter Your Phone Number"
                    autoComplete="tel"
                    aria-invalid={fieldErrors.phone ? "true" : "false"}
                    onChange={(e) => {
                      e.currentTarget.value = normalizeIndianMobileDigits(
                        e.currentTarget.value,
                      ).slice(0, 10);
                      setFormNotice(null);
                      setFieldErrors((p) => ({ ...p, phone: "" }));
                    }}
                    className={`${contactFieldClass} ${fieldBorder("phone")}`}
                  />
                  {fieldErrors.phone ? (
                    <p className="mt-1 font-lato text-[12px] text-red-400">{fieldErrors.phone}</p>
                  ) : null}
                </div>
                <div>
                  <textarea
                    name="message"
                    required
                    placeholder="Message"
                    rows={4}
                    aria-invalid={fieldErrors.message ? "true" : "false"}
                    onChange={() => {
                      setFormNotice(null);
                      setFieldErrors((p) => ({ ...p, message: "" }));
                    }}
                    className={`${contactTextareaClass} ${fieldBorder("message")}`}
                  />
                  {fieldErrors.message ? (
                    <p className="mt-1 font-lato text-[12px] text-red-400">
                      {fieldErrors.message}
                    </p>
                  ) : null}
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex w-full cursor-pointer items-center justify-center bg-[#eeeeee] py-3.5 align-middle font-lato text-[16px] font-[500] leading-[24px] tracking-normal text-[#111111] transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 bg-[#111111] pb-[35px] lg:pb-[75px]">
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
          <div className="mx-auto grid w-full max-w-[1480px] grid-cols-1 items-stretch justify-items-start gap-0 xl:max-w-[1520px]">
            {OFFICES.map((office) => (
              <div
                key={office.name}
                className="flex min-w-0 w-full max-w-md flex-col items-start text-left md:max-w-none md:h-full"
              >
                <h2 className="mt-9 font-quattrocento text-[30px] font-normal capitalize leading-[100%] tracking-normal text-[#FFFFFF] md:mt-14 lg:mt-14 xl:mt-0 xl:text-[36px]">
                  {office.name}
                </h2>
                <p className="mt-1 min-h-0 flex-none font-quattrocento text-[20px] font-normal leading-[34px] tracking-normal text-[#FFFFFF] md:mt-3 md:flex-1 md:text-[18px] lg:mt-5 lg:text-[20px]">
                  {office.address}
                </p>
                <div className="mt-3 flex w-full flex-col space-y-4 md:mt-8 md:flex-none lg:space-y-5">
                  <div className="flex flex-wrap items-center justify-center gap-x-4 font-quattrocento text-[14px] font-normal leading-[100%] tracking-normal text-[#FFFFFF] sm:gap-x-5 justify-start">
                    <span>Monday to Sunday</span>
                    <span
                      className="h-[14px] w-px shrink-0 bg-[#FFFFFF]/45 sm:h-4"
                      aria-hidden
                    />
                    <span>10:00 am - 8:00 pm</span>
                  </div>
                  <a
                    href="tel:+917838700316"
                    className="inline-flex max-w-full items-center gap-[15px] font-quattrocento text-[20px] font-normal leading-[28px] tracking-normal text-[#FFFFFF] transition-opacity hover:opacity-80 md:text-[18px]"
                  >
                    <span>+91 7838700316</span>
                    <i
                      className="ri-arrow-right-long-line shrink-0 text-[20px] leading-none not-italic"
                      aria-hidden
                    />
                  </a>
                  <a
                    href="mailto:info@sanskarrealty.co.in"
                    className="inline-flex max-w-full items-center gap-[15px] font-quattrocento text-[20px] font-normal leading-[28px] tracking-normal text-[#FFFFFF] transition-opacity hover:opacity-80 md:text-[18px]"
                  >
                    <span>info@sanskarrealty.co.in</span>
                    <i
                      className="ri-arrow-right-long-line shrink-0 text-[20px] leading-none not-italic"
                      aria-hidden
                    />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <NavOverlay isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </section>
  );
}
