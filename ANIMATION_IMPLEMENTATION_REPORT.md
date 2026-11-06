# Mistwood Residence — animation implementation report

The existing React and Vite site was kept. Motion was added as CSS and one shared observer. No second framework, and no GSAP or Motion library.

## 1. Animation approach

CSS transitions and keyframes handle hover, entrance, leaves, buttons, and the header. One `IntersectionObserver` reveals sections as they enter the viewport. One scroll listener, scheduled with `requestAnimationFrame`, drives the thin progress line and the hero parallax. Both are removed when the app unmounts.

GSAP was not added. The effects in this brief are opacity and transform, which CSS and one observer cover without a second animation runtime.

## 2. Files created

- `src/motion.jsx` — `MotionBoot` (reveals, parallax, scroll progress) and `IntroLoader`
- `public/motion.css` — shared timing, reveals, header, buttons, cards, leaves, and reduced-motion rules
- `ANIMATION_IMPLEMENTATION_REPORT.md`

## 3. Files modified

- `index.html` — motion stylesheet, and `html.motion` only when the visitor has not asked for reduced motion
- `src/App.jsx` — page fade wrapper keyed by the route path, so back and forward still work
- `src/components/Highland.jsx` — header settles after 72px, shared page heroes get a movable photo layer, footer columns reveal
- `public/home.css` — home and page heroes use a clipped photo layer under the existing gradient
- `src/pages/Home.jsx`, `About.jsx`, `Apartments.jsx`, `Deals.jsx`, `Explore.jsx`, `Contact.jsx` — reveal markers on existing sections

## 4. What each page does

| Page | Motion |
| --- | --- |
| Home | Hero photo eases from a slight scale to rest, then drifts a short distance on scroll. Heading, subtitle, and button enter in sequence. After the entrance, the heading lifts and the subtitle and button fade as the hero leaves. Feature row, apartment cards, destination cards, seasonal note, and closing band reveal on scroll. Card images ease larger on hover. |
| About | Shared scenic banner. Story photo and text enter from opposite sides. Qualities, facilities, location, quote, and notes reveal in turn. |
| Apartments | Banner, main photograph, thumbnail row, and facility list. |
| Offers | Banner and staggered cards. Cards lift slightly on hover. Copy and the booking links are unchanged. There is no price count-up. |
| Explore | Banner and staggered attraction cards, including Gregory Lake, tea, Horton Plains, Lover’s Leap, Victoria Park, and Hakgala, plus the further-out notes. |
| Contact | Banner, staggered WhatsApp, email, and address rows, then the enquiry form and the booking form. Fields only change border and shadow on focus. |

Every highland route also fades in over about 420ms, starting from mostly visible so the cream page background does not flash white.

## 5. Shared utilities

`MotionBoot`, `IntroLoader`, and the classes in `public/motion.css` cover fade-up, fade from the side, image scale, staggered children, page fade, parallax, and scroll progress. Buttons, the logo, nav underlines, and the theme icons use the same durations.

## 6. Mobile

Under 760px the parallax distance drops to 10px. Side entrances become a short rise. Leaf sway and hover zooms stop, so touch scrolling stays native. Decorative branches stay off the edges. The page wrapper clips sideways overflow.

## 7. Accessibility

`prefers-reduced-motion: reduce` never adds `html.motion`. Content stays visible, parallax stays still, and the loader does not appear. A reload with reduced motion confirmed the heading animation name is `none` and a below-fold block stays fully opaque. Keyboard focus keeps a visible outline. The loader does not capture clicks or focus.

## 8. Performance

Animated properties are `transform` and `opacity`. The hero is one photograph, so the whole image moves a few pixels instead of fake mountain layers. There is no mist asset, so no particle mist was added. Reveals run once. The loader appears only if the hero image is still loading after 160ms, and it never waits past 1.6 seconds. A later visit in the same tab skips it.

## 9. Build and browser checks

`npx vite build` succeeded. 56 modules, `dist/assets/index-CoHhkIax.js` 330.46 kB (gzip 100.25 kB).

In the browser at `http://localhost:5173/`:

- Home hero shows the tea sunrise, with the heading, subtitle, and logo in place.
- The feature row fades in after scroll.
- About, Apartments, Offers, Explore, and Contact all render their headings, cards, and links.
- Contact still has the enquiry fields, the calendar, and “Request this stay”.
- The light/dark switch still toggles, and it was returned to light mode.
- Reduced motion keeps text visible and skips the entrance animation.

## 10. Left as they were

- The home availability bar was already removed, so it has no entrance animation. Booking remains on the contact page.
- Enquiry and booking stay instant previews. They do not show a fake sending state or a fake confirmation.
- No lightbox was added. Apartment thumbnails stay in the page.
- Photos, gallery, policies, and credits keep their existing reveal behavior.
- No separate mist layer was invented.
