# School Dashboard — Design System Spec

2026-09-21

## Overview

This spec assumes the dashboard is the admin interface for the student-grade extraction system covering the 10 schools (upload a spreadsheet, extract per-student results) — flag it if this is a different school dashboard and the component section will get adjusted. It defines the visual language, tokens, and component rules to build a fast, legible, distinctive interface, not a generic admin template.

How to use it: tokens (Color, Typography, Spacing) go straight into CSS variables and the Tailwind config; Core Components describes behavior for what you'll actually build first — upload, extraction table, school switcher.

## Design Philosophy

Four rules the whole system answers to:

1. **The data is the interface.** Ten schools, thousands of student rows, extraction confidence scores — the UI's job is to make dense records scannable, not to decorate them. Tables, numerals, and status are first-class; illustrations and marketing-style hero sections are not.
2. **One accent, used on purpose.** A single interactive color carries every call-to-action. A second accent exists only to mean "needs attention." No rainbow of pastel category colors.
3. **Flat until it needs to float.** Depth comes from hairlines and spacing, not shadows. Shadow is reserved for things that are actually above the page — menus, drawers, toasts.
4. **Arabic-first, not Arabic-retrofitted.** Layout, type scale, and spacing are designed in RTL first, then mirrored for LTR — not the other way around.

## Visual Identity Concept — "The Ledger"

The reference point is a school record ledger, not a SaaS analytics template: warm paper tones instead of clinical white/grey, a deep ink-teal for structure and text, and a single marigold accent used the way a teacher's pen marks something for review. Numbers are set in a monospaced numeral face so grades and IDs line up like a printed report card, not a generic UI font.

This gives the dashboard a distinct, slightly editorial feel — closer to a well-made institutional document than a generic startup dashboard — while staying fast for daily data entry and review.

Signature details that carry the concept:

- Status badges are small stamped rectangles with one clipped corner, not rounded pills.
- The school switcher reads as ledger tabs across the top, not a logo plus dropdown.
- Section dividers use a thin double-rule, like a ledger line, instead of a plain border.

## Color System

Light mode (default):

| Token | Hex | Use |
| --- | --- | --- |
| `--paper` | `#F6F3EA` | App background |
| `--surface` | `#FFFFFF` | Cards, panels, table body |
| `--surface-sunken` | `#EFEAD9` | Table row stripe, inset panels |
| `--ink` | `#1E2323` | Primary text, headings |
| `--ink-muted` | `#5C6663` | Secondary text, labels, placeholders |
| `--border` | `#E1DBC8` | Hairlines, dividers, input borders |
| `--accent` | `#0E5C55` | Primary buttons, links, active nav, focus ring |
| `--accent-hover` | `#0A4A44` | Accent hover / pressed |
| `--attention` | `#D98E2B` | "Needs review" badges, highlighted cells |
| `--success` | `#3F7D53` | Verified / passed status |
| `--danger` | `#B23B2E` | Errors, failed extraction, destructive actions |

Dark mode (same roles):

| Token | Hex |
| --- | --- |
| `--paper` | `#14181A` |
| `--surface` | `#1B2124` |
| `--surface-sunken` | `#20272A` |
| `--ink` | `#EDEAE0` |
| `--ink-muted` | `#98A0A0` |
| `--border` | `#2C3336` |
| `--accent` | `#3EA79A` |
| `--attention` | `#E3A24B` |
| `--success` | `#5AA875` |
| `--danger` | `#D66B5C` |

Rule: `--attention` and `--danger` are never used decoratively — status only, nowhere else.

## Typography

| Role | Typeface | Notes |
| --- | --- | --- |
| Arabic UI text | IBM Plex Sans Arabic | Distinct from the default Cairo/Tajawal/Noto pairing used on almost every Saudi platform |
| Latin UI text | IBM Plex Sans | Pairs cleanly with the Arabic family, matching x-height |
| Numerals (grades, IDs, dates) | IBM Plex Mono | Tabular figures so columns of numbers align like a printed ledger |

Type scale (root 16px, line-height in parentheses):

| Level | Size | Weight | Use |
| --- | --- | --- | --- |
| Display | 28px (34) | 600 | Page title |
| H1 | 22px (28) | 600 | Section header |
| H2 | 17px (24) | 600 | Card / table header |
| Body | 15px (22) | 400 | Default text |
| Small | 13px (18) | 400 | Meta, captions |
| Micro label | 11px (14) | 600, +0.04em tracking | Uppercase field labels only |
| Data numeral | 15–20px | 500 (mono) | Table values, KPI figures |

Rule: one weight per role. Never mix 400/500/600 within the same text level to fake hierarchy — change size or color instead.

## Spacing & Layout Grid

Base unit: 4px. Scale: 4, 8, 12, 16, 24, 32, 48, 64.

- Desktop container: max-width 1440px, 32px side padding, 12-column grid, 24px gutter.
- Tablet (768–1279px): 8-column grid, 16px gutter, 24px side padding.
- Mobile (<768px): single column, 16px side padding.
- Table row height: 44px default, 56px when a row shows a secondary line (e.g., subject under student name).
- Radius scale: 6px (inputs, buttons, small badges), 10px (cards, drawers). Nothing larger — no 16–24px pillowy corners.
- Vertical rhythm inside a card: 16px between header and body, 12px between stacked fields.

## Elevation & Depth

Default state is flat: a 1px `--border` hairline defines every card, table, and input. No box-shadow on resting elements.

Shadow is reserved for things genuinely above the page:

| Layer | Shadow | Example |
| --- | --- | --- |
| Dropdown / popover | `0 4px 12px rgba(20,24,26,0.10)` | Filter menu, select |
| Drawer / modal | `0 8px 24px rgba(20,24,26,0.14)` | Student detail panel |
| Toast | `0 6px 16px rgba(20,24,26,0.12)` | Save confirmation |

Never stack a shadow on a card that's already using a border for depth — pick one per element, border by default.

## Iconography & Imagery

- One icon set, one stroke weight (1.5px), monochrome (`--ink-muted` at rest, `--accent` when active). No filled gradient icons, no 3D icon packs, no icon-in-a-soft-color-circle pattern on stat cards.
- No emoji as functional icons anywhere in the product UI.
- No stock photography or generic 3D-blob/abstract-shape illustrations. Empty and error states use one custom line-drawn mark (an open ledger/book), reused everywhere — not a different stock illustration per screen.
- Avatars: no random-gradient circles. Each school gets one deterministic color (derived from its ID) used consistently for its tab, badges, and initial-avatar background, so color becomes a way to recognize a school, not decoration.

## Core Components

**School switcher** — Ledger-style tabs across the top of the app shell, not a sidebar logo plus dropdown. Each tab shows the school's deterministic color as a 3px underline. Active tab sits on `--surface`; inactive tabs sit on `--paper`. Past \~6 schools, overflow collapses into a searchable "More schools" tab rather than a scrolling row.

**Upload / extraction zone** — A single persistent dropzone above the table, not a separate upload page. States: *Idle* (dashed `--border`, instruction text) → *Uploading* (thin progress bar, no circular spinner) → *Extracting* (row-by-row status appears live in the table below instead of a blocking full-screen loader) → *Needs review* / *Verified* (stamp badge, below). Show extraction confidence as a plain mono-numeral percentage in its own column — never a circular gauge or traffic-light dots.

**Status badges ("stamps")** — Small rectangles with one clipped corner, not pills. `--attention` / `--success` / `--danger` background at 12% opacity with full-strength text and a left border in the same color. Labels: "Verified," "Needs review," "Failed." One stamp style, reused everywhere status appears.

**Student records table** — Dense by default (44px rows), sortable columns, sticky header, tabular-numeral columns aligned to the trailing edge (follow logical alignment, not literal left/right, so it flips correctly in RTL). Row hover uses `--surface-sunken`, never a shadow or scale transform. Filters live as removable chips in a toolbar directly above the table — not a separate panel that hides the data.

**Detail drawer** — Clicking a student row opens a slide-in panel from the trailing edge, keeping the table visible underneath, rather than a full-screen modal. Same 10px radius and drawer shadow as Elevation & Depth.

**Toast / inline confirmation** — Bottom of viewport, leading edge, auto-dismiss after 4s, icon plus one line of text. No center-screen success modals or confetti for routine actions like "row verified."

## Motion & Micro-interactions

- Hover / focus transitions: 150ms ease-out on color and border only — no scale or shadow pop on hover.
- Drawer / panel enter: 220ms ease-out slide, no bounce or spring.
- Table rows appearing after extraction: simple 120ms fade-in, staggered 20ms per row — communicates "processing," not decoration.
- One signature moment, used once: when a row moves from "Extracting" to "Verified," the stamp badge does a single quick scale-in (180ms) — the only place in the product with a playful flourish. Everything else stays understated.
- No animated illustrations, no auto-playing loops, no motion on page load beyond content fading in once.

## Accessibility & RTL

- Body text contrast ≥ 4.5:1 against `--paper`/`--surface` in both color modes; check `--attention` text-on-tint combinations specifically, since amber-on-light fails easily.
- Build RTL-first: use logical CSS properties (`margin-inline-start`, `border-inline-end`, `text-align: start`) everywhere instead of `left`/`right`, so Arabic (default) and any LTR fallback share the same styles.
- Directional icons (arrows, chevrons, the drawer's slide direction) mirror in RTL; non-directional icons (search, filter, download) do not.
- Numerals stay LTR runs inside RTL text per standard bidi handling — don't manually reverse digit order.
- Minimum touch target 40×40px for row actions and badges, even though the primary use case is desktop/admin.
- Support both Hijri and Gregorian date display via a single toggle in settings, not two separate date columns.
- Visible focus ring: 2px `--accent`, 2px offset, on every interactive element — never removed for aesthetics.

## Anti-Slop Checklist

Reject on sight:

- [ ] Purple-to-blue gradient hero banners or gradient text on headings
- [ ] Glassmorphism / frosted-blur cards
- [ ] Stat cards with a pastel-gradient icon circle and a big number with no comparison or trend
- [ ] Default Cairo/Tajawal + Inter font pairing — the out-of-the-box look of almost every Saudi platform
- [ ] Rounded-2xl (16px+) cards with a soft ambient shadow on every element
- [ ] Random-color gradient avatar placeholders
- [ ] Stock photography of people at laptops, or generic 3D blob/abstract shapes
- [ ] Emoji used as functional icons
- [ ] Confetti or full-screen celebration modals for routine success states
- [ ] Circular percentage gauges where a plain number would be clearer
- [ ] More than one accent color competing for attention in the same view

If a screen could be mistaken for a default shadcn/Tailwind template with the school's logo swapped in, it hasn't used this system yet.

## Implementation Notes (Next.js / Tailwind)

- Define every token from Color System as a CSS variable in `globals.css` (`:root` and `[data-theme="dark"]`), then map them into `tailwind.config` under `theme.extend.colors` (e.g. `surface: 'var(--surface)'`). Components use semantic classes (`bg-surface`, `text-ink-muted`, `border-border`), never raw hex or `bg-white`/`bg-gray-100`.
- Load IBM Plex Sans Arabic, IBM Plex Sans, and IBM Plex Mono with `next/font` (self-hosted, no external font request) and expose them as `font-sans`, `font-sans-ar`, and `font-mono` in the Tailwind config.
- One generic `<StatusStamp status="verified" | "review" | "failed" />` component and one generic `<DataTable>` reused across every school's extraction results — matches reusing a shared `apiClient<T>` over parallel implementations.
- Keep `<Button>` to 3 variants (primary / secondary / ghost) × 2 sizes. Resist adding a variant per screen — that's how design systems drift into slop.
- School accent colors: derive deterministically (`hash(schoolId) % paletteLength`) from a fixed 10-color palette chosen once, rather than generating colors at runtime.
