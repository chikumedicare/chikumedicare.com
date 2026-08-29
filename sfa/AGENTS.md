# Antigravity Agent Working Rules & Guidelines

These rules are mandatory and must be strictly followed by the AI Agent across all sessions and tasks for this repository.

---

## 1. Critical Technical Evaluation (No Blind Acceptance)
- **Do NOT blindly agree or accept proposals**: Even if suggested directly by the user, never rubber-stamp ideas without rigorous architectural, engineering, and feasibility validation.
- **Act as a High-Caliber Principal Engineer**:
  - Always evaluate whether a proposed change is technically possible, performant, secure, and aligns with enterprise software engineering standards.
  - If a suggestion has drawbacks, introduces unnecessary complexity (over-engineering), breaks best practices, or is technically flawed, **directly and honestly warn the user**.
  - Present the exact technical reality, pros/cons, and recommend the superior, industry-standard solution before touching any code.

---

## 2. Strict 350 Lines of Code Limit Per File
- **Maximum 350 Lines**: No file in the repository (TypeScript, TSX, CSS, JavaScript) may exceed 350 lines of code.
- **Proactive Modularization**:
  - If a component, controller, service, or store grows close to or beyond 350 lines, immediately break it down into clean, reusable sub-components, helper utilities, or custom hooks.
  - Ensure all extracted modules have explicit type definitions, maintain backward compatibility, and avoid circular dependencies.

---

## 3. Strict TypeScript Typing (Minimal `any` Policy)
- **Zero Casual `any`**: Do NOT use `any` casually, as a shortcut, or to suppress linter errors.
- **Explicit Domain Types & Interfaces**:
  - Always use well-defined TypeScript interfaces, domain schemas, union types, and generics.
  - Use `unknown` with explicit runtime type narrowing / guards instead of `any` where dynamic input is handled.
  - `any` is strictly restricted only to the absolute rarest edge cases (e.g. untyped legacy 3rd-party libraries or raw polymorphic SQL rows prior to parsing), and must be cast/validated into a concrete domain model immediately.

---

## 4. Production-Grade Quality Only (Zero Loose / Sloppy Code)
- **Strict Production-Ready Architecture**:
  - Never write "quick-and-dirty", loose, or hacky code.
  - Comprehensive error boundaries, input sanitization, and defensive null/undefined checks on every network and database boundary.
  - No dummy placeholders, no stubbed mock logic in production flows, and no unresolved promises.
  - Clean, idiomatic, and maintainable software design patterns (SOLID principles, DRY, Separation of Concerns).

---

## 5. Strict Scope Isolation (Zero Unrelated File Edits)
- **Minimal Blast Radius**: Only modify the specific file being worked on and its directly related dependencies.
- **No Drive-By Refactoring**: Never touch, reformat, or alter unrelated files, modules, or configurations that are outside the explicit scope of the current task.
- Ensure all changes are surgical, tightly scoped, and do not inadvertently break adjacent features.

---

## 6. Targeted & Efficient Testing (No Token Waste)
- **Focused Verification**:
  - Test only what was actually edited.
  - Do NOT run heavy, multi-step browser subagents or full-suite recordings for trivial CSS tweaks, text changes, or minor layout adjustments.
  - Run lightweight checks (e.g. `tsc -b && vite build` or targeted unit tests) directly and promptly.

---

## 7. Zero Regressions & Integrity Guarantee
- Every change must compile cleanly with `tsc -b && vite build` (0 errors).
- All backend Vitest suites must pass with 100% success.
- Changes must be cleanly committed and pushed to `origin/main` when completed.
