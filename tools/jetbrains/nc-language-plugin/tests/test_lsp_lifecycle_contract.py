"""Static checks that the JetBrains LSP registration matches the advertised 263 API."""
import pathlib
import re
import unittest
from xml.etree import ElementTree

ROOT = pathlib.Path(__file__).resolve().parents[1]

class LspContractTests(unittest.TestCase):
    def test_descriptor_and_extension_registration(self):
        impl = (ROOT/'src/main/kotlin/dev/nc/jetbrains/NcLspIntegrationProvider.kt').read_text()
        xml = ElementTree.parse(ROOT/'src/main/resources/META-INF/plugin.xml').getroot()
        self.assertIn('LspIntegrationProvider', impl)
        self.assertIn('LspIntegrationProvider.LspClientStarter', impl)
        self.assertIn('ProjectWideLspClientDescriptor', impl)
        self.assertIn('clientStarter.ensureClientStarted(', impl)
        self.assertIn('createCommandLine()', impl)
        depends={el.text for el in xml.findall('depends')}
        self.assertTrue({'com.intellij.modules.lsp', 'com.intellij.modules.ultimate'}<=depends)
        self.assertEqual(xml.find('.//integrationProvider').attrib['implementation'],
                         'dev.nc.jetbrains.NcLspIntegrationProvider')

    def test_general_bridge_never_claims_language_features(self):
        adapter=(ROOT/'src/main/resources/nc/nclsp_stdio_adapter.py').read_text()
        self.assertIn("'textDocumentSync'", adapter)
        for invented in ('completionProvider', 'hoverProvider', 'renameProvider',
                         'definitionProvider', 'referencesProvider'):
            self.assertNotIn("'"+invented+"'", adapter)

    def test_low_level_uses_real_lsp_subcommand(self):
        commands=(ROOT/'src/main/kotlin/dev/nc/jetbrains/NcLspCommands.kt').read_text()
        self.assertRegex(commands, r'GeneralCommandLine\(tool\("NC_SYS_LSP_BIN",\s*"nc-sys-lsp"\),\s*"lsp"\)')

if __name__ == '__main__':
    unittest.main()
