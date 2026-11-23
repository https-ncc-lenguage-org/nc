from pathlib import Path
from xml.etree import ElementTree
import unittest

ROOT = Path(__file__).resolve().parents[1]

class ContractTests(unittest.TestCase):
    def test_plugin_descriptor_preserves_editor(self):
        root = ElementTree.parse(ROOT/'src/main/resources/META-INF/plugin.xml').getroot()
        deps = [el.text for el in root.findall('depends')]
        self.assertIn('com.intellij.modules.lsp', deps)
        self.assertIn('com.intellij.modules.ultimate', deps)
        self.assertEqual(root.find('id').text, 'dev.nc.language')
        self.assertEqual(root.find('version').text, '1.0.22')
        extensions = root.findall('.//fileType')
        self.assertEqual({e.attrib['extensions'] for e in extensions}, {'n','nb','nbb','nm','nbo','ncp'})
        tags = [el.tag for el in root.iter()]
        for tag in ('lang.parserDefinition','completion.contributor','gotoDeclarationHandler',
                    'runConfigurationProducer','programRunner','codeInsight.inlayProvider'):
            self.assertIn(tag, tags)
        self.assertEqual(root.find('.//integrationProvider').attrib['implementation'],
                         'dev.nc.jetbrains.NcLspIntegrationProvider')

    def test_263_java25(self):
        gradle = (ROOT/'build.gradle.kts').read_text()
        self.assertIn('rustRover("2026.3.1")', gradle)
        self.assertIn('JavaLanguageVersion.of(25)', gradle)
        self.assertIn('JvmTarget.JVM_25', gradle)
        self.assertIn('sinceBuild = "263"', gradle)
        self.assertIn('untilBuild = "263.*"', gradle)

    def test_lsp_wiring(self):
        kotlin = (ROOT/'src/main/kotlin/dev/nc/jetbrains/NcLspIntegrationProvider.kt').read_text()
        self.assertIn('ensureClientStarted', kotlin)
        self.assertIn('ProjectWideLspClientDescriptor', kotlin)
        commands = (ROOT/'src/main/kotlin/dev/nc/jetbrains/NcLspCommands.kt').read_text()
        self.assertIn('"nc-sys-lsp"', commands)
        self.assertIn('"lsp"', commands)

    def test_lsp_uses_installed_windows_suite_without_ncup(self):
        commands = (ROOT/'src/main/kotlin/dev/nc/jetbrains/NcLspCommands.kt').read_text()
        for marker in ('NC_NCLSP_BIN', 'NC_SYS_LSP_BIN', 'LOCALAPPDATA',
                       'USERPROFILE', 'Path.of(it, "nC", "bin")'):
            self.assertIn(marker, commands)

if __name__ == '__main__': unittest.main()
