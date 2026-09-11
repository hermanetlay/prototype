---
version: alpha
name: Ruang Murid CMS
description: >-
  Desktop-first admin/CMS design system for an Indonesian K-12 learning
  platform. Framework-agnostic: a token set and a set of component contracts
  layered over the Wartek "guru.desktop" design tokens. Dense, utilitarian,
  content-management UI: dark-blue persistent sidebar, white app header, white
  toolbar with breadcrumb + page title, and a light-gray content canvas holding
  white cards and data tables.
colors:
  # --- Brand / interactive ---
  brand: '#0b5ae2'
  interactive: '#0b5fef'
  interactiveHovered: '#054bcc'
  interactivePressed: '#2c7fff'
  interactiveFocused: '#4c8df6'
  interactiveDisabled: '#c9cbcf'
  sidebarBackground: '#103178'

  # --- Surfaces ---
  background: '#f5f5f5'
  surface: '#ffffff'
  surfaceSubdued: '#f5f5f5'
  surfaceHovered: '#efefef'
  surfacePressed: '#d9dbdd'
  surfaceSelected: '#ecf5fe'
  overlay: 'rgba(0, 0, 0, 0.7)'

  # --- Text ---
  textDefault: '#2f3031'
  textSubdued: '#65696c'
  textDisabled: '#808489'
  textInverse: '#ffffff'
  textCritical: '#e02d38'
  textSuccess: '#2e8a5c'
  textWarning: '#a5a003'
  textInformational: '#4c8df6'

  # --- Borders ---
  border: '#d9dbdd'
  borderSubdued: '#c9cbcf'
  borderStrong: '#808489'
  borderCritical: '#e02d38'

  # --- Status (solid + subdued pairs) ---
  critical: '#c82236'
  criticalSubdued: '#fef4f4'
  success: '#35825a'
  successSubdued: '#e3fdeb'
  warning: '#ffc453'
  warningSubdued: '#ffeece'
  informational: '#4c8df6'
  informationalSubdued: '#ecf5fe'

  # --- Neutral ramp (source of every gray used) ---
  gray0: '#fafafa'
  gray5: '#f5f5f5'
  gray10: '#efefef'
  gray20: '#d9dbdd'
  gray30: '#c9cbcf'
  gray40: '#b3b5b7'
  gray50: '#808489'
  gray60: '#65696c'
  gray70: '#53575a'
  gray80: '#45474a'
  gray90: '#2f3031'
  gray100: '#1e1f1f'

  # --- Accent ramp (blue, the only expressive hue in regular use) ---
  blue5: '#ecf5fe'
  blue10: '#e1effe'
  blue50: '#4c8df6'
  blue70: '#0b5fef'
  blue80: '#054bcc'
  blue90: '#103178'
typography:
  displayLg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: 600
    lineHeight: 36px
  displayMd:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: 600
    lineHeight: 36px
  displaySm:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: 600
    lineHeight: 28px
  headingLg:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: 600
    lineHeight: 28px
  headingMd:
    fontFamily: Inter
    fontSize: 19px
    fontWeight: 600
    lineHeight: 24px
  headingSm:
    fontFamily: Inter
    fontSize: 17px
    fontWeight: 600
    lineHeight: 22px
  subheading:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 600
    lineHeight: 16px
  bodyLg:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: 400
    lineHeight: 28px
  body:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 400
    lineHeight: 24px
  bodyBold:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 600
    lineHeight: 24px
  bodySm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
  bodySmBold:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 600
    lineHeight: 20px
  action:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 600
    lineHeight: 24px
  helper:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 400
    lineHeight: 16px
  helperBold:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 600
    lineHeight: 16px
rounded:
  none: 0px
  sm: 4px
  md: 6px
  lg: 8px
  xl: 12px
  full: 9999px
spacing:
  0: 0px
  1: 4px
  2: 8px
  3: 12px
  4: 16px
  5: 20px
  6: 24px
  8: 32px
  10: 40px
  12: 48px
  16: 64px
components:
  appHeader:
    height: 56px
    backgroundColor: '{colors.surface}'
    textColor: '{colors.textDefault}'
    padding: 16px
  sidebar:
    width: 256px
    widthMobile: 288px
    widthCollapsed: 48px
    backgroundColor: '{colors.sidebarBackground}'
    textColor: '{colors.textInverse}'
  sidebarMenuItem:
    rounded: '{rounded.md}'
    padding: 8px
    typography: '{typography.bodySm}'
    textColor: '{colors.textInverse}'
  sidebarMenuItemHover:
    backgroundColor: 'rgba(255, 255, 255, 0.10)'
  sidebarMenuItemActive:
    backgroundColor: 'rgba(255, 255, 255, 0.10)'
    typography: '{typography.bodySmBold}'
  toolbar:
    backgroundColor: '{colors.surface}'
    padding: 32px
  pageCanvas:
    backgroundColor: '{colors.background}'
    padding: 24px
  card:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.textDefault}'
    rounded: '{rounded.lg}'
    padding: 24px
  sectionCard:
    backgroundColor: '{colors.surface}'
    rounded: '{rounded.md}'
    padding: 32px
  buttonPrimary:
    backgroundColor: '{colors.interactive}'
    textColor: '{colors.textInverse}'
    rounded: '{rounded.md}'
    height: 40px
    padding: 16px
    typography: '{typography.bodySmBold}'
  buttonPrimaryHover:
    backgroundColor: '{colors.interactiveHovered}'
  buttonSecondary:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.textDefault}'
    rounded: '{rounded.md}'
    height: 40px
    padding: 16px
  buttonDestructive:
    backgroundColor: '{colors.critical}'
    textColor: '{colors.textInverse}'
    rounded: '{rounded.md}'
    height: 40px
  buttonGhost:
    backgroundColor: transparent
    textColor: '{colors.textDefault}'
    rounded: '{rounded.md}'
    height: 40px
  buttonSm:
    height: 36px
    padding: 12px
  buttonLg:
    height: 44px
    padding: 32px
  buttonIcon:
    height: 40px
    width: 40px
  input:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.textDefault}'
    rounded: '{rounded.md}'
    height: 40px
    padding: 12px
    typography: '{typography.bodySm}'
  inputInvalid:
    backgroundColor: '{colors.criticalSubdued}'
    textColor: '{colors.textCritical}'
  badge:
    rounded: '{rounded.full}'
    padding: 10px
    typography: '{typography.helperBold}'
  pillTabsList:
    backgroundColor: '{colors.surface}'
    rounded: '{rounded.full}'
    padding: 4px
  pillTabsTriggerActive:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.interactive}'
    rounded: '{rounded.full}'
  dialog:
    backgroundColor: '{colors.surface}'
    rounded: '{rounded.xl}'
    padding: 32px
    width: 512px
  infoAlert:
    backgroundColor: '{colors.blue5}'
    textColor: '{colors.textDefault}'
    rounded: '{rounded.xl}'
    padding: 16px
  tableHeaderCell:
    backgroundColor: '{colors.gray5}'
    textColor: '{colors.textSubdued}'
    typography: '{typography.bodySmBold}'
    padding: 12px
  tableCell:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.textDefault}'
    typography: '{typography.bodySm}'
    padding: 12px
---

## Overview

This is an **internal content-management console**, not a marketing site. Every
screen exists so an operator can find, review, create, or approve learning
content quickly. The visual language is therefore quiet and functional: one
saturated brand blue, a long neutral gray ramp, and almost no decoration.

Three ideas define the look:

1. **Dark rail, light room.** A deep navy (`#103178`) sidebar anchors the left
   edge for the whole session. Everything to its right is white or near-white.
   The contrast is the app's only strong statement.
2. **Cards on gray.** The content canvas is `gray5` (`#f5f5f5`); content lives in
   white cards and tables with hairline borders and a barely-there shadow. Depth
   is communicated by the white/gray contrast, not by heavy shadows.
3. **Text does the hierarchy.** Weight (400 vs 600) and a tight size ramp carry
   almost all structure. Color is reserved for state and for links/actions.

Density is desktop-first and fairly tight — 24px page padding, 40px control
height, 14px as the workhorse text size. Interface copy is Indonesian; write
labels short and verb-first ("Tambah Materi", "Simpan", "Tutup").

## Colors

**Brand and interactive.** `#0b5ae2` is the brand blue; `#0b5fef` is the
interactive blue actually used for buttons, links, active tabs, and focus rings.
Hover darkens to `#054bcc`; focus ring is `#4c8df6`; disabled interactive is
`#c9cbcf`. The navy `#103178` (blue-90) is used *only* for the sidebar.

**Neutrals.** A 12-step gray ramp (`gray0` → `gray100`) supplies every surface
and border. In practice:

| Role | Token |
|---|---|
| Page canvas | `gray5` `#f5f5f5` |
| Card / table / header surface | `#ffffff` |
| Row hover, subtle fill | `gray10` `#efefef` |
| Card & table border | `gray20` `#d9dbdd` |
| Divider on a white card | `gray10`–`gray20` |
| Secondary text | `#65696c` |
| Primary text | `#2f3031` (never pure black for body copy) |

**Status.** Each status has a solid and a subdued (background) value. Use the
subdued value as the fill and the solid value for the icon and text:

| Status | Solid | Subdued fill |
|---|---|---|
| Critical / error | `#e02d38` | `#fef4f4` |
| Success | `#2e8a5c` | `#e3fdeb` |
| Warning | `#ffc453` | `#ffeece` |
| Informational | `#4c8df6` | `#ecf5fe` |

**Selection.** Selected rows and selected states use `#ecf5fe` (blue-5) — the
same tint as the informational surface. This is deliberate: "this is the one
you're looking at" and "here is a note" read as the same calm blue.

**Dark mode is defined but not designed.** CSS variables for a `.dark` class
exist, but no screen is authored against them. Treat the product as light-only;
if you add dark mode, design it rather than inverting these tokens.

## Typography

**Inter**, everywhere, with a system-sans fallback stack. Only two weights are
in play: **400** for body copy and **600** for anything that is a heading, a
label, an action, or emphasis. There is no 500 and no 700.

The ramp, in the order you'll actually reach for it:

| Token | Size / line-height | Weight | Used for |
|---|---|---|---|
| `displayMd` | 28 / 36 | 600 | Page title in the toolbar |
| `displaySm` | 24 / 28 | 600 | Card titles on dense pages |
| `headingLg` | 22 / 28 | 600 | Section heading inside a card |
| `headingMd` | 19 / 24 | 600 | Sub-section heading |
| `headingSm` | 17 / 22 | 600 | Small group heading |
| `subheading` | 14 / 16 | 600 | Eyebrow / field group label |
| `body` | 16 / 24 | 400 | Long-form copy, page subtitle |
| `bodySm` | 14 / 20 | 400 | **Default UI text**: tables, forms, menus |
| `bodySmBold` | 14 / 20 | 600 | Table headers, active nav, inline emphasis |
| `action` | 16 / 24 | 600 | Large buttons |
| `helper` | 12 / 16 | 400 | Hints, timestamps, meta |
| `helperBold` | 12 / 16 | 600 | Badge text |

Rules of thumb: one `displayMd` per page (the toolbar title, never repeated in
the body); subtitles go directly under it in `body` at `textSubdued`; anything
inside a table or a form is `bodySm`. Headline sizes (42–80px) exist in the
token set but are for marketing surfaces and are unused here — don't reach for
them.

## Layout

**App shell.** A fixed three-part chrome wraps every authenticated page:

```
┌─────────────────────────────────────────────────────┐
│ Header  56px  fixed, white, bottom border           │
├──────────────┬──────────────────────────────────────┤
│              │ Toolbar  white, 32px padding         │
│  Sidebar     │   breadcrumb → title → actions       │
│  256px       ├──────────────────────────────────────┤
│  navy        │ Content canvas  gray5, 24px padding  │
│  full height │   cards / tables, 16px gaps          │
└──────────────┴──────────────────────────────────────┘
```

- **Header** — 56px tall, fixed, `z-50`. Product logo left; on the right, a
  "signed in as" institution badge, a vertical separator, then the avatar +
  chevron opening a user dropdown.
- **Sidebar** — 256px (288px in the mobile sheet, 48px icon-collapsed), navy,
  offcanvas-collapsible, sits under the header (`padding-top: 56px`). Menu items
  are white text; hover and active are `white/10` fills; active is additionally
  600 weight. Nested groups are `Collapsible` sections whose chevron rotates 90°
  on open.
- **Toolbar** — white, 32px vertical padding, 2px bottom border, holds (in
  order) the sidebar trigger + breadcrumb row, then a row with page title +
  optional subtitle on the left and action buttons on the right. It can be
  pinned fixed for long pages.
- **Content** — `gray5`, 24px padding, vertical stack with 16px gaps.

**Rhythm.** Spacing is the standard 4px scale. The values that recur: 4 (icon
gaps), 8 (button groups, tight stacks), 16 (stack gap between cards), 24 (card
padding, page padding), 32 (section-card padding, toolbar padding).

**Grid.** No global column grid. Pages are a single column of full-width cards;
inside a card, use CSS grid with 16px gaps for form fields, and flex with
`justify-between` for label/value rows.

**Responsiveness is a courtesy, not a goal.** This is a desktop tool. Breadcrumb
segments hide below `md`, and the sidebar becomes a sheet — that's the extent of
it.

## Elevation & Depth

Elevation is almost absent. Four levels only:

| Level | Shadow | Where |
|---|---|---|
| 0 — flat | none, `1px` border in `gray20` | Cards, tables, section panels |
| 1 — raised | `shadow-sm` (`0 1px 2px rgba(0,0,0,.05)`) | Cards on the gray canvas, pill tab bars, info alerts |
| 2 — floating | `shadow-md` | Active pill tab, dropdown menus, popovers, tooltips |
| 3 — modal | `shadow-lg` over a `rgba(0,0,0,.7)` scrim | Dialogs, alert dialogs, mobile sidebar sheet |

Prefer a border over a shadow whenever both would work. If a surface sits on
white, give it a border; if it sits on `gray5`, `shadow-sm` plus a border is the
house style.

**Z-order:** header `50` → modal overlay/content `50` → sidebar `20` → toolbar
`10` → content `0`.

**Motion** is short and functional: 200ms `ease-linear` for sidebar width and
toolbar padding, 200ms `ease-out` for accordion open/close, `transition-colors`
on every interactive element. Dialogs fade + zoom from 95%. Nothing bounces,
nothing exceeds 200ms.

## Shapes

| Radius | Value | Applied to |
|---|---|---|
| `sm` | 4px | Close buttons, small chips, checkbox |
| `md` | 6px | **Default** — buttons, inputs, selects, menu items, section cards |
| `lg` | 8px | Cards, popovers, dropdown menus |
| `xl` | 12px | Dialogs, info alerts |
| `full` | 9999px | Badges, avatars, pill tabs |

The base radius is a single CSS variable (`--radius: 0.5rem`) with `md` and `sm`
derived as `calc(--radius - 2px)` and `calc(--radius - 4px)` — change one value
and the whole product follows.

Borders are 1px and `gray20` by default; the toolbar's bottom rule is the one
2px border in the app. Icons are **Google Material Symbols (outlined)** at 400
weight, sized 16–24px, plus `lucide-react` for chevrons, close, and other
control glyphs. Avatars are circular with a gray-neutral fallback showing
initials in 600 weight.

## Components

**Button.** Height 40px default (36 small, 44 large, 40×40 icon-only), radius
`md`, 14px/600 label, 8px gap to an icon, `transition-colors`. Variants:
`default` (filled interactive blue, white label), `destructive` (filled
critical), `outline` (white fill, `gray20` border, gray-tinted hover), `secondary`
(gray fill), `ghost` (transparent until hover), `link` (blue, underline on
hover). Disabled = 50% opacity, pointer events off. A `loading` button shows a
spinning ring in place of nothing else and is disabled while loading.

**Input / Textarea / Select.** 40px tall, radius `md`, 1px `gray20` border,
white fill, 12px horizontal padding, 14px text, `gray50` placeholder. Focus is a
2px `#4c8df6` ring with a 2px offset — never a colored border alone. The invalid
state uses a `#e02d38` border and a `#fef4f4` fill, with the message in
`helper`/critical below the field. Labels sit above the field in `subheading`.

**Card.** White, radius `lg`, 1px border, `shadow-sm`. Header/content/footer each
take 24px padding (content and footer drop the top padding). Title is
`displaySm`, description `bodySm` at `textSubdued`.

**Section card.** The form/detail workhorse: white, radius `md`, 32px padding,
`gray20` border, 20px bottom margin. Optional 12px blue eyebrow, then a
`headingLg` title, then `bodySm` description, then a 16px-gap grid of fields.

**Table.** White surface, `gray5` header row, header cells `bodySmBold` at
`textSubdued`, body cells `bodySm`, 12px cell padding, 1px `gray20` row
separators, `gray10` row hover. Sticky headers and sticky first/last columns are
supported for wide tables. Above the table sits a summary line ("Menampilkan
X dari Y") on the left and pagination on the right. Empty states are centered in
the table body with generous vertical padding. Loading uses skeleton rows of the
real column shape — never a spinner over the table.

**Badge.** Pill, 12px/600 text, ~10px horizontal padding. Variants: default
(filled brand), secondary (gray fill), destructive, outline (border only).
Status badges pair a subdued fill with a solid text color.

**Pill tabs.** A `full`-radius white bar with 4px padding and a `gray10` border;
triggers are full-radius, 14px/500, `textSubdued`. The active trigger goes white
with `shadow-md` and a 1px interactive-blue border, and its label turns blue.

**Dialog.** Centered, max-width 512px (wider variants opt in), radius `xl`, 32px
padding, `shadow-lg`, over a `black/70` scrim. Close affordance is a small
top-right `sm`-radius icon button at 70% opacity. Title in `headingLg`, body in
`bodySm`, footer buttons right-aligned with 8px gap and the primary action last.
Destructive confirmations use `AlertDialog` — no dismiss-by-outside-click.

**Info alert.** `blue5` fill, radius `xl`, 16px padding, `shadow-sm`, a Material
`info` icon at the top-left, then a `bodySmBold` label and `bodySm` message on
one wrapping line. Used for instructions above forms.

**Sidebar menu.** Leaf items: full-width, radius `md`, 8px padding, 8px gap,
icon + label, `white/10` hover. Branch items: same trigger plus a right-aligned
chevron rotating 90° when open; children are indented, 8px vertical margin,
`white/10` when active. External links append an `open_in_new` icon.

**Dropdown menu.** White, radius `lg`, `shadow-md`, min-width 224px, 14px items
with a leading 16px icon and 8px gap; separators are 1px `gray10`.

**Breadcrumb.** In the toolbar, `bodySm`, chevron separators, links at
`textSubdued` and the current page at `textDefault` — the current page is never
a link.

## Do's and Don'ts

**Do**

- Put every authenticated page inside the shell: sidebar + header + toolbar +
  gray canvas. Consistency of chrome is what makes this feel like one product.
- Set the page title once, in the toolbar, and let breadcrumbs carry location.
- Use `bodySm` (14px) as the default for interface text; step up only for
  headings.
- Reach for a 1px `gray20` border before you reach for a shadow.
- Keep radius at `md` (6px) for controls and `lg` (8px) for containers; let the
  `--radius` variable drive both.
- Use the subdued status fills for banners and badges, and the solid status
  colors for text and icons on top of them.
- Show skeletons shaped like the real content while loading, and give every
  table a designed empty state.
- Right-align dialog and form footers, primary action last, 8px gap.
- Focus everything with the 2px `#4c8df6` ring plus 2px offset.

**Don't**

- Don't introduce a second brand hue. Purple, teal, pink, and the rest of the
  ramp exist in the token file but are not part of this product's surface.
- Don't use pure black `#000000` for text — body copy is `#2f3031`.
- Don't use the navy `#103178` for anything but the sidebar.
- Don't add font weights beyond 400 and 600, or a second typeface.
- Don't stack shadows or use anything heavier than `shadow-lg`; depth here is
  border-and-contrast, not lift.
- Don't animate longer than 200ms, and don't use easing with overshoot.
- Don't put a page-level heading inside the content canvas duplicating the
  toolbar title.
- Don't build full-bleed or multi-column marketing-style layouts; content is a
  single column of cards.
- Don't rely on color alone for status — pair every status color with an icon
  or a text label.
- Don't design for mobile-first here; this is a desktop console that degrades
  gracefully, not a responsive app.
