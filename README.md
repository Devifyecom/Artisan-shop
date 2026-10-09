# artisanshop.ch: frontend recreation

A static HTML/CSS/JavaScript rebuild of the page served at **artisanshop.ch**. There's no build step and no framework.

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

## About the content

The live domain now serves a German-language affiliate page that promotes offshore online casinos to Swiss players. This rebuild copies the page's **structure, layout, class names and behaviour**. The text is replaced with a neutral equivalent: a comparison of fictional Swiss artisan shops. All shops, ratings and people on the page are fictional, and there are no affiliate links.

## Analysis of the original

| Aspect | Original | This rebuild |
| --- | --- | --- |
| Platform | WordPress, `hello-elementor` theme with custom "DeptHub" blocks, WP Rocket, geotargeting plugin | Static files |
| CSS | One stylesheet per block (`main`, `header-style-1`, `style-3` brand table, `faq-style-1`, `footer-style-1`, `authors-box-style-1`, …), Montserrat, `--color-primary: #35B3DB` | Same split: `css/main.css`, `header.css`, `brand-table.css`, `blocks.css`, `footer.css`, `sticky-banner.css` |
| Icons | Fontello `custom-icons` font plus Font Awesome (~200 KB) | Inline SVG / data-URI icons |
| JS | Small vanilla modules: header, footer, equalize-heights, clipboard-copy, ga-event-tracking, brand-table, inline banner close | Same modules in `js/` |
| Left out | WP Rocket preload/lazyload, geotargeting, speculation rules, an obfuscated cloaking/redirect script | Not reproduced |

### Page structure

1. **Header (style 1):** dark top bar with logo, search field and top nav, then a main nav bar. At ≤1100px a burger menu replaces the nav, the search becomes an icon that opens a blurred modal, and top-nav items move into the main nav.
2. **Article:** centred H1, author and "last updated" bar, table-of-contents pills.
3. **Intro:** paragraphs styled as soft shadow cards, plus a rounded hero image.
4. **Brand table (style 3):** ranked cards (number, title, star rating / logo, offer box, CTA and optional promo code with a copy button). Flex `order` rearranges each card at 1100px and 768px.
5. **Long-form content:** H2 sections, lists and rounded tables with dark headers (tables scroll horizontally under 700px).
6. **FAQ:** cards with a circled question-mark icon, plus `FAQPage` JSON-LD.
7. **Authors box:** author card with avatar, role, bio and social link.
8. **Footer (style 1):** logo, title, grayscale badges (full colour on hover), menu columns that become an accordion on mobile, and the legal menu.
9. **Sticky banner:** shown under 700px only, with a close button.

## Behaviour (`js/`)

| File | What it does |
| --- | --- |
| `header.js` | Burger toggle (with `aria-expanded`), mobile sub-menu accordion, moves top-nav items between menus via `matchMedia`, search modal, Esc to close, flips dropdowns that would overflow the viewport |
| `search.js` | In-page search: highlights matches with `<mark>`, scrolls to the first, and pressing Enter again cycles to the next (the original posted to WordPress `?s=`) |
| `equalize-heights.js` | Gives every element matching the selector in `[data-equalize]` the height of the tallest (used for the brand-card offer boxes) |
| `clipboard-copy.js` | Copies `data-clipboard` values using the Clipboard API and shows a success or error state |
| `ga-event-tracking.js` | Sends `[data-ga-event]` clicks to `gtag`, or logs them to the console when gtag isn't loaded |
| `footer.js` | Footer menu accordion on mobile, operable by keyboard |
| `sticky-banner.js` | Closes the sticky banner and releases the space reserved for it at the bottom of the page |

## Cleanups compared with the original

- Valid, properly nested markup: the original had duplicate `id="faq"`/`id="org"` and an unclosed `<section>`.
- Semantic buttons for the burger and banner close, plus a skip link, ARIA labels and `<time>`.
- The date is written in German (the original showed "October 8, 2026" on a German page) and the JSON-LD `dateModified` is valid.
- CSS custom properties are used for every theme colour, and the text is left-aligned on mobile.
