# Booking-UI shared chrome

The booking-flow pages (`index`, `vehicles`, `options`, `checkout`, `success`,
`terms`) are each pasted into their own Wix **HtmlComponent** iframe. They are
fully self-contained — there is no build step and no runtime `@import`, so a
shared stylesheet cannot be linked. Historically that meant every page kept its
own copy of the header / footer / buttons / progress stepper, and the copies
drifted apart (and accumulated `!important`-fighting override layers).

`theme.css` in this folder is the **single source of truth** for that shared
chrome. A small sync tool copies it verbatim into each page so the copies can
never silently diverge.

## What the canon owns

`theme.css` contains only the parts that must look identical on every page:

- design tokens (`:root` custom properties)
- base reset + focus styles
- the sticky dark-teal header + mobile hamburger/drawer
- the booking progress stepper
- the deep-navy footer
- the shared button family (`.btn`, `.btn-primary`, `.btn-gold`)

Everything page-specific (hero, summary, form, etc.) stays in the page, outside
the markers. Page-level **responsive overrides** of shared elements are fine to
keep in the page too — the canon is the base layer.

## How a page consumes it

Inside one of the page's `<style>` blocks, the synced copy lives between marker
comments:

```css
/* @shared-theme:start */
…canonical theme.css contents (auto-generated — do not hand-edit)…
/* @shared-theme:end */
```

## Workflow

```bash
# After editing theme.css, push it into every adopted page:
npm run sync:theme

# CI / pre-commit: fail if any page has drifted from the canon:
npm run check:theme
```

To **adopt a new page**, paste the marker pair into one of its `<style>`
blocks, remove that page's now-duplicated chrome rules, then run
`npm run sync:theme`.

> `memberslogin.html` is intentionally **not** adopted — it's a standalone
> dark-theme portal login, not part of the booking chrome.

## Status

| Page | Adopted |
|------|---------|
| success.html | ✅ |
| index.html | ⬜ |
| vehicles.html | ⬜ |
| options.html | ⬜ |
| checkout.html | ⬜ |
| terms.html | ⬜ |

Rolling the remaining pages in also deletes their dead amber-scaffolding (the
warm-amber header/footer/button rules that are immediately overridden to
dark-teal/navy with `!important`). Each rollout should be eyeballed in a Wix
preview before merging.
