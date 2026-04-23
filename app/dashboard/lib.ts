// export const API_BASE =
//   (typeof process !== "undefined" &&
//     process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "")) ||
//   "https://sanskar-backend-7xrl.onrender.com";

// export const API_BASE = "http://localhost:3001"; 
export const API_BASE = "https://sanskaar-server.onrender.com";


/** Strip HTML tags for excerpts, previews, and meta text (blog body is HTML). */
export function stripHtmlToPlainText(html: unknown): string {
  let s = String(html ?? "");
  if (!s) return "";
  s = s.replace(/<br\s*\/?>/gi, " ");
  s = s.replace(/<\/(p|div|h[1-6]|li|tr)>/gi, " ");
  let prev = "";
  while (prev !== s) {
    prev = s;
    s = s.replace(/<[^>]+>/g, " ");
  }
  s = s
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  s = s.replace(/&#x([0-9a-f]+);/gi, (_, hex) => {
    const code = parseInt(hex, 16);
    return Number.isFinite(code) ? String.fromCodePoint(code) : "";
  });
  s = s.replace(/&#(\d+);/g, (_, dec) => {
    const code = parseInt(dec, 10);
    return Number.isFinite(code) ? String.fromCodePoint(code) : "";
  });
  prev = "";
  while (prev !== s) {
    prev = s;
    s = s.replace(/<[^>]+>/g, " ");
  }
  return s.replace(/\s+/g, " ").trim();
}

/** Blog `image` from API: relative path under API origin, or absolute URL — for `<img>` / `next/image`. */
export function blogImageUrlFromApi(
  imageField: unknown,
  fallback = "/assets/recentpost2.jpg",
): string {
  if (imageField == null) return fallback;
  const s = String(imageField).trim();
  if (!s) return fallback;
  if (/^https?:\/\//i.test(s)) return s;
  return `${API_BASE}/${s.replace(/^\/+/, "")}`;
}

/** Career resume path in DB e.g. `uploads/resume/<file>` (older rows may use `uploads/resumes/...`). */
export async function downloadCareerResumeFromPath(
  relativePath: string | undefined | null,
): Promise<void> {
  if (!relativePath || typeof relativePath !== "string") return;
  const normalized = relativePath.replace(/^\/+/, "");
  const url = `${API_BASE}/${normalized}`;
  const res = await fetch(url);
  if (!res.ok) return;
  const blob = await res.blob();
  const baseName = normalized.split("/").pop() || "resume";
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = baseName;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(objectUrl);
}

export async function parseJson(res: Response) {
  const ct = res.headers.get("content-type");
  if (ct?.includes("application/json")) {
    return res.json() as Promise<Record<string, unknown>>;
  }
  const text = await res.text();
  throw new Error(text.slice(0, 160) || `HTTP ${res.status}`);
}
