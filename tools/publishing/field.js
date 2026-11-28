// nC homepage motion: inertial scroll, one GPU particle field that flows between
// section formations, the live overview film, run replay and entrance reveals.
// Everything pauses when hidden and respects the shared motion toggle and reduced motion.
(() => {
  const reduced=matchMedia('(prefers-reduced-motion:reduce)');
  const motionPaused=()=>{try{const v=localStorage.getItem('nc-motion');return v==='paused'||(v!=='playing'&&reduced.matches);}catch{return reduced.matches;}};
  const toggle=document.querySelector('#motion-toggle');
  const onMotion=fn=>{if(toggle)new MutationObserver(()=>fn(toggle.getAttribute('aria-pressed')==='true')).observe(toggle,{attributes:true,attributeFilter:['aria-pressed']});};
  const PALETTE=[[214,137,90],[200,97,154],[123,111,224],[61,127,224],[47,165,151]];
  window.ncPalette=PALETTE;

  // Header state.
  const header=document.querySelector('.header');
  if(header){const mark=()=>header.classList.toggle('scrolled',scrollY>8);addEventListener('scroll',mark,{passive:true});mark();}

  // Inertial wheel scrolling: wheel input eases toward its target; keyboard, touch and anchors stay native.
  (()=>{
    if(reduced.matches||!matchMedia('(pointer:fine)').matches)return;
    let target=scrollY,current=scrollY,running=false,own=false;
    const max=()=>document.documentElement.scrollHeight-innerHeight;
    const scrollable=el=>{for(;el&&el!==document.body;el=el.parentElement){const s=getComputedStyle(el);if(/(auto|scroll)/.test(s.overflowY)&&el.scrollHeight>el.clientHeight)return true;}return false;};
    function step(){current+=(target-current)*.1;if(Math.abs(target-current)<.4)current=target;own=true;scrollTo(0,current);running=current!==target;if(running)requestAnimationFrame(step);}
    addEventListener('wheel',e=>{if(e.ctrlKey||e.defaultPrevented||Math.abs(e.deltaX)>Math.abs(e.deltaY)||scrollable(e.target)||document.querySelector('dialog[open]'))return;
      e.preventDefault();if(!running){target=current=scrollY;}target=Math.max(0,Math.min(max(),target+e.deltaY*(e.deltaMode===1?32:1)));if(!running){running=true;requestAnimationFrame(step);}},{passive:false});
    addEventListener('scroll',()=>{if(own){own=false;return;}if(!running){target=current=scrollY;}},{passive:true});
  })();

  // Journey particles (WebGL points; a 2D fallback draws the same data).
  (()=>{
    const canvas=document.querySelector('#ag-journey');if(!canvas)return;
    const sections=[...document.querySelectorAll('[data-form]')];
    let gl=canvas.getContext('webgl',{alpha:true,antialias:false,premultipliedAlpha:false,powerPreference:'low-power'}),ctx2d=null;
    let prog,buf,loc={};
    if(gl){
      const sh=(type,src)=>{const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);return s;};
      prog=gl.createProgram();
      gl.attachShader(prog,sh(gl.VERTEX_SHADER,'attribute vec2 p;attribute vec4 c;attribute float s;uniform vec2 r;uniform float d;varying vec4 vc;void main(){vec2 z=p/r*2.0-1.0;gl_Position=vec4(z.x,-z.y,0.0,1.0);gl_PointSize=s*d;vc=c;}'));
      gl.attachShader(prog,sh(gl.FRAGMENT_SHADER,'precision mediump float;varying vec4 vc;void main(){float q=length(gl_PointCoord-0.5);float a=smoothstep(0.5,0.32,q);if(a<=0.0)discard;gl_FragColor=vec4(vc.rgb,vc.a*a);}'));
      gl.linkProgram(prog);
      if(!gl.getProgramParameter(prog,gl.LINK_STATUS))gl=null;
    }
    if(gl){gl.useProgram(prog);buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);
      for(const [name,size,off] of [['p',2,0],['c',4,2],['s',1,6]]){const l=gl.getAttribLocation(prog,name);gl.enableVertexAttribArray(l);gl.vertexAttribPointer(l,size,gl.FLOAT,false,28,off*4);}
      loc.r=gl.getUniformLocation(prog,'r');loc.d=gl.getUniformLocation(prog,'d');gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);}
    else ctx2d=canvas.getContext('2d');
    let w=0,h=0,dpr=1,N=0,P=[],data,layout=[],frame=0,last=0,time=0,paused=motionPaused();
    const pointer={x:-1e4,y:-1e4,tx:-1e4,ty:-1e4};
    let seed=8101;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
    function build(){
      w=innerWidth;h=innerHeight;dpr=Math.min(devicePixelRatio||1,2);
      canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
      if(gl){gl.viewport(0,0,canvas.width,canvas.height);gl.uniform2f(loc.r,w,h);gl.uniform1f(loc.d,dpr);}else ctx2d.setTransform(dpr,0,0,dpr,0,0);
      const n=w<700?700:1800;
      if(n!==N){N=n;seed=8101;data=new Float32Array(N*7);P=Array.from({length:N},(_,i)=>({i,u:rnd(),v:rnd(),q:rnd(),k:.025+rnd()*.035,ph:rnd()*6.283,f:.4+rnd()*.9,sz:2.6+rnd()*rnd()*5,c:PALETTE[i%5],x:rnd()*w,y:rnd()*h,vx:0,vy:0}));}
      measure();
    }
    function measure(){
      // Cache section geometry in document coordinates so frames never touch layout.
      layout=sections.map(s=>{const r=s.getBoundingClientRect(),a=(s.querySelector('.ag-media,.ag-film-stage,h1,h2')||s).getBoundingClientRect();
        return {form:s.dataset.form,mid:r.top+scrollY+r.height/2,a:{left:a.left,top:a.top+scrollY,width:a.width,height:a.height}};});
    }
    const forms={
      orbit(p,a){const cx=a.left+a.width/2,cy=a.top+a.height/2,R=Math.max(w,h)*.6,ang=p.u*6.283+time*.02*(p.q<.5?1:-1);
        if(p.q<.82){const band=.5+Math.pow(p.v,.55)*.6;return [cx+Math.cos(ang)*R*band*.82,cy+Math.sin(ang)*R*band*.52];}
        return [p.u*w,a.top-h*.5+p.v*h*1.4];},
      halo(p,a){const ang=p.u*6.283+time*.03,rx=a.width*.5+40+p.v*120,ry=a.height*.5+40+p.v*90;return [a.left+a.width/2+Math.cos(ang)*rx,a.top+a.height/2+Math.sin(ang)*ry];},
      strata(p,a){const layer=Math.floor(p.q*4),y=a.top+a.height*(.15+layer*.23),side=p.u<.5,x=side?a.left-30-p.u*2*Math.max(80,a.left):a.left+a.width+30+(p.u-.5)*2*Math.max(80,w-a.left-a.width);
        return [((x+time*14*(layer%2?1:-1))%(w+60)+w+60)%(w+60)-30,y+(p.v-.5)*14];},
      stream(p,a){const cy=a.top+a.height/2,x=((p.u*w*1.3+time*60*(.6+p.q))%(w*1.3))-w*.15;return [x,cy+Math.sin(x*.009+p.q*6.283+time*.6)*(24+p.v*110)];},
      vortex(p,a){const cx=a.left+a.width/2,cy=a.top+a.height/2,rr=Math.max(a.width,a.height)*(.52+p.u*.5),ang=p.v*6.283+time*.12*(1.3-p.u);return [cx+Math.cos(ang)*rr,cy+Math.sin(ang)*rr*.6];},
      lattice(p,a){const cols=18,col=Math.floor(p.u*cols),row=Math.floor(p.v*16),right=a.left<w/2;const x0=right?a.left+a.width+60:40,x1=right?w-40:a.left-60;
        return [x0+(x1-x0)*(col+.5)/cols,a.top-40+(a.height+80)*(row+.5)/16];},
      drift(p,a){return [((p.u*w+time*10*(p.q-.5)*4)%w+w)%w,a.top-h*.3+p.v*h*1.6];}
    };
    const alphaOf={orbit:.85,halo:.6,strata:.55,stream:.55,vortex:.55,lattice:.5,drift:.32};
    function draw(dt){
      const sy=scrollY,mid=sy+h*.5;let ia=0,t=0;
      for(let i=0;i<layout.length;i++)if(layout[i].mid<=mid)ia=i;
      const A=layout[ia],B=layout[Math.min(ia+1,layout.length-1)];
      if(A&&B&&B!==A&&mid>=A.mid)t=Math.min(1,(mid-A.mid)/(B.mid-A.mid));
      t=t*t*(3-2*t);
      const fa=forms[A.form],fb=forms[B.form],al=(alphaOf[A.form]??.5)*(1-t)+(alphaOf[B.form]??.5)*t;
      const aa={...A.a,top:A.a.top-sy},ab={...B.a,top:B.a.top-sy};
      pointer.x+=(pointer.tx-pointer.x)*.15;pointer.y+=(pointer.ty-pointer.y)*.15;
      const dark=document.documentElement.dataset.theme==='dark';
      for(let j=0;j<N;j++){const p=P[j];
        const a=fa(p,aa),b=fb(p,ab);
        // Constant life: every particle wanders on its own slow loop around its target.
        const tx=a[0]+(b[0]-a[0])*t+Math.sin(time*p.f+p.ph)*10,ty=a[1]+(b[1]-a[1])*t+Math.cos(time*p.f*.8+p.ph)*10;
        if(dt){let fx=(tx-p.x)*p.k,fy=(ty-p.y)*p.k;const dx=p.x-pointer.x,dy=p.y-pointer.y,d2=dx*dx+dy*dy;
          if(d2<25600){const d=Math.sqrt(d2)||1,f=(1-d/160)*(1-d/160)*3;fx+=dx/d*f-dy/d*f*.6;fy+=dy/d*f+dx/d*f*.6;}
          p.vx=(p.vx+fx)*.86;p.vy=(p.vy+fy)*.86;p.x+=p.vx;p.y+=p.vy;}
        else{p.x=tx;p.y=ty;}
        const o=j*7;data[o]=p.x;data[o+1]=p.y;data[o+2]=p.c[0]/255;data[o+3]=p.c[1]/255;data[o+4]=p.c[2]/255;data[o+5]=Math.min(1,al*(dark?1:.95)*(.5+p.q*.6));data[o+6]=p.sz;
      }
      if(gl){gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.bufferData(gl.ARRAY_BUFFER,data,gl.DYNAMIC_DRAW);gl.drawArrays(gl.POINTS,0,N);}
      else{ctx2d.clearRect(0,0,w,h);for(let j=0;j<N;j++){const o=j*7;ctx2d.fillStyle=`rgba(${data[o+2]*255|0},${data[o+3]*255|0},${data[o+4]*255|0},${data[o+5]})`;ctx2d.beginPath();ctx2d.arc(data[o],data[o+1],data[o+6]/2,0,6.283);ctx2d.fill();}}
    }
    function loop(now){frame=0;if(paused||document.hidden)return;const dt=Math.min(.05,(now-(last||now))/1000);last=now;time+=dt;draw(dt);frame=requestAnimationFrame(loop);}
    const start=()=>{if(!frame&&!paused&&!document.hidden){last=0;frame=requestAnimationFrame(loop);}};
    const stop=()=>{if(frame)cancelAnimationFrame(frame);frame=0;};
    addEventListener('pointermove',e=>{pointer.tx=e.clientX;pointer.ty=e.clientY;},{passive:true});
    document.documentElement.addEventListener('pointerleave',()=>{pointer.tx=pointer.ty=-1e4;});
    addEventListener('scroll',()=>{if(paused)draw(0);},{passive:true});
    addEventListener('resize',()=>{build();draw(0);});
    new ResizeObserver(()=>measure()).observe(document.body);
    document.fonts?.ready.then(measure);
    document.addEventListener('visibilitychange',()=>document.hidden?stop():start());
    onMotion(v=>{paused=v;if(v){stop();draw(0);}else start();});
    build();draw(0);start();
  })();

  // The overview film: a 20-second motion piece drawn live (1920×1080 logical units).
  const FILM=(()=>{
    const D=20,M=1400,INK='#121317',MUTED='#5d6168',SANS='"IBM Plex Sans",system-ui,sans-serif',MONO='"IBM Plex Mono",ui-monospace,monospace';
    const C=PALETTE,css=c=>`rgb(${c[0]},${c[1]},${c[2]})`;
    let seed=20261128;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
    const P=Array.from({length:M},(_,i)=>({i,u:rnd(),v:rnd(),q:rnd(),ph:rnd()*6.283,f:.6+rnd()*1.2,s:2.4+rnd()*rnd()*5}));
    let logo=null;
    function glyphs(){
      const c=document.createElement('canvas');c.width=900;c.height=360;const g=c.getContext('2d');
      g.fillStyle='#000';g.font=`600 300px ${SANS}`;g.textAlign='center';g.textBaseline='middle';g.fillText('nC_',450,190);
      const d=g.getImageData(0,0,900,360).data,pts=[];
      for(let y=0;y<360;y+=7)for(let x=0;x<900;x+=7)if(d[(y*900+x)*4+3]>140)pts.push([x-450+960,y-190+440]);
      return pts.length?pts:[[960,440]];
    }
    const ease=x=>x<=0?0:x>=1?1:x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;
    const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
    const env=(t,a,b,fi=.5,fo=.4)=>clamp((t-a)/fi)*clamp((b-t)/fo);
    const forms={
      orbit(p,t){const a=p.u*6.283+t*.08*(p.q<.5?1:-1),band=.55+Math.pow(p.v,.6)*.5;return [960+Math.cos(a)*820*band,540+Math.sin(a)*470*band,C[p.i%5]];},
      logo(p,t){const g=logo[p.i%logo.length];if(p.i<logo.length*1.6)return [g[0]+(p.u-.5)*3,g[1]+(p.v-.5)*3,C[Math.floor((g[0]-700)/105+5)%5]];return forms.orbit(p,t);},
      layers(p,t){const b=p.i%4,y=[360,500,640,780][b],len=700;return [1100+((p.u*len+t*46*(b%2?1:-1))%len+len)%len,y+(p.v-.5)*26,C[b]];},
      pipe(p,t){const x=180+(((p.u+t*.07)%1+1)%1)*1560,seg=Math.min(4,Math.max(0,Math.floor((x-80)/360)));const nodeDist=Math.min(...[260,620,980,1340,1700].map(n=>Math.abs(n-x)))/180;
        return [x,600+Math.sin(x*.011+p.q*6.283)*70*clamp(nodeDist)+(p.v-.5)*24,C[seg]];},
      term(p,t){const a=p.v*6.283+t*.16*(1.3-p.u),rr=.62+p.u*.42;return [1000+Math.cos(a)*760*rr,610+Math.sin(a)*330*rr,C[p.i%5]];}
    };
    const T=[[0,'orbit'],[.2,'logo'],[3.7,'layers'],[8.3,'pipe'],[12.9,'term'],[17.5,'orbit']];
    function draw(ctx,t,W,H){
      if(!logo)logo=glyphs();
      t=((t%D)+D)%D;
      ctx.setTransform(W/1920,0,0,H/1080,0,0);ctx.fillStyle='#ffffff';ctx.fillRect(0,0,1920,1080);
      let k=0;for(let i=0;i<T.length;i++)if(T[i][0]<=t)k=i;
      const from=forms[T[Math.max(0,k-1)][1]],to=forms[T[k][1]],t0=T[k][0];
      for(const p of P){
        const e=k===0?1:ease((t-t0-(p.i/M)*.45)/1.05);
        const a=k===0?to(p,t):from(p,t),b=to(p,t);
        const x=a[0]+(b[0]-a[0])*e+Math.sin(t*p.f+p.ph)*5,y=a[1]+(b[1]-a[1])*e+Math.cos(t*p.f*.8+p.ph)*5;
        const c=[0,1,2].map(j=>a[2][j]+(b[2][j]-a[2][j])*e);
        ctx.globalAlpha=.55+p.q*.45;ctx.fillStyle=`rgb(${c[0]|0},${c[1]|0},${c[2]|0})`;ctx.beginPath();ctx.arc(x,y,p.s/2,0,6.283);ctx.fill();
      }
      ctx.globalAlpha=1;ctx.textBaseline='alphabetic';
      const text=(s,x,y,font,color,alpha=1,align='left')=>{if(alpha<=0)return;ctx.globalAlpha=alpha;ctx.font=font;ctx.fillStyle=color;ctx.textAlign=align;ctx.fillText(s,x,y);ctx.globalAlpha=1;};
      const reveal=(s,x,y,font,color,ts,alpha,align='left',rate=.028)=>{ctx.font=font;let cx=align==='center'?x-ctx.measureText(s).width/2:x;
        for(let i=0;i<s.length;i++){const a=clamp((t-ts-i*rate)/.35)*alpha;if(a>0){ctx.globalAlpha=a;ctx.fillStyle=color;ctx.textAlign='left';ctx.fillText(s[i],cx,y+(1-a)*14);}cx+=ctx.measureText(s[i]).width;}ctx.globalAlpha=1;};
      const type=(s,x,y,font,color,ts,cps=38,alpha=1)=>{const n=clamp(Math.floor((t-ts)*cps),0,s.length);if(n>0)text(s.slice(0,n),x,y,font,color,alpha);return n===s.length;};
      // 1 · Title
      let al=env(t,.9,3.65,.3,.35);
      if(al>0){reveal('Control at every level.',960,775,`400 76px ${SANS}`,INK,1.0,al,'center');reveal('The nC systems programming language',960,840,`400 30px ${SANS}`,MUTED,1.9,al,'center',.012);}
      // 2 · Four surfaces
      al=env(t,4.1,8.15,.4,.4);
      if(al>0){reveal('Four surfaces. One language.',160,200,`400 64px ${SANS}`,INK,4.1,al);
        const L=[['.n','ref main ->> run;'],['[@]','rootCore[@] {'],['[@machine]','jmp.ov overflow;'],['primitive[@]','portWrite uart0.data <- 0x41;']];
        L.forEach((l,b)=>{const y=[370,510,650,790][b],ts=4.7+b*.55;text(l[0],160,y,`500 30px ${MONO}`,css(C[b]),clamp((t-ts)/.3)*al);type(l[1],160,y+44,`400 28px ${MONO}`,INK,ts+.2,30,al);});}
      // 3 · Pipeline
      al=env(t,8.7,12.75,.4,.4);
      if(al>0){reveal('From source to execution.',160,200,`400 64px ${SANS}`,INK,8.7,al);
        const N=[['Source','.n'],['Analysis','AST'],['Representation','IR'],['Materialization','ABI'],['Execution','PE / ELF']];
        N.forEach((n,j)=>{const x=[260,620,980,1340,1700][j],on=clamp((t-9.3-j*.55)/.3)*al;
          ctx.globalAlpha=al*.9;ctx.fillStyle='#ffffff';ctx.beginPath();ctx.arc(x,600,26,0,6.283);ctx.fill();
          ctx.globalAlpha=on;ctx.fillStyle=css(C[j]);ctx.beginPath();ctx.arc(x,600,12+on*6,0,6.283);ctx.fill();ctx.globalAlpha=1;
          text(n[0],x,520,`400 26px ${SANS}`,MUTED,on,'center');text(n[1],x,700,`500 30px ${MONO}`,css(C[j]),on,'center');});}
      // 4 · Build and run
      al=env(t,13.3,17.35,.4,.4);
      if(al>0){reveal('Build and run.',160,200,`400 64px ${SANS}`,INK,13.3,al);
        const lines=['.\\ncc.exe self-test','.\\ncc.exe compiler emit-executable hello.n `','  --target x86_64-pc-windows-msvc --out hello.exe','.\\hello.exe'];
        let ts=13.7,y=470,done=true;
        for(const l of lines){const prompt=!l.startsWith(' ');if(t<ts){done=false;break;}if(prompt)text('PS>',560,y,`500 30px ${MONO}`,css(C[0]),al);done=type(l,640,y,`400 30px ${MONO}`,INK,ts,70,al);ts+=l.length/70+.25;y+=56;}
        if(done&&t>ts){text('Hello, nC public beta',640,y+30,`500 34px ${MONO}`,css(C[4]),clamp((t-ts)/.3)*al);text('exit code 0',640,y+80,`400 24px ${MONO}`,MUTED,clamp((t-ts-.3)/.3)*al);}
        else if(Math.floor(t*2.2)%2===0){ctx.globalAlpha=al;ctx.fillStyle=css(C[0]);ctx.fillRect(640,y-26,16,32);ctx.globalAlpha=1;}}
      // 5 · Sign-off
      al=env(t,18.0,19.75,.5,.25);
      if(al>0){ctx.globalAlpha=al;ctx.font=`600 150px ${SANS}`;const wN=ctx.measureText('nC').width,wU=ctx.measureText('_').width,x0=960-(wN+wU)/2;
        ctx.textAlign='left';ctx.fillStyle=INK;ctx.fillText('nC',x0,560);ctx.fillStyle=css(C[0]);ctx.fillText('_',x0+wN,560);ctx.globalAlpha=1;
        reveal('ncc-lenguage.org',960,650,`400 34px ${SANS}`,MUTED,18.4,al,'center',.02);}
    }
    return {draw,duration:D};
  })();
  window.ncFilm=FILM;

  // Live film player.
  (()=>{
    const stage=document.querySelector('.ag-film-stage');if(!stage)return;
    const canvas=stage.querySelector('canvas'),btn=document.querySelector('#film-toggle'),bar=stage.querySelector('.ag-film-progress span');
    const ctx=canvas.getContext('2d');let t=0,last=0,frame=0,playing=!motionPaused(),visible=false,ready=false;
    const size=()=>{const r=canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(r.width*d);canvas.height=Math.round(r.height*d);paint();};
    const paint=()=>{if(!ready)return;FILM.draw(ctx,playing||t>0?t:2.9,canvas.width,canvas.height);if(bar)bar.style.transform=`scaleX(${(t%FILM.duration)/FILM.duration})`;};
    const loop=now=>{frame=0;if(!playing||!visible||document.hidden)return;t+=Math.min(.05,(now-(last||now))/1000);last=now;paint();frame=requestAnimationFrame(loop);};
    const run=()=>{if(!frame&&playing&&visible&&!document.hidden){last=0;frame=requestAnimationFrame(loop);}};
    const set=v=>{playing=v;btn?.setAttribute('aria-pressed',String(!v));if(btn)btn.querySelector('span').textContent=v?'Pause':'Play';if(v)run();else paint();};
    btn?.addEventListener('click',()=>set(!playing));canvas.addEventListener('click',()=>set(!playing));
    new IntersectionObserver(([e])=>{visible=e.isIntersecting;run();},{threshold:.3}).observe(stage);
    new ResizeObserver(size).observe(canvas);
    document.addEventListener('visibilitychange',run);
    onMotion(v=>set(!v));
    (document.fonts?document.fonts.ready:Promise.resolve()).then(()=>{ready=true;size();set(playing);});
  })();

  // Run: replay the selected commands line by line, then reveal the expected output.
  (()=>{
    const button=document.querySelector('#run-replay'),code=document.querySelector('#terminal-commands code'),panel=document.querySelector('#terminal-panel'),section=document.querySelector('.run');
    if(!button||!code||!panel)return;let timer=0,fullText='';
    const finish=full=>{clearInterval(timer);timer=0;code.textContent=full;panel.classList.remove('replaying');section.dataset.step='3';button.innerHTML='Replay <span aria-hidden="true">↻</span>';};
    button.addEventListener('click',()=>{
      if(timer){finish(fullText);return;}
      fullText=code.textContent;const full=fullText,lines=full.split('\n');
      if(reduced.matches){finish(full);return;}
      panel.classList.add('replaying');section.dataset.step='2';code.textContent='';let n=0;button.textContent='Running…';
      timer=setInterval(()=>{n++;code.textContent=lines.slice(0,n).join('\n');if(n>=lines.length)finish(full);},600);
    });
    document.querySelectorAll('[data-os]').forEach(b=>b.addEventListener('click',()=>{if(timer){clearInterval(timer);timer=0;panel.classList.remove('replaying');}section.dataset.step='1';button.innerHTML='Run <span aria-hidden="true">▸</span>';}));
  })();

  // Content eases in as it arrives, so each section hands over to the next.
  (()=>{
    const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('ag-in');io.unobserve(e.target);}}),{rootMargin:'0px 0px -10% 0px'});
    document.querySelectorAll('.ag-copy,.ag-media,.ag-statement p,.ag-three article,.ag-end>*').forEach(el=>{el.classList.add('ag-rise');io.observe(el);});
  })();
})();
