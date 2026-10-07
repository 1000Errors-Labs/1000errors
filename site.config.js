// Settings for this site. After editing, refresh the browser.
// If you change "name", "description", "favicon" or "customDomain", also run: npm run sync

window.SITE_CONFIG = {
  name: "1000 Errors",
  description: "Bespoke LED light installations, laser cut art and visuals for clubs, festivals and events, by Bristol-based artist Olly Balsom. Available worldwide.",

  // Products in catalog/products.json with this tag appear on this site.
  tag: "1000errors",

  // Images go in this site's assets/ folder. Leave logo empty to show the name as text.
  logo: "assets/logo-light.png",
  favicon: "assets/favicon.png",

  hero: {
    title: "1000 Errors",
    text: "Striving for perfection, one error at a time.",
    image: "", // e.g. "assets/hero.jpg"
  },

  theme: {
    background: "#000000", // pure black
    surface: "#1a1a1f",
    text: "#f2f2f2",
    muted: "#9a9aa3",
    accent: "#f2f2f2",
    accentText: "#000000",
    border: "#2a2a31",
    radius: "10px",
    // Google Fonts, separated by | e.g. "Space+Grotesk:wght@400;700|Inter:wght@400;600"
    googleFonts: "Inter:wght@400;500;600;700",
    fontBody: "'Inter', sans-serif",    // e.g. "'Inter', sans-serif"
    fontHeading: "'Inter', sans-serif", // e.g. "'Space Grotesk', sans-serif"
  },

  // Menu categories are built automatically from each product's "productType" in catalog/products.json.
  // To group or rename them, list them here instead, e.g.
  // categories: {
  //   "Hoodies": ["Fashion Zip-Up Hoodie - AOP", "Microfleece Ziphoodie - AOP"],
  //   "Leggings": ["Yoga Leggings - AOP"],
  // },
  // The order here is the order categories appear in the shop.
  categories: {
    "Woodwork Art": ["Woodwork Art"],
    "Hoodies": ["Fashion Zip-Up Hoodie - AOP", "Microfleece Ziphoodie - AOP", "All-Over Hoodies", "Fashion Longline Hoodie - AOP"],
    "Belts": ["Belt"],
    "Leggings": ["Yoga Leggings - AOP"],
    "Accessories": ["Bracelet", "Dog Collar", "Fashion Face Mask - AOP"],
    "Swimwear": ["Swimwear"],
    "Shoes": ["Men's Shoes", "Canvas Shoes"],
    "Shirts": ["Short Sleeve Button Down Shirt - AOP"],
  },
  // Shown at the end of the "All" shop listing, in this order (product handles from catalog/products.json).
  shopLast: [
    "sacred-patterns-black-white-halter-bikini",
    "celtic-knots-black-white-shirt",
    "platonic-energy-grey-black-shirt-1",
    "interstellar-brown-hoodie",
    "hexagon-fade-mens-high-top-canvas-shoes-1000-errors",
    "platonic-energy-burgundy-black-yoga-leggings",
  ],
  allProductsLabel: "All",

  // Header menu. Links starting with "/" go to pages in content.js (or /shop, /c/<category>).
  // Shop categories and project types are filters on those pages, so the menu stays flat.
  // (Dropdowns are still possible: { label: "Work", children: [ { label, href }, … ] }, or { label: "Shop", shop: true }.)
  menu: [
    { label: "Shop", href: "/shop" },
    { label: "Projects", href: "/projects" },
    { label: "Commissions", href: "/commissions" },
    { label: "VJ Shop", href: "/vj-shop" },
    { label: "Blog", href: "/blog" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],

  social: [
    { label: "Instagram", href: "https://www.instagram.com/1000_errors" },
    { label: "Facebook", href: "https://www.facebook.com/1000ErrorsLaserCutArt" },
  ],

  // The contact form is emailed here (via formsubmit.co). The first message triggers a
  // one-time activation email from FormSubmit to this address — click the link in it once.
  contactEmail: "ollybalsomat1000errors@gmail.com",

  // A line at the bottom of the shop and category pages.
  shopNote: {
    text: "Looking for something bigger, or one of a kind?",
    label: "Commission a bespoke piece",
    href: "/commissions",
  },

  // Optional: a "Commission a bespoke piece" link under sold-out products, e.g. "/contact" (the product name
  // is filled into the contact form). Left empty so sold-out pieces only offer "Notify me".
  commissionLink: "",

  // Mailing list (Mailchimp). mailchimpUrl: in Mailchimp go to Audience → Signup forms → Embedded forms,
  // and copy the address inside the form's action="…", e.g. "https://xxxx.us21.list-manage.com/subscribe/post?u=…&id=…".
  // Leave it empty and the pop-up and "Notify me" box stay hidden.
  mailingList: {
    mailchimpUrl: "",
    productField: "",            // optional: a Mailchimp text field's merge tag (e.g. "PRODUCT") to record which piece someone is waiting for
    tags: { popup: "", restock: "" }, // optional: Mailchimp tag IDs (numbers) to label where people signed up
    // Shown once, a while after someone arrives. Create the code in Stripe first (Product catalogue → Coupons → add a promotion code).
    popup: {
      title: "Get 10% off your first order",
      text: "Join the list for 10% off, and be first to hear when a new run of pieces is ready. New pieces are made in small batches and often sell out.",
      discountCode: "WELCOME10",
      button: "Get my 10% off",
      delaySeconds: 20,
      againAfterDays: 30,        // if they close it without joining
    },
    // The box under a sold-out product. Set restock: false to show only the commission link.
    restock: {
      title: "Notify me when this is next in stock",
      text: "Pieces are made in small runs. Leave your email and you'll hear first when this one is back.",
      button: "Notify me",
    },
  },

  footerText: "",

  // Shown on the /thank-you page after someone pays. printedMessage is used instead for printed-to-order
  // items ("printOnDemand": true in catalog/products.json: the hoodies, leggings, shirts, bikinis and shoes).
  thankYou: {
    message: "Thanks for your order, and for supporting me as an artist, it means a lot! I'll pack it up and post it within 3 working days, and you'll get an email as soon as it's on its way.",
    printedMessage: "Thanks for your order! Your item is printed just for you, so please allow about a week before it ships. You'll get an email with tracking as soon as it's on its way.",
  },

  // Search engines and link previews (Facebook, WhatsApp, iMessage…). Each page's own title, description
  // and image come from content.js and the product catalogue; these fill the gaps.
  seo: {
    homeTitle: "1000 Errors | LED light installations & laser cut art, Bristol UK",
    owner: "Olly Balsom",                            // shown to Google as the person behind the site and its projects
    ownerJobTitle: "Light installation artist, VJ and stage designer",
    location: { town: "Bristol", country: "GB" },    // town and country only, no street address
    areaServed: "Worldwide",
    // Website ownership tags. For Google Search Console, choose "URL prefix", then "HTML tag", and add the
    // content="…" code here as "google-site-verification": "…", then publish.
    verify: { "p:domain_verify": "f71c7614d74e7ed4854f7b5b6bbbbb04" }, // Pinterest website claim
    knowsAbout: ["Light installations", "Laser cutting", "LED lighting", "Sacred geometry", "Stage design",
      "Projection mapping", "VJing", "3D animation", "Festival installations"],
    shareImage: "assets/sacred-geometry-flower-garden-festival-night.jpg", // used when a page has no picture of its own
  },

  // Visitor stats (Umami Cloud, free, no cookie banner needed). Add the site at cloud.umami.is, copy its
  // Website ID (Settings → Websites → Edit) here, then publish. "Buy now" clicks and sent contact forms
  // show up under Events.
  analytics: {
    umamiId: "",
  },

  // Your own domain for GitHub Pages, e.g. "1000errors.com" (then run npm run sync). Share links,
  // canonical tags and sitemap.xml use it. (Not decided yet: .com or .uk.)
  customDomain: "1000errors.uk",

  // Set by `npm run eject`. When true, `npm run sync` no longer overwrites this site's
  // index.html / app.js / styles.css etc, so you can customise them freely.
  ejected: false,
};
