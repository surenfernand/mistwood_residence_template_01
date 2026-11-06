# Mistwood Residence — asset integration report

Asset integration only. Page structure, copy, booking behaviour, theme switch, and social links were left in place.

## Pages updated

| Page | What changed |
| --- | --- |
| Home | Tea-sunrise hero, gold feature icons, botanical corner, Gregory Lake and tea thumbs |
| About | Shared page hero, tea-sunset location photo, Horton Plains quote band |
| Apartments | Shared page hero. Gallery stays on the real apartment photographs |
| Offers (`/deals`) | Scenic photographs on the three existing cards. Titles, copy, and booking links unchanged |
| Explore | Gregory Lake, tea, Horton Plains, Victoria Park, and the golf club |
| Contact | Shared page hero, gold WhatsApp, email, and location icons. Form and calendar unchanged |
| Header and footer | Transparent Mistwood logo, gold botanical in the footer |

Photos, gallery, policies, and credits still use the earlier header and the existing apartment photographs.

## Image to section mapping

| Section | File |
| --- | --- |
| Home hero, about / apartments / offers / explore / contact banner | `public/assets/mistwood/backgrounds/tea-sunrise.png` |
| Home closing band, about location, “A short break” offer | `public/assets/mistwood/backgrounds/tea-sunset.png` |
| Home explore band, Pedro / tea cards, “A longer visit” offer | `public/assets/mistwood/explore/tea-plantations.png` |
| Home and Explore — Gregory Lake | `public/assets/mistwood/explore/gregory-lake.png` |
| Explore — Horton Plains, about quote band | `public/assets/mistwood/explore/horton-plains.png` |
| Explore — Victoria Park | `public/assets/mistwood/explore/victoria-park.png` |
| Explore — Nuwara Eliya Golf Club | `public/assets/mistwood/explore/golf-club.png` |
| Header and footer logo | `public/assets/mistwood/branding/logo.png` |
| Hero corner and the small sprig motif | `public/assets/mistwood/decorations/leaf-branch.png` |
| Footer corner | `public/assets/mistwood/decorations/gold-branch.png` |
| Home strip — views | `public/assets/mistwood/icons/pin.png` |
| Home strip — tea | `public/assets/mistwood/icons/leaf.png` |
| Home strip — highland living | `public/assets/mistwood/icons/pines.png` |
| Contact — WhatsApp, email, address | `icons/whatsapp.png`, `icons/email.png`, `icons/pin.png` |
| Offers — “Your dates” | `backgrounds/tea-sunrise.png` |

`tea-sunset.png` is a second tea panorama. It is the closest landscape in the pack for the sunset and longer-evening placements. It is similar in light to the sunrise hero.

The Horton Plains photograph is the grassland path. The card text says World’s End is further along the walk, because the cliff is not in the picture.

Gregory Lake is the park lake with swan boats. Victoria Park is the formal lawn, flower beds, and gazebo. The golf image is the Tudor clubhouse and fairway. That file has partial transparency at the edges.

## Existing photographs kept

These are the real apartment, or the place photographs already credited on the site:

- Home about block and apartment cards: `room.jpg`, `lounge-chairs.jpg`, `dining-kitchen.jpg`, `stay-balcony.jpg`
- About story: `living-wide.jpg`
- Apartments gallery: `living-wide.jpg`, `room.jpg`, `dining-kitchen.jpg`, `stay-balcony.jpg`
- Home and Explore — Hakgala: `public/assets/places/hakgala.jpg`
- Home and Explore — Lover’s Leap: `public/assets/places/leap.jpg`
- Photos, gallery, policies, and credits heroes and the older `style.css` hill background

The “Modern Apartments” highlight still uses the existing house outline. A bed icon was not placed there, because this site does not publish a bedroom count.

## Not used

Full-page mockups and collages were not placed in any page.

These files were inspected and left out because they do not show this apartment or the named place:

- Rendered hotel bedroom, living room, bathroom, and balcony
- Modern villa exterior
- Colonial clock-tower building (the Nuwara Eliya post office, not Mistwood)
- Wide curtain waterfall (not Lover’s Leap)
- Ten-icon sprite sheet, used as one image

Prepared and unused, so they are not shown as black rectangles or as invented facilities:

- `icons/bed.png`, `icons/guests.png`, `icons/calendar.png`, `icons/phone.png`

The phone number on the site is the WhatsApp line, so the handset icon was not added as a second contact method.

## CSS and components

- `public/home.css` — hero, explore band, closing band, about banner, and quote band backgrounds. Logo, icon, leaf, and contact-icon sizing. Photographs use `object-fit: cover`. Logo and icons use `object-fit: contain`.
- Hero and page-banner headings are white with a soft shadow, so they stay readable on the brighter sunrise. The earlier white rule was losing to `body.home h1`.
- Decorative leaves use `pointer-events: none`. They are hidden under 760px so they do not cover the title.
- `src/components/Highland.jsx` — logo in the header and footer, leaf on the page banner, gold branch in the footer. The unused drawn wordmark was removed.
- `index.html` — preload for `tea-sunrise.png`.
- Below-the-fold photographs use `loading="lazy"`. The hero is a CSS background, so the preload is its priority path.

Navigation, the availability bar, the contact and booking forms, the calendar, the theme switch, and the Facebook, Instagram, WhatsApp, and YouTube links were not rewritten.

## Checks

- `npx vite build` — success. 55 modules, `dist/assets/index-Byng7DrC.js` 328.74 kB (gzip 99.87 kB), about 2.9s.
- Browser at `http://localhost:5173/`: Home, About, Apartments, Offers, Explore, and Contact. Every placed image decoded with a real width. No zero-byte image responses on the home load.
- Header logo is the gold house on a transparent background, on both the sunrise and the dark scrolled bar.
- Theme switch still toggles light and dark. It was returned to light mode after the check.
- Contact form, booking calendar, and “Request this stay” are still on the page.
- Phone width: the hero leaf is `display: none`, the logo still loads, and the heading stays white.

The dev server log still contains an earlier import error from before `Apartments.jsx` existed. Later reloads of these pages completed without a new transform error.
