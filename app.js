import * as THREE from './vendor/three.min.js';
const TEACHER_PIN='1234', MAX_SELFIES=30;
const $=id=>document.getElementById(id);
// ---------- Creature info ----------
const INFO={
shark:{n:'Shark',e:'🦈',facts:['Sharks have been around since before the dinosaurs!','They can grow thousands of teeth in their life.','Sharks have no bones, just bendy cartilage like your ears.'],eats:'Fish, seals and squid',lives:'Oceans all over the world',size:'Most are as long as a car'},
octopus:{n:'Octopus',e:'🐙',facts:['An octopus has 8 arms and 3 hearts!','It can change colour to hide.','Its blood is blue.'],eats:'Crabs, shrimp and clams',lives:'Rocky sea floors and coral reefs',size:'From a grape to bigger than a grown-up'},
turtle:{n:'Sea Turtle',e:'🐢',facts:['Sea turtles can hold their breath for hours while resting.','Mum turtles lay eggs on sandy beaches.','Some turtles live over 100 years!'],eats:'Seagrass, jellyfish and sponges',lives:'Warm oceans and beaches',size:'About as long as a bathtub'},
clownfish:{n:'Clownfish',e:'🐠',facts:['Clownfish live inside stinging sea anemones but do not get stung!','They are all born as boys.','Nemo is a clownfish!'],eats:'Tiny plankton and algae',lives:'Warm coral reefs',size:'As small as your hand'},
seahorse:{n:'Seahorse',e:'🌊',facts:['Seahorse dads carry the babies!','They swim standing up.','Their eyes can look two ways at once.'],eats:'Tiny shrimp',lives:'Seagrass and coral reefs',size:'About as tall as your finger'},
jellyfish:{n:'Jellyfish',e:'🪼',facts:['Jellyfish have no brain, no heart and no bones!','They have been around for 500 million years.','Some jellyfish glow in the dark.'],eats:'Tiny fish and plankton',lives:'Every ocean in the world',size:'From a pea to as wide as a car'},
dolphin:{n:'Dolphin',e:'🐬',facts:['Dolphins talk with clicks and whistles.','They breathe air through a hole on their head.','Dolphins are super smart and love to play!'],eats:'Fish and squid',lives:'Oceans and some rivers',size:'About as long as a sofa'},
crab:{n:'Crab',e:'🦀',facts:['Crabs walk sideways!','Their skeleton is on the outside.','Crabs can grow back a lost claw.'],eats:'Almost anything: algae, worms, leftovers',lives:'Beaches, rocks and the sea floor',size:'From a coin to as wide as a car'},
starfish:{n:'Starfish',e:'⭐',facts:['A starfish has no brain and no blood!','It can grow a new arm if one breaks off.','It has an eye at the end of each arm.'],eats:'Clams, mussels and snails',lives:'Rocky sea floors and tide pools',size:'About as big as your hand'},
whale:{n:'Whale',e:'🐋',facts:['The blue whale is the biggest animal that has ever lived!','Whales sing songs to each other.','A blue whale\'s heart is as big as a small car.'],eats:'Tiny krill, millions a day',lives:'All the oceans',size:'As long as 3 school buses (blue whale)'}};
const DEFAULT=['shark','octopus','turtle','clownfish','clownfish','clownfish','seahorse','jellyfish','jellyfish','dolphin','crab','starfish','whale'];
// ---------- Renderer / scene ----------
const canvas=$('gl');
const renderer=new THREE.WebGLRenderer({canvas,antialias:(devicePixelRatio||1)<2,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));
renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;
const scene=new THREE.Scene();const FOG=new THREE.Color('#0a5f8f');
scene.fog=new THREE.FogExp2(FOG,0.028);
{const c=document.createElement('canvas');c.width=2;c.height=256;const g=c.getContext('2d'),gr=g.createLinearGradient(0,0,0,256);gr.addColorStop(0,'#5fd3f0');gr.addColorStop(.45,'#0a7fb0');gr.addColorStop(1,'#03355e');g.fillStyle=gr;g.fillRect(0,0,2,256);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;scene.background=t}
const camera=new THREE.PerspectiveCamera(55,1,.1,200);
scene.add(new THREE.HemisphereLight('#9fe8ff','#c9a46b',1.6));
const sun=new THREE.DirectionalLight('#e6fbff',2.2);sun.position.set(5,30,10);scene.add(sun);
const uT={value:0};
const STD=(color,o={})=>new THREE.MeshStandardMaterial(Object.assign({color,roughness:.55,metalness:.05},o));
// caustics on any standard material
const CAUSTIC=`float caus(vec2 p){p*=.25;float t=uT*.5;vec2 i=p;float c=1.;for(int n=0;n<4;n++){float tt=t*(1.-(3.5/float(n+1)));i=p+vec2(cos(tt-i.x)+sin(tt+i.y),sin(tt-i.y)+cos(tt+i.x));c+=1./length(vec2(p.x/(sin(i.x+tt)/.005),p.y/(cos(i.y+tt)/.005)));}c/=4.;c=1.17-pow(c,1.4);return clamp(pow(abs(c),8.),0.,1.);}`;
function caustify(m,amt=.35){m.onBeforeCompile=sh=>{sh.uniforms.uT=uT;
 sh.vertexShader='varying vec3 vWP;varying vec3 vWN;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvWP=(modelMatrix*vec4(transformed,1.)).xyz;vWN=normalize(mat3(modelMatrix)*objectNormal);');
 sh.fragmentShader='uniform float uT;varying vec3 vWP;varying vec3 vWN;\n'+CAUSTIC+'\n'+sh.fragmentShader.replace('#include <fog_fragment>',`gl_FragColor.rgb+=vec3(.75,.95,1.)*caus(vWP.xz)*${amt.toFixed(2)}*smoothstep(-.2,1.,vWN.y);\n#include <fog_fragment>`)};return m}
// ---------- Environment ----------
const rnd=(a,b)=>a+Math.random()*(b-a);
const floorH=(x,z)=>Math.sin(x*.15)*.6+Math.cos(z*.2+x*.05)*.5+Math.sin(x*.5+z*.4)*.15;
{const g=new THREE.PlaneGeometry(160,120,70,50);g.rotateX(-Math.PI/2);const p=g.attributes.position;
 for(let i=0;i<p.count;i++)p.setY(i,floorH(p.getX(i),p.getZ(i)));g.computeVertexNormals();
 const f=new THREE.Mesh(g,caustify(STD('#c9a66b',{roughness:.95}),.3));f.position.z=-20;scene.add(f)}
const fy=(x,z)=>floorH(x,z+20);
// rocks
const rockMat=caustify(STD('#6f7b85',{roughness:.9,flatShading:true}),.3);
for(let i=0;i<16;i++){const g=new THREE.IcosahedronGeometry(1,1),p=g.attributes.position;for(let k=0;k<p.count;k++){const s=rnd(.8,1.2);p.setXYZ(k,p.getX(k)*s,p.getY(k)*s*.7,p.getZ(k)*s)}g.computeVertexNormals();
 const r=new THREE.Mesh(g,rockMat),x=rnd(-30,30),z=rnd(-28,4),s=rnd(.6,2.4);r.scale.setScalar(s);r.position.set(x,fy(x,z)+s*.2,z);r.rotation.y=rnd(0,6);scene.add(r)}
// coral
const coralCols=['#ff6f91','#ff9671','#ffc75f','#c34a9b','#f9f871','#ff5e78'];
function branch(parent,len,rad,depth,mat){const g=new THREE.CylinderGeometry(rad*.7,rad,len,6);g.translate(0,len/2,0);const m=new THREE.Mesh(g,mat);parent.add(m);
 if(depth>0)for(let k=0;k<2;k++){const c=new THREE.Group();c.position.y=len;c.rotation.set(rnd(-.7,.7),rnd(0,6),rnd(-.7,.7));m.add(c);branch(c,len*.75,rad*.7,depth-1,mat)}
 else{const tip=new THREE.Mesh(new THREE.SphereGeometry(rad*1.1,6,4),mat);tip.position.y=len;m.add(tip)}}
for(let i=0;i<14;i++){const x=rnd(-26,26),z=rnd(-22,3),mat=caustify(STD(coralCols[i%6],{roughness:.7}),.25),gp=new THREE.Group();gp.position.set(x,fy(x,z)-.1,z);
 if(i%3===2){const g=new THREE.IcosahedronGeometry(1,2),p=g.attributes.position;for(let k=0;k<p.count;k++){const v=new THREE.Vector3().fromBufferAttribute(p,k),n=1+.08*Math.sin(v.x*9)*Math.sin(v.y*9)*Math.sin(v.z*9);v.multiplyScalar(n);p.setXYZ(k,v.x,v.y*.7,v.z)}g.computeVertexNormals();const b=new THREE.Mesh(g,mat);b.scale.setScalar(rnd(.7,1.3));gp.add(b)}
 else branch(gp,rnd(1,1.6),.18,2,mat);scene.add(gp)}
// kelp
const kelp=[];const kelpMat=STD('#3f8f3a',{roughness:.7,side:THREE.DoubleSide});const kelpSeg=new THREE.PlaneGeometry(.45,1.2,1,1);kelpSeg.translate(0,.6,0);
for(let i=0;i<14;i++){const x=rnd(-32,32),z=rnd(-26,2);let parent=new THREE.Group();parent.position.set(x,fy(x,z)-.1,z);parent.rotation.y=rnd(0,6);scene.add(parent);const segs=[],n=7+(Math.random()*6|0);
 for(let k=0;k<n;k++){const m=new THREE.Mesh(kelpSeg,kelpMat);m.scale.x=1-k/n*.5;if(k)m.position.y=1.2;parent.add(m);segs.push(m);parent=m}kelp.push({segs,ph:rnd(0,6)})}
// god rays
const rayTex=(()=>{const c=document.createElement('canvas');c.width=64;c.height=256;const g=c.getContext('2d'),gr=g.createLinearGradient(0,0,0,256);gr.addColorStop(0,'rgba(255,255,255,.9)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,64,256);
 const m=g.getImageData(0,0,64,256);for(let y=0;y<256;y++)for(let x=0;x<64;x++){const e=Math.sin(Math.PI*x/63);m.data[(y*64+x)*4+3]*=e*e}g.putImageData(m,0,0);return new THREE.CanvasTexture(c)})();
const rays=[];for(let i=0;i<9;i++){const m=new THREE.Mesh(new THREE.PlaneGeometry(rnd(2,5),45),new THREE.MeshBasicMaterial({map:rayTex,transparent:true,opacity:.18,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,color:'#bff3ff'}));
 m.position.set(rnd(-25,25),20,rnd(-25,0));m.rotation.z=rnd(-.35,-.15);scene.add(m);rays.push({m,ph:rnd(0,6)})}
// particles
const NP=1200,pp=new Float32Array(NP*3);for(let i=0;i<NP;i++){pp[i*3]=rnd(-35,35);pp[i*3+1]=rnd(0,22);pp[i*3+2]=rnd(-30,15)}
const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(pp,3));
const parts=new THREE.Points(pg,new THREE.PointsMaterial({color:'#dff8ff',size:.08,transparent:true,opacity:.6,depthWrite:false}));scene.add(parts);
// bubbles
const NB=70,bub=new THREE.InstancedMesh(new THREE.SphereGeometry(1,10,8),new THREE.MeshStandardMaterial({color:'#e8fbff',transparent:true,opacity:.35,roughness:.05,metalness:.3,emissive:'#4fb6d8',emissiveIntensity:.3}),NB);scene.add(bub);
const bubs=[...Array(NB)].map(()=>({x:rnd(-25,25),y:rnd(0,22),z:rnd(-20,8),s:rnd(.05,.2),v:rnd(.8,2),ph:rnd(0,6)}));const dm=new THREE.Object3D();
// ---------- Creature builders (procedural, low poly, facing +X) ----------
const eyeMat=STD('#111',{roughness:.2}),whiteMat=STD('#fff',{roughness:.3});
function eyes(g,x,y,z,r){for(const s of[1,-1]){const w=new THREE.Mesh(new THREE.SphereGeometry(r,10,8),whiteMat);w.position.set(x,y,z*s);const p=new THREE.Mesh(new THREE.SphereGeometry(r*.6,8,6),eyeMat);p.position.set(r*.45,0,s*r*.4);w.add(p);g.add(w)}}
function ell(r,sx,sy,sz,mat,seg=[16,12]){const m=new THREE.Mesh(new THREE.SphereGeometry(r,seg[0],seg[1]),mat);m.scale.set(sx,sy,sz);return m}
function fin(w,h,mat){const s=new THREE.Shape();s.moveTo(0,0);s.quadraticCurveTo(w*.6,h*.4,w*.2,h);s.lineTo(-w*.5,h*.85);s.quadraticCurveTo(-w*.2,h*.3,0,0);
 const g=new THREE.ExtrudeGeometry(s,{depth:.04,bevelEnabled:false});g.translate(0,0,-.02);return new THREE.Mesh(g,mat)}
function tailFork(size,mat,horizontal){const t=new THREE.Group();for(const s of[1,-1]){const f=fin(size*.6,size,mat);f.rotation.z=Math.PI/2+s*.75;f.position.x=0;if(horizontal){const h=new THREE.Group();h.add(f);h.rotation.x=Math.PI/2;t.add(h)}else t.add(f)}return t}
function fish(o){const g=new THREE.Group(),m=STD(o.color,{roughness:.45});const body=ell(1,o.len,o.h,o.w,m);g.add(body);
 if(o.belly){const b=ell(1,o.len*.92,o.h*.8,o.w*.95,STD(o.belly));b.position.y=-o.h*.22;g.add(b)}
 if(o.stripes)for(const x of o.stripes){const s=ell(1,.09*o.len,o.h*1.03,o.w*1.03,STD('#ffffff'));s.position.x=x*o.len;g.add(s)}
 const tail=new THREE.Group();tail.position.x=-o.len*.92;tail.add(tailFork(o.h*(o.tail||1.6),STD(o.tailColor||o.color),o.mammal));g.add(tail);
 if(o.dorsal){const d=fin(o.len*.35,o.h*o.dorsal,m);d.position.set(0,o.h*.85,0);g.add(d)}
 const pecs=[];for(const s of[1,-1]){const p=fin(o.len*.25,o.h*.9,m);p.rotation.set(s*1.9,0,-2.2);p.position.set(o.len*.25,-o.h*.4,s*o.w*.7);g.add(p);pecs.push(p)}
 if(o.beak){const b=ell(1,o.len*.25,o.h*.25,o.w*.3,m);b.position.x=o.len*1.0;b.position.y=-o.h*.15;g.add(b)}
 eyes(g,o.len*.72,o.h*.2,o.w*.62,o.eye||o.h*.13);
 return{g,anim:(t,sp)=>{const a=Math.sin(t*o.wag*(.6+sp));if(o.mammal)tail.rotation.z=a*.35;else tail.rotation.y=a*.45;body.rotation.y=o.mammal?0:-a*.05;pecs.forEach((p,i)=>p.rotation.x=(i?-1.9:1.9)+a*.2)}}}
const B={
shark:()=>fish({len:2.2,h:.5,w:.48,color:'#6f8fa6',belly:'#eef3f6',dorsal:1.6,tail:2.2,wag:5}),
whale:()=>fish({len:4.6,h:1.25,w:1.2,color:'#3d5f8f',belly:'#c9d6e6',dorsal:.4,tail:1.5,wag:1.6,mammal:1,eye:.13}),
dolphin:()=>fish({len:1.6,h:.38,w:.36,color:'#7c9cbf',belly:'#e8eef5',dorsal:1.5,tail:1.6,wag:5,mammal:1,beak:1,eye:.06}),
clownfish:()=>fish({len:.65,h:.37,w:.23,color:'#ff7b00',stripes:[.55,0,-.55],tail:1.2,wag:12,tailColor:'#ff8f1f',dorsal:.9,eye:.05}),
turtle(){const g=new THREE.Group(),skin=STD('#6fbf8e'),shell=new THREE.Mesh(new THREE.IcosahedronGeometry(1,1),STD('#2e5e3e',{flatShading:true,roughness:.7}));shell.scale.set(1.2,.42,.95);shell.position.y=.1;g.add(shell);
 const under=ell(1,1.1,.22,.85,STD('#d8c48a'));g.add(under);const head=ell(.35,1.2,.9,.9,skin);head.position.set(1.35,.12,0);g.add(head);eyes(g,1.6,.25,.2,.07);
 const fl=[];[[.6,1],[.6,-1],[-.75,1],[-.75,-1]].forEach(([x,s],i)=>{const p=new THREE.Group();p.position.set(x,0,s*.8);const f=ell(1,i<2?.65:.35,.07,.25,skin);f.position.set(i<2?.2:-.15,0,s*.3);f.rotation.y=s*(i<2?-.5:.4);p.add(f);g.add(p);fl.push(p)});
 return{g,anim:t=>{fl.forEach((p,i)=>p.rotation.x=(i%2?-1:1)*Math.sin(t*2.2+(i<2?0:1.5))*.5)}}},
octopus(){const g=new THREE.Group(),m=STD('#b04fc9',{roughness:.5}),head=ell(.75,1,1.25,1,m);head.position.y=1.2;g.add(head);eyes(g,.62,1.05,.32,.14);
 const arms=[],segG=new THREE.CylinderGeometry(.13,.16,.42,6);segG.translate(0,-.21,0);
 for(let a=0;a<8;a++){let p=new THREE.Group();const ang=a/8*Math.PI*2;p.position.set(Math.cos(ang)*.45,.7,Math.sin(ang)*.45);p.rotation.set(Math.sin(ang)*.8,0,-Math.cos(ang)*.8);g.add(p);const ch=[];
  for(let k=0;k<6;k++){const s=new THREE.Mesh(segG,m);s.scale.setScalar(1-k*.12);if(k)s.position.y=-.42;p.add(s);ch.push(s);p=s}arms.push(ch)}
 return{g,upright:1,anim:t=>{arms.forEach((ch,a)=>ch.forEach((s,k)=>{s.rotation.x=Math.sin(t*2+a+k*.6)*.25;s.rotation.z=Math.cos(t*1.7+a*1.3+k*.5)*.2}));head.scale.set(1,1.25+Math.sin(t*2)*.04,1)}}},
jellyfish(){const g=new THREE.Group(),m=STD('#ff9ed8',{transparent:true,opacity:.6,emissive:'#ff5fbf',emissiveIntensity:.7,side:THREE.DoubleSide,roughness:.2});
 const bell=new THREE.Mesh(new THREE.SphereGeometry(.8,16,8,0,Math.PI*2,0,Math.PI/2),m);g.add(bell);const tm=new THREE.MeshBasicMaterial({color:'#ffc4ea',transparent:true,opacity:.55});
 const ts=[],sg=new THREE.CylinderGeometry(.025,.03,.5,4);sg.translate(0,-.25,0);for(let a=0;a<10;a++){let p=new THREE.Group();const ang=a/10*Math.PI*2;p.position.set(Math.cos(ang)*.55,0,Math.sin(ang)*.55);g.add(p);const ch=[];
  for(let k=0;k<5;k++){const s=new THREE.Mesh(sg,tm);if(k)s.position.y=-.5;p.add(s);ch.push(s);p=s}ts.push(ch)}
 return{g,upright:1,jelly:1,anim:t=>{const q=Math.sin(t*2.5);bell.scale.set(1+q*.12,1-q*.15,1+q*.12);ts.forEach((ch,a)=>ch.forEach((s,k)=>s.rotation.x=Math.sin(t*2.5-k*.8+a)*.25))}}},
seahorse(){const g=new THREE.Group(),m=STD('#ffb22e',{roughness:.5});const pts=[[0,1.2],[.18,.95],[.15,.6],[0,.3],[-.08,0],[0,-.3],[.15,-.5],[.12,-.7],[-.05,-.75]],rs=[.2,.24,.27,.26,.22,.16,.11,.08,.06];
 const curve=new THREE.CatmullRomCurve3(pts.map(([x,y])=>new THREE.Vector3(x,y,0)));for(let i=0;i<=16;i++){const v=curve.getPoint(i/16),r=rs[Math.min(8,Math.round(i/2))];const s=new THREE.Mesh(new THREE.SphereGeometry(r,10,8),m);s.position.copy(v);g.add(s)}
 const sn=new THREE.Mesh(new THREE.CylinderGeometry(.05,.08,.4,8),m);sn.rotation.z=Math.PI/2.4;sn.position.set(.35,1.12,0);g.add(sn);eyes(g,.12,1.25,.12,.06);
 const df=fin(.3,.35,STD('#ffd27a'));df.position.set(-.2,.25,0);df.rotation.z=1.8;g.add(df);g.scale.setScalar(.9);
 return{g,upright:1,anim:t=>{df.rotation.y=Math.sin(t*14)*.6;g.rotation.z=Math.sin(t*1.2)*.08}}},
crab(){const g=new THREE.Group(),m=STD('#e2412f',{roughness:.5});const body=ell(.6,1,.45,.75,m);body.position.y=.4;g.add(body);
 const legs=[],lg=new THREE.CylinderGeometry(.05,.04,.6,5);lg.translate(0,-.3,0);for(const s of[1,-1])for(let i=0;i<3;i++){const l=new THREE.Mesh(lg,m);l.position.set(-.3+i*.3,.38,s*.38);l.rotation.x=s*1.1;g.add(l);legs.push(l)}
 const claws=[];for(const s of[1,-1]){const c=new THREE.Group();c.position.set(.55,.45,s*.4);const a=ell(.12,1.5,1,1,m);a.position.x=.15;c.add(a);const p=ell(.18,1.4,.8,.8,m);p.position.x=.4;c.add(p);g.add(c);claws.push(c)}
 for(const s of[1,-1]){const st=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,.25,4),m);st.position.set(.35,.72,s*.12);g.add(st)}eyes(g,.35,.86,.12,.06);
 return{g,floor:1,upright:1,anim:t=>{legs.forEach((l,i)=>l.rotation.z=Math.sin(t*9+i)*.35);claws.forEach((c,i)=>c.rotation.y=(i?1:-1)*(.3+Math.sin(t*3)*.2))}}},
starfish(){const g=new THREE.Group(),m=STD('#ff7a2e',{roughness:.7});g.add(ell(.25,1,.5,1,m));const arms=[];
 for(let i=0;i<5;i++){const a=new THREE.Group();a.rotation.y=i/5*Math.PI*2;const c=new THREE.Mesh(new THREE.ConeGeometry(.18,.75,6),m);c.rotation.z=-Math.PI/2;c.position.x=.4;c.scale.z=.5;a.add(c);
  const dots=new THREE.Mesh(new THREE.SphereGeometry(.05,6,4),STD('#ffd27a'));dots.position.set(.35,.06,0);a.add(dots);g.add(a);arms.push(a)}
 return{g,floor:1,upright:1,slow:1,anim:t=>arms.forEach((a,i)=>a.rotation.z=Math.sin(t+i)*.12)}}
};
// ---------- Merpeople ----------
const SKIN=['#f1c27d','#e0ac69','#c68642','#8d5524','#ffdbac'];
function nameTag(text){const c=document.createElement('canvas');c.width=256;c.height=72;const g=c.getContext('2d');g.font='bold 40px "Comic Sans MS",sans-serif';const w=Math.min(250,g.measureText(text).width+36);
 g.fillStyle='rgba(255,255,255,.95)';g.beginPath();g.roundRect((256-w)/2,6,w,60,30);g.fill();g.fillStyle='#023e8a';g.textAlign='center';g.textBaseline='middle';g.fillText(text,128,38);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:false,fog:false}));s.scale.set(2,.56,1);s.renderOrder=10;return s}
function merperson(sf){const g=new THREE.Group(),kind=sf.kind||'mermaid',tc=sf.tail||'#2ec4b6';const skin=STD(SKIN[(sf.id.charCodeAt(0)||0)%5],{roughness:.6});
 const tailM=STD(tc,{roughness:.25,metalness:.45}),hairM=STD(kind==='mermaid'?'#a8326e':'#5a3a1a',{roughness:.8});
 const torso=ell(.35,.8,1.25,.65,skin);torso.position.y=.15;g.add(torso);
 if(kind==='mermaid')for(const s of[1,-1]){const sh=ell(.13,1,.9,.6,STD('#c77dff',{metalness:.3}));sh.position.set(.18,.3,s*.12);g.add(sh)}
 else{const belt=ell(.36,.82,.3,.67,tailM);belt.position.y=-.2;g.add(belt)}
 const head=new THREE.Group();head.position.y=.95;g.add(head);head.add(ell(.42,1,1.08,1,skin));
 const tex=new THREE.TextureLoader().load(sf.img);tex.colorSpace=THREE.SRGBColorSpace;
 const face=new THREE.Mesh(new THREE.CircleGeometry(.4,24),new THREE.MeshBasicMaterial({map:tex,fog:false}));head.add(face);
 const ring=new THREE.Mesh(new THREE.TorusGeometry(.41,.045,6,24),STD('#ffd60a',{metalness:.5,roughness:.3}));face.add(ring);
 const hair=ell(.46,1,1,1,hairM,[14,10]);hair.position.set(-.06,.06,0);head.add(hair);
 if(kind==='mermaid'){const lh=ell(.3,1.2,2,.9,hairM,[10,8]);lh.position.set(-.3,-.45,0);head.add(lh)}
 if(kind==='merman'){const cr=new THREE.Mesh(new THREE.ConeGeometry(.08,.3,4),STD('#ffd60a',{metalness:.6}));cr.position.y=.55;head.add(cr)}
 const arms=[];for(const s of[1,-1]){const a=new THREE.Group();a.position.set(0,.5,s*.25);const l=new THREE.Mesh(new THREE.CylinderGeometry(.07,.06,.7,6),skin);l.position.y=-.35;a.add(l);a.rotation.x=s*.6;g.add(a);arms.push(a)}
 const segs=[];let p=new THREE.Group();p.position.y=-.3;g.add(p);for(let k=0;k<6;k++){const s=new THREE.Group();if(k)s.position.y=-.32;p.add(s);const m=ell(.3*(1-k*.12),1,1.2,1,tailM,[12,8]);m.position.y=-.16;s.add(m);segs.push(s);p=s}
 const fl=new THREE.Group();fl.position.y=-.35;p.add(fl);for(const s of[1,-1]){const f=fin(.35,.55,STD(tc,{metalness:.4,roughness:.3,side:THREE.DoubleSide}));f.rotation.z=Math.PI+s*.6;f.scale.z=4;fl.add(f)}
 const tag=nameTag(sf.name||'Diver');tag.position.y=1.75;g.add(tag);if(!sf.name)tag.visible=false;
 const body=new THREE.Group();body.add(g);g.rotation.z=-1.1;body.scale.setScalar(1.45);
 return{g:body,merp:1,face,anim:(t)=>{segs.forEach((s,k)=>s.rotation.z=Math.sin(t*4-k*.7)*.22);arms.forEach((a,i)=>a.rotation.z=Math.sin(t*3+i)*.4);
  face.position.set(0,0,0);face.lookAt(camera.position);face.translateZ(.52);tag.position.set(0,1.75,0);g.rotation.z=-1.1+Math.sin(t*2)*.08}}}
// ---------- Swimming ----------
let things=[],uid=0;const BOUND={x:24,y0:1.5,y1:13,z0:-18,z1:6};
const hitMat=new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false});
function addThing(o,meta){o.id=++uid;Object.assign(o,meta);const r=o.radius||1.2;const hit=new THREE.Mesh(new THREE.SphereGeometry(r,8,6),hitMat);o.g.add(hit);hit.userData.thing=o;
 o.pos=new THREE.Vector3(rnd(-BOUND.x,BOUND.x),rnd(BOUND.y0+1,BOUND.y1-2),rnd(BOUND.z0,BOUND.z1));o.vel=new THREE.Vector3(rnd(-1,1),0,rnd(-1,1)).normalize().multiplyScalar(o.speed);o.tgt=newTarget(o);o.ph=rnd(0,6);
 if(o.floor){o.pos.y=fy(o.pos.x,o.pos.z)}o.g.position.copy(o.pos);scene.add(o.g);things.push(o);refreshSel();return o}
function newTarget(o){const v=new THREE.Vector3(rnd(-BOUND.x,BOUND.x),rnd(BOUND.y0+o.lift,BOUND.y1-o.lift),rnd(BOUND.z0,BOUND.z1));if(o.floor){v.y=0;v.z=rnd(-10,6);v.x=rnd(-14,14)}return v}
const SPEC={shark:{speed:3,radius:2.2,lift:3},whale:{speed:1.6,radius:4.2,lift:5},dolphin:{speed:3.6,radius:1.7,lift:3},clownfish:{speed:2,radius:.8,lift:1},turtle:{speed:1.3,radius:1.6,lift:2},
 octopus:{speed:.7,radius:1.5,lift:1},jellyfish:{speed:.4,radius:1.3,lift:2},seahorse:{speed:.45,radius:.9,lift:1},crab:{speed:.8,radius:.9,lift:0},starfish:{speed:.12,radius:.9,lift:0}};
function spawn(type){const b=B[type]();return addThing(b,{type,...SPEC[type]})}
function spawnSelfie(sf){if(things.some(t=>t.selfie&&t.selfie.id===sf.id))return;const o=merperson(sf);const t=addThing(o,{selfie:sf,speed:1.6,radius:1.4,lift:2});t.pos.z=rnd(-6,6);
 const ss=things.filter(t=>t.selfie).sort((a,b)=>a.selfie.t-b.selfie.t);while(ss.length>MAX_SELFIES)kill(ss.shift());refreshSel();return t}
function kill(t){scene.remove(t.g);t.g.traverse(m=>{if(m.material&&m.material.map&&t.selfie)m.material.map.dispose()});things=things.filter(x=>x!==t);if(sel===t)sel=null;refreshSel()}
const tmp=new THREE.Vector3(),up=new THREE.Vector3(0,1,0),qa=new THREE.Quaternion(),mtx=new THREE.Matrix4();
function step(o,dt,t){tmp.subVectors(o.tgt,o.pos);if(o.floor)tmp.y=0;if(tmp.length()<1.5)o.tgt=newTarget(o);
 tmp.normalize().multiplyScalar(o.speed);o.vel.lerp(tmp,Math.min(1,dt*.6));o.pos.addScaledVector(o.vel,dt);
 if(o.floor)o.pos.y=fy(o.pos.x,o.pos.z)-.05;
 o.g.position.copy(o.pos);
 if(o.jelly)o.g.position.y+=Math.sin(t*1.2+o.ph)*.4;else if(!o.floor)o.g.position.y+=Math.sin(t*1.5+o.ph)*.15;
 const yaw=Math.atan2(-o.vel.z,o.vel.x);
 if(o.type==='crab')o.g.rotation.y=yaw+Math.PI/2;else if(o.slow)o.g.rotation.y+=dt*.05;
 else if(o.upright&&!o.merp){o.g.rotation.y+=((yaw-o.g.rotation.y+Math.PI*3)%(Math.PI*2)-Math.PI)*dt*.8}
 else{mtx.lookAt(new THREE.Vector3(),new THREE.Vector3(-o.vel.x,-o.vel.y*.6,-o.vel.z),up);qa.setFromRotationMatrix(mtx).multiply(new THREE.Quaternion().setFromAxisAngle(up,-Math.PI/2));o.g.quaternion.slerp(qa,Math.min(1,dt*2))}
 o.anim(t+o.ph,o.vel.length()/o.speed)}
// highlight ring
const hl=new THREE.Sprite(new THREE.SpriteMaterial({map:(()=>{const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');const gr=g.createRadialGradient(64,64,30,64,64,62);gr.addColorStop(0,'rgba(255,240,0,0)');gr.addColorStop(.7,'rgba(255,240,0,.9)');gr.addColorStop(1,'rgba(255,240,0,0)');g.fillStyle=gr;g.fillRect(0,0,128,128);return new THREE.CanvasTexture(c)})(),transparent:true,depthTest:false,blending:THREE.AdditiveBlending,fog:false}));
hl.visible=false;hl.renderOrder=20;scene.add(hl);let sel=null,selUntil=0;
function highlight(o,ms=6000){sel=o;selUntil=performance.now()+ms}
// ---------- Loop ----------
let lastT=performance.now(),W=0,H=0;
function resize(){W=innerWidth;H=innerHeight;renderer.setSize(W,H,false);camera.aspect=W/H;camera.fov=W/H<1?70:55;camera.updateProjectionMatrix()}addEventListener('resize',resize);resize();
const look=new THREE.Vector3();
function frame(now){const dt=Math.min(.05,(now-lastT)/1000);lastT=now;const t=now/1000;uT.value=t;
 camera.position.set(Math.sin(t*.05)*4,6.5+Math.sin(t*.09)*.8,24+Math.sin(t*.07)*1.5);look.set(Math.sin(t*.04)*2,5.5,-4);camera.lookAt(look);
 for(const o of things)step(o,dt,t);
 kelp.forEach(k=>k.segs.forEach((s,i)=>{s.rotation.z=Math.sin(t*1.1+k.ph+i*.5)*.12;s.rotation.x=Math.cos(t*.8+k.ph+i*.4)*.08}));
 rays.forEach(r=>{r.m.material.opacity=.1+.1*Math.sin(t*.4+r.ph);r.m.position.x+=Math.sin(t*.1+r.ph)*.004});
 const pa=pg.attributes.position.array;for(let i=0;i<NP;i++){pa[i*3+1]+=dt*.08;if(pa[i*3+1]>22)pa[i*3+1]=0}pg.attributes.position.needsUpdate=true;parts.rotation.y=t*.005;
 bubs.forEach((b,i)=>{b.y+=b.v*dt;if(b.y>22){b.y=0;b.x=rnd(-25,25)}dm.position.set(b.x+Math.sin(t*2+b.ph)*.2,b.y,b.z);dm.scale.setScalar(b.s*(1+b.y*.02));dm.updateMatrix();bub.setMatrixAt(i,dm.matrix)});bub.instanceMatrix.needsUpdate=true;
 if(sel&&now<selUntil){hl.visible=true;hl.position.copy(sel.g.position);const s=(sel.radius||1)*3*(1+.08*Math.sin(t*6));hl.scale.set(s,s,1)}else hl.visible=false;
 renderer.render(scene,camera);requestAnimationFrame(frame)}
// ---------- Picking ----------
const ray=new THREE.Raycaster(),ndc=new THREE.Vector2();let down=null;
canvas.addEventListener('pointerdown',e=>down={x:e.clientX,y:e.clientY});
canvas.addEventListener('pointerup',e=>{if(!down||Math.hypot(e.clientX-down.x,e.clientY-down.y)>15)return;ndc.set(e.clientX/W*2-1,-(e.clientY/H)*2+1);ray.setFromCamera(ndc,camera);
 const hits=ray.intersectObjects(things.map(t=>t.g),true);const h=hits.find(h=>h.object.userData.thing)||hits.find(h=>{let o=h.object;while(o&&!things.some(t=>t.g===o))o=o.parent;return o});
 if(!h)return;let th=h.object.userData.thing;if(!th){let o=h.object;while(!things.some(t=>t.g===o))o=o.parent;th=things.find(t=>t.g===o)}
 highlight(th,3000);if(th.type)showInfo(th.type);else toast('👋 Hi '+(th.selfie.name||'diver')+'!')});
// ---------- UI ----------
const pick=$('pick'),selEl=$('sel');Object.entries(INFO).forEach(([k,c])=>pick.add(new Option(c.e+' '+c.n,k)));
function refreshSel(){const v=selEl.value;selEl.innerHTML='';selEl.add(new Option('🔍 Find a swimmer',''));const n={};
 things.forEach(t=>{const lab=t.selfie?(t.selfie.kind==='merman'?'🧜‍♂️ ':'🧜‍♀️ ')+(t.selfie.name||'Diver'):INFO[t.type].e+' '+INFO[t.type].n;n[lab]=(n[lab]||0)+1;selEl.add(new Option(lab+(n[lab]>1?' '+n[lab]:''),t.id))});selEl.value=v}
selEl.onchange=()=>{const t=things.find(t=>t.id==selEl.value);if(!t)return;highlight(t);if(t.type)showInfo(t.type)};
$('add').onclick=()=>{const t=spawn(pick.value);highlight(t,3000);toast(INFO[pick.value].e+' A '+INFO[pick.value].n+' joined!')};
$('rm').onclick=()=>things.filter(t=>t.type).forEach(kill);
$('reset').onclick=()=>{things.filter(t=>t.type).forEach(kill);DEFAULT.forEach(spawn)};
function showInfo(k){const c=INFO[k];$('infoc').innerHTML=`<div style="font-size:90px;line-height:1">${c.e}</div><h2>${c.n}</h2><ul>${c.facts.map(f=>`<li>${f}</li>`).join('')}</ul>
<p>🍽️ <b>Eats:</b> ${c.eats}</p><p>🏠 <b>Lives:</b> ${c.lives}</p><p>📏 <b>Size:</b> ${c.size}</p><button id="cool">👍 Cool!</button>`;$('info').classList.add('on');$('cool').onclick=()=>$('info').classList.remove('on')}
document.querySelectorAll('.ov').forEach(o=>o.addEventListener('click',e=>{if(e.target===o&&o.id!=='cam')o.classList.remove('on')}));
let tt;function toast(m){const t=$('toast');t.textContent=m;t.style.display='block';clearTimeout(tt);tt=setTimeout(()=>t.style.display='none',2500)}
// ---------- Storage + pluggable sync ----------
const DB=new Promise((res,rej)=>{const r=indexedDB.open('ocean',1);r.onupgradeneeded=()=>r.result.createObjectStore('selfies',{keyPath:'id'});r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});
const store=async m=>(await DB).transaction('selfies',m).objectStore('selfies');const rq=r=>new Promise((a,b)=>{r.onsuccess=()=>a(r.result);r.onerror=()=>b(r.error)});
const Local={async all(){return rq((await store('readonly')).getAll())},async put(s){return rq((await store('readwrite')).put(s))},async del(id){return rq((await store('readwrite')).delete(id))},async clear(){return rq((await store('readwrite')).clear())}};
// Set window.OCEAN_SYNC={pull,push,clear,subscribe} before app.js to share selfies across devices.
const Sync=window.OCEAN_SYNC||null;async function trySync(fn){if(!Sync||!navigator.onLine)return;try{return await fn(Sync)}catch(e){}}
async function loadSelfies(){let list=[];try{list=await Local.all()}catch(e){}const remote=await trySync(s=>s.pull());
 if(remote)for(const r of remote)if(!list.some(l=>l.id===r.id)){list.push(r);Local.put(r).catch(()=>{})}
 list.sort((a,b)=>a.t-b.t);list.slice(0,-MAX_SELFIES).forEach(s=>Local.del(s.id).catch(()=>{}));list.slice(-MAX_SELFIES).forEach(spawnSelfie)}
trySync(s=>s.subscribe&&s.subscribe(r=>{Local.put(r).catch(()=>{});spawnSelfie(r)}));
addEventListener('online',()=>trySync(async s=>{for(const x of await Local.all())await s.push(x)}));
// ---------- Camera ----------
const TAILS=['#2ec4b6','#ff70a6','#7b2cbf','#ffd60a','#3a86ff','#ff5400'];let kind='mermaid',tail=TAILS[0];
TAILS.forEach((c,i)=>{const b=document.createElement('button');b.className='sw'+(i?'':' on');b.style.background=c;b.setAttribute('aria-label','Tail colour');b.onclick=()=>{tail=c;document.querySelectorAll('.sw').forEach(x=>x.classList.toggle('on',x===b))};$('tails').appendChild(b)});
document.querySelectorAll('#kind button').forEach(b=>b.onclick=()=>{kind=b.dataset.k;document.querySelectorAll('#kind button').forEach(x=>x.classList.toggle('on',x===b))});
let stream=null;const vid=$('vid'),prev=$('prev');
function camState(st,msg){$('camv').style.display=st==='live'?'':'none';$('camp').style.display=st==='prev'?'':'none';$('camerr').style.display=st==='err'?'':'none';if(msg)$('camerr').textContent=msg}
$('swim').onclick=async()=>{$('cam').classList.add('on');camState('live');
 if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){camState('err','😢 This device can\'t use the camera here. You can still tap the sea creatures!');return}
 try{stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:640},height:{ideal:640}},audio:false});vid.srcObject=stream;await vid.play().catch(()=>{})}
 catch(e){camState('err','😢 We couldn\'t open the camera. Ask a grown-up to allow camera access in Settings › Safari › Camera. You can still explore the ocean!')}};
function stopCam(){if(stream){stream.getTracks().forEach(t=>t.stop());stream=null}}
$('camx').onclick=()=>{stopCam();$('cam').classList.remove('on')};
$('shoot').onclick=()=>{const v=vid,s=Math.min(v.videoWidth,v.videoHeight);if(!s)return toast('Camera is waking up… try again!');const g=prev.getContext('2d');
 g.save();g.clearRect(0,0,240,240);g.beginPath();g.arc(120,120,120,0,7);g.clip();g.translate(240,0);g.scale(-1,1);g.drawImage(v,(v.videoWidth-s)/2,(v.videoHeight-s)/2,s,s,0,0,240,240);g.restore();camState('prev')};
$('retake').onclick=()=>camState('live');
$('join').onclick=()=>{const s={id:Date.now().toString(36)+Math.random().toString(36).slice(2,7),t:Date.now(),name:$('nm').value.trim().slice(0,14),img:prev.toDataURL('image/jpeg',.7),kind,tail};
 Local.put(s).catch(()=>{});trySync(x=>x.push(s));stopCam();$('cam').classList.remove('on');$('nm').value='';const t=spawnSelfie(s);if(t)highlight(t,4000);toast((kind==='merman'?'🧜‍♂️':'🧜‍♀️')+' Welcome to the ocean!')};
// ---------- Teacher ----------
$('tchr').onclick=()=>{$('pin').value='';$('tov').classList.add('on')};$('tx').onclick=()=>$('tov').classList.remove('on');
$('clr').onclick=async()=>{if($('pin').value!==TEACHER_PIN)return toast('Wrong PIN');await Local.clear().catch(()=>{});trySync(s=>s.clear());things.filter(t=>t.selfie).forEach(kill);$('tov').classList.remove('on');toast('All selfies cleared')};
// ---------- Snapshot ----------
$('snap').onclick=()=>{renderer.render(scene,camera);const c=document.createElement('canvas');c.width=canvas.width;c.height=canvas.height;const g=c.getContext('2d');g.drawImage(canvas,0,0);
 const k=c.width/W;g.textAlign='center';g.fillStyle='#fff';g.shadowColor='#023e8a';g.shadowBlur=8*k;g.font=`bold ${44*k}px sans-serif`;g.fillText("Yusra's Diorama",c.width/2,60*k);g.font=`${24*k}px sans-serif`;g.fillText('Teacher: Ms. Wendy',c.width/2,94*k);
 c.toBlob(b=>{const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='yusras-diorama-'+Date.now()+'.png';document.body.appendChild(a);a.click();a.remove();toast('📸 Snapshot saved!')},'image/png')};
// ---------- Start ----------
DEFAULT.forEach(spawn);loadSelfies();requestAnimationFrame(frame);
window.__ocean={things,spawnSelfie,renderer};
if('serviceWorker' in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('sw.js').catch(()=>{});
