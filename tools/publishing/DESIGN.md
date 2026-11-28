# nC website design system

## Product and audience

nC is a systems programming language in native bootstrap. Its defining idea is
typed continuity between ordinary source, foundational contracts, machine
instructions, material primitives, memory, runtime and linking. The visitor is
a programmer evaluating the language, often with experience in C or another
systems language. The website's first job is to make that proposition concrete
and inspectable, then lead to a working first program and source evidence.

The latest direction places code, architecture and evidence before cinematic
imagery. The hand and sphere are a secondary project symbol. The earlier
approved capture remains a reference for that symbol, not the homepage layout.

## Visual world

The page should feel like a carefully made language workbench: substantial
code, clear roles, precise diagrams and documentation that is comfortable to
read. Use the nC spellings themselves as the characteristic visual material.
Do not imitate an IDE window or show fabricated compiler output. Four source
surfaces are related parts of the model, not four chronological compiler passes.

Palette: graphite `#101418`, raised graphite `#171d23`, warm white `#edf1f4`,
secondary grey `#aab5be`, copper `#d6aa80`, and restrained green `#8fb6a6` for
code/status roles. The light theme uses `#f4f6f7`, white surfaces, `#18242d`
text and `#725136` copper. Copper belongs to active controls, the symbol and
small diagrams; it does not color every heading or button.

Typography: self-hosted IBM Plex Sans 400/600 for headings and interface;
IBM Plex Mono 400 for source and commands. Use original font files and retain
the SIL Open Font License. Headings use one weight and color; no automatic
italic last phrase. Body text is 16–18 px, approximately 65 characters per
line, with comfortable line height. Code stays readable and scrolls inside
its own bounded panel. Metadata uses ordinary sentence case.

Use a 1280 px content width and a deliberate 12-column grid. The introduction
is left aligned; the source explorer occupies the other half of the first
screen. Wide sections have different structures appropriate to their content:
source viewer, design ledger, compiler diagram, installation recipe and release
evidence table. Avoid identical promotional cards and decorative counters.

## Layout decision

The rejected starting point is a centered cinematic composition followed by
technical content. The replacement is a language workbench with an explicit
route through the product:

```text
Brand / Language / Compiler / Documentation / Downloads / Source
┌───────────────────────────────┬───────────────────────────────────┐
│ nC systems language           │ Functions / Root / Machine /      │
│ Control at every level.       │ Primitive                         │
│ Plain-language proposition    │ Real source + source reference    │
│ Read nC / Get ncc             │ Contract notes                    │
└───────────────────────────────┴───────────────────────────────────┘
Design choices for programmers coming from C → supporting references
Compiler pipeline → inspect one responsibility at a time
Run a complete program → Windows / Linux commands
Release evidence → scope, reproduction and exact generation identity
Hand / sphere symbol → secondary, loaded as it approaches the viewport
Documentation entry points → language guide / architecture / source
```

Self-critique: a generic dark developer page with colored code would still be
interchangeable. Its distinctive element must therefore be the source-surface
explorer: actual `.n`, `[@]`, `[@machine]` and `primitive[@]` examples with
their different contracts, tied to the same explanation. Keep headings and
surrounding chrome quiet enough for those constructs to carry the identity.

## Content contract

The ambition is C-class control with a broader continuous language model.
It is an objective, not evidence of complete C parity, faster code, universal
memory safety, complete self-hosting or production maturity. Every concrete
support claim links to the public V81 scope or a specific source fixture.
Do not publish private V117 progress as a new release. Memory remains manual/raw.

Use direct action names: Read the language, Get ncc, Copy source, Read the
contract, Review the evidence. Static example tabs are source inspection,
not an in-browser compiler. Privileged material fixtures are identified as
inspection examples. A compiler phase diagram must not imply that the four
language surfaces are interchangeable or sequential lowering stages.

## Interaction and verification

Use semantic links, buttons, tabs and visible focus. Active source tabs have
URL state and work with arrows/Home/End. Every panel remains available without
JavaScript. Copy actions operate on the original text, not line numbers.
Keep search, filtering, manual pause, both themes, reading progress and PDFs.

The quiet background continues across the website. The secondary GPU scene
loads near the viewport and freezes when paused, hidden or off screen. Respect
reduced motion, retain its static fallback and avoid decorative reveals on
every section. Prioritize content and fonts over the graphics engine.

Verify the first screen, complete page, source tabs, keyboard state, source
copying, installation, library, downloads, both themes, and the four canonical
test viewports. Review long lines, text zoom, focus, anchors and code overflow.
Record real measurements and verification limits in the publication report.

## Lift revision (November 2026)

The owner asked for a brighter, kinetic direction. The site now defaults to a
luminous light theme (white `#ffffff`, ink `#121317`, grey `#5d6168`) with the
dark theme kept as an alternative (`#0b0c0f`). Copper stays the brand accent;
a restrained spectrum (copper → coral → magenta → violet → blue → teal → sage)
is used only in the particle field, the showcase glow and card hover rims.

- Hero: centered headline, primary "Get ncc" ink pill, secondary soft pill.
  Behind it, `field.js` draws an orbit of short strokes on a Canvas 2D layer
  that assemble on load, part around the pointer and settle back. It obeys the
  shared motion toggle, reduced motion, visibility and off-screen pausing, and
  caps DPR at 2. The same script drives an upward "antigravity" drift in the
  closing call to action.
- The source explorer remains the first content object, presented as a large
  rounded showcase over a soft spectrum glow, with pill tabs.
- Sections use generous spacing, 20–36 px radii, soft surfaces instead of
  rules, and lift-on-hover cards. The project symbol is the one dark stage.
- Content, routes, claims, accessibility and verification rules above are
  unchanged.
