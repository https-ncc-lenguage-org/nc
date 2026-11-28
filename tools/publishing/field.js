// Lift field: an orbit of short strokes that lifts away from the pointer and settles back.
// Canvas 2D, bounded DPR, paused off screen, hidden, or when motion is paused/reduced.
(() => {
  const header=document.querySelector('.header');
  if(header){const mark=()=>header.classList.toggle('scrolled',scrollY>8);addEventListener('scroll',mark,{passive:true});mark();}
  const canvases=[...document.querySelectorAll('canvas.lift-field')];
  if(!canvases.length)return;
  const reduced=matchMedia('(prefers-reduced-motion:reduce)');
  const palette=['#d6aa80','#e8885f','#c8619a','#7b6fe0','#4c8fe0','#3fb0a4','#8fb6a6','#d6aa80'];
  const mix=(a,b,t)=>{const p=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)),x=p(a),y=p(b);return x.map((v,i)=>Math.round(v+(y[i]-v)*t));};
  const colorAt=t=>{t=((t%1)+1)%1;const s=t*(palette.length-1),i=Math.floor(s);return mix(palette[i],palette[i+1],s-i);};
  function motionPaused(){try{const v=localStorage.getItem('nc-motion');return v==='paused'||(v!=='playing'&&reduced.matches);}catch{return reduced.matches;}}
  function field(canvas){
    if(canvas.dataset.field==='universe')return universe(canvas);
    const ctx=canvas.getContext('2d');if(!ctx)return;
    const mode=canvas.dataset.field||'hero',host=canvas.parentElement;
    let w=0,h=0,dpr=1,points=[],visible=true,frame=0,last=0,time=0,paused=motionPaused(),intro=0;
    const pointer={x:-9999,y:-9999,tx:-9999,ty:-9999,on:false};
    let seed=mode==='hero'?8101:2026;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
    function build(){
      const r=host.getBoundingClientRect();w=r.width;h=r.height;dpr=Math.min(devicePixelRatio||1,2);
      canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
      seed=mode==='hero'?8101:2026;points=[];
      const area=w*h,count=Math.min(mode==='hero'?1500:700,Math.round(area/(mode==='hero'?900:1100)));
      const cx=w/2,cy=mode==='hero'?h*.5:h/2,R=Math.max(w,h)*.62;
      for(let i=0;i<count;i++){
        let x,y,ring=0;
        if(mode==='hero'){
          // Mostly an elliptical orbit band around the headline, with sparse dust elsewhere.
          if(rnd()<.72){const a=rnd()*Math.PI*2,band=.34+Math.pow(rnd(),.6)*.66;ring=band;x=cx+Math.cos(a)*R*band*.78;y=cy+Math.sin(a)*R*band*.42;}
          else{x=rnd()*w;y=rnd()*h;ring=1.2;}
        }else{x=rnd()*w;y=rnd()*h;}
        const hole=mode==='hero'?Math.hypot((x-cx)/(w*.3),(y-cy)/(h*.27)):9;
        if(hole<1&&rnd()<.92){i--;continue;}
        const angle=Math.atan2(y-cy,x-cx);
        points.push({hx:x,hy:y,x:cx+(x-cx)*.15,y:cy+(y-cy)*.15,vx:0,vy:0,len:1.5+rnd()*3.4,width:.9+rnd()*1.1,
          tone:(angle/(Math.PI*2)+.5+rnd()*.08),depth:.35+rnd()*.65,phase:rnd()*6.283,ring,drift:.2+rnd()*.8});
      }
      intro=paused?1:0;draw(0);
    }
    function draw(dt){
      ctx.clearRect(0,0,w,h);
      const dark=document.documentElement.dataset.theme==='dark',cx=w/2,cy=mode==='hero'?h*.5:h/2;
      pointer.x+=(pointer.tx-pointer.x)*.18;pointer.y+=(pointer.ty-pointer.y)*.18;
      intro=Math.min(1,intro+dt*.55);const ease=1-Math.pow(1-intro,3);
      const radius=mode==='hero'?170:130,spin=mode==='hero'?.035:0;
      for(const p of points){
        // Home position: a slow orbit (hero) or an upward antigravity drift (cta).
        let hx=p.hx,hy=p.hy;
        if(mode==='hero'){const a=time*spin*p.depth*(p.ring>1?.3:1),dx=p.hx-cx,dy=(p.hy-cy)/.54;hx=cx+dx*Math.cos(a)-dy*Math.sin(a);hy=cy+(dx*Math.sin(a)+dy*Math.cos(a))*.54;hy+=Math.sin(time*.8+p.phase)*3*p.depth;}
        else{p.hy-=dt*14*p.drift;if(p.hy<-10){p.hy=h+10;p.y=p.hy;}hx+=Math.sin(time*.6+p.phase)*6;hy=p.hy;}
        let fx=(hx-p.x)*.035*ease,fy=(hy-p.y)*.035*ease;
        const dx=p.x-pointer.x,dy=p.y-pointer.y,d=Math.hypot(dx,dy);
        if(d<radius&&d>.01){const f=Math.pow(1-d/radius,2)*2.6;fx+=dx/d*f-dy/d*f*.55;fy+=dy/d*f+dx/d*f*.55;}
        p.vx=(p.vx+fx)*.86;p.vy=(p.vy+fy)*.86;
        if(dt){p.x+=p.vx;p.y+=p.vy;}else{p.x=hx;p.y=hy;}
        const speed=Math.hypot(p.vx,p.vy),near=d<radius?1-d/radius:0;
        const dir=speed>.25?Math.atan2(p.vy,p.vx):Math.atan2(p.y-cy,p.x-cx)+Math.PI/2;
        const len=p.len*(1+Math.min(speed,6)*.6+near*1.2);
        const [r,g,b]=colorAt(p.tone+time*.02);
        const alpha=(dark?.75:.85)*p.depth*(mode==='cta'?1.15:1)*(.35+.65*ease)*(p.ring>1?.55:1);
        ctx.strokeStyle=`rgba(${r},${g},${b},${alpha})`;ctx.lineWidth=p.width;ctx.lineCap='round';
        ctx.beginPath();ctx.moveTo(p.x-Math.cos(dir)*len,p.y-Math.sin(dir)*len);ctx.lineTo(p.x+Math.cos(dir)*len,p.y+Math.sin(dir)*len);ctx.stroke();
      }
    }
    function loop(now){frame=0;if(paused||!visible||document.hidden)return;const dt=Math.min(.05,(now-(last||now))/1000);last=now;time+=dt;draw(dt);frame=requestAnimationFrame(loop);}
    function start(){if(!frame&&!paused&&visible&&!document.hidden){last=0;frame=requestAnimationFrame(loop);}}
    function stop(){if(frame)cancelAnimationFrame(frame);frame=0;}
    host.addEventListener('pointermove',e=>{const r=canvas.getBoundingClientRect();pointer.tx=e.clientX-r.left;pointer.ty=e.clientY-r.top;if(!pointer.on){pointer.x=pointer.tx;pointer.y=pointer.ty;pointer.on=true;}});
    host.addEventListener('pointerleave',()=>{pointer.tx=pointer.ty=-9999;pointer.on=false;});
    new IntersectionObserver(([e])=>{visible=e.isIntersecting;visible?start():stop();}).observe(host);
    document.addEventListener('visibilitychange',()=>document.hidden?stop():start());
    new ResizeObserver(()=>{build();}).observe(host);
    const toggle=document.querySelector('#motion-toggle');
    if(toggle)new MutationObserver(()=>{paused=toggle.getAttribute('aria-pressed')==='true';if(paused){stop();intro=1;draw(0);}else start();}).observe(toggle,{attributes:true,attributeFilter:['aria-pressed']});
    new MutationObserver(()=>{if(paused)draw(0);}).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
    build();start();
  }
  // Universe: layered starfield and a slow spiral galaxy in the brand spectrum, with pointer parallax.
  function universe(canvas){
    const ctx=canvas.getContext('2d');if(!ctx)return;
    const host=canvas.parentElement;
    let w=0,h=0,dpr=1,stars=[],arms=[],visible=true,frame=0,last=0,time=0,paused=motionPaused(),comet=null;
    const pointer={x:0,y:0,tx:0,ty:0};
    let seed=4242;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
    function build(){
      const r=host.getBoundingClientRect();w=r.width;h=r.height;dpr=Math.min(devicePixelRatio||1,2);
      canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
      seed=4242;stars=[];arms=[];
      const count=Math.min(1400,Math.round(w*h/700));
      for(let i=0;i<count;i++)stars.push({x:rnd()*w,y:rnd()*h,z:.2+rnd()*.8,r:rnd()<.04?1.6:.4+rnd()*.9,ph:rnd()*6.283,tw:.5+rnd()*2});
      const n=Math.min(2600,Math.round(w*h/420));
      for(let i=0;i<n;i++){const arm=i%4,t=Math.pow(rnd(),.7),spread=(rnd()-.5)*(0.25+t*.5);arms.push({t,a:arm*1.571+t*4.6+spread,d:t,j:(rnd()-.5)*18,tone:(arm/3+t*.35)%1,s:.5+rnd()*1.3});}
      draw(0);
    }
    function draw(dt){
      ctx.clearRect(0,0,w,h);
      pointer.x+=(pointer.tx-pointer.x)*.05;pointer.y+=(pointer.ty-pointer.y)*.05;
      for(const s of stars){
        const x=((s.x+pointer.x*s.z*24-time*4*s.z)%w+w)%w,y=s.y+pointer.y*s.z*18;
        const a=(.35+.65*Math.abs(Math.sin(time*s.tw+s.ph)))*s.z;
        ctx.fillStyle=`rgba(236,240,246,${a})`;ctx.beginPath();ctx.arc(x,y,s.r*s.z+.2,0,6.283);ctx.fill();
      }
      const gx=w*(w>900?.62:.5)+pointer.x*30,gy=h*.5+pointer.y*20,R=Math.max(w,h)*.5,rot=time*.03;
      const glow=ctx.createRadialGradient(gx,gy,0,gx,gy,R*.55);glow.addColorStop(0,'rgba(243,210,176,.45)');glow.addColorStop(.35,'rgba(200,97,154,.16)');glow.addColorStop(.7,'rgba(76,143,224,.06)');glow.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
      for(const p of arms){
        const a=p.a+rot*(1.4-p.d),rr=p.d*R;
        const x=gx+Math.cos(a)*rr+Math.cos(a+1.57)*p.j*p.d,y=gy+(Math.sin(a)*rr+Math.sin(a+1.57)*p.j*p.d)*.42;
        const [r,g,b]=colorAt(p.tone+time*.01);
        ctx.fillStyle=`rgba(${r},${g},${b},${Math.min(1,(1-p.d*.6)*1.1)})`;ctx.fillRect(x,y,p.s*1.4,p.s*1.4);
      }
      if(dt&&!comet&&Math.random()<.004)comet={x:rnd()*w*.6,y:rnd()*h*.4,vx:6+rnd()*4,vy:2+rnd()*2,life:1};
      if(comet){const c=comet;const grad=ctx.createLinearGradient(c.x,c.y,c.x-c.vx*14,c.y-c.vy*14);grad.addColorStop(0,`rgba(255,240,225,${c.life})`);grad.addColorStop(1,'rgba(255,240,225,0)');ctx.strokeStyle=grad;ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(c.x,c.y);ctx.lineTo(c.x-c.vx*14,c.y-c.vy*14);ctx.stroke();c.x+=c.vx;c.y+=c.vy;c.life-=.012;if(c.life<=0||c.x>w)comet=null;}
    }
    function loop(now){frame=0;if(paused||!visible||document.hidden)return;const dt=Math.min(.05,(now-(last||now))/1000);last=now;time+=dt;draw(dt);frame=requestAnimationFrame(loop);}
    function start(){if(!frame&&!paused&&visible&&!document.hidden){last=0;frame=requestAnimationFrame(loop);}}
    function stop(){if(frame)cancelAnimationFrame(frame);frame=0;}
    host.addEventListener('pointermove',e=>{const r=host.getBoundingClientRect();pointer.tx=(e.clientX-r.left)/r.width-.5;pointer.ty=(e.clientY-r.top)/r.height-.5;});
    new IntersectionObserver(([e])=>{visible=e.isIntersecting;visible?start():stop();}).observe(host);
    document.addEventListener('visibilitychange',()=>document.hidden?stop():start());
    new ResizeObserver(()=>build()).observe(host);
    const toggle=document.querySelector('#motion-toggle');
    if(toggle)new MutationObserver(()=>{paused=toggle.getAttribute('aria-pressed')==='true';paused?stop():start();}).observe(toggle,{attributes:true,attributeFilter:['aria-pressed']});
    build();start();
  }
  canvases.forEach(field);
})();

// Strata: the explorer is the front layer; the other surfaces recede behind it.
(() => {
  const deck=document.querySelector('.strata-deck');if(!deck)return;
  const cards=[...deck.querySelectorAll('.strata-card')],tabs=[...document.querySelectorAll('#source-explorer [data-surface]')];
  const sync=()=>{const ids=tabs.map(t=>t.dataset.surface),active=Math.max(0,tabs.findIndex(t=>t.getAttribute('aria-selected')==='true'));
    cards.forEach(card=>{const k=ids.indexOf(card.dataset.layer);card.dataset.depth=String((k-active+ids.length)%ids.length);});};
  tabs.forEach(t=>new MutationObserver(sync).observe(t,{attributes:true,attributeFilter:['aria-selected']}));sync();
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
