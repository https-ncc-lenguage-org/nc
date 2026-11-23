import importlib.util
import io
import json
import pathlib
import sys
import tempfile
import time
from unittest.mock import patch
import textwrap
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('nclsp_adapter', ROOT / 'src/main/resources/nc' / 'nclsp_stdio_adapter.py')
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)


class AdapterTest(unittest.TestCase):
    def test_framing(self):
        message = {'jsonrpc':'2.0','method':'initialize','id':3,'params':{}}
        data = json.dumps(message).encode()
        framed = b'Content-Length: '+str(len(data)).encode()+b'\r\n\r\n'+data
        self.assertEqual(mod.read_message(io.BytesIO(framed)), message)

    def test_parse(self):
        report = '{"errors":[{"line":4,"column":3,"message":"bad"}],"warnings":["warn"]}'
        rows = mod.parse_report(report, '', 1)
        self.assertEqual((rows[0]['range']['start']['line'],rows[0]['range']['start']['character']), (3,2))
        self.assertEqual([v['severity'] for v in rows], [1,2])

    def test_validate_uses_temp_not_project(self):
        with tempfile.TemporaryDirectory() as directory:
            fake = pathlib.Path(directory) / 'nclsp'
            fake.write_text('#!/usr/bin/env python3\nimport json,sys\nprint(json.dumps({"errors": [], "warnings": []}))\n')
            fake.chmod(0o755)
            self.assertEqual(mod.validate_document(str(fake), 'file:///fake/project/foo.n','fn: test',8.0), [])
            self.assertFalse(pathlib.Path('/fake/project/foo.n').exists())

    def test_invalid_content_length(self):
        with self.assertRaises(ValueError):
            mod.read_message(io.BytesIO(b'Content-Length: 999999999\r\n\r\n'))

    def test_session_initialize_close_shutdown(self):
        emitted = []
        session = mod.Session('unused', 1.0)
        with patch.object(mod, 'send', side_effect=emitted.append), \
             patch.object(mod, 'validate_document', return_value=[]):
            session.handle({'jsonrpc':'2.0', 'id':1, 'method':'initialize', 'params':{}})
            session.handle({'jsonrpc':'2.0', 'method':'textDocument/didOpen',
                            'params':{'textDocument':{'uri':'file:///x.n', 'version':1, 'text':'x'}}})
            time.sleep(0.5)
            session.handle({'jsonrpc':'2.0', 'method':'textDocument/didClose',
                            'params':{'textDocument':{'uri':'file:///x.n'}}})
            session.handle({'jsonrpc':'2.0', 'id':2, 'method':'shutdown'})
        self.assertEqual(emitted[0]['result']['capabilities']['textDocumentSync']['change'], 1)
        published = [x for x in emitted if x.get('method')=='textDocument/publishDiagnostics']
        self.assertEqual(len(published), 2)
        self.assertEqual(published[-1]['params']['diagnostics'], [])
        self.assertEqual(emitted[-1]['id'], 2)

    def test_rapid_document_changes_coalesce(self):
        emitted = []
        validated = []
        session = mod.Session('unused', 1.0)
        def fake_validate(nclsp, uri, text, timeout):
            validated.append(text)
            return []
        with patch.object(mod, 'send', side_effect=emitted.append), \
             patch.object(mod, 'validate_document', side_effect=fake_validate):
            for v in range(5):
                session.updated('file:///test.n', 'edit-'+str(v), v)
            time.sleep(0.6)
            session.shutdown()
        self.assertEqual(validated, ['edit-4'])
        published = [x for x in emitted if x.get('method')=='textDocument/publishDiagnostics']
        self.assertEqual(len(published), 1)
        self.assertEqual(published[0]['params']['version'], 4)

if __name__=='__main__': unittest.main()
