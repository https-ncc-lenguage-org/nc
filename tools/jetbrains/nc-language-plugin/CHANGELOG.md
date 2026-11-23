# Changelog

## 1.0.22 (Marketplace release candidate)

- Use SemVer `1.0.22` for the public plugin version; retain `1.0.0.22v` as the nC product and capability-contract version.
- Preserve plugin ID `dev.nc.language` and the verified RustRover 2026.3.1 / platform 263 target.
- Normalize light and dark Marketplace logos to 40px with transparent padding while preserving their artwork.
- Document the initial manual upload and subsequent verified update workflow.
- No runtime, LSP bridge or compiler changes.

## 1.0.0.22v (candidate)

- Target RustRover 2026.3.1, IntelliJ Platform 263, JDK 25.
- Start persistent LSP sessions for supported nC sources.
- Add general nclsp validation bridge and direct low-level nc-sys-lsp client.
- Preserve PSI-based completion, navigation, Run/Debug and existing file families.
- Expand Marketplace metadata and add isolated validation workflow.
- No compiler source changes.


## 1.0.0.21v

- Established `1.0.0.21v` as the new JetBrains plugin version baseline.
- Added extension-aware machine and primitive highlighting.
- Added distinct output, pointer, color, control-flow and loop-control colors.
- Added context-bound colors for kernel `at` and each 8/16/32/64/128/256/512-bit MMIO family.
- Added tagless kernel detection from `name at address`, `*width(...)` and
  `kernel... { ... main: ... }`, while ignoring comments and strings.
- Made `p<T>` and compact pointer operations the official completion and inlay surface.
- Removed `print.*` members; output uses `print` and `println`.
- Aligned the bundled semantic catalog with the backend prelude and source-path-free hover contract.
- Preserved Run, Debug, navigation, completion, inlay hints and compiler diagnostics.

Future plugin releases continue from this baseline.
