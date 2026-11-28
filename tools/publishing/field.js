// Journey: one particle field for the whole homepage. Each section names a formation
// (data-form); while you scroll, the same particles flow from one formation to the next.
// Canvas 2D, bounded DPR, paused when hidden or when motion is paused/reduced.
(() => {
  const header=document.querySelector('.header');
  if(header){const mark=()=>header.classList.toggle('scrolled',scrollY>8);addEventListener('scroll',mark,{passive:true});mark();}
  const canvas=document.querySelector('#ag-journey');if(!canvas)return;
  const ctx=canvas.getContext('2d');if(!ctx)return;
  const sections=[...document.querySelectorAll('[data-form]')];
  const reduced=matchMedia('(prefers-reduced-motion:reduce)');
  const palette=['#d6aa80','#e8885f','#c8619a','#7b6fe0','#4c8fe0','#3fb0a4','#8fb6a6','#d6aa80'];
  const mix=(a,b,t)=>{const p=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)),x=p(a),y=p(b);return x.map((v,i)=>Math.round(v+(y[i]-v)*t));};
  const colorAt=t=>{t=((t%1)+1)%1;const s=t*(palette.length-1),i=Math.floor(s);return mix(palette[i],palette[i+1],s-i);};
  const motionPaused=()=>{try{const v=localStorage.getItem('nc-motion');return v==='paused'||(v!=='playing'&&reduced.matches);}catch{return reduced.matches;}};
  let w=0,h=0,dpr=1,P=[],frame=0,last=0,time=0,paused=motionPaused(),progress=0;
  const pointer={x:-9999,y:-9999,tx:-9999,ty:-9999};
  let seed=8101;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  function build(){
    w=innerWidth;h=innerHeight;dpr=Math.min(devicePixelRatio||1,2);
    canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
    const n=w<700?520:1100;seed=8101;
    if(P.length!==n)P=Array.from({length:n},(_,i)=>({i,u:rnd(),v:rnd(),q:rnd(),k:.03+rnd()*.05,len:1.6+rnd()*3.2,wd:.9+rnd()*1.1,x:rnd()*w,y:rnd()*h,vx:0,vy:0,a:0}));
  }
  const rectOf=el=>{const t=el.querySelector('.ag-media')||el.querySelector('figure')||el.querySelector('h1,h2,p')||el;return t.getBoundingClientRect();};
  // Formations: target point and stroke angle for particle p, around anchor rectangle r.
  const forms={
    orbit(p,r){const cx=r.left+r.width/2,cy=r.top+r.height/2,R=Math.max(w,h)*.62;
      if(p.q<.78){const a=p.u*6.283,band=.5+Math.pow(p.v,.6)*.55;return [cx+Math.cos(a)*R*band*.8,cy+Math.sin(a)*R*band*.5,a+1.57];}
      return [p.u*w,p.v*h,p.u*6.283];},
    ring(p,r){const pad=18+p.v*46,x0=r.left-pad,y0=r.top-pad,W=r.width+pad*2,H=r.height+pad*2,per=2*(W+H);let d=p.u*per;
      if(d<W)return [x0+d,y0,0];d-=W;if(d<H)return [x0+W,y0+d,1.57];d-=H;if(d<W)return [x0+W-d,y0+H,0];d-=W;return [x0,y0+H-d,1.57];},
    strata(p,r){const layer=Math.floor(p.q*4),y=r.top+r.height*(.2+layer*.2)+(p.v-.5)*10,left=p.u<.5,span=left?Math.max(0,r.left-24):Math.max(0,w-r.right-24);
      const x=left?r.left-24-p.u*2*span:r.right+24+(p.u-.5)*2*span;return [x,y-(left?(r.left-x):(x-r.right))*.12*(layer-1.5),0];},
    stream(p,r){const cy=r.top+r.height/2,x=((p.u*w*1.2+time*90*(.5+p.k*10))%(w*1.2))-w*.1;return [x,cy+Math.sin(x*.012+p.q*6.283)*(30+p.v*90)*(p.q<.5?1:-1),0];},
    vortex(p,r){const cx=r.left+r.width*.5,cy=r.top+r.height*.5,rr=Math.max(r.width,r.height)*(.55+p.u*.55),a=p.v*6.283+time*.15*(1.2-p.u);return [cx+Math.cos(a)*rr,cy+Math.sin(a)*rr*.62,a+1.57];},
    lattice(p,r){const cols=Math.max(4,Math.floor((w-r.right-40)/26)),col=Math.floor(p.u*cols),row=Math.floor(p.v*24);
      const flip=r.left>w/2;const x=flip?24+col*26:r.right+40+col*26;return [Math.min(w-10,Math.max(10,x)),r.top-60+row*((r.height+120)/24),0];},
    drift(p,r){return [((p.u*w+time*8*(p.q-.5))%w+w)%w,(p.v*h+Math.sin(time*.3+p.q*6.283)*20),p.q*6.283];}
  };
  const alphaOf={orbit:.9,ring:.75,strata:.7,stream:.6,vortex:.7,lattice:.55,drift:.3};
  function pick(){
    // The two sections around the viewport centre, and how far we are between them.
    const mid=h*.5;let a=sections[0],b=sections[0],t=0;
    const centres=sections.map(s=>{const r=s.getBoundingClientRect();return r.top+r.height/2;});
    for(let i=0;i<sections.length;i++){if(centres[i]<=mid){a=sections[i];b=sections[Math.min(i+1,sections.length-1)];const span=centres[Math.min(i+1,sections.length-1)]-centres[i];t=span>0?(mid-centres[i])/span:0;}}
    if(centres[0]>mid){a=b=sections[0];t=0;}
    t=Math.max(0,Math.min(1,t));t=t*t*(3-2*t);
    const doc=document.documentElement;progress=scrollY/Math.max(1,doc.scrollHeight-h);
    return {a,b,t};
  }
  function draw(dt){
    ctx.clearRect(0,0,w,h);
    const {a,b,t}=pick(),fa=a.dataset.form,fb=b.dataset.form,ra=rectOf(a),rb=rectOf(b);
    const dark=document.documentElement.dataset.theme==='dark',alpha=(alphaOf[fa]||.5)*(1-t)+(alphaOf[fb]||.5)*t;
    pointer.x+=(pointer.tx-pointer.x)*.2;pointer.y+=(pointer.ty-pointer.y)*.2;
    for(const p of P){
      const A=forms[fa](p,ra),B=forms[fb](p,rb);
      const tx=A[0]+(B[0]-A[0])*t,ty=A[1]+(B[1]-A[1])*t;
      if(dt){let fx=(tx-p.x)*p.k,fy=(ty-p.y)*p.k;const dx=p.x-pointer.x,dy=p.y-pointer.y,d=Math.hypot(dx,dy);
        if(d<150&&d>.01){const f=Math.pow(1-d/150,2)*2.4;fx+=dx/d*f-dy/d*f*.5;fy+=dy/d*f+dx/d*f*.5;}
        p.vx=(p.vx+fx)*.84;p.vy=(p.vy+fy)*.84;p.x+=p.vx;p.y+=p.vy;}
      else{p.x=tx;p.y=ty;}
      const sp=Math.hypot(p.vx,p.vy),ang=sp>.3?Math.atan2(p.vy,p.vx):(A[2]*(1-t)+B[2]*t),len=p.len*(1+Math.min(sp,8)*.45);
      const [r,g,bl]=colorAt(p.i/P.length+progress*.6+time*.01);
      ctx.strokeStyle=`rgba(${r},${g},${bl},${alpha*(dark?.85:.8)*(.45+p.q*.55)})`;ctx.lineWidth=p.wd;ctx.lineCap='round';
      ctx.beginPath();ctx.moveTo(p.x-Math.cos(ang)*len,p.y-Math.sin(ang)*len);ctx.lineTo(p.x+Math.cos(ang)*len,p.y+Math.sin(ang)*len);ctx.stroke();
    }
  }
  function loop(now){frame=0;if(paused||document.hidden)return;const dt=Math.min(.05,(now-(last||now))/1000);last=now;time+=dt;draw(dt);frame=requestAnimationFrame(loop);}
  function start(){if(!frame&&!paused&&!document.hidden){last=0;frame=requestAnimationFrame(loop);}}
  function stop(){if(frame)cancelAnimationFrame(frame);frame=0;}
  addEventListener('pointermove',e=>{pointer.tx=e.clientX;pointer.ty=e.clientY;},{passive:true});
  document.addEventListener('pointerleave',()=>{pointer.tx=pointer.ty=-9999;});
  addEventListener('scroll',()=>{if(paused)draw(0);},{passive:true});
  addEventListener('resize',()=>{build();if(paused)draw(0);});
  document.addEventListener('visibilitychange',()=>document.hidden?stop():start());
  const toggle=document.querySelector('#motion-toggle');
  if(toggle)new MutationObserver(()=>{paused=toggle.getAttribute('aria-pressed')==='true';if(paused){stop();draw(0);}else start();}).observe(toggle,{attributes:true,attributeFilter:['aria-pressed']});
  new MutationObserver(()=>{if(paused)draw(0);}).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  // Content rises into place as it enters, so sections hand over to each other.
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('ag-in');io.unobserve(e.target);}}),{rootMargin:'0px 0px -12% 0px'});
  document.querySelectorAll('.ag-copy,.ag-media,.ag-statement p,.ag-three article,.ag-end>*').forEach(el=>{el.classList.add('ag-rise');io.observe(el);});
  build();draw(0);start();
})();

// Run: replay the selected commands line by line, then reveal the expected output.
(() => {
  const button=document.querySelector('#run-replay'),code=document.querySelector('#terminal-commands code'),panel=document.querySelector('#terminal-panel'),section=document.querySelector('.run');
  if(!button||!code||!panel)return;
  const reduced=matchMedia('(prefers-reduced-motion:reduce)');let timer=0,fullText='';
  const finish=full=>{clearInterval(timer);timer=0;code.textContent=full;panel.classList.remove('replaying');section.dataset.step='3';button.innerHTML='Replay <span aria-hidden="true">↻</span>';};
  button.addEventListener('click',()=>{
    if(timer){finish(fullText);return;}
    fullText=code.textContent;const full=fullText,lines=full.split('\n');
    if(reduced.matches){finish(full);return;}
    panel.classList.add('replaying');section.dataset.step='2';code.textContent='';let n=0;
    button.textContent='Running…';
    timer=setInterval(()=>{n++;code.textContent=lines.slice(0,n).join('\n');if(n>=lines.length)finish(full);},600);
  });
  document.querySelectorAll('[data-os]').forEach(b=>b.addEventListener('click',()=>{if(timer){clearInterval(timer);timer=0;panel.classList.remove('replaying');}section.dataset.step='1';button.innerHTML='Run <span aria-hidden="true">▸</span>';}));
})();
