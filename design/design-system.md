# Design System — Bachelors' Meal Manager

A comprehensive, responsive, modern design system built with custom CSS variables, glassmorphism, responsive grid layouts, and high-contrast dark/light themes.

---

## 1. Design Tokens

### Color Tokens (CSS Custom Properties)
```css
:root {
  /* Brand Primary */
  --primary-50: #ecfdf5;
  --primary-100: #d1fae5;
  --primary-500: #10b981;
  --primary-600: #059669;
  --primary-700: #047857;

  /* Accent / Bazar Amber */
  --accent-500: #f59e0b;
  --accent-600: #d97706;

  /* Status Tokens */
  --success-bg: #dcfce7;
  --success-text: #15803d;
  --danger-bg: #ffe4e6;
  --danger-text: #be123c;
  --info-bg: #e0e7ff;
  --info-text: #4338ca;

  /* Light Surface System */
  --bg-main: #f8fafc;
  --bg-card: #ffffff;
  --bg-subtle: #f1f5f9;
  --border-color: #e2e8f0;
  --text-main: #0f172a;
  --text-muted: #64748b;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
}

[data-theme="dark"] {
  /* Dark Surface System */
  --bg-main: #090d16;
  --bg-card: #131b2e;
  --bg-subtle: #1e293b;
  --border-color: #27354f;
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --success-bg: rgba(34, 197, 94, 0.15);
  --success-text: #4ade80;
  --danger-bg: rgba(244, 63, 94, 0.15);
  --danger-text: #fb7185;
  --info-bg: rgba(99, 102, 241, 0.15);
  --info-text: #818cf8;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.5);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.4);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.5);
}
```

---

## 2. Spacing & Sizing Scale
- Base unit: `4px`
- Paddings: `8px (xs)`, `12px (sm)`, `16px (md)`, `24px (lg)`, `32px (xl)`
- Border Radius: `8px (sm)`, `12px (md)`, `16px (lg)`, `9999px (full/pill)`
- Tap Target Minimum: `44px × 44px` for mobile accessibility.

---

## 3. Responsive Breakpoints
- **Mobile**: `< 640px` (Bottom navigation bar, stacked cards, quick steppers).
- **Tablet**: `640px – 1024px` (Side drawer, responsive meal grid with scroll, 2-column KPI cards).
- **Desktop**: `> 1024px` (Full sidebar navigation, multi-column dashboard, pinned wide meal matrix).
