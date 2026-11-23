package dev.nc.jetbrains

import com.intellij.openapi.project.Project
import com.intellij.openapi.vfs.VirtualFile
import com.intellij.execution.configurations.GeneralCommandLine
import com.intellij.platform.lsp.api.LspIntegrationProvider
import com.intellij.platform.lsp.api.ProjectWideLspClientDescriptor
import java.nio.charset.StandardCharsets

/** Starts one appropriate, project-wide LSP client when a supported file is opened. */
class NcLspIntegrationProvider : LspIntegrationProvider {
    override fun fileOpened(project: Project, file: VirtualFile, clientStarter: LspIntegrationProvider.LspClientStarter) {
        if (!NcLspModeRouter.isNcSource(file.path)) return
        if (NcLspModeRouter.isLowLevel(file.path, readHead(file))) {
            clientStarter.ensureClientStarted(NcSystemLspDescriptor(project))
        } else {
            clientStarter.ensureClientStarted(NcGeneralLspDescriptor(project))
        }
    }
}

private fun readHead(file: VirtualFile): String {
    return runCatching {
        file.inputStream.use { input ->
            String(input.readNBytes(8192), StandardCharsets.UTF_8)
        }
    }.getOrDefault("")
}

private class NcGeneralLspDescriptor(project: Project) :
    ProjectWideLspClientDescriptor(project, "nC · General") {
    override fun isSupportedFile(file: VirtualFile): Boolean =
        NcLspModeRouter.isNcSource(file.path) &&
        !NcLspModeRouter.isLowLevel(file.path, readHead(file))

    override fun createCommandLine(): GeneralCommandLine = NcLspCommands.general()
}

private class NcSystemLspDescriptor(project: Project) :
    ProjectWideLspClientDescriptor(project, "nC · System / Machine") {
    override fun isSupportedFile(file: VirtualFile): Boolean =
        NcLspModeRouter.isNcSource(file.path) &&
        NcLspModeRouter.isLowLevel(file.path, readHead(file))

    override fun createCommandLine(): GeneralCommandLine = NcLspCommands.system()
}
