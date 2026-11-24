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

## Install from the terminal

Choose your shell and copy the whole command. It checks the host kernel and processor, verifies the package SHA-256 and installs V168 R4 for your user. Windows uses `%LOCALAPPDATA%\nC\toolchains\windows-x86_64\bin`. Linux uses `${XDG_DATA_HOME:-$HOME/.local/share}/nC/toolchains/linux-x86_64/V168-R4` and exposes `ncc` in `~/.local/bin`. Linux requires glibc 2.34 or later.

<details>
<summary>Windows · PowerShell</summary>

<!-- install:compiler:powershell -->
```powershell
& {
    $ErrorActionPreference = 'Stop'
    if ([Environment]::OSVersion.Platform -ne 'Win32NT' -or [Environment]::GetEnvironmentVariable('PROCESSOR_ARCHITECTURE','Machine') -ne 'AMD64') { throw 'Requires Windows x86-64.' }
    $url = 'https://github.com/https-ncc-lenguage-org/nc/releases/download/v0.1.0-bootstrap.168.r4/ncc-v168-r4-windows-x86_64-user.msi'
    $sha = '7c914937b390101882b32c6379f96f8df78e765f5e8960685cf1f0008dc901ef'
    $cache = [IO.Directory]::CreateDirectory((Join-Path $env:LOCALAPPDATA 'nC\packages')).FullName
    $msi = Join-Path $cache ([IO.Path]::GetFileName(([Uri]$url).AbsolutePath))
    $part = $msi + '.' + [Guid]::NewGuid().ToString('N') + '.part'
    $verify = { param($file) $h = [Security.Cryptography.SHA256]::Create(); try { if ([BitConverter]::ToString($h.ComputeHash([IO.File]::ReadAllBytes($file))).Replace('-','') -ne $sha) { throw 'SHA-256 mismatch.' } } finally { $h.Dispose() } }
    try {
        if (-not [IO.File]::Exists($msi)) {
            Invoke-WebRequest -UseBasicParsing -Uri $url -OutFile $part
            & $verify $part
            try { [IO.File]::Move($part,$msi) } catch [IO.IOException] { if (-not [IO.File]::Exists($msi)) { throw } }
        }
        & $verify $msi
        $argsMsi = '/i ' + [char]34 + $msi + [char]34 + ' /qn /norestart'
        $result = Start-Process -FilePath (Join-Path ([Environment]::SystemDirectory) 'msiexec.exe') -ArgumentList $argsMsi -Wait -PassThru
        if ($result.ExitCode -ne 0) { throw ('Windows Installer returned ' + $result.ExitCode) }
        $bin = Join-Path $env:LOCALAPPDATA 'nC\toolchains\windows-x86_64\bin'
        $env:PATH = $bin + [IO.Path]::PathSeparator + $env:PATH
        & (Join-Path $bin 'ncc.exe') self-test
        if ($LASTEXITCODE -ne 0) { throw 'ncc self-test failed.' }
    } finally {
        if ([IO.File]::Exists($part)) { [IO.File]::Delete($part) }
    }
}
```

</details>

<details>
<summary>Windows · Command Prompt (CMD)</summary>

<!-- install:compiler:cmd -->
```batch
powershell.exe -NoProfile -NonInteractive -Command "$ErrorActionPreference = 'Stop'; if ([Environment]::OSVersion.Platform -ne 'Win32NT' -or [Environment]::GetEnvironmentVariable('PROCESSOR_ARCHITECTURE','Machine') -ne 'AMD64') { throw 'Requires Windows x86-64.' }; $url = 'https://github.com/https-ncc-lenguage-org/nc/releases/download/v0.1.0-bootstrap.168.r4/ncc-v168-r4-windows-x86_64-user.msi'; $sha = '7c914937b390101882b32c6379f96f8df78e765f5e8960685cf1f0008dc901ef'; $cache = [IO.Directory]::CreateDirectory((Join-Path $env:LOCALAPPDATA 'nC\packages')).FullName; $msi = Join-Path $cache ([IO.Path]::GetFileName(([Uri]$url).AbsolutePath)); $part = $msi + '.' + [Guid]::NewGuid().ToString('N') + '.part'; $verify = { param($file) $h = [Security.Cryptography.SHA256]::Create(); try { if ([BitConverter]::ToString($h.ComputeHash([IO.File]::ReadAllBytes($file))).Replace('-','') -ne $sha) { throw 'SHA-256 mismatch.' } } finally { $h.Dispose() } }; try { if (-not [IO.File]::Exists($msi)) {     Invoke-WebRequest -UseBasicParsing -Uri $url -OutFile $part;     & $verify $part;     try { [IO.File]::Move($part,$msi) } catch [IO.IOException] { if (-not [IO.File]::Exists($msi)) { throw } } }; & $verify $msi; $argsMsi = '/i ' + [char]34 + $msi + [char]34 + ' /qn /norestart'; $result = Start-Process -FilePath (Join-Path ([Environment]::SystemDirectory) 'msiexec.exe') -ArgumentList $argsMsi -Wait -PassThru; if ($result.ExitCode -ne 0) { throw ('Windows Installer returned ' + $result.ExitCode) }; $bin = Join-Path $env:LOCALAPPDATA 'nC\toolchains\windows-x86_64\bin'; $env:PATH = $bin + [IO.Path]::PathSeparator + $env:PATH; & (Join-Path $bin 'ncc.exe') self-test; if ($LASTEXITCODE -ne 0) { throw 'ncc self-test failed.' } } finally { if ([IO.File]::Exists($part)) { [IO.File]::Delete($part) } }" && set "PATH=%LOCALAPPDATA%\nC\toolchains\windows-x86_64\bin;%PATH%"
```

</details>

<details>
<summary>Linux, Ubuntu and WSL · Bash</summary>

<!-- install:compiler:bash -->
```bash
export PATH="$HOME/.local/bin:$PATH"
(
  set -eu
  [ "$(uname -s)/$(uname -m)" = Linux/x86_64 ] || { echo "Requires Linux x86-64." >&2; exit 1; }
  data=${XDG_DATA_HOME:-"$HOME/.local/share"}
  case "$data" in /*) ;; *) data="$HOME/.local/share" ;; esac
  parent="$data/nC/toolchains/linux-x86_64"
  dest="$parent/V168-R4"
  mkdir -p -- "$parent"
  stage=$(mktemp -d -- "$parent/.install.XXXXXXXX")
  trap 'rm -rf -- "$stage"' EXIT
  curl --fail --silent --show-error --location --proto '=https' \
    'https://github.com/https-ncc-lenguage-org/nc/releases/download/v0.1.0-bootstrap.168.r4/ncc-v168-r4-linux-x86_64.tar.gz' -o "$stage/package"
  (cd "$stage" && printf '%s  package\n' 'dafd079e3d554f340f13a1e125be1674cc98032b0b4d78391c9923af92da3a64' | sha256sum --check --status)
  mkdir -- "$stage/files"
  tar -xzf "$stage/package" -C "$stage/files"
  "$stage/files/ncc" self-test
  bin="$HOME/.local/bin"
  mkdir -p -- "$bin"
  if [ -e "$bin/ncc" ] || [ -L "$bin/ncc" ]; then
    [ "$(readlink -- "$bin/ncc")" = "$dest/ncc" ] || { echo "Another ncc already occupies $bin/ncc." >&2; exit 1; }
  fi
  [ ! -L "$dest" ] || { echo "The installation directory is a symlink." >&2; exit 1; }
  if [ ! -d "$dest" ]; then mv -Tn -- "$stage/files" "$dest" || [ -d "$dest" ]; fi
  if [ -d "$stage/files" ]; then diff -qr -- "$stage/files" "$dest"; fi
  ln -sT -- "$dest/ncc" "$bin/ncc" 2>/dev/null || [ "$(readlink -- "$bin/ncc")" = "$dest/ncc" ]
  profile="$HOME/.profile"
  for file in "$HOME/.bash_profile" "$HOME/.bash_login"; do
    if [ -f "$file" ]; then profile=$file; break; fi
  done
  line='case ":$PATH:" in *":$HOME/.local/bin:"*) ;; *) export PATH="$HOME/.local/bin:$PATH" ;; esac'
  if ! grep -Fqx -- "$line" "$profile" 2>/dev/null; then printf '\n%s\n' "$line" >> "$profile"; fi
  "$bin/ncc" self-test
)
```

</details>

Run `ncc self-test` to check the installation. The command updates the current shell and configures the user PATH for new sessions. [Installation and removal](docs/install.md#terminal-installation) · [Download the Windows per-user MSI](https://github.com/https-ncc-lenguage-org/nc/releases/download/v0.1.0-bootstrap.168.r4/ncc-v168-r4-windows-x86_64-user.msi)

### Optional nC kernel

The freestanding x86-64 BIOS mini kernel is a separate package. It contains the boot image, the ELF and the matching nC source from 22 August 2026. Installing it copies files into your user profile. To boot it in QEMU, follow the included README. [Kernel guide](tools/distribution/packages/kernel-mini.md) · [Windows MSI](https://github.com/https-ncc-lenguage-org/nc/releases/download/v0.1.0-bootstrap.168.r4/nc-kernel-mini-20260822-x86_64-bios-user.msi) · [Image archive](https://github.com/https-ncc-lenguage-org/nc/releases/download/v0.1.0-bootstrap.168.r4/nc-kernel-mini-20260822-x86_64-bios.tar.gz)

<details>
<summary>Windows · PowerShell</summary>

<!-- install:kernel:powershell -->
```powershell
& {
    $ErrorActionPreference = 'Stop'
    if ([Environment]::OSVersion.Platform -ne 'Win32NT' -or [Environment]::GetEnvironmentVariable('PROCESSOR_ARCHITECTURE','Machine') -ne 'AMD64') { throw 'Requires Windows x86-64.' }
    $url = 'https://github.com/https-ncc-lenguage-org/nc/releases/download/v0.1.0-bootstrap.168.r4/nc-kernel-mini-20260822-x86_64-bios-user.msi'
    $sha = '188b4ee519043f6db179a0146eabe43b61a45f0d18b58aefd78033a9e5bf9780'
    $cache = [IO.Directory]::CreateDirectory((Join-Path $env:LOCALAPPDATA 'nC\packages')).FullName
    $msi = Join-Path $cache ([IO.Path]::GetFileName(([Uri]$url).AbsolutePath))
    $part = $msi + '.' + [Guid]::NewGuid().ToString('N') + '.part'
    $verify = { param($file) $h = [Security.Cryptography.SHA256]::Create(); try { if ([BitConverter]::ToString($h.ComputeHash([IO.File]::ReadAllBytes($file))).Replace('-','') -ne $sha) { throw 'SHA-256 mismatch.' } } finally { $h.Dispose() } }
    try {
        if (-not [IO.File]::Exists($msi)) {
            Invoke-WebRequest -UseBasicParsing -Uri $url -OutFile $part
            & $verify $part
            try { [IO.File]::Move($part,$msi) } catch [IO.IOException] { if (-not [IO.File]::Exists($msi)) { throw } }
        }
        & $verify $msi
        $argsMsi = '/i ' + [char]34 + $msi + [char]34 + ' /qn /norestart'
        $result = Start-Process -FilePath (Join-Path ([Environment]::SystemDirectory) 'msiexec.exe') -ArgumentList $argsMsi -Wait -PassThru
        if ($result.ExitCode -ne 0) { throw ('Windows Installer returned ' + $result.ExitCode) }
        Write-Output (Join-Path $env:LOCALAPPDATA 'nC\kernels\x86_64-unknown-none\mini-bios-20260822')
    } finally {
        if ([IO.File]::Exists($part)) { [IO.File]::Delete($part) }
    }
}
```

</details>

<details>
<summary>Windows · Command Prompt (CMD)</summary>

<!-- install:kernel:cmd -->
```batch
powershell.exe -NoProfile -NonInteractive -Command "$ErrorActionPreference = 'Stop'; if ([Environment]::OSVersion.Platform -ne 'Win32NT' -or [Environment]::GetEnvironmentVariable('PROCESSOR_ARCHITECTURE','Machine') -ne 'AMD64') { throw 'Requires Windows x86-64.' }; $url = 'https://github.com/https-ncc-lenguage-org/nc/releases/download/v0.1.0-bootstrap.168.r4/nc-kernel-mini-20260822-x86_64-bios-user.msi'; $sha = '188b4ee519043f6db179a0146eabe43b61a45f0d18b58aefd78033a9e5bf9780'; $cache = [IO.Directory]::CreateDirectory((Join-Path $env:LOCALAPPDATA 'nC\packages')).FullName; $msi = Join-Path $cache ([IO.Path]::GetFileName(([Uri]$url).AbsolutePath)); $part = $msi + '.' + [Guid]::NewGuid().ToString('N') + '.part'; $verify = { param($file) $h = [Security.Cryptography.SHA256]::Create(); try { if ([BitConverter]::ToString($h.ComputeHash([IO.File]::ReadAllBytes($file))).Replace('-','') -ne $sha) { throw 'SHA-256 mismatch.' } } finally { $h.Dispose() } }; try { if (-not [IO.File]::Exists($msi)) {     Invoke-WebRequest -UseBasicParsing -Uri $url -OutFile $part;     & $verify $part;     try { [IO.File]::Move($part,$msi) } catch [IO.IOException] { if (-not [IO.File]::Exists($msi)) { throw } } }; & $verify $msi; $argsMsi = '/i ' + [char]34 + $msi + [char]34 + ' /qn /norestart'; $result = Start-Process -FilePath (Join-Path ([Environment]::SystemDirectory) 'msiexec.exe') -ArgumentList $argsMsi -Wait -PassThru; if ($result.ExitCode -ne 0) { throw ('Windows Installer returned ' + $result.ExitCode) }; Write-Output (Join-Path $env:LOCALAPPDATA 'nC\kernels\x86_64-unknown-none\mini-bios-20260822') } finally { if ([IO.File]::Exists($part)) { [IO.File]::Delete($part) } }"
```

</details>

<details>
<summary>Linux, Ubuntu and WSL · Bash</summary>

<!-- install:kernel:bash -->
```bash
(
  set -eu
  [ "$(uname -s)/$(uname -m)" = Linux/x86_64 ] || { echo "Requires Linux x86-64." >&2; exit 1; }
  data=${XDG_DATA_HOME:-"$HOME/.local/share"}
  case "$data" in /*) ;; *) data="$HOME/.local/share" ;; esac
  parent="$data/nC/kernels/x86_64-unknown-none"
  dest="$parent/mini-bios-20260822"
  mkdir -p -- "$parent"
  stage=$(mktemp -d -- "$parent/.install.XXXXXXXX")
  trap 'rm -rf -- "$stage"' EXIT
  curl --fail --silent --show-error --location --proto '=https' \
    'https://github.com/https-ncc-lenguage-org/nc/releases/download/v0.1.0-bootstrap.168.r4/nc-kernel-mini-20260822-x86_64-bios.tar.gz' -o "$stage/package"
  (cd "$stage" && printf '%s  package\n' 'aac52831dbd6628f040024288583766df9f255fda4fc759e650ca7efae87bd26' | sha256sum --check --status)
  mkdir -- "$stage/files"
  tar -xzf "$stage/package" -C "$stage/files"
  [ ! -L "$dest" ] || { echo "The installation directory is a symlink." >&2; exit 1; }
  if [ ! -d "$dest" ]; then mv -Tn -- "$stage/files" "$dest" || [ -d "$dest" ]; fi
  if [ -d "$stage/files" ]; then diff -qr -- "$stage/files" "$dest"; fi
  printf 'Installed the nC mini kernel in %s\n' "$dest"
)
```

</details>

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
