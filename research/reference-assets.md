# Reference Assets & UI Elements — Bachelors' Meal Manager

This inventory maps all visual iconography, typography, badges, and status color codes observed from the reference application and designed for the clean reimplementation.

---

## 1. Iconography System
We utilize high-clarity vector icons (Lucide icon set) corresponding directly to the reference app's functional actions:

| Icon Concept | Icon Name / Glyph | Functional Usage in App |
|---|---|---|
| Dashboard | `LayoutDashboard` | Home overview tab & navigation |
| Daily Meals | `UtensilsCrossed` | Meal entry screen & meal badges |
| Meal Table | `Grid` / `Table` | Matrix monthly spreadsheet view |
| Bazar / Groceries | `ShoppingBag` / `ShoppingCart` | Grocery shopping & expense records |
| Utilities & Bills | `Receipt` / `Zap` | Shared bills (electricity, gas, internet) |
| Deposits & Payments | `Wallet` / `CreditCard` | Member fund deposit logging |
| Members | `Users` / `UserCheck` | Member profiles & directory |
| Reports & Hisab | `FileText` / `Calculator` | Monthly statement, hisab reconciliation, export |
| Analytics | `PieChart` / `TrendingUp` | Expense & meal distribution charts |
| Trash / Recovery | `Trash2` / `RotateCcw` | Soft-deleted item recovery |
| Settings | `Settings` / `Sliders` | House setup, language, currency, backup |
| Export / Share | `Download` / `Share2` / `Printer` | PDF generation, CSV download, WhatsApp share |
| Increment / Decrement | `Plus` / `Minus` | Meal counter steppers (+/- 0.5) |
| Currency Symbol | `৳` (Bengali Taka) / `$` / `₹` | Currency formatting |

---

## 2. Color Palette & Semantics

| Semantic Concept | Light Theme Hex | Dark Theme Hex | Context of Use |
|---|---|---|---|
| **Primary Brand (Emerald)** | `#059669` / `#10B981` | `#10B981` / `#34D399` | Navigation header, active tabs, primary CTAs, meal rates |
| **Secondary Accent (Amber/Orange)** | `#F59E0B` / `#D97706` | `#FBBF24` / `#F59E0B` | Bazar / grocery items, warning alerts |
| **Success / Credit (Green)** | `#16A34A` | `#22C55E` | Positive balance ("In Credit / Refundable"), saved confirmations |
| **Danger / Due (Rose/Red)** | `#E11D48` | `#F43F5E` | Negative balance ("Due / Payable"), delete actions |
| **Info / Utility (Indigo/Blue)** | `#4F46E5` | `#6366F1` | Utility bills, deposit tags, role badges |
| **Surface Background** | `#F8FAFC` | `#0F172A` | Global application viewport backdrop |
| **Card Surface** | `#FFFFFF` | `#1E293B` | Floating cards, elevated sheets, modals |
| **Border & Dividers** | `#E2E8F0` | `#334155` | Table cell borders, list dividers |
| **Primary Text** | `#0F172A` | `#F8FAFC` | Headings, amounts, member names |
| **Secondary Text** | `#64748B` | `#94A3B8` | Captions, dates, unit labels |

---

## 3. Typography Hierarchy
- **Font Family**: Modern sans-serif stack (`Inter`, system-ui, -apple-system, sans-serif) + Bengali unicode support (`Hind Siliguri`, `Noto Sans Bengali`, sans-serif).
- **Headings**: Semibold / Bold with tight letter spacing for crisp number displays.
- **Numbers & Currencies**: Monospace / Tabular numbers (`font-variant-numeric: tabular-nums`) for perfect alignment in hisab tables.
