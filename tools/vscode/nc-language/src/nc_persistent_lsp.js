/* Persistent nC language sessions (LSP 3.x) for VS Code.
 * Runs only installed, explicit executables. No shell, no source writes.
 * Compiler diagnostics and DAP remain independent of this diagnostic client.
 */
'use strict';

const cp = require('child_process');
const fs = require('fs');
const path = require('path');

const MAX_MESSAGE = 4 * 1024 * 1024;
const FAMILY = new Set(['nc', 'nc-root', 'nc-machine', 'nc-primitive', 'nc-hardware', 'nc-backend-object']);
const LOW = new Set(['.nb', '.nbb', '.nm', '.ncp']);

function modeFor(doc, preference = 'auto') {
  if (!doc || doc.uri.scheme !== 'file' || !FAMILY.has(doc.languageId)) return null;
  if (path.extname(doc.fileName).toLowerCase() === '.nbo') return null;
  if (preference === 'nide-broker') return null; // existing NIDE diagnostics remain authoritative
  if (preference === 'nc-sys-lsp') return 'system';
  if (preference === 'nclsp') return 'general';
  const ext = path.extname(doc.fileName).toLowerCase();
  const text = doc.getText().slice(0, 8192);
  return LOW.has(ext) || /primitive\[@\]|\[@machine\]|\[@\]/.test(text) ? 'system' : 'general';
}

function executable(name) {
  const suffix = process.platform === 'win32' ? '.exe' : '';
  const home = process.env.LOCALAPPDATA || (process.env.USERPROFILE && path.join(process.env.USERPROFILE, 'AppData', 'Local'));
  const bins = [process.env.NC_BIN_DIR, home && path.join(home, 'nC', 'bin')].filter(Boolean);
  for (const bin of bins) {
    const candidate = path.join(bin, name + suffix);
    if (fs.existsSync(candidate)) return candidate;
  }
  return name + suffix;
}

function commandFor(mode, extensionPath) {
  if (mode === 'system') return {command: process.env.NC_SYS_LSP_BIN || executable('nc-sys-lsp'), args: ['lsp']};
  return {
    command: process.env.NC_PYTHON_BIN || (process.platform === 'win32' ? 'python' : 'python3'),
    args: [path.join(extensionPath, 'bin', 'nclsp_stdio_adapter.py'), '--nclsp', process.env.NC_NCLSP_BIN || executable('nclsp')]
  };
}

function diagnosticFromLsp(vscode, diag) {
  if (!diag || !diag.range) return null;
  const s = diag.range.start || {}, e = diag.range.end || {};
  const range = new vscode.Range(Math.max(0,s.line || 0), Math.max(0,s.character || 0),
    Math.max(0,e.line || 0), Math.max(0,e.character || 0));
  const severity = ({1:vscode.DiagnosticSeverity.Error, 2:vscode.DiagnosticSeverity.Warning,
    3:vscode.DiagnosticSeverity.Information, 4:vscode.DiagnosticSeverity.Hint})[diag.severity] || vscode.DiagnosticSeverity.Error;
  const item = new vscode.Diagnostic(range, diag.message || 'nC LSP diagnostic', severity);
  if (diag.code !== undefined) item.code = diag.code;
  item.source = diag.source || 'nC LSP';
  return item;
}

class Session {
  constructor(mode, root, extensionPath, vscode, collection, logger) {
    this.mode=mode; this.root=root; this.vscode=vscode; this.collection=collection; this.logger=logger;
    this.documents=new Map(); this.pending=Buffer.alloc(0); this.initialized=false; this.closed=false;
    const spec=commandFor(mode,extensionPath);
    this.process=cp.spawn(spec.command,spec.args,{cwd:root,stdio:['pipe','pipe','pipe'],windowsHide:true,shell:false});
    this.process.stdout.on('data',chunk=>this.onData(chunk));
    this.process.stderr.on('data',chunk=>logger.appendLine(String(chunk).slice(0,1000)));
    this.process.on('error',err=>{logger.appendLine('nC LSP start: '+err.message);this.stop();});
    this.process.on('exit',(code)=>{if(!this.closed)logger.appendLine('nC '+mode+' LSP exited: '+code);this.closed=true;});
    this.send('initialize',{processId:process.pid,rootUri:vscode.Uri.file(root).toString(),
      capabilities:{general:{positionEncodings:['utf-16']},textDocument:{synchronization:{didSave:true},
        publishDiagnostics:{versionSupport:true}}}},1);
  }
  send(method, params, id) {
    if (this.closed || this.process.stdin.destroyed) return;
    const json=JSON.stringify({jsonrpc:'2.0',method, ...(params === undefined ? {} : {params}),...(id===undefined?{}:{id})});
    const body=Buffer.from(json,'utf8');
    this.process.stdin.write(Buffer.concat([Buffer.from('Content-Length: '+body.length+'\r\n\r\n'),body]));
  }
  onData(data) {
    this.pending=Buffer.concat([this.pending,data]);
    if (this.pending.length>MAX_MESSAGE+8192) {this.stop();return;}
    while(true) {
      const end=this.pending.indexOf('\r\n\r\n');
      if(end<0)return;
      const header=this.pending.subarray(0,end).toString('ascii');
      const match=header.match(/(?:^|\r\n)Content-Length:\s*(\d+)/i);
      const length=match?Number(match[1]):0;
      if(!length||length>MAX_MESSAGE){this.stop();return;}
      if(this.pending.length<end+4+length)return;
      const bytes=this.pending.subarray(end+4,end+4+length);
      this.pending=this.pending.subarray(end+4+length);
      let message;
      try {message=JSON.parse(bytes.toString('utf8'));}catch{continue;}
      this.onMessage(message);
    }
  }
  onMessage(message) {
    if(message.id===1 && message.result && !this.initialized) {
      this.initialized=true;
      this.send('initialized',{});
      for(const doc of this.documents.values()) this.publishOpen(doc);
    } else if(message.method==='textDocument/publishDiagnostics') {
      const p=message.params||{};
      if(!this.documents.has(p.uri))return;
      const doc=this.documents.get(p.uri);
      if(Number.isInteger(p.version) && p.version<doc.version)return;
      const list=Array.isArray(p.diagnostics)?p.diagnostics.map(d=>diagnosticFromLsp(this.vscode,d)).filter(Boolean):[];
      this.collection.set(this.vscode.Uri.parse(p.uri),list);
    }
  }
  publishOpen(doc) {
    this.send('textDocument/didOpen',{textDocument:{uri:doc.uri,languageId:doc.languageId,version:doc.version,text:doc.text}});
  }
  open(document) {
    const doc={uri:document.uri.toString(),languageId:document.languageId,version:document.version,text:document.getText()};
    this.documents.set(doc.uri,doc);
    if(this.initialized)this.publishOpen(doc);
  }
  change(document) {
    const uri=document.uri.toString(), previous=this.documents.get(uri);
    if(!previous)return;
    const next={...previous,version:document.version,text:document.getText()};
    this.documents.set(uri,next);
    if(this.initialized)this.send('textDocument/didChange',{textDocument:{uri,version:next.version},contentChanges:[{text:next.text}]});
  }
  close(document) {
    const uri=document.uri.toString();
    if(this.initialized)this.send('textDocument/didClose',{textDocument:{uri}});
    this.documents.delete(uri);this.collection.delete(document.uri);
  }
  stop() {
    if(this.closed)return;
    this.closed=true;
    try{this.send('shutdown',undefined,2);this.send('exit');}catch{}
    try{this.process.kill();}catch{}
  }
}

function startNcPersistentLsp(context,vscode) {
  const collection=vscode.languages.createDiagnosticCollection('nC LSP');
  const logger=vscode.window.createOutputChannel('nC Language Server');
  const sessions=new Map(), uriToSession=new Map(), disposables=[collection,logger];
  const preference=()=>vscode.workspace.getConfiguration('nc').get('lspMode','auto');
  const enabled=()=>vscode.workspace.getConfiguration('nc').get('persistentLsp',true);
  function open(document) {
    if(!enabled())return;
    const mode=modeFor(document,preference());
    if(!mode)return;
    const folder=vscode.workspace.getWorkspaceFolder(document.uri);
    const root=folder?.uri.fsPath || path.dirname(document.fileName);
    const key=root+'::'+mode;
    let session=sessions.get(key);
    if(!session||session.closed) {
      try {session=new Session(mode,root,context.extensionPath,vscode,collection,logger);sessions.set(key,session);}
      catch(err){logger.appendLine(String(err));return;}
    }
    uriToSession.set(document.uri.toString(),key);
    session.open(document);
  }
  function close(document) {
    const key=uriToSession.get(document.uri.toString());if(!key)return;
    uriToSession.delete(document.uri.toString());
    const session=sessions.get(key);if(!session)return;
    session.close(document);
    if(session.documents.size===0){session.stop();sessions.delete(key);}
  }
  disposables.push(vscode.workspace.onDidOpenTextDocument(open));
  disposables.push(vscode.workspace.onDidChangeTextDocument(e=>{
    const key=uriToSession.get(e.document.uri.toString());
    if(key)sessions.get(key)?.change(e.document);
  }));
  disposables.push(vscode.workspace.onDidCloseTextDocument(close));
  for(const document of vscode.workspace.textDocuments) open(document);
  return {dispose(){for(const session of sessions.values())session.stop();sessions.clear();
    for(const disposable of disposables)disposable.dispose();}};
}

module.exports={modeFor,commandFor,startNcPersistentLsp};
