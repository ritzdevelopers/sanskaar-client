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
  isValidIndianMobile,
  validateResumeFile,
  isValidFullName,
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

const TEAM_OPTIONS = [
  { value: "", label: "Select team *" },
  { value: "sales", label: "Sales Team" },
  { value: "management", label: "Management Team" },
  { value: "marketing", label: "Marketing Team" },
  { value: "operations", label: "Operations Team" },
  { value: "hr", label: "Human Resources" },
  { value: "other", label: "Other" },
] as const;

/** Base64 JSON payload limit — keep under typical server / Apps Script body limits. */
const RESUME_MAX_FOR_SHEET_UPLOAD = 1.5 * 1024 * 1024;

const ENQUIRE_API_PATH = "/api/enquire";

const FOURQT_WEB_CREATE_URL = "https://eternia04.4erealty.com/WebCreate.aspx";
const FOURQT_UID = "fourqt";
const FOURQT_PWD = "wn9mxO76f34=";

function teamLabel(value: string): string {
  const opt = TEAM_OPTIONS.find((o) => o.value === value);
  return opt?.label ?? value;
}

function fourQtUrlHostPath(href: string): string {
  try {
    const u = new URL(href);
    return `${u.host}${u.pathname}`;
  } catch {
    return "";
  }
}

/** 10-digit Indian mobile for FourQT `Mob` (same rules as career / brochure). */
function normalizeIndianMobileDigits(value: string): string {
  let d = value.replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("91")) d = d.slice(2);
  if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  return d;
}

/** Same WebCreate.aspx lead pipe as `projects.jsx` / enquiry — name, Email, Mob, Sanskar Website labels. */
async function submitWorkWithUsLeadToFourQt({
  name,
  email,
  mobileDigits,
  teamLabel: teamLbl,
  resumeFileName,
}: {
  name: string;
  email: string;
  mobileDigits: string;
  teamLabel: string;
  resumeFileName: string;
}): Promise<void> {
  const href = typeof window !== "undefined" ? window.location.href : "";
  const query =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams();
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
    Project: "Sanskar Website",
    Remark: `Work with us — ${teamLbl}. Resume: ${resumeFileName}`,
    url: fourQtUrlHostPath(href),
    UniqueId: String(Date.now()),
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

function readResumeAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const comma = dataUrl.indexOf(",");
      resolve(comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl);
    };
    reader.onerror = () =>
      reject(new Error("Could not read resume file."));
    reader.readAsDataURL(file);
  });
}

type WorkWithUsModalContextValue = {
  openWorkWithUsModal: () => void;
};

const WorkWithUsModalContext =
  createContext<WorkWithUsModalContextValue | null>(null);

export function useWorkWithUsModal() {
  const ctx = useContext(WorkWithUsModalContext);
  if (!ctx) {
    throw new Error(
      "useWorkWithUsModal must be used within WorkWithUsModalProvider",
    );
  }
  return ctx;
}

export function WorkWithUsModalProvider({
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
  const titleId = useId();
  const close = useCallback(() => setOpen(false), []);
  const openWorkWithUsModal = useCallback(() => setOpen(true), []);

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

  const inputBase =
    "min-h-[48px] w-full rounded-lg border bg-white px-3 py-2.5 font-lato text-[14px] font-normal text-[#111111] outline-none ring-1 ring-transparent placeholder:text-[#9CA3AF] focus:ring-2 sm:px-4 sm:text-[15px]";

  const labelClass =
    "mb-1 block font-lato text-[12px] font-medium uppercase tracking-wide text-[#555555] sm:text-[13px]";

  return (
    <WorkWithUsModalContext.Provider value={{ openWorkWithUsModal }}>
      {children}
      {open ? (
        <div
          className="fixed inset-0 z-[221] flex items-center justify-center p-4 sm:p-6"
          role="presentation"
        >
          <button
            type="button"
            aria-label="Close work with us form"
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity"
            onClick={close}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className={`${lato.variable} ${quattrocento.variable} relative z-10 w-full max-w-[480px] overflow-hidden rounded-2xl bg-[#F5F5F4] shadow-[0_24px_80px_rgba(0,0,0,0.35)]`}
          >
            <div className="relative max-h-[min(90vh,720px)] overflow-y-auto px-5 py-8 sm:px-8 sm:py-10">
              <button
                type="button"
                onClick={close}
                className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full text-[#111111]/70 transition-colors hover:bg-black/[0.06] hover:text-[#111111] sm:right-4 sm:top-4"
                aria-label="Close"
              >
                <i className="ri-close-line text-2xl leading-none" aria-hidden />
              </button>

              <h2
                id={titleId}
                className="font-quattrocento pr-10 text-[22px] font-normal uppercase leading-[1.15] tracking-normal text-[#111111] sm:text-[24px]"
              >
                Work With Us
              </h2>
              <p className="mt-2 font-lato text-[14px] font-normal leading-relaxed text-[#6B7280] sm:text-[15px]">
                Tell us which team you&apos;re interested in and share your
                details. We&apos;ll get in touch.
              </p>

              <form
                className="mt-6 flex flex-col gap-4"
                noValidate
                onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const fd = new FormData(form);
                  const team = String(fd.get("team") ?? "").trim();
                  const name = String(fd.get("name") ?? "").trim();
                  const email = String(fd.get("email") ?? "").trim();
                  const mobile = String(fd.get("mobile") ?? "").trim();
                  const fileInput = (
                    form.elements.namedItem("resume") as HTMLInputElement | null
                  )?.files?.[0];

                  const next: Record<string, string> = {};
                  if (!team) {
                    next.team = "Please select a team.";
                  }
                  if (!isValidFullName(name)) {
                    next.name =
                      "Enter your full name (letters only, 2–120 characters).";
                  }
                  if (!email) {
                    next.email = "Email is required.";
                  } else if (!isValidEmail(email)) {
                    next.email = "Enter a valid email address.";
                  }
                  if (!mobile) {
                    next.mobile = "Mobile number is required.";
                  } else if (!isValidIndianMobile(mobile)) {
                    next.mobile =
                      "Enter a valid 10-digit Indian mobile (e.g. 9876543210).";
                  }
                  const resumeErr = fileInput
                    ? validateResumeFile(fileInput)
                    : "Please attach your resume.";
                  if (resumeErr) {
                    next.resume = resumeErr;
                  } else if (
                    fileInput &&
                    fileInput.size > RESUME_MAX_FOR_SHEET_UPLOAD
                  ) {
                    next.resume =
                      "For online submission, resume must be 1.5 MB or smaller (compress PDF if needed).";
                  }

                  if (Object.keys(next).length > 0) {
                    setErrors(next);
                    return;
                  }

                  if (!fileInput) {
                    setErrors({ resume: "Please attach your resume." });
                    return;
                  }

                  setErrors({});
                  setSubmitBanner(null);
                  setIsSubmitting(true);

                  const teamLbl = teamLabel(team);
                  let resumeBase64: string;
                  try {
                    resumeBase64 = await readResumeAsBase64(fileInput);
                  } catch {
                    setIsSubmitting(false);
                    setSubmitBanner({
                      type: "error",
                      message:
                        "Could not submit. Could not read resume file — try another file.",
                    });
                    return;
                  }

                  const details = [
                    `Team: ${teamLbl}`,
                    `Resume: ${fileInput.name} (${fileInput.type || "file"})`,
                  ].join("\n");

                  const payload = {
                    formType: "Work with us",
                    fullName: name,
                    email,
                    mobile,
                    consent: true,
                    team,
                    teamLabel: teamLbl,
                    resumeFileName: fileInput.name,
                    resumeMimeType:
                      fileInput.type || "application/octet-stream",
                    resumeBase64,
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

                    void submitWorkWithUsLeadToFourQt({
                      name,
                      email,
                      mobileDigits: normalizeIndianMobileDigits(mobile),
                      teamLabel: teamLbl,
                      resumeFileName: fileInput.name,
                    }).catch(() => {});

                    setSubmitBanner({
                      type: "success",
                      message: "Application sent — we’ll be in touch.",
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
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-x-3 sm:gap-y-4">
                  <div className="min-w-0 sm:col-span-2">
                    <label htmlFor="work-team" className={labelClass}>
                      Team
                    </label>
                    <select
                      id="work-team"
                      name="team"
                      defaultValue=""
                      aria-invalid={!!errors.team}
                      aria-describedby={
                        errors.team ? "work-team-err" : undefined
                      }
                      onChange={() =>
                        setErrors((p) => {
                          const { team: _, ...r } = p;
                          return r;
                        })
                      }
                      className={`${inputBase} ${fieldBorder("team")}`}
                    >
                      {TEAM_OPTIONS.map((opt) => (
                        <option
                          key={opt.value || "placeholder"}
                          value={opt.value}
                          disabled={opt.value === ""}
                        >
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    {errors.team ? (
                      <p
                        id="work-team-err"
                        className="mt-1 font-lato text-[11px] text-red-600 sm:text-[12px]"
                      >
                        {errors.team}
                      </p>
                    ) : null}
                  </div>

                  <div className="min-w-0">
                    <label htmlFor="work-name" className={labelClass}>
                      Full name *
                    </label>
                    <input
                      id="work-name"
                      name="name"
                      type="text"
                      placeholder="Your name"
                      autoComplete="name"
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? "work-name-err" : undefined}
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
                        id="work-name-err"
                        className="mt-1 font-lato text-[11px] text-red-600 sm:text-[12px]"
                      >
                        {errors.name}
                      </p>
                    ) : null}
                  </div>

                  <div className="min-w-0">
                    <label htmlFor="work-email" className={labelClass}>
                      Email *
                    </label>
                    <input
                      id="work-email"
                      name="email"
                      type="email"
                      placeholder="Email"
                      autoComplete="email"
                      aria-invalid={!!errors.email}
                      aria-describedby={
                        errors.email ? "work-email-err" : undefined
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
                        id="work-email-err"
                        className="mt-1 font-lato text-[11px] text-red-600 sm:text-[12px]"
                      >
                        {errors.email}
                      </p>
                    ) : null}
                  </div>

                  <div className="min-w-0">
                    <label htmlFor="work-mobile" className={labelClass}>
                      Mobile *
                    </label>
                    <input
                      id="work-mobile"
                      name="mobile"
                      type="tel"
                      placeholder="Mobile number"
                      autoComplete="tel"
                      aria-invalid={!!errors.mobile}
                      aria-describedby={
                        errors.mobile ? "work-mobile-err" : undefined
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
                        id="work-mobile-err"
                        className="mt-1 font-lato text-[11px] text-red-600 sm:text-[12px]"
                      >
                        {errors.mobile}
                      </p>
                    ) : null}
                  </div>

                  <div className="min-w-0">
                    <label htmlFor="work-resume" className={labelClass}>
                      Resume *
                    </label>
                    <input
                      id="work-resume"
                      name="resume"
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      aria-invalid={!!errors.resume}
                      aria-describedby={
                        errors.resume ? "work-resume-err" : undefined
                      }
                      onChange={() =>
                        setErrors((p) => {
                          const { resume: _, ...r } = p;
                          return r;
                        })
                      }
                      className={`min-h-[48px] w-full min-w-0 cursor-pointer rounded-lg border border-dashed bg-white px-2 py-2 font-lato text-[12px] text-[#111111] outline-none ring-1 ring-transparent file:mr-2 file:max-w-[min(100%,140px)] file:truncate file:rounded-md file:border-0 file:bg-[#111111] file:px-2 file:py-1.5 file:font-lato file:text-[12px] file:font-medium file:text-white hover:opacity-95 focus:ring-2 sm:px-3 sm:py-2.5 sm:text-[13px] sm:file:mr-3 sm:file:max-w-none sm:file:px-3 sm:file:text-[13px] ${
                        errors.resume
                          ? "border-red-500 focus:ring-red-500/30"
                          : "border-[#C4C4C4] hover:border-[#111111]"
                      }`}
                    />
                    <p className="mt-1 font-lato text-[11px] text-[#888888] sm:text-[12px]">
                      PDF or Word, max 5 MB. Online submit: keep under 1.5 MB.
                    </p>
                    {errors.resume ? (
                      <p
                        id="work-resume-err"
                        className="mt-1 font-lato text-[11px] text-red-600 sm:text-[12px]"
                      >
                        {errors.resume}
                      </p>
                    ) : null}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-h-[48px] w-full rounded-lg border border-[#111111] bg-[#111111] px-3 py-2.5 font-lato text-[14px] font-bold uppercase tracking-wide text-white transition-colors hover:bg-[#222] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:text-[15px]"
                >
                  {isSubmitting ? "Sending…" : "Submit application"}
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </WorkWithUsModalContext.Provider>
  );
}
