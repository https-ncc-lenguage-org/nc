<p align="center"><img src="sites/nc-language/dist/mark.svg" width="82" alt="nC"></p>

# nC Programming Language and ncc Compiler

nC is an experimental systems programming language for working with functions, memory and machine instructions in one type system. Its native compiler, **ncc**, is available for Windows and Linux x86-64.

[![Native compiler preview](https://img.shields.io/badge/compiler-V168_R4_preview-244c3b)](docs/public/release-v168-r4.md)
[![License: MIT or Apache 2.0](https://img.shields.io/badge/license-MIT_or_Apache_2.0-e4edb1)](LICENSE)

## Download the compiler

| Platform | Portable download |
| --- | --- |
| Windows x86-64 | [Download ZIP · 8.47 MB](https://github.com/https-ncc-lenguage-org/nc/releases/download/v0.1.0-bootstrap.168.r4/ncc-v168-r4-windows-x86_64.zip) |
| Linux x86-64 and WSL | [Download tar.gz · 9.34 MB](https://github.com/https-ncc-lenguage-org/nc/releases/download/v0.1.0-bootstrap.168.r4/ncc-v168-r4-linux-x86_64.tar.gz) |

Each package contains `ncc`, its runtime library and the license notices. Extract it and run it directly. The compiler source is a separate download. [SHA-256 checksums](https://github.com/https-ncc-lenguage-org/nc/releases/download/v0.1.0-bootstrap.168.r4/SHA256SUMS.txt) · [Release notes](https://github.com/https-ncc-lenguage-org/nc/releases/tag/v0.1.0-bootstrap.168.r4) · [Compiler source snapshot](https://github.com/https-ncc-lenguage-org/nc/releases/download/v0.1.0-bootstrap.168.r4/ncc-v168-r4-compiler-sources.tar.gz)

[**nC language**](https://ncc-lenguage.org/nc-programming-language) · [**ncc compiler**](https://ncc-lenguage.org/ncc-compiler) · [**Documentation**](https://ncc-lenguage.org/library) · [**Native downloads**](https://github.com/https-ncc-lenguage-org/nc/releases/tag/v0.1.0-bootstrap.168.r4) · [**Language guide**](docs/public/origen-y-guia.md) · [**Architecture**](docs/public/arquitectura-y-bootstrap.md) · [**Contribute**](CONTRIBUTING.md)

## Why it exists

Layout, alignment, address validity and calling conventions affect observable program behavior. nC addresses these decisions within one semantic model. The root `[@]`, `[@machine]`, `primitive[@]`, runtime and linker participate in that contract.

Memory is manual/raw. Type checking does not add ownership, automatic release or implicit pointer validation. The [language guide](docs/public/origen-y-guia.md#why-nc-exists) explains the design.

Programmers coming from C can inspect the [four source surfaces](https://ncc-lenguage.org/#source-explorer), follow the [compiler pipeline](https://ncc-lenguage.org/#architecture) and review the [published evidence](https://ncc-lenguage.org/#evidence).

## Compile your first program

Extract the package for your platform into a new folder. Save this example as `hello.n` in that folder.

```nc
use <io:output>;

helloCompacto {
    to main {
        println("Hello, nC public beta");
    }

    fa:
        return true;
}
```

**Windows x86-64** · PowerShell

```powershell
.\ncc.exe self-test
.\ncc.exe compiler emit-executable hello.n --target x86_64-pc-windows-msvc --out hello.exe
.\hello.exe
```

**Linux x86-64 or WSL**

```sh
./ncc self-test
./ncc compiler emit-executable hello.n --target x86_64-unknown-linux-gnu --out hello
chmod +x hello
./hello
```

Both examples print `Hello, nC public beta` and exit with code 0. Keep the matching runtime library beside the compiler and the generated program. The Linux binaries require glibc 2.34 or later. [Installation and checksum verification](docs/install.md)

## Verified scope

The R4 packages passed self-test and compiled and ran the example above in isolated directories on Windows x86-64 and Ubuntu 24.04 under WSL. The compiler also matched eight reference reports per host for project resolution and binding. The full native CLI, complete x86 ISA coverage and the clean R4 compiler rebuild remain open. [R4 validation and binary identities](docs/public/release-v168-r4.md)

The V81 reconstruction and its historical test counts are recorded in the [V81 technical dossier](docs/NCC_MODULES_V81_DOSSIER.md).

## Documentation

- [Language guide](docs/public/origen-y-guia.md) · [PDF](docs/public/origen-y-guia.pdf).
- [Compiler architecture and bootstrap](docs/public/arquitectura-y-bootstrap.md) · [PDF](docs/public/arquitectura-y-bootstrap.pdf).
- [Syntax](docs/syntax.md), [runtime](docs/runtime.md), [machine](docs/machine.md), [primitives](docs/primitive.md) and [FFI](docs/ffi.md).
- [V81 reproduction](docs/NCC_MODULES_V81_REPRO.md), [ABI and layout](docs/NCC_MODULES_V81_ABI_LAYOUT.md) and [current limits](docs/public/estado.md).
- [Roadmap](ROADMAP.md) and [contribution guide](CONTRIBUTING.md).

## Working from source

The [R4 compiler source snapshot](https://github.com/https-ncc-lenguage-org/nc/releases/download/v0.1.0-bootstrap.168.r4/ncc-v168-r4-compiler-sources.tar.gz) contains 141 units per host and a SHA-256 manifest. The repository also contains the earlier bootstrap source, language examples and contributor tools.

The [V81 reconstruction recipe](docs/NCC_MODULES_V81_REPRO.md) identifies the seed, B/C generations, providers and artifact comparisons. The [build contract](bootstrap/frontend-v81-build.json) fixes its inputs.

Stage0 remains available for development and validation. Building it requires Rust/Cargo, a verified native seed and an archiver. The [installation guide](docs/install.md) documents that route separately. Invoke the built `ncc` executable directly for language checks.

| Directory | Contents |
| --- | --- |
| `tools/ncc/nc/src` | Compiler written in nC |
| `crates` | Retained Stage0 implementation and tools |
| `runtime/nc` | Runtime and providers |
| `examples` | Examples by subject |
| `bootstrap` | Build contracts and recipes |
| `docs` | Guides and technical references |
| `sites/nc-language/dist` | Static website |

## Contributing

A minimal failing program is useful evidence. Include the compiler digest, host, command, provider and expected result. [Issue templates](https://github.com/Arizt00/nc/issues/new/choose) identify the required details.

Language proposals must explain continuity through parser, AST, semantics and IR. Start with a reproducible behavior, a diagnostic or a documentation correction.

## License

The code is available under [MIT](LICENSE-MIT) or [Apache 2.0](LICENSE-APACHE), at your choice. Third-party notices retain their own terms.
