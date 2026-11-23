package dev.nc.jetbrains

object NcLspModeRouter {
    private val supported = setOf("n", "nb", "nbb", "nm", "ncp")

    fun isNcSource(path: String): Boolean =
        path.substringAfterLast('.', "").lowercase() in supported

    fun isLowLevel(path: String, content: String): Boolean {
        val lowered = path.lowercase()
        if (lowered.endsWith(".nb") || lowered.endsWith(".nbb") || lowered.endsWith(".nm") || lowered.endsWith(".ncp")) {
            return true
        }
        val head = content.take(8192)
        return head.contains("primitive[@]") || head.contains("[@machine]") || head.contains("[@]")
    }

    fun chooseBackend(path: String, content: String): String {
        return if (isLowLevel(path, content)) "nc-sys-lsp" else "nclsp"
    }
}
