# DESIGN.md — SCOUTBOARD DESIGN SYSTEM

## 1. Product Design Philosophy

Scoutboard is an intelligence discovery, data collection, and research platform built for researchers, engineers, founders, and analysts. 

The aesthetic identity balances **Antigravity Spatial Depth** with **Data-Dense Intelligence Workstation Discipline**:
- **Intelligent & Focused:** The interface avoids frivolous decorations, massive marketing heroes, or generic AI pastel gradients.
- **Spatial Hierarchy & Weightlessness:** Layered surfaces, subtle elevations, crisp border separations (`rgba(255, 255, 255, 0.08)` in dark mode, `#E2E8F0` in light mode), and soft atmospheric glow give high-priority cards a floating, tactile feel without disrupting readability.
- **High Data Density:** Clean tables, compact badges, monospace timestamps, and clear categorization maximize information throughput.
- **Free-First & Honest:** No fake statistics, no fabricated confidence metrics. Every metric and card maps directly to concrete backend data and verifiable external sources.

---

## 2. Color Palette & Tokens

Scoutboard uses a dual-palette architecture with high contrast (WCAG AAA compliant for critical text).

### Dark Mode (Intelligence Terminal — Default)
- **Background Base:** `#090D16` (Deep space abyss)
- **Surface Elevation 1 (Sidebar / Panels):** `#0F172A` (Rich obsidian slate)
- **Surface Elevation 2 (Cards / Modals):** `#1E293B` (Elevated charcoal)
- **Surface Glass Overlay:** `rgba(30, 41, 59, 0.75)` with `backdrop-filter: blur(12px)`
- **Border Default:** `rgba(148, 163, 184, 0.12)`
- **Border Highlight / Active:** `rgba(56, 189, 248, 0.35)`
- **Text Primary:** `#F8FAFC`
- **Text Secondary / Muted:** `#94A3B8`
- **Text Dimmed / Meta:** `#64748B`
- **Accent Primary (Cyan/Blue Intelligence):** `#38BDF8` (Sky 400) / `#2563EB` (Blue 600)
- **Accent Success (Live / Healthy):** `#10B981` (Emerald 500)
- **Accent Warning (Pending / Rate Limit):** `#F59E0B` (Amber 500)
- **Accent Danger (Failed / Vulnerability):** `#EF4444` (Rose 500)
- **Accent Intelligence (Gap / Opportunity):** `#A855F7` (Purple 500)

### Light Mode (Clean Research Lab)
- **Background Base:** `#F8FAFC`
- **Surface Elevation 1:** `#FFFFFF`
- **Surface Elevation 2:** `#F1F5F9`
- **Border Default:** `#E2E8F0`
- **Text Primary:** `#0F172A`
- **Text Secondary:** `#475569`
- **Accent Primary:** `#0284C7`

---

## 3. Typography Hierarchy

Fonts loaded via web standards:
- **Primary Interface:** `Inter`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `sans-serif`
- **Code, Hashes, Data Metrics & Timestamps:** `Fira Code`, `JetBrains Mono`, `monospace`

### Hierarchy Scale
| Token | Size | Line Height | Weight | Use Case |
|---|---|---|---|---|
| `display-xl` | 28px (1.75rem) | 1.2 | 700 | Dashboard overview header |
| `heading-lg` | 22px (1.375rem) | 1.3 | 600 | Page titles, major workspace headings |
| `heading-md` | 17px (1.0625rem) | 1.4 | 600 | Modal titles, card section titles |
| `body-base` | 14px (0.875rem) | 1.5 | 400 / 500 | Main readable content, record descriptions |
| `body-sm` | 13px (0.8125rem) | 1.4 | 400 / 500 | Table cells, secondary details, filter options |
| `meta-xs` | 11px (0.6875rem) | 1.4 | 500 / 600 | Badges, timestamps, source tags, hashes (Mono) |

---

## 4. Spatial Depth & Motion Rules

- **Elevation Layering:**
  - Base canvas: `z-0`
  - Sticky sidebars & headers: `z-20`
  - Floating action drawers & search overlays: `z-40`
  - Modals & dialogs: `z-50`
  - Toasts & urgent alerts: `z-60`
- **Antigravity Floating Effect:**
  - Standard cards feature subtle hover lifts: `transform: translateY(-2px)`, shadow `0 8px 24px -4px rgba(0, 0, 0, 0.3)`.
  - Glass accents have a 1px border highlight `rgba(255, 255, 255, 0.08)` and subtle interior rim glow.
- **Duration & Timing:**
  - Micro-interactions (hover, focus, button active): 150ms `cubic-bezier(0.16, 1, 0.3, 1)`
  - Panel reveals, drawers, and tabs: 220ms `cubic-bezier(0.16, 1, 0.3, 1)`
  - Staggered card entrances: 60ms stagger per child
- **Accessibility / Reduced Motion:**
  - All transforms, scale changes, and parallax transitions are disabled when `@media (prefers-reduced-motion: reduce)` is active.

---

## 5. Component Standards

1. **Buttons:**
   - Primary: High contrast accent background with crisp text and subtle inner shadow.
   - Secondary: Transparent with elevated border `border-slate-700/60 hover:bg-slate-800/50`.
   - Danger: Muted rose fill with crisp border.
   - Always include visible focus ring `ring-2 ring-sky-500/50 outline-none`.
2. **Status Indicators:**
   - Must use both color and semantic icons/text (e.g., green dot + "Active", amber clock + "Pending", red warning + "Failed"). Never rely solely on color.
3. **Data Tables:**
   - Fixed header on scroll, zebra hover rows, monospaced ID/timestamp columns, right-aligned numbers, instant filter bars.
4. **Empty States:**
   - Clear icon, actionable headline, one-sentence explanation, and prominent CTA button (e.g., "Add your first RSS Feed").
5. **Form Controls:**
   - Visible labels, contextual helper text, instant inline validation, clear error messages placed directly below the field.

---

## 6. Anti-Patterns Avoided

- ❌ No emoji as interface icons (only Lucide SVG icons).
- ❌ No gratuitous neon purple gradients across entire screens.
- ❌ No fake AI animation bars or fake percentages.
- ❌ No raw unhandled exceptions or silent empty tables without explanations.
- ❌ No blocking modal walls for simple tasks.

