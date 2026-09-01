# Release & Build Instructions

Build commands, packaging instructions, and deployment details for **Bachelors' Meal Manager**.

---

## 1. Prerequisites
- Node.js version 18+ (tested with v24.18.0)
- npm version 9+ (tested with 11.2.0)

---

## 2. Installation & Build Commands

```bash
# 1. Install all dependencies
npm install

# 2. Run automated test suite
npm run test

# 3. Start local development server
npm run dev

# 4. Build production distribution bundle
npm run build

# 5. Preview production build locally
npm run preview
```

---

## 3. Production Deliverable Output
- The production distribution build generates self-contained static assets in the `dist/` directory ready for web, PWA, Electron, Capacitor, or any static host.
