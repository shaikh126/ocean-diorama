'use strict';
const TEACHER_PIN='1234', MAX_SELFIES=30;
// ---- Creature art (self-contained SVG, facing right) ----
const S=(vb,b)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">${b}</svg>`;
const eye=(x,y,r=4)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="#fff"/><circle cx="${x+1}" cy="${y}" r="${r/2}" fill="#000"/>`;
const C={
shark:{n:'Shark',w:170,h:90,sp:1.3,y:[.15,.55],art:S('0 0 200 100',`<path d="M10 50 L-0 20 L30 45Z" fill="#6c8ea4"/><path d="M20 50 Q80 10 190 50 Q80 85 20 50Z" fill="#7fa6bf"/><path d="M40 55 Q110 75 185 52 Q110 85 40 55Z" fill="#e8f1f5"/><path d="M90 25 L105 0 L120 28Z" fill="#6c8ea4"/><path d="M100 62 L90 85 L120 65Z" fill="#6c8ea4"/>${eye(160,42,5)}<path d="M165 58 l4 4 4-4 4 4" stroke="#333" fill="none" stroke-width="2"/>`),
 facts:['Sharks have been around since before the dinosaurs!','They can grow thousands of teeth in their life.','Sharks have no bones, just bendy cartilage like your ears.'],eats:'Fish, seals and squid',lives:'Oceans all over the world',size:'Most are as long as a car'},
octopus:{n:'Octopus',w:110,h:110,sp:.5,y:[.4,.75],art:S('0 0 100 100',`${[15,30,45,60,75,90].map((x,i)=>`<path d="M${40+i*4} 55 Q${x} 80 ${x-5+i*2} 98" stroke="#c77dff" stroke-width="9" fill="none" stroke-linecap="round"/>`).join('')}<ellipse cx="52" cy="38" rx="32" ry="30" fill="#c77dff"/>${eye(42,40,6)}${eye(62,40,6)}<path d="M45 55 Q52 61 59 55" stroke="#5a189a" stroke-width="3" fill="none"/>`),
 facts:['An octopus has 8 arms and 3 hearts!','It can change colour to hide.','Its blood is blue.'],eats:'Crabs, shrimp and clams',lives:'Rocky sea floors and coral reefs',size:'From as small as a grape to bigger than a grown-up'},
turtle:{n:'Sea Turtle',w:130,h:90,sp:.6,y:[.2,.6],art:S('0 0 140 90',`<ellipse cx="40" cy="22" rx="20" ry="8" fill="#52b788" transform="rotate(-30 40 22)"/><ellipse cx="40" cy="68" rx="20" ry="8" fill="#52b788" transform="rotate(30 40 68)"/><ellipse cx="95" cy="20" rx="22" ry="9" fill="#52b788" transform="rotate(-35 95 20)"/><ellipse cx="95" cy="70" rx="22" ry="9" fill="#52b788" transform="rotate(35 95 70)"/><circle cx="122" cy="45" r="14" fill="#74c69d"/>${eye(127,41,4)}<ellipse cx="68" cy="45" rx="45" ry="30" fill="#2d6a4f"/><path d="M45 30 L68 45 L91 30 M45 60 L68 45 L91 60 M68 17 V73" stroke="#95d5b2" stroke-width="3" fill="none"/>`),
 facts:['Sea turtles can hold their breath for hours while resting.','Mum turtles lay eggs on sandy beaches.','Some turtles are over 100 years old!'],eats:'Seagrass, jellyfish and sponges',lives:'Warm oceans and beaches',size:'About as long as a bathtub'},
clownfish:{n:'Clownfish',w:80,h:50,sp:1.1,y:[.3,.8],art:S('0 0 100 60',`<path d="M10 30 L0 10 L0 50Z" fill="#ff7b00"/><ellipse cx="52" cy="30" rx="42" ry="24" fill="#ff7b00"/><path d="M28 9 Q32 30 28 51 M54 6 Q60 30 54 54 M78 12 Q82 30 78 48" stroke="#fff" stroke-width="8" fill="none"/><path d="M28 9 Q32 30 28 51 M54 6 Q60 30 54 54" stroke="#000" stroke-width="1.5" fill="none" opacity=".5"/>${eye(84,25,5)}`),
 facts:['Clownfish live inside stinging sea anemones, but do not get stung!','They are all born as boys.','Nemo is a clownfish!'],eats:'Tiny plankton and algae',lives:'Warm coral reefs',size:'As small as your hand'},
seahorse:{n:'Seahorse',w:55,h:100,sp:.3,y:[.35,.75],art:S('0 0 60 110',`<path d="M30 15 Q50 15 48 35 Q45 55 35 70 Q25 90 40 100 Q30 108 22 98 Q15 80 25 62 Q30 50 22 40 Q12 25 30 15Z" fill="#ffb703"/><path d="M45 22 L60 26 L46 32Z" fill="#ffb703"/><path d="M20 45 Q8 50 18 58" fill="#fb8500"/>${eye(38,24,4)}<path d="M26 14 l4-8 4 8" fill="#fb8500"/>`),
 facts:['Seahorse dads carry the babies!','They swim standing up.','Their eyes can look two ways at once.'],eats:'Tiny shrimp',lives:'Seagrass and coral reefs',size:'About as tall as your finger'},
jellyfish:{n:'Jellyfish',w:80,h:110,sp:.25,y:[.1,.5],art:S('0 0 80 110',`${[15,28,40,52,65].map(x=>`<path d="M${x} 45 Q${x-8} 70 ${x} 85 Q${x+8} 100 ${x} 110" stroke="#ffafcc" stroke-width="4" fill="none" opacity=".85"/>`).join('')}<path d="M5 48 Q5 5 40 5 Q75 5 75 48 Q40 40 5 48Z" fill="#ffc8dd" opacity=".9"/>${eye(30,30,3)}${eye(50,30,3)}`),
 facts:['Jellyfish have no brain, no heart and no bones!','They have been around for 500 million years.','Some jellyfish glow in the dark.'],eats:'Tiny fish and plankton',lives:'Every ocean in the world',size:'From a pea to as wide as a car'},
dolphin:{n:'Dolphin',w:150,h:80,sp:1.5,y:[.1,.45],art:S('0 0 180 90',`<path d="M10 45 L0 25 L22 42 L0 65Z" fill="#5e81ac"/><path d="M15 45 Q70 10 150 35 L178 42 L150 50 Q90 75 15 45Z" fill="#81a1c1"/><path d="M40 52 Q100 68 150 50 Q100 60 40 52Z" fill="#e5e9f0"/><path d="M85 25 L95 5 L110 27Z" fill="#5e81ac"/><path d="M95 55 L88 75 L112 58Z" fill="#5e81ac"/>${eye(140,38,4)}`),
 facts:['Dolphins talk with clicks and whistles.','They breathe air through a hole on their head.','Dolphins are super smart and love to play!'],eats:'Fish and squid',lives:'Oceans and some rivers',size:'About as long as a sofa'},
crab:{n:'Crab',w:90,h:60,sp:.7,y:[.86,.9],floor:1,art:S('0 0 100 70',`${[0,1,2].map(i=>`<path d="M${30-i*6} 45 l-15 ${8+i*6}" stroke="#d62828" stroke-width="5" stroke-linecap="round"/><path d="M${70+i*6} 45 l15 ${8+i*6}" stroke="#d62828" stroke-width="5" stroke-linecap="round"/>`).join('')}<ellipse cx="50" cy="42" rx="30" ry="20" fill="#e63946"/><circle cx="12" cy="18" r="11" fill="#e63946"/><circle cx="88" cy="18" r="11" fill="#e63946"/><path d="M3 12 l10 6" stroke="#fff" stroke-width="3"/><path d="M97 12 l-10 6" stroke="#fff" stroke-width="3"/><path d="M40 25 v-10 M60 25 v-10" stroke="#d62828" stroke-width="3"/>${eye(40,13,5)}${eye(60,13,5)}<path d="M42 48 Q50 54 58 48" stroke="#600" stroke-width="2" fill="none"/>`),
 facts:['Crabs walk sideways!','They have their skeleton on the outside.','Crabs can grow back a lost claw.'],eats:'Almost anything: algae, worms, leftovers',lives:'Beaches, rocks and the sea floor',size:'From a coin to as wide as a car (Japanese spider crab)'},
starfish:{n:'Starfish',w:70,h:70,sp:.15,y:[.87,.9],floor:1,art:S('0 0 100 100',`<path d="M50 3 L62 38 L98 38 L69 60 L80 96 L50 74 L20 96 L31 60 L2 38 L38 38Z" fill="#f77f00" stroke="#d62828" stroke-width="3" stroke-linejoin="round"/>${[[50,25],[72,45],[63,72],[37,72],[28,45]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="3" fill="#fcbf49"/>`).join('')}${eye(42,48,4)}${eye(58,48,4)}<path d="M44 58 Q50 63 56 58" stroke="#600" stroke-width="2" fill="none"/>`),
 facts:['A starfish has no brain and no blood!','It can grow a new arm if one breaks off.','It has an eye at the end of each arm.'],eats:'Clams, mussels and snails',lives:'Rocky sea floors and tide pools',size:'About as big as your hand'},
whale:{n:'Whale',w:260,h:130,sp:.5,y:[.08,.35],art:S('0 0 260 130',`<path d="M20 60 L0 30 L30 55 L5 90Z" fill="#3a5a8c"/><path d="M25 60 Q90 10 200 25 Q255 35 255 70 Q250 110 170 112 Q80 115 25 60Z" fill="#4a6fa5"/><path d="M110 105 Q180 100 250 78 Q245 108 170 112 Q130 114 110 105Z" fill="#cfd8e6"/><path d="M150 95 L140 125 L175 100Z" fill="#3a5a8c"/>${eye(220,55,6)}<path d="M200 10 Q205 0 210 10 M205 12 V0" stroke="#caf0f8" stroke-width="3" fill="none"/>`),
 facts:['The blue whale is the biggest animal that has ever lived!','Whales sing songs to each other.','A whale\'s heart is as big as a small car.'],eats:'Tiny krill, millions a day',lives:'All the oceans',size:'As long as 3 school buses (blue whale)'}
};
const DEFAULT=['shark','octopus','turtle','clownfish','clownfish','seahorse','jellyfish','jellyfish','dolphin','crab','starfish','whale'];
const sea=document.getElementById('sea'),$=id=>document.getElementById(id);
let W=innerWidth,H=innerHeight;addEventListener('resize',()=>{W=innerWidth;H=innerHeight});
// ---- Scenery ----
for(let i=0;i<6;i++){const r=document.createElement('div');r.className='ray';r.style.left=(i*18-5)+'%';r.style.animationDelay=(-i*1.3)+'s';sea.appendChild(r)}
const weedCols=['#2d6a4f','#40916c','#52b788','#1b4332'];
for(let i=0;i<14;i++){const h=80+Math.random()*160,d=document.createElement('div');d.className='weed';d.style.left=(i*7.3+Math.random()*3)+'%';d.style.animationDelay=(-Math.random()*3)+'s';d.style.animationDuration=(2.5+Math.random()*2)+'s';
 d.innerHTML=S(`0 0 40 ${h}`,`<path d="M20 ${h} Q5 ${h*.75} 20 ${h*.5} Q35 ${h*.25} 20 0" stroke="${weedCols[i%4]}" stroke-width="10" fill="none" stroke-linecap="round"/>`);d.style.width='40px';d.style.height=h+'px';sea.appendChild(d)}
for(let i=0;i<22;i++){const b=document.createElement('div'),s=6+Math.random()*18;b.className='bub';Object.assign(b.style,{width:s+'px',height:s+'px',left:Math.random()*100+'%',animationDuration:(6+Math.random()*8)+'s',animationDelay:(-Math.random()*12)+'s'});sea.appendChild(b)}
// ---- Swimmers ----
let things=[],uid=0;const scale=()=>Math.max(.7,Math.min(1.4,Math.min(W,H)/700));
function spawn(type,opt={}){const c=C[type],k=scale()*(opt.big||1),el=document.createElement('div');el.className='cr';el.innerHTML=c.art;
 const w=c.w*k,h=c.h*k;el.style.width=w+'px';el.style.height=h+'px';
 const t={id:++uid,type,el,w,h,x:Math.random()*(W-w),by:H*(c.y[0]+Math.random()*(c.y[1]-c.y[0])),dir:Math.random()<.5?1:-1,sp:c.sp*(.7+Math.random()*.6),ph:Math.random()*6};
 if(c.floor)t.by=H*.87-h*.6;el.onclick=e=>{e.stopPropagation();showInfo(type)};sea.appendChild(el);things.push(t);refreshSel();return t}
function spawnSelfie(s){if(things.some(t=>t.selfie&&t.selfie.id===s.id))return;const k=scale(),d=110*k,el=document.createElement('div');el.className='cr selfie';
 el.innerHTML=`<div class="face" style="background-image:url(${s.img})"></div>`+(s.name?`<div class="lbl"></div>`:'');if(s.name)el.querySelector('.lbl').textContent=s.name;
 el.style.width=d+'px';el.style.height=d+'px';const t={id:++uid,selfie:s,el,w:d,h:d,x:Math.random()*(W-d),by:H*(.15+Math.random()*.55),dir:Math.random()<.5?1:-1,sp:.6+Math.random()*.6,ph:Math.random()*6};
 el.onclick=e=>{e.stopPropagation();toast('👋 Hi '+(s.name||'diver')+'!')};sea.appendChild(el);things.push(t);
 const ss=things.filter(t=>t.selfie);if(ss.length>MAX_SELFIES){ss.sort((a,b)=>a.selfie.t-b.selfie.t).slice(0,ss.length-MAX_SELFIES).forEach(kill)}refreshSel();return t}
function kill(t){t.el.remove();things=things.filter(x=>x!==t)}
let last=performance.now();
function tick(now){const dt=Math.min(50,now-last)/16.7;last=now;
 for(const t of things){const c=t.type&&C[t.type];t.x+=t.dir*t.sp*dt*1.4;t.ph+=.03*dt;
  if(t.x>W-t.w){t.x=W-t.w;t.dir=-1}if(t.x<0){t.x=0;t.dir=1}
  const bob=c&&c.floor?0:Math.sin(t.ph)*(t.type==='jellyfish'?25:12);t.y=t.by+bob;
  const flip=t.selfie||t.type==='starfish'||t.type==='crab'||t.type==='jellyfish'||t.type==='octopus'?1:t.dir;
  const rot=t.selfie?Math.sin(t.ph*1.3)*8:t.type==='starfish'?t.ph*10:0;
  t.el.style.transform=`translate(${t.x}px,${t.y}px) scaleX(${flip}) rotate(${rot}deg)`}
 requestAnimationFrame(tick)}
requestAnimationFrame(tick);
// ---- UI ----
const pick=$('pick'),sel=$('sel');
Object.entries(C).forEach(([k,c])=>pick.add(new Option(c.n,k)));
function refreshSel(){const v=sel.value;sel.innerHTML='';sel.add(new Option('🔍 Find a swimmer','' ));
 const n={};things.forEach(t=>{const lab=t.selfie?'🤿 '+(t.selfie.name||'Diver'):C[t.type].n;n[lab]=(n[lab]||0)+1;sel.add(new Option(lab+(n[lab]>1?' '+n[lab]:''),t.id))});sel.value=v}
sel.onchange=()=>{things.forEach(t=>t.el.classList.remove('hl'));const t=things.find(t=>t.id==sel.value);if(!t)return;t.el.classList.add('hl');t.el.parentNode.appendChild(t.el);
 setTimeout(()=>t.el.classList.remove('hl'),6000);if(t.type)showInfo(t.type)};
$('add').onclick=()=>{const t=spawn(pick.value);t.el.classList.add('hl');setTimeout(()=>t.el.classList.remove('hl'),2500);toast('A '+C[pick.value].n+' joined! 🎉')};
$('rm').onclick=()=>{things.filter(t=>t.type).forEach(kill);refreshSel()};
$('reset').onclick=()=>{things.filter(t=>t.type).forEach(kill);DEFAULT.forEach(k=>spawn(k))};
function showInfo(k){const c=C[k];$('infoc').innerHTML=`<div class="art">${c.art}</div><h2>${c.n}</h2><ul>${c.facts.map(f=>`<li>${f}</li>`).join('')}</ul>
<p>🍽️ <b>Eats:</b> ${c.eats}</p><p>🏠 <b>Lives:</b> ${c.lives}</p><p>📏 <b>Size:</b> ${c.size}</p><button onclick="document.getElementById('info').classList.remove('on')">👍 Cool!</button>`;$('info').classList.add('on')}
document.querySelectorAll('.ov').forEach(o=>o.addEventListener('click',e=>{if(e.target===o&&o.id!=='cam')o.classList.remove('on')}));
let tt;function toast(m){const t=$('toast');t.textContent=m;t.style.display='block';clearTimeout(tt);tt=setTimeout(()=>t.style.display='none',2500)}
// ---- Storage (IndexedDB) ----
const DB=new Promise((res,rej)=>{const r=indexedDB.open('ocean',1);r.onupgradeneeded=()=>r.result.createObjectStore('selfies',{keyPath:'id'});r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});
const store=async m=>(await DB).transaction('selfies',m).objectStore('selfies');
const req=r=>new Promise((a,b)=>{r.onsuccess=()=>a(r.result);r.onerror=()=>b(r.error)});
const Local={async all(){return req((await store('readonly')).getAll())},async put(s){return req((await store('readwrite')).put(s))},async clear(){return req((await store('readwrite')).clear())}};
// ---- Pluggable sync layer: set window.OCEAN_SYNC = {pull():Promise<selfie[]>, push(selfie), clear(), subscribe(cb)} to share across devices ----
const Sync=window.OCEAN_SYNC||null;
async function trySync(fn){if(!Sync||!navigator.onLine)return;try{return await fn(Sync)}catch(e){/* offline/backend down: fail silently */}}
async function loadSelfies(){let list=[];try{list=await Local.all()}catch(e){}
 const remote=await trySync(s=>s.pull());if(remote)for(const r of remote){if(!list.some(l=>l.id===r.id)){list.push(r);Local.put(r).catch(()=>{})}}
 list.sort((a,b)=>a.t-b.t).slice(-MAX_SELFIES).forEach(spawnSelfie)}
trySync(s=>s.subscribe&&s.subscribe(r=>{Local.put(r).catch(()=>{});spawnSelfie(r)}));
addEventListener('online',()=>trySync(async s=>{const l=await Local.all();for(const x of l)await s.push(x)}));
// ---- Camera ----
let stream=null;const vid=$('vid'),prev=$('prev');
function camState(st,msg){$('camv').style.display=st==='live'?'':'none';$('camp').style.display=st==='prev'?'':'none';$('camerr').style.display=st==='err'?'':'none';if(msg)$('camerr').textContent=msg}
$('swim').onclick=async()=>{$('cam').classList.add('on');camState('live');
 if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){camState('err','😢 This device can\'t use the camera here. (The page must be opened over https.) You can still tap the sea creatures!');return}
 try{stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:640},height:{ideal:640}},audio:false});vid.srcObject=stream;await vid.play().catch(()=>{})}
 catch(e){camState('err','😢 We couldn\'t open the camera. Ask a grown-up to allow camera access in Settings › Safari › Camera. You can still explore the ocean!')}};
function stopCam(){if(stream){stream.getTracks().forEach(t=>t.stop());stream=null}}
$('camx').onclick=()=>{stopCam();$('cam').classList.remove('on')};
$('shoot').onclick=()=>{const v=vid,s=Math.min(v.videoWidth,v.videoHeight);if(!s)return toast('Camera is waking up… try again!');const g=prev.getContext('2d');
 g.save();g.clearRect(0,0,240,240);g.beginPath();g.arc(120,120,120,0,7);g.clip();g.translate(240,0);g.scale(-1,1);
 g.drawImage(v,(v.videoWidth-s)/2,(v.videoHeight-s)/2,s,s,0,0,240,240);g.restore();camState('prev')};
$('retake').onclick=()=>camState('live');
$('join').onclick=async()=>{const s={id:Date.now().toString(36)+Math.random().toString(36).slice(2,7),t:Date.now(),name:$('nm').value.trim().slice(0,14),img:prev.toDataURL('image/jpeg',.7)};
 Local.put(s).catch(()=>{});trySync(x=>x.push(s));stopCam();$('cam').classList.remove('on');$('nm').value='';const t=spawnSelfie(s);t.el.classList.add('hl');setTimeout(()=>t.el.classList.remove('hl'),4000);toast('🤿 Welcome to the ocean!')};
// ---- Teacher ----
$('tchr').onclick=()=>{$('pin').value='';$('tov').classList.add('on')};$('tx').onclick=()=>$('tov').classList.remove('on');
$('clr').onclick=async()=>{if($('pin').value!==TEACHER_PIN)return toast('Wrong PIN');await Local.clear().catch(()=>{});trySync(s=>s.clear());things.filter(t=>t.selfie).forEach(kill);refreshSel();$('tov').classList.remove('on');toast('All selfies cleared')};
// ---- Snapshot (PNG) ----
const imgOf=src=>new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.onerror=()=>r(null);i.src=src});
$('snap').onclick=async()=>{const cv=document.createElement('canvas'),d=Math.min(2,devicePixelRatio||1);cv.width=W*d;cv.height=H*d;const g=cv.getContext('2d');g.scale(d,d);
 const gr=g.createLinearGradient(0,0,0,H);[['0','#48cae4'],['.3','#0096c7'],['.6','#0077b6'],['1','#023e8a']].forEach(([o,c])=>gr.addColorStop(+o,c));g.fillStyle=gr;g.fillRect(0,0,W,H);
 g.fillStyle='#f6d58e';g.fillRect(0,H*.87,W,H*.13);
 for(const t of things){const ip=t.selfie?t.selfie.img:'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(C[t.type].art),i=await imgOf(ip);if(!i)continue;g.save();g.translate(t.x+t.w/2,t.y+t.h/2);
  if(t.type&&!/starfish|crab|jellyfish|octopus/.test(t.type))g.scale(t.dir,1);if(t.selfie){g.beginPath();g.arc(0,0,t.w/2,0,7);g.clip()}g.drawImage(i,-t.w/2,-t.h/2,t.w,t.h);g.restore();
  if(t.selfie&&t.selfie.name){g.font='16px sans-serif';g.fillStyle='#fff';g.textAlign='center';g.fillText(t.selfie.name,t.x+t.w/2,t.y+t.h+18)}}
 g.font='bold 30px sans-serif';g.fillStyle='#fff';g.textAlign='left';g.fillText('🌊 Our Ocean',16,40);
 cv.toBlob(b=>{const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='ocean-'+Date.now()+'.png';document.body.appendChild(a);a.click();a.remove();toast('📸 Snapshot saved!')},'image/png')};
// ---- Start ----
DEFAULT.forEach(k=>spawn(k));loadSelfies();
if('serviceWorker' in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('sw.js').catch(()=>{});
