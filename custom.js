// Extra JavaScript for this site only (optional). Runs before the shared app starts,
// so you can add your own content block types here, e.g.
// Blocks.register("banner", (block, ctx) => "<div class='my-banner'>" + ctx.esc(block.text) + "</div>");

// Homepage banner parallax: as you scroll, the photo and the text/logo drift down more slowly than
// the page, each at its own rate, so they separate slightly. 0 = scrolls normally, 0.5 = moves at half speed.
// The photo darkens towards black between "imageFadeStart" and "imageFadeEnd"; "fade" is how dark it gets
// (0 = no fade, 1 = fully black). The text fades out between "textFadeStart" and "textFadeEnd".
// All four are measured as how much of the banner has scrolled under the header (0.25 = a quarter of the way).
// Try values live in the design lab (/_lab/). Turned off for visitors who ask for reduced motion.
window.PARALLAX = Object.assign({
  image: 0.8,             // photo
  text: 0.6,              // logo, text and buttons
  fade: 1,                // photo fade to black
  imageFadeStart: 0,      // photo starts fading
  imageFadeEnd: 0.58,     // photo at its darkest
  textFadeStart: 0.6,     // text starts fading
  textFadeEnd: 0.92,      // text fully faded out
  cover: ".site-header",  // the sticky bar the banner scrolls under
}, window.PARALLAX);

(() => {
  if (!window.addEventListener) return; // the page builder runs this file outside a browser
  if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  let queued = false;

  function update() {
    queued = false;
    const hero = document.querySelector(".page-home .block-hero .hero-block");
    if (!hero) return;
    const cover = document.querySelector(window.PARALLAX.cover);
    const top = cover ? cover.getBoundingClientRect().bottom : 0;
    const rect = hero.getBoundingClientRect();
    if (rect.bottom < 0) return; // scrolled out of view: nothing to move
    // How far the banner has scrolled up under the header. The photo's shift is always smaller than this,
    // so the strip it uncovers at the top stays hidden behind the header.
    const scrolled = Math.max(0, top - rect.top);
    hero.style.setProperty("--parallax-image", (scrolled * window.PARALLAX.image).toFixed(1) + "px");
    hero.style.setProperty("--parallax-text", (scrolled * window.PARALLAX.text).toFixed(1) + "px");
    const progress = Math.min(1, scrolled / rect.height); // 0 at rest, 1 once the banner is fully under the header
    const P = window.PARALLAX;
    hero.style.setProperty("--parallax-fade", (1 - between(progress, P.imageFadeStart, P.imageFadeEnd) * P.fade).toFixed(3));
    hero.style.setProperty("--parallax-text-fade", (1 - between(progress, P.textFadeStart, P.textFadeEnd)).toFixed(3));
  }

  // 0 before start, 1 after end, and a straight line in between.
  function between(progress, start, end) {
    if (end <= start) return +(progress >= start);
    return Math.min(1, Math.max(0, (progress - start) / (end - start)));
  }

  function queue() {
    if (!queued) { queued = true; requestAnimationFrame(update); }
  }

  window.addEventListener("scroll", queue, { passive: true });
  window.addEventListener("resize", queue);
  window.addEventListener("parallax:update", queue); // the design lab fires this when a slider moves
})();

// Project pages: let visitors study the small details in the photos.
// - The big photos beside the text zoom in close on hover and follow the pointer (mouse/trackpad only),
//   and clicking or tapping one opens it full screen, like the gallery photos.
// - Full screen (any photo): clicking the photo zooms in and the close-up follows the pointer; clicking again
//   zooms back out. The arrows (or ← → keys, or a swipe) step through every photo on the page. Clicking the
//   dark background, the × or pressing Escape closes it. Phones pinch to zoom.
(() => {
  if (!window.addEventListener || !window.matchMedia) return; // the page builder runs this file outside a browser
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const onProject = el => !!el.closest(".page")?.querySelector(".project-back");
  const aim = (pic, box, e) => {
    const r = box.getBoundingClientRect();
    pic.style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`;
  };

  // Hover zoom on the photos beside the text.
  if (fine) {
    const ZOOM = 2;
    let active = null;
    const stop = () => {
      if (!active) return;
      active.classList.remove("zooming");
      active.querySelector("img").style.transform = "";
      active = null;
    };
    document.addEventListener("mousemove", e => {
      if (document.querySelector(".lightbox")) return stop();
      const box = e.target.closest?.(".split-media");
      const pic = box && onProject(box) ? box.querySelector("img") : null;
      if (!pic) return stop();
      if (box !== active) {
        stop();
        active = box;
        box.classList.add("zooming");
        pic.style.transform = `scale(${ZOOM})`;
      }
      aim(pic, box, e);
    });
    document.addEventListener("mouseleave", stop);
    window.addEventListener("blur", stop);
  }

  // Click any photo on a project page (beside the text or in a gallery) to open it full screen. The arrows
  // step through every photo on the page in order.
  document.addEventListener("click", e => {
    const pic = e.target.closest?.(".split-media img, .lightbox-open");
    if (!pic || !onProject(pic) || pic.closest("a")) return;
    e.stopPropagation(); // the gallery's own viewer would only step through that one gallery
    const all = [...pic.closest(".page").querySelectorAll(".split-media img, .lightbox-open")].filter(el => !el.closest("a"));
    const items = all.map(el => el.matches("img")
      ? { src: el.currentSrc || el.src, alt: el.alt }
      : { src: el.dataset.src, alt: el.querySelector("img")?.alt || "" });
    Blocks.lightbox(items, all.indexOf(pic));
  }, true);

  // Full screen: click the photo to zoom in (to its full resolution, at least 2x) and follow the pointer.
  if (fine) {
    document.addEventListener("click", e => {
      const pic = e.target.closest?.(".lightbox img");
      if (!pic) return;
      e.stopPropagation(); // clicking the photo zooms; only the background closes the viewer
      const box = pic.closest(".lightbox");
      if (box.classList.toggle("zoomed")) {
        // Measure the photo before it's magnified, so the close-up can follow the pointer.
        const r = pic.getBoundingClientRect();
        rect = { left: r.left, top: r.top, width: r.width, height: r.height };
        pic.style.transform = `scale(${Math.max(2, pic.naturalWidth / pic.clientWidth)})`;
        aim(pic, { getBoundingClientRect: () => rect }, e);
      } else {
        pic.style.transform = "";
      }
    }, true);
    let rect = null;
    document.addEventListener("mousemove", e => {
      const pic = e.target.closest?.(".lightbox.zoomed img");
      if (pic && rect) aim(pic, { getBoundingClientRect: () => rect }, e);
    });
  }
})();

// Homepage "Shop by category" tiles: hovering zooms in close and the close-up follows the pointer,
// like the product pictures in "Latest designs" (mouse/trackpad only).
(() => {
  if (!window.addEventListener || !window.matchMedia) return; // the page builder runs this file outside a browser
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
    const box = e.target.closest?.(".page-home .tile");
    const pic = box?.querySelector("img");
    if (!pic) { stop(); return; }
    if (box !== active) {
      stop();
      active = box;
      box.classList.add("zooming");
      pic.style.transform = `scale(${ZOOM})`;
    }
    const r = box.getBoundingClientRect();
    pic.style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`;
  });
  document.addEventListener("mouseleave", stop);
  window.addEventListener("blur", stop);
})();
