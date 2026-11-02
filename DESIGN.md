# SCOUTBOARD — SENIOR PRODUCT DESIGN SYSTEM & ARCHITECTURE

## 1. Product Design Philosophy

Scoutboard is an intelligence discovery, research, and market analysis platform crafted for developers, researchers, founders, and analysts. 

The aesthetic identity is modeled after **Linear, Raycast, Vercel, Bloomberg Terminal, and Stripe**:
- **Editorial & Information-Dense:** Prioritizes scanability, high data throughput, and tabular precision over generic marketing cards.
- **Monochrome Neutrality:** Pure, deep zinc surfaces (`#09090B`, `#121215`, `#18181B`) with crisp 1px borders (`#27272A`).
- **No AI-Generated Clichés:** Zero purple-blue gradient backgrounds, zero blurry glassmorphism blobs, zero glowing laser borders, and zero decorative noise.
- **Tabular Numerals & High Scannability:** Tabular figure typography (`tnum`) for metrics, dates, and quality scores.

---

## 2. Design Tokens

### Color Palette (Linear / Vercel Dark Standard)
- **Canvas Root (`surface-0`):** `#09090B` (Zinc-950)
- **Primary Panel / Sidebar (`surface-1`):** `#0E0E12` / `#121215`
- **Elevated Row / Card / Input (`surface-2`):** `#18181B`
- **Hover / Active Surface (`surface-3`):** `#222227`
- **Subtle 1px Border:** `#27272A`
- **Strong / Focus Border:** `#3F3F46`
- **Text Primary:** `#FAFAFA`
- **Text Secondary:** `#A1A1AA`
- **Text Muted:** `#71717A`
- **Accent Primary (Linear Indigo):** `#6366F1`
- **Semantic Live / Success (Emerald):** `#10B981`
- **Semantic Warning (Amber):** `#F59E0B`
- **Semantic Critical (Rose):** `#EF4444`

---

## 3. Typography Scale

Loaded via Google Fonts: `Inter` for interface typography and `Fira Code` / `JetBrains Mono` for tabular metadata and code.

| Role | Size | Weight | Tracking | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Page Title** | `18px (1.125rem)` | 600 SemiBold | `-0.02em` | Workspace & page header |
| **Section Header** | `13px (0.8125rem)` | 600 SemiBold | `0.02em` | Group & table column header |
| **Body Content** | `13px (0.8125rem)` | 400 / 500 Regular | `0` | Primary readable headline / text |
| **Description** | `12px (0.75rem)` | 400 Regular | `0` | Sub-descriptions & summaries |
| **Monospace Meta** | `10px - 11px` | 500 / 600 Mono | `0.02em` | Badges, timestamps, QS, tabular tags |

---

## 4. Component Standards

### Editorial Row Layouts (Instead of Repetitive Cards)
- Intelligence stream and discovery items render as high-density editorial rows separated by subtle 1px `#27272A` dividers.
- Items feature metadata pills (`[REDDIT]`, `[HUGGINGFACE]`, `[TECHNEWS]`), scannable headlines, relative timestamps, quality score pills, and inline action icons (bookmark, AI summarize, open URL).

### Structured Matrix Tables
- Startup Radar (`/gaps`) renders as a structured data matrix with columns for Entity/Void, Category, Opportunity Score (e.g. 96/100 gauge), Priority, and Blueprint Actions.

### Compact Linear Sidebar
- 240px fixed width with logical grouping (`INTELLIGENCE`, `HARVEST & TOOLS`, `ANALYSIS`, `SYSTEM`), Raycast-style `⌘K` search trigger, and live node indicator.

---

## 5. Anti-Patterns (Strictly Avoided)
- ❌ Purple-blue blurry gradient backdrops.
- ❌ Oversized decorative cards with massive empty margins.
- ❌ Fake charts or fabricated confidence numbers.
- ❌ Glowing neon borders.
- ❌ Marketing hero banners on operational pages.
- ❌ Non-functional placeholder buttons.
