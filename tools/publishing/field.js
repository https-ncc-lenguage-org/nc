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
  canvases.forEach(field);
})();
