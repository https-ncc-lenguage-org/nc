# nC mini kernel for x86-64 BIOS

This is the freestanding nC mini kernel from the 22 August 2026 build. Its target is `x86_64-unknown-none`. The archive includes the kernel ELF, its BIOS boot image and the matching nC source. V168 R4 is the host compiler release alongside which this independent kernel package is distributed.

To boot the image in a guest, run QEMU from the directory containing `boot.img`.

```sh
qemu-system-x86_64 -accel tcg -m 64 -nic none -display none -monitor none -serial stdio -drive if=floppy,format=raw,readonly=on,file=boot.img -boot a -no-reboot
```

The boot check observes the serial markers `nC kernel ACPI RSDP ok`, `nC kernel E820 ok` and `nC kernel ELF kmain` in order. The kernel then stays halted. End the emulator with Ctrl+C. This package runs as a guest under QEMU. The Windows and Linux host compilers are separate downloads.

| File | SHA-256 |
| --- | --- |
| `boot.img` | `d16d316eb0008b8dfb40550e8425977ff4471d4905a817159aa81ef2f496811d` |
| `kernel.elf` | `0f5060108802d6a3316bf76bd2813b4b383aaaa1a0feca1f9313ef16f2563e42` |
| `mini_boot_kernel.n` | `fb8653fc50f4374540e76b2890b2a9ede68522996c5f4888d33949dc6dc99988` |
