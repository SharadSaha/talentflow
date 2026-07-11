# UI Design System

## Objective

Build a modern, elegant, enterprise-grade user interface inspired by products such as **Linear**, **Vercel Dashboard**, **Stripe Dashboard**, **GitHub**, and **Notion**.

The goal is **not** to copy their interfaces, but to emulate their design philosophy:

* Minimal
* Functional
* Consistent
* Fast
* Accessible
* Information-dense without feeling cluttered
* Production quality

Every screen should feel like it belongs to the same design system.

---

# Design Philosophy

Always optimize for clarity.

Avoid unnecessary visual decoration.

Whitespace should communicate hierarchy.

Use subtle animations instead of flashy effects.

Prefer typography and spacing over excessive colors.

Every interaction should feel responsive.

Every component should have a consistent appearance across the application.

---

# UI Stack

Use the following libraries.

* Tailwind CSS
* shadcn/ui
* Radix UI
* Lucide React
* class-variance-authority (CVA)
* clsx
* tailwind-merge

Do not introduce additional component libraries.

Every reusable component should be built on top of Radix primitives where appropriate.

---

# Theme Architecture

The application must support a centralized theme system.

Never hardcode colors inside components.

Every color should come from CSS variables.

Example theme tokens

```css
:root {
  --background:
  --foreground:

  --surface:
  --surface-hover:

  --card:
  --card-foreground:

  --primary:
  --primary-foreground:

  --secondary:
  --secondary-foreground:

  --muted:
  --muted-foreground:

  --accent:
  --accent-foreground:

  --success:
  --warning:
  --destructive:

  --border:
  --input:
  --ring:

  --radius:
}
```

Tailwind should reference these variables instead of fixed colors.

Support both light and dark themes from day one.

Use a ThemeProvider for theme management.

---

# Color Philosophy

Keep the palette intentionally small.

Use color only to communicate meaning.

Examples

Primary

Main actions.

Success

Successful operations.

Warning

Potential issues.

Destructive

Dangerous actions.

Muted

Secondary content.

Avoid multiple shades unless required.

---

# Typography

Use **Inter** as the primary font.

Typography should establish hierarchy.

Recommended scale

* Display
* H1
* H2
* H3
* H4
* Body Large
* Body
* Small
* Caption

Use font weight rather than excessive font sizes.

Maintain consistent line heights.

Avoid more than three font weights.

---

# Spacing System

Use an 8-point spacing system.

Examples

4

8

12

16

24

32

40

48

64

Maintain consistent spacing throughout the application.

Avoid arbitrary spacing values.

Whitespace should communicate structure.

---

# Border Radius

Use a single radius scale.

Examples

Small

Medium

Large

Extra Large

Avoid inconsistent corner radii.

---

# Shadows

Keep shadows subtle.

Use elevation sparingly.

Cards should rely more on borders than shadows.

Avoid heavy drop shadows.

---

# Icons

Use Lucide React exclusively.

Icons should communicate intent.

Avoid decorative icons.

Maintain consistent icon sizes.

---

# Animations

Animations should feel fast.

Use subtle transitions.

Examples

Hover

Focus

Open

Close

Loading

Avoid excessive animations.

Never animate purely for decoration.

---

# Layout System

Create reusable layouts.

Examples

Auth Layout

Dashboard Layout

Public Layout

Dashboard layout should contain

* Sidebar
* Header
* Main Content
* Optional Right Panel

Maintain consistent page padding.

Use responsive containers.

---

# Component Hierarchy

Follow this structure.

Primitive Components

↓

UI Components

↓

Business Components

↓

Containers

↓

Pages

Business logic should never exist inside primitive UI components.

---

# UI Components

The following components should form the design system.

Buttons

Inputs

Textarea

Label

Checkbox

Radio Group

Switch

Select

Combobox

Autocomplete

Badge

Avatar

Card

Dialog

Drawer

Sheet

Popover

Tooltip

Dropdown Menu

Tabs

Accordion

Separator

Skeleton

Spinner

Toast

Alert

Progress

Breadcrumb

Pagination

Data Table

Empty State

Loading State

Error State

Search Input

Filter Panel

Command Palette

Every component should expose a consistent API.

---

# Buttons

Support variants.

Examples

Primary

Secondary

Outline

Ghost

Link

Destructive

Support sizes.

Small

Medium

Large

Support loading state.

Support disabled state.

Support left and right icons.

Use CVA for variants.

---

# Forms

Every form should use

React Hook Form

*

Zod

Support

Validation

Loading

Disabled submit

Field-level errors

Global errors

Success feedback

Never rely on browser validation.

---

# Data Tables

Data tables should support

Sorting

Pagination

Searching

Filtering

Loading

Empty states

Selection

Responsive behavior

Avoid building custom tables unless necessary.

---

# Loading States

Never leave blank screens.

Use

Skeletons

Progress indicators

Optimistic updates where appropriate

Every async operation should provide user feedback.

---

# Empty States

Every list should have an empty state.

Empty states should explain

Why there is no data

What the user can do next

Prefer illustrations only when they improve understanding.

---

# Error States

Display meaningful messages.

Provide retry actions where appropriate.

Avoid exposing technical errors.

---

# Notifications

Use toast notifications for

Success

Warning

Errors

Informational messages

Avoid intrusive modals for simple confirmations.

---

# Accessibility

Accessibility is mandatory.

Every interactive element should support keyboard navigation.

Dialogs must trap focus.

Buttons require accessible labels.

Inputs require labels.

Use semantic HTML before ARIA.

Maintain WCAG-compliant contrast.

Visible focus indicators are required.

---

# Responsive Design

Desktop-first.

Support

Mobile

Tablet

Desktop

Large Desktop

Avoid horizontal scrolling.

Use responsive grids.

Collapse navigation appropriately.

---

# Tailwind Guidelines

Use utility classes.

Avoid inline styles.

Extract repeated class combinations into reusable components using CVA.

Use

clsx

*

tailwind-merge

for conditional styling.

Avoid class duplication.

---

# Component Guidelines

Every reusable component should

Have explicit prop interfaces.

Support forwarding refs where appropriate.

Expose only necessary props.

Avoid unnecessary abstractions.

Avoid feature-specific logic.

Prefer composition over inheritance.

Keep components small and focused.

---

# Design Consistency

Maintain consistency across

Spacing

Typography

Button sizes

Icon sizes

Border radius

Shadows

Animations

Colors

Every page should feel like part of the same product.

---

# UX Principles

Always optimize common user workflows.

Reduce clicks where possible.

Provide immediate feedback.

Avoid blocking the user unnecessarily.

Preserve user context.

Remember filter and sorting preferences where appropriate.

Prefer progressive disclosure over overwhelming the user.

---

# Performance

Lazy load large pages.

Virtualize long lists.

Optimize images.

Avoid unnecessary re-renders.

Memoize only when beneficial.

Keep interactions smooth.

---

# Quality Checklist

Before considering any UI complete, verify

* Uses the shared design system
* Uses shadcn/ui and Radix primitives appropriately
* Uses CSS theme variables
* Supports light and dark themes
* No hardcoded colors
* Fully responsive
* Keyboard accessible
* Proper loading states
* Proper empty states
* Proper error states
* Consistent spacing
* Consistent typography
* Uses reusable components
* No duplicated UI
* Smooth transitions
* Production-quality polish
* Matches the overall Linear-inspired design language
