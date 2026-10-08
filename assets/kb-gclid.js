/* Kongu Brilliance - lead quality + Google Ads attribution.
   - Stores gclid/gbraid/wbraid for 90 days; adds hidden gclid field to forms.
   - WhatsApp buttons open WhatsApp directly (no form gate); the form adds name/class/subject/board/area.
   - Adds a Subject field to the form and a readable source line to WhatsApp messages.
 */
(function(){
  if(window.__kbLead) return; window.__kbLead=1;
  var KEY='kb_gclid', DAYS=90;
  try{
    var p=new URLSearchParams(location.search);
    var id=p.get('gclid')||p.get('gbraid')||p.get('wbraid');
    if(id){localStorage.setItem(KEY,JSON.stringify({id:id,t:Date.now()}));}
  }catch(e){}
  function get(){try{var o=JSON.parse(localStorage.getItem(KEY)||'null');if(o&&Date.now()-o.t<DAYS*864e5)return o.id;}catch(e){}return '';}
  var PAGES={'online-tuition-india':'Online tuition page','home-tuition-coimbatore':'Home tuition page','maths-tuition-coimbatore':'Maths tuition page'};
  function pageName(){var k=(location.pathname.split('/').pop()||'').replace('.html','');return PAGES[k]||(k?k.replace(/-/g,' '):'Home page');}
  function source(){return '(Source: '+(get()?'Google Ad':'Website')+' – '+pageName()+')';}
  function form(){return document.getElementById('leadForm');}
  function formVisible(){var f=form();return f&&f.offsetParent!==null;}
  function subj(){var s=document.getElementById('kbSubj');return s&&s.value?s.value:'';}

  /* Add Subject field to the demo form */
  function addSubject(){
    var f=form(); if(!f||document.getElementById('kbSubj')) return;
    var area=document.getElementById('area')||f.querySelector('button[type=submit],.submit'); if(!area) return;
    var lab=document.createElement('label'); lab.textContent='Subject(s) needed';
    var sel=document.createElement('select'); sel.id='kbSubj'; sel.required=true;
    ['','Maths','Science','Maths + Science','Physics','Chemistry','Biology','English','Tamil','Social Science','Accountancy / Commerce','All subjects'].forEach(function(v){
      var o=document.createElement('option'); o.value=v; o.textContent=v||'Select'; sel.appendChild(o);});
    var lab2=area.previousElementSibling&&area.previousElementSibling.tagName==='LABEL'?area.previousElementSibling:area;
    f.insertBefore(lab,lab2); f.insertBefore(sel,lab2);
    ['cls','brd'].forEach(function(i){var x=document.getElementById(i); if(x) x.required=true;});
  }

  /* Add subject + source to the WhatsApp message the form opens */
  var _open=window.open;
  window.open=function(url){
    try{
      if(/wa\.me\//.test(url)){
        var u=new URL(url); var t=u.searchParams.get('text')||'';
        if(subj()&&!/Subject/i.test(t)) t=/\nBoard:/.test(t)?t.replace(/(\nBoard:[^\n]*)/,'\nSubject: '+subj()+'$1'):t+'\nSubject: '+subj();
        if(!/Source:/.test(t)) t+='\n\n'+source();
        u.searchParams.set('text',t);
        /* open through a real link click so Google Ads / GTM WhatsApp conversion tracking fires */
        var a=document.createElement('a'); a.href=u.toString(); a.target='_blank'; a.rel='noopener';
        a.setAttribute('data-kb-done','1'); a.style.display='none'; document.body.appendChild(a);
        a.click(); setTimeout(function(){a.remove();},1000); return null;
      }
    }catch(e){}
    return _open.apply(window,arguments);
  };

  /* WhatsApp buttons: send to the form first when it exists */
  document.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('a'); if(!a) return;
    var h=a.getAttribute('href')||'';
    if(!/wa\.me\//.test(h)||a.getAttribute('data-kb-done')) return;
    try{
      var u=new URL(h,location.href); var t=u.searchParams.get('text')||'Hi Kongu Brilliance, I need tuition details.';
      if(!/Class:/i.test(t)) t+='\n\nStudent name: \nClass: \nSubject(s): \nBoard (CBSE/ICSE/State): \nMode (Online/Centre/Home): \nCity / Area: ';
      t+='\n\n'+source();
      u.searchParams.set('text',t); a.setAttribute('href',u.toString()); a.setAttribute('data-kb-done','1');
    }catch(err){}
  },true);

  function init(){
    addSubject();
    var id=get(); if(!id) return;
    Array.prototype.forEach.call(document.querySelectorAll('form'),function(f){
      if(f.querySelector('input[name=gclid]')) return;
      var i=document.createElement('input'); i.type='hidden'; i.name='gclid'; i.value=id; f.appendChild(i);});
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
