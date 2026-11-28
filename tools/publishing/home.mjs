import {renderSurfaceExplorer, highlightNC} from './surfaces.mjs';
const escape=value=>value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export function renderHome({repo,release,hello,surfaces}) {
  const film={video:'assets/media/nc-overview-02253c64e0eb.mp4',poster:'assets/media/nc-overview-poster-b076bf10f2c8.webp',captions:'assets/media/nc-overview-en-01b8ce0208d4.vtt'};
  const phases=[['Source','.n','Declarations and imports'],['Analysis','AST','Symbols, types and flow'],['Representation','IR','Lowering and transformations'],['Materialization','ABI','Objects and linking'],['Execution','PE / ELF','Runtime and observable effects']];
  const recipe=['.\\ncc.exe self-test','.\\ncc.exe compiler emit-executable hello.n `','  --target x86_64-pc-windows-msvc --out hello.exe','.\\hello.exe'].join('\n');
return `<main id="main" class="ag">
  <canvas class="ag-journey" id="ag-journey" aria-hidden="true"></canvas>

  <section class="ag-hero" data-form="orbit" aria-labelledby="hero-title">
    <p class="ag-mark" aria-hidden="true">nC<span>_</span></p>
    <h1 id="hero-title">Control at<br> every level.</h1>
    <p class="ag-sub">One continuous systems language, from functions to machine instructions.</p>
    <div class="ag-actions"><a class="ag-btn ag-btn-ink" href="downloads.html">Get ncc <span aria-hidden="true">↓</span></a><a class="ag-btn ag-btn-soft" href="nc-programming-language.html">Read the language</a></div>
  </section>

  <section id="overview-film" class="ag-film" data-form="ring" aria-label="nC in 20 seconds">
    <figure class="film-player ag-frame-dark">
      <div class="film-screen"><video id="nc-overview-video" controls playsinline preload="none" poster="${film.poster}" width="1920" height="1080" tabindex="0" aria-label="nC overview — 20-second video" aria-describedby="film-caption">
        <source src="${film.video}" type="video/mp4">
        <track kind="captions" src="${film.captions}" srclang="en" label="English">
        <p><a href="${film.video}">Download the nC overview video</a> or read the transcript below.</p>
      </video><button id="film-play" class="film-play" type="button" aria-controls="nc-overview-video" hidden><span aria-hidden="true">▶</span> Play intro</button></div>
      <p id="film-play-status" class="film-play-status" role="status" hidden></p>
      <figcaption><span id="film-caption">20 seconds · English · Music and sound effects</span><a href="${film.video}" download="nc-overview.mp4">Download <span aria-hidden="true">↓</span></a></figcaption>
    </figure>
    <details id="film-transcript" class="film-transcript"><summary>Read the video transcript</summary><div class="film-transcript-body">
      <p>Original electronic instrumental music plays throughout. Dry mechanical clicks mark scene and tab changes; the compiler signal travels from left to right.</p>
      <ol>
        <li><span class="film-time">0:00–0:03</span><div><h3>Control at every level.</h3><p>The nC systems programming language.</p></div></li>
        <li><span class="film-time">0:03–0:08</span><div><h3>Four surfaces. One continuous language.</h3><p>Functions: <code>ref main -&gt;&gt; run</code>. Root <code>[@]</code>: <code>rootCore[@]</code>. Machine <code>[@machine]</code>: <code>add rax, rbx</code> and <code>jmp.ov overflow</code>. Primitive: <code>portWrite uart0.data &lt;- 0x41</code>.</p><a href="#source-explorer">Inspect the source examples</a></div></li>
        <li><span class="film-time">0:08–0:14</span><div><h3>From source to execution.</h3><p>The ncc pipeline: Source (.n) → Analysis (AST) → Representation (IR) → Materialization (ABI) → Execution (PE/ELF).</p><a href="#architecture">Explore the compiler phases</a></div></li>
        <li><span class="film-time">0:14–0:18</span><div><h3>Build and run.</h3><p>The terminal sequence reproduces a verified run of the public V81 Windows kit.</p><pre><code>.\\ncc.exe compiler emit-executable hello.n --target x86_64-pc-windows-msvc --out hello.exe
.\\hello.exe</code></pre><p>Output: <code>Hello, nC public beta</code>. Exit code 0.</p><a href="library/the-first-program.html">Build your first program</a></div></li>
        <li><span class="film-time">0:18–0:20</span><div><h3>ncc-lenguage.org</h3><p>Native bootstrap V81 · Open source. The music fades out.</p></div></li>
      </ol>
    </div></details>
  </section>

  <section class="ag-statement" data-form="drift">
    <p>nC is a systems programming language in native bootstrap. Ordinary source, foundational contracts, machine instructions and material primitives share <em>one typed model</em>, so the meaning of a program survives all the way down.</p>
  </section>

  <section class="ag-row" data-form="strata" aria-labelledby="read-title">
    <div class="ag-copy">
      <h2 id="read-title">Read nC</h2>
      <p>Four surfaces of the same language: functions, root contracts, typed machine control and hardware primitives. Switch between them and read the real source.</p>
      <a class="ag-link" href="nc-programming-language.html">Explore the language <span aria-hidden="true">→</span></a>
    </div>
    <div class="ag-media ag-glow">${renderSurfaceExplorer(surfaces,repo)}</div>
  </section>

  <section id="architecture" class="ag-row ag-row-flip" data-form="stream" aria-labelledby="ncc-title">
    <div class="ag-copy">
      <h2 id="ncc-title">Follow it through ncc</h2>
      <p>Five phases, from declaration to native image. Select one to see what it is responsible for.</p>
      <a class="ag-link" href="ncc-compiler.html">Inside the compiler <span aria-hidden="true">→</span></a>
    </div>
    <div class="ag-media ag-glow"><div class="continuity-grid"><div class="pipeline-map" role="tablist" aria-label="Compiler phases" aria-orientation="vertical">${phases.map((phase,i)=>`<button role="tab" id="phase-tab-${i}" aria-selected="${i===0}" aria-controls="phase-panel" tabindex="${i===0?'0':'-1'}" class="phase ${i===0?'active':''}" data-phase="${i}"><span class="phase-index">0${i+1}</span><span class="phase-name">${phase[0]}<small>${phase[2]}</small></span><code>${phase[1]}</code><span class="phase-indicator" aria-hidden="true">↗</span></button>`).join('')}</div>
    <div class="phase-panel" id="phase-panel" role="tabpanel" aria-labelledby="phase-tab-0" tabindex="0"><div class="phase-panel-top"><span class="eyebrow" id="phase-label">01 / SOURCE</span><span class="contract-tag">Phase reference</span></div><div class="contract-visual" aria-hidden="true"><div><span class="contract-mark" id="phase-mark">.n</span><span class="contract-caption">nC / semantic continuity</span></div></div><h3 id="phase-title">Declare the program.</h3><p id="phase-description">Functions, typed places and imports define program units. Visibility, control flow and representation must retain their identity through analysis.</p><div class="phase-detail"><span>Source reference</span><code id="phase-code">examples/00_hello/hello.n</code></div><a class="text-link" id="phase-link" href="library/the-first-program.html">Read the contract <span>↗</span></a></div></div></div>
  </section>

  <section id="run" class="ag-row run" data-form="vortex" aria-labelledby="first-program-title">
    <div class="ag-copy">
      <h2 id="first-program-title">Run it</h2>
      <p>Save the program as hello.n, then build and run a native executable. Press Run to replay a verified run of the public kit.</p>
      <div class="terminal-tabs run-os" role="tablist" aria-label="Operating system"><button role="tab" id="os-windows" aria-selected="true" aria-controls="terminal-panel" data-os="windows">Windows</button><button role="tab" id="os-linux" aria-selected="false" aria-controls="terminal-panel" tabindex="-1" data-os="linux">Linux / WSL</button></div>
      <a class="ag-link" href="downloads.html">Get the native kit <span aria-hidden="true">→</span></a>
    </div>
    <div class="ag-media ag-glow ag-run">
      <div class="source-window"><div class="window-bar"><span>hello.n</span><button class="copy-hero" type="button" aria-label="Copy the hello.n source">Copy</button></div><pre><code>${highlightNC(hello)}</code></pre></div>
      <div class="terminal"><div class="run-bar"><span id="terminal-shell">PowerShell · inside the extracted kit</span><span class="run-actions"><button id="copy-commands" type="button" aria-label="Copy commands for the selected system">Copy</button><button id="run-replay" type="button">Run <span aria-hidden="true">▸</span></button></span></div><div id="terminal-panel" role="tabpanel" aria-labelledby="os-windows"><pre id="terminal-commands"><code>${escape(recipe)}</code></pre><div class="terminal-output" aria-live="polite"><pre>Hello, nC public beta</pre></div></div></div>
    </div>
  </section>

  <section id="from-c" class="ag-choices" data-form="drift" aria-labelledby="choices-title">
    <h2 id="choices-title">Built for systems programmers</h2>
    <div class="ag-three">
      <article><code translate="no">[@machine]</code><h3>A typed machine boundary</h3><p>Instructions, labels and control transfers live in the language model instead of an asm template.</p><a class="ag-link" href="library/the-machine-layer.html">The machine layer <span aria-hidden="true">→</span></a></article>
      <article><code translate="no">size / align / ABI</code><h3>Representation you can inspect</h3><p>Layout, alignment and calling conventions are part of the model. Memory stays manual.</p><a class="ag-link" href="library/memory-and-representation.html">Memory and representation <span aria-hidden="true">→</span></a></article>
      <article><code translate="no">source → IR → image</code><h3>A compiler you can trace</h3><p>Analysis and emission routes are exposed; the bootstrap records sources and artifact comparisons.</p><a class="ag-link" href="#evidence">Published evidence <span aria-hidden="true">→</span></a></article>
    </div>
  </section>

  <section id="evidence" class="ag-row ag-row-flip" data-form="lattice" aria-labelledby="evidence-title">
    <div class="ag-copy">
      <h2 id="evidence-title">Evidence you can open</h2>
      <p>Bootstrap V81 publishes its scope, its reconstruction and how to reproduce it. These figures identify a validation scope, not a performance comparison.</p>
      <a class="ag-link" href="${repo}/blob/main/docs/NCC_MODULES_V81_REPRO.md">Reproduce the reconstruction <span aria-hidden="true">→</span></a>
    </div>
    <div class="ag-media ag-glow"><table class="ag-table"><caption>Bootstrap V81: published scope</caption><tbody><tr><th scope="row">Native kits</th><td>Windows x86-64 and Linux / WSL x86-64</td></tr><tr><th scope="row">Reconstruction</th><td>B2 and C2 are byte-identical within each documented host.</td></tr><tr><th scope="row">Language contract</th><td>Manual/raw memory, explicit representation and typed machine surfaces.</td></tr><tr><th scope="row">Open work</th><td>Full native CLI coverage and global Stage3 promotion.</td></tr></tbody></table></div>
  </section>

  <section class="ag-end" data-form="orbit" aria-labelledby="end-title">
    <h2 id="end-title">Read it. Build it.<br>Help define it.</h2>
    <div class="ag-actions"><a class="ag-btn ag-btn-ink" href="downloads.html">Get ncc <span aria-hidden="true">↓</span></a><a class="ag-btn ag-btn-soft" href="${repo}">Inspect the source</a></div>
    <p class="ag-quiet"><a href="library.html">Documentation</a><a href="${repo}/blob/main/CONTRIBUTING.md">Contribute</a><a href="${release}">Release notes</a></p>
  </section>
  </main>`;
}
