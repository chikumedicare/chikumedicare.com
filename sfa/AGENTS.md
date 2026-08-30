# Antigravity Agent Working Rules & Guidelines

These rules are mandatory and must be strictly followed by the AI Agent across all sessions and tasks for this repository.

---

## 1. Mandatory Technical Confirmation Before Any Modification (User "OK" Required)
- **Clarify & Formalize in Technical Terms**: Regardless of which language (Hindi, Hinglish, English, etc.) or format the user gives a command in, the agent MUST first formulate it into a clear, precise technical specification before modifying any code.
- **Confirm Intent First**: Present the technical proposal clearly to the user:
  - Exactly what will be done.
  - Which specific files and components will be modified.
  - Potential architectural implications or trade-offs.
  - Ask: *"Kya aap yahi karna chahte hain? (Is this what you want to do?)"*
- **Strict Execution Gate**: STOP and wait for the user's explicit confirmation ("ok", "proceed", "yes", etc.). **NEVER execute or modify code before receiving user confirmation.**

---

## 2. Critical Technical Evaluation (No Blind Acceptance)
- **Do NOT blindly agree or accept proposals**: Even if suggested directly by the user, never rubber-stamp ideas without rigorous architectural, engineering, and feasibility validation.
- **Act as a High-Caliber Principal Engineer**:
  - Always evaluate whether a proposed change is technically possible, performant, secure, and aligns with enterprise software engineering standards.
  - If a suggestion has drawbacks, introduces unnecessary complexity (over-engineering), breaks best practices, or is technically flawed, **directly and honestly warn the user**.
  - Present the exact technical reality, pros/cons, and recommend the superior, industry-standard solution before taking action.

---

## 3. Strict 350 Lines of Code Limit Per File
- **Maximum 350 Lines**: No file in the repository (TypeScript, TSX, CSS, JavaScript) may exceed 350 lines of code.
- **Proactive Modularization**:
  - If a component, controller, service, or store grows close to or beyond 350 lines, immediately break it down into clean, reusable sub-components, helper utilities, or custom hooks.
  - Ensure all extracted modules have explicit type definitions, maintain backward compatibility, and avoid circular dependencies.

---

## 4. Strict TypeScript Typing (Minimal `any` Policy)
- **Zero Casual `any`**: Do NOT use `any` casually, as a shortcut, or to suppress linter errors.
- **Explicit Domain Models & Interfaces**:
  - Always use well-defined TypeScript interfaces, domain schemas, union types, and generics.
  - Use `unknown` with explicit runtime type narrowing / guards instead of `any` where dynamic input is handled.
  - `any` is strictly restricted only to the absolute rarest edge cases (e.g. untyped legacy 3rd-party libraries or raw polymorphic SQL rows prior to parsing), and must be cast/validated into a concrete domain model immediately.

---

## 5. Production-Grade Quality Only (Zero Loose / Sloppy Code)
- **Strict Production-Ready Architecture**:
  - Never write "quick-and-dirty", loose, or hacky code.
  - Comprehensive error boundaries, input sanitization, and defensive null/undefined checks on every network and database boundary.
  - No dummy placeholders, no stubbed mock logic in production flows, and no unresolved promises.
  - Clean, idiomatic, and maintainable software design patterns (SOLID principles, DRY, Separation of Concerns).

---

## 6. Strict Scope Isolation (Zero Unrelated File Edits)
- **Minimal Blast Radius**: Only modify the specific file being worked on and its directly related dependencies.
- **No Drive-By Refactoring**: Never touch, reformat, or alter unrelated files, modules, or configurations that are outside the explicit scope of the current task.
- Ensure all changes are surgical, tightly scoped, and do not inadvertently break adjacent features.

---

## 7. Targeted & Efficient Testing (No Token Waste)
- **Focused Verification**:
  - Test only what was actually edited.
  - Do NOT run heavy, multi-step browser subagents or full-suite recordings for trivial CSS tweaks, text changes, or minor layout adjustments.
  - Run lightweight checks (e.g. `tsc -b && vite build` or targeted unit tests) directly and promptly.

---

## 8. Zero Regressions & Integrity Guarantee
- Every change must compile cleanly with `tsc -b && vite build` (0 errors).
- All backend Vitest suites must pass with 100% success.
- Changes must be cleanly committed and pushed to `origin/main` when completed.

---

## 9. 100% Live Cloudflare D1 Database Mandate (Zero Mock / Zero Local Stubs / Pure Live Persistence)
- **Strict Single Source of Truth**:
  - Project ki A to Z files, components, screens, dropdown options aur workflows—chahe past ke ho, current ho ya future modules—100% data live Cloudflare D1 database se hi lenge aur D1 me hi save karenge.
- **Zero Mock, Fake or Local Storage Fallbacks**:
  - Kisi bhi component me koi fake/mock JSON, hardcoded arrays, dummy placeholders ya in-memory stubs use karna strictly forbidden hai.
  - Business records (Divisions, HQs, Employees, Products, Doctors, Chemists, Stockists, Leaves, SFC, etc.) ke liye browser `localStorage`, `sessionStorage` ya browser history ko pseudo-database ki tarah use nahi kiya jayega.
- **Pure Live Dynamic Binding**:
  - Sabhi dropdowns, selects aur relationship filters (e.g. Division lists, HQ lists, Manager lists) live D1 tables se fetch honge.
  - Har Create, Read, Update, Delete (CRUD) operation directly live Cloudflare D1 SQL query ke through execute hoga.
  - Kisi bhi naye feature ka development tabhi shuru hoga jab uska Cloudflare D1 table schema aur live gateway configured ho.
