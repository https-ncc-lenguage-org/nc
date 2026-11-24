# Install and run nC

## Terminal installation

Choose a command in the [repository README](../README.md#install-from-the-terminal) or on the [downloads page](https://ncc-lenguage.org/downloads#terminal-install). Both show the exact command for PowerShell, Command Prompt and sh or Bash on Alpine, Ubuntu or WSL. Run it as the user who will use the compiler.

| Package | Windows x86-64 | Linux x86-64 |
| --- | --- | --- |
| ncc V168 R4 | `%LOCALAPPDATA%\nC\toolchains\windows-x86_64\bin` | `${XDG_DATA_HOME:-$HOME/.local/share}/nC/toolchains/linux-x86_64/V168-R4-standalone.1` |
| Optional BIOS mini kernel | `%LOCALAPPDATA%\nC\kernels\x86_64-unknown-none\mini-bios-20260822` | `${XDG_DATA_HOME:-$HOME/.local/share}/nC/kernels/x86_64-unknown-none/mini-bios-20260822` |

After installation run `ncc self-test`. Downloads are pinned by SHA-256. The Linux download command works with BusyBox on Alpine and with GNU tools on Ubuntu. It fetches the archive using curl or wget. The installed compiler uses the Linux kernel and includes its runtime. It adds `~/.local/bin/ncc` and records the PATH in the first Bash login profile in use. Windows Installer records the compiler directory in the user PATH. Restart your terminal application to pick up that setting in a new process. Windows executables use the matching runtime DLL.

**Removal.** Under Windows, open **Settings → Apps → Installed apps** and select the nC compiler or mini kernel individually. Windows keeps the verified MSI in `%LOCALAPPDATA%\nC\packages` for repair. After uninstalling a package you can also delete its cached MSI. On Linux, remove the `~/.local/bin/ncc` symlink if it points to this version, then remove that version's directory from the table. The optional kernel can be removed independently by deleting its own version directory. Keep the general `~/.local/bin` PATH entry if you use other tools there.

The [mini kernel guide](../tools/distribution/packages/kernel-mini.md) identifies the boot image and shows the read-only QEMU guest command. [Installer and kernel checksums](https://github.com/https-ncc-lenguage-org/nc/releases/download/v0.1.0-bootstrap.168.r4/INSTALL-SHA256SUMS.txt)

## Native V168 R4 preview

Choose the package for your operating system. The standalone Linux archive contains the compiler and license notices.

| Platform | Download |
| --- | --- |
| Windows x86-64 | [ncc for Windows](https://github.com/https-ncc-lenguage-org/nc/releases/download/v0.1.0-bootstrap.168.r4/ncc-v168-r4-windows-x86_64.zip) |
| Linux standalone, including Alpine, Ubuntu and WSL | [ncc standalone for Linux](https://github.com/https-ncc-lenguage-org/nc/releases/download/v0.1.0-bootstrap.168.r4/ncc-v168-r4-linux-x86_64-standalone.1.tar.gz) |
| GNU/Linux shared-runtime edition | [ncc for Linux](https://github.com/https-ncc-lenguage-org/nc/releases/download/v0.1.0-bootstrap.168.r4/ncc-v168-r4-linux-x86_64.tar.gz) |

Download [SHA256SUMS.txt](https://github.com/https-ncc-lenguage-org/nc/releases/download/v0.1.0-bootstrap.168.r4/SHA256SUMS.txt) from the same release. On Windows, compare the digest printed below with the line for the Windows archive.

```powershell
Get-FileHash .\ncc-v168-r4-windows-x86_64.zip -Algorithm SHA256
Expand-Archive .\ncc-v168-r4-windows-x86_64.zip -DestinationPath .\ncc-r4
Set-Location .\ncc-r4
.\ncc.exe self-test
```

On Linux, download the [standalone checksums](https://github.com/https-ncc-lenguage-org/nc/releases/download/v0.1.0-bootstrap.168.r4/SHA256SUMS-linux-standalone.1.txt) alongside the archive and run these commands.

```sh
grep '  ncc-v168-r4-linux-x86_64-standalone[.]1[.]tar[.]gz$' SHA256SUMS-linux-standalone.1.txt | sha256sum -c -
mkdir ncc-r4
tar -xzf ncc-v168-r4-linux-x86_64-standalone.1.tar.gz -C ncc-r4
cd ncc-r4
./ncc self-test
```

Save the [hello example](../examples/00_hello/hello.n) as `hello.n` beside the extracted compiler. On Windows, run the following commands in PowerShell.

```powershell
.\ncc.exe compiler emit-executable hello.n --target x86_64-pc-windows-msvc --out hello.exe
.\hello.exe
```

On Linux or WSL, build and run in one command, or keep the executable for later.

```sh
./ncc r hello.n
./ncc b hello.n -o hello
./hello
```

The standalone compiler defaults to `x86_64-unknown-linux-musl`. You can also use `ncc compiler emit-executable hello.n --out hello`. The generated ELF runs on x86-64 Linux with its runtime linked in. Pass application arguments after `--`, for example `ncc r hello.n -- one "two words"`. Windows uses `ncruntime.dll`. The optional GNU edition uses `libncruntime.so.2` and glibc 2.34 or later. [Release and source details](public/release-v168-r4.md)

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
