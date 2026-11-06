# Cursor prompt — redesign the EXISTING Mistwood Residence website

You are working inside my existing Mistwood Residence project. IMPORTANT: This is a VISUAL REDESIGN, not a new website. First inspect the project architecture, existing routes/pages, components, assets, CSS/Tailwind, and current functionality. Preserve the existing framework, routing, content, working booking/contact flows, integrations, accessibility and responsive behavior. Do not delete or replace functional features.

Use the attached UI reference images under `design-reference/ui-references/` as visual direction for six pages: Home, About, Apartments, Offers, Explore and Contact. The overall look is luxury highland hospitality in Nuwara Eliya: deep forest-green (#092E24), muted green (#34543C), champagne gold (#D4A74E), warm cream (#F5EBDD), white text on dark backgrounds, editorial serif headings, restrained sans-serif UI labels, generous spacing, soft rounded image corners, subtle borders and botanical details.

Page directions:
- Home: immersive tea-hill sunrise hero, elegant centered heading/CTA, compact translucent navigation, feature highlights and existing booking controls. Use subtle foreground foliage and layered mountain/mist only if true separate transparent assets exist.
- About: panoramic highland page banner, story image and text, benefit highlights, facilities and location sections.
- Apartments: page banner, real property photography, apartment overview, amenities and existing booking action.
- Offers: page banner and elegant promotional cards; use ONLY real existing offers/prices, never invent rates or discounts.
- Explore: grid of Nuwara Eliya attractions with images and existing descriptions/links.
- Contact: page banner, contact details, working form and map/WhatsApp links where already configured.

The included `asset-pack-reference/` images are COLLAGES/INFOGRAPHICS, not ready-to-use production assets. DO NOT display the collage or crop tiny pictures from it as full-resolution website photos. Prefer the supplied original property photos under `design-reference/original-property-photos/` for the actual residence. The UI references contain AI-generated illustrative imagery; do not present fictional buildings or interiors as genuine Mistwood photos. Use existing project photography for rooms/property and existing licensed imagery for scenic attractions. Do not assume the logo reference has true alpha transparency; inspect it before use. For missing botanical overlays, create simple CSS/SVG ornaments or mark an asset as needed; don't fake transparent PNGs by cropping the collage.

Implementation workflow:
1. Audit the existing codebase and summarize files/routes/components to be changed.
2. Create shared design tokens and reusable Header, Footer, PageHero, SectionHeading, CTA and card styles. Keep the current dark/light switch working if present.
3. Apply the redesign to each existing page without changing URLs or business logic.
4. Preserve real property address, phone, email and social URLs from the existing project; never copy placeholder contacts, rates, or amenities from mockups.
5. Ensure mobile/tablet/desktop layouts, image loading, contrast, keyboard navigation, and reduced-motion support.
6. Run available lint/build/tests, fix issues and report exactly what changed and any missing assets.

Start by inspecting the repo; do not overwrite the project or scaffold a new one. Show me a concise implementation plan, then make the changes.
