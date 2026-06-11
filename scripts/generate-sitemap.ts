import { mkdirSync, writeFileSync } from "fs";
import path from "path";

import { buildSitemapXml, getSitemapEntries } from "../app/lib/sitemap-data";

async function main() {
  const entries = await getSitemapEntries();
  const xml = buildSitemapXml(entries);
  const publicDir = path.join(process.cwd(), "public");
  const outPath = path.join(publicDir, "sitemap.xml");

  mkdirSync(publicDir, { recursive: true });
  writeFileSync(outPath, xml, "utf8");

  console.log(`Sitemap written to ${outPath} (${entries.length} URLs)`);
}

main().catch((error) => {
  console.error("Failed to generate sitemap:", error);
  process.exit(1);
});
