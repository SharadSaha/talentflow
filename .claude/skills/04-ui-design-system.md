# Design System

## Objective

Build a premium, enterprise-grade design system inspired by the design philosophy of modern productivity software such as **Linear**, **Vercel**, **GitHub**, **Raycast**, **Notion**, and **Figma**.

This is **not** a cloning exercise.

Do not copy layouts, branding, illustrations, icons, proprietary assets, or exact implementations.

Instead, adopt the same design principles:

* Minimal
* Elegant
* Dense but readable
* Fast
* Accessible
* Consistent
* Calm
* Professional

The application should immediately feel like a polished SaaS product rather than an interview assignment.

---

# Design Philosophy

Every UI decision should optimize for

* Clarity
* Speed
* Consistency
* Simplicity
* Productivity

Avoid decorative UI.

Avoid unnecessary visual effects.

Avoid trendy design patterns that reduce usability.

Every element should have a purpose.

---

# Theme System

The application must support

* Light Theme
* Dark Theme

The theme must be driven entirely through CSS variables.

Never hardcode colors.

Every component must consume semantic design tokens.

---

# Design Tokens

## Background

```css
--background: hsl(240 10% 4%);
--surface: hsl(240 8% 7%);
--surface-elevated: hsl(240 8% 10%);
--surface-hover: hsl(240 8% 13%);
```

---

## Foreground

```css
--foreground: hsl(0 0% 96%);
--foreground-secondary: hsl(240 5% 72%);
--foreground-muted: hsl(240 5% 56%);
```

---

## Borders

```css
--border: hsl(240 6% 18%);
--border-subtle: hsl(240 6% 14%);
--ring: hsl(248 90% 72%);
```

---

## Primary

```css
--primary: hsl(248 90% 66%);
--primary-hover: hsl(248 90% 62%);
--primary-foreground: hsl(0 0% 100%);
```

---

## Semantic Colors

```css
--success: hsl(145 63% 42%);
--warning: hsl(39 92% 56%);
--danger: hsl(0 72% 56%);
--info: hsl(215 95% 64%);
```

---

## Radius

```css
--radius-xs: 4px;
--radius-sm: 6px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
```

Avoid excessive border radius.

The interface should feel precise rather than playful.

---

# Typography

Use **Inter** as the primary typeface.

Hierarchy

```text
Display

H1

H2

H3

Body

Small

Caption
```

Weights

```text
400

500

600
```

Use 700 only when absolutely necessary.

Avoid all-caps except small labels.

---

# Spacing System

Use an 8-point spacing scale.

```text
4
8
12
16
20
24
32
40
48
64
80
96
```

Do not use arbitrary spacing values.

Maintain consistent vertical rhythm throughout the application.

---

# Shadows

Prefer borders over shadows.

Use subtle elevation only for

* Dialogs
* Popovers
* Dropdowns

Avoid large blurred shadows.

---

# Borders

Borders should define hierarchy.

Use subtle border colors.

Cards should rely on borders rather than elevation.

---

# Icons

Use **Lucide React** exclusively.

Icons should be

* 16px
* 18px
* 20px

depending on context.

Avoid decorative icons.

Icons should improve recognition rather than decoration.

---

# Animations

Animations should feel invisible.

Transition durations

```text
Fast

120ms

Normal

180ms

Slow

250ms
```

Timing function

```css
cubic-bezier(0.16, 1, 0.3, 1)
```

Animate

* Hover
* Focus
* Dialog
* Drawer
* Dropdown
* Tabs
* Sidebar

Avoid unnecessary page animations.

Respect prefers-reduced-motion.

---

# Layout

Desktop-first.

Responsive.

Consistent page padding.

Typical layout

```text
Sidebar

↓

Top Navigation

↓

Page Header

↓

Content

↓

Cards / Tables
```

Never place floating UI without purpose.

---

# Navigation

Navigation should remain visually subtle.

Use

* Icons
* Labels
* Active Indicator

Avoid colorful sidebars.

Navigation should not compete with page content.

---

# Cards

Cards should be

* Flat
* Clean
* Bordered
* Consistent

Avoid heavy shadows.

Avoid excessive padding.

Cards should integrate naturally with the layout.

---

# Tables

Tables are first-class citizens.

Every table should support

* Sorting
* Pagination
* Search
* Filters
* Empty State
* Loading State
* Hover
* Keyboard Navigation

Avoid zebra striping.

Hover should provide subtle feedback.

---

# Buttons

Support

Primary

Secondary

Ghost

Destructive

Loading

Disabled

Every button must support

* Keyboard navigation
* Focus ring
* Loading state

Only one primary action should exist within a section.

---

# Inputs

Inputs should

* Be compact
* Have subtle borders
* Show elegant focus states
* Support validation
* Support helper text
* Support disabled state

Avoid oversized inputs.

---

# Forms

Labels belong above inputs.

Group related fields.

Large forms should be divided into sections.

Support

* Validation
* Error messages
* Success state
* Disabled state
* Loading state

Use React Hook Form with Zod.

---

# Search

Search should support

* Debouncing
* Keyboard focus
* Clear button
* Search icon

Search should feel instantaneous.

---

# Filters

Filters should remain compact.

Use

* Select
* Multi-select
* Checkbox
* Date Picker

Collapse advanced filters where appropriate.

---

# Feedback

Every action should provide feedback.

Use

* Toast
* Inline success
* Inline validation

Never leave users uncertain about the result of an action.

---

# Loading States

Prefer skeleton loaders over full-page spinners.

Preserve layout while loading.

Avoid layout shifts.

---

# Empty States

Every empty state should explain

* Why it is empty
* What the user should do next

Avoid playful illustrations.

Keep messaging concise.

---

# Accessibility

Every component must support

* Keyboard navigation
* Focus indicators
* Screen readers
* Semantic HTML
* ARIA attributes where appropriate
* WCAG-compliant contrast ratios

Accessibility is mandatory.

---

# Responsive Design

Support

Desktop

Tablet

Mobile

Sidebar should collapse gracefully.

Tables should remain usable.

Avoid unnecessary horizontal scrolling.

---

# Performance

Optimize perceived performance.

Use

* Lazy loading
* Code splitting
* Virtualization where needed
* Memoization
* Optimistic updates
* Skeleton loading

Avoid blocking rendering.

---

# Component Standards

Every reusable component should

* Support variants
* Support sizes
* Forward refs
* Be fully typed
* Support dark mode
* Support accessibility
* Contain no business logic

Use

* shadcn/ui
* Radix UI
* Tailwind CSS
* class-variance-authority
* tailwind-merge
* clsx

Build on top of these libraries rather than replacing them.

---

# Design Principles

Always prefer

* Borders over shadows
* Typography over decoration
* Simplicity over complexity
* Consistency over novelty
* Composition over duplication
* Semantic colors over hardcoded values

---

# UX Principles

Reduce clicks.

Preserve user context.

Remember user preferences where appropriate.

Avoid unnecessary modals.

Use progressive disclosure.

Optimize common workflows.

---

# Quality Checklist

Before considering any UI complete, verify

* Uses only semantic CSS variables
* No hardcoded colors
* Uses design tokens consistently
* Uses the spacing scale
* Uses typography hierarchy
* Responsive on desktop, tablet, and mobile
* Supports dark and light themes
* Keyboard accessible
* Screen reader friendly
* Includes loading state
* Includes empty state
* Includes error state
* Includes disabled state
* Uses reusable UI components
* No duplicated styles
* No inconsistent spacing
* No inconsistent typography
* No unnecessary visual effects
* No layout shifts
* Meets production-quality standards

---

# Final Goal

The finished application should feel like a mature B2B SaaS product.

The user experience should communicate

* Precision
* Performance
* Reliability
* Professionalism
* Consistency
* Trust

If there is uncertainty between two design decisions, always choose the option that is simpler, cleaner, more restrained, and more consistent.
