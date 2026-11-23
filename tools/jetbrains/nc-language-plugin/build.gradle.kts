import org.jetbrains.intellij.platform.gradle.TestFrameworkType

import org.jetbrains.kotlin.gradle.dsl.JvmTarget
import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

plugins {
    kotlin("jvm") version "2.4.21"
    id("org.jetbrains.intellij.platform")
}

group = "dev.nc"
version = "1.0.0.22v"

dependencies {
    testImplementation("junit:junit:4.13.2")
    testImplementation("org.opentest4j:opentest4j:1.3.0")

    implementation("com.fasterxml.jackson.core:jackson-databind:2.17.1")
    testImplementation(kotlin("test"))

    intellijPlatform {
        testFramework(TestFrameworkType.Platform)

        rustRover("2026.3.1")
    }
}

java {
    toolchain {
        languageVersion.set(JavaLanguageVersion.of(25))
    }
}

kotlin {
    jvmToolchain(25)
}

tasks.withType<KotlinCompile>().configureEach {
    compilerOptions {
        jvmTarget.set(JvmTarget.JVM_25)
    }
}

intellijPlatform {
    pluginConfiguration {
        version = project.version.toString()
        description = """
            nC editing for RustRover 2026.3.1: syntax support, navigation, Run/Debug and persistent LSP sessions.
            Compiler authority remains in NCC.
            License: MIT OR Apache-2.0.
        """.trimIndent()
        changeNotes = "1.0.0.22v: RustRover 2026.3.1, persistent LSP diagnostics, native editor integrations preserved."
        ideaVersion {
            sinceBuild = "263"
            untilBuild = "263.*"
        }
    }
}
