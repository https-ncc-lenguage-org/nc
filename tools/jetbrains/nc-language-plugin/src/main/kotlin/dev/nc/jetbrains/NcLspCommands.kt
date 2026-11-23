package dev.nc.jetbrains

import com.intellij.execution.configurations.GeneralCommandLine
import com.intellij.openapi.application.PathManager
import com.intellij.openapi.util.SystemInfo
import java.nio.file.FileAlreadyExistsException
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.StandardOpenOption
import java.security.MessageDigest

/** Client startup: protocol bytes go over stdio, never through the IDE event thread. */
internal object NcLspCommands {
    fun general(): GeneralCommandLine {
        val python = env("NC_PYTHON_BIN") ?: if (SystemInfo.isWindows) "python" else "python3"
        val bridge = extractBridge()
        val nclsp = tool("NC_NCLSP_BIN", "nclsp")
        return GeneralCommandLine(python, bridge.toString(), "--nclsp", nclsp)
    }

    fun system(): GeneralCommandLine = GeneralCommandLine(tool("NC_SYS_LSP_BIN", "nc-sys-lsp"), "lsp")

    private fun env(name: String): String? = System.getenv(name)?.trim()?.takeIf { it.isNotEmpty() }

    private fun tool(override: String, name: String): String {
        env(override)?.let { return it }
        val directories = mutableListOf<Path>()
        val ncc = runCatching { NcToolchainResolver.resolveNccBinary().path }.getOrNull()
        if (!ncc.isNullOrBlank()) {
            runCatching { Path.of(ncc).parent }.getOrNull()?.let { directories.add(it) }
        }
        if (SystemInfo.isWindows) {
            env("LOCALAPPDATA")?.let { directories.add(Path.of(it, "nC", "bin")) }
            env("USERPROFILE")?.let { directories.add(Path.of(it, "AppData", "Local", "nC", "bin")) }
        } else {
            System.getProperty("user.home")?.let {
                directories.add(Path.of(it, ".local", "bin"))
                directories.add(Path.of(it, ".cargo", "bin"))
            }
            directories.add(Path.of("/usr/local/bin"))
        }
        val executable = if (SystemInfo.isWindows) "$name.exe" else name
        for (directory in directories.distinct()) {
            val candidate = directory.resolve(executable)
            if (Files.isRegularFile(candidate)) return candidate.toString()
        }
        return name
    }

    private fun extractBridge(): Path {
        val bytes = requireNotNull(javaClass.getResourceAsStream("/nc/nclsp_stdio_adapter.py")) {
            "nC LSP stdio adapter is missing from plugin resources"
        }.use { it.readBytes() }
        val digest = MessageDigest.getInstance("SHA-256").digest(bytes).joinToString("") { "%02x".format(it) }
        val dir = Path.of(PathManager.getSystemPath(), "nc-language", "lsp")
        Files.createDirectories(dir)
        val path = dir.resolve("nclsp-" + digest.take(16) + ".py")
        if (!Files.exists(path)) {
            try {
                Files.write(path, bytes, StandardOpenOption.CREATE_NEW)
            } catch (_: FileAlreadyExistsException) {
                // Two projects may start at the same time; both use identical content.
            }
        }
        return path
    }
}
