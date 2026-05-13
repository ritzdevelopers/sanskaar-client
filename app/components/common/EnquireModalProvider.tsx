"use client";

import Image from "next/image";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useState,
} from "react";
import { Lato, Quattrocento } from "next/font/google";
import { API_BASE } from "../../dashboard/lib";

const ENQUIRY_SUBMIT_URL = `${API_BASE}/api/users/get-Enquire-now-Data`;
const FOURQT_WEB_CREATE_URL = "https://eternia04.4erealty.com/WebCreate.aspx";
const FOURQT_UID = "fourqt";
const FOURQT_PWD = "wn9mxO76f34=";
const ENQUIRE_EMAIL_REGEX =
  /^(?!\d)[A-Za-z][A-Za-z0-9._%+-]{0,63}@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,24}$/;

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

function isStrictFullName(value: string): boolean {
  const t = value.trim();
  return /^(?=.{2,120}$)[A-Za-z]+(?: [A-Za-z]+)*$/.test(t);
}

function isStrictEmail(value: string): boolean {
  const t = value.trim();
  return ENQUIRE_EMAIL_REGEX.test(t) && !t.includes("..");
}

function hasDigitRepeatedMoreThanFive(value: string): boolean {
  const digitCounts = [...value].reduce<Record<string, number>>((acc, d) => {
    acc[d] = (acc[d] || 0) + 1;
    return acc;
  }, {});
  return Object.values(digitCounts).some((count) => count > 5);
}

function urlWithoutProtocolAndQuery(urlValue: string): string {
  try {
    const parsed = new URL(urlValue);
    return `${parsed.host}${parsed.pathname}`;
  } catch {
    return "";
  }
}

function projectFromPath(pathname: string): string {
  const p = pathname.toLowerCase();
  if (p.includes("eternia")) return "Eternia Sanskar";
  if (p.includes("high-life") || p.includes("highlife")) return "High Life Sanskar";
  if (p.includes("forest-walk") || p.includes("forestwalk")) return "Forest Walk Sanskar";
  return "Sanskar Website";
}

///project ke naam se tha ab project ke naam ke aage sanskar add kiya hai

function normalizeProjectName(projectName: string | undefined, pathname: string): string {
  const raw = String(projectName ?? "").trim().toLowerCase();
  if (raw.includes("eternia")) return "Eternia Sanskar";
  if (raw.includes("high life") || raw.includes("high-life") || raw.includes("highlife")) {
    return "High Life Sanskar";
  }
  if (raw.includes("forest walk") || raw.includes("forest-walk") || raw.includes("forestwalk")) {
    return "Forest Walk Sanskar";
  }
  return projectFromPath(pathname);
}

function splitFullNameForApi(fullName: string): {
  firstName: string;
  lastName: string;
} {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: parts[0] };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

function pageLabelFromPath(pathname: string): string {
  const clean = pathname.replace(/^\/+|\/+$/g, "");
  if (!clean) return "Home Page";
  const parts = clean.split("/").filter(Boolean);
  const segment = parts[parts.length - 1] || "Page";
  const pretty = segment
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return `${pretty.charAt(0).toUpperCase()}${pretty.slice(1)} Page`;
}

async function submitLeadToFourQt(payload: {
  fullName: string;
  email: string;
  mobile: string;
  projectName?: string;
  sourcePage?: string;
}): Promise<void> {
  const currentHref = typeof window !== "undefined" ? window.location.href : "";
  const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
  const query = typeof window !== "undefined" ? window.location.search : "";
  const qs = new URLSearchParams(query);
  const UniqueId = "0";
  const pageLabel = payload.sourcePage || pageLabelFromPath(currentPath);
  const projectLabel = normalizeProjectName(payload.projectName, currentPath);
  const requestParams = new URLSearchParams({
    UID: FOURQT_UID,
    PWD: FOURQT_PWD,
    Channel: "MS",
    Src: "Sanskar Website",
    ISD: "91",
    Mob: payload.mobile,
    Email: payload.email,
    name: payload.fullName,
    City: "",
    Location: "Sanskar Website",
    Project: projectLabel,
    Remark: payload.projectName
      ? `Enquiry from ${pageLabel} for ${projectLabel}`
      : `Enquiry from ${pageLabel} callback form`,
    url: urlWithoutProtocolAndQuery(currentHref),
    UniqueId: UniqueId,
    fld1: qs.get("utm_source") ?? "",
    fld2: qs.get("utm_campaign") ?? "",
    fld3: qs.get("utm_medium") ?? "",
    fld4: qs.get("utm_keyword") ?? qs.get("utm_term") ?? "",
  });

  const leadRes = await fetch(`${FOURQT_WEB_CREATE_URL}?${requestParams.toString()}`, {
    method: "GET",
    cache: "no-store",
  });
  if (!leadRes.ok) {
    throw new Error(`4QT lead API failed (${leadRes.status}).`);
  }
}

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-lato",
});

const quattrocento = Quattrocento({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-quattrocento",
});

type EnquireModalContextValue = {
  openEnquireModal: (options?: {
    projectName?: string;
    sourcePage?: string;
  }) => void;
};

const EnquireModalContext = createContext<EnquireModalContextValue | null>(
  null,
);

export function useEnquireModal() {
  const ctx = useContext(EnquireModalContext);
  if (!ctx) {
    throw new Error("useEnquireModal must be used within EnquireModalProvider");
  }
  return ctx;
}

export function EnquireModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitBanner, setSubmitBanner] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [leadContext, setLeadContext] = useState<{
    projectName?: string;
    sourcePage?: string;
  }>({});
  const titleId = useId();
  const close = useCallback(() => {
    setOpen(false);
    setLeadContext({});
  }, []);
  const openEnquireModal = useCallback(
    (options?: { projectName?: string; sourcePage?: string }) => {
      setLeadContext({
        projectName: options?.projectName?.trim() || undefined,
        sourcePage: options?.sourcePage?.trim() || undefined,
      });
      setOpen(true);
    },
    [],
  );

  useEffect(() => {
    if (open) {
      setErrors({});
      setSubmitBanner(null);
      setIsSubmitting(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, close]);

  const fieldBorder = (key: string) =>
    errors[key]
      ? "border-red-500 focus:border-red-600 focus:ring-red-500/30"
      : "border-[#E5E5E5] focus:border-[#111111] focus:ring-[#111111]";

  return (
    <EnquireModalContext.Provider value={{ openEnquireModal }}>
      {children}
      {open ? (
        <div
          className="fixed inset-0 z-[220] flex items-center justify-center p-4 sm:p-6"
          role="presentation"
        >
          <button
            type="button"
            aria-label="Close enquiry form"
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity"
            onClick={close}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className={`${lato.variable} ${quattrocento.variable} relative z-10 flex w-full max-w-[960px] flex-col overflow-hidden rounded-2xl bg-[#F5F5F4] shadow-[0_24px_80px_rgba(0,0,0,0.35)] md:max-h-[min(640px,94vh)] md:flex-row`}
          >
            {/* Form: left on desktop, top on mobile */}
            <div className="relative flex w-full flex-1 flex-col px-5 py-8 md:w-1/2 md:px-8 md:py-10">
              <button
                type="button"
                onClick={close}
                className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full text-[#111111]/70 transition-colors hover:bg-black/[0.06] hover:text-[#111111] sm:right-4 sm:top-4"
                aria-label="Close"
              >
                <i className="ri-close-line text-2xl leading-none cursor-pointer" aria-hidden />
              </button>

              <h2
                id={titleId}
                className="font-quattrocento pr-10 text-[22px] font-normal uppercase leading-[1.15] tracking-normal text-[#111111] sm:text-[24px] md:text-[26px]"
              >
                Find Your Perfect Space !
              </h2>
              <p className="mt-2 max-w-[340px] font-lato text-[14px] font-normal leading-[1.55] tracking-normal text-[#6B7280] sm:mt-3 sm:max-w-none sm:text-[15px]">
                Don&apos;t stay behind — share your details to get a call back
                and fresh offers on premium homes.
              </p>

              <form
                className="mt-6 flex flex-1 flex-col gap-4 sm:mt-8"
                noValidate
                onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const fd = new FormData(form);
                  const fullName = String(fd.get("fullName") ?? "")
                    .trim()
                    .replace(/\s+/g, " ");
                  const email = String(fd.get("email") ?? "").trim();
                  const mobile = String(fd.get("mobile") ?? "").trim();
                  const consentChecked = fd.get("consent") === "on";

                  const next: Record<string, string> = {};
                  if (!isStrictFullName(fullName)) {
                    next.fullName =
                      "Enter a valid full name (letters and spaces only, 2-120 characters).";
                  }
                  if (!email) {
                    next.email = "Email is required.";
                  } else if (!isStrictEmail(email)) {
                    next.email = "Enter a valid email address.";
                  }
                  const mobileDigits = digitsOnly(mobile);
                  if (!mobile) {
                    next.mobile = "Mobile number is required.";
                  } else if (hasDigitRepeatedMoreThanFive(mobileDigits)) {
                    next.mobile =
                      "Any single digit cannot repeat more than 5 times.";
                  } else if (!/^[6-9]\d{9}$/.test(mobileDigits)) {
                    next.mobile =
                      "Enter a valid 10-digit Indian mobile (e.g. 9876543210).";
                  }
                  if (!consentChecked) {
                    next.consent = "Please agree to continue.";
                  }

                  if (Object.keys(next).length > 0) {
                    setErrors(next);
                    return;
                  }

                  setErrors({});
                  setSubmitBanner(null);
                  setIsSubmitting(true);

                  const { firstName, lastName } = splitFullNameForApi(fullName);
                  const payload = {
                    fullName,
                    firstName,
                    lastName,
                    email,
                    mobile: digitsOnly(mobile),
                  };

                  try {
                    const res = await fetch(ENQUIRY_SUBMIT_URL, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(payload),
                    });
                    const text = await res.text();
                    let parsed: unknown;
                    try {
                      parsed = text ? JSON.parse(text) : null;
                    } catch {
                      parsed = null;
                    }
                    if (!res.ok) {
                      throw new Error(
                        typeof parsed === "object" &&
                          parsed !== null &&
                          "message" in parsed &&
                          typeof (parsed as { message: string }).message ===
                            "string"
                          ? (parsed as { message: string }).message
                          : `Server returned ${res.status}`,
                      );
                    }
                    if (
                      parsed &&
                      typeof parsed === "object" &&
                      "success" in parsed &&
                      (parsed as { success: unknown }).success === false
                    ) {
                      const m =
                        "message" in parsed &&
                        typeof (parsed as { message?: string }).message ===
                          "string"
                          ? (parsed as { message: string }).message
                          : "Submission rejected.";
                      throw new Error(m);
                    }

                    const successMsg =
                      parsed &&
                      typeof parsed === "object" &&
                      "message" in parsed &&
                      typeof (parsed as { message?: string }).message ===
                        "string"
                        ? (parsed as { message: string }).message
                        : "Submitted successfully!";

                    await submitLeadToFourQt({
                      ...payload,
                      projectName: leadContext.projectName,
                      sourcePage: leadContext.sourcePage,
                    });

                    setSubmitBanner({
                      type: "success",
                      message: successMsg,
                    });

                    if (form.isConnected) {
                      form.reset();
                    }
                    setTimeout(() => {
                      close();
                      setSubmitBanner(null);
                    }, 1000);
                  } catch (err) {
                    const raw =
                      err instanceof Error
                        ? err.message.trim()
                        : String(err);
                    const detail =
                      raw.length > 280 ? `${raw.slice(0, 280)}…` : raw;
                    setSubmitBanner({
                      type: "error",
                      message: detail
                        ? `Could not submit. ${detail}`
                        : "Could not submit. Please try again.",
                    });
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
              >
                {submitBanner ? (
                  <div
                    role={
                      submitBanner.type === "error" ? "alert" : "status"
                    }
                    aria-live={
                      submitBanner.type === "error" ? "assertive" : "polite"
                    }
                    className={`rounded-lg border px-3 py-3 font-lato text-[13px] leading-snug sm:px-4 sm:text-[14px] ${
                      submitBanner.type === "success"
                        ? "border-green-600/45 bg-green-50 text-green-900"
                        : "border-red-500/55 bg-red-50 text-red-900"
                    }`}
                  >
                    {submitBanner.message}
                  </div>
                ) : null}
                <div className="flex flex-col gap-3">
                  <div className="min-w-0">
                    <input
                      name="fullName"
                      type="text"
                      autoComplete="name"
                      placeholder="Full name"
                      aria-invalid={!!errors.fullName}
                      aria-describedby={
                        errors.fullName ? "enquire-fullName-err" : undefined
                      }
                      onInput={(e) => {
                        e.currentTarget.value = e.currentTarget.value
                          .replace(/[^A-Za-z ]/g, "")
                          .replace(/\s{2,}/g, " ");
                        setErrors((p) => {
                          const { fullName: _, ...r } = p;
                          return r;
                        });
                      }}
                      className={`min-h-[48px] w-full rounded-lg border bg-white px-3 py-2.5 font-lato text-[14px] font-normal text-[#111111] outline-none ring-1 ring-transparent placeholder:text-[#9CA3AF] focus:ring-2 sm:px-4 sm:text-[15px] ${fieldBorder("fullName")}`}
                    />
                    {errors.fullName ? (
                      <p
                        id="enquire-fullName-err"
                        className="mt-1 font-lato text-[11px] text-red-600 sm:text-[12px]"
                      >
                        {errors.fullName}
                      </p>
                    ) : null}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="min-w-0">
                      <input
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="Email"
                        aria-invalid={!!errors.email}
                        aria-describedby={
                          errors.email ? "enquire-email-err" : undefined
                        }
                        onInput={() =>
                          setErrors((p) => {
                            const { email: _, ...r } = p;
                            return r;
                          })
                        }
                        className={`min-h-[48px] w-full rounded-lg border bg-white px-3 py-2.5 font-lato text-[14px] font-normal text-[#111111] outline-none ring-1 ring-transparent placeholder:text-[#9CA3AF] focus:ring-2 sm:px-4 sm:text-[15px] ${fieldBorder("email")}`}
                      />
                      {errors.email ? (
                        <p
                          id="enquire-email-err"
                          className="mt-1 font-lato text-[11px] text-red-600 sm:text-[12px]"
                        >
                          {errors.email}
                        </p>
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <input
                        name="mobile"
                        type="tel"
                        autoComplete="tel"
                        placeholder="Mobile *"
                        aria-invalid={!!errors.mobile}
                        aria-describedby={
                          errors.mobile ? "enquire-mobile-err" : undefined
                        }
                        onInput={(e) => {
                          e.currentTarget.value = digitsOnly(
                            e.currentTarget.value,
                          ).slice(0, 10);
                          setErrors((p) => {
                            const { mobile: _, ...r } = p;
                            return r;
                          });
                        }}
                        className={`min-h-[48px] w-full rounded-lg border bg-white px-3 py-2.5 font-lato text-[14px] font-normal text-[#111111] outline-none ring-1 ring-transparent placeholder:text-[#9CA3AF] focus:ring-2 sm:px-4 sm:text-[15px] ${fieldBorder("mobile")}`}
                      />
                      {errors.mobile ? (
                        <p
                          id="enquire-mobile-err"
                          className="mt-1 font-lato text-[11px] text-red-600 sm:text-[12px]"
                        >
                          {errors.mobile}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="min-h-[48px] w-full cursor-pointer rounded-lg border border-[#111111] bg-[#111111] px-3 py-2.5 font-lato text-[14px] font-bold leading-none tracking-wide text-white transition-colors hover:bg-[#222] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:text-[15px]"
                  >
                    {isSubmitting ? "Submitting…" : "Get a Call Back"}
                  </button>
                </div>

                <div>
                  <label className="flex cursor-pointer items-start gap-2.5 font-lato text-[12px] font-normal leading-snug text-[#6B7280] sm:text-[13px]">
                    <input
                      name="consent"
                      type="checkbox"
                      value="on"
                      aria-invalid={!!errors.consent}
                      aria-describedby={
                        errors.consent ? "enquire-consent-err" : undefined
                      }
                      onChange={() =>
                        setErrors((p) => {
                          const { consent: _, ...r } = p;
                          return r;
                        })
                      }
                      className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-[#D1D5DB] text-[#111111] focus:ring-[#111111]"
                    />
                    <span>
                      I agree to receive news, updates &amp; other content from
                      Sanskar Realty.
                    </span>
                  </label>
                  {errors.consent ? (
                    <p
                      id="enquire-consent-err"
                      className="mt-1 font-lato text-[11px] text-red-600 sm:text-[12px]"
                    >
                      {errors.consent}
                    </p>
                  ) : null}
                </div>
              </form>
            </div>

            {/* Image: md+ only; hidden below md */}
            <div className="relative hidden min-h-[200px] w-full shrink-0 md:block md:w-1/2 md:min-h-[min(420px,94vh)]">
              <Image
                src="/assets/popupcontact.jpg"
                alt="Sanskar Realty residential development"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 480px"
                priority
              />
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/15 to-transparent sm:bg-gradient-to-l sm:from-transparent sm:via-transparent sm:to-black/20"
                aria-hidden
              />
            </div>
          </div>
        </div>
      ) : null}
    </EnquireModalContext.Provider>
  );
}
