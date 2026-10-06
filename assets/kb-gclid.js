/* Kongu Brilliance - Google Ads click ID capture (lead -> ad attribution).
   Stores gclid/gbraid/wbraid for 90 days, adds a details template + readable source line to WhatsApp messages,
   and adds a hidden gclid field to forms. Adds nothing visible; safe if no click ID exists. */
(function(){
  var KEY='kb_gclid', DAYS=90;
  try{
    var p=new URLSearchParams(location.search);
    var id=p.get('gclid')||p.get('gbraid')||p.get('wbraid');
    if(id){localStorage.setItem(KEY,JSON.stringify({id:id,t:Date.now()}));}
  }catch(e){}
  function get(){try{var o=JSON.parse(localStorage.getItem(KEY)||'null');if(o&&Date.now()-o.t<DAYS*864e5)return o.id;}catch(e){}return '';}
  var PAGES={'online-tuition-india':'Online tuition page','home-tuition-coimbatore':'Home tuition page','maths-tuition-coimbatore':'Maths tuition page'};
  function pageName(){var k=(location.pathname.split('/').pop()||'').replace('.html','');return PAGES[k]||(k?k.replace(/-/g,' '):'Home page');}
  document.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('a'); if(!a) return;
    var h=a.getAttribute('href')||'';
    if(!/wa\.me\//.test(h)||a.getAttribute('data-kb-done')) return;
    try{
      var u=new URL(h,location.href); var t=u.searchParams.get('text')||'Hi Kongu Brilliance, I need tuition details.';
      if(!/Class:/i.test(t)) t+='\n\nStudent name: \nClass: \nSubject(s): \nBoard (CBSE/ICSE/State): \nMode (Online/Centre/Home): \nCity / Area: ';
      t+='\n\n(Source: '+(get()?'Google Ad':'Website')+' – '+pageName()+')';
      u.searchParams.set('text',t); a.setAttribute('href',u.toString()); a.setAttribute('data-kb-done','1');
    }catch(err){}
  },true);
  function forms(){var id=get(); if(!id) return;
    Array.prototype.forEach.call(document.querySelectorAll('form'),function(f){
      if(f.querySelector('input[name=gclid]')) return;
      var i=document.createElement('input'); i.type='hidden'; i.name='gclid'; i.value=id; f.appendChild(i);});}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',forms); else forms();
})();
