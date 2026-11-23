'use strict';
const assert=require('assert');
const fs=require('fs');
const path=require('path');
const {modeFor,commandFor}=require('./nc_persistent_lsp');

function doc(name,language,text='') {
  return {languageId:language,fileName:path.resolve(name),uri:{scheme:'file'},getText:()=>text};
}
assert.equal(modeFor(doc('a.n','nc','run() -> int {}')),'general');
assert.equal(modeFor(doc('a.n','nc','A[@machine] { }')),'system');
assert.equal(modeFor(doc('a.nb','nc-root')),'system');
assert.equal(modeFor(doc('a.nbb','nc-primitive')),'system');
assert.equal(modeFor(doc('a.nm','nc-machine')),'system');
assert.equal(modeFor(doc('a.ncp','nc-hardware')),'system');
assert.equal(modeFor(doc('a.nbo','nc-backend-object')),null);
assert.equal(modeFor(doc('a.n','nc'),'nide-broker'),null);
assert.equal(modeFor(doc('a.n','nc'),'nc-sys-lsp'),'system');
assert.equal(modeFor(doc('a.nm','nc-machine'),'nclsp'),'general');
assert.equal(modeFor(doc('a.rs','rust')),null);
const command=commandFor('general',path.join(__dirname,'..'));
assert(fs.existsSync(command.args[0]),'General LSP adapter must ship with the VSIX.');
const other=commandFor('system',path.join(__dirname,'..'));
assert.deepEqual(other.args,['lsp']);
const {execFileSync}=require('child_process');
execFileSync('python',['-m','py_compile',command.args[0]],{timeout:5000,stdio:'ignore'});
console.log('nC persistent LSP routing, logo package and bridge: OK');
