// Page builder: writes a real HTML file for every page of a site, so search engines and social media
// see each page's own content, title, description, share image and structured data.
//   /index.html, /<page>/index.html (content.js pages), /shop/, /c/<category>/, /p/<product>/
//   plus sitemap.xml, robots.txt and 404.html.
// Visitors get the same pages as before: the shared app takes over once a page loads.
//
// Runs as part of `npm run sync`. Products come from the site's products.js (written by sync from catalog/products.json).
// Shared by every site — edit in core/, then `npm run sync` (it's copied to each site's .builder/ folder).
//
// Usage: node .builder/prerender.mjs [siteDir]

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { execSync } from "node:child_process";

const dir = path.resolve(process.argv[2] || ".");
const builderDir = path.join(dir, ".builder");
const read = file => fs.readFileSync(path.join(dir, file), "utf8");
const exists = file => fs.existsSync(path.join(dir, file));

// Folder names a page may never use (they hold the site's own files).
const RESERVED = new Set(["assets", ".builder", ".git", ".github", "node_modules"]);

// ---------- load the site's own browser scripts ----------

const sandbox = { console, Intl, URL, URLSearchParams };
sandbox.window = sandbox;
vm.createContext(sandbox);
for (const file of ["products.js", "site.config.js", "content.js", "render.js", "blocks.js", "custom.js"]) {
  if (!exists(file)) continue;
  try {
    vm.runInContext(read(file), sandbox, { filename: file });
  } catch (err) {
    if (file === "custom.js") console.warn(`  ! custom.js didn't run in the builder (${err.message}); its blocks won't be pre-built.`);
    else throw new Error(`${file}: ${err.message}`);
  }
}
const PRODUCTS = sandbox.PRODUCTS || [];
const PRODUCT_REDIRECTS = sandbox.PRODUCT_REDIRECTS || {}; // { "old-handle": "new-handle" }
const SITE = sandbox.SITE_CONFIG || {};
const CONTENT = sandbox.SITE_CONTENT || {};
const Blocks = vm.runInContext("Blocks", sandbox);
const createRender = vm.runInContext("createRender", sandbox);
const PAGES = { ...createRender({ site: SITE }).builtInPages(), ...(CONTENT.pages || {}) };

// ---------- where the site lives ----------
// siteUrl in site.config.js, else customDomain, else the GitHub Pages address from the git remote.

function siteAddress() {
  let url = SITE.siteUrl || (SITE.customDomain ? `https://${SITE.customDomain.trim()}` : "");
  if (!url) {
    try {
      const remote = execSync("git remote get-url origin", { cwd: dir, stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
      const m = remote.match(/github\.com[:/]([^/]+)\/(.+?)(\.git)?$/);
      if (m) url = m[2].toLowerCase() === `${m[1].toLowerCase()}.github.io` ? `https://${m[2]}` : `https://${m[1].toLowerCase()}.github.io/${m[2]}`;
    } catch { /* no git remote yet */ }
  }
  url = url.replace(/\/+$/, "");
  return { origin: url, base: url ? new URL(url).pathname.replace(/\/?$/, "/") : "/" };
}
const { origin, base } = siteAddress();
const R = createRender({ site: SITE, base });
const absolute = href => {
  if (!href) return "";
  if (/^https?:\/\//.test(href)) return href;
  if (!origin) return "";
  return new URL(R.link(href.startsWith("/") ? href : "/" + href), origin + "/").href;
};

// ---------- page metadata ----------

const text = html => String(html || "").replace(/<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>/gi, " ")
  .replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"')
  .replace(/\s+/g, " ").trim();
const clip = (s, n = 160) => (s.length <= n ? s : s.slice(0, n - 1).replace(/\s+\S*$/, "") + "…");

// First paragraph-ish text on a content page.
function blocksText(blocks = []) {
  for (const b of blocks) {
    const t = text(b.html || b.text || "");
    if (t.length > 40) return t;
  }
  return "";
}

function firstImage(blocks = []) {
  for (const b of blocks) {
    const found = b.image || b.items?.map(i => (typeof i === "string" ? i : i.src || i.image)).find(Boolean);
    if (found && /\.(jpe?g|png|webp|gif|avif)(\?|$)/i.test(found)) return found;
  }
  return "";
}

// Every picture on a content page (heroes, splits, galleries, tiles), for the sitemap and structured data.
function allImages(blocks = []) {
  return blocks.flatMap(b => [b.image, ...(b.items || []).map(i => (typeof i === "string" ? i : i.src || i.image))])
    .filter(src => src && /\.(jpe?g|png|webp|gif|avif)(\?|$)/i.test(src));
}

const seo = SITE.seo || {};
// seo.location: where you're based, e.g. { town: "Bristol", country: "GB" }. Town and country only, never a street address.
const address = seo.location && { "@type": "PostalAddress",
  ...(seo.location.town ? { addressLocality: seo.location.town } : {}),
  ...(seo.location.region ? { addressRegion: seo.location.region } : {}),
  ...(seo.location.country ? { addressCountry: seo.location.country } : {}) };
const owner = seo.owner ? {
  "@type": "Person", name: seo.owner,
  ...(seo.ownerJobTitle ? { jobTitle: seo.ownerJobTitle } : {}),
  ...(address ? { address } : {}),
} : undefined;
const organization = () => ({
  "@type": "Organization",
  name: SITE.name,
  ...(SITE.description ? { description: SITE.description } : {}),
  ...(origin ? { url: absolute("/") } : {}),
  ...(seo.logo ? { logo: absolute(seo.logo) } : {}),
  ...(address ? { address } : {}),
  ...(seo.areaServed ? { areaServed: seo.areaServed } : {}),
  ...(seo.knowsAbout?.length ? { knowsAbout: seo.knowsAbout } : {}),
  ...(SITE.social?.length ? { sameAs: SITE.social.map(s => s.href) } : {}),
  ...(owner ? { founder: owner } : {}),
});
const breadcrumbs = items => origin && {
  "@context": "https://schema.org", "@type": "BreadcrumbList",
  itemListElement: items.map(([name, href], i) => ({ "@type": "ListItem", position: i + 1, name, item: absolute(href) })),
};
const defaultImage = () => seo.shareImage || firstImage(CONTENT.home) || SITE.hero?.image || "";

// The site's colours and fonts (site.config.js theme), written into each page so it paints in the right
// colours straight away instead of flashing the default theme until app.js runs.
function themeHtml() {
  const t = SITE.theme || {};
  const vars = {
    "--bg": t.background, "--surface": t.surface, "--text": t.text, "--muted": t.muted,
    "--accent": t.accent, "--accent-text": t.accentText, "--border": t.border,
    "--radius": t.radius, "--font-body": t.fontBody, "--font-heading": t.fontHeading,
  };
  const css = Object.entries(vars).filter(([, v]) => v).map(([k, v]) => `${k}:${String(v).replace(/[<>{};]/g, "")}`).join(";");
  return [
    css ? `<style>:root{${css}}</style>` : "",
    t.googleFonts ? `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />` : "",
    t.googleFonts ? `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${R.esc(t.googleFonts.split("|").map(f => "family=" + f).join("&"))}&amp;display=swap" />` : "",
  ].filter(Boolean).map(tag => "  " + tag).join("\n");
}

function headHtml(page) {
  const esc = R.esc;
  const url = origin ? absolute("/" + page.path) : "";
  const image = absolute(page.image || defaultImage());
  const tags = [
    `<title>${esc(page.title)}</title>`,
    `<meta name="description" content="${esc(page.description)}" />`,
    page.noindex || page.hidden ? `<meta name="robots" content="noindex" />` : "",
    url && !page.noindex && !page.hidden ? `<link rel="canonical" href="${esc(url)}" />` : "",
    `<meta property="og:site_name" content="${esc(SITE.name)}" />`,
    `<meta property="og:title" content="${esc(page.shareTitle || page.title)}" />`,
    `<meta property="og:description" content="${esc(page.description)}" />`,
    `<meta property="og:type" content="${page.ogType || "website"}" />`,
    `<meta property="og:locale" content="${esc((SITE.locale || "en-GB").replace("-", "_"))}" />`,
    url ? `<meta property="og:url" content="${esc(url)}" />` : "",
    image ? `<meta property="og:image" content="${esc(image)}" />` : "",
    image && page.imageAlt ? `<meta property="og:image:alt" content="${esc(page.imageAlt)}" />` : "",
    ...(page.ogExtra || []).map(([k, v]) => `<meta property="${k}" content="${esc(v)}" />`),
    `<meta name="twitter:card" content="${image ? "summary_large_image" : "summary"}" />`,
    seo.twitter ? `<meta name="twitter:site" content="${esc(seo.twitter)}" />` : "",
    // seo.verify: ownership tags from Pinterest, Google etc., e.g. { "p:domain_verify": "abc123" }. Homepage only.
    ...(page.path === "" ? Object.entries(seo.verify || {}) : []).map(([k, v]) => `<meta name="${esc(k)}" content="${esc(v)}" />`),
    ...(page.jsonld || []).filter(Boolean).map(data =>
      `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`),
  ];
  return tags.filter(Boolean).map(t => "  " + t).join("\n");
}

// ---------- build ----------

// products.xml: a product feed for Google Merchant Center (free Shopping listings) and Pinterest catalogues.
// One item per variant; variants of the same product share an item_group_id.
function productFeed(products) {
  const x = s => R.esc(String(s ?? ""));
  const items = products.flatMap(p => {
    const variants = p.variants.nodes;
    const images = p.images.nodes.map(i => absolute(i.url)).filter(Boolean);
    const description = text(p.descriptionHtml).slice(0, 5000) || p.title;
    const link = absolute(`/p/${p.handle}`);
    return variants.filter(v => v.price).map(v => {
      const opt = re => v.selectedOptions.find(o => re.test(o.name.trim()))?.value;
      const extra = v.title !== "Default Title" ? ` - ${v.title}` : "";
      const image = (v.image && absolute(v.image.url)) || images[0];
      return `  <item>
    <g:id>${x(v.sku || v.id.replace("/", "-"))}</g:id>
    <g:title>${x((p.seo?.title || p.title).slice(0, 150 - extra.length) + extra)}</g:title>
    <g:description>${x(description)}</g:description>
    <g:link>${x(link)}</g:link>
    ${image ? `<g:image_link>${x(image)}</g:image_link>` : ""}
    ${images.filter(i => i !== image).slice(0, 10).map(i => `<g:additional_image_link>${x(i)}</g:additional_image_link>`).join("\n    ")}
    <g:availability>${v.availableForSale ? "in_stock" : "out_of_stock"}</g:availability>
    <g:price>${Number(v.price.amount).toFixed(2)} ${x(v.price.currencyCode)}</g:price>
    <g:brand>${x(SITE.name)}</g:brand>
    <g:condition>new</g:condition>
    <g:identifier_exists>no</g:identifier_exists>
    ${p.productType ? `<g:product_type>${x(p.productType)}</g:product_type>` : ""}
    ${variants.length > 1 ? `<g:item_group_id>${x(p.handle)}</g:item_group_id>` : ""}
    ${opt(/size/i) ? `<g:size>${x(opt(/size/i))}</g:size>` : ""}
    ${opt(/colou?r/i) ? `<g:color>${x(opt(/colou?r/i))}</g:color>` : ""}
  </item>`.replace(/\n\s*\n/g, "\n");
    });
  });
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
  <title>${x(SITE.name)}</title>
  <link>${x(absolute("/"))}</link>
  <description>${x(SITE.description || SITE.name)}</description>
${items.join("\n")}
</channel>
</rss>
`;
}

const pageTitle = part => (part ? `${part} | ${SITE.name}` : seo.homeTitle || SITE.name);

function blockContext(pagePath, products, categories) {
  return {
    site: SITE, pages: PAGES,
    esc: R.esc, money: R.money, img: R.img, link: R.link, linkAttrs: R.linkAttrs, slugify: R.slugify,
    renderGrid: R.renderGrid, productCard: R.productCard,
    path: () => pagePath,
    query: () => new URLSearchParams(""),
    setQuery() {},
    async products() { return products; },
    async categories() { return categories.map(c => ({ ...c, products: R.productsIn(products, c) })); },
    async category(name) {
      const c = categories.find(x => x.name.toLowerCase() === String(name).toLowerCase() || x.slug === R.slugify(name));
      return c ? { ...c, products: R.productsIn(products, c) } : null;
    },
  };
}

async function contentPage(pagePath, page, products, categories) {
  const html = await Blocks.render(R.pageBlocks(page, pagePath), blockContext(pagePath, products, categories));
  const project = page.project;
  const post = page.post;
  const description = clip(page.description || project?.summary || post?.summary || blocksText(page.blocks) || SITE.description || "");
  const image = project?.image || post?.image || firstImage(page.blocks);
  const images = [...new Set([image, ...allImages(page.blocks)].filter(Boolean))];
  const url = absolute("/" + pagePath);
  return {
    path: pagePath,
    title: pageTitle(pagePath ? page.title : ""),
    shareTitle: page.title || SITE.name,
    description, image, images,
    hidden: !!page.hidden, // kept out of search engines and sitemap.xml (e.g. the thank-you page)
    imageAlt: project ? project.imageAlt || project.title || page.title : post ? post.imageAlt || post.title || page.title : "",
    main: R.pageWrap(pagePath, html),
    jsonld: !pagePath ? [
      { "@context": "https://schema.org", "@type": "WebSite", name: SITE.name, ...(origin ? { url: absolute("/") } : {}), description },
      { "@context": "https://schema.org", ...organization() },
    ] : project ? [
      {
        "@context": "https://schema.org", "@type": "CreativeWork",
        name: project.title || page.title, description,
        ...(url ? { url } : {}),
        ...(origin && images.length ? { image: images.slice(0, 10).map(absolute) } : {}),
        ...(project.year ? { dateCreated: String(project.year).slice(0, 4) } : {}),
        ...(project.types?.length ? { keywords: project.types.join(", ") } : {}),
        creator: owner || organization(),
      },
      breadcrumbs([[SITE.name, "/"], ["Projects", SITE.projectsPage || "/projects"], [project.title || page.title, "/" + pagePath]]),
    ] : post ? [
      {
        "@context": "https://schema.org", "@type": "BlogPosting",
        headline: post.title || page.title, description,
        ...(url ? { url, mainEntityOfPage: url } : {}),
        ...(origin && images.length ? { image: images.slice(0, 10).map(absolute) } : {}),
        ...(post.date ? { datePublished: String(post.date).slice(0, 10) } : {}),
        ...(post.tags?.length ? { keywords: post.tags.join(", ") } : {}),
        author: owner || organization(),
        publisher: organization(),
      },
      breadcrumbs([[SITE.name, "/"], ["Blog", SITE.blogPage || "/blog"], [post.title || page.title, "/" + pagePath]]),
    ] : [breadcrumbs([[SITE.name, "/"], [page.title, "/" + pagePath]])],
  };
}

function productPage(p, categories) {
  const pagePath = `p/${p.handle}`;
  const category = R.categoryOf(p, categories);
  const variants = p.variants.nodes;
  const prices = variants.map(v => Number(v.price.amount));
  const currency = variants[0]?.price.currencyCode;
  const offerUrl = absolute("/" + pagePath);
  const availability = v => `https://schema.org/${v.availableForSale ? "InStock" : "OutOfStock"}`;
  const offers = variants.length > 1 ? {
    "@type": "AggregateOffer", priceCurrency: currency,
    lowPrice: Math.min(...prices).toFixed(2), highPrice: Math.max(...prices).toFixed(2), offerCount: variants.length,
    availability: availability(p), ...(offerUrl ? { url: offerUrl } : {}),
  } : {
    "@type": "Offer", priceCurrency: currency, price: prices[0]?.toFixed(2),
    availability: availability(variants[0] || p), itemCondition: "https://schema.org/NewCondition", ...(offerUrl ? { url: offerUrl } : {}),
  };
  const description = clip(p.seo?.description || text(p.descriptionHtml) || `${p.title} by ${SITE.name}.`);
  return {
    path: pagePath,
    title: pageTitle(p.seo?.title || p.title),
    shareTitle: p.title,
    description,
    image: p.images.nodes[0]?.url,
    imageAlt: p.images.nodes[0]?.altText || p.title,
    ogType: "product",
    ogExtra: [["product:price:amount", Math.min(...prices).toFixed(2)], ["product:price:currency", currency],
      ["product:availability", p.availableForSale ? "in stock" : "out of stock"]],
    main: R.productHtml(p, categories),
    images: p.images.nodes.map(i => i.url),
    lastmod: p.updatedAt,
    jsonld: [
      {
        "@context": "https://schema.org", "@type": "Product",
        name: p.title, description,
        ...(origin ? { image: p.images.nodes.slice(0, 10).map(i => absolute(i.url)) } : {}),
        ...(category ? { category: category.name } : {}),
        ...(variants[0]?.sku ? { sku: variants[0].sku } : {}),
        brand: { "@type": "Brand", name: SITE.name },
        offers,
      },
      breadcrumbs([[SITE.name, "/"], ...(category ? [[category.name, `/c/${category.slug}`]] : [["Shop", "/shop"]]), [p.title, "/" + pagePath]]),
    ],
  };
}

function listingPage(products, categories, category) {
  const pagePath = category ? `c/${category.slug}` : "shop";
  const inCategory = category ? R.productsIn(products, category) : products;
  const names = (category ? inCategory.map(p => p.title) : categories.map(c => c.name)).slice(0, 6).join(", ");
  return {
    path: pagePath,
    title: pageTitle(category ? category.name : "Shop"),
    shareTitle: category ? `${category.name} | ${SITE.name}` : `Shop | ${SITE.name}`,
    description: clip(category ? `${category.name} from ${SITE.name}: ${names}.` : `Shop ${SITE.name}: ${names}.`),
    image: (inCategory.find(p => p.featuredImage?.own) || inCategory.find(p => p.featuredImage))?.featuredImage.url,
    main: R.listingHtml(products, categories, category),
    jsonld: [breadcrumbs([[SITE.name, "/"], ["Shop", "/shop"], ...(category ? [[category.name, "/" + pagePath]] : [])])],
  };
}

// ---------- write files ----------

const template = fs.readFileSync(path.join(builderDir, "template.html"), "utf8");
const fill = (html, values) => Object.entries(values).reduce((out, [k, v]) => out.split(`{{${k}}}`).join(v), html);

function pageFile(pagePath) {
  return pagePath ? path.join(pagePath, "index.html") : "index.html";
}

function renderFile(page, categories) {
  const onProject = !!PAGES[page.path]?.project;
  return fill(template, {
    LANG: R.esc(SITE.locale || "en-GB"),
    BASE: R.esc(base),
    HEAD: headHtml(page),
    THEME: themeHtml(), // after styles.css so it overrides the defaults, before custom.css so that still wins
    FAVICON: R.esc(SITE.favicon || "data:,"),
    BRAND: SITE.logo ? `<img src="${R.esc(SITE.logo)}" alt="${R.esc(SITE.name)}">` : `<span>${R.esc(SITE.name)}</span>`, // same as app.js
    NAV: page.noindex ? "" : R.navHtml(categories, page.path, { onProject, projectsPage: SITE.projectsPage || "/projects" }),
    PATH: R.esc(page.noindex ? "-" : page.path),
    MAIN: page.main || "",
  });
}

// A small page for a project that now lives on another website. It forwards visitors straight there and
// tells search engines where the project went (not listed in sitemap.xml).
// A product's old address (e.g. after two listings were combined): forwards to its new page, for visitors and search engines.
function productRedirectFile(to) {
  const href = absolute("/p/" + to) || R.link("/p/" + to);
  return `<!doctype html>
<html lang="${R.esc(SITE.locale || "en-GB")}">
<head>
<meta charset="utf-8">
<title>Moved</title>
<meta name="robots" content="noindex">
<link rel="canonical" href="${R.esc(href)}">
<meta http-equiv="refresh" content="0; url=${R.esc(href)}">
</head>
<body><p><a href="${R.esc(href)}">This product has moved here.</a></p></body>
</html>
`;
}

function movedFile(page) {
  const { href, site = "my sister site", siteNote = "" } = page.project;
  const title = page.project.title || page.title;
  return `<!doctype html>
<html lang="${R.esc(SITE.locale || "en-GB")}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${R.esc(title)} has moved to ${R.esc(site)}</title>
<meta name="robots" content="noindex">
<link rel="canonical" href="${R.esc(href)}">
<meta http-equiv="refresh" content="0; url=${R.esc(href)}">
<style>body { font: 17px/1.6 system-ui, sans-serif; max-width: 34rem; margin: 15vh auto; padding: 0 16px; background: #fff; color: #111; }
@media (prefers-color-scheme: dark) { body { background: #111; color: #eee; } a { color: #fff; } }</style>
</head>
<body>
<h1>${R.esc(title)}</h1>
<p>This project now lives on ${R.esc(site)}.${siteNote ? " " + R.esc(siteNote) : ""}</p>
<p><a href="${R.esc(href)}">Continue to ${R.esc(site)} →</a></p>
</body>
</html>
`;
}

async function main() {
  const manifestFile = path.join(builderDir, "generated.json");
  const previous = fs.existsSync(manifestFile) ? JSON.parse(fs.readFileSync(manifestFile, "utf8")) : { files: [] };

  const products = PRODUCTS;
  const categories = R.buildCategories(products);

  const pages = [];
  const moved = []; // projects that live on another website: their address here just forwards visitors on
  if (CONTENT.home) pages.push(await contentPage("", { blocks: CONTENT.home, description: SITE.description }, products, categories));
  else pages.push({
    path: "", title: pageTitle(""), description: SITE.description || "", main: R.listingHtml(products, categories, null, { isHome: true }),
    jsonld: [{ "@context": "https://schema.org", "@type": "WebSite", name: SITE.name, ...(origin ? { url: absolute("/") } : {}) },
      { "@context": "https://schema.org", ...organization() }],
  });
  for (const [pagePath, page] of Object.entries(PAGES)) {
    if (page.project?.href && !page.blocks) { moved.push([pagePath, page]); continue; } // lives on another website
    if (RESERVED.has(pagePath.split("/")[0]) || /[^a-z0-9/_-]/i.test(pagePath)) {
      console.warn(`  ! Skipped page "${pagePath}": that address can't be used for a page.`);
      continue;
    }
    pages.push(await contentPage(pagePath, page, products, categories));
  }
  if (!PAGES.shop) pages.push(listingPage(products, categories, null));
  for (const c of categories) pages.push(listingPage(products, categories, c));
  for (const p of products) pages.push(productPage(p, categories));

  const written = new Set();
  const write = (file, content) => {
    const target = path.join(dir, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    if (!fs.existsSync(target) || fs.readFileSync(target, "utf8") !== content) fs.writeFileSync(target, content);
    written.add(file.split(path.sep).join("/"));
  };
  // Only replace these if they don't exist yet or were written by this builder before.
  const ours = file => !exists(file) || previous.files.includes(file);

  for (const page of pages) write(pageFile(page.path), renderFile(page, categories));
  for (const [pagePath, page] of moved) write(pageFile(pagePath), movedFile(page));
  for (const [from, to] of Object.entries(PRODUCT_REDIRECTS)) {
    if (!PRODUCTS.some(p => p.handle === from)) write(pageFile(`p/${from}`), productRedirectFile(to));
  }
  if (ours("404.html")) {
    write("404.html", renderFile({ path: "", noindex: true, title: pageTitle("Page not found"), description: SITE.description || "" }, categories));
  }

  const contentDate = fs.statSync(path.join(dir, exists("content.js") ? "content.js" : "site.config.js")).mtime.toISOString().slice(0, 10);
  if (origin) {
    // Each page's pictures are listed too, so they can be found in Google Images.
    const imageTags = p => (p.images || []).slice(0, 1000).map(src => absolute(src)).filter(Boolean)
      .map(src => `<image:image><image:loc>${R.esc(src)}</image:loc></image:image>`).join("");
    const urls = pages.filter(p => !p.hidden).map(p => `  <url><loc>${R.esc(absolute("/" + p.path))}</loc><lastmod>${(p.lastmod || contentDate).slice(0, 10)}</lastmod>${imageTags(p)}</url>`);
    if (ours("sitemap.xml")) write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls.join("\n")}\n</urlset>\n`);
    if (ours("robots.txt")) write("robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${absolute("/sitemap.xml")}\n`);
    if (products.length && ours("products.xml")) write("products.xml", productFeed(products));
  } else {
    console.warn("  ! No web address yet (set customDomain or siteUrl in site.config.js, or publish to GitHub),");
    console.warn("    so share links, canonical tags and sitemap.xml are left out for now.");
  }

  // Remove pages that no longer exist (e.g. a product taken off the site).
  for (const file of previous.files) {
    if (written.has(file)) continue;
    const target = path.join(dir, file);
    if (fs.existsSync(target)) fs.rmSync(target);
    for (let d = path.dirname(target); d.startsWith(dir) && d !== dir; d = path.dirname(d)) {
      if (fs.readdirSync(d).length) break;
      fs.rmdirSync(d);
    }
  }
  fs.writeFileSync(manifestFile, JSON.stringify({ files: [...written].sort() }, null, 2) + "\n");

  const count = kind => pages.filter(kind).length;
  return `${pages.length} pages (${count(p => p.path.startsWith("p/"))} products, ${count(p => PAGES[p.path]?.project)} projects, ${count(p => PAGES[p.path]?.post)} blog posts)` +
    (origin ? ` for ${origin}/` : "");
}

main().then(summary => console.log("  " + summary)).catch(err => {
  console.error("  ✖ Page build failed: " + err.message);
  process.exit(1);
});
