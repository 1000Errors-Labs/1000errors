// Storefront app: routing, menu, content pages, product grid, product page.
// Shared by every site — edit in core/, then `npm run sync`.
// Per-site settings live in site.config.js; per-site pages (optional) live in content.js.
//
// Routes (real addresses; `npm run sync` writes a page file for each one so search engines can read them):
//   /               home page from content.js, or all products if the site has no home page
//   /shop           all products with this site's tag
//   /c/<category>   products in one category (built from each product's "productType")
//   /p/<handle>     product page
//   /<page>         a page from content.js, e.g. /about or /vj-shop/aztron
// Old "#/about" style links are redirected to "/about".

(() => {
  const SITE = window.SITE_CONFIG || {};
  const CONTENT = window.SITE_CONTENT || {};
  const PAGES = { ...createRender({ site: SITE }).builtInPages(), ...(CONTENT.pages || {}) };
  const TAG = (SITE.tag || "").trim();

  const $ = id => document.getElementById(id);
  const mainEl = $("main");
  const navEl = $("nav");

  let allProducts = null; // cached list of tagged products
  let categories = [];    // [{ slug, name, types: Set }]

  // ---------- helpers ----------

  // The site's base address, from the <base href> tag: "/" on a custom domain, "/<repo>/" on a plain
  // GitHub Pages address. Links in site.config.js / content.js are written as "/about" and resolved against it.
  const BASE = new URL(document.baseURI).pathname.replace(/[^/]*$/, "");

  // Markup helpers shared with the page builder (render.js), so pre-built pages match the live site.
  const R = createRender({ site: SITE, base: BASE });
  const { esc, money, slugify, img, link, linkAttrs, productCard, renderGrid } = R;

  // "/projects?type=lasercut" -> path "projects", query { type: "lasercut" }
  function currentPath() {
    let path = decodeURIComponent(location.pathname);
    if (path.startsWith(BASE)) path = path.slice(BASE.length);
    return path.replace(/(^|\/)index\.html$/, "").split("/").filter(Boolean).join("/");
  }
  function currentQuery() {
    return new URLSearchParams(location.search);
  }

  // Turn an old "#/about?x=1" address into "/about?x=1". Returns true if it changed anything.
  function upgradeHashAddress() {
    if (!location.hash.startsWith("#/")) return false;
    const [path, query] = location.hash.slice(2).split("?");
    history.replaceState(null, "", link("/" + path) + (query ? "?" + query : ""));
    return true;
  }

  // Pages with a `project` field in content.js are projects: they get listed by the "projects" block.
  const PROJECTS_PAGE = SITE.projectsPage || "/projects";

  function setTitle(part, description) {
    document.title = part ? `${part} | ${SITE.name}` : SITE.name;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.content = description || SITE.description || "";
  }

  // ---------- theme & chrome ----------

  function applyTheme() {
    const t = SITE.theme || {};
    const vars = {
      "--bg": t.background, "--surface": t.surface, "--text": t.text, "--muted": t.muted,
      "--accent": t.accent, "--accent-text": t.accentText, "--border": t.border,
      "--radius": t.radius, "--font-body": t.fontBody, "--font-heading": t.fontHeading,
    };
    for (const [k, v] of Object.entries(vars)) if (v) document.documentElement.style.setProperty(k, v);

    if (t.googleFonts && !document.querySelector('link[href*="fonts.googleapis.com/css2"]')) { // page files already include it
      const fontLink = document.createElement("link");
      fontLink.rel = "stylesheet";
      fontLink.href = `https://fonts.googleapis.com/css2?${t.googleFonts.split("|").map(f => "family=" + f).join("&")}&display=swap`;
      document.head.appendChild(fontLink);
    }

    $("brand").innerHTML = SITE.logo
      ? `<img src="${esc(SITE.logo)}" alt="${esc(SITE.name)}">`
      : `<span>${esc(SITE.name)}</span>`;

    const social = (SITE.social || []).map(s => `<a ${linkAttrs(s.href)}>${esc(s.label)}</a>`).join("");
    $("footer").innerHTML = `
      <div>${esc(SITE.footerText || `© ${new Date().getFullYear()} ${SITE.name}`)}</div>
      ${social ? `<div class="footer-links">${social}</div>` : ""}
      <div class="muted small">Secure checkout</div>`;

    $("navToggle").addEventListener("click", () => {
      const open = document.body.classList.toggle("nav-open");
      $("navToggle").setAttribute("aria-expanded", String(open));
    });

    // Dropdowns open on click as well as hover, so they work on touch screens.
    navEl.addEventListener("click", e => {
      const toggle = e.target.closest(".nav-parent");
      if (!toggle) return;
      e.preventDefault();
      const item = toggle.parentElement;
      navEl.querySelectorAll(".nav-item.open").forEach(x => x !== item && x.classList.remove("open"));
      item.classList.toggle("open");
    });
    document.addEventListener("click", e => {
      if (!e.target.closest(".nav")) navEl.querySelectorAll(".nav-item.open").forEach(x => x.classList.remove("open"));
    });
  }

  // ---------- data ----------

  // products.js (written by `npm run sync` from catalog/products.json) holds this site's products.
  async function loadProducts() {
    if (allProducts) return allProducts;
    allProducts = window.PRODUCTS || [];
    categories = R.buildCategories(allProducts);
    return allProducts;
  }

  const productsIn = category => R.productsIn(allProducts, category);

  // ---------- menu ----------

  function renderNav() {
    navEl.innerHTML = R.navHtml(categories, currentPath(), { onProject: !!PAGES[currentPath()]?.project, projectsPage: PROJECTS_PAGE });
  }

  // ---------- product views ----------

  // Product grids: hovering a picture zooms in close, and the close-up follows the pointer
  // (mouse/trackpad only). A sharper version is swapped in once loaded.
  function initCardZoom() {
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const ZOOM = 2.5;
    let active = null;
    const stop = () => {
      if (!active) return;
      active.classList.remove("zooming");
      active.querySelector("img").style.transform = "";
      active = null;
    };
    document.addEventListener("mousemove", e => {
      const box = e.target.closest?.(".card-img");
      const pic = box?.querySelector("img[data-zoom]");
      if (!pic) { stop(); return; }
      if (box !== active) {
        stop();
        active = box;
        box.classList.add("zooming");
        if (!pic.dataset.zoomed) {
          pic.dataset.zoomed = "1";
          const pre = new Image();
          pre.onload = () => { pic.src = pic.dataset.zoom; };
          pre.src = pic.dataset.zoom;
        }
        pic.style.transform = `scale(${ZOOM})`;
      }
      const r = box.getBoundingClientRect();
      pic.style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`;
    });
    document.addEventListener("mouseleave", stop);
    window.addEventListener("blur", stop);
  }

  async function showListing(categorySlug, { isHome = false } = {}) {
    showLoading();
    const products = await loadProducts();
    renderNav();
    const category = categories.find(c => c.slug === categorySlug);
    if (categorySlug && !category) return showNotFound();

    setTitle(category ? category.name : isHome ? "" : "Shop");
    mainEl.innerHTML = R.listingHtml(products, categories, category, { isHome });
  }

  async function showProduct(handle) {
    showLoading();
    const p = (await loadProducts()).find(x => x.handle === handle);
    renderNav();
    if (!p) return showNotFound();

    setTitle(p.title);
    const variants = p.variants.nodes;
    const images = p.images.nodes;
    const selected = R.selectedOf(R.firstVariant(p));

    mainEl.innerHTML = R.productHtml(p, categories);
    Blocks.mountSignups(mainEl, blockContext);

    const mainImage = $("mainImage");
    const galleryMain = mainEl.querySelector(".gallery-main");
    let selectedUrl = (images.find(im => R.matches(im.only, selected)) || images[0])?.url; // the photo chosen by click (or by the selected variant)
    let shownUrl = selectedUrl;       // the photo currently in the main image (may be a thumbnail preview)

    const display = url => {
      if (!mainImage || !url) return;
      shownUrl = url;
      mainImage.src = img(url, 1200);
    };
    const showImage = url => {
      if (!url) return;
      selectedUrl = url;
      display(url);
      mainEl.querySelectorAll(".thumb").forEach(t => t.classList.toggle("active", t.dataset.src === url));
    };
    mainEl.querySelectorAll(".thumb").forEach(t => t.addEventListener("click", () => showImage(t.dataset.src)));

    // Hover the main photo to zoom (mouse/trackpad only): it magnifies and follows the pointer.
    // Thumbnails don't zoom; clicking one makes it the main photo.
    // A larger version is swapped in once loaded, so the close-up stays sharp.
    if (mainImage && matchMedia("(hover: hover) and (pointer: fine)").matches) {
      const ZOOM = 2.5;
      galleryMain.classList.add("zoomable");

      const zoomIn = () => {
        const url = shownUrl;
        const big = img(url, 2400);
        if (mainImage.src !== big) {
          const pre = new Image();
          pre.onload = () => { if (shownUrl === url) mainImage.src = big; };
          pre.src = big;
        }
        galleryMain.classList.add("zooming");
        mainImage.style.transform = `scale(${ZOOM})`;
      };
      const zoomOut = () => {
        galleryMain.classList.remove("zooming");
        mainImage.style.transform = "";
      };
      // Point the close-up at the same relative position as the pointer within `el`.
      const aim = (el, e) => {
        const r = el.getBoundingClientRect();
        const x = Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100));
        const y = Math.min(100, Math.max(0, ((e.clientY - r.top) / r.height) * 100));
        mainImage.style.transformOrigin = `${x}% ${y}%`;
      };

      galleryMain.addEventListener("mouseenter", e => { aim(galleryMain, e); zoomIn(); });
      galleryMain.addEventListener("mousemove", e => aim(galleryMain, e));
      galleryMain.addEventListener("mouseleave", zoomOut);
    }

    const currentVariant = () =>
      variants.find(v => v.selectedOptions.every(o => selected[o.name] === o.value));

    const buyBtn = $("buyNow");
    const statusEl = $("productStatus");

    function refresh() {
      const v = currentVariant();
      mainEl.querySelectorAll(".option-value").forEach(b => {
        b.classList.toggle("active", selected[b.dataset.option] === b.dataset.value);
        // Grey out values that have no in-stock variant given the other selections.
        const trial = { ...selected, [b.dataset.option]: b.dataset.value };
        const match = variants.find(x => x.selectedOptions.every(o => trial[o.name] === o.value));
        b.classList.toggle("unavailable", !match || !match.availableForSale);
      });
      // Photos and description parts that belong to one choice (e.g. a Style) follow the selection.
      mainEl.querySelectorAll("[data-only]").forEach(el => { el.hidden = !R.matches(JSON.parse(el.dataset.only), selected); });
      const visibleThumbs = [...mainEl.querySelectorAll(".thumb:not([hidden])")];
      if (visibleThumbs.length && !visibleThumbs.some(t => t.dataset.src === selectedUrl)) showImage(visibleThumbs[0].dataset.src);
      if (!v) {
        $("productPrice").textContent = "";
        setBuy(null, "Unavailable");
        return;
      }
      $("productPrice").innerHTML = R.priceHtml(v);
      setBuy(v.availableForSale ? v.checkoutUrl : null, v.availableForSale ? "Buy now" : "Sold out");
      if ($("soldOutBox")) $("soldOutBox").hidden = v.availableForSale;
      if (v.image) showImage(v.image.url);
    }

    mainEl.querySelectorAll(".option-value").forEach(b => b.addEventListener("click", () => {
      selected[b.dataset.option] = b.dataset.value;
      statusEl.textContent = "";
      refresh();
    }));

    // "Buy now" goes straight to the secure checkout page for the chosen size/colour.
    function setBuy(url, label) {
      buyBtn.textContent = label;
      buyBtn.href = url || "#";
      buyBtn.classList.toggle("disabled", !url);
    }
    buyBtn.addEventListener("click", e => { if (buyBtn.classList.contains("disabled")) e.preventDefault(); });

    refresh();
  }

  // ---------- content pages ----------

  // Helpers handed to content blocks (see blocks.js).
  const blockContext = {
    site: SITE, pages: PAGES, esc, money, img, link, linkAttrs, slugify, renderGrid, productCard,
    path: currentPath,
    query: currentQuery,
    // Update "?type=…" style options in the address without reloading the page.
    setQuery(params) {
      const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
      history.replaceState(null, "", link("/" + currentPath()) + (qs ? "?" + qs : ""));
    },
    async products() { await loadProducts(); return allProducts; },
    async categories() { await loadProducts(); return categories.map(c => ({ ...c, products: productsIn(c) })); },
    async category(name) {
      await loadProducts();
      const c = categories.find(x => x.name.toLowerCase() === String(name).toLowerCase() || x.slug === slugify(name));
      return c ? { ...c, products: productsIn(c) } : null;
    },
  };

  async function showPage(page) {
    setTitle(page.title, page.description);
    showLoading();
    loadProducts().then(renderNav).catch(() => {});
    const blocks = R.pageBlocks(page, currentPath(), PROJECTS_PAGE);
    const html = await Blocks.render(blocks, blockContext);
    mainEl.innerHTML = R.pageWrap(currentPath(), html);
    Blocks.mount(mainEl, blockContext);
  }

  // Page files written by `npm run sync` already contain this page's text (for search engines and a fast first paint).
  // Keep it on screen while the live version loads, instead of flashing "Loading…".
  function showLoading() {
    if (mainEl.dataset.prerendered === currentPath()) return;
    mainEl.innerHTML = `<p class="muted loading">Loading…</p>`;
  }

  function showNotFound() {
    setTitle("Not found");
    mainEl.innerHTML = `<section class="page-head"><h1>Not found</h1><p class="muted">That page doesn't exist. <a href="${esc(BASE)}">Back to the home page</a></p></section>`;
  }

  function showError(err) {
    console.error(err);
    mainEl.innerHTML = `
      <section class="page-head">
        <h1>Something went wrong</h1>
        <p class="muted">Couldn't load this page. Please try again shortly.</p>
        <pre class="error">${esc(err.message)}</pre>
      </section>`;
  }

  // ---------- router ----------

  async function route() {
    document.body.classList.remove("nav-open");
    navEl.querySelectorAll(".nav-item.open").forEach(x => x.classList.remove("open"));
    const path = currentPath();
    const [first, second] = path.split("/");
    renderNav();
    try {
      if (first === "p" && window.PRODUCT_REDIRECTS?.[second]) location.replace(link("/p/" + window.PRODUCT_REDIRECTS[second]));
      else if (first === "p" && second) await showProduct(second);
      else if (first === "c" && second) await showListing(second);
      else if (first === "shop" && !PAGES.shop) await showListing("");
      else if (!path && CONTENT.home) await showPage({ title: "", description: SITE.description, blocks: CONTENT.home });
      else if (!path) await showListing("", { isHome: true });
      else if (PAGES[path]?.project?.href && !PAGES[path].blocks) location.replace(PAGES[path].project.href); // moved to another site
      else if (PAGES[path]) await showPage(PAGES[path]);
      else showNotFound();
      if (!location.hash) window.scrollTo(0, 0);
    } catch (err) {
      showError(err);
    }
    delete mainEl.dataset.prerendered;
  }

  // Follow links inside the site without reloading the page.
  function initLinks() {
    document.addEventListener("click", e => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if ((a.target && a.target !== "_self") || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || !url.pathname.startsWith(BASE)) return;
      if (/\.[a-z0-9]{2,5}$/i.test(url.pathname) && !url.pathname.endsWith(".html")) return; // images, sitemap.xml, …
      if (url.pathname === location.pathname && url.search === location.search && url.hash) return; // same-page anchor
      e.preventDefault();
      if (url.href !== location.href) history.pushState(null, "", url.pathname + url.search + url.hash);
      route();
    });
    window.addEventListener("popstate", route);
    window.addEventListener("hashchange", () => { if (upgradeHashAddress()) route(); });
  }

  // ---------- mailing list pop-up ----------

  // Offers a sign-up (e.g. 10% off the first order) once, after a delay. Not shown again for `againAfterDays`
  // once closed, and never after someone has joined. Set up with mailingList.popup in site.config.js.
  function initPopup() {
    const ml = SITE.mailingList || {};
    const cfg = ml.popup;
    if (!ml.mailchimpUrl || !cfg) return;
    const get = k => { try { return localStorage.getItem(k); } catch { return null; } };
    const set = (k, v) => { try { localStorage.setItem(k, v); } catch {} };
    if (get("mailingListJoined")) return;
    const closedAt = Number(get("mailingListPopupClosed") || 0);
    if (Date.now() - closedAt < (cfg.againAfterDays ?? 30) * 864e5) return;

    setTimeout(() => {
      if (get("mailingListJoined")) return;
      const code = cfg.discountCode;
      const success = code
        ? `Welcome! Your code is <strong class="popup-code">${esc(code)}</strong>. Use it at checkout.`
        : "Thanks, you're on the list.";
      const box = document.createElement("div");
      box.className = "popup-backdrop";
      box.innerHTML = `
        <div class="popup" role="dialog" aria-modal="true" aria-labelledby="popupTitle">
          <button class="popup-close" aria-label="Close">×</button>
          <h2 id="popupTitle">${esc(cfg.title || "Join the mailing list")}</h2>
          ${cfg.text ? `<p class="muted">${esc(cfg.text)}</p>` : ""}
          ${Blocks.signupForm(blockContext, { button: cfg.button || "Sign up", tags: ml.tags?.popup || "", success })}
        </div>`;
      document.body.appendChild(box);
      Blocks.mountSignups(box, blockContext);
      const close = () => {
        if (!get("mailingListJoined")) set("mailingListPopupClosed", String(Date.now()));
        box.remove();
        document.removeEventListener("keydown", onKey);
      };
      const onKey = e => { if (e.key === "Escape") close(); };
      box.querySelector(".popup-close").addEventListener("click", close);
      box.addEventListener("click", e => { if (e.target === box) close(); });
      document.addEventListener("keydown", onKey);
      box.querySelector("input").focus({ preventScroll: true });
    }, (cfg.delaySeconds ?? 20) * 1000);
  }

  if (!TAG) {
    mainEl.innerHTML = `<pre class="error">No "tag" set in site.config.js</pre>`;
    return;
  }
  upgradeHashAddress();
  applyTheme();
  initCardZoom();
  initLinks();
  initPopup();
  route();
})();
