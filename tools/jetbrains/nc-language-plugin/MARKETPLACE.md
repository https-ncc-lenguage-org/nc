# nC Language for JetBrains IDEs

**nC Language** brings first-class nC editing workflows to RustRover, with distinct source-family support, syntax-aware tools, project navigation and integration with the installed nC toolchain.

Write nC in a JetBrains environment without giving up the language's different execution surfaces. The plugin recognizes `.n` source files, `.nb` basal/root units, `.nbb` primitive units, `.nm` machine sources, `.nbo` backend object IR and `.ncp` hardware sources. Each family retains its intended highlighting and file identity.

## Code intelligence and editing

- Context-aware syntax highlighting and differentiated visual treatment for runtime, pointers, memory regions, raw operations, FFI and machine constructs.
- Native editor support with brace matching, code completion, auto-import assistance, type-related inlay hints and inline documentation for supported nC sources.
- Project navigation, declarations, symbol indexing and import diagnostics, using the existing JetBrains PSI-based integration.
- Lane-aware editing: low-level sources retain diagnostics and navigation while intrusive predictive completions are intentionally disabled.
- Dedicated file icons and nC palette configuration.

## Run, debug and toolchains

- Run and debug actions for the nC source families supported by the installed NCC toolchain.
- Toolchain discovery through `ncup`, PATH and configured nC installations.
- Run configurations with profile, target and toolchain-related options.
- Machine `.nm` files are edited and checked, but do not enter the high-level Run/Debug path; use the explicit `ncc machine` commands for machine execution.

## Language Server Protocol integration (2026.3.1)

The plugin opens persistent LSP sessions through the JetBrains LSP integration API:

- **General nC (`.n`)**: a bundled stdio adapter connects to `nclsp validate` and publishes diagnostics for in-memory edits.
- **Basal / Primitive / Machine / Hardware (`.nb`, `.nbb`, `.nm`, `.ncp`)**: direct stdio sessions with `nc-sys-lsp lsp`.

The general adapter supports document synchronization and diagnostics; it does **not** advertise LSP completion, hover, rename or formatting. Existing PSI-based editor features are independent of that adapter. The system LSP provides only the capabilities its server announces.

`ncc` remains the authoritative compiler for parsing, type checking, IR and native code generation. The plugin does not replace or patch the compiler.

## Requirements

- RustRover 2026.3.1 (IntelliJ Platform branch 263); the dedicated release targets builds 263.*.
- Installed nC toolchain and matching language servers to receive live compiler/LSP diagnostics.
- Python 3 in the IDE host environment for the general `nclsp validate` bridge (or specify `NC_PYTHON_BIN`).
- Supported environment variables: `NC_NCLSP_BIN` and `NC_SYS_LSP_BIN` for explicit language-server executables.

## Support and license

- Source, issues and release notes: https://github.com/https-ncc-lenguage-org/nc
- Plugin ID: `dev.nc.language` (maintained for Marketplace updates).
- License: **MIT OR Apache-2.0**.

*Capabilities are determined by the installed nC toolchain and IDE environment; publication follows compatibility verification.*
