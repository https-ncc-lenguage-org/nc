"""End-to-end JSON-RPC framing and lifecycle smoke test for the nclsp bridge.

This test uses a fake validator; it does NOT claim the real NCC toolchain was run.
"""
import io
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import time
import unittest

ROOT = Path(__file__).resolve().parents[1]
ADAPTER = ROOT / "src/main/resources/nc/nclsp_stdio_adapter.py"


def frame(obj):
    payload = json.dumps(obj).encode("utf-8")
    return b"Content-Length: " + str(len(payload)).encode() + b"\r\n\r\n" + payload


def decode_messages(stdout):
    sys.path.insert(0, str(ADAPTER.parent))
    from nclsp_stdio_adapter import read_message
    source = io.BytesIO(stdout)
    result = []
    while (message := read_message(source)) is not None:
        result.append(message)
    return result


class LspProcessTest(unittest.TestCase):
    def test_end_to_end_initialize_edit_close_shutdown(self):
        with tempfile.TemporaryDirectory() as temp:
            # This subprocess simulates `nclsp validate` and checks unsaved file contents.
            validator = Path(temp) / "nclsp"
            validator.write_text(
                "#!/usr/bin/env python3\n"
                "import json, pathlib, sys\n"
                "text = pathlib.Path(sys.argv[2]).read_text(encoding='utf-8')\n"
                "print(json.dumps({'errors': [{'line': 2, 'column': 1, 'message': text}]" 
                " if text.startswith('invalid') else [], 'warnings': []}))\n",
                encoding="utf-8",
            )
            validator.chmod(0o755)
            process = subprocess.Popen(
                [sys.executable, str(ADAPTER), "--nclsp", str(validator)],
                stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
            )
            uri = "file:///home/example/proyecto.n"
            def send(method, params=None, request_id=None):
                msg = {"jsonrpc": "2.0", "method": method}
                if params is not None:
                    msg["params"] = params
                if request_id is not None:
                    msg["id"] = request_id
                process.stdin.write(frame(msg))
                process.stdin.flush()

            # Guard against a stalled protocol; the timer terminates the child if
            # an LSP reply cannot be read. This test must not hang in CI.
            import threading
            killer = threading.Timer(8, process.kill)
            killer.daemon = True
            killer.start()
            try:
                sys.path.insert(0, str(ADAPTER.parent))
                from nclsp_stdio_adapter import read_message
                send("initialize", {"capabilities": {}}, 1)
                reply = read_message(process.stdout)
                self.assertEqual(reply["id"], 1)
                self.assertEqual(reply["result"]["capabilities"]["textDocumentSync"]["change"], 1)
                send("initialized")
                send("textDocument/didOpen", {"textDocument": {
                    "uri": uri, "languageId": "nc", "version": 1, "text": "invalid original"}})
                # Rapid edit before debounce: only the latest version is published.
                send("textDocument/didChange", {"textDocument": {"uri": uri, "version": 2},
                     "contentChanges": [{"text": "invalid changed"}]})
                published = read_message(process.stdout)
                self.assertEqual(published["method"], "textDocument/publishDiagnostics")
                self.assertEqual(published["params"]["diagnostics"][0]["message"], "invalid changed")
                self.assertEqual(published["params"]["version"], 2)
                send("textDocument/didClose", {"textDocument": {"uri": uri}})
                closed = read_message(process.stdout)
                self.assertEqual(closed["params"]["diagnostics"], [])
                send("shutdown", request_id=2)
                shutdown = read_message(process.stdout)
                self.assertEqual(shutdown["id"], 2)
                send("exit")
                output, errors = process.communicate(timeout=8)
                self.assertEqual(output, b"")
                self.assertEqual(process.returncode, 0, errors.decode(errors="replace"))
            finally:
                killer.cancel()
                if process.poll() is None:
                    process.kill()
                    process.communicate(timeout=3)

if __name__ == "__main__":
    unittest.main()
