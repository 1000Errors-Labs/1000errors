// HTML helpers shared by the browser app (app.js) and the page builder (prerender.mjs), so the page files
// written by `npm run sync` match what the live site shows. Pure functions only: no page/DOM access here.
// Shared by every site — edit in core/, then `npm run sync`.

function createRender({ site = {}, base = "/" } = {}) {
  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => (
      { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
    ));
  }

  function money(m) {
    if (!m) return "";
    try {
      return new Intl.NumberFormat(site.locale || "en-GB", { style: "currency", currency: m.currencyCode }).format(Number(m.amount));
    } catch {
      return `${Number(m.amount).toFixed(2)} ${m.currencyCode}`;
    }
  }

  function slugify(text) {
    return String(text).toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  // "Fashion Zip-Up Hoodie - AOP" -> "Fashion Zip-Up Hoodie"
  function cleanTypeName(type) {
    return type.replace(/\s*-\s*AOP\s*$/i, "").trim();
  }

  // Product photos come in two sizes (<name>-<n>-600.webp and <name>-<n>-1600.webp); pick the smaller one when it's enough.
  // Other pictures are used as they are.
  function img(url, width) {
    if (!url) return "";
    if (/-1600\.webp$/.test(url)) return width <= 600 ? url.replace(/-1600\.webp$/, "-600.webp") : url;
    return url;
  }

  // Links in site.config.js / content.js are written as "/about" and resolved against the site's base address.
  // Page links get a trailing slash ("/about/"), matching how GitHub Pages serves each page's folder.
  function link(href) {
    if (!href) return base;
    if (!href.startsWith("/") || href.startsWith("//")) return href;
    const [, path, rest] = href.match(/^([^?#]*)(.*)$/);
    const slash = path.endsWith("/") || /\.[a-z0-9]{2,5}$/i.test(path) ? "" : "/";
    return base + (path.slice(1) + slash).replace(/^\/+/, "") + rest;
  }
  const isExternal = href => /^(https?:)?\/\//.test(href || "") || /^mailto:|^tel:/.test(href || "");
  const linkAttrs = href => `href="${esc(link(href))}"${isExternal(href) && !/^mailto:|^tel:/.test(href) ? ` target="_blank" rel="noopener"` : ""}`;

  // ---------- shop categories ----------

  function buildCategories(products) {
    const custom = site.categories; // optional { "Hoodies": ["Fashion Zip-Up Hoodie - AOP", ...] }
    if (custom && Object.keys(custom).length) {
      return Object.entries(custom)
        .map(([name, types]) => ({ name, slug: slugify(name), types: new Set(types.map(s => s.toLowerCase())) }))
        .filter(c => products.some(p => c.types.has((p.productType || "").toLowerCase())));
    }
    const byName = new Map();
    for (const p of products) {
      if (!p.productType) continue;
      const name = cleanTypeName(p.productType);
      if (!byName.has(name)) byName.set(name, { name, slug: slugify(name), types: new Set() });
      byName.get(name).types.add(p.productType.toLowerCase());
    }
    return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name));
  }

  const productsIn = (products, category) =>
    (products || []).filter(p => category.types.has((p.productType || "").toLowerCase()));

  const categoryOf = (product, categories) =>
    categories.find(c => c.types.has((product.productType || "").toLowerCase()));

  // ---------- menu ----------
  //
  // site.menu (optional) is a list of:
  //   { label: "About", href: "/about" }
  //   { label: "Art", children: [ { label, href }, ... ] }
  //   { label: "Shop", shop: true }          dropdown of all shop categories
  //   { category: "Hoodies" }                link to one shop category (label defaults to its name)
  // Without site.menu the header shows "All" plus every category.

  function menuItems(categories) {
    const expand = item => {
      if (item.category) {
        const c = categories.find(x => x.name.toLowerCase() === item.category.toLowerCase() || x.slug === slugify(item.category));
        return c ? { label: item.label || c.name, href: `/c/${c.slug}` } : null; // hidden until it has products
      }
      if (item.shop) {
        return {
          label: item.label || "Shop",
          children: [{ label: site.allProductsLabel || "All", href: "/shop" }, ...categories.map(c => ({ label: c.name, href: `/c/${c.slug}` }))],
        };
      }
      if (item.children) {
        const children = item.children.map(expand).filter(Boolean);
        return children.length ? { ...item, children } : null;
      }
      return item;
    };
    if (site.menu?.length) return site.menu.map(expand).filter(Boolean);
    return [{ label: site.allProductsLabel || "All", href: "/" }, ...categories.map(c => ({ label: c.name, href: `/c/${c.slug}` }))];
  }

  // path: the current page, e.g. "projects" or "c/hoodies". onProject: whether that page is a project.
  function navHtml(categories, path, { onProject = false, projectsPage = "/projects" } = {}) {
    const here = link("/" + path);
    const isActive = href => {
      const target = link(href);
      return target === here || (target !== base && here.startsWith(target)) ||
        (target === link("/shop") && (here.startsWith(link("/c/")) || here.startsWith(link("/p/")))) ||   // a plain "Shop" link stays lit on categories and products
        (onProject && target === link(projectsPage));        // "Projects" stays lit on every project page
    };
    return menuItems(categories).map(item => {
      if (!item.children) {
        return `<a ${linkAttrs(item.href)} class="${isActive(item.href) ? "active" : ""}">${esc(item.label)}</a>`;
      }
      const active = item.children.some(c => isActive(c.href));
      return `
        <div class="nav-item">
          <a href="#" class="nav-parent ${active ? "active" : ""}" aria-haspopup="true">${esc(item.label)}</a>
          <div class="nav-dropdown">
            ${item.children.map(c => `<a ${linkAttrs(c.href)} class="${isActive(c.href) ? "active" : ""}">${esc(c.label)}</a>`).join("")}
          </div>
        </div>`;
    }).join("");
  }

  // ---------- product grid ----------

  function productCard(p) {
    const min = p.priceRange.minVariantPrice;
    const max = p.priceRange.maxVariantPrice;
    const compare = p.compareAtPriceRange?.minVariantPrice;
    const onSale = compare && Number(compare.amount) > Number(min.amount);
    const price = (Number(max.amount) > Number(min.amount) ? "From " : "") + money(min);
    return `
      <a class="card" href="${esc(link("/p/" + encodeURIComponent(p.handle)))}">
        <div class="card-img">
          ${p.featuredImage
            ? `<img loading="lazy" src="${esc(img(p.featuredImage.url, 600))}" data-zoom="${esc(img(p.featuredImage.url, 1600))}" alt="${esc(p.featuredImage.altText || p.title)}">`
            : `<span class="muted">No image</span>`}
          ${!p.availableForSale ? `<span class="badge">Sold out</span>` : onSale ? `<span class="badge">Sale</span>` : ""}
        </div>
        <div class="card-body">
          <p class="card-title">${esc(p.title)}</p>
          <p class="card-price">${esc(price)}${onSale ? ` <s class="muted">${esc(money(compare))}</s>` : ""}</p>
        </div>
      </a>`;
  }

  function renderGrid(products) {
    if (!products.length) return `<p class="muted empty">No products here yet.</p>`;
    return `<div class="grid">${products.map(productCard).join("")}</div>`;
  }

  // Category pills shown above shop listings when the site uses a custom menu.
  function categoryBar(categories, activeSlug) {
    if (!site.menu?.length) return "";
    const links = [{ slug: "", name: site.allProductsLabel || "All" }, ...categories];
    return `<nav class="shop-cats">${links.map(c => `
      <a href="${esc(link(c.slug ? "/c/" + c.slug : "/shop"))}" class="${c.slug === activeSlug ? "active" : ""}">${esc(c.name)}</a>`).join("")}
    </nav>`;
  }

  // The shop, a category, or (for sites without a content.js home page) the home page.
  // A line under the shop and category grids, e.g. pointing to commissions (shopNote in site.config.js).
  const shopNote = () => {
    const n = site.shopNote;
    if (!n?.text) return "";
    return `<p class="shop-note">${esc(n.text)}${n.href ? ` <a href="${esc(link(n.href))}">${esc(n.label || "Find out more")}</a>` : ""}</p>`;
  };

  // The "All" listing: products in site.shopLast (a list of product handles) go to the end, in that order.
  function allOrder(products) {
    const last = site.shopLast || [];
    return [...products.filter(p => !last.includes(p.handle)), ...last.map(h => products.find(p => p.handle === h)).filter(Boolean)];
  }

  function listingHtml(products, categories, category, { isHome = false } = {}) {
    if (category) {
      return `
        <section class="page-head"><h1>${esc(category.name)}</h1></section>
        ${categoryBar(categories, category.slug)}
        ${renderGrid(productsIn(products, category))}
        ${shopNote()}`;
    }
    const hero = site.hero || {};
    return isHome && (hero.title || hero.text) ? `
      <section class="hero" ${hero.image ? `style="--hero-image:url('${esc(hero.image)}')"` : ""}>
        <div class="hero-inner">
          ${hero.title ? `<h1>${esc(hero.title)}</h1>` : ""}
          ${hero.text ? `<p>${esc(hero.text)}</p>` : ""}
        </div>
      </section>
      ${renderGrid(allOrder(products))}` : `
      ${isHome ? "" : `<section class="page-head"><h1>Shop</h1></section>`}
      ${categoryBar(categories, "")}
      ${renderGrid(allOrder(products))}
      ${isHome ? "" : shopNote()}`;
  }

  // ---------- product page ----------

  // The variant shown first: the first one in stock.
  const firstVariant = p => p.variants.nodes.find(v => v.availableForSale) || p.variants.nodes[0];

  function priceHtml(v) {
    if (!v) return "";
    const onSale = v.compareAtPrice && Number(v.compareAtPrice.amount) > Number(v.price.amount);
    return esc(money(v.price)) + (onSale ? ` <s class="muted">${esc(money(v.compareAtPrice))}</s>` : "");
  }

  // Under a sold-out product: sign up to hear about the next run (mailingList in site.config.js), and/or
  // a link to commission one (commissionLink). app.js shows or hides it as the chosen variant changes.
  function soldOutHtml(p, v) {
    const ml = site.mailingList || {};
    const notify = ml.mailchimpUrl && ml.restock !== false;
    if (!notify && !site.commissionLink) return "";
    const r = ml.restock || {};
    return `
      <div class="sold-out-box" id="soldOutBox"${v?.availableForSale ? " hidden" : ""}>
        ${notify ? `
          <p class="sold-out-title">${esc(r.title || "Sold out. Get notified about the next run")}</p>
          <p class="muted small">${esc(r.text || "Pieces are made in small runs. Join the list and you'll hear first when this one is back.")}</p>
          <form class="signup-form" novalidate data-product="${esc(p.title)}" data-tags="${esc(ml.tags?.restock || "")}"
            data-success="${esc(r.success || "Thanks, you'll be the first to know when it's back.")}">
            <input name="email" type="email" autocomplete="email" placeholder="Your email" aria-label="Your email" required>
            <button class="button button-primary" type="submit">${esc(r.button || "Notify me")}</button>
            <p class="form-status small" role="status"></p>
          </form>` : ""}
        ${site.commissionLink ? `
          <p class="small sold-out-commission">${esc(r.commissionText || "Want one sooner, or in a custom size or colour?")}
            <a href="${esc(link(site.commissionLink))}?piece=${encodeURIComponent(p.title)}">Commission a bespoke piece</a></p>` : ""}
      </div>`;
  }

  // Photos and parts of a description can belong to one choice, e.g. only: { Style: "Microfleece" } on a photo, or
  // <div data-only='{"Style":"Microfleece"}'> in the description. They show only while that choice is selected.
  const matches = (only, selected) => !only || Object.entries(only).every(([k, val]) => selected[k] === val);
  const selectedOf = v => Object.fromEntries((v?.selectedOptions || []).map(o => [o.name, o.value]));

  // Product page markup. app.js wires up the gallery, options and Buy now afterwards.
  function productHtml(p, categories) {
    const images = p.images.nodes;
    const realOptions = p.options.filter(o => !(o.name === "Title" && o.optionValues.length === 1));
    const category = categoryOf(p, categories);
    const v = firstVariant(p);
    const selected = selectedOf(v);
    const first = images.find(im => matches(im.only, selected)) || images[0];
    const description = (p.descriptionHtml || "").replace(/<div data-only='([^']*)'>/g, (tag, only) =>
      matches(JSON.parse(only), selected) ? tag : tag.replace(">", " hidden>"));
    return `
      <a class="back-link" href="${esc(link(category ? `/c/${category.slug}` : site.menu?.length ? "/shop" : "/"))}">← ${esc(category ? category.name : "All products")}</a>
      <div class="product">
        <div class="gallery">
          <div class="gallery-main">
            ${first ? `<img id="mainImage" src="${esc(img(first.url, 1200))}" alt="${esc(first.altText || p.title)}">` : `<span class="muted">No image</span>`}
          </div>
          ${images.length > 1 ? `
            <div class="thumbs">
              ${images.map((im, i) => `
                <button class="thumb ${im === first ? "active" : ""}" data-src="${esc(im.url)}" aria-label="Image ${i + 1}"
                  ${im.only ? `data-only="${esc(JSON.stringify(im.only))}"${matches(im.only, selected) ? "" : " hidden"}` : ""}>
                  <img loading="lazy" src="${esc(img(im.url, 160))}" alt="${esc(im.altText || `${p.title}, photo ${i + 1}`)}">
                </button>`).join("")}
            </div>` : ""}
        </div>
        <div class="product-info">
          <h1>${esc(p.title)}</h1>
          <p class="product-price" id="productPrice">${priceHtml(v)}</p>
          ${realOptions.map(o => `
            <div class="option">
              <div class="option-name">${esc(o.name)}</div>
              <div class="option-values">
                ${o.optionValues.map(val => `
                  <button class="option-value" data-option="${esc(o.name)}" data-value="${esc(val.name)}">${esc(val.name)}</button>
                `).join("")}
              </div>
            </div>`).join("")}
          <a class="button button-primary button-block${v?.availableForSale ? "" : " disabled"}" id="buyNow"
            href="${esc(v?.availableForSale ? v.checkoutUrl : "#")}">${v?.availableForSale ? "Buy now" : "Sold out"}</a>
          <p class="status small" id="productStatus"></p>
          ${soldOutHtml(p, v)}
          <div class="description">${description}</div>
        </div>
      </div>`;
  }

  // ---------- content pages ----------

  // The blocks for a content.js page. Project pages also get a way back to the projects list and,
  // at the end, a few related projects. Blog posts get the same, plus their title and date at the top.
  function pageBlocks(page, path, projectsPage = site.projectsPage || "/projects") {
    const blocks = page.blocks || [];
    if (page.post) {
      const blogPage = site.blogPage || "/blog";
      return [
        { type: "html", className: "project-back", html: `<a class="back-link" href="${esc(link(blogPage))}">← Blog</a>` },
        ...(page.post.header === false ? [] : [{ type: "postHeader", path }]),
        ...blocks,
        ...(page.post.related === false ? [] : [{ type: "posts", title: "More posts", exclude: path, limit: 3, filters: false }]),
      ];
    }
    if (!page.project) return blocks;
    return [
      { type: "html", className: "project-back", html: `<a class="back-link" href="${esc(link(projectsPage))}">← Projects</a>` },
      ...blocks,
      ...(page.project.related === false ? [] : [{ type: "projects", title: "More projects", related: path, limit: 3, filters: false }]),
    ];
  }

  // Pages every site has unless content.js defines its own with the same address.
  //   /thank-you   where the checkout sends customers after paying. Change the wording with thankYou: { title, message, printedMessage } (or html).
  //                printedMessage is shown instead of message for printed-to-order items (/thank-you/?item=printed).
  //                in site.config.js.
  function builtInPages() {
    const t = site.thankYou || {};
    const contact = site.contactEmail
      ? `<p>Any questions? Email <a href="mailto:${esc(site.contactEmail)}">${esc(site.contactEmail)}</a>.</p>`
      : `<p>Any questions? Just reply to your receipt email.</p>`;
    return {
      "thank-you": {
        title: t.title || "Thank you for your order",
        hidden: true,
        blocks: [
          { type: "text", align: "center", title: t.title || "Thank you for your order", html: t.html || `
            <p>Your payment has gone through and a receipt is on its way to your inbox.</p>
            <p class="thanks-message">${esc(t.message || "Thanks for your order, and for supporting me as an artist, it means a lot! I'll pack it up and post it within 3 working days, and you'll get an email as soon as it's on its way.")}</p>
            ${t.printedMessage ? `<p class="thanks-message" data-item="printed" hidden>${esc(t.printedMessage)}</p>` : ""}
            ${contact}` },
          { type: "buttons", align: "center", items: [{ label: "Back to the shop", href: "/shop" }] },
        ],
      },
    };
  }

  const pageWrap = (path, html) => `<div class="page page-${esc(slugify(path || "home"))}">${html}</div>`;

  return {
    esc, money, slugify, cleanTypeName, img, link, isExternal, linkAttrs,
    buildCategories, productsIn, categoryOf, menuItems, navHtml,
    productCard, renderGrid, categoryBar, listingHtml, firstVariant, priceHtml, matches, selectedOf, productHtml,
    pageBlocks, builtInPages, pageWrap,
  };
}
