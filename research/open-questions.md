# Research & Implementation Decisions (Open Questions Resolved)

This document records technical uncertainties, reference behavior analyses, and the decisions made during research to guarantee robust, safe implementation.

---

### Q1: How are fractional meals (e.g. 0.5 meal) treated in meal count and rate calculation?
- **Finding**: In Bangladesh bachelor messes, breakfast is often counted as 0.5 meal (or half meal), while lunch and dinner are counted as 1.0 meal each.
- **Decision**: Support increments of `0.5` directly in the UI steppers. All arithmetic uses precise floating/decimal math ($0.5, 1.0, 1.5, 2.0$, etc.) and reconciles transparently.

---

### Q2: How should shared non-food utilities (Rent, WiFi, Gas, Cook Salary) be handled?
- **Finding**: If non-food expenses are bundled into the "Meal Rate", members who ate fewer meals would unfairly pay less for fixed house rent and internet.
- **Decision**: Provide explicit separation:
  1. **Meal Bazar** $\rightarrow$ Contributes to Meal Rate.
  2. **Shared Utilities** $\rightarrow$ Split equally per active member (or customizable per member).
  3. **Special Feast / Event** $\rightarrow$ Split among participating members.

---

### Q3: What storage mechanism ensures 100% offline-first capability and durability?
- **Finding**: Users in hostels and student messes often log entries in areas with spotty network coverage or no internet connection.
- **Decision**: Build on top of IndexedDB (Dexie.js abstraction layer) with structured relational tables, atomic transactions, multi-index support, and full JSON export/import backup. Data is persisted directly on device storage and never lost on page refresh or browser restart.

---

### Q4: How should deleted items be handled to prevent accidental loss of financial hisab?
- **Finding**: Accidental deletion of a bazar record or meal entry could corrupt month-end accounts without anyone noticing.
- **Decision**: Implement a **Soft-Delete / Trash Bin** system with `isDeleted: boolean` and `deletedAt: string` metadata. Deleted items are hidden from active calculations but can be restored with a single click from the Trash Bin screen.
