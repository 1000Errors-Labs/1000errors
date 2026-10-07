// Content blocks for pages in a site's content.js. Shared by every site — edit in core/, then `npm run sync`.
//
// A page is a list of blocks, e.g.
//   { type: "text", title: "About", html: "<p>Hello</p>" }
//
// Block types (every block also accepts `id` and `className`):
//   hero        title, text, image, logo, buttons, align ("left"|"center"), height ("full"|"tall"|"short"|"image"), ratio (with height "image", e.g. "1600 / 470")
//   text        title, html, align
//   split       title, html, image, imageAlt, reverse, buttons
//   tiles       title, text, items: [{ title, text, image, imageAlt, href, label }], columns
//   videos      title, text, items: [{ title, url, text, href, label, buttons }], columns
//   video       url, title, text                       (a single full-width video)
//   gallery     title, items: [{ src, alt, caption }] or ["src", ...], columns
//   features    title, items: ["...", ...]
//   buttons     items: [{ label, href, style: "primary"|"outline" }], align
//   products    title, category, limit, href, label, skipCategoryTiles, realPhotos, replace
//               skipCategoryTiles: true leaves out products whose photo is on a "categories" tile, so the two don't repeat.
//               realPhotos: true leaves out products whose main photo is a mockup (marked mockup in the catalogue).
//               replace: { "product-handle": "other-product-handle" } shows the second product in the first one's place.
//   categories  title                                  (one tile per shop category)
//   contact     title, text                            (form emailed to SITE_CONFIG.contactEmail; ?piece=… pre-fills the message)
//   signup      title, text, button, tags              (mailing list sign-up, see mailingList in site.config.js)
//   projects    title, text, filters, columns, limit, only, related, under
//               A filterable grid of every page that has a `project` field, e.g.
//                 "wedding-archway": { title: "Wedding Archway",
//                   project: { types: ["Lasercut", "Commissions"], summary: "…", image: "assets/…", imageAlt: "…", year: 2019, order: 1 },
//                   blocks: [ … ] }
//               filters: the order of the filter buttons (types not listed come after), or false to hide them.
//               only: show just one type, e.g. "Lasercut". related: a page path, shows projects sharing its types.
//               under: a page path, shows just the projects whose address starts with it, e.g. "animation" for animation/….
//               A project that lives on another website: give it href (and site, the other site's name) and no blocks.
//               Its card links there instead, and its address here just forwards visitors on. siteNote: a line
//               under the card explaining the other site, e.g.
//                 "wedding-archway": { title: "Wedding Archway",
//                   project: { types: [ … ], summary: "…", image: "assets/…", href: "https://…", site: "Parabolic Arts" } }
//   posts       title, text, filters, columns, limit, exclude
//               Blog posts: every page that has a `post` field, newest first, e.g.
//                 "blog/new-website": { title: "A new website",
//                   post: { date: "2026-10-03", summary: "…", image: "assets/…", tags: ["News"] },
//                   blocks: [ … ] }
//               filters: the order of the tag filter buttons, or false to hide them. exclude: a page path to leave out.
//   divider
//   html        html                                   (raw HTML, anything goes)
//
// Sites can add their own block types in custom.js:
//   Blocks.register("myBlock", (block, ctx) => `<section>…</section>`);

const Blocks = (() => {
  const types = {};
  const mounts = [];

  function register(name, renderFn, mountFn) {
    types[name] = renderFn;
    if (mountFn) mounts.push(mountFn);
  }

  async function render(blocks, ctx) {
    const parts = await Promise.all(blocks.map(async block => {
      const fn = types[block.type];
      if (!fn) return `<!-- unknown block type "${ctx.esc(block.type)}" -->`;
      try {
        const html = await fn(block, ctx);
        const cls = `block block-${ctx.esc(block.type)}${block.className ? " " + ctx.esc(block.className) : ""}`;
        return `<section class="${cls}"${block.id ? ` id="${ctx.esc(block.id)}"` : ""}>${html}</section>`;
      } catch (err) {
        console.error(err);
        return `<section class="block"><p class="muted">Couldn't load this section.</p></section>`;
      }
    }));
    return parts.join("");
  }

  // Wire up interactive bits (lightbox, forms) after the HTML is on the page.
  function mount(root, ctx) {
    mounts.forEach(fn => fn(root, ctx));
  }

  // ---------- shared bits ----------

  const heading = (title, ctx, text) =>
    (title ? `<h2 class="block-title">${ctx.esc(title)}</h2>` : "") +
    (text ? `<p class="block-intro">${ctx.esc(text)}</p>` : "");

  const buttons = (items, ctx, align) => !items?.length ? "" : `
    <div class="buttons ${align === "center" ? "center" : ""}">
      ${items.map(b => `<a class="button ${b.style === "outline" ? "" : "button-primary"}" ${ctx.linkAttrs(b.href)}>${ctx.esc(b.label)}</a>`).join("")}
    </div>`;

  const cols = n => (n ? ` style="--cols:${Number(n)}"` : "");

  // Turn Vimeo / YouTube page links into embeddable player URLs.
  function embedUrl(url) {
    const u = String(url || "").replace(/&amp;/g, "&");
    let m = u.match(/vimeo\.com\/(?:video\/)?(\d+)(?:\/([0-9a-f]+))?/);
    if (m && !u.includes("player.vimeo.com")) return `https://player.vimeo.com/video/${m[1]}${m[2] ? "?h=" + m[2] : ""}`;
    if (u.includes("player.vimeo.com")) {
      const [base, query = ""] = u.split("?");
      const h = new URLSearchParams(query).get("h");
      return base + (h ? "?h=" + h : "");
    }
    m = u.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
    if (m) return `https://www.youtube-nocookie.com/embed/${m[1]}`;
    return u;
  }

  const videoFrame = (url, title, ctx) => `
    <div class="video-frame">
      <iframe src="${ctx.esc(embedUrl(url))}" title="${ctx.esc(title || "Video")}" loading="lazy"
        allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>
    </div>`;

  // ---------- block types ----------

  register("hero", (b, ctx) => `
    <div class="hero-block hero-${ctx.esc(b.height || "tall")} ${b.align === "left" ? "" : "center"}"
      ${b.image ? `style="--hero-image:url('${ctx.esc(b.image)}')${b.ratio ? `;--hero-ratio:${ctx.esc(b.ratio)}` : ""}"` : ""}>
      <div class="hero-block-inner">
        ${b.logo ? `<img class="hero-logo" src="${ctx.esc(b.logo)}" alt="${ctx.esc(b.title || ctx.site.name)}">` : ""}
        ${b.title ? `<h1>${ctx.esc(b.title)}</h1>` : ""}
        ${b.text ? `<p>${ctx.esc(b.text)}</p>` : ""}
        ${buttons(b.buttons, ctx, b.align === "left" ? "" : "center")}
      </div>
    </div>`);

  register("text", (b, ctx) => `
    <div class="prose ${b.align === "center" ? "center" : ""}">
      ${b.title ? `<h1>${ctx.esc(b.title)}</h1>` : ""}
      ${b.meta?.length ? `<div class="project-types project-meta">${b.meta.map(m => `<span>${ctx.esc(m)}</span>`).join("")}</div>` : ""}
      ${b.html || ""}
    </div>`);

  register("split", (b, ctx) => `
    <div class="split ${b.reverse ? "reverse" : ""}">
      <div class="split-media">${b.image ? `<img loading="lazy" src="${ctx.esc(b.image)}" alt="${ctx.esc(b.imageAlt || "")}">` : ""}</div>
      <div class="split-text prose">
        ${b.title ? `<h2>${ctx.esc(b.title)}</h2>` : ""}
        ${b.html || ""}
        ${buttons(b.buttons, ctx)}
      </div>
    </div>`);

  register("tiles", (b, ctx) => `
    ${heading(b.title, ctx, b.text)}
    <div class="tiles"${cols(b.columns)}>
      ${b.items.map(t => `
        <a class="tile" ${ctx.linkAttrs(t.href)}>
          ${t.image ? `<img loading="lazy" src="${ctx.esc(t.image)}" alt="${ctx.esc(t.imageAlt || t.title || "")}">` : ""}
          <span class="tile-text">
            <span class="tile-title">${ctx.esc(t.title)}</span>
            ${t.text ? `<span class="tile-sub">${ctx.esc(t.text)}</span>` : ""}
            ${t.label ? `<span class="tile-cta">${ctx.esc(t.label)} →</span>` : ""}
          </span>
        </a>`).join("")}
    </div>`);

  register("videos", (b, ctx) => `
    ${heading(b.title, ctx, b.text)}
    <div class="videos"${cols(b.columns)}>
      ${b.items.map(v => `
        <article class="video-card">
          ${videoFrame(v.url, v.title, ctx)}
          ${v.title || v.text || v.href || v.buttons ? `
            <div class="video-card-body">
              ${v.title ? `<h3>${v.href ? `<a ${ctx.linkAttrs(v.href)}>${ctx.esc(v.title)}</a>` : ctx.esc(v.title)}</h3>` : ""}
              ${v.text ? `<p class="muted">${ctx.esc(v.text)}</p>` : ""}
              ${v.href && v.label ? `<a class="text-link" ${ctx.linkAttrs(v.href)}>${ctx.esc(v.label)} →</a>` : ""}
              ${buttons(v.buttons, ctx)}
            </div>` : ""}
        </article>`).join("")}
    </div>`);

  register("video", (b, ctx) => `
    ${heading(b.title, ctx)}
    ${videoFrame(b.url, b.title, ctx)}
    ${b.text ? `<p class="video-caption muted">${ctx.esc(b.text)}</p>` : ""}`);

  register("gallery", (b, ctx) => `
    ${heading(b.title, ctx, b.text)}
    <div class="gallery-grid"${cols(b.columns)}>
      ${b.items.map(raw => {
        const g = typeof raw === "string" ? { src: raw } : raw;
        return `
          <figure>
            <button class="lightbox-open" data-src="${ctx.esc(g.src)}" aria-label="View larger">
              <img loading="lazy" src="${ctx.esc(g.src)}" alt="${ctx.esc(g.alt || g.caption || "")}">
            </button>
            ${g.caption ? `<figcaption>${ctx.esc(g.caption)}</figcaption>` : ""}
          </figure>`;
      }).join("")}
    </div>`,
  root => {
    root.querySelectorAll(".gallery-grid").forEach(grid => {
      const btns = [...grid.querySelectorAll(".lightbox-open")];
      const items = btns.map(btn => ({ src: btn.dataset.src, alt: btn.querySelector("img")?.alt || "" }));
      btns.forEach((btn, i) => btn.addEventListener("click", () => lightbox(items, i)));
    });
  });

  register("features", (b, ctx) => `
    ${heading(b.title, ctx)}
    <ul class="features">${b.items.map(i => `<li>${ctx.esc(i)}</li>`).join("")}</ul>`);

  register("buttons", (b, ctx) => buttons(b.items, ctx, b.align));

  // The product whose photo represents a category on a "categories" tile: the first with a real photo (marked own in
  // the catalogue) rather than a mockup, else the first with any photo.
  const tileProduct = products => products.find(p => p.featuredImage?.own) || products.find(p => p.featuredImage);

  register("products", async (b, ctx) => {
    let list = await ctx.products();
    if (b.skipCategoryTiles) {
      const onTiles = new Set((await ctx.categories()).map(c => tileProduct(c.products)?.handle));
      list = list.filter(p => !onTiles.has(p.handle));
    }
    if (b.realPhotos) list = list.filter(p => p.featuredImage && !p.featuredImage.mockup);
    let href = b.href || "/shop";
    if (b.category) {
      const c = await ctx.category(b.category);
      list = c ? c.products : [];
      if (c && !b.href) href = `/c/${c.slug}`;
    }
    if (b.limit) list = list.slice(0, b.limit);
    if (b.replace) {
      const all = await ctx.products();
      list = list.map(p => all.find(x => x.handle === b.replace[p.handle]) || p);
    }
    return `
      ${heading(b.title, ctx, b.text)}
      ${ctx.renderGrid(list)}
      ${b.label ? buttons([{ label: b.label, href, style: "outline" }], ctx, "center") : ""}`;
  });

  register("categories", async (b, ctx) => {
    const cats = await ctx.categories();
    return `
      ${heading(b.title, ctx, b.text)}
      <div class="tiles tiles-square"${cols(b.columns)}>
        ${cats.map(c => {
          const image = tileProduct(c.products)?.featuredImage;
          return `
            <a class="tile" href="${ctx.esc(ctx.link("/c/" + c.slug))}">
              ${image ? `<img loading="lazy" src="${ctx.esc(ctx.img(image.url, 700))}" alt="${ctx.esc(image.altText || c.name)}">` : ""}
              <span class="tile-text"><span class="tile-title">${ctx.esc(c.name)}</span></span>
            </a>`;
        }).join("")}
      </div>`;
  });

  register("contact", (b, ctx) => `
    <div class="prose">
      ${b.title ? `<h1>${ctx.esc(b.title)}</h1>` : ""}
      ${b.text ? `<p>${ctx.esc(b.text)}</p>` : ""}
    </div>
    <form class="contact-form" novalidate>
      <div class="field-row">
        <label>Name<input name="name" autocomplete="name" required></label>
        <label>Email<input name="email" type="email" autocomplete="email" required></label>
      </div>
      <label>Phone (optional)<input name="phone" type="tel" autocomplete="tel"></label>
      <label>Message<textarea name="message" rows="6" required></textarea></label>
      <input type="text" name="_honey" class="honeypot" tabindex="-1" autocomplete="off" aria-hidden="true">
      <button class="button button-primary" type="submit">Send</button>
      <p class="form-status small" role="status"></p>
    </form>`,
  (root, ctx) => {
    root.querySelectorAll(".contact-form").forEach(form => form.addEventListener("submit", async e => {
      e.preventDefault();
      const status = form.querySelector(".form-status");
      if (!form.checkValidity()) { status.textContent = "Please fill in your name, email and message."; return; }
      const email = ctx.site.contactEmail;
      if (!email) { status.textContent = "The contact form isn't set up yet (contactEmail in site.config.js)."; return; }
      const data = Object.fromEntries(new FormData(form));
      if (data._honey) return;
      data._subject = `New message from ${ctx.site.name} website`;
      status.textContent = "Sending…";
      try {
        const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(email)}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(res.statusText);
        form.reset();
        status.textContent = "Thanks — your message has been sent.";
        window.umami?.track("Contact form sent", { page: location.pathname });
      } catch {
        status.innerHTML = `Sorry, that didn't send. Please email <a href="mailto:${ctx.esc(email)}">${ctx.esc(email)}</a>.`;
      }
    }));
    // "Commission one like this" links arrive as /contact?piece=<product name>.
    const piece = ctx.query?.().get("piece");
    root.querySelectorAll(".contact-form textarea[name=message]").forEach(t => {
      if (piece && !t.value) t.value = `Hi, I'd like to commission a piece like "${piece}".\n\n`;
    });
  });

  // The thank-you page: /thank-you/?item=printed swaps in the printed-to-order message (see render.js builtInPages).
  mounts.push((root, ctx) => {
    const item = ctx.query?.().get("item");
    const messages = root.querySelectorAll(".thanks-message");
    if (!item || !root.querySelector(`.thanks-message[data-item="${CSS.escape(item)}"]`)) return;
    messages.forEach(m => { m.hidden = m.dataset.item !== item; });
  });

  // ---------- mailing list (Mailchimp) ----------

  // Adds an email to the Mailchimp audience in SITE_CONFIG.mailingList.mailchimpUrl (the embedded form's
  // action URL). Mailchimp's JSONP endpoint is used, so no API key is needed. Resolves to
  // { ok, message }; "already subscribed" counts as ok.
  function subscribe(site, email, { product, tags } = {}) {
    const ml = site.mailingList || {};
    if (!ml.mailchimpUrl) return Promise.resolve({ ok: false, message: "The mailing list isn't set up yet." });
    return new Promise(resolve => {
      const cb = "mc_cb_" + Math.random().toString(36).slice(2);
      const url = new URL(ml.mailchimpUrl.replace("/subscribe/post?", "/subscribe/post-json?"));
      url.searchParams.set("EMAIL", email);
      if (product && ml.productField) url.searchParams.set(ml.productField, product);
      if (tags) url.searchParams.set("tags", tags);
      url.searchParams.set("c", cb);
      const script = document.createElement("script");
      const done = result => { delete window[cb]; script.remove(); clearTimeout(timer); resolve(result); };
      const timer = setTimeout(() => done({ ok: false, message: "That didn't go through. Please try again." }), 10000);
      window[cb] = r => {
        const msg = String(r?.msg || "").replace(/<[^>]+>/g, "").replace(/^\d+ - /, "");
        if (r?.result === "success") done({ ok: true, message: msg });
        else if (/already subscribed/i.test(msg)) done({ ok: true, message: "You're already on the list." });
        else done({ ok: false, message: msg || "That didn't go through. Please try again." });
      };
      script.onerror = () => done({ ok: false, message: "That didn't go through. Please try again." });
      script.src = url.href;
      document.head.appendChild(script);
    });
  }

  // An email + button form. Wired up by mountSignups(); `product` and `tags` ride along to Mailchimp.
  const signupForm = (ctx, { button = "Sign up", product = "", tags = "", success = "" } = {}) => `
    <form class="signup-form" novalidate data-product="${ctx.esc(product)}" data-tags="${ctx.esc(tags)}" data-success="${ctx.esc(success)}">
      <input name="email" type="email" autocomplete="email" placeholder="Your email" aria-label="Your email" required>
      <button class="button button-primary" type="submit">${ctx.esc(button)}</button>
      <p class="form-status small" role="status"></p>
    </form>`;

  function mountSignups(root, ctx) {
    root.querySelectorAll(".signup-form:not([data-ready])").forEach(form => {
      form.dataset.ready = "1";
      form.addEventListener("submit", async e => {
        e.preventDefault();
        const status = form.querySelector(".form-status");
        if (!form.checkValidity()) { status.textContent = "Please enter your email address."; return; }
        const btn = form.querySelector("button");
        btn.disabled = true;
        status.textContent = "Signing you up…";
        const r = await subscribe(ctx.site, form.email.value.trim(), { product: form.dataset.product, tags: form.dataset.tags });
        btn.disabled = false;
        if (!r.ok) { status.textContent = r.message; return; }
        try { localStorage.setItem("mailingListJoined", "1"); } catch {}
        form.classList.add("done");
        status.innerHTML = form.dataset.success || ctx.esc(r.message || "Thanks, you're on the list.");
        form.dispatchEvent(new CustomEvent("subscribed", { bubbles: true }));
      });
    });
  }

  register("signup", (b, ctx) => `
    <div class="prose">
      ${b.title ? `<h2 class="block-title">${ctx.esc(b.title)}</h2>` : ""}
      ${b.text ? `<p>${ctx.esc(b.text)}</p>` : ""}
    </div>
    ${signupForm(ctx, { button: b.button || "Sign up", tags: b.tags || ctx.site.mailingList?.tags?.signup || "" })}`,
  mountSignups);

  // ---------- projects ----------

  // The first image found on a page, used when a project doesn't name a card image.
  function firstImage(blocks = []) {
    for (const b of blocks) {
      const found = b.image || b.items?.map(i => (typeof i === "string" ? i : i.src || i.image)).find(Boolean);
      if (found && !/^https?:\/\/(player\.)?vimeo|youtube|sketchfab/.test(found)) return found;
    }
    return "";
  }

  function allProjects(ctx) {
    return Object.entries(ctx.pages)
      .filter(([, page]) => page.project)
      .map(([path, page], order) => ({
        path, order,
        title: page.project.title || page.title,
        summary: page.project.summary || page.description || "",
        types: page.project.types || [],
        year: page.project.year || "",
        image: page.project.image || firstImage(page.blocks),
        imageAlt: page.project.imageAlt || "",
        rank: page.project.order ?? 1000 + order,
        href: page.project.href || "",
        site: page.project.site || "",
        siteNote: page.project.siteNote || "",
      }))
      // `order: 1, 2, 3…` puts projects first; the rest follow in the order they appear in content.js.
      .sort((a, b) => a.rank - b.rank);
  }

  register("projects", (b, ctx) => {
    let list = allProjects(ctx);

    if (b.related) {
      const me = list.find(p => p.path === b.related);
      const shared = p => p.types.filter(t => me?.types.includes(t)).length;
      list = list.filter(p => p.path !== b.related)
        .map(p => ({ ...p, score: shared(p) }))
        .sort((x, y) => y.score - x.score || x.rank - y.rank);
    }
    if (b.only) list = list.filter(p => p.types.some(t => ctx.slugify(t) === ctx.slugify(b.only)));
    if (b.under) list = list.filter(p => p.path.startsWith(b.under.replace(/^\/|\/$/g, "") + "/"));
    // Related projects: build in a few spares (hidden), so the page script can swap out ones already viewed.
    const show = b.related && b.limit ? b.limit : 0;
    if (b.limit) list = list.slice(0, show ? b.limit + 7 : b.limit);
    if (!list.length) return "";

    // Filter buttons: the order given in `filters`, then any other types alphabetically.
    const used = [...new Set(list.flatMap(p => p.types))];
    const ordered = Array.isArray(b.filters) ? b.filters.filter(t => used.includes(t)) : [];
    const types = [...ordered, ...used.filter(t => !ordered.includes(t)).sort()];
    const showFilters = b.filters !== false && !b.only && !b.related && types.length > 1;

    return `
      ${heading(b.title, ctx, b.text)}
      ${showFilters ? `
        <nav class="filter-pills" aria-label="Filter projects">
          <button type="button" class="active" data-filter="">All</button>
          ${types.map(t => `<button type="button" data-filter="${ctx.esc(ctx.slugify(t))}">${ctx.esc(t)}</button>`).join("")}
        </nav>` : ""}
      <div class="projects"${cols(b.columns)}${show ? ` data-show="${show}"` : ""}>
        ${list.map((p, i) => `
          <a class="project-card${p.href ? " project-external" : ""}" ${p.href ? `${ctx.linkAttrs(p.href)} data-site="${ctx.esc(p.site)}" data-site-note="${ctx.esc(p.siteNote)}"` : `href="${ctx.esc(ctx.link("/" + p.path))}"`} data-path="${ctx.esc(p.path)}" data-types="${ctx.esc(p.types.map(ctx.slugify).join(" "))}"${show && i >= show ? " hidden" : ""}>
            <div class="project-img">${p.image ? `<img loading="lazy" src="${ctx.esc(p.image)}" alt="${ctx.esc(p.imageAlt || p.title)}">` : ""}</div>
            <div class="project-body">
              <h3>${ctx.esc(p.title)}</h3>
              ${p.summary ? `<p class="muted">${ctx.esc(p.summary)}</p>` : ""}
              <div class="project-types">
                ${p.year ? `<span>${ctx.esc(p.year)}</span>` : ""}
                ${p.types.map(t => `<span>${ctx.esc(t)}</span>`).join("")}
              </div>
            </div>
          </a>`).join("")}
      </div>
      ${showFilters ? `<p class="muted empty" hidden>No projects of this type yet.</p>` : ""}`;
  },
  (root, ctx) => {
    // "More projects": remember project pages viewed in this tab, and suggest ones not seen yet
    // (most shared types first). Once everything's been seen, the top picks show as normal.
    let seen = [];
    try { seen = JSON.parse(sessionStorage.getItem("seenProjects")) || []; } catch {}
    const here = ctx.path();
    if (ctx.pages[here]?.project && !seen.includes(here)) {
      seen.push(here);
      try { sessionStorage.setItem("seenProjects", JSON.stringify(seen)); } catch {}
    }
    root.querySelectorAll(".projects[data-show]").forEach(grid => {
      const cards = [...grid.querySelectorAll(".project-card")];
      const picks = [...cards.filter(c => !seen.includes(c.dataset.path)), ...cards.filter(c => seen.includes(c.dataset.path))]
        .slice(0, Number(grid.dataset.show));
      cards.forEach(c => { c.hidden = !picks.includes(c); });
      picks.forEach(c => grid.appendChild(c)); // keep them in ranked order
    });

    // Cards for projects on another website: explain where the link goes before leaving this site.
    root.querySelectorAll(".project-external").forEach(card => card.addEventListener("click", e => {
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return; // opening in a new tab on purpose
      e.preventDefault();
      const site = card.dataset.site || "my sister site";
      const title = card.querySelector("h3")?.textContent || "This project";
      const photo = card.querySelector(".project-img img");
      const box = document.createElement("div");
      box.className = "popup-backdrop";
      box.innerHTML = `
        <div class="popup popup-sister" role="dialog" aria-modal="true" aria-labelledby="sisterTitle">
          <button class="popup-close" aria-label="Close">×</button>
          ${photo ? `<img class="popup-photo" src="${ctx.esc(photo.getAttribute("src"))}" alt="">` : ""}
          <h2 id="sisterTitle">${ctx.esc(title)} is on ${ctx.esc(site)}</h2>
          ${card.dataset.siteNote ? `<p>${ctx.esc(card.dataset.siteNote)}</p>` : ""}
          <p class="muted">The full project, with photos and the story behind it, opens there in a new tab.</p>
          <div class="buttons">
            <a class="button button-primary" href="${ctx.esc(card.href)}" target="_blank" rel="noopener">Continue to ${ctx.esc(site)} ↗</a>
          </div>
        </div>`;
      document.body.appendChild(box);
      const close = () => { box.remove(); document.removeEventListener("keydown", onKey); card.focus({ preventScroll: true }); };
      const onKey = ev => { if (ev.key === "Escape") close(); };
      box.querySelectorAll(".popup-close").forEach(b => b.addEventListener("click", close));
      box.querySelector(".button-primary").addEventListener("click", close);
      box.addEventListener("click", ev => { if (ev.target === box) close(); });
      document.addEventListener("keydown", onKey);
      box.querySelector(".button-primary").focus({ preventScroll: true });
    }));

    root.querySelectorAll(".block-projects, .block-posts").forEach(section => { // posts share the same filter buttons
      const pills = section.querySelectorAll(".filter-pills button");
      if (!pills.length) return;
      const cards = section.querySelectorAll(".project-card");
      const apply = (filter, updateAddress) => {
        if (![...pills].some(p => p.dataset.filter === filter)) filter = "";
        pills.forEach(p => p.classList.toggle("active", p.dataset.filter === filter));
        let shown = 0;
        cards.forEach(c => {
          const match = !filter || c.dataset.types.split(" ").includes(filter);
          c.hidden = !match;
          if (match) shown++;
        });
        section.querySelector(".empty").hidden = shown > 0;
        if (updateAddress) ctx.setQuery({ type: filter });
      };
      pills.forEach(p => p.addEventListener("click", () => apply(p.dataset.filter, true)));
      apply(ctx.query().get("type") || "", false); // so /projects?type=lasercut opens filtered
    });
  });

  // ---------- blog ----------

  // "2026-10-03" -> "3 October 2026" (in the site's language).
  function formatDate(date, ctx) {
    const d = new Date(String(date).slice(0, 10) + "T00:00:00Z");
    if (isNaN(d)) return String(date || "");
    return d.toLocaleDateString(ctx.site.locale || "en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  }

  function allPosts(ctx) {
    return Object.entries(ctx.pages)
      .filter(([, page]) => page.post)
      .map(([path, page]) => ({
        path,
        title: page.post.title || page.title,
        summary: page.post.summary || page.description || "",
        tags: page.post.tags || [],
        date: page.post.date || "",
        image: page.post.image || firstImage(page.blocks),
        imageAlt: page.post.imageAlt || "",
      }))
      .sort((a, b) => String(b.date).localeCompare(String(a.date))); // newest first
  }

  register("posts", (b, ctx) => {
    let list = allPosts(ctx);
    if (b.exclude) list = list.filter(p => p.path !== b.exclude);
    if (b.limit) list = list.slice(0, b.limit);
    if (!list.length) return b.exclude ? "" : `${heading(b.title, ctx, b.text)}<p class="muted">No posts yet.</p>`;

    const used = [...new Set(list.flatMap(p => p.tags))];
    const ordered = Array.isArray(b.filters) ? b.filters.filter(t => used.includes(t)) : [];
    const tags = [...ordered, ...used.filter(t => !ordered.includes(t)).sort()];
    const showFilters = b.filters !== false && !b.exclude && tags.length > 1;

    return `
      ${heading(b.title, ctx, b.text)}
      ${showFilters ? `
        <nav class="filter-pills" aria-label="Filter posts">
          <button type="button" class="active" data-filter="">All</button>
          ${tags.map(t => `<button type="button" data-filter="${ctx.esc(ctx.slugify(t))}">${ctx.esc(t)}</button>`).join("")}
        </nav>` : ""}
      <div class="projects posts"${cols(b.columns)}>
        ${list.map(p => `
          <a class="project-card post-card" href="${ctx.esc(ctx.link("/" + p.path))}" data-types="${ctx.esc(p.tags.map(ctx.slugify).join(" "))}">
            <div class="project-img">${p.image ? `<img loading="lazy" src="${ctx.esc(p.image)}" alt="${ctx.esc(p.imageAlt || p.title)}">` : ""}</div>
            <div class="project-body">
              ${p.date ? `<time class="post-date" datetime="${ctx.esc(String(p.date).slice(0, 10))}">${ctx.esc(formatDate(p.date, ctx))}</time>` : ""}
              <h3>${ctx.esc(p.title)}</h3>
              ${p.summary ? `<p class="muted">${ctx.esc(p.summary)}</p>` : ""}
              ${p.tags.length ? `<div class="project-types">${p.tags.map(t => `<span>${ctx.esc(t)}</span>`).join("")}</div>` : ""}
            </div>
          </a>`).join("")}
      </div>
      ${showFilters ? `<p class="muted empty" hidden>No posts with this tag yet.</p>` : ""}`;
  });

  // The title, date and tags at the top of a post (added automatically, see render.js pageBlocks).
  register("postHeader", (b, ctx) => {
    const page = ctx.pages[b.path] || {};
    const post = page.post || {};
    return `
      <div class="prose">
        ${post.date ? `<time class="post-date" datetime="${ctx.esc(String(post.date).slice(0, 10))}">${ctx.esc(formatDate(post.date, ctx))}</time>` : ""}
        <h1>${ctx.esc(post.title || page.title || "")}</h1>
        ${post.tags?.length ? `<div class="project-types">${post.tags.map(t => `<span>${ctx.esc(t)}</span>`).join("")}</div>` : ""}
      </div>`;
  });

  register("divider", () => `<hr>`);

  // ---------- full screen photo viewer ----------
  // lightbox([{ src, alt }, …], index): shows one photo full screen, with ‹ › arrows (and ← → keys, or a swipe on
  // phones) to step through the rest. Clicking the dark background, the × or pressing Escape closes it.
  function lightbox(items, index = 0) {
    const box = document.createElement("div");
    box.className = "lightbox";
    const image = document.createElement("img");
    box.append(image);
    box.insertAdjacentHTML("beforeend", `<button class="lightbox-close" aria-label="Close">×</button>`);
    const many = items.length > 1;
    if (many) box.insertAdjacentHTML("beforeend", `
      <button class="lightbox-prev" aria-label="Previous photo">‹</button>
      <button class="lightbox-next" aria-label="Next photo">›</button>`);
    const show = i => {
      index = (i + items.length) % items.length;
      box.classList.remove("zoomed");
      image.style.transform = "";
      image.src = items[index].src;
      image.alt = items[index].alt || "";
    };
    // Stop the page scrolling behind the viewer (padding fills the gap the hidden scrollbar leaves).
    const page = document.documentElement;
    const before = { overflow: page.style.overflow, paddingRight: page.style.paddingRight };
    page.style.paddingRight = `${window.innerWidth - page.clientWidth}px`;
    page.style.overflow = "hidden";
    const close = () => {
      box.remove();
      document.removeEventListener("keydown", onKey);
      Object.assign(page.style, before);
    };
    const onKey = e => {
      if (e.key === "Escape") close();
      else if (many && e.key === "ArrowLeft") show(index - 1);
      else if (many && e.key === "ArrowRight") show(index + 1);
    };
    box.addEventListener("click", e => {
      if (e.target.closest(".lightbox-prev")) show(index - 1);
      else if (e.target.closest(".lightbox-next")) show(index + 1);
      else close();
    });
    if (many) {
      let startX = null;
      box.addEventListener("touchstart", e => { startX = e.touches.length === 1 ? e.touches[0].clientX : null; }, { passive: true });
      box.addEventListener("touchend", e => {
        if (startX === null || box.classList.contains("zoomed")) return;
        const dx = e.changedTouches[0].clientX - startX;
        if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
        startX = null;
      });
    }
    document.addEventListener("keydown", onKey);
    show(index);
    document.body.appendChild(box);
  }

  register("html", b => b.html || "");

  return { register, render, mount, lightbox, embedUrl, subscribe, signupForm, mountSignups };
})();
