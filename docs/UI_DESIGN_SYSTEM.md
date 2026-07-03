# UI Design System - LocalPages.ph

## Brand Principles
- **Modern Philippine business directory**
- **Clean SaaS platform**
- **Minimal, premium, fast, trustworthy**

## Colors
- **Primary / Headers**: `#0C0C1C` (Deep Slate/Navy)
- **Accent / Interactive**: `#2563EB` (Blue 600)
- **Background**: `#F8FAFC` (Slate 50)
- **Cards / Surfaces**: `#FFFFFF` (White)
- **Borders**: `#E2E8F0` (Slate 200)
- **Text Body**: `#334155` (Slate 700)
- **Text Headings**: `#0F172A` (Slate 900)
- **Text Muted**: `#64748B` (Slate 500)

## Typography
- Font Family: `Inter`
- Hierarchy:
  - Page Titles: `text-2xl font-bold tracking-tight text-[#0C0C1C]`
  - Section Titles: `text-lg font-semibold text-[#0C0C1C]`
  - Card Titles: `text-base font-semibold`
  - Body: `text-sm text-slate-700`
  - Small / Muted: `text-xs text-slate-500`

## Components Overview
- **Buttons**: Rounded-lg (`rounded-lg`), bold contrast. Primary is `#0C0C1C`, Secondary is Blue, Outline is Slate 200.
- **Cards**: Flat white cards with `rounded-xl`, `border border-slate-200`, and `shadow-sm`.
- **Inputs/Select/Textarea**: Clean `border-slate-200` with `focus:ring-blue-600`, `rounded-lg`.
- **Badges**: Pill-shaped `rounded-full` for status indicators (Success=Green, Warning=Amber, Danger=Red, Default=Slate).

## Layout Patterns
- **Max Width Container**: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- **Dashboard Structure**: 
  - Left Sidebar (`w-64` on desktop, hidden/collapsible on mobile)
  - Main Content Area with padding `p-6 md:p-8`
- **Spacing**: Consistent use of `gap-4`, `gap-6`, `mb-8`.

## Responsive Guidelines
- Mobile-first approach. 
- Sidebars collapse on mobile.
- Grids adapt (1 column on mobile, 2-3 on tablet/desktop).
- Tables use horizontal scroll wrapping (`overflow-x-auto`) to prevent layout break.
