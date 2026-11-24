# Install and run nC

## Native V168 R4 preview

Choose one archive. It contains the compiler, its matching runtime and the license notices.

| Platform | Download |
| --- | --- |
| Windows x86-64 | [ncc for Windows](https://github.com/https-ncc-lenguage-org/nc/releases/download/v0.1.0-bootstrap.168.r4/ncc-v168-r4-windows-x86_64.zip) |
| Linux x86-64, including Ubuntu under WSL | [ncc for Linux](https://github.com/https-ncc-lenguage-org/nc/releases/download/v0.1.0-bootstrap.168.r4/ncc-v168-r4-linux-x86_64.tar.gz) |

Download [SHA256SUMS.txt](https://github.com/https-ncc-lenguage-org/nc/releases/download/v0.1.0-bootstrap.168.r4/SHA256SUMS.txt) from the same release. On Windows, compare the digest printed below with the line for the Windows archive.

```powershell
Get-FileHash .\ncc-v168-r4-windows-x86_64.zip -Algorithm SHA256
Expand-Archive .\ncc-v168-r4-windows-x86_64.zip -DestinationPath .\ncc-r4
Set-Location .\ncc-r4
.\ncc.exe self-test
```

On Linux, run these commands from the download directory.

```sh
grep '  ncc-v168-r4-linux-x86_64.tar.gz$' SHA256SUMS.txt | sha256sum -c -
mkdir ncc-r4
tar -xzf ncc-v168-r4-linux-x86_64.tar.gz -C ncc-r4
cd ncc-r4
./ncc self-test
```

Save the [hello example](../examples/00_hello/hello.n) as `hello.n` beside the extracted compiler. On Windows, run the following commands in PowerShell.

```powershell
.\ncc.exe compiler emit-executable hello.n --target x86_64-pc-windows-msvc --out hello.exe
.\hello.exe
```

On Linux or WSL, use the Linux target.

```sh
./ncc compiler emit-executable hello.n --target x86_64-unknown-linux-gnu --out hello
chmod +x hello
./hello
```

Both programs print `Hello, nC public beta` and exit with code 0. For these commands, keep `ncruntime.dll` or `libncruntime.so.2` in the same directory as the executables. The Linux compiler and the emitted hello program locate the provider beside themselves through `$ORIGIN`. Linux requires glibc 2.34 or later and was tested on Ubuntu 24.04 under WSL. [Release and source details](public/release-v168-r4.md)

## Stage0 development build

This section applies to contributors building the retained Rust implementation. It is not required to run the native kit. Install Git, the Rust components declared in `rust-toolchain.toml`, a compatible archiver and a verified native seed with its provider.

From the repository root on Linux or WSL:

```bash
export NC_STAGE0_POLICY_COMPILER="$HOME/nc-seed/ncc"
export NC_STAGE0_POLICY_ARCHIVER=ar
export CARGO_BUILD_JOBS=1
cargo build --locked -p ncc-cli --bin ncc
```

In a Windows MSVC developer terminal:

```powershell
$env:NC_STAGE0_POLICY_COMPILER = 'C:\nc-seed\ncc.exe'
$env:NC_STAGE0_POLICY_ARCHIVER = 'llvm-lib.exe'
$env:CARGO_BUILD_JOBS = '1'
cargo build --locked -p ncc-cli --bin ncc
```

Use the seed verified for that Stage0 build. MSVC `lib.exe` is another compatible Windows archiver. The native bridge compiles `bootstrap/nc/stage0_policy.n` during the build. Missing seed configuration causes an explicit error.

Once built, invoke Stage0 directly:

```bash
./target/debug/ncc check examples/00_hello/hello.n
./target/debug/ncc emit-ir examples/00_hello/hello.n
```

In PowerShell, use `.\target\debug\ncc.exe` with the same arguments. Cargo is not needed for each language-level check.

See the [language guide](public/origen-y-guia.md) for syntax and the [release status](public/estado.md) for supported routes.
