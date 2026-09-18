import { useEffect, useRef } from 'react';
import { CONSTELLATIONS } from './constellations';

const BLUES = ['#042c53','#0a3d6b','#1a5a8a','#2e7ab8','#4a96ce','#6db0df','#85b7eb'];
const pickBlue = () => BLUES[Math.floor(Math.random()*BLUES.length)];
function shuffle(a){const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;}

/* ── 3D-style Eiffel Tower drawn on canvas ─────────────────────── */
function drawEiffelTower(ctx, cx, baseY, scale, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;

  const s = scale;  // scale factor

  // Helper
  const line = (x1,y1,x2,y2,color,w=1) => {
    ctx.beginPath(); ctx.moveTo(cx+x1*s, baseY+y1*s); ctx.lineTo(cx+x2*s, baseY+y2*s);
    ctx.strokeStyle = color; ctx.lineWidth = w; ctx.stroke();
  };
  const poly = (pts, fill, stroke, sw=1) => {
    ctx.beginPath();
    pts.forEach(([x,y],i) => i===0 ? ctx.moveTo(cx+x*s, baseY+y*s) : ctx.lineTo(cx+x*s, baseY+y*s));
    ctx.closePath();
    if(fill){ctx.fillStyle=fill;ctx.fill();}
    if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=sw;ctx.stroke();}
  };

  // ── SHADOW on ground ──
  ctx.beginPath();
  ctx.ellipse(cx, baseY+2, 30*s, 5*s, 0, 0, Math.PI*2);
  ctx.fillStyle='rgba(0,20,60,0.25)'; ctx.fill();

  // ── BASE LEGS (4 perspective legs, 2 visible) ──
  // Left front leg
  poly([[-28,0],[-8,-38],[0,-38],[0,0]],  '#1a4a70','#0d3258', 0.5);
  // Right front leg
  poly([[28,0],[8,-38],[0,-38],[0,0]],     '#0d3258','#0d3258', 0.5);
  // Left back leg (darker, 3D)
  poly([[-28,0],[-20,-2],[-6,-40],[-8,-38]], '#0d2a45','#091e30', 0.5);
  // Right back leg (darker)
  poly([[28,0],[20,-2],[6,-40],[8,-38]],    '#091e30','#091e30', 0.5);

  // ── FIRST FLOOR PLATFORM ──
  // Front face
  poly([[-8,-38],[8,-38],[6,-44],[-6,-44]], '#1e5a8a','#2e7ab8', 0.8);
  // Top face (3D perspective)
  poly([[-6,-44],[6,-44],[5,-46],[-5,-46]], '#2e7ab8','#4a96ce', 0.8);
  // Side face (right, darker)
  poly([[8,-38],[10,-40],[8,-46],[6,-44]], '#0f3a5a','#1a5a8a', 0.5);
  // Arches on front face
  ctx.strokeStyle='rgba(42,130,200,0.4)'; ctx.lineWidth=0.6;
  for(let i=-2;i<=2;i++){
    const ax=cx+i*2.5*s, ay=baseY-39*s;
    ctx.beginPath(); ctx.arc(ax, ay, 2*s, Math.PI, 0); ctx.stroke();
  }

  // ── MIDDLE SECTION ──
  // Left strut
  poly([[-6,-44],[-4,-44],[-2,-72],[0,-72]], '#1a5a8a','#2e7ab8', 0.5);
  poly([[-6,-44],[-7,-46],[-3,-74],[-2,-72]], '#0f3a5a','#1a5a8a', 0.4);
  // Right strut
  poly([[6,-44],[4,-44],[2,-72],[0,-72]],  '#1a5a8a','#2e7ab8', 0.5);
  poly([[6,-44],[7,-46],[3,-74],[2,-72]],   '#0f3a5a','#1a5a8a', 0.4);

  // Cross braces in middle section
  ctx.strokeStyle='rgba(30,90,140,0.5)'; ctx.lineWidth=0.5;
  for(let y=0;y<4;y++){
    const y0=-44-y*7, y1=-44-(y+1)*7;
    const x0L=-(6-y*1.5), x1L=-(4-(y+1)*1.2);
    const x0R=(6-y*1.5), x1R=(4-(y+1)*1.2);
    line(x0L,y0, x1R,y1,'rgba(30,90,140,0.4)',0.5);
    line(x0R,y0, x1L,y1,'rgba(30,90,140,0.4)',0.5);
  }

  // ── SECOND FLOOR PLATFORM ──
  poly([[-3,-72],[3,-72],[2,-76],[-2,-76]], '#1e5a8a','#2e7ab8', 0.8);
  poly([[-2,-76],[2,-76],[1.5,-77.5],[-1.5,-77.5]], '#2e7ab8','#4a96ce', 0.8);
  poly([[3,-72],[4,-73],[3,-77],[2,-76]], '#0f3a5a','#1a5a8a', 0.5);

  // ── UPPER SECTION (tapers to point) ──
  poly([[-2,-76],[2,-76],[0.8,-105],[0,-106]], '#1a5a8a','#2e7ab8', 0.5);
  poly([[2,-76],[2.5,-77],[1.2,-107],[0.8,-105]], '#0f3a5a','#1a5a8a', 0.4);

  // Cross braces upper
  ctx.strokeStyle='rgba(30,90,140,0.4)'; ctx.lineWidth=0.4;
  for(let y=0;y<5;y++){
    const y0=-76-y*6, y1=-76-(y+1)*6;
    const x0=(2-y*0.4), x1=(2-(y+1)*0.4);
    line(-x0,y0, x1,y1,'rgba(30,90,140,0.35)',0.4);
    line(x0,y0, -x1,y1,'rgba(30,90,140,0.35)',0.4);
  }

  // ── ANTENNA / SPIRE ──
  line(0,-106, 0,-118, '#4a96ce', 1.2);
  line(0,-118, 0,-122, '#6db0df', 0.8);
  // Antenna tip glow
  ctx.beginPath(); ctx.arc(cx, baseY-122*s, 1.5*s, 0, Math.PI*2);
  ctx.fillStyle='rgba(133,183,235,0.9)'; ctx.fill();
  // Blink
  const blink = 0.4 + Math.sin(Date.now()*0.003)*0.4;
  ctx.beginPath(); ctx.arc(cx, baseY-122*s, 3*s, 0, Math.PI*2);
  ctx.fillStyle=`rgba(133,183,235,${blink*0.3})`; ctx.fill();

  // ── GROUND REFLECTION (simple fade lines) ──
  ctx.save();
  ctx.globalAlpha = alpha * 0.07;
  ctx.strokeStyle = 'rgba(30,90,140,0.4)';
  ctx.lineWidth = 0.5;
  ctx.beginPath(); ctx.moveTo(cx-28*s, baseY+2); ctx.lineTo(cx-8*s, baseY+30); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx+28*s, baseY+2); ctx.lineTo(cx+8*s, baseY+30); ctx.stroke();
  ctx.restore();

  // ── WINDOW LIGHTS ──
  ctx.save();
  ctx.globalAlpha = alpha * 0.6;
  const lightRows = [
    {y:-42, count:5, xSpan:12},
    {y:-75, count:3, xSpan:5},
    {y:-100, count:2, xSpan:2},
  ];
  lightRows.forEach(({y,count,xSpan})=>{
    for(let i=0;i<count;i++){
      const lx = cx + (-xSpan/2 + i*(xSpan/(count-1||1)))*s;
      const ly = baseY + y*s;
      ctx.beginPath(); ctx.arc(lx, ly, 0.8*s, 0, Math.PI*2);
      ctx.fillStyle=`rgba(133,183,235,0.8)`; ctx.fill();
    }
  });
  ctx.restore();

  ctx.restore();
}


/* ── Component ─────────────────────────────────────────────────── */
export default function PharaonicStarfield({ side }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = Math.max(1, rect.width);
      canvas.height = Math.max(1, rect.height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const NUM = side ? 80 : 300;
    const stars = Array.from({length: NUM}, () => ({
      x: Math.random(), y: Math.random(),
      r: Math.random() * 1.4 + 0.3,
      baseAlpha: Math.random() * 0.45 + 0.15,
      twSpeed: Math.random() * 1.5 + 0.4,
      phase: Math.random() * Math.PI * 2,
      driftX: (Math.random()-0.5)*0.00005,
      driftY: (Math.random()-0.5)*0.00005,
      color: pickBlue(),
      homeX:0, homeY:0, targetX:-1, targetY:-1, assigned:false,
    }));

    const CYCLE = 5500;
    let cycleStart = performance.now();
    let activeShapes = [];
    let firstCycle = true;

    function assignConstellations(W, H) {
      stars.forEach(s => { s.assigned=false; s.targetX=-1; s.targetY=-1; });
      // Side: 2 constellations (upper area), Eiffel Tower in lower 40%
      // Fullscreen: 3 constellations
      const count = side ? 2 : 3;
      const shapes = shuffle(CONSTELLATIONS).slice(0, count);
      activeShapes = [];

      const regions = side
        ? [
            { cx: 0.5, cy: 0.18 },
            { cx: 0.5, cy: 0.46 },
          ]
        : shuffle([
            {cx:0.2,cy:0.25},{cx:0.5,cy:0.22},{cx:0.8,cy:0.28},
            {cx:0.25,cy:0.65},{cx:0.75,cy:0.65},
          ]);

      shapes.forEach((shape, si) => {
        const reg = regions[si];
        const scale = side
          ? Math.min(W, H*0.28) * 0.55
          : Math.min(W, H) * (0.14 + Math.random()*0.06);
        const cx = reg.cx * W, cy = reg.cy * H;
        const starIndices = [];
        shape.points.forEach(([px,py]) => {
          const tx = cx+(px-0.5)*scale, ty = cy+(py-0.5)*scale;
          let bestIdx=-1, bestDist=Infinity;
          for(let i=0;i<stars.length;i++){
            if(stars[i].assigned)continue;
            const dx=stars[i].x*W-tx, dy=stars[i].y*H-ty;
            const d=dx*dx+dy*dy;
            if(d<bestDist){bestDist=d;bestIdx=i;}
          }
          if(bestIdx>=0){
            stars[bestIdx].assigned=true;
            stars[bestIdx].targetX=tx/W; stars[bestIdx].targetY=ty/H;
            stars[bestIdx].homeX=stars[bestIdx].x; stars[bestIdx].homeY=stars[bestIdx].y;
            starIndices.push(bestIdx);
          }
        });
        activeShapes.push({shape, cx, cy, scale, starIndices});
      });
      cycleStart = performance.now();
    }

    let animId;
    const frame = (now) => {
      const W = canvas.width, H = canvas.height;
      if(W<=1||H<=1){animId=requestAnimationFrame(frame);return;}

      const elapsed = now - cycleStart;
      if(firstCycle||elapsed>CYCLE){assignConstellations(W,H);firstCycle=false;}
      const cyT = Math.min(elapsed/CYCLE, 1);

      let moveT, holdLine, returnT;
      if(cyT<0.2){moveT=cyT/0.2;holdLine=0;returnT=0;}
      else if(cyT<0.7){moveT=1;holdLine=1;returnT=0;}
      else{moveT=1;holdLine=1-(cyT-0.7)/0.3;returnT=(cyT-0.7)/0.3;}
      const easeM = moveT<1?moveT*moveT*(3-2*moveT):1;
      const easeR = returnT*returnT;

      ctx.clearRect(0,0,W,H);

      // Background
      const bg=ctx.createLinearGradient(0,0,0,H);
      bg.addColorStop(0,'#122438'); bg.addColorStop(0.5,'#183a70'); bg.addColorStop(1,'#142e58');
      ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);

      const t = now*0.001;

      // Stars
      stars.forEach(s => {
        let sx, sy;
        if(s.assigned&&s.targetX>=0){
          if(returnT>0){sx=s.targetX+(s.homeX-s.targetX)*easeR;sy=s.targetY+(s.homeY-s.targetY)*easeR;}
          else{sx=s.homeX+(s.targetX-s.homeX)*easeM;sy=s.homeY+(s.targetY-s.homeY)*easeM;}
        }else{
          s.x+=s.driftX;s.y+=s.driftY;
          if(s.x<-0.02)s.x=1.02;if(s.x>1.02)s.x=-0.02;
          if(s.y<-0.02)s.y=1.02;if(s.y>1.02)s.y=-0.02;
          sx=s.x;sy=s.y;
        }
        const tw=s.baseAlpha+Math.sin(t*s.twSpeed+s.phase)*0.22;
        const alpha=Math.max(0.05,Math.min(1,tw));
        const drawR=s.assigned?s.r*(1+easeM*0.5):s.r;
        const hex=s.color;
        const rr=parseInt(hex.slice(1,3),16),gg=parseInt(hex.slice(3,5),16),bb=parseInt(hex.slice(5,7),16);
        ctx.beginPath();ctx.arc(sx*W,sy*H,drawR,0,Math.PI*2);
        ctx.fillStyle=`rgba(${rr},${gg},${bb},${alpha})`;ctx.fill();
        if(s.assigned&&easeM>0.6&&holdLine>0){
          ctx.beginPath();ctx.arc(sx*W,sy*H,drawR*2.5,0,Math.PI*2);
          ctx.fillStyle=`rgba(${rr},${gg},${bb},${alpha*0.07*holdLine})`;ctx.fill();
        }
      });

      // Constellation lines + labels
      const getPos=(s)=>{
        if(returnT>0)return{x:(s.targetX+(s.homeX-s.targetX)*easeR)*W,y:(s.targetY+(s.homeY-s.targetY)*easeR)*H};
        return{x:(s.homeX+(s.targetX-s.homeX)*easeM)*W,y:(s.homeY+(s.targetY-s.homeY)*easeM)*H};
      };
      if(holdLine>0||(moveT>0.5&&returnT===0)){
        const la=moveT>0.8?holdLine:(moveT-0.5)/0.5;
        activeShapes.forEach(({shape,starIndices,cx,cy})=>{
          if(!shape.lines)return;
          shape.lines.forEach(([a,b])=>{
            if(a>=starIndices.length||b>=starIndices.length)return;
            const sA=stars[starIndices[a]],sB=stars[starIndices[b]];
            if(!sA||!sB)return;
            const pA=getPos(sA),pB=getPos(sB);
            ctx.beginPath();ctx.moveTo(pA.x,pA.y);ctx.lineTo(pB.x,pB.y);
            ctx.strokeStyle=`rgba(42,130,210,${la*0.6*holdLine})`;
            ctx.lineWidth=1.8;ctx.stroke();
          });
          if(la>0.25&&holdLine>0.15){
            const labelAlpha=Math.min(1,(la-0.25)/0.3)*holdLine;
            ctx.save();ctx.globalAlpha=labelAlpha;ctx.textAlign='center';
            const fontSize=side?Math.max(10,W*0.055):Math.max(11,Math.min(W,H)*0.016);
            ctx.font=`bold ${fontSize}px 'Inter','Segoe UI',sans-serif`;
            ctx.fillStyle='#85b7eb';
            let maxY=0;
            starIndices.forEach(si=>{const p=getPos(stars[si]);if(p.y>maxY)maxY=p.y;});
            ctx.fillText(shape.name,cx,maxY+18);
            ctx.restore();
          }
        });
      }

      // ── Draw 3D Eiffel Tower in lower 40% of side panel ──
      if(side){
        const towerScale = W * 0.006;          // bigger tower
        const towerX = W * 0.5;
        const towerY = H * 0.97;               // anchor at near bottom
        const tAlpha = 0.7 + Math.sin(t*0.8)*0.08;
        drawEiffelTower(ctx, towerX, towerY, towerScale, tAlpha);
        // PARIS label
        ctx.save();
        ctx.globalAlpha = tAlpha * 0.7;
        ctx.textAlign = 'center';
        ctx.font = `bold ${Math.max(9, W*0.052)}px 'Inter','Segoe UI',sans-serif`;
        ctx.fillStyle = '#6db0df';
        ctx.fillText('PARIS', towerX, towerY + 4);
        ctx.restore();
      }

      animId=requestAnimationFrame(frame);
    };

    const startT=setTimeout(()=>{animId=requestAnimationFrame(frame);},80);
    return()=>{cancelAnimationFrame(animId);clearTimeout(startT);ro.disconnect();};
  },[side]);

  const isPanel=!!side;
  return(
    <div ref={containerRef} style={{
      position:isPanel?'absolute':'fixed',
      inset:0, width:'100%', height:'100%',
      overflow:'hidden', borderRadius:isPanel?10:0,
    }}>
      <canvas ref={canvasRef} style={{display:'block',width:'100%',height:'100%'}}/>
    </div>
  );
}
