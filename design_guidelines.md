# Design Guidelines: Malicious URL Detection System

## Design Approach

**Selected System**: Security-focused design inspired by Linear + Stripe's data visualization patterns
**Justification**: Utility-first application requiring trust signals, data clarity, and professional credibility. Security tools demand minimal distraction with maximum information density..

## Core Design Elements

### A. Color Palette

**Dark Mode (Primary)**
- Background: 222 15% 10% (deep charcoal)
- Surface: 222 15% 14% (elevated cards)
- Surface Hover: 222 15% 18%
- Border: 222 10% 25% (subtle separation)
- Text Primary: 0 0% 95%
- Text Secondary: 0 0% 65%

**Threat Level Colors**
- Benign/Safe: 142 76% 45% (trustworthy green)
- Suspicious: 38 92% 50% (warning amber)
- Malicious: 0 84% 60% (critical red)
- Scanning: 217 91% 60% (active blue)

**Brand Accent**: 217 91% 60% (security blue) - for CTAs and trust elements

### B. Typography

**Font Stack**: 
- Primary: Inter (via Google Fonts CDN)
- Monospace: 'JetBrains Mono' (for URLs and technical data)

**Hierarchy**:
- Hero Heading: text-5xl/text-6xl, font-bold, tracking-tight
- Section Heading: text-3xl/text-4xl, font-semibold
- Card Title: text-xl, font-semibold
- Body: text-base, font-normal
- Caption/Meta: text-sm, text-secondary
- URLs: font-mono, text-sm, break-all

### C. Layout System

**Spacing Primitives**: Tailwind units of 2, 4, 6, 8, 12, 16, 24
- Component padding: p-6 (cards), p-8 (sections)
- Stack spacing: space-y-4 (tight), space-y-8 (relaxed)
- Container: max-w-7xl mx-auto px-4

**Grid System**:
- Dashboard: 2-column layout (lg:grid-cols-[280px_1fr]) - sidebar + main
- Scan Results: Single column, max-w-4xl for focus
- History Table: Full-width responsive table

### D. Component Library

**Navigation**
- Top bar: sticky, backdrop-blur, border-b, flex justify-between
- User menu: avatar + dropdown (right aligned)
- Guest banner: subtle yellow background bar with "Limited to 5 scans" message

**Scanner Interface**
- Large centered input: rounded-xl, p-4, font-mono, border-2 focus state
- Scan button: primary blue, px-8 py-4, rounded-lg, font-semibold
- Real-time feedback: animated pulse during scan, smooth result reveal
- Result card: large card with color-coded left border (8px), shadow-lg

**Scan History Dashboard**
- Left sidebar: navigation (Dashboard, History, Settings), user info at bottom
- Table: striped rows, hover states, sortable columns, sticky header
- Pagination: centered, numbered with prev/next
- Filters: top bar with search input, date range picker, threat level dropdown

**Data Displays**
- Threat badge: rounded-full pill, uppercase text-xs, semibold, color-coded background
- Confidence meter: horizontal progress bar with percentage label
- Timestamp: relative time (e.g., "2 hours ago") with tooltip of exact datetime
- URL display: truncated with copy button, full URL on hover tooltip

**Cards**
- Elevated: bg-surface, rounded-lg, border, p-6
- Scan result: p-8, with threat color accent border-l-8
- Stats cards: grid-cols-3, centered text, large numbers

**Forms**
- Input fields: rounded-lg, px-4 py-3, border, focus:ring-2 focus:ring-blue
- Labels: text-sm font-medium mb-2
- Auth forms: centered, max-w-md, card with shadow

**Buttons**
- Primary: bg-blue, text-white, hover:bg-blue-600, px-6 py-3, rounded-lg
- Secondary: border-2, hover:bg-surface-hover
- Danger: bg-red, text-white (for delete actions)
- Icon buttons: p-2, rounded-md, hover:bg-surface-hover

### E. Animations

**Minimal, Purposeful Only**
- Scan progress: Smooth spinner rotation, pulse effect
- Result reveal: Slide-up fade-in (300ms)
- Table row hover: Background color transition (150ms)
- Toast notifications: Slide-in from top-right (200ms)

## Page-Specific Guidelines

### Hero/Landing (Guest Mode)
- **No large hero image** - security tools prioritize immediate utility
- Centered headline: "Detect Malicious URLs Instantly" (text-6xl)
- Subheading explaining AI-powered detection
- Large URL input prominently placed below (within viewport)
- Trust indicators: "Powered by AI • Privacy-First • No Registration Required"
- Quick stats grid: "10,000+ URLs Scanned • 99.8% Accuracy • Real-time Results"
- Feature cards (grid-cols-3): Visual icons, concise benefits
- Login CTA: subtle top-right button, non-intrusive

### Scan Interface
- Clean, focused single-column layout
- URL input takes visual priority
- Scan history preview: "Recent scans" section below (3 latest)
- Guest limit indicator: progress bar "2/5 scans remaining"

### Dashboard (Authenticated)
- Two-column: Sidebar navigation + main content area
- Summary cards at top: Total Scans, Threats Detected, Safe URLs (grid-cols-3)
- Recent activity table immediately visible
- Export button (top-right): "Export History" with CSV/JSON options

### Scan Results Detail
- Large result card with threat level, confidence score, scan timestamp
- Detection reasoning: bullet list of signals detected
- URL metadata: domain age, SSL status, reputation indicators
- Action buttons: "Scan Again" | "Report False Positive"

## Security & Trust Design

- Lock icons next to sensitive operations
- SSL badge in footer
- "Your data is private" messaging for guests
- Clear differentiation: Guest banner vs authenticated user avatar
- Threat colors follow universal conventions (red=danger, green=safe)
- Monospace font for all URLs reinforces technical credibility

## Accessibility

- Consistent dark mode across all components
- High contrast ratios for threat indicators
- Focus states visible on all interactive elements
- Screen reader labels for icon-only buttons
- Keyboard navigation for tables and forms