import type { MetadataRoute } from "next";

import { API_BASE } from "./dashboard/lib";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

const STATIC_PAGES: MetadataRoute.Sitemap = [
  {
    url: `${SITE_URL}/`,
    changeFrequency: "weekly",
    priority: 1,
  },
  {
    url: `${SITE_URL}/about-us`,
    changeFrequency: "monthly",
    priority: 0.9,
  },
  {
    url: `${SITE_URL}/projects`,
    changeFrequency: "monthly",
    priority: 0.9,
  },
  {
    url: `${SITE_URL}/media`,
    changeFrequency: "weekly",
    priority: 0.8,
  },
  {
    url: `${SITE_URL}/blogs`,
    changeFrequency: "weekly",
    priority: 0.8,
  },
  {
    url: `${SITE_URL}/carrer`,
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    url: `${SITE_URL}/nri-corner`,
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    url: `${SITE_URL}/contact-us`,
    changeFrequency: "yearly",
    priority: 0.6,
  },
];

type BlogRow = {
  _id?: string;
  uploadDate?: string;
  updatedAt?: string;
  createdAt?: string;
};

async function fetchAllBlogUrls(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  let page = 1;
  const limit = 100;

  while (true) {
    const res = await fetch(
      `${API_BASE}/api/users/get-blog-data?page=${page}&limit=${limit}`,
      { next: { revalidate: 3600 } },
    );

    if (!res.ok) break;

    const json = (await res.json()) as {
      data?: BlogRow[];
      totalPages?: number;
      pagination?: { totalPages?: number };
    };

    const list = Array.isArray(json.data) ? json.data : [];
    if (list.length === 0) break;

    for (const item of list) {
      const id = item._id;
      if (!id) continue;

      const rawDate = item.uploadDate ?? item.updatedAt ?? item.createdAt;
      entries.push({
        url: `${SITE_URL}/blogs/${id}`,
        lastModified: rawDate ? new Date(rawDate) : new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }

    const totalPages = json.totalPages ?? json.pagination?.totalPages;
    if (totalPages != null && page >= totalPages) break;
    if (list.length < limit) break;
    page += 1;
  }

  return entries;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const blogUrls = await fetchAllBlogUrls();
  return [...STATIC_PAGES, ...blogUrls];
}
