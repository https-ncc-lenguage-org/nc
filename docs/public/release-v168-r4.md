# ncc V168 R4 · Native compiler preview

The 24 November 2026 release provides a portable compiler for Windows x86-64 and Linux x86-64. Each platform archive contains two runtime files and the three project license notices. [Installation](../install.md)

| Download | Contents |
| --- | --- |
| [Windows ZIP · 8.47 MB](https://github.com/https-ncc-lenguage-org/nc/releases/download/v0.1.0-bootstrap.168.r4/ncc-v168-r4-windows-x86_64.zip) | `ncc.exe` and `ncruntime.dll` |
| [Linux tar.gz · 9.34 MB](https://github.com/https-ncc-lenguage-org/nc/releases/download/v0.1.0-bootstrap.168.r4/ncc-v168-r4-linux-x86_64.tar.gz) | `ncc` and `libncruntime.so.2` |
| [Optional compiler sources](https://github.com/https-ncc-lenguage-org/nc/releases/download/v0.1.0-bootstrap.168.r4/ncc-v168-r4-compiler-sources.tar.gz) | The 141 native compilation units selected per host, with a relative path and SHA-256 for each unit in `SOURCES.json`. Five units use host-specific source files. |

Verify the archive against the [SHA-256 checksums](https://github.com/https-ncc-lenguage-org/nc/releases/download/v0.1.0-bootstrap.168.r4/SHA256SUMS.txt). The source snapshot describes the nC compiler units. A full rebuild also uses bootstrap tools and matching runtime providers.

## What was tested

On Windows x86-64 and Ubuntu 24.04 under WSL, the extracted compiler passed `self-test`, compiled `examples/00_hello/hello.n` and produced a program that printed `Hello, nC public beta` with exit code 0. The test directories were outside a source checkout. The compiler did not need Rust, Cargo or LLVM on the search path. The Linux compiler, runtime and emitted example work together with the library beside the executables. The compiler and provider import glibc symbols up through 2.34.

R4 includes project name resolution and imported type lookup changes. Eight reference reports on each host matched the original bytes, including positive and negative cases. The clean B → C reconstruction completed earlier for A6. A fresh clean reconstruction of R4, the full `machine.n` consumer and complete ISA coverage remain pending. The published binaries are the existing R4 images with their matching providers.

| File | SHA-256 |
| --- | --- |
| Windows compiler | `f2b744f07441573ad32d274c9596bb8f131a3981b8558d6c39f16d66708b53cc` |
| Windows runtime | `bef32be8f0cf734a91d5430ee5a915079eb10563cdcab0af5ab1746cdf149cfe` |
| Linux compiler | `c7a0889ff09ead304b896b3e8bee5ef9f12cb484115488e69a8473c45a0e49b3` |
| Linux runtime | `43b64017d08b3f12637d2e833c97c877282bc7f258ac756d65b63cf693f4b0fc` |
