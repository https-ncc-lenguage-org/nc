# ncc V168 R4 · Native compiler preview

The 24 November 2026 release provides a portable compiler for Windows x86-64 and Linux x86-64. The Linux standalone supplement packages the compiler as a single executable. [Installation](../install.md)

| Download | Contents |
| --- | --- |
| [Windows ZIP · 8.47 MB](https://github.com/https-ncc-lenguage-org/nc/releases/download/v0.1.0-bootstrap.168.r4/ncc-v168-r4-windows-x86_64.zip) | `ncc.exe` and `ncruntime.dll` |
| [Linux standalone.1 · 1.01 MB](https://github.com/https-ncc-lenguage-org/nc/releases/download/v0.1.0-bootstrap.168.r4/ncc-v168-r4-linux-x86_64-standalone.1.tar.gz) | Static ncc and license notices for Alpine, Ubuntu and other x86-64 Linux distributions. |
| [Linux tar.gz · 9.34 MB](https://github.com/https-ncc-lenguage-org/nc/releases/download/v0.1.0-bootstrap.168.r4/ncc-v168-r4-linux-x86_64.tar.gz) | `ncc` and `libncruntime.so.2` |
| [Optional compiler sources](https://github.com/https-ncc-lenguage-org/nc/releases/download/v0.1.0-bootstrap.168.r4/ncc-v168-r4-compiler-sources.tar.gz) | The 141 native compilation units selected per host, with a relative path and SHA-256 for each unit in `SOURCES.json`. Five units use host-specific source files. |

Verify the archive against the [SHA-256 checksums](https://github.com/https-ncc-lenguage-org/nc/releases/download/v0.1.0-bootstrap.168.r4/SHA256SUMS.txt). The source snapshot describes the nC compiler units. A full rebuild also uses bootstrap tools and matching runtime providers.

## Linux standalone.1

The Linux standalone compiler and its hosted outputs link the nC runtime and musl into the executable. Pure computation can produce a smaller ELF without the runtime. The default target is `x86_64-unknown-linux-musl`. The explicit GNU target retains the R4 GNU output format.

Twenty checks per environment ran on Alpine 3.22.8, Ubuntu 24.04 and an empty Linux container filesystem. They covered the compiler self-tests, direct emission, compile-and-run, quoted and empty arguments, program exit status, file I/O, environment changes, imported variables, repeated project builds and a rejected input. The ELF checks covered the interpreter, dynamic dependencies and segment permissions. The same inputs produced identical program bytes in all three environments. These tests used the x86-64 host kernel for the containers. The compiler reads its arguments from Linux procfs.

[Verification results](linux-standalone-verification.json) · [Standalone source and build profile](https://github.com/https-ncc-lenguage-org/nc/releases/download/v0.1.0-bootstrap.168.r4/ncc-v168-r4-linux-x86_64-standalone.1-sources.tar.gz) · [Standalone SHA-256 checksums](https://github.com/https-ncc-lenguage-org/nc/releases/download/v0.1.0-bootstrap.168.r4/SHA256SUMS-linux-standalone.1.txt)

## Original Windows and GNU builds

On Windows x86-64 and Ubuntu 24.04 under WSL, the extracted compiler passed `self-test`, compiled `examples/00_hello/hello.n` and produced a program that printed `Hello, nC public beta` with exit code 0. The test directories were outside a source checkout. The compiler did not need Rust, Cargo or LLVM on the search path. The Linux compiler, runtime and emitted example work together with the library beside the executables. The compiler and provider import glibc symbols up through 2.34.

R4 includes project name resolution and imported type lookup changes. Eight reference reports on each host matched the original bytes, including positive and negative cases. The clean B → C reconstruction completed earlier for A6. A fresh clean reconstruction of R4, the full `machine.n` consumer and complete ISA coverage remain pending. The published binaries are the existing R4 images with their matching providers.

| File | SHA-256 |
| --- | --- |
| Windows compiler | `f2b744f07441573ad32d274c9596bb8f131a3981b8558d6c39f16d66708b53cc` |
| Windows runtime | `bef32be8f0cf734a91d5430ee5a915079eb10563cdcab0af5ab1746cdf149cfe` |
| Linux compiler | `c7a0889ff09ead304b896b3e8bee5ef9f12cb484115488e69a8473c45a0e49b3` |
| Linux runtime | `43b64017d08b3f12637d2e833c97c877282bc7f258ac756d65b63cf693f4b0fc` |
