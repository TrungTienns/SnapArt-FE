---
name: design-system-the-world-of-illustrations-where-ideas-become-ar
description: Creates implementation-ready design-system guidance with tokens, component behavior, and accessibility standards. Use when creating or updating UI rules, component specifications, or design-system documentation.
---

<!-- TYPEUI_SH_MANAGED_START -->

# The world of illustrations, where ideas become art reality

## Mission
Deliver implementation-ready design-system guidance for The world of illustrations, where ideas become art reality that can be applied consistently across content site interfaces.

## Brand
- Product/brand: The world of illustrations, where ideas become art reality
- URL: https://pictoric.com.ua/
- Audience: readers and knowledge seekers
- Product surface: content site

## Style Foundations
- Visual style: structured, accessible, implementation-first
- Main font style: `font.family.primary=GTAmericaLCGV`, `font.family.stack=GTAmericaLCGV`, `font.size.base=19px`, `font.weight.base=400`, `font.lineHeight.base=normal`
- Typography scale: `font.size.xs=14.25px`, `font.size.sm=19px`, `font.size.md=28.5px`, `font.size.lg=29.69px`, `font.size.xl=65.31px`, `font.size.2xl=251.75px`, `font.size.3xl=346.75px`
- Color palette: `color.text.primary=#411f15`, `color.surface.muted=#f6f6f6`, `color.text.tertiary=#ffffff`, `color.text.inverse=#ffd7e4`, `color.surface.base=#000000`, `color.surface.raised=#f2b8cb`
- Spacing scale: `space.1=7.13px`, `space.2=9.5px`, `space.3=19px`, `space.4=23.75px`, `space.5=28.5px`, `space.6=29.69px`, `space.7=38px`, `space.8=47.5px`
- Radius/shadow/motion tokens: `radius.xs=50px`, `radius.sm=71.25px`, `radius.md=83.13px` | `motion.duration.instant=200ms`, `motion.duration.fast=600ms`, `motion.duration.normal=1200ms`, `motion.duration.slow=1400ms`

## Accessibility
- Target: WCAG 2.2 AA
- Keyboard-first interactions required.
- Focus-visible rules required.
- Contrast constraints required.

## Writing Tone
concise, confident, implementation-focused

## Rules: Do
- Use semantic tokens, not raw hex values in component guidance.
- Every component must define required states: default, hover, focus-visible, active, disabled, loading, error.
- Responsive behavior and edge-case handling should be specified for every component family.
- Accessibility acceptance criteria must be testable in implementation.

## Rules: Don't
- Do not allow low-contrast text or hidden focus indicators.
- Do not introduce one-off spacing or typography exceptions.
- Do not use ambiguous labels or non-descriptive actions.

## Guideline Authoring Workflow
1. Restate design intent in one sentence.
2. Define foundations and tokens.
3. Define component anatomy, variants, and interactions.
4. Add accessibility acceptance criteria.
5. Add anti-patterns and migration notes.
6. End with QA checklist.

## Required Output Structure
- Context and goals
- Design tokens and foundations
- Component-level rules (anatomy, variants, states, responsive behavior)
- Accessibility requirements and testable acceptance criteria
- Content and tone standards with examples
- Anti-patterns and prohibited implementations
- QA checklist

## Component Rule Expectations
- Include keyboard, pointer, and touch behavior.
- Include spacing and typography token requirements.
- Include long-content, overflow, and empty-state handling.

## Quality Gates
- Every non-negotiable rule must use "must".
- Every recommendation should use "should".
- Every accessibility rule must be testable in implementation.
- Prefer system consistency over local visual exceptions.

<!-- TYPEUI_SH_MANAGED_END -->
