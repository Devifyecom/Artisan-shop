# artisanshop.ch (2025): frontend recreation

A static HTML/CSS/JavaScript rebuild of the **artisanshop.ch homepage as archived by the Wayback Machine on 25 August 2025**:
<https://web.archive.org/web/20250825132536/https://www.artisanshop.ch/>

At that time artisanshop.ch was a Swiss online shop for **spare parts for household appliances** (fridges, dishwashers, washing machines, coffee machines and so on). There's no build step and no framework.

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

Serve the folder over HTTP rather than opening `index.html` from disk, so that every browser loads the fonts and scripts the same way.

## Analysis of the original

| Aspect | Original (Aug 2025) | This rebuild |
| --- | --- | --- |
| Platform | Shopware 6 storefront, custom `artisan-theme` on Bootstrap 5.3, served through Cloudflare | Static files |
| CSS | One compiled `all.css` (~1 MB) plus about 60 KB of inline critical CSS for the homepage | Seven small stylesheets split by area (see below). They use the original's colour tokens and breakpoints, without Bootstrap. |
| Fonts | "GT Eesti Text" (commercial, self-hosted) | **Jost** from Google Fonts, the closest free geometric match, with Verdana as the fallback (as in the original) |
| Icons | Inline Shopware SVG icons (`<svg><defs>…<use>`) on every use | The same SVG paths, gathered into one inline `<symbol>` sprite and referenced with `<use href="#icon-…">` |
| JS | `storefront.js` plus plugins (advanced search, captcha, cookie consent, PayPal, Pickware, FAQ manager, theme) | Plain JavaScript modules, one per feature (see below) |
| Data | Category tree, search, appliance selector and OCR served by Shopware APIs | The category tree is extracted into `js/data/navigation.js`. The appliance selector uses a small demo catalogue (`js/data/appliances.js`). |

Design tokens taken from the theme: primary `#2B6649`, text `#274533`, secondary `#E1E4DC`, border `#DADBD3`, link `#3A7E59`, review stars `#FEDC70`, and breakpoints at 576 / 768 / 992 / 1024 / 1200 px.

### Page structure

1. **Header.** On the homepage it sits transparently over the hero.
   - **≥1024px:** logo, "Navigation", the search bar with its green "Suchen" button, "Gerätenummer bestimmen", cart, "Einloggen" (account dropdown) and "Registrieren".
   - **Below 1024px:** burger and small logo, a search toggle that opens the search bar in its own row, cart and account.
2. **Navigation flyout ("richmenu").** It has three levels (*Küche / Haushalt / Reparaturratgeber / Reparaturanleitungen* → device → part, about 320 links in total).
   - **Desktop:** 300px columns that open on hover or focus.
   - **Mobile:** a drill-down drawer with "Zurück".
3. **Hero banner.**
   - Background photo, H1 "Ersatzteile für Haushaltsgeräte – Ihr Schweizer Onlineshop für Ersatzteile" and a subline.
   - A fake search field on phones that opens the appliance search.
   - The three-step navigation: *Diagnose → Ersatzteil bestellen (active) → Reparieren*.
4. **Sticky bar "Gerätenummer eingeben & Ersatzteil finden".** It opens an off-canvas panel with:
   - a search by model number,
   - "So findest Du das Typenschild" (a modal),
   - an upload for a photo of the type plate,
   - cascading selects for *Gerät → Hersteller → Modell*.
5. **Gerätekategorien.** A grid of 20 tiles (4/3/2/1 columns), each with a thumbnail.
6. **Hersteller.** 16 logo or name tiles. "Mehr anzeigen" opens the A–Z list of 75 manufacturers with a live filter.
7. **Long-form text blocks.**
   - Text with an image on the right.
   - **Customer reviews:** a carousel of 21 cards plus Google (5.0, 295) and Trustpilot (4.8, 244) badges.
   - Repair videos text, then "Ersatzteile online finden" text.
   - Advantages list with an image on the left.
8. **Personal contact.** WhatsApp (with QR code), e-mail and Zendesk contact form.
9. **Payment and shipping logos.** PayPal, TWINT, credit card and Apple Pay; shipping by Swiss Post.
10. **Repair guide text.** Links to diagnosis articles.
11. **Footer.**
    - A grey USP bar with four items.
    - Green columns: *Land* (country switcher CH/DE), *Unternehmen*, *Service*, and a fourth column with *Zahlungsoptionen*, *Versand* and *Tipps* (social links). On phones the link columns become an accordion.
12. **Overlays.** A scroll-to-top button and the cookie consent dialog. The dialog has *Einstellungen*, *Speichern* and *Alle Cookies akzeptieren*, plus the original cookie groups.

## Files

```
index.html
css/
  base.css        tokens, reset, typography, grid, buttons, forms, icons
  header.css      header layout, search, account dropdown, transparent homepage variant
  navigation.css  richmenu flyout / drawer
  hero.css        banner, step navigation, sticky bar, appliance search panel
  sections.css    category and manufacturer grids, text blocks, reviews, contact, logos
  footer.css      USP bar, footer columns and accordion, country switcher, scroll-up
  overlays.css    backdrop, off-canvas panel, modals, cookie consent
js/
  data/navigation.js   category tree extracted from the archived page
  data/appliances.js   demo catalogue for the device/manufacturer/model selects
  core.js              shared helpers: scroll lock, backdrop, off-canvas, modal, focus trap
  header.js            mobile search toggle, clear button, account dropdown
  search-suggest.js    live suggestions (devices, manufacturers, parts, guides) with keyboard navigation
  richmenu.js          renders and drives the category flyout (hover columns / mobile drill-down)
  appliance-search.js  off-canvas appliance search, type-plate hint, photo upload, cascading selects
  manufacturer-list.js "Mehr anzeigen" and the manufacturer filter
  review-carousel.js   responsive slider: buttons, dots, swipe, keyboard, autoplay that pauses on hover/focus
  footer.js            footer accordion, country dropdown, scroll-to-top
  cookie-consent.js    consent dialog, group/entry checkboxes, choice stored in localStorage
images/              assets downloaded from the Wayback Machine capture
```

## What differs from the live shop

- **Server features are simulated.** Search suggestions, the appliance selector, the photo (OCR) upload and the model-number search run in the browser and show what would happen next. The live shop called Shopware/Elasticsearch endpoints for these.
- **Links keep the original shop paths** (`/kueche/kuehlschrank/`, `/account/login`, …), so the information architecture stays visible. Only the homepage is rebuilt, so those internal pages are not part of this project.
- **The font is Jost**, standing in for the licensed GT Eesti.
- **Missing assets:**
  - The contact person's photo was not archived, so an initials avatar is shown instead.
  - The "telephone/message" USP icon was not archived either, so it was redrawn in the same line style.
  - Some manufacturer logos come from a 300 × 300 thumbnail rather than the 600 × 600 one.
- **Additions:**
  - A *Cookie-Einstellungen* link in the footer, to reopen the consent dialog.
  - A dark gradient on the hero, so the white text stays readable.
  - A readable "Alle … anzeigen" label. The original printed an untranslated key there: `art.navigation.flyout.allCategory`.
- **Left out:** analytics and ads (GTM, Bing), Cloudflare e-mail obfuscation, reCAPTCHA, the PayPal/Pickware plugins and the tom-select library.

## Accessibility

- A skip link, landmark elements and labelled buttons.
- `aria-expanded` and `aria-controls` on every toggle.
- The search is a combobox: its active option is announced through `aria-activedescendant`.
- Off-canvas panels and modals trap focus, close with Esc and return focus to the element that opened them.
- Carousel slides outside the view are made `inert`, and autoplay respects `prefers-reduced-motion`.
