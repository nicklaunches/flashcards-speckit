<!--
Sync Impact Report:
- Version change: [new] → 1.0.0
- Modified principles: [new] → 5 new principles established
- Added sections: Core Principles (5), Technology Stack, Performance & Accessibility Standards
- Removed sections: None
- Templates requiring updates:
  ✅ plan-template.md - technical context section aligns with tech stack requirements
  ✅ spec-template.md - user story prioritization aligns with vertical slice principle
  ✅ tasks-template.md - task organization supports vertical slicing and time constraints
- Follow-up TODOs: None - all placeholder values defined
-->

# Flashcards SpecKit Constitution

## Core Principles

### I. Vertical Slicing (NON-NEGOTIABLE)
Every feature MUST be delivered as vertical slices where 90% of tasks complete in under 30 minutes. Tasks exceeding 30 minutes MUST be broken down further. Each slice MUST deliver end-to-end user value from UI to database. No horizontal layers or technical-only tasks without immediate user benefit.

**Rationale**: Ensures rapid feedback loops, reduces integration risk, and maintains development momentum through frequent, demonstrable progress.

### II. Technology Stack Adherence
MUST use React + Next.js + TypeScript for all frontend code. MUST use SQLite database with Drizzle ORM for all data persistence. No exceptions without constitutional amendment. External service dependencies are FORBIDDEN - all functionality MUST work locally.

**Rationale**: Enforces consistency, reduces learning curve, and ensures offline-first capability through local-only technology choices.

### III. Test Coverage Requirements
Unit tests MANDATORY for all core business logic (utilities, data models, business rules). Playwright smoke tests MANDATORY for critical user journeys. No feature ships without covering its core logic and primary user flow. Test-first development ENCOURAGED but not mandated.

**Rationale**: Ensures reliability while balancing development speed with quality assurance through targeted testing strategy.

### IV. Accessibility & Performance Standards
All UI components MUST meet WCAG AA accessibility standards. First Load JavaScript bundle MUST remain under 160KB. Performance budget violations require explicit justification and remediation plan before feature approval.

**Rationale**: Ensures inclusive access and maintains fast, responsive user experience even on slower devices and connections.

### V. Offline-First Architecture
Application MUST function completely without internet connectivity. No external API calls, cloud services, or network dependencies permitted. All features MUST work with local-only data and processing.

**Rationale**: Guarantees application reliability regardless of network conditions and protects user privacy by keeping all data local.

## Technology Stack

**Frontend**: React 18+, Next.js 14+, TypeScript 5+
**Database**: SQLite 3+ with Drizzle ORM
**Testing**: Vitest (unit), Playwright (integration/smoke)
**Styling**: Tailwind CSS (performance budget compliant)
**Build**: Next.js built-in bundling and optimization
**Deployment**: Static export capability for local hosting

All dependencies MUST align with offline-first principle. No CDN dependencies, external fonts, or cloud services permitted.

## Performance & Accessibility Standards

**Performance Metrics**:
- First Load JS: < 160KB (hard limit)
- First Contentful Paint: < 1.5s on simulated 3G
- Core Web Vitals: All metrics in "Good" range

**Accessibility Requirements**:
- WCAG AA compliance for all interactive elements
- Keyboard navigation support for all features
- Screen reader compatibility verified
- Color contrast ratios ≥ 4.5:1 for normal text, ≥ 3:1 for large text

**Validation**: Use Lighthouse CI for automated performance/accessibility checks on every build.

## Governance

This Constitution supersedes all other development practices and must be verified during code review. All features MUST demonstrate compliance with vertical slicing, technology stack, testing, performance, accessibility, and offline-first requirements before merge approval.

Violations require explicit justification documenting why the principle cannot be followed and what mitigation strategies will be employed. Constitutional amendments require documentation of rationale, impact analysis, and template updates.

Complexity exceeding constitutional bounds must be justified with evidence that simpler alternatives were evaluated and found insufficient for the specific technical requirements.

**Version**: 1.0.0 | **Ratified**: 2025-10-15 | **Last Amended**: 2025-10-15
