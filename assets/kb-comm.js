/* ============================================================================
   Kongu Brilliance — Messages & Calls engine (in-portal)
   - Self-injects a "Messages" section into Student, Tutor and Admin portals
   - Parent read-only portal (sees the tutor profile + child's conversations)
   - WhatsApp-style WebRTC calls with tutor DND + ringing notification
   - Privacy: a private chat is visible ONLY to the student, their assigned
     tutor, and admin. Tutors see only their assigned students.
   - Realtime: uses Supabase realtime when kb_messages exists (run sql/messaging.sql),
     otherwise a live cross-tab bus (works on GitHub Pages with no backend change).
   ========================================================================== */
(function(){
'use strict';
const W = window;
const COLORS=['#F5C842','#00E5A0','#6366F1','#A5B4FC','#F97316','#EF4444','#22c55e','#06B6D4'];
const colorFor=id=>COLORS[[...String(id)].reduce((a,c)=>a+c.charCodeAt(0),0)%COLORS.length];
const initials=n=>String(n||'?').trim().split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase();
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmtSize=b=>b<1024?b+' B':b<1048576?(b/1024).toFixed(1)+' KB':(b/1048576).toFixed(1)+' MB';
const fmtDur=ms=>{const s=Math.floor(ms/1000);return Math.floor(s/60)+'m '+(s%60)+'s';};
const fileIcon=n=>{const e=(String(n).split('.').pop()||'').toLowerCase();
  if(e==='pdf')return'📕';if(['doc','docx'].includes(e))return'📘';if(['xls','xlsx','csv'].includes(e))return'📗';
  if(['png','jpg','jpeg','gif','webp'].includes(e))return'🖼️';if(['mp4','mov','webm'].includes(e))return'🎬';
  if(['mp3','wav','m4a'].includes(e))return'🎵';return'📄';};

/* ---------- local store + realtime bus (demo/no-backend path) ---------- */
const DB_KEY='kb_msg_db_v1';
const loadDB=()=>{try{return JSON.parse(localStorage.getItem(DB_KEY))||{messages:[]}}catch(e){return{messages:[]}}};
const saveDB=db=>{try{localStorage.setItem(DB_KEY,JSON.stringify(db))}catch(e){}};
let DBS=loadDB();
const bus=('BroadcastChannel'in W)?new BroadcastChannel('kb_comm'):null;
const broadcast=(type,payload)=>{ if(bus)bus.postMessage({type,payload}); };

/* ---------- Demo roster (used only if Supabase roster unavailable) ---------- */
const DEMO={
  admins:[{id:'a1',name:'Admin Office',role:'admin'}],
  tutors:[{id:'t1',name:"Priya Ma'am",role:'tutor',subject:'Maths',batches:['B-10A','B-12S']},
          {id:'t2',name:'Karthik Sir',role:'tutor',subject:'Physics',batches:['B-12S']}],
  students:[{id:'s1',name:'Arjun R',role:'student',std:'Class 10',batch:'B-10A',assigned_tutor_id:'t1',parent_phone:'9000000001'},
            {id:'s2',name:'Divya S',role:'student',std:'Class 10',batch:'B-10A',assigned_tutor_id:'t1',parent_phone:'9000000002'},
            {id:'s3',name:'Karan M',role:'student',std:'Class 12',batch:'B-12S',assigned_tutor_id:'t2',parent_phone:'9000000003'}],
};
let ROSTER=null;                       // {admins,tutors,students} once loaded
const rAll=()=>[...ROSTER.admins,...ROSTER.tutors,...ROSTER.students];
const byId=id=>rAll().find(u=>String(u.id)===String(id));

async function loadRoster(){
  if(ROSTER) return ROSTER;
  const sb=W.supabase_client;
  if(sb){
    try{
      const [st,tu]=await Promise.all([
        sb.from('students').select('*'),
        sb.from('tutors').select('*')
      ]);
      if(!st.error && Array.isArray(st.data) && st.data.length){
        ROSTER={
          admins:[{id:'admin',name:'Admin Office',role:'admin'}],
          tutors:(tu.data||[]).map(t=>({id:String(t.id),name:t.name||t.full_name||'Tutor',role:'tutor',
            subject:t.subject||t.subjects||'',batches:Array.isArray(t.batches)?t.batches:(t.batches?String(t.batches).split(','):[])})),
          students:(st.data||[]).map(s=>({id:String(s.id),name:s.name||'Student',role:'student',
            std:s.std||s.class||'',board:s.board||'',batch:s.batch||'',
            assigned_tutor_id:String(s.assigned_tutor_id||s.assignedTutorId||s.tutor_id||''),
            phone:s.phone,parent_phone:s.parent_phone||s.parentPhone||s.guardian_phone||s.phone})),
        };
        return ROSTER;
      }
    }catch(e){ /* fall through to demo */ }
  }
  ROSTER=JSON.parse(JSON.stringify(DEMO));
  return ROSTER;
}

/* ---------- PRIVACY MODEL ---------- */
const dmId=(a,b)=>'dm:'+[String(a),String(b)].sort().join('~');
const groupId=b=>'grp:'+b;
function canAccess(user,conv){
  if(!user) return false;
  if(user.role==='admin') return true;
  if(user.role==='parent') return conv.members? conv.members.includes(String(user.childId)) : (user.childBatch===conv.batch);
  if(conv.type==='dm') return conv.members.includes(String(user.id));
  if(conv.type==='group'){
    if(user.role==='student') return user.batch===conv.batch;
    if(user.role==='tutor')   return (user.batches||[]).includes(conv.batch);
  }
  return false;
}
function myConversations(user){
  const R=ROSTER, list=[];
  const admins=R.admins;
  if(user.role==='student'){
    const t=byId(user.assigned_tutor_id);
    if(t) list.push({type:'dm',id:dmId(user.id,t.id),members:[String(user.id),String(t.id)],title:t.name,sub:(t.subject||'')+' Tutor',with:t});
    admins.forEach(a=>list.push({type:'dm',id:dmId(user.id,a.id),members:[String(user.id),String(a.id)],title:a.name,sub:'Administration',with:a}));
    if(user.batch) list.push({type:'group',id:groupId(user.batch),batch:user.batch,title:'Batch '+user.batch,sub:'Class channel'});
  }
  if(user.role==='tutor'){
    R.students.filter(s=>String(s.assigned_tutor_id)===String(user.id)).forEach(s=>
      list.push({type:'dm',id:dmId(user.id,s.id),members:[String(user.id),String(s.id)],title:s.name,sub:(s.std||'')+(s.batch?' · '+s.batch:''),with:s}));
    admins.forEach(a=>list.push({type:'dm',id:dmId(user.id,a.id),members:[String(user.id),String(a.id)],title:a.name,sub:'Administration',with:a}));
    (user.batches||[]).forEach(b=>list.push({type:'group',id:groupId(b),batch:b,title:'Batch '+b,sub:'Class channel'}));
  }
  if(user.role==='admin'){
    R.students.forEach(s=>list.push({type:'dm',id:dmId(user.id,s.id),members:[String(user.id),String(s.id)],title:s.name,sub:(s.std||'')+(s.batch?' · '+s.batch:''),with:s}));
    R.tutors.forEach(t=>list.push({type:'dm',id:dmId(user.id,t.id),members:[String(user.id),String(t.id)],title:t.name,sub:(t.subject||'')+' Tutor',with:t}));
    [...new Set(R.students.map(s=>s.batch).filter(Boolean))].forEach(b=>list.push({type:'group',id:groupId(b),batch:b,title:'Batch '+b,sub:'Class channel'}));
  }
  if(user.role==='parent'){
    // Parent sees the tutor profile = their child's conversations, read only
    const child=byId(user.childId); if(!child) return [];
    const t=byId(child.assigned_tutor_id);
    if(t) list.push({type:'dm',id:dmId(child.id,t.id),members:[String(child.id),String(t.id)],title:t.name,sub:(t.subject||'')+' Tutor',with:t,ro:true});
    R.admins.forEach(a=>list.push({type:'dm',id:dmId(child.id,a.id),members:[String(child.id),String(a.id)],title:a.name,sub:'Administration',with:a,ro:true}));
    if(child.batch) list.push({type:'group',id:groupId(child.batch),batch:child.batch,title:'Batch '+child.batch,sub:'Class channel',ro:true});
  }
  return list.filter(c=>canAccess(user,c));
}
function memberNames(conv){
  if(conv.type==='dm') return conv.members.map(id=>(byId(id)||{name:'?'}).name).join(' & ')+' + Admin';
  const n=ROSTER.students.filter(s=>s.batch===conv.batch).length;
  return n+' students, their tutor & Admin';
}
const messagesFor=id=>DBS.messages.filter(m=>m.conv===id).sort((a,b)=>a.ts-b.ts);
const lastMsg=id=>{const m=messagesFor(id);return m[m.length-1];};

/* ============================ UI / STATE ============================ */
let ME=null, CUR=null, CONVS=[], MOUNT=null, READONLY=false;

function dndKey(){ return 'kb_dnd_'+(ME&&ME.id); }
const dndOn=()=>{ try{return localStorage.getItem(dndKey())==='1'}catch(e){return false} };
const setDnd=v=>{ try{localStorage.setItem(dndKey(),v?'1':'0')}catch(e){} };

function shell(){
  const dnd = (ME&&ME.role==='tutor');
  return `
  <div class="kbc-root"><div class="kbc-wrap" id="kbcWrap">
    <div class="kbc-side">
      <div class="kbc-side-top">
        <div class="kbc-av" style="background:${colorFor(ME.id)}">${initials(ME.name)}</div>
        <div><div style="font-size:12.5px;font-weight:800">${esc(ME.name)}</div>
          <div style="font-size:10.5px;color:var(--muted,#a99fc0)">${esc(ME.roleLabel||ME.role)}</div></div>
        ${dnd?`<div class="kbc-dnd">DND<span class="kbc-switch ${dndOn()?'on':''}" id="kbcDnd" title="Do Not Disturb — silence incoming call alerts"><span class="knob"></span></span></div>`:''}
      </div>
      <div class="kbc-search"><input id="kbcSearch" placeholder="🔍 Search people & channels"></div>
      <div class="kbc-convs" id="kbcConvs"></div>
    </div>
    <div class="kbc-main" id="kbcMain">
      <div class="kbc-empty" id="kbcEmpty"><div class="big">💬</div>
        <div style="font-weight:800;color:var(--text,#f4eefb)">Select a conversation</div>
        <div>Pick a ${ME.role==='parent'?'thread to view your child\'s messages':'person or channel to message or call'}.</div></div>
      <div id="kbcActive" style="display:none;flex-direction:column;min-height:0;flex:1">
        <div class="kbc-head">
          <div class="kbc-av" id="kbcHav">–</div>
          <div style="min-width:0"><div class="nm" id="kbcHnm">—</div><div class="st" id="kbcHst"></div></div>
          ${READONLY?'':`<div class="kbc-acts">
            <button class="kbc-ib call" title="Voice call" id="kbcBtnCall">📞</button>
            <button class="kbc-ib vid" title="Video call" id="kbcBtnVid">🎥</button></div>`}
        </div>
        <div class="kbc-priv">🔒 Private — visible only to <b id="kbcMembers">—</b></div>
        <div class="kbc-msgs" id="kbcMsgs"></div>
        ${READONLY
          ? `<div class="kbc-ro">👁️ Parent view — read only. You can see all of your child\'s conversations but cannot send or call.</div>`
          : `<div class="kbc-comp">
              <button class="kbc-ib" title="Share file / homework" id="kbcAttach">📎</button>
              <input type="file" id="kbcFile" style="display:none">
              <textarea id="kbcInput" rows="1" placeholder="Type a message…"></textarea>
              <button class="kbc-send" id="kbcSend">➤</button></div>`}
      </div>
    </div>
  </div></div>`;
}

function mount(container, me, opts){
  opts=opts||{};
  ROSTER || (ROSTER=JSON.parse(JSON.stringify(DEMO)));
  ME=me; READONLY=!!opts.readonly; MOUNT=container;
  ME.roleLabel = opts.roleLabel || (me.role==='student'?(me.std||'Student'):me.role==='tutor'?((me.subject||'')+' Tutor'):me.role==='admin'?'Administrator':'Parent');
  CONVS=myConversations(ME); CUR=null;
  container.innerHTML=shell();
  container.querySelector('#kbcSearch').addEventListener('input',renderConvs);
  const dnd=container.querySelector('#kbcDnd');
  if(dnd) dnd.addEventListener('click',()=>{ setDnd(!dndOn()); dnd.classList.toggle('on',dndOn()); toast(dndOn()?'🔕 Do Not Disturb on — call alerts silenced':'🔔 Call alerts on'); });
  if(!READONLY){
    container.querySelector('#kbcSend').addEventListener('click',sendText);
    container.querySelector('#kbcInput').addEventListener('input',e=>autogrow(e.target));
    container.querySelector('#kbcInput').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendText();}});
    container.querySelector('#kbcAttach').addEventListener('click',()=>container.querySelector('#kbcFile').click());
    container.querySelector('#kbcFile').addEventListener('change',e=>attachFile(e.target));
    container.querySelector('#kbcBtnCall').addEventListener('click',()=>startCall(false));
    container.querySelector('#kbcBtnVid').addEventListener('click',()=>startCall(true));
  }
  renderConvs();
}

function renderConvs(){
  const box=MOUNT.querySelector('#kbcConvs'); if(!box) return;
  const q=(MOUNT.querySelector('#kbcSearch').value||'').toLowerCase();
  const dms=CONVS.filter(c=>c.type==='dm'&&c.title.toLowerCase().includes(q));
  const grps=CONVS.filter(c=>c.type==='group'&&c.title.toLowerCase().includes(q));
  const item=c=>{const lm=lastMsg(c.id);
    const pre=lm?(lm.kind==='file'?'📎 '+lm.fileName:lm.kind==='call'?'📞 Call':lm.body):'Tap to start';
    const bg=c.type==='group'?'linear-gradient(135deg,#6366F1,#A5B4FC)':colorFor(c.with?c.with.id:c.id);
    return `<div class="kbc-conv ${CUR&&CUR.id===c.id?'active':''}" data-id="${c.id}">
      <div class="kbc-av" style="background:${bg}">${c.type==='group'?'#':initials(c.title)}</div>
      <div style="min-width:0;flex:1"><div class="kbc-nm">${esc(c.title)}
        <span class="kbc-tag ${c.type==='group'?'grp':'dm'}">${c.type==='group'?'CHANNEL':'PRIVATE'}</span></div>
        <div class="kbc-pre">${esc(pre)}</div></div></div>`;};
  let html='';
  if(dms.length) html+='<div class="kbc-seclabel">Direct — private</div>'+dms.map(item).join('');
  if(grps.length) html+='<div class="kbc-seclabel">Channels</div>'+grps.map(item).join('');
  box.innerHTML=html||'<div class="kbc-empty" style="padding:24px">No conversations</div>';
  box.querySelectorAll('.kbc-conv').forEach(el=>el.addEventListener('click',()=>openConv(el.dataset.id)));
}
function openConv(id){
  CUR=CONVS.find(c=>c.id===id); if(!CUR||!canAccess(ME,CUR)){ toast('🔒 No access'); return; }
  MOUNT.querySelector('#kbcEmpty').style.display='none';
  MOUNT.querySelector('#kbcActive').style.display='flex';
  MOUNT.querySelector('#kbcWrap').classList.add('open');
  const av=MOUNT.querySelector('#kbcHav'); av.textContent=CUR.type==='group'?'#':initials(CUR.title);
  av.style.background=CUR.type==='group'?'linear-gradient(135deg,#6366F1,#A5B4FC)':colorFor(CUR.with?CUR.with.id:CUR.id);
  MOUNT.querySelector('#kbcHnm').textContent=CUR.title;
  MOUNT.querySelector('#kbcHst').innerHTML=CUR.type==='group'?esc(CUR.sub):'<span class="d"></span>'+esc(CUR.sub||'online');
  MOUNT.querySelector('#kbcMembers').textContent=memberNames(CUR);
  renderConvs(); renderMsgs();
}
function renderMsgs(){
  if(!CUR) return; const box=MOUNT.querySelector('#kbcMsgs'); if(!box) return;
  const list=messagesFor(CUR.id); let html='',lastDay='';
  if(!list.length) html='<div class="kbc-empty" style="flex:0;padding:20px">No messages yet 👋</div>';
  list.forEach(m=>{const d=new Date(m.ts),day=d.toDateString();
    if(day!==lastDay){html+=`<div class="kbc-day">${day===new Date().toDateString()?'Today':day}</div>`;lastDay=day;}
    const tm=d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
    if(m.kind==='call'){html+=`<div class="kbc-callnote ${m.missed?'missed':''}">${m.missed?'📵 Missed call':(m.video?'🎥':'📞')+' Call · '+(m.dur||'ended')}</div>`;return;}
    const mine=String(m.sender)===String(ME.parentSelf||ME.id), sender=byId(m.sender);
    const inner=m.kind==='file'
      ? `<a class="kbc-file" href="${m.fileUrl}" download="${esc(m.fileName)}"><span class="fi">${fileIcon(m.fileName)}</span><span><div style="font-size:12px;font-weight:700">${esc(m.fileName)}</div><div style="font-size:10.5px;color:var(--muted,#a99fc0)">${esc(m.fileSize)}</div></span></a>`
      : esc(m.body).replace(/\n/g,'<br>');
    html+=`<div class="kbc-row ${mine?'me':'them'}">
      ${!mine?`<div class="kbc-mav" style="background:${colorFor(m.sender)}">${initials(sender?sender.name:'?')}</div>`:''}
      <div class="kbc-bub">${(!mine&&CUR.type==='group')?`<div class="kbc-sn">${esc(sender?sender.name:'Unknown')}</div>`:''}${inner}<div class="kbc-tm">${tm}</div></div></div>`;
  });
  box.innerHTML=html; box.scrollTop=box.scrollHeight;
}
function pushMsg(m){ DBS.messages.push(m); saveDB(DBS); broadcast('msg',m); persistSupabase(m);
  if(CUR&&m.conv===CUR.id) renderMsgs(); renderConvs(); }
function sendText(){ const ta=MOUNT.querySelector('#kbcInput'); const t=ta.value.trim(); if(!t||!CUR) return;
  ta.value=''; autogrow(ta);
  pushMsg({id:'m'+Date.now()+Math.random().toString(36).slice(2,6),conv:CUR.id,sender:ME.id,kind:'text',body:t,ts:Date.now()}); }
function attachFile(input){ const f=input.files[0]; if(!f||!CUR) return;
  if(f.size>5*1024*1024){ toast('⚠️ Max 5 MB in demo mode'); input.value=''; return; }
  const r=new FileReader(); r.onload=()=>{ pushMsg({id:'m'+Date.now(),conv:CUR.id,sender:ME.id,kind:'file',fileName:f.name,fileSize:fmtSize(f.size),fileUrl:r.result,ts:Date.now()}); toast('📎 Sent '+f.name); };
  r.readAsDataURL(f); input.value=''; }
function autogrow(el){ el.style.height='auto'; el.style.height=Math.min(el.scrollHeight,110)+'px'; }

/* optional Supabase persistence (no-op if table missing) */
async function persistSupabase(m){
  const sb=W.supabase_client; if(!sb||!W.__KB_SB_MSG) return;
  try{ await sb.from('kb_messages').insert({id:m.id,conv:m.conv,sender:String(m.sender),kind:m.kind,body:m.body||null,
    file_name:m.fileName||null,file_size:m.fileSize||null,file_url:m.fileUrl||null,video:m.video||null,missed:m.missed||null,dur:m.dur||null}); }catch(e){}
}

/* ============================ WEBRTC CALLS ============================ */
let pc=null,localStream=null,callState=null,callWith=null,callVideo=false,callTimer=null,callStart=0,muted=false,pendingOffer=null,ring=null;
const RTC={iceServers:[{urls:'stun:stun.l.google.com:19302'}]};
function ensureCallDom(){
  if(document.getElementById('kbcCall')) return;
  const d=document.createElement('div'); d.id='kbcCall'; d.style.display='none';
  d.innerHTML=`<div class="vwrap hidden" id="kbcVwrap"><video id="kbcRemote" autoplay playsinline></video><video id="kbcLocal" autoplay playsinline muted></video></div>
    <div class="top" id="kbcTop"><div class="cav" id="kbcCav" style="background:#F5C842">–</div><div class="cn" id="kbcCnm">—</div><div class="cs" id="kbcCst">Calling…</div></div>
    <div class="ctrls" id="kbcCtrls">
      <button class="cbtn" id="kbcMute" title="Mute">🎙️</button>
      <button class="cbtn accept" id="kbcAccept" title="Accept" style="display:none">📞</button>
      <button class="cbtn end" id="kbcEnd" title="End">📵</button></div>`;
  document.body.appendChild(d);
  d.querySelector('#kbcMute').onclick=toggleMute; d.querySelector('#kbcEnd').onclick=()=>endCall(true); d.querySelector('#kbcAccept').onclick=acceptCall;
  const t=document.createElement('div'); t.id='kbcToast'; document.body.appendChild(t);
}
async function startCall(video){ if(!CUR) return; ensureCallDom();
  if(CUR.type==='group'){ toast('Group calls ring the class channel (1:1 shown in demo)'); }
  callVideo=video; callWith=CUR; callState='outgoing';
  showCallUI(video,CUR.title,'Calling…'); document.getElementById('kbcAccept').style.display='none';
  try{ localStream=await navigator.mediaDevices.getUserMedia({audio:true,video});
    if(video){ document.getElementById('kbcLocal').srcObject=localStream; document.getElementById('kbcVwrap').classList.remove('hidden'); document.getElementById('kbcTop').style.display='none'; }
  }catch(e){ toast('🎤 Mic/cam unavailable — showing call UI'); }
  pc=makePc(); if(localStream) localStream.getTracks().forEach(t=>pc.addTrack(t,localStream));
  const offer=await pc.createOffer().catch(()=>null); if(offer) await pc.setLocalDescription(offer);
  const to=CUR.members?CUR.members.find(x=>String(x)!==String(ME.id)):null;
  signal({kind:'ring',conv:CUR.id,video,fromName:ME.name,from:ME.id,to,sdp:offer});
}
function makePc(){ const p=new RTCPeerConnection(RTC);
  p.onicecandidate=e=>{ if(e.candidate) signal({kind:'ice',conv:(callWith||CUR).id,from:ME.id,candidate:e.candidate}); };
  p.ontrack=e=>{ const rv=document.getElementById('kbcRemote'); rv.srcObject=e.streams[0];
    if(callVideo){ document.getElementById('kbcVwrap').classList.remove('hidden'); document.getElementById('kbcTop').style.display='none'; } };
  return p; }
function signal(d){ broadcast('signal',d); }
async function onSignal(d){
  if(d.kind==='ring'){
    if(d.to&&String(d.to)!==String(ME.id)) return;
    const conv=CONVS.find(c=>c.id===d.conv); if(!conv||!canAccess(ME,conv)) return;
    if(ME.role==='tutor'&&dndOn()){ // DND: silently log missed
      DBS.messages.push({id:'m'+Date.now(),conv:d.conv,sender:d.from,kind:'call',missed:true,ts:Date.now()}); saveDB(DBS); renderConvs&&renderConvs(); return; }
    incomingCall(d,conv); return;
  }
  if(!pc) return;
  if(d.kind==='answer'){ await pc.setRemoteDescription(new RTCSessionDescription(d.sdp)); setStatus('Connected'); startTimer(); }
  if(d.kind==='ice'){ try{ await pc.addIceCandidate(new RTCIceCandidate(d.candidate)); }catch(e){} }
  if(d.kind==='hangup'){ toast('Call ended'); cleanup(); }
}
function incomingCall(d,conv){ ensureCallDom(); callState='incoming'; callWith=conv; callVideo=d.video; pendingOffer=d;
  showCallUI(false,d.fromName,'Incoming '+(d.video?'video':'voice')+' call…');
  document.getElementById('kbcAccept').style.display=''; startRing();
  toast('📞 '+d.fromName+' is calling…');
}
async function acceptCall(){ const d=pendingOffer; if(!d) return; stopRing(); document.getElementById('kbcAccept').style.display='none';
  try{ localStream=await navigator.mediaDevices.getUserMedia({audio:true,video:callVideo});
    if(callVideo){ document.getElementById('kbcLocal').srcObject=localStream; document.getElementById('kbcVwrap').classList.remove('hidden'); document.getElementById('kbcTop').style.display='none'; }
  }catch(e){ toast('🎤 Mic/cam unavailable'); }
  pc=makePc(); if(localStream) localStream.getTracks().forEach(t=>pc.addTrack(t,localStream));
  if(d.sdp){ await pc.setRemoteDescription(new RTCSessionDescription(d.sdp)); const ans=await pc.createAnswer(); await pc.setLocalDescription(ans);
    signal({kind:'answer',conv:d.conv,from:ME.id,to:d.from,sdp:ans}); }
  setStatus('Connected'); startTimer();
}
function showCallUI(video,name,status){ const ov=document.getElementById('kbcCall'); ov.style.display='flex';
  document.getElementById('kbcCnm').textContent=name; const av=document.getElementById('kbcCav'); av.textContent=initials(name); av.style.background=colorFor(name);
  setStatus(status); document.getElementById('kbcVwrap').classList.toggle('hidden',!video); document.getElementById('kbcTop').style.display=''; }
function setStatus(s){ document.getElementById('kbcCst').textContent=s; }
function startTimer(){ callStart=Date.now(); clearInterval(callTimer);
  callTimer=setInterval(()=>{ const s=Math.floor((Date.now()-callStart)/1000); setStatus(String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')); },1000); }
function toggleMute(){ muted=!muted; if(localStream) localStream.getAudioTracks().forEach(t=>t.enabled=!muted);
  const b=document.getElementById('kbcMute'); b.classList.toggle('on',muted); b.textContent=muted?'🔇':'🎙️'; }
function endCall(local){ const dur=callStart?fmtDur(Date.now()-callStart):null;
  if(local&&callWith) signal({kind:'hangup',conv:callWith.id,from:ME.id});
  if(callWith&&(callState==='outgoing'||callState==='incoming'||callStart))
    pushMsg({id:'m'+Date.now(),conv:callWith.id,sender:ME.id,kind:'call',video:callVideo,missed:!callStart,dur,ts:Date.now()});
  cleanup(); }
function cleanup(){ stopRing(); clearInterval(callTimer); callTimer=null; if(pc){try{pc.close()}catch(e){}pc=null;}
  if(localStream){localStream.getTracks().forEach(t=>t.stop());localStream=null;}
  const ov=document.getElementById('kbcCall'); if(ov){ov.style.display='none'; document.getElementById('kbcVwrap').classList.add('hidden');
    document.getElementById('kbcRemote').srcObject=null; document.getElementById('kbcLocal').srcObject=null;
    document.getElementById('kbcMute').textContent='🎙️'; document.getElementById('kbcMute').classList.remove('on');}
  callState=null;callWith=null;callStart=0;muted=false;pendingOffer=null; }
/* ringtone via WebAudio */
function startRing(){ try{ const AC=W.AudioContext||W.webkitAudioContext; ring={ctx:new AC()};
  const beep=()=>{ if(!ring)return; const o=ring.ctx.createOscillator(),g=ring.ctx.createGain();
    o.frequency.value=520; o.connect(g); g.connect(ring.ctx.destination); g.gain.value=.15; o.start(); o.stop(ring.ctx.currentTime+.4); };
  beep(); ring.iv=setInterval(beep,1400);
  if('vibrate'in navigator) navigator.vibrate([300,200,300]); }catch(e){} }
function stopRing(){ if(ring){ clearInterval(ring.iv); try{ring.ctx.close()}catch(e){} ring=null; } }

/* ---------- realtime receive ---------- */
if(bus) bus.onmessage=ev=>{ const {type,payload}=ev.data;
  if(type==='msg'){ const conv=CONVS.find(c=>c.id===payload.conv); if(!ME||!conv||!canAccess(ME,conv)) return;
    if(!DBS.messages.find(m=>m.id===payload.id)){ DBS.messages.push(payload); saveDB(DBS); }
    if(CUR&&payload.conv===CUR.id) renderMsgs();
    if(String(payload.sender)!==String(ME.id)) toast('💬 '+((byId(payload.sender)||{}).name||'New')+': '+String(payload.kind==='file'?'sent a file':payload.body||'…').slice(0,40));
    renderConvs(); }
  if(type==='signal'&&ME) onSignal(payload);
};
function toast(msg){ ensureCallDom(); const t=document.getElementById('kbcToast'); if(!t)return; t.textContent=msg; t.classList.add('show'); clearTimeout(t._t); t._t=setTimeout(()=>t.classList.remove('show'),2600); }

/* ============================ PORTAL INTEGRATION ============================ */
function addSidebarLink(shellSel,label,onclick){
  const sb=document.querySelector(shellSel+' .portal-sidebar'); if(!sb||sb.querySelector('[data-kbc-link]')) return;
  const sec=document.createElement('div'); sec.className='psb-section'; sec.textContent='Communication';
  const b=document.createElement('button'); b.className='psb-link'; b.setAttribute('data-kbc-link','1'); b.innerHTML=label; b.onclick=function(){onclick(this);};
  sb.appendChild(sec); sb.appendChild(b);
}
function addView(shellSel,viewId){
  const main=document.querySelector(shellSel+' .portal-main'); if(!main||document.getElementById(viewId)) return;
  const v=document.createElement('div'); v.className='portal-view'; v.id=viewId;
  v.innerHTML='<div data-kbc-mount></div>'; main.appendChild(v);
}

// Wrap an existing global fn, running cb(args) after it
function after(name,cb){ const orig=W[name]; if(typeof orig!=='function'){ return false; }
  W[name]=function(){ const r=orig.apply(this,arguments); try{cb.apply(this,arguments);}catch(e){console.warn('KBComm hook',name,e);} return r; }; return true; }

async function boot(){
  await loadRoster();
  ensureCallDom();
  // ---- STUDENT ----
  after('openStudentPortal',()=>{
    addSidebarLink('#studentPortalShell','💬 Messages & Calls',(btn)=>W.showStudentView('kbcmsg',btn));
    addView('#studentPortalShell','sv-kbcmsg');
  });
  after('showStudentViewSilent',(view)=>{ if(view==='kbcmsg'){ const s=W._currentStudent; if(!s)return;
    mount(document.querySelector('#sv-kbcmsg [data-kbc-mount]'),{id:s.id,name:s.name,role:'student',std:s.std,board:s.board,batch:s.batch,assigned_tutor_id:s.assigned_tutor_id||s.assignedTutorId||s.tutor_id}); } });
  // ---- TUTOR ----
  after('openTutorPortal',()=>{
    addSidebarLink('#tutorPortalModal','💬 Messages & Calls',(btn)=>W.showTutorView('kbcmsg',btn));
    addView('#tutorPortalModal','tv-kbcmsg');
  });
  after('showTutorViewSilent',(view)=>{ if(view==='kbcmsg'){ const t=W._currentTutor; if(!t)return;
    mount(document.querySelector('#tv-kbcmsg [data-kbc-mount]'),{id:t.id,name:t.name,role:'tutor',subject:t.subject,batches:Array.isArray(t.batches)?t.batches:(t.batches?String(t.batches).split(','):[])}); } });
  // ---- ADMIN ---- (best-effort: hook adminLogin if present)
  after('adminLogin',()=>{ setTimeout(injectAdmin,600); });
  setTimeout(injectAdmin,1500);
  // ---- PARENT login tab ----
  injectParentTab();
  console.log('✅ KBComm ready (roster:',ROSTER.students.length,'students,',ROSTER.tutors.length,'tutors)');
}
function injectAdmin(){
  const shellSel = document.querySelector('#adminShell .admin-sidebar')?'#adminShell':null;
  // Admin UI varies; provide a floating launcher instead of fragile sidebar edits
  if(document.getElementById('kbcAdminBtn')) return;
  const adminVisible = document.querySelector('#adminShell')&&!document.querySelector('#adminShell').classList.contains('hidden');
  if(!adminVisible) return;
  const b=document.createElement('button'); b.id='kbcAdminBtn'; b.textContent='💬 Messages';
  b.style.cssText='position:fixed;right:18px;bottom:18px;z-index:8000;padding:12px 18px;border:none;border-radius:30px;font-weight:800;background:linear-gradient(135deg,#FFE566,#F5C842 45%,#C47A10);color:#241500;box-shadow:0 10px 30px rgba(0,0,0,.4);cursor:pointer';
  b.onclick=()=>openAdminOverlay();
  document.body.appendChild(b);
}
function openAdminOverlay(){
  let ov=document.getElementById('kbcAdminOv');
  if(!ov){ ov=document.createElement('div'); ov.id='kbcAdminOv';
    ov.style.cssText='position:fixed;inset:0;z-index:8100;background:rgba(5,3,10,.85);backdrop-filter:blur(4px);padding:24px';
    ov.innerHTML='<div style="max-width:1100px;margin:0 auto;position:relative"><button id="kbcAdminX" style="position:absolute;right:0;top:-6px;z-index:2;background:none;border:none;color:#fff;font-size:26px;cursor:pointer">✕</button><div id="kbcAdminMount" style="margin-top:26px"></div></div>';
    document.body.appendChild(ov); ov.querySelector('#kbcAdminX').onclick=()=>ov.style.display='none'; }
  ov.style.display='block';
  mount(ov.querySelector('#kbcAdminMount'),{id:'admin',name:'Admin Office',role:'admin'},{roleLabel:'Administrator'});
}
function injectParentTab(){
  const tabs=document.querySelector('#loginModal .modal-tabs'); if(!tabs||document.getElementById('kbcParentTab')) return;
  const btn=document.createElement('button'); btn.className='mtab'; btn.id='kbcParentTab'; btn.textContent='👨‍👩‍👧 Parent';
  btn.onclick=function(){ document.querySelectorAll('#loginModal .mtab').forEach(t=>t.classList.remove('active'));
    document.querySelectorAll('#loginModal .tab-pane').forEach(p=>p.classList.remove('active'));
    btn.classList.add('active'); document.getElementById('login-parent').classList.add('active'); };
  tabs.appendChild(btn);
  const body=document.querySelector('#loginModal .modal-body');
  const pane=document.createElement('div'); pane.className='tab-pane'; pane.id='login-parent';
  pane.innerHTML=`<div class="db-status"><div class="db-dot"></div>Parent read-only access</div>
    <div class="form-group"><label class="form-label">Child\'s Registered Mobile Number</label>
      <input class="form-input" id="kbcParentPhone" placeholder="Enter your child\'s registered mobile" type="tel" maxlength="10"></div>
    <div class="form-error" id="kbcParentErr" style="display:none">No student found for that mobile number.</div>
    <button class="form-submit" id="kbcParentBtn">View My Child\'s Messages</button>
    <div style="text-align:center;margin-top:10px;font-size:11px;color:var(--muted,#a99fc0)">You will see your child\'s conversations with their tutor and admin (read only).</div>`;
  body.appendChild(pane);
  pane.querySelector('#kbcParentBtn').addEventListener('click',parentLogin);
}
async function parentLogin(){
  await loadRoster();
  const phone=(document.getElementById('kbcParentPhone').value||'').trim();
  const err=document.getElementById('kbcParentErr');
  const child=ROSTER.students.find(s=>String(s.parent_phone||s.phone)===phone || String(s.phone)===phone);
  if(!child){ err.style.display='flex'; return; } err.style.display='none';
  if(W.closeModal) W.closeModal('loginModal');
  openParentShell(child);
}
function openParentShell(child){
  let sh=document.getElementById('kbcParentShell');
  if(!sh){ sh=document.createElement('div'); sh.id='kbcParentShell';
    sh.style.cssText='position:fixed;inset:0;z-index:7000;background:radial-gradient(1000px 500px at 80% -10%,rgba(99,102,241,.12),transparent),#0b0710;overflow:auto';
    sh.innerHTML=`<div style="max-width:1100px;margin:0 auto;padding:20px">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
        <div style="width:34px;height:34px;border-radius:10px;background:radial-gradient(circle at 50% 30%,#FFE566,#F5C842 40%,#C47A10);display:flex;align-items:center;justify-content:center;font-size:17px">🔥</div>
        <div><div style="font-size:14px;font-weight:800">Parent View</div><div id="kbcParentSub" style="font-size:11px;color:#a99fc0"></div></div>
        <button id="kbcParentExit" style="margin-left:auto;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);color:#a99fc0;border-radius:10px;padding:8px 12px;cursor:pointer">Exit</button>
      </div><div id="kbcParentMount"></div></div>`;
    document.body.appendChild(sh); sh.querySelector('#kbcParentExit').onclick=()=>sh.remove(); }
  sh.querySelector('#kbcParentSub').textContent='Viewing '+child.name+' · '+(child.std||'')+' · tutor & admin conversations';
  mount(sh.querySelector('#kbcParentMount'),{id:'parent-'+child.id,name:child.name+"'s Parent",role:'parent',childId:child.id,childBatch:child.batch,parentSelf:child.id},{readonly:true,roleLabel:'Parent (read only)'});
}

/* expose for tests + manual use */
W.KBComm={mount,openAdminOverlay,openParentShell,canAccess,myConversations,loadRoster,_setRoster:r=>{ROSTER=r;},dmId,groupId,byId:id=>byId(id),get ROSTER(){return ROSTER;}};

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();
