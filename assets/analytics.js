/* Optional first-party analytics: no form content, no IP storage. */
(() => {
  'use strict';
  const enabled=['www.scautdom.com','scautdom.com'].includes(location.hostname) && new URLSearchParams(location.search).get('sd_analytics')!=='off';
  const keys={choice:'sd.analytics.choice.v1',visitor:'sd.analytics.visitor.v1',session:'sd.analytics.session.v1'};
  const allowed=new Set(['page_view','engagement','section_view','application_viewed','application_started','application_step','message_prepared','message_copied','application_received','application_save_failed','telegram_handoff','direct_chat','calculator_used','application_cta']);
  const id=()=>Array.from(crypto.getRandomValues(new Uint8Array(16)),x=>x.toString(16).padStart(2,'0')).join('');
  const read=(area,key)=>{try{return JSON.parse(window[area].getItem(key)||'null');}catch{return null;}};
  const write=(area,key,value)=>{try{if(value===null)window[area].removeItem(key);else window[area].setItem(key,JSON.stringify(value));}catch{/* Optional storage. */}};
  const blocked=()=>navigator.doNotTrack==='1' || navigator.globalPrivacyControl===true;
  let choice=read('localStorage',keys.choice),visitor=null,session=null,pageId=id(),engagedMs=0,maxScroll=0,lastTick=performance.now(),lastActivity=Date.now(),active=false,observer=null;
  const seen=new Set(),validId=value=>typeof value==='string' && /^[a-f0-9]{32}$/.test(value);
  if(choice && Date.now()-choice.at>180*86400000)choice=null;
  function source() {
    const result={},params=new URLSearchParams(location.search);
    for(const key of ['utm_source','utm_medium','utm_campaign','utm_content','ref']){const value=params.get(key);if(value && /^[a-zA-Z0-9_.-]{1,64}$/.test(value))result[key]=value;}
    try{const ref=new URL(document.referrer);if(!['scautdom.com','www.scautdom.com'].includes(ref.hostname))result.referrer=ref.hostname;}catch{/* Direct. */}
    return result;
  }
  function ready(){return enabled && active && !blocked();}
  const landingSource=source();
  const hasLandingSource=Object.keys(landingSource).length>0;
  let checkedLanding=false;
  function context() {
    if(!ready())return null;
    const now=Date.now();
    if(!visitor){visitor=read('localStorage',keys.visitor);if(!visitor || !validId(visitor.id) || !Number.isFinite(visitor.at) || now-visitor.at>90*86400000)visitor={id:id(),at:now,first:source()};write('localStorage',keys.visitor,visitor);}
    if(!session)session=read('sessionStorage',keys.session);
    const changedSource=!checkedLanding && hasLandingSource && JSON.stringify(session?.source)!==JSON.stringify(landingSource);checkedLanding=true;
    if(!session || changedSource || !validId(session.id) || session.visitor!==visitor.id || !Number.isFinite(session.startedAt) || !Number.isFinite(session.touchedAt) || now-session.touchedAt>30*60000 || now-session.startedAt>23*3600000){session={id:id(),visitor:visitor.id,startedAt:now,touchedAt:now,source:landingSource};pageId=id();engagedMs=0;maxScroll=0;seen.clear();lastTick=performance.now();}
    session.touchedAt=now;write('sessionStorage',keys.session,session);
    return {sessionId:session.id,visitorId:visitor.id,source:session.source,firstSource:visitor.first};
  }
  function measure(){const now=performance.now(),delta=Math.max(0,Math.min(5000,now-lastTick));lastTick=now;if(ready() && document.visibilityState==='visible' && Date.now()-lastActivity<60000)engagedMs=Math.min(7200000,engagedMs+Math.round(delta));const height=document.documentElement.scrollHeight-innerHeight;maxScroll=Math.max(maxScroll,height>0?Math.min(100,Math.round(scrollY/height*100)):100);}
  function send(event,flow='site',step=0,section='') {
    if(!ready() || !allowed.has(event))return;
    if(event==='engagement' && session && Date.now()-session.touchedAt>30*60000 && Date.now()-lastActivity>60000)return;
    const ctx=context();if(!ctx)return;measure();
    const key=`${event}:${flow}:${step}:${section}`;if(event!=='engagement' && seen.has(key))return;if(event!=='engagement')seen.add(key);
    const body=JSON.stringify({v:2,...ctx,pageId,eventId:id(),event,flow,step,section,page:location.pathname,engagedMs,scroll:maxScroll,device:/ipad|tablet/i.test(navigator.userAgent)?'tablet':/mobi/i.test(navigator.userAgent)?'mobile':'desktop'});
    function attempt(retry=false){if(!ready())return;fetch('/api/events',{method:'POST',credentials:'omit',keepalive:true,headers:{'Content-Type':'application/json'},body,signal:AbortSignal.timeout(4500)}).then(r=>{if(!r.ok && r.status>=500 && !retry)setTimeout(()=>attempt(true),1500);}).catch(()=>{if(!retry && ready())setTimeout(()=>attempt(true),1500);});}
    attempt();
  }
  function start(){if(!enabled || blocked() || active)return;active=true;lastTick=performance.now();lastActivity=Date.now();send('page_view');if('IntersectionObserver' in window){observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){send('section_view','site',0,entry.target.id);observer.unobserve(entry.target);}}),{threshold:0,rootMargin:'0px 0px -20% 0px'});document.querySelectorAll('#role,#models,#workflow,#rewards,#questions,#apply').forEach(node=>observer.observe(node));}}
  function stop(){active=false;observer?.disconnect();session=null;visitor=null;seen.clear();write('localStorage',keys.visitor,null);write('sessionStorage',keys.session,null);}
  let panel=null;
  function settings(){
    if(!enabled)return;
    if(!panel){panel=document.createElement('section');panel.className='analytics-choice';panel.setAttribute('aria-label','Настройки статистики');const copy=document.createElement('p');copy.textContent='Разрешить статистику посещений? Она помогает улучшать сайт. Содержание анкеты в неё не входит.';const link=document.createElement('a');link.href='/privacy.html';link.textContent='Подробнее';copy.append(' ',link);panel.append(copy);const actions=document.createElement('div');actions.className='analytics-choice-actions';
      for(const [value,label] of [['granted','Разрешить'],['denied','Без статистики']]){const button=document.createElement('button');button.type='button';button.textContent=label;button.addEventListener('click',()=>{choice={value,at:Date.now()};write('localStorage',keys.choice,choice);panel.hidden=true;value==='granted'?start():stop();});actions.append(button);}panel.append(actions);document.body.append(panel);}
    panel.hidden=false;if(blocked()){panel.querySelector('p').textContent='Статистика отключена настройками приватности твоего браузера.';panel.querySelector('button').disabled=true;}
  }
  window.ScautdomAnalytics={track:send,context:()=>{const ctx=context();return ctx?{sessionId:ctx.sessionId}:null;},settings};
  if(!enabled)return;
  document.querySelectorAll('[data-analytics-settings]').forEach(button=>{button.hidden=false;button.addEventListener('click',settings);});
  if(!blocked()){if(choice?.value==='granted')start();else if(!choice)settings();}
  for(const event of ['pointerdown','keydown','scroll','touchstart'])addEventListener(event,()=>{lastActivity=Date.now();},{passive:true});
  setInterval(measure,4000);setInterval(()=>{if(document.visibilityState==='visible' && Date.now()-lastActivity<60000)send('engagement');},15000);
  document.addEventListener('visibilitychange',()=>{measure();if(document.visibilityState==='hidden')send('engagement');else{lastTick=performance.now();lastActivity=Date.now();}});
  addEventListener('pagehide',()=>{measure();send('engagement');});
  addEventListener('storage',event=>{if(event.key===keys.choice){choice=read('localStorage',keys.choice);if(choice?.value==='granted')start();else stop();}});
})();
