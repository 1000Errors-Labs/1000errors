// Pages for the 1000 Errors site. See core/blocks.js for every block type you can use.
// Link to a page with href: "/page-name". Pages are added to the header menu in site.config.js.

const vimeo = (id, hash = "2c2c9dc369") => `https://player.vimeo.com/video/${id}?h=${hash}`;
// Videos brought over from the old Parabolic Arts portfolio, embedded without a private-link hash.
// If one shows "video not available", copy its embed link from Vimeo (Share → Embed) and use vimeo(id, "hash").
const vimeoPlain = (id, hash) => `https://player.vimeo.com/video/${id}${hash ? `?h=${hash}` : ""}`;
const sketchfab = id => `https://sketchfab.com/models/${id}/embed`;
const gumroad = id => `https://athousanderrors.gumroad.com/l/${id}?wanted=true`;
const HIRE = { label: "Freelance enquiries", href: "/contact", style: "outline" };
const BACK_TO_VJ_SHOP = { type: "buttons", items: [{ label: "← Back to the VJ Shop", href: "/vj-shop", style: "outline" }] };
// Shown on the VJ Shop and every pack: most bespoke work has come from people who found the VJ packs first.
const BESPOKE_VISUALS = {
  type: "text",
  title: "Need something bespoke?",
  html: `<p>As well as VJ packs, I create bespoke visual shows, projection mapping and stage designs for festivals, clubs
    and artists, including custom visual shows for Shpongle. Based in Bristol, UK, and available worldwide.</p>
    <p><a href="/commissions">Commissions and hire →</a></p>`,
};
// Wedding décor and interior work lives on my sister site. Its project cards here link there and explain where they go.
const PARABOLIC = {
  site: "Parabolic Arts",
  siteNote: "Parabolic Arts is my sister studio for wedding décor and bespoke interior installations for businesses.",
};
const FORMATS = "Includes DXV3, HAP and QuickTime versions of all videos";

// One VJ pack page. Most packs share the same layout.
const vjPack = ({ title, intro, video, features, extras = [], buy }) => ({
  title,
  description: intro[0],
  blocks: [
    { type: "text", title, html: intro.map(p => `<p>${p}</p>`).join("") },
    { type: "video", url: video },
    { type: "features", title: "Features", items: features },
    ...extras,
    { type: "buttons", items: buy.map(([label, id]) => ({ label, href: gumroad(id) })) },
    BESPOKE_VISUALS,
    BACK_TO_VJ_SHOP,
  ],
});

// One project from a series page (Animation, Interactive Art, 3D Modelling): a single video or 3D model with its
// write-up. The card summary is the first sentence of the write-up unless `summary` is given.
const seriesProject = ({ title, url, text = "", summary, types, year, image, order, links = [], back }) => ({
  title,
  ...(text ? { description: text } : {}),
  project: {
    title, types, order,
    summary: summary ?? text.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? text,
    ...(year ? { year } : {}),
    ...(image ? { image } : {}),
  },
  blocks: [
    { type: "text", title, html: text ? `<p>${text}</p>` : "" },
    { type: "video", url },
    { type: "buttons", items: [HIRE, ...links, back] },
  ],
});
const BACK_TO_ANIMATION = { label: "More animation", href: "/animation", style: "outline" };
const BACK_TO_INTERACTIVE = { label: "More interactive art", href: "/interactive-art", style: "outline" };
const BACK_TO_3D = { label: "More 3D models", href: "/3d-modelling", style: "outline" };

window.SITE_CONTENT = {
  home: [
    {
      type: "hero",
      logo: "assets/logo-light.png",
      text: "Striving for perfection, one error at a time.",
      image: "assets/sacred-geometry-flower-garden-light-installation-night.jpg",
      height: "image",
      ratio: "2500 / 700",
      buttons: [
        { label: "Shop the collection", href: "/shop", style: "outline" },
        { label: "View projects", href: "/projects", style: "outline" },
      ],
    },
    { type: "projects", title: "Projects", limit: 6, filters: false },
    { type: "buttons", align: "center", items: [{ label: "View all projects", href: "/projects", style: "outline" }] },
    { type: "categories", title: "Shop by category", columns: 4 },
    { type: "products", title: "Latest designs", limit: 8, label: "View all products", skipCategoryTiles: true, realPhotos: true,
      replace: { "sacred-patterns-black-white-halter-bikini": "hexstatic-illuminated-wall-art" } },
    { type: "posts", title: "From the blog", limit: 3, filters: false },
    { type: "buttons", align: "center", items: [{ label: "Read the blog", href: "/blog", style: "outline" }] },
    {
      type: "split",
      image: "assets/olly-balsom-artist-laser-cut-archway-square.jpg",
      imageAlt: "Olly Balsom with a laser cut sacred geometry archway",
      title: "About 1000 Errors",
      html: `<p>1000 Errors is the work of Olly Balsom, a Bristol-based artist making LED light installations, laser cut art,
        stage design and visuals for festivals, clubs and events worldwide, from Boom, Ozora and Shambala festivals to bespoke visual
        shows for Shpongle.</p>`,
      buttons: [{ label: "Read more", href: "/about", style: "outline" }, { label: "Commissions & hire", href: "/commissions", style: "outline" }],
    },
  ],

  pages: {
    "about": {
      title: "About Olly Balsom",
      description: "Olly Balsom is a Bristol-based artist with 20 years of experience in light installations, laser cut art, stage design, projection mapping and VJing for festivals and clubs.",
      blocks: [
        {
          type: "split",
          image: "assets/olly-balsom-artist-laser-cut-archway-square.jpg",
          imageAlt: "Olly Balsom with a laser cut sacred geometry archway",
          title: "About",
          html: `
            <p>1000 Errors is the work of Olly Balsom, a Bristol-based artist who has been working professionally for around
            20 years, making light installations, laser cut art, stage designs and visuals for festivals, clubs and private clients.</p>
            <p>It started with an animation degree and VJing, specialising in video projection mapping: bespoke visual shows for
            Shpongle, VJing at Modem Festival, and projection mapped stage designs and sculptures for music festivals. Stage design
            led to laser cutting, and laser cutting led to the sacred geometry light installations and artworks that are the main
            focus today, from the Sacred Geometry Flower Garden at Boom Festival to a 9ft illuminated wedding archway.</p>
            <p>Festival work has included Boom, Ozora and Shambala. Many pieces are designed in custom-built software and made to pack
            down into flight cases, so they can travel to festivals, clubs and venues anywhere in the world.</p>
            <p>Along the way the work has also covered 3D animation, virtual reality and a range of printed clothing and
            laser-engraved leather goods.</p>
            <p>Wedding décor and bespoke interior installations for businesses now have their own home at my sister studio,
            <a href="https://parabolicarts.uk" target="_blank" rel="noopener">Parabolic Arts</a>.</p>`,
          buttons: [{ label: "Commissions & hire", href: "/commissions" }, { label: "Get in touch", href: "/contact", style: "outline" }],
        },
      ],
    },

    "contact": {
      title: "Contact",
      blocks: [
        {
          type: "contact",
          title: "Contact",
          text: "Get in touch about commissions, hiring an installation for your festival or event, visuals and animation work, or just to say hi! Based in Bristol, UK, and available worldwide.",
        },
        {
          type: "text",
          html: `<p>Planning a wedding, or a bespoke installation for a hotel, restaurant or office? Visit my sister studio,
            <a href="https://parabolicarts.uk" target="_blank" rel="noopener">Parabolic Arts →</a></p>`,
        },
      ],
    },

    "commissions": {
      title: "Light Installation Commissions & Hire",
      description: "Bespoke LED light installations, laser cut sculptures and stage design for clubs, festivals and events. Designed and built in Bristol, UK, made to tour worldwide.",
      blocks: [
        {
          type: "hero",
          image: "assets/sacred-geometry-flower-garden-festival-night.jpg",
          height: "tall",
          align: "left",
          title: "Light installations for clubs, festivals and events",
          text: "Bespoke laser cut and LED pieces, designed and built in Bristol and made to travel worldwide.",
          buttons: [{ label: "Start a project", href: "/contact" }],
        },
        {
          type: "text",
          html: `<p>I design and build bespoke light installations, illuminated sculptures and stage pieces: layered laser cut wood
            and sacred geometry, lit from within with colour-changing LEDs. I've been making art for festivals and music events for
            around 20 years, including Boom, Ozora and Shambala, VJing at Modem Festival, and bespoke visual shows for Shpongle.</p>`,
        },
        {
          type: "features",
          title: "What I can make for you",
          items: [
            "Bespoke LED light installations and illuminated sculptures for clubs, bars and venues",
            "Festival installations, stage design and DJ booth decor",
            "Laser cut sacred geometry wall art, room dividers and lighting for homes and businesses",
            "Wedding archways and event decor, through my sister studio Parabolic Arts",
            "Bespoke visual shows, VJ content and projection mapping",
            "Laser cutting and engraving: layered wooden logos and signs, photo engraving, names and personalised pieces",
          ],
        },
        {
          type: "text",
          html: `<p>Planning a wedding, or a bespoke installation for a hotel, restaurant or office? That work lives at my sister studio,
            <a href="https://parabolicarts.uk" target="_blank" rel="noopener">Parabolic Arts →</a></p>`,
        },
        {
          type: "split",
          reverse: true,
          image: "assets/lasercut/layered-hexagon-pattern-wood-detail.jpg",
          imageAlt: "Close-up of layered laser cut wood in a hexagon pattern",
          title: "Laser cutting & engraving",
          html: `<p>I also offer a laser cutting and engraving service on an industrial laser cutter with a 120 × 85 cm cutting area.
            With a background in graphic design, I can create a logo for you or take an existing one and separate it into layers
            for a multi-layered wooden piece, engrave photographs, and make bespoke names and pieces for special occasions.</p>`,
          buttons: [{ label: "Laser cutting & engraving", href: "https://parabolicarts.uk/laser-cutting-engraving", style: "outline" }],
        },
        {
          type: "split",
          image: "assets/archway/wedding-archway-pieces-packed-in-suitcase.jpg",
          imageAlt: "A 9ft laser cut wedding archway packed down into a suitcase",
          title: "Built to travel",
          html: `<p>Pieces are designed from the start to pack down into flight cases, so they can be shipped or flown to festivals
            and venues anywhere in the world and assembled on site.</p>
            <p>My 9ft wedding archway packed into a single suitcase and was checked in as luggage on a plane.</p>`,
          buttons: [{ label: "See the archway", href: "https://parabolicarts.uk/geometric-archway", style: "outline" }],
        },
        {
          type: "split",
          reverse: true,
          image: "assets/blog/eurorack-case/eurorack-case-designer-rows-and-arc.jpg",
          imageAlt: "Custom parametric design software showing a curved case design in 2D and 3D",
          title: "Designed in my own software",
          html: `<p>I write my own design tools, so a piece can be shaped around your space, your stage or your flight case, then
            previewed in 3D and sent straight to the laser cutter. That means truly bespoke designs without starting from
            scratch every time.</p>`,
          buttons: [{ label: "Read about the tools", href: "/blog", style: "outline" }],
        },
        {
          type: "split",
          image: "assets/flower-garden/flower-garden-festival-visitors-night.jpg",
          imageAlt: "Festival visitors walking among the illuminated Sacred Geometry Flower Garden at night",
          title: "Available to hire",
          html: `<p>The Sacred Geometry Flower Garden, the illuminated wedding archway and a range of light sculptures are
            available to hire for festivals, events and weddings in the UK and abroad.</p>`,
          buttons: [{ label: "The Flower Garden", href: "/light-installations", style: "outline" }, { label: "Light sculptures", href: "/lasercut-art", style: "outline" }],
        },
        { type: "projects", title: "Selected work", limit: 6, filters: false },
        { type: "buttons", align: "center", items: [{ label: "Get in touch", href: "/contact" }, { label: "All projects", href: "/projects", style: "outline" }] },
      ],
    },

    "projects": {
      title: "Projects",
      description: "Projects by 1000 Errors: laser cut art, light installations, sculpture, projection mapping, animation, VR and interactive art.",
      blocks: [
        {
          type: "projects",
          title: "Projects",
          text: "Physical and digital work: laser cut sacred geometry, light installations, sculpture, projection mapping, animation, virtual reality and interactive art.",
          filters: ["Lasercut", "Light Art", "Installations", "Sculpture", "Commissions", "Projection Mapping", "Animation", "3D & VR", "Interactive", "Architecture"],
        },
        { type: "buttons", items: [{ label: "Commission a project", href: "/commissions" }, { label: "Watch the showreel", href: "/showreel", style: "outline" }] },
      ],
    },

    // Blog: every page with a `post` field is listed here, newest first. To add a post, copy the one below,
    // give it a new "blog/…" address, a date (year-month-day) and its own blocks. `tags` become filter buttons.
    "blog": {
      title: "Blog",
      description: "News, works in progress and behind the scenes from 1000 Errors.",
      blocks: [
        { type: "posts", title: "Blog", text: "News, works in progress and behind the scenes from the studio." },
      ],
    },

    "blog/parabolic-arts": {
      title: "Parabolic Arts: a sister studio for weddings and interiors",
      post: {
        date: "2026-10-04",
        tags: ["News"],
        summary: "Wedding décor and bespoke interior installations for businesses now have their own home at Parabolic Arts.",
        image: "assets/blog/parabolic-arts/parabolic-arts-card.jpg",
      },
      description: "Wedding décor and bespoke interior installations for businesses now have their own website, my sister studio Parabolic Arts.",
      blocks: [
        {
          type: "text",
          html: `<p>1000 Errors covers a lot of ground: LED installations for clubs and festivals, VJ packs, projection mapping,
            printed clothing, design tools and whatever experiment I'm in the middle of. That's how I like to work, but it
            isn't always the easiest place to land if you're planning a wedding or fitting out a restaurant.</p>
            <p>So the wedding and interior side of my work now has its own website: <a href="https://parabolicarts.uk" target="_blank" rel="noopener">Parabolic Arts</a>.</p>`,
        },
        {
          type: "split",
          image: "assets/blog/parabolic-arts/parabolic-arts-home-page.jpg",
          imageAlt: "The Parabolic Arts home page, with a close-up of a layered laser cut mandala",
          html: `<p>Parabolic Arts is for wedding décor and interior installations for homes and businesses: archways, room
            dividers, wall pieces and bespoke installations for hotels, restaurants, offices and private homes.</p>
            <p>It's the same laser cut sacred geometry, made in the same Bristol workshop, presented for planners, venues
            and interior designers.</p>`,
        },
        {
          type: "split",
          reverse: true,
          image: "assets/blog/parabolic-arts/parabolic-arts-wedding-decor-and-interior-installations.jpg",
          imageAlt: "The Parabolic Arts home page sections for wedding décor and interior installations, showing the illuminated archway and the room divider",
          html: `<p>The wedding archway and the room divider now live there, each with a case study covering the brief, the
            design and how it was made.</p>
            <p>If you click either of them on the Projects page here, you'll be sent over to Parabolic Arts.</p>`,
        },
        {
          type: "text",
          html: `<p>Nothing changes here. Festival and club installations, stage design, visuals, VJ packs, the shop and the
            blog all stay on 1000 Errors.</p>
            <p>If you're planning a wedding, or want a piece for your home or business, head to Parabolic Arts. For
            anything else, get in touch here as usual.</p>`,
        },
        { type: "buttons", items: [{ label: "Visit Parabolic Arts", href: "https://parabolicarts.uk" }, { label: "Commissions & hire", href: "/commissions", style: "outline" }] },
      ],
    },

    "blog/eurorack-case-designer": {
      title: "A parametric Eurorack case designer",
      post: {
        date: "2026-10-03",
        tags: ["Eurorack", "CNC", "Work in progress"],
        summary: "A standalone app that generates a whole Eurorack case, joints, holes and LED channels included, around whatever configuration a build calls for.",
        image: "assets/blog/eurorack-case/eurorack-case-designer-tall-case-3d.jpg",
      },
      description: "A standalone, parametric app for designing curved Eurorack cases for modular synthesizers, with native exports for CNC and laser cutting.",
      blocks: [
        {
          type: "text",
          html: `<p>I also vibe coded a standalone app for designing Eurorack cases for modular synthesizers. It's all parametric
            design, and it natively exports files for CNC machine and laser cutting software.</p>
            <p>After designing one case manually, using traditional polygonal modelling in Maya, converting it to vectors and then
            laser cutting those vectors, I quickly realised how long it takes to fix errors and iterate on a design, let alone
            make multiple cases with different configurations.</p>
            <p>So I built this tool, because I wanted the ability to design endless variations: different module heights (3U, 1U),
            custom LED screens, custom artwork panels, integrated LED lighting in the side panels, custom patch bay layouts,
            whatever a specific build calls for. Instead of redrawing everything from scratch each time, the tool generates the
            actual case around whatever configuration I decide on.</p>
            <p>It takes into account the actual rail hardware I'm using and the thickness of whatever wood I've got, and every
            joint, slot, hole and panel gap sizes itself off those numbers automatically. Switch to a different rail, use thicker
            or thinner material, tweak the gap between any two panels: it all just adjusts, rather than me having to redesign the
            whole case every time something changes.</p>`,
        },
        {
          type: "split",
          image: "assets/blog/eurorack-case/eurorack-case-designer-rows-and-arc.jpg",
          imageAlt: "The case designer in split view: the curved side profile with its rows and holes in 2D, and the finished wooden case in 3D",
          html: `<h2>The curve</h2>
            <p>In this view, the rows section on the left lets me specify how many module rows I want, the module size (3U or 1U),
            whether I want a custom patch bay and its size, and the angle of the first and last rows. It then creates a perfect arc
            for the orientation of the rows in between, taking the dimensions of each row and the patch bay into account.</p>
            <p>Then it calculates where all the holes need to be drilled. I can even specify the size of the bolt heads, so every
            bolt is countersunk when it's screwed in.</p>`,
        },
        {
          type: "text",
          html: `<p>This is one of my favourite parts. The front of the case follows a curve, and that curve has to stay smooth no
            matter what's actually in the rack. If I add a module, remove one, swap a 3U row for a 1U row or mix in a patch bay,
            the tool recalculates the whole arc on the fly, so it still comes out as a clean, consistent curve rather than kinking
            around whatever happens to be plugged in.</p>
            <p>It's not just splitting the bend evenly per module either: it weights it by the real physical size of each piece,
            so the curve stays true whether the rack is all 3U or a mix of everything.</p>`,
        },
        {
          type: "split",
          reverse: true,
          image: "assets/blog/eurorack-case/eurorack-case-designer-tall-case-3d.jpg",
          imageAlt: "A taller version of the case in 3D, with extra rows of different sizes",
          html: `<p>With a few clicks I added some extra rows in different module sizes: 1U modules, and a custom patch bay to
            connect audio, CV and MIDI into the case.</p>
            <p>Those signals drive the custom coded microcontrollers that power the LED strips running along the perimeter of the
            panels, and the LED matrix panels at the very top of the case, which visualise the audio, CV and MIDI data.</p>`,
        },
        {
          type: "split",
          image: "assets/blog/eurorack-case/eurorack-case-designer-countersunk-holes-close-up.jpg",
          imageAlt: "Close-up of the 3D case showing countersunk bolt holes and the channels for LED strips and diffusers",
          html: `<p>A close-up showing the fidelity of the design: the parametric holes that let the bolt heads sit countersunk,
            and the parametric channels for the LED strips and diffusers. Those are proper stepped pockets for a strip and
            diffuser, designed directly into the side panels rather than bolted on afterwards.</p>
            <p>Everything is created parametrically in the 2D view and then automatically extruded into 3D, with zero polygonal
            modelling. That's a first for me, and it's actually much simpler and 10 to 20 times quicker to iterate on. The live
            2D and 3D previews mean I can see a case coming together before committing to cutting anything.</p>`,
        },
        {
          type: "text",
          html: `<p>This is part of a whole range of new projects I'm working on that use my node based, audio, CV and MIDI reactive
            LED and screen software, which I'm also vibe coding.</p>
            <p>The initial laser cut prototype is done, and now this tool is almost finished, I'll be ready to start CNC cutting the
            first real version soon.</p>`,
        },
        { type: "buttons", items: [{ label: "View projects", href: "/projects" }, { label: "Get in touch", href: "/contact", style: "outline" }] },
      ],
    },

    "blog/shadow-lamp-designer": {
      title: "Squircles: designing 3D printed shadow lamps",
      post: {
        date: "2026-10-03",
        tags: ["3D printing", "Lighting", "Work in progress"],
        summary: "My shadow lamp designer started life as a Blender add-on. It's now a standalone app that draws patterns and simulates their shadows in real time.",
        image: "assets/blog/squircles/squircles-room-shadow-preview.png",
      },
      description: "Squircles, a standalone app for designing 3D printed lamps that cast patterned shadows, which began as a Blender add-on.",
      blocks: [
        {
          type: "text",
          html: `<p>A bit of an update on my shadow lamp designer: a 3D printed lampshade with a pattern cut right through it,
            so a single bulb inside throws the design across the walls, floor and ceiling of the room.</p>`,
        },
        {
          type: "split",
          image: "assets/blog/squircles/squircles-blender-addon-room-shadows.jpg",
          imageAlt: "The original Blender add-on: a spherical lampshade casting a maze pattern across a furnished room",
          html: `<h2>Where it started</h2>
            <p>It began as a plug-in for Blender. The add-on built the lampshade around a pattern and lit a virtual room
            from the inside, so I could see where the shadows would land on the walls, ceiling and furniture.</p>`,
        },
        {
          type: "split",
          reverse: true,
          image: "assets/blog/squircles/squircles-pattern-editor-sections.png",
          imageAlt: "The Squircles pattern editor, with the lamp split into horizontal bands of maze-like pixel patterns",
          html: `<h2>Now a standalone app</h2>
            <p>It's now a standalone app that lets me draw patterns and see simulated shadows being cast in real time.</p>
            <p>The lamp is split into sections, from a cap at the top, through a series of bands, to a cap at the bottom.
            Each one can use either equirectangular or anamorphic projection, and its own density grid, depending on how
            I want the shadows to behave and their relative size.</p>`,
        },
        {
          type: "split",
          image: "assets/blog/squircles/squircles-sphere-preview.png",
          imageAlt: "The pattern drawn on the left and wrapped onto the sphere of the lamp in the preview on the right",
          html: `<p>A fair bit of this is directly translatable knowledge from creating 360 degree videos and interior dome
            video projection mapping techniques: it's the same problem of wrapping a flat image around a sphere and
            knowing where every pixel will end up.</p>`,
        },
        {
          type: "gallery",
          columns: 2,
          items: [
            { src: "assets/blog/squircles/squircles-room-shadow-preview.png", alt: "Simulated shadows from the lamp covering the walls, floor and ceiling of a room", caption: "The room preview: white is light through an open pixel, dark is the shadow of a solid one" },
            { src: "assets/blog/squircles/squircles-outdoor-floor-shadows.png", alt: "The lamp hanging over an endless floor at night, casting its bottom cap pattern below it", caption: "The outdoor preview, with the bottom cap pattern drawn on the left and its shadow on the floor" },
          ],
        },
        {
          type: "split",
          reverse: true,
          image: "assets/blog/squircles/squircles-lamp-in-slicer.jpg",
          imageAlt: "The exported lamp mesh in red in Bambu Studio, ready to slice for a Bambu Lab A1 printer",
          html: `<h2>Ready to print (almost)</h2>
            <p>It also exports perfect 3D meshes that are generated directly from the same grid used to draw the details
            in the first place, rather than trying to convert vectors into polygons. The exported meshes are ready to go
            straight into 3D printing software.</p>
            <p>I still need to break up the mesh into pieces first, but it's getting pretty close to 3D printing the
            first one.</p>`,
        },
        {
          type: "text",
          html: `<p>Having said that, I might find the lamp needs to be huge, and in a huge room, to project this much detail
            in focus. Real life testing will tell.</p>`,
        },
        { type: "buttons", items: [{ label: "See the light installations", href: "/light-installations" }, { label: "Get in touch", href: "/contact", style: "outline" }] },
      ],
    },

    "blog/layered-beetles": {
      title: "Layered beetles: a tool for turning paintings into laser cut depth",
      post: {
        date: "2026-10-03",
        tags: ["Lasercut", "Work in progress"],
        summary: "A home-made app that turns a traced painting into stacked laser cut layers of card, with a 3D preview before anything gets cut.",
        image: "assets/blog/beetle/beetle-raised-layers-3d-preview.jpg",
      },
      description: "Building an app to add three-dimensional depth to beetle paintings with stacked, laser cut layers of card.",
      blocks: [
        {
          type: "text",
          html: `<p>I've been vibe coding an app to bring some three-dimensionality to my girlfriend's beetle paintings, using stacked,
            laser cut layers of card. The idea is to build depth up around the painted beetle, step by step, so the
            flat painting becomes a small landscape you can look into.</p>`,
        },
        {
          type: "split",
          image: "assets/blog/beetle/beetle-laser-cut-card-silhouette.jpg",
          imageAlt: "A stag beetle silhouette laser cut from white card, held in a hand",
          html: `<p>It starts with a vector. I traced the outline of the beetle from her original painting, and that shape
            becomes the centre that every layer radiates out from.</p>
            <p>Here's the traced outline cut straight from card.</p>`,
        },
        {
          type: "split",
          reverse: true,
          image: "assets/blog/beetle/beetle-raised-layers-3d-preview.jpg",
          imageAlt: "The app's 3D preview of a beetle raised up from stepped layers in yellow and pink",
          html: `<p>In the app I set the number of steps and the material thickness, then shape the piece with two graphs.
            One controls the spacing between each step, the other the overall step height, both over the distance
            radiating out from the beetle.</p>
            <p>Changing the curves gives completely different forms: the beetle can rise up like a hill, sink into
            a valley or sit at the bottom of a tunnel.</p>`,
        },
        {
          type: "gallery",
          columns: 2,
          items: [
            { src: "assets/blog/beetle/beetle-tunnel-layers-3d-preview.jpg", alt: "3D preview of the beetle sunk into a tunnel of rainbow coloured layers", caption: "The tunnel version: nine sheets stepping down to the beetle" },
            { src: "assets/blog/beetle/beetle-tunnel-layers-3d-close-up.jpg", alt: "Close-up of the stepped rainbow layers in the 3D preview", caption: "Up close in the 3D preview" },
          ],
        },
        {
          type: "split",
          image: "assets/blog/beetle/beetle-layered-card-test-cut.jpg",
          imageAlt: "The finished test: nine layers of white card stacked into a beetle shaped tunnel, with alignment pin holes",
          html: `<p>Before cutting anything I can look at the whole stack in 3D, then the app exports a separate vector for
            each layer, ready to send to the laser cutter.</p>
            <p>I've also added laser cut pin holes around the edges for easy alignment of the layers. This is the first
            test, cut from white card.</p>`,
        },
        {
          type: "text",
          html: `<p>It was made for the beetles, but I might end up using it for some of my own work too.</p>`,
        },
        { type: "buttons", items: [{ label: "See the laser cut art", href: "/lasercut-art" }, { label: "Commission a piece", href: "/contact", style: "outline" }] },
      ],
    },

    "animation": {
      title: "Animation",
      description: "Featured animation work, mostly bespoke content for video projection mapping at light festivals, trade shows and advertising.",
      blocks: [
        {
          type: "text",
          title: "Animation",
          html: `<p>Featured animation work from various projects, mostly bespoke content for video projection mapping
            at light festivals, trade shows and advertising.</p>`,
        },
        { type: "buttons", items: [HIRE] },
        { type: "projects", under: "animation", filters: false },
      ],
    },

    // Animation projects, listed on /animation. Their cards sit where the old Animation card was (order 4.x).
    "animation/building-transformation": seriesProject({
      title: "Building Transformation", url: vimeo(287969585),
      text: "As part of a larger project I 3D modelled, textured and animated this building from a single photograph, aligning the model to match the perspective.",
      types: ["Animation", "Projection Mapping"], order: 4.1, back: BACK_TO_ANIMATION,
    }),

    "animation/sacred-geometry-shadowplay": seriesProject({
      title: "Sacred Geometry Shadowplay", url: vimeo(260922871),
      text: "A personal experiment with depth based illusions and semi procedural animation. The icosahedron emits light that casts shadows on the geometry behind it, and the bricks change size based on how close the icosahedron is.",
      types: ["Animation"], order: 4.2, image: "assets/projects/3d-animation-projection-mapping-render.jpg", back: BACK_TO_ANIMATION,
    }),

    "animation/tmg-world-publishers-expo": seriesProject({
      title: "TMG, World Publishers Expo", url: vimeo(109335673),
      text: "Projected above a booth at the World Publishers Expo, on two sides of a huge rectangular box. I used the shape to create a sense of depth, with the animations appearing to be inside the box.",
      types: ["Projection Mapping", "Animation"], order: 4.3, year: 2014, back: BACK_TO_ANIMATION,
    }),

    "animation/from-chaos-comes-order": seriesProject({
      title: "From Chaos Comes Order", url: vimeo(260921044),
      types: ["Animation"], order: 4.4, back: BACK_TO_ANIMATION,
    }),

    "animation/stena-boat-mapping": seriesProject({
      title: "Stena Boat Mapping", url: vimeo(157117968),
      text: "Video projection mapping onto a Stena Drillmax boat, following the client's brief to show everyone involved in the company alongside 3D illusionary animations of the boat being built.",
      types: ["Projection Mapping", "Animation"], order: 4.5, year: 2016, image: "assets/projects/stena-drillmax-boat-projection-mapping.jpg", back: BACK_TO_ANIMATION,
    }),

    "animation/halloween-face-projection": seriesProject({
      title: "Halloween Face Projection", url: vimeoPlain(144041807),
      text: "For a Halloween VJ show projected onto a large 3D face sculpture. Using a 3D model and photogrammetry head scan, the depth based animations appear to peer inside the head as the face breaks apart to reveal the skull, then the eyes and brain.",
      types: ["Projection Mapping", "Animation"], order: 4.6, year: 2013,
      back: BACK_TO_ANIMATION,
    }),

    "animation/face-sculpture-animation-tests": seriesProject({
      title: "Face Sculpture Animation Tests", url: vimeoPlain(167272327),
      text: "Test animations for one of the projection mapped face sculptures, trying out different materials and lighting techniques.",
      types: ["Projection Mapping", "Animation"], order: 4.7,
      links: [{ label: "See the sculptures", href: "/sculptural-work", style: "outline" }],
      back: BACK_TO_ANIMATION,
    }),

    "animation/3d-illusion-vj-loop-pack": seriesProject({
      title: "3D Illusion VJ Loop Pack", url: vimeoPlain(296706643),
      text: "A promo for one of my VJ packs: 45 looping animations that create 3D projection mapping illusions on a flat screen, with no special 3D objects needed.",
      types: ["Projection Mapping", "Animation"], order: 4.8,
      links: [{ label: "Get the VJ pack", href: "/vj-shop/thinking-inside-the-box-volume-1" }],
      back: BACK_TO_ANIMATION,
    }),

    "animation/mayan-pyramid-visual-show": seriesProject({
      title: "Mayan Pyramid Visual Show", url: vimeoPlain(49673486),
      text: "Animations for a Mayan pyramid themed VJ show celebrating the end of the world in 2012.",
      types: ["Animation"], order: 4.9, year: 2012, image: "assets/projects/mayan-pyramid-visual-show.jpg",
      back: BACK_TO_ANIMATION,
    }),

    "animation/projection-mapped-cube-installation": seriesProject({
      title: "Projection Mapped Cube Installation", url: vimeoPlain(57330169),
      text: "An early personal project creating and testing 3D animation and projection mapping techniques on simple geometry.",
      types: ["Projection Mapping", "Animation"], order: 4.10, year: 2013, image: "assets/projects/projection-mapped-cube-installation.jpg",
      back: BACK_TO_ANIMATION,
    }),

    "animation/dj-character-animation": seriesProject({
      title: "DJ Character Animation", url: vimeoPlain(107583598),
      text: "A couple of animations created for a DJ, featuring character animation and rigging of a model.",
      types: ["Animation"], order: 4.11,
      back: BACK_TO_ANIMATION,
    }),

    "animation/shpongletron-dj-booth-visuals": seriesProject({
      title: "Shpongletron DJ Booth Visuals", url: vimeoPlain(28653533),
      text: "Some of my earliest animation work: visuals for the custom DJ booth on Shpongle's North American tour.",
      types: ["Animation"], order: 4.12, year: 2011, image: "assets/projects/shpongletron-dj-booth-visuals.jpg",
      back: BACK_TO_ANIMATION,
    }),

    "showreel": {
      title: "Showreel",
      project: { order: 10, title: "2016 Showreel", types: ["Animation", "3D & VR"], year: 2016, image: "assets/projects/1000-errors-2016-showreel.jpg", summary: "Highlights across projection mapping, animation, VR, laser cut woodwork and 3D printing." },
      blocks: [
        {
          type: "text",
          title: "Showreel",
          html: `<p>Featured work across a variety of artistic disciplines: bespoke content for video projection mapping at
            light festivals, trade shows and advertising, virtual reality simulation, CAD-designed laser cut woodwork art and 3D printing.</p>`,
        },
        { type: "buttons", items: [HIRE] },
        { type: "video", title: "2016 Showreel", url: vimeo(207159098) },
      ],
    },

    "virtual-reality": {
      title: "Virtual Reality",
      project: { order: 6, types: ["3D & VR"], image: "assets/projects/photoreal-vr-house-unreal-engine.jpg", summary: "A photoreal real-time house simulation, 360° previews and immersive VR art." },
      blocks: [
        {
          type: "text",
          title: "Virtual Reality",
          html: `<p>A photoreal simulation of the interior of my house, running in real time as an interactive VR experience in Unreal Engine 4.</p>`,
        },
        { type: "video", url: vimeo(116145076) },
        {
          type: "split",
          image: "assets/projects/vr-house-simulation-room.jpg",
          imageAlt: "A room from the photoreal VR house simulation",
          title: "Skills demonstrated",
          html: `<ul>
            <li>3D modelling and texturing</li>
            <li>Physically based shader creation from photographs</li>
            <li>Photogrammetry: 3D mesh creation from photographs</li>
            <li>Mesh optimisation for game engines</li>
            <li>Standalone virtual reality app creation</li>
          </ul>`,
        },
        {
          type: "videos",
          title: "More VR work",
          items: [
            { title: "Virtual Projection Mapping Preview", url: vimeoPlain(330727186),
              text: "Freelance work for FunktionCreep: projection mapping content for four interior walls of a hotel that hadn't been built yet. To test it and preview it for the client, I modelled the room, virtually projection mapped the content onto its walls, and rendered a 360° video to view on a tablet or VR headset." },
            { title: "Immersive VR Art", url: vimeoPlain(207453219),
              text: "One of many personal experiments in immersive virtual reality art, rendered as a 360° video so it can be shared online and watched on phones and VR headsets without running the real-time scene." },
          ],
        },
        {
          type: "split",
          image: "assets/temple/temple-jaguar-head-entrance.jpg",
          imageAlt: "The temple exterior, with the jaguar head entrance",
          title: "Architectural design in VR",
          html: `<p>A commissioned design for a temple, modelled in Maya and built as a real-time virtual reality
            simulation in Unreal Engine, so the whole structure could be walked around at full scale.</p>`,
          buttons: [{ label: "See the temple design", href: "/architectural-design", style: "outline" }],
        },
        { type: "buttons", items: [HIRE, { label: "3D modelling & photogrammetry", href: "/3d-modelling", style: "outline" }] },
      ],
    },

    "architectural-design": {
      title: "Architectural Design",
      project: { order: 5, title: "Temple Design", types: ["Architecture", "3D & VR", "Commissions"], year: 2023, summary: "A commissioned temple design, modelled in Maya and explored at full scale in virtual reality." },
      description: "A commissioned temple design, modelled in Maya and explored as a walkable real-time VR simulation in Unreal Engine.",
      blocks: [
        {
          type: "text",
          title: "Architectural Design",
          html: `<p>I was commissioned to design a temple. Although the project never came to fruition, this is
            the design I developed over the course of about a month.</p>`,
        },
        {
          type: "split",
          image: "assets/temple/temple-jaguar-head-entrance.jpg",
          imageAlt: "The temple exterior, with the jaguar head entrance",
          html: `<p>The design wasn't fully completed: I had planned to add more detail and make each of the seven outer sections
            completely unique. This is what I was able to accomplish within the limited time frame.</p>`,
        },
        {
          type: "gallery",
          title: "Exterior",
          columns: 2,
          items: [
            { src: "assets/temple/temple-aerial-view.jpg", alt: "Aerial view of the temple and its seven outer sections" },
            { src: "assets/temple/temple-seven-pointed-star-roof.jpg", alt: "Top-down view of the seven-pointed star roof" },
            { src: "assets/temple/temple-jaguar-entrance-side.jpg", alt: "Side view of the jaguar head entrance" },
            { src: "assets/temple/temple-jaguar-mouth.jpg", alt: "Looking up into the jaguar's mouth at the entrance" },
          ],
        },
        {
          type: "split",
          reverse: true,
          image: "assets/temple/temple-entrance-walkthrough.jpg",
          imageAlt: "Walking through the entrance towards the inner archway",
          title: "Built to walk through",
          html: `<p>All the images are screenshots from a real-time virtual reality simulation I created. The 3D modelling was done
            in Maya, and the VR experience was built in Unreal Engine.</p>
            <p>It was an amazing experience being able to walk around the entire structure, gaining a true sense of its scale and scope.</p>`,
        },
        {
          type: "gallery",
          title: "Interior",
          columns: 3,
          items: [
            { src: "assets/temple/temple-inner-archway.jpg", alt: "The inner archway and patterned floor" },
            { src: "assets/temple/temple-ceiling.jpg", alt: "The ceiling above the inner archway" },
            { src: "assets/temple/temple-star-window-archway.jpg", alt: "The inner archway with its seven-pointed star window" },
            { src: "assets/temple/temple-inlaid-star-floor.jpg", alt: "The inlaid star pattern on the floor" },
            { src: "assets/temple/temple-ceiling-lantern.jpg", alt: "The central ceiling lantern" },
            { src: "assets/temple/temple-carved-pillars.jpg", alt: "Carved pillars" },
            { src: "assets/temple/temple-ouroboros-altar-wall.jpg", alt: "The ouroboros altar wall" },
            { src: "assets/temple/temple-ouroboros-seed-of-life-altar.jpg", alt: "The ouroboros and seed of life altar" },
            { src: "assets/temple/temple-lattice-detail.jpg", alt: "Close-up of the interlaced lattice" },
          ],
        },
        { type: "buttons", items: [HIRE, { label: "Virtual reality work", href: "/virtual-reality", style: "outline" }] },
      ],
    },

    "interactive-art": {
      title: "Interactive Art",
      description: "Experiments in interactive, real-time audio-visual art using Kinect motion tracking, MIDI controllers and Ableton Live.",
      blocks: [
        {
          type: "text",
          title: "Interactive Art",
          html: `<p>Most of these projects are my own experimental research into interactive art, combining skeletal tracking with
            the Xbox Kinect sensor, MIDI from controllers and MIDI routed from Ableton Live for some audio-visual fun.
            They were made between 2012 and 2014, so the graphics are of their time.</p>`,
        },
        { type: "projects", under: "interactive-art", filters: false },
        { type: "buttons", items: [HIRE] },
      ],
    },

    // Interactive art projects, listed on /interactive-art.
    "interactive-art/kinect-3d-geometry-and-sound": seriesProject({
      title: "Kinect Controlling 3D Geometry and Sound", url: vimeoPlain(35310732),
      text: "My right hand moves the cube through 3D space. My left hand sets how fast it spins and sweeps the synth's filter, and changes its colour. My head's position controls a feedback effect and the pitch of the sound. Built with Synapse for Kinect, Max for Live and Ableton Live, routing the same MIDI signals into VDMX and a Quartz Composer patch. Thanks to Ryan Challinor for the original Synapse software.",
      types: ["Interactive"], order: 9.1, year: 2012, image: "assets/projects/kinect-interactive-visuals-demo.jpg", back: BACK_TO_INTERACTIVE,
    }),

    "interactive-art/hand-tracking-experiment": seriesProject({
      title: "Real-time 3D Experiment #5: Hand Tracking", url: vimeoPlain(96156572),
      text: "The fifth in a series of experiments in real-time, interactive 3D visuals. The Kinect depth camera tracks the user's hands: the right hand moves the first sphere, the left hand controls the trails effect. Geometry made in Maya, composed in Quartz Composer, tracked with NI mate.",
      types: ["Interactive"], order: 9.2, back: BACK_TO_INTERACTIVE,
    }),

    "interactive-art/crystal-visual-show": seriesProject({
      title: "Crystal Visual Show: Development Preview", url: vimeoPlain(96164767, "ccb74964a9"),
      text: "A work-in-progress preview of our interactive real-time 3D visual show: dynamic lighting controlled by MIDI, OSC or sound, projection mapping of the real-time visuals, and interactive video textures mapped onto the geometry.",
      types: ["Interactive", "Projection Mapping"], order: 9.3, back: BACK_TO_INTERACTIVE,
    }),

    "interactive-art/midi-control-experiment": seriesProject({
      title: "Real-time 3D Experiment #4: MIDI Control", url: vimeoPlain(96133741),
      text: "The fourth in the series: a MIDI controller manipulates the 3D geometry in real time. Geometry made in Maya, composed in Quartz Composer.",
      types: ["Interactive"], order: 9.4, back: BACK_TO_INTERACTIVE,
    }),

    "interactive-art/xbox-controller-sphere": seriesProject({
      title: "Xbox Controller Sphere", url: vimeoPlain(106208685),
      text: "A Quartz Composer piece where an Xbox controller moves a sphere through 3D space. The small sphere also moves the scene's light and triggers shatter effects on the larger sphere as it gets close.",
      types: ["Interactive"], order: 9.5, year: 2014, back: BACK_TO_INTERACTIVE,
    }),

    "interactive-art/ableton-live-projection-mapping": seriesProject({
      title: "Projection Mapping Controlled by Ableton Live", url: vimeoPlain(15593783),
      text: "An early proof of concept: images warped to fit the geometry being projected onto, with playback triggered in real time by MIDI sequenced in Ableton Live and sent to Resolume Avenue.",
      types: ["Interactive", "Projection Mapping"], order: 9.6, year: 2010, image: "assets/projects/ableton-live-projection-mapping-test.jpg", back: BACK_TO_INTERACTIVE,
    }),

    "3d-modelling": {
      title: "3D Modelling & Photogrammetry",
      description: "Interactive 3D models: VR sculpting, architectural visualisation, product previsualisation and photogrammetry.",
      blocks: [
        {
          type: "text",
          title: "3D Modelling & Photogrammetry",
          html: `<p>A few examples of my 3D modelling and photogrammetry work. These are interactive 3D models: drag to turn them
            around on screen, or view them in virtual reality with a headset.</p>`,
        },
        { type: "projects", under: "3d-modelling", filters: false },
        { type: "buttons", items: [HIRE, { label: "Virtual reality work", href: "/virtual-reality", style: "outline" }] },
      ],
    },

    // 3D modelling and photogrammetry projects (Sketchfab models), listed on /3d-modelling.
    "3d-modelling/alien-squidboy": seriesProject({
      title: "Alien Squidboy", url: sketchfab("02dd8b47c8074beda067337d6f92ece5"),
      text: "A character I designed in virtual reality using voxel based sculpting.",
      types: ["3D & VR"], order: 11.1, image: "assets/projects/alien-squidboy-vr-sculpt.jpg", back: BACK_TO_3D,
    }),

    "3d-modelling/torus-temple": seriesProject({
      title: "Torus Temple", url: sketchfab("6676d2ca1ee24ca3b85d42298d5a8734"),
      text: "Architectural visualisation of an immersive space for a music festival, built with hard surface modelling in Maya and voxel sculpting with Oculus Medium in VR.",
      types: ["3D & VR", "Architecture"], order: 11.2, image: "assets/projects/torus-temple-3d-model.jpg", back: BACK_TO_3D,
    }),

    "3d-modelling/light-01": seriesProject({
      title: "Light 01", url: sketchfab("e446786f868343af82195205ee5c0278"),
      text: "A lamp I designed, fully previsualised in 3D before being built for real.",
      types: ["3D & VR"], order: 11.3, image: "assets/projects/light-01-lamp-design.jpg", back: BACK_TO_3D,
    }),

    "3d-modelling/office-chair": seriesProject({
      title: "Office Chair", url: sketchfab("c1173cc219634b9393d4773a62f0ffa6"),
      text: "A model of my office chair, showing accurate 3D modelling of a real object.",
      types: ["3D & VR"], order: 11.4, image: "assets/projects/office-chair-3d-model.jpg", back: BACK_TO_3D,
    }),

    "3d-modelling/romanesco-broccoli": seriesProject({
      title: "Romanesco Broccoli", url: sketchfab("289764f617bd43c79350a258d3ee2677"),
      text: "A photogrammetry capture showing the level of detail I can capture from real objects, useful for VR experiences and previsualisation.",
      types: ["3D & VR"], order: 11.5, image: "assets/projects/romanesco-broccoli-photogrammetry.jpg", back: BACK_TO_3D,
    }),

    "3d-modelling/hindu-head": seriesProject({
      title: "Hindu Head", url: sketchfab("9f51bcee73584940adf70b36e6198cbe"),
      text: "Captured with photogrammetry, then reduced from 1.5 million polygons to 5,000 while keeping the detail in the textures: an optimised, game-engine ready asset from a real object.",
      types: ["3D & VR"], order: 11.6, image: "assets/projects/hindu-head-photogrammetry.jpg", back: BACK_TO_3D,
    }),

    "light-installations": {
      title: "Light Installations",
      project: { order: 1, title: "Sacred Geometry Flower Garden", types: ["Installations", "Light Art", "Lasercut"], image: "assets/flower-garden/sacred-geometry-flower-rainbow-led.jpg", imageAlt: "A laser cut sacred geometry flower mandala glowing in rainbow LED colours", summary: "Towering laser cut sunflower mandalas that light up at night: a walk-through installation for festivals, shown at Boom Festival." },
      description: "The Sacred Geometry Flower Garden: a walk-through LED light installation of laser cut mandala flowers, shown at Boom Festival and available to hire.",
      blocks: [
        {
          type: "text",
          title: "Sacred Geometry Flower Garden",
          html: `<p>A woodwork art installation of towering sunflowers in the shape of sacred geometry mandalas,
            transporting visitors to a mystical realm of beauty and wonder. Shown at Boom Festival, and available to hire
            for festivals and events.</p>`,
        },
        { type: "video", url: "https://player.vimeo.com/video/800900132?h=ed357924be" },
        {
          type: "split",
          image: "assets/flower-garden/laser-cut-wood-flower-mandalas-daylight.jpg",
          imageAlt: "The flower garden's layered laser cut wooden mandalas in daylight",
          html: `<p>Experience the harmonious interplay of natural form and mathematical precision, creating an atmosphere of tranquillity and serenity.</p>`,
        },
        {
          type: "split",
          reverse: true,
          image: "assets/flower-garden/sacred-geometry-flower-purple-led.jpg",
          imageAlt: "A sacred geometry mandala flower glowing purple with LED lighting at night",
          html: `<p>At night the installation comes to life with colour-changing LED lighting, creating a captivating visual experience.</p>`,
        },
        {
          type: "split",
          image: "assets/flower-garden/flower-garden-festival-visitors-night.jpg",
          imageAlt: "Festival visitors walking among the illuminated flowers at night",
          html: `<p>The perfect addition to any festival: a calming oasis amid the excitement of the festival grounds.
            Whether you love art, nature or geometry, or are simply looking for a unique and memorable experience,
            the Sacred Geometry Flower Garden is not to be missed.</p>`,
          buttons: [{ label: "Book it for your event", href: "/contact" }, { label: "Commissions & hire", href: "/commissions", style: "outline" }],
        },
        { type: "gallery", items: [
          { src: "assets/flower-garden/sacred-geometry-flower-purple-led.jpg", alt: "A mandala flower glowing purple at night, with the rest of the garden behind it" },
          { src: "assets/flower-garden/sacred-geometry-flower-rainbow-led.jpg", alt: "A mandala flower glowing in rainbow colours" },
          { src: "assets/flower-garden/flower-garden-festival-visitors-night.jpg", alt: "Visitors walking among the illuminated flowers at night" },
          { src: "assets/flower-garden/laser-cut-wood-flower-mandalas-daylight.jpg", alt: "The flowers' layered wooden mandalas in daylight" },
          { src: "assets/flower-garden/colour-changing-led-flower-mandalas.jpg", alt: "The mandala flowers in different LED colours, with festival crowds" },
        ], columns: 5 },
      ],
    },

    "lasercut-art": {
      title: "Lasercut Art",
      project: { order: 8, title: "Sacred Geometry Light Art", types: ["Lasercut", "Light Art"], summary: "Smaller pieces in layered laser cut wood, many lit from within with colour-changing LEDs." },
      description: "Sacred geometry light art, laser cut from layered wood and illuminated with LEDs.",
      blocks: [
        {
          type: "text",
          title: "Lasercut Art",
          html: `<p>I am deeply fascinated by sacred geometry, the mathematical principles found throughout the natural world that
            form the very building blocks of our reality. It reveals itself in countless patterns and structures: the hexagons bees
            craft in their honeycombs, the Fibonacci spirals in the arrangement of sunflower seeds, and the same spirals in the
            Milky Way itself.</p>
            <p>From the smallest organisms to the vast expanse of the cosmos, it is a reminder of the interconnectedness of all
            things and the harmony that governs existence. It has been a strong influence on my art, in which I try to express the
            universal beauty found in sacred geometry.</p>`,
        },
        {
          type: "split",
          image: "assets/lasercut/olly-balsom-hexstatic-illuminated-wall-art.jpg",
          imageAlt: "Olly Balsom holding the Hexstatic illuminated wall art",
          title: "Sacred Geometry Light Art",
          html: `<p>These are some of the smaller pieces I create, each laser cut from multiple layers of wood and many of them
            lit from within with colour-changing LEDs. Some are available in the shop.</p>`,
          buttons: [{ label: "Shop woodwork art", href: "/c/woodwork-art" }, { label: "Commission a piece", href: "/contact", style: "outline" }],
        },
        {
          type: "gallery",
          columns: 4,
          items: [
            { src: "assets/lasercut/hexagonal-wall-art-led-detail.jpg", alt: "Close-up of layered hexagonal laser cut wall art lit with warm LEDs" },
            { src: "assets/lasercut/layered-hexagon-pattern-wood-detail.jpg", alt: "Close-up of a layered hexagon pattern in laser cut wood" },
            { src: "assets/lasercut/hexagon-mandala-laser-cut-wood.jpg", alt: "A hexagonal sacred geometry mandala in layered laser cut wood, held up outdoors" },
            { src: "assets/lasercut/lotus-flower-of-life-lamp.jpg", alt: "The Lotus Flower of Life lamp in laser cut wood, with an Edison bulb" },
            { src: "assets/lasercut/seed-of-life-light-sculpture.jpg", alt: "The Seed of Life light sculpture, illuminated on its stand" },
            { src: "assets/lasercut/lotus-mandala-red-led.jpg", alt: "A lotus-shaped mandala in layered wood, glowing red" },
            { src: "assets/lasercut/mandala-macrame-dreamcatcher-turquoise-led.jpg", alt: "A turquoise-lit mandala with a macramé dreamcatcher hanging beneath it" },
            { src: "assets/lasercut/septagram-light-sculpture-purple-led.jpg", alt: "The Septagram light sculpture glowing purple" },
            { src: "assets/lasercut/septagram-light-sculpture-close-up.jpg", alt: "Close-up of the Septagram light sculpture" },
            { src: "assets/lasercut/triangular-honeycomb-wall-art.jpg", alt: "Triangular laser cut wall art with honeycomb and star patterns" },
            { src: "assets/lasercut/hexagon-flower-mandala-wood.jpg", alt: "A flower-shaped mandala of interlocking hexagons in layered wood" },
            { src: "assets/lasercut/laser-cut-pyramid-lamp-maze-pattern.jpg", alt: "A laser cut wooden pyramid lamp with a maze-like pattern" },
            { src: "assets/lasercut/laser-cut-pyramid-lamp-lit.jpg", alt: "The laser cut pyramid lamp lit from inside" },
            { src: "assets/lasercut/seed-of-life-mandala-turquoise-led.jpg", alt: "A seed of life mandala glowing turquoise" },
            { src: "assets/lasercut/seed-of-life-mandala-pink-led.jpg", alt: "A seed of life mandala glowing pink" },
            { src: "assets/lasercut/olly-balsom-illuminated-mandala-wall-art.jpg", alt: "Olly Balsom in front of an illuminated mandala wall piece" },
            { src: "assets/lasercut/lotus-mandala-blue-led.jpg", alt: "A lotus mandala lit blue" },
            { src: "assets/lasercut/quintessence-light-sculpture.jpg", alt: "The Quintessence light sculpture, illuminated" },
          ],
        },
      ],
    },

    // Wedding and interior work lives on the sister site, Parabolic Arts. The cards still show here but link there.
    "lasercut-art/wedding-archway": {
      title: "Wedding Archway",
      project: { order: 2, types: ["Lasercut", "Commissions", "Light Art"], year: 2019, image: "assets/archway/wedding-archway-bride-groom-olly-balsom.jpg", summary: "A 9ft illuminated archway with 13 unique mandalas, designed to travel to weddings anywhere in the world.",
        href: "https://parabolicarts.uk/geometric-archway", ...PARABOLIC },
    },

    "lasercut-art/room-divider": {
      title: "Room Divider",
      project: { order: 3, types: ["Lasercut", "Commissions"], year: 2023, image: "assets/room-divider/laser-cut-room-divider-patterned-shadows.jpg", summary: "A bespoke room divider for a client’s home, combining the aesthetics of Islamic patterns and Christian church windows in three layers of laser cut wood.",
        href: "https://parabolicarts.uk/architectural-room-divider-installation", ...PARABOLIC },
    },

    "sculptural-work": {
      title: "Sculptural Work",
      project: { order: 7, title: "Projection Mapped Face Sculptures", types: ["Sculpture", "Projection Mapping"], summary: "Two face sculptures, designed, built, animated and projection mapped for festival visual shows." },
      description: "The build process of two video projection mapped face sculptures, designed, built, animated and mapped for music festival visual shows.",
      blocks: [
        {
          type: "text",
          title: "Sculptural Work",
          html: `<p>This page documents the build process of two video projection mapped face sculptures which I, along with
            the help of two others, designed, built, 3D animated and video projection mapped as part of two visual shows for music festivals.</p>`,
        },
        {
          type: "split",
          image: "assets/sculpture/projection-mapped-face-sculpture-stage.jpg",
          imageAlt: "The larger face sculpture with projections, behind the DJ booth",
          title: "From sketch to stage",
          html: `<p>The larger of the two faces stood 2.5m tall. Every stage of the build was checked against the digital model
            used for the animation, so the projections would land precisely on the finished sculpture.</p>`,
        },
        {
          type: "gallery",
          title: "Concept and prototypes",
          columns: 2,
          items: [
            { src: "assets/sculpture/face-sculpture-concept-sketch.jpg", caption: "An early design concept sketch with the 3D face already included." },
            { src: "assets/sculpture/face-sculpture-3d-printed-prototype.jpg", caption: "A further developed small scale prototype that combines 3D printing and multiple layers of laser cut wood." },
            { src: "assets/sculpture/face-sculpture-early-3d-prototype.jpg", caption: "Another early 3D prototype, used to work out how much of the face to include so the projections would not distort when projected from too steep an angle." },
            { src: "assets/sculpture/face-sculpture-miniature-test-projection.jpg", caption: "An early test projection on the miniature scale model, making sure everything worked well." },
          ],
        },
        {
          type: "gallery",
          title: "Building the full-size face",
          columns: 4,
          items: [
            { src: "assets/sculpture/face-sculpture-interlocking-wood-prototype.jpg", caption: "Software turned the 3D mesh into a series of interlocking pieces of wood, laser cut and slotted together. This was a small scale prototype." },
            { src: "assets/sculpture/face-sculpture-chicken-wire-frame.jpg", caption: "On the full size version, chicken wire bridged the gaps between the wood." },
            { src: "assets/sculpture/face-sculpture-papier-mache-layer.jpg", caption: "A layer of papier-mâché was then built up over the chicken wire." },
            { src: "assets/sculpture/face-sculpture-wireframe-projection-test.jpg", caption: "A wireframe image of the digital model projection mapped onto the physical sculpture to test for discrepancies." },
          ],
        },
        {
          type: "gallery",
          title: "Checking against the digital model",
          columns: 3,
          items: [
            { src: "assets/sculpture/face-sculpture-photogrammetry-capture.jpg", caption: "A photogrammetry capture of the physical sculpture, so it could be compared closely with the digital version used for animation." },
            { src: "assets/sculpture/face-sculpture-digital-model-comparison.jpg", caption: "The capture imported into the modelling software, to compare the two and make small adjustments to the animation model." },
            { src: "assets/sculpture/face-sculpture-side-view-comparison.jpg", caption: "A side view comparing the physical sculpture and the original digital model." },
          ],
        },
        {
          type: "gallery",
          title: "Adding finer detail",
          columns: 4,
          items: [
            { src: "assets/sculpture/face-sculpture-detail-sections.jpg", caption: "Separating the face into sections by level of detail allowed more pieces of wood to be used where the detail was finer." },
            { src: "assets/sculpture/face-sculpture-high-detail-wood-pieces.jpg", caption: "The higher detail areas, built from more pieces of wood." },
            { src: "assets/sculpture/face-sculpture-hessian-clay-features.jpg", caption: "A layer of hessian, then a mix of clay and papier-mâché, used to create these features." },
            { src: "assets/sculpture/face-sculpture-inserted-features.jpg", caption: "The features were inserted into the larger, simpler face, so the fine details could be worked on separately." },
          ],
        },
        {
          type: "gallery",
          title: "Finishing",
          columns: 3,
          items: [
            { src: "assets/sculpture/face-sculpture-sanded-surface.jpg", caption: "Another view of the face after more layers and sanding." },
            { src: "assets/sculpture/face-sculpture-painted-eyes.jpg", caption: "After some paint had been added." },
            { src: "assets/sculpture/face-sculpture-2-5m-face-from-above.jpg", caption: "The 2.5m tall face from above." },
          ],
        },
        {
          type: "gallery",
          title: "The finished sculptures",
          columns: 4,
          items: [
            { src: "assets/sculpture/projection-mapped-face-sculpture-performer.jpg", caption: "The larger of the two faces with projections." },
            { src: "assets/sculpture/projection-mapped-face-sculpture-stage.jpg", caption: "The larger face with additional details projected onto it." },
            { src: "assets/sculpture/small-projection-mapped-face-sculpture.jpg", caption: "The smaller of the two projection mapped face sculptures." },
            { src: "assets/sculpture/face-sculpture-festival-dj-booth.jpg", caption: "A face sculpture behind the DJ booth at a festival." },
          ],
        },
        { type: "buttons", items: [{ label: "Commission a piece", href: "/contact" }, { label: "See the animation work", href: "/animation", style: "outline" }] },
      ],
    },

    "vj-shop": {
      title: "VJ Shop",
      description: "Animation packs for VJs, projection mapping artists, live visual performances and projections on buildings.",
      blocks: [
        {
          type: "text",
          title: "VJ Shop",
          html: `<p>Animation packs designed for VJs, projection mapping artists, live visual performances and projections on buildings.</p>
            <p>Custom video projection mapping example projects for Resolume Arena are included with the deluxe versions of some packs.</p>`,
        },
        {
          type: "videos",
          items: [
            { title: "Thinking Inside The Box Vol. 1", url: vimeo(296706643), href: "/vj-shop/thinking-inside-the-box-volume-1", label: "Details & buy" },
            { title: "Aztron", url: vimeo(243080452), href: "/vj-shop/aztron", label: "Details & buy" },
            { title: "Animated Lines", url: vimeo(125976644), href: "/vj-shop/animated-lines", label: "Details & buy" },
            { title: "Cosmic Geometry", url: vimeo(121518261), href: "/vj-shop/cosmic-geometry", label: "Details & buy" },
            { title: "The Tetrahedron Mapping Series Vol. 1", url: vimeo(162389861), href: "/vj-shop/the-tetrahedron-mapping-series-volume-1", label: "Details & buy" },
            { title: "The Tetrahedron Mapping Series Vol. 2", url: vimeo(200886613), href: "/vj-shop/the-tetrahedron-mapping-series-volume-2", label: "Details & buy" },
            { title: "The Tetrahedron Mapping Series Vol. 3", url: vimeo(250245074), href: "/vj-shop/the-tetrahedron-mapping-series-volume-3", label: "Details & buy" },
            { title: "Hexagonal 3D Cubes Vol. 1", url: vimeo(106902410), href: "/vj-shop/hexagonal-3d-cubes-volume-1", label: "Details & buy" },
            { title: "Hexagonal 3D Cubes Vol. 2", url: vimeo(107514447), href: "/vj-shop/hexagonal-3d-cubes-volume-2", label: "Details & buy" },
            { title: "Hexagonal 3D Cubes Vol. 3", url: vimeo(112815197), href: "/vj-shop/hexagonal-3d-cubes-volume-3", label: "Details & buy" },
            { title: "Hexagonal 3D Cubes Vol. 4", url: vimeo(124158316), href: "/vj-shop/hexagonal-3d-cubes-volume-4", label: "Details & buy" },
          ],
        },
        { type: "video", title: "Happy Customer Video Showcase #1", url: vimeo(120812956) },
        BESPOKE_VISUALS,
      ],
    },

    "vj-shop/thinking-inside-the-box-volume-1": vjPack({
      title: "Thinking Inside The Box Vol. 1",
      intro: [
        "A pack of 3D animated, looping videos designed for live visual artists and VJs.",
        "The concept behind this pack was to create 3D projection mapping illusions without needing any specialised 3D objects to map onto. Simply use it on a flat screen to create mind-bending 3D illusions that will instantly wow your audience!",
      ],
      video: vimeo(296706643),
      features: [
        "30 seamless looping videos (45 in the Deluxe version)",
        "Greyscale versions for masking other content (Deluxe version only)",
        "120 bpm loops",
        "Animation movements cycle in measures of 4: adjust the overall playback rate in your VJ software to sync every clip to 4/4 electronic music",
        "Different colour themes available by adjusting the hue in your VJ software",
        FORMATS,
      ],
      buy: [["Buy Standard Version", "MpzqL"], ["Buy Deluxe Version", "SAcMG"]],
    }),

    "vj-shop/aztron": vjPack({
      title: "Aztron",
      intro: [
        "A pack of 3D animated, looping videos designed for live visual artists and VJs. Bold neon lines and complex white geometric patterns create an aesthetic somewhere between Aztec and Tron, which is where the name Aztron was born.",
      ],
      video: vimeo(243080452),
      features: ["25 seamless looping animations", "Long smooth loops (mostly 48 seconds each)", "Over 16 minutes of content in total", FORMATS],
      extras: [{ type: "video", title: "All 25 loops in full", url: vimeo(243086568, "b27289b31a") }],
      buy: [["Buy now", "odanj"]],
    }),

    "vj-shop/animated-lines": vjPack({
      title: "Animated Lines",
      intro: [
        "A multipurpose animation pack designed for video projection mapping. Using mapping software, these line animations can be mapped along the edges of real-life 3D objects to easily create a Tron-like animated wireframe look.",
        "Map them onto the edges of 3D objects using software such as MadMapper, Mapio or Resolume Arena.",
      ],
      video: vimeo(125976644),
      features: [
        "120 seamless looping animations in a single-line 1920×10 format",
        "120 seamless looping animations in a rectangle border 1920×1080 format",
        "Different shaped pixel patterns imitate LED strip lights",
        "Line-shaped videos can be mapped along the edges of 3D objects",
        "All animations designed around the same shape",
        "All animations share the same green-to-blue colour; adjust the hue in your software for more colour themes",
        "Colour and number coded mapping helper image to simplify the mapping process",
        FORMATS,
        "Bonus Resolume Arena project file",
        "2 bonus Resolume Arena mapping presets to get you mapping lines and other footage quickly",
        "45-minute tutorial and the Resolume Arena project file from the preview video",
      ],
      extras: [{ type: "video", title: "Tutorial preview (sped up)", url: vimeo(126670022, "b27289b31a") }],
      buy: [["Buy now", "krvDz"]],
    }),

    "vj-shop/cosmic-geometry": vjPack({
      title: "Cosmic Geometry",
      intro: [
        "A pack of 3D animated, looping videos designed for live visual artists and VJs. It shares a similar aesthetic to the Hexagonal Mapping Series, adapted to suit regular rectangular screens.",
      ],
      video: vimeo(242049950),
      features: [
        "25 seamless looping animations",
        "Long smooth loops (12–24 seconds each)",
        "Animation movements cycle in measures of 4: adjust the overall playback rate in your VJ software to sync every clip to 4/4 electronic music",
        "Different colour themes available by adjusting the hue in your VJ software",
      ],
      buy: [["Buy now", "CosmicGeometryDXV"]],
    }),

    "vj-shop/the-tetrahedron-mapping-series-volume-1": vjPack({
      title: "The Tetrahedron Mapping Series Vol. 1",
      intro: [
        "A pack of 3D animated, looping videos designed for live visual artists and VJs.",
        "A multipurpose animation pack built on a repeating tetrahedron pattern, intended for video projection mapping on buildings, stages and other objects such as tetrahedrons.",
      ],
      video: vimeo(162389861),
      features: [
        "16:9 aspect ratio, 1920×1080 resolution",
        "86 animations in total, made up of 44 individual tetrahedrons",
        "Designed for video projection mapping",
        "All based on the same triangular pattern",
        "One mapping works for every video in the Tetrahedron Mapping Series",
        FORMATS,
      ],
      extras: [{
        type: "videos",
        items: [
          { title: "Additional animations added after release", url: vimeo(211464342, "77c6487a5b") },
          { title: "Resolume Arena projection mapping presets", url: vimeo(163540912, "d72c123c49") },
          { title: "More projection mapping use cases", url: vimeo(163687574, "adf3588508") },
        ],
      }],
      buy: [["Buy now", "OMTPM"]],
    }),

    "vj-shop/the-tetrahedron-mapping-series-volume-2": vjPack({
      title: "The Tetrahedron Mapping Series Vol. 2",
      intro: [
        "A pack of 3D animated, looping videos designed for live visual artists and VJs.",
        "A multipurpose animation pack built on a repeating tetrahedron pattern, intended for video projection mapping on buildings, stages and other objects such as tetrahedrons.",
      ],
      video: vimeo(201141283),
      features: [
        "50 animations in total, made up of 44 individual tetrahedrons",
        "10 video projection mapping presets for Resolume Arena 5",
        "Resolume Arena project file",
        "Designed for video projection mapping",
        "All based on the same triangular pattern",
        "One mapping works for every video in the Tetrahedron Mapping Series",
        FORMATS,
        "1920×1080 resolution",
      ],
      extras: [{ type: "video", title: "Resolume Arena projection mapping presets", url: vimeo(163540912, "d72c123c49") }],
      buy: [["Buy now", "BCzHa"]],
    }),

    "vj-shop/the-tetrahedron-mapping-series-volume-3": vjPack({
      title: "The Tetrahedron Mapping Series Vol. 3",
      intro: [
        "A pack of 3D animated, looping videos designed for live visual artists and VJs, built on a repeating tetrahedron pattern for video projection mapping on buildings, stages and other objects.",
        "The preview shows the clips playing in Resolume Arena 5 across three layers: two layers of clips plus a placeholder sunset image, showing how easily your own footage can be mixed in. On the left are the animations in their original rectangular format; on the right they're cut into smaller sections to create new shapes, ready to be warped onto physical objects with a projector or LED panels. It's an ideal starting point for your own custom VJ shows and stage designs, with much of the hard work done for you.",
      ],
      video: vimeo(250245074),
      features: [
        "35 animations in total, made up of 44 individual tetrahedrons",
        "10 video projection mapping presets for Resolume Arena 5",
        "Resolume Arena project file",
        "Designed for video projection mapping",
        "All based on the same triangular pattern",
        "One mapping works for every video in the Tetrahedron Mapping Series",
        FORMATS,
        "1920×1080 resolution",
      ],
      extras: [{ type: "video", title: "Resolume Arena projection mapping presets", url: vimeo(163540912, "d72c123c49") }],
      buy: [["Buy now", "Afjyx"]],
    }),

    "vj-shop/hexagonal-3d-cubes-volume-1": vjPack({
      title: "Hexagonal 3D Cubes Vol. 1",
      intro: ["A pack of 3D animated, looping videos designed for projection mapping artists, live visual performers and VJs."],
      video: vimeo(106902410),
      features: [
        "40 × 16:9 animations (1920×1080)",
        "16 × triangle formations of 10 hexagons (1080×1080)",
        "Suitable for regular rectangular screens as well as mapping",
        "Long smooth loops (15 seconds)",
        "Compatible with the other volumes of the Hexagonal Mapping Series",
        FORMATS,
      ],
      extras: [{
        type: "videos",
        items: [
          { title: "10 additional animations added in 2017", url: vimeo(211265893, "b27289b31a") },
          { title: "Additional animations compatible with Volumes 3 and 4", url: vimeo(242574717, "93f0ac4dca") },
        ],
      }],
      buy: [["Buy now", "avqm"]],
    }),

    "vj-shop/hexagonal-3d-cubes-volume-2": vjPack({
      title: "Hexagonal 3D Cubes Vol. 2",
      intro: [
        "A pack of 3D animated, looping videos designed for projection mapping artists, live visual performers and VJs.",
        "45 individual 3D cube / hexagon animations designed for projection mapping onto hexagons, or as a centrepiece within a composition. Every animation is designed around the same hexagon shape, so one mapping works for all of them.",
        "If you've ever wanted to try video projection mapping, this pack combined with mapping software is the perfect way to start creating professional-looking visual shows.",
      ],
      video: vimeo(107514447),
      features: [
        "45 × 15-second looping animations",
        "Resolume Arena 6 projection mapping example project",
        "Designed for video projection mapping",
        "All based on the same hexagonal pattern; one mapping works for every video",
        "Also compatible with rectangular screens",
        "Multiple colour themes for each animation",
        FORMATS,
      ],
      extras: [{
        type: "gallery",
        title: "Resolume Arena projection mapping example project",
        items: [
          { src: "assets/vj-shop/hexagonal-3d-cubes-vol-2-resolume-mapping-outline.jpg", alt: "The hexagon mapping outline in Resolume Arena" },
          { src: "assets/vj-shop/hexagonal-3d-cubes-vol-2-resolume-pink.jpg", alt: "Pink 3D cube animations mapped onto the hexagons in Resolume Arena" },
          { src: "assets/vj-shop/hexagonal-3d-cubes-vol-2-resolume-gold.jpg", alt: "Gold mandala animations mapped onto the hexagons in Resolume Arena" },
          { src: "assets/vj-shop/hexagonal-3d-cubes-vol-2-resolume-green.jpg", alt: "Green and blue animations mapped onto the hexagons in Resolume Arena" },
        ],
        columns: 2,
      }],
      buy: [["Buy now", "WwzjR"]],
    }),

    "vj-shop/hexagonal-3d-cubes-volume-3": vjPack({
      title: "Hexagonal 3D Cubes Vol. 3",
      intro: [
        "A pack of 3D animated, looping videos designed for projection mapping artists, live visual performers and VJs.",
        "Build hexagon-shaped boards and projection map these animations onto them to create stage designs, DJ booths or art installations that are cheap and easy to make, as well as modular and scalable.",
        "Note: colours in the promo video may differ from the clips; adjust the hue in your playback software to get every colour theme shown. The live footage from 0:09 to 0:15 includes some extra content that isn't part of this pack.",
      ],
      video: vimeo(112815197),
      features: [
        "30 seamless looping videos (50 in the Deluxe version)",
        "Resolume Arena 6 projection mapping example project (Deluxe version only)",
        "Designed for video projection mapping",
        "All based on the same hexagonal pattern; one mapping works for every video",
        "Compatible with Volumes 1–4 of the Hexagonal Mapping Series",
        FORMATS,
        "1080×1080 resolution",
      ],
      buy: [["Buy Standard Version", "fSEq"], ["Buy Deluxe Version", "uASB"]],
    }),

    "vj-shop/hexagonal-3d-cubes-volume-4": vjPack({
      title: "Hexagonal 3D Cubes Vol. 4",
      intro: [
        "A pack of 3D animated, looping videos designed for projection mapping artists, live visual performers and VJs.",
        "Build hexagon-shaped boards and projection map these animations onto them to create stage designs, DJ booths or art installations that are cheap and easy to make, as well as modular and scalable.",
      ],
      video: vimeo(124158316),
      features: [
        "32 seamless looping videos",
        "Resolume Arena 6 projection mapping example project (Deluxe version only)",
        "Designed for video projection mapping",
        "All based on the same hexagonal pattern; one mapping works for every video",
        "Compatible with Volumes 1–3 of the Hexagonal Mapping Series",
        FORMATS,
        "1080×1080 resolution",
      ],
      buy: [["Buy Standard Version", "vdnlf"], ["Buy Deluxe Version", "yiLBs"]],
    }),
  },
};
