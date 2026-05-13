"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useState,
} from "react";
import { Lato, Quattrocento } from "next/font/google";
import {
  isValidEmail,
  isValidFullName,
  isValidIndianMobile,
  isValidVisitDate,
} from "./formValidation";

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

const TIME_SLOT_OPTIONS = [
  { value: "", label: "Preferred time *" },
  { value: "10-12", label: "10:00 AM – 12:00 PM (Morning)" },
  { value: "12-15", label: "12:00 PM – 3:00 PM (Afternoon)" },
  { value: "15-18", label: "3:00 PM – 6:00 PM (Evening)" },
  { value: "flexible", label: "Flexible — call me to confirm" },
] as const;

const PROJECT_OPTIONS = [
  { value: "", label: "Select project / location *" },
  { value: "Eternia", label: "Eternia" },
  { value: "HighLife", label: "HighLife" },
  { value: "Forest Walk", label: "Forest Walk" },
] as const;

const ENQUIRE_API_PATH = "/api/enquire";

const FOURQT_WEB_CREATE_URL = "https://eternia04.4erealty.com/WebCreate.aspx";
const FOURQT_UID = "fourqt";
const FOURQT_PWD = "wn9mxO76f34=";

function fourQtUrlHostPath(href: string): string {
  try {
    const u = new URL(href);
    return `${u.host}${u.pathname}`;
  } catch {
    return "";
  }
}

function normalizeIndianMobileDigits(value: string): string {
  let d = value.replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("91")) d = d.slice(2);
  if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  return d;
}

/** Align with enquiry / projects brochure CRM labels. */
function normalizeProjectForFourQt(project: string): string {
  const raw = String(project ?? "").trim().toLowerCase();
  if (raw.includes("eternia")) return "Eternia Sanskar";
  if (
    raw.includes("high life") ||
    raw.includes("high-life") ||
    raw.includes("highlife")
  ) {
    return "High Life Sanskar";
  }
  if (
    raw.includes("forest walk") ||
    raw.includes("forest-walk") ||
    raw.includes("forestwalk")
  ) {
    return "Forest Walk Sanskar";
  }
  const t = String(project ?? "").trim();
  return t || "Sanskar Website";
}

async function submitSiteVisitLeadToFourQt({
  name,
  email,
  mobileDigits,
  visitDate,
  timeSlotLabel: slotLbl,
  project,
  notes,
}: {
  name: string;
  email: string;
  mobileDigits: string;
  visitDate: string;
  timeSlotLabel: string;
  project: string;
  notes: string;
}): Promise<void> {
  const href = typeof window !== "undefined" ? window.location.href : "";
  const query =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams();
  const projectLabel = normalizeProjectForFourQt(project);
  const notesTrim = notes.trim();
  const notesShort =
    notesTrim.length > 160 ? `${notesTrim.slice(0, 160)}…` : notesTrim;
  const remark = [
    `Site visit — ${visitDate}, ${slotLbl}`,
    `Project: ${projectLabel}`,
    notesShort ? `Notes: ${notesShort}` : null,
  ]
    .filter(Boolean)
    .join(". ");
  const remarkCapped =
    remark.length > 480 ? `${remark.slice(0, 477)}…` : remark;

  const requestParams = new URLSearchParams({
    UID: FOURQT_UID,
    PWD: FOURQT_PWD,
    Channel: "MS",
    Src: "Sanskar Website",
    ISD: "91",
    Mob: mobileDigits,
    Email: email,
    name,
    City: "",
    Location: "Sanskar Website",
    Project: projectLabel,
    Remark: remarkCapped,
    url: fourQtUrlHostPath(href),
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

function timeSlotLabel(value: string): string {
  const opt = TIME_SLOT_OPTIONS.find((o) => o.value === value);
  return opt?.label ?? value;
}

function localISODate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

type SiteVisitModalContextValue = {
  openSiteVisitModal: () => void;
};

const SiteVisitModalContext =
  createContext<SiteVisitModalContextValue | null>(null);

export function useSiteVisitModal() {
  const ctx = useContext(SiteVisitModalContext);
  if (!ctx) {
    throw new Error(
      "useSiteVisitModal must be used within SiteVisitModalProvider",
    );
  }
  return ctx;
}

export function SiteVisitModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [minDate, setMinDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitBanner, setSubmitBanner] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const titleId = useId();
  const close = useCallback(() => setOpen(false), []);
  const openSiteVisitModal = useCallback(() => setOpen(true), []);

  useEffect(() => {
    if (open) {
      setErrors({});
      setMinDate(localISODate());
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

  const inputBase =
    "min-h-[48px] w-full rounded-lg border bg-white px-3 py-2.5 font-lato text-[14px] font-normal text-[#111111] outline-none ring-1 ring-transparent placeholder:text-[#9CA3AF] focus:ring-2 sm:px-4 sm:text-[15px]";

  const labelClass =
    "mb-1 block font-lato text-[12px] font-medium uppercase tracking-wide text-[#555555] sm:text-[13px]";

  return (
    <SiteVisitModalContext.Provider value={{ openSiteVisitModal }}>
      {children}
      {open ? (
        <div
          className="fixed inset-0 z-[222] flex items-center justify-center p-4 sm:p-6"
          role="presentation"
        >
          <button
            type="button"
            aria-label="Close site visit form"
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity"
            onClick={close}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className={`${lato.variable} ${quattrocento.variable} relative z-10 w-full max-w-[520px] overflow-hidden rounded-2xl border border-[#E8E8E8] bg-[#FAFAFA] shadow-[0_24px_80px_rgba(0,0,0,0.35)]`}
          >
            <button
              type="button"
              onClick={close}
              className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#111111]/70 shadow-sm transition-colors hover:bg-white hover:text-[#111111] sm:right-4 sm:top-4"
              aria-label="Close"
            >
              <i className="ri-close-line text-2xl leading-none" aria-hidden />
            </button>
            <div className="border-b border-[#EAEAEA] bg-white px-5 py-5 pr-14 sm:px-8 sm:py-6 sm:pr-16">
              <p className="font-lato text-[11px] font-semibold uppercase tracking-[0.12em] text-[#F7A51D]">
                Appointment
              </p>
              <h2
                id={titleId}
                className="mt-1 font-quattrocento text-[22px] font-normal uppercase leading-tight tracking-normal text-[#111111] sm:text-[26px]"
              >
                Schedule a site visit
              </h2>
              <p className="mt-2 font-lato text-[14px] leading-relaxed text-[#666666] sm:text-[15px]">
                Pick a convenient date and time. Our team will confirm your
                visit shortly.
              </p>
            </div>

            <div className="max-h-[min(72vh,640px)] overflow-y-auto px-5 py-6 sm:px-8 sm:py-7">
              <form
                className="flex flex-col gap-5"
                noValidate
                onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const fd = new FormData(form);
                  const name = String(fd.get("name") ?? "").trim();
                  const email = String(fd.get("email") ?? "").trim();
                  const mobile = String(fd.get("mobile") ?? "").trim();
                  const visitDate = String(fd.get("visitDate") ?? "").trim();
                  const timeSlot = String(fd.get("timeSlot") ?? "").trim();
                  const project = String(fd.get("project") ?? "").trim();
                  const notes = String(fd.get("notes") ?? "").trim();
                  const consentChecked = fd.get("consent") === "on";

                  const next: Record<string, string> = {};
                  if (!isValidFullName(name)) {
                    next.name =
                      "Enter your full name (letters only, 2–120 characters).";
                  }
                  if (!email) next.email = "Email is required.";
                  else if (!isValidEmail(email)) {
                    next.email = "Enter a valid email address.";
                  }
                  if (!mobile) next.mobile = "Mobile number is required.";
                  else if (!isValidIndianMobile(mobile)) {
                    next.mobile =
                      "Enter a valid 10-digit Indian mobile (e.g. 9876543210).";
                  }
                  if (!visitDate) {
                    next.visitDate = "Please choose a visit date.";
                  } else if (!isValidVisitDate(visitDate)) {
                    next.visitDate = "Choose today or a future date.";
                  }
                  if (!timeSlot) {
                    next.timeSlot = "Please select a preferred time.";
                  }
                  if (project.length < 2 || project.length > 200) {
                    next.project =
                      "Enter project or location (2–200 characters).";
                  }
                  if (notes.length > 500) {
                    next.notes = "Notes must be 500 characters or less.";
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

                  const slotLabel = timeSlotLabel(timeSlot);
                  const details = [
                    `Preferred date: ${visitDate}`,
                    `Time: ${slotLabel}`,
                    `Project / location: ${project}`,
                    notes ? `Notes: ${notes}` : null,
                  ]
                    .filter(Boolean)
                    .join("\n");

                  const payload = {
                    formType: "Site visit",
                    fullName: name,
                    email,
                    mobile,
                    consent: true,
                    visitDate,
                    timeSlot,
                    timeSlotLabel: slotLabel,
                    project,
                    notes: notes || "",
                    details,
                  };

                  try {
                    const res = await fetch(ENQUIRE_API_PATH, {
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
                      "ok" in parsed &&
                      (parsed as { ok: unknown }).ok === false
                    ) {
                      const m =
                        "message" in parsed &&
                        typeof (parsed as { message?: string }).message ===
                          "string"
                          ? (parsed as { message: string }).message
                          : "Submission rejected.";
                      throw new Error(m);
                    }
                    const trimmed = text.trim();
                    if (
                      trimmed.startsWith("<!DOCTYPE") ||
                      trimmed.startsWith("<html") ||
                      /Script function not found/i.test(text)
                    ) {
                      throw new Error(
                        "Apps Script: add doGet + doPost and redeploy Web app.",
                      );
                    }

                    void submitSiteVisitLeadToFourQt({
                      name,
                      email,
                      mobileDigits: normalizeIndianMobileDigits(mobile),
                      visitDate,
                      timeSlotLabel: slotLabel,
                      project,
                      notes,
                    }).catch(() => {});

                    setSubmitBanner({
                      type: "success",
                      message: "Request sent — we’ll confirm your visit soon.",
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
                    className={`rounded-lg border px-3 py-3 font-lato text-[13px] leading-snug sm:text-[14px] ${
                      submitBanner.type === "success"
                        ? "border-green-600/45 bg-green-50 text-green-900"
                        : "border-red-500/55 bg-red-50 text-red-900"
                    }`}
                  >
                    {submitBanner.message}
                  </div>
                ) : null}
                <div>
                  <p className="mb-3 font-lato text-[12px] font-bold uppercase tracking-wide text-[#111111]">
                    Your details
                  </p>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-x-3 sm:gap-y-4">
                    <div className="min-w-0 sm:col-span-2">
                      <label htmlFor="site-name" className={labelClass}>
                        Full name *
                      </label>
                      <input
                        id="site-name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        placeholder="Full name"
                        aria-invalid={!!errors.name}
                        aria-describedby={
                          errors.name ? "site-name-err" : undefined
                        }
                        onInput={() =>
                          setErrors((p) => {
                            const { name: _, ...r } = p;
                            return r;
                          })
                        }
                        className={`${inputBase} ${fieldBorder("name")}`}
                      />
                      {errors.name ? (
                        <p
                          id="site-name-err"
                          className="mt-1 font-lato text-[11px] text-red-600 sm:text-[12px]"
                        >
                          {errors.name}
                        </p>
                      ) : null}
                    </div>

                    <div className="min-w-0">
                      <label htmlFor="site-email" className={labelClass}>
                        Email *
                      </label>
                      <input
                        id="site-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="Email"
                        aria-invalid={!!errors.email}
                        aria-describedby={
                          errors.email ? "site-email-err" : undefined
                        }
                        onInput={() =>
                          setErrors((p) => {
                            const { email: _, ...r } = p;
                            return r;
                          })
                        }
                        className={`${inputBase} ${fieldBorder("email")}`}
                      />
                      {errors.email ? (
                        <p
                          id="site-email-err"
                          className="mt-1 font-lato text-[11px] text-red-600 sm:text-[12px]"
                        >
                          {errors.email}
                        </p>
                      ) : null}
                    </div>

                    <div className="min-w-0">
                      <label htmlFor="site-mobile" className={labelClass}>
                        Mobile *
                      </label>
                      <input
                        id="site-mobile"
                        name="mobile"
                        type="tel"
                        autoComplete="tel"
                        placeholder="Mobile number"
                        aria-invalid={!!errors.mobile}
                        aria-describedby={
                          errors.mobile ? "site-mobile-err" : undefined
                        }
                        onInput={() =>
                          setErrors((p) => {
                            const { mobile: _, ...r } = p;
                            return r;
                          })
                        }
                        className={`${inputBase} ${fieldBorder("mobile")}`}
                      />
                      {errors.mobile ? (
                        <p
                          id="site-mobile-err"
                          className="mt-1 font-lato text-[11px] text-red-600 sm:text-[12px]"
                        >
                          {errors.mobile}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#EAEAEA] pt-5">
                  <p className="mb-3 font-lato text-[12px] font-bold uppercase tracking-wide text-[#111111]">
                    Visit preference
                  </p>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-x-3 sm:gap-y-4">
                    <div className="min-w-0">
                      <label htmlFor="site-date" className={labelClass}>
                        Preferred date *
                      </label>
                      <input
                        id="site-date"
                        name="visitDate"
                        type="date"
                        min={minDate || undefined}
                        aria-invalid={!!errors.visitDate}
                        aria-describedby={
                          errors.visitDate ? "site-date-err" : undefined
                        }
                        onChange={() =>
                          setErrors((p) => {
                            const { visitDate: _, ...r } = p;
                            return r;
                          })
                        }
                        className={`${inputBase} ${fieldBorder("visitDate")}`}
                      />
                      {errors.visitDate ? (
                        <p
                          id="site-date-err"
                          className="mt-1 font-lato text-[11px] text-red-600 sm:text-[12px]"
                        >
                          {errors.visitDate}
                        </p>
                      ) : null}
                    </div>

                    <div className="min-w-0">
                      <label htmlFor="site-time" className={labelClass}>
                        Time slot *
                      </label>
                      <select
                        id="site-time"
                        name="timeSlot"
                        defaultValue=""
                        aria-invalid={!!errors.timeSlot}
                        aria-describedby={
                          errors.timeSlot ? "site-time-err" : undefined
                        }
                        onChange={() =>
                          setErrors((p) => {
                            const { timeSlot: _, ...r } = p;
                            return r;
                          })
                        }
                        className={`${inputBase} ${fieldBorder("timeSlot")}`}
                      >
                        {TIME_SLOT_OPTIONS.map((opt) => (
                          <option
                            key={opt.value || "ph"}
                            value={opt.value}
                            disabled={opt.value === ""}
                          >
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      {errors.timeSlot ? (
                        <p
                          id="site-time-err"
                          className="mt-1 font-lato text-[11px] text-red-600 sm:text-[12px]"
                        >
                          {errors.timeSlot}
                        </p>
                      ) : null}
                    </div>

                    <div className="min-w-0 sm:col-span-2">
                      <label htmlFor="site-project" className={labelClass}>
                        Project / location *
                      </label>
                      <select
                        id="site-project"
                        name="project"
                        defaultValue=""
                        aria-invalid={!!errors.project}
                        aria-describedby={
                          errors.project ? "site-project-err" : undefined
                        }
                        onChange={() =>
                          setErrors((p) => {
                            const { project: _, ...r } = p;
                            return r;
                          })
                        }
                        className={`${inputBase} ${fieldBorder("project")}`}
                      >
                        {PROJECT_OPTIONS.map((opt) => (
                          <option
                            key={opt.value || "ph"}
                            value={opt.value}
                            disabled={opt.value === ""}
                          >
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      {errors.project ? (
                        <p
                          id="site-project-err"
                          className="mt-1 font-lato text-[11px] text-red-600 sm:text-[12px]"
                        >
                          {errors.project}
                        </p>
                      ) : null}
                    </div>

                    <div className="min-w-0 sm:col-span-2">
                      <label htmlFor="site-notes" className={labelClass}>
                        Additional notes{" "}
                        <span className="font-normal normal-case text-[#888888]">
                          (optional)
                        </span>
                      </label>
                      <textarea
                        id="site-notes"
                        name="notes"
                        rows={3}
                        placeholder="Any special requests or questions"
                        aria-invalid={!!errors.notes}
                        aria-describedby={
                          errors.notes ? "site-notes-err" : undefined
                        }
                        onInput={() =>
                          setErrors((p) => {
                            const { notes: _, ...r } = p;
                            return r;
                          })
                        }
                        className={`min-h-[88px] w-full resize-y rounded-lg border bg-white px-3 py-2.5 font-lato text-[14px] font-normal text-[#111111] outline-none ring-1 ring-transparent placeholder:text-[#9CA3AF] focus:ring-2 sm:px-4 sm:text-[15px] ${fieldBorder("notes")}`}
                      />
                      {errors.notes ? (
                        <p
                          id="site-notes-err"
                          className="mt-1 font-lato text-[11px] text-red-600 sm:text-[12px]"
                        >
                          {errors.notes}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="flex cursor-pointer items-start gap-2.5 font-lato text-[12px] font-normal leading-snug text-[#6B7280] sm:text-[13px]">
                    <input
                      name="consent"
                      type="checkbox"
                      value="on"
                      aria-invalid={!!errors.consent}
                      aria-describedby={
                        errors.consent ? "site-consent-err" : undefined
                      }
                      onChange={() =>
                        setErrors((p) => {
                          const { consent: _, ...r } = p;
                          return r;
                        })
                      }
                      className="mt-0.5 h-4 w-4 shrink-0 rounded border-[#D1D5DB] text-[#111111] focus:ring-[#111111]"
                    />
                    <span>
                      I agree to be contacted by Sanskar Realty regarding this
                      site visit request.
                    </span>
                  </label>
                  {errors.consent ? (
                    <p
                      id="site-consent-err"
                      className="mt-1 font-lato text-[11px] text-red-600 sm:text-[12px]"
                    >
                      {errors.consent}
                    </p>
                  ) : null}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-h-[50px] w-full rounded-lg bg-[#111111] px-4 py-3 font-lato text-[14px] font-bold uppercase tracking-wide text-white transition-colors hover:bg-[#222] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:text-[15px]"
                >
                  {isSubmitting ? "Sending…" : "Confirm appointment request"}
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </SiteVisitModalContext.Provider>
  );
}
