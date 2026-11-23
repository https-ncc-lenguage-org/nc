package dev.nc.jetbrains

import com.intellij.execution.configurations.RunProfile
import com.intellij.execution.configurations.RunnerSettings
import com.intellij.execution.runners.GenericProgramRunner

// Executor IDs are stable across JetBrains IDEs; debug support is optional in the host IDE.
internal const val NC_DEBUG_EXECUTOR_ID = "Debug"

class NcDebugProgramRunner : GenericProgramRunner<RunnerSettings>() {
    override fun getRunnerId(): String = "NcDebugProgramRunner"

    override fun canRun(executorId: String, profile: RunProfile): Boolean {
        return executorId == NC_DEBUG_EXECUTOR_ID && profile is NcRunConfiguration
    }
}
