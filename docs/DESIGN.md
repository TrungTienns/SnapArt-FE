# The world of illustrations, where ideas become art reality

## Mission
Create implementation-ready, token-driven UI guidance for The world of illustrations, where ideas become art reality that is optimized for consistency, accessibility, and fast delivery across content site.

## Brand
- Product/brand: The world of illustrations, where ideas become art reality
- URL: https://pictoric.com.ua/
- Audience: readers and knowledge seekers
- Product surface: content site

## Style Foundations
- Visual style: clean, functional, implementation-oriented
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
Concise, confident, implementation-focused.

## Rules: Do
- Use semantic tokens, not raw hex values, in component guidance.
- Every component must define states for default, hover, focus-visible, active, disabled, loading, and error.
- Component behavior should specify responsive and edge-case handling.
- Interactive components must document keyboard, pointer, and touch behavior.
- Accessibility acceptance criteria must be testable in implementation.

## Rules: Don't
- Do not allow low-contrast text or hidden focus indicators.
- Do not introduce one-off spacing or typography exceptions.
- Do not use ambiguous labels or non-descriptive actions.
- Do not ship component guidance without explicit state rules.

## Guideline Authoring Workflow
1. Restate design intent in one sentence.
2. Define foundations and semantic tokens.
3. Define component anatomy, variants, interactions, and state behavior.
4. Add accessibility acceptance criteria with pass/fail checks.
5. Add anti-patterns, migration notes, and edge-case handling.
6. End with a QA checklist.

## Required Output Structure
- Context and goals.
- Design tokens and foundations.
- Component-level rules (anatomy, variants, states, responsive behavior).
- Accessibility requirements and testable acceptance criteria.
- Content and tone standards with examples.
- Anti-patterns and prohibited implementations.
- QA checklist.

## Component Rule Expectations
- Include keyboard, pointer, and touch behavior.
- Include spacing and typography token requirements.
- Include long-content, overflow, and empty-state handling.
- Include known page component density: buttons (39), links (38), cards (24), lists (4), navigation (2), inputs (1).

- Extraction diagnostics: Audience and product surface inference confidence is low; verify generated brand context.

## Quality Gates
- Every non-negotiable rule must use "must".
- Every recommendation should use "should".
- Every accessibility rule must be testable in implementation.
- Teams should prefer system consistency over local visual exceptions.
