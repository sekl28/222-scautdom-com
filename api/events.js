'use strict';
// First-party proxy. Country comes from Vercel, never from a browser field.
const EVENTS=new Set(['page_view','engagement','section_view','application_viewed','application_started','application_step','message_prepared','message_copied','application_received','application_save_failed','telegram_handoff','direct_chat','calculator_used','application_cta']);
const ORIGINS=new Set(['https://www.scautdom.com','https://scautdom.com']);
const COLLECTOR='https://scautdom-crm-control.tutu5744.chatgpt.site/api/analytics/collect';
const traffic=input=>Object.fromEntries(['utm_source','utm_medium','utm_campaign','utm_content','ref','referrer'].flatMap(key=>{
  const value=input?.[key],rule=key==='referrer'?/^[a-z0-9.-]{1,180}$/:/^[a-zA-Z0-9_.-]{1,64}$/;
  return typeof value==='string'&&rule.test(value)?[[key,value]]:[];
}));
const advertising=x=>x?.source?.utm_source==='propellerads' && x.ad?.network==='propellerads' && /^[A-Za-z0-9._~-]{8,256}$/.test(x.ad.clickId||'') ? {network:'propellerads',clickId:x.ad.clickId,campaignId:/^\d{1,20}$/.test(x.ad.campaignId||'')?x.ad.campaignId:'',zoneId:/^\d{1,20}$/.test(x.ad.zoneId||'')?x.ad.zoneId:''} : null;
module.exports=async function handler(req,res){
  res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
  if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).end();}
  if(!ORIGINS.has(req.headers.origin)||(req.headers['sec-fetch-site']&&req.headers['sec-fetch-site']!=='same-origin'))return res.status(403).end();
  if(req.headers.dnt==='1'||req.headers['sec-gpc']==='1'||/bot|spider|crawler|slurp|headless/i.test(req.headers['user-agent']||''))return res.status(204).end();
  if(!/^application\/json(?:;|$)/i.test(req.headers['content-type']||''))return res.status(415).end();
  if(Number(req.headers['content-length']||0)>4096)return res.status(413).end();
  let x;try{x=typeof req.body==='string'?JSON.parse(req.body):req.body;}catch{return res.status(400).end();}
  if(!x||x.v!==2||JSON.stringify(x).length>4096||!EVENTS.has(x.event)||!['sessionId','visitorId','pageId','eventId'].every(k=>typeof x[k]==='string'&&/^[a-f0-9]{32}$/.test(x[k])))return res.status(400).end();
  const payload={v:2,sessionId:x.sessionId,visitorId:x.visitorId,pageId:x.pageId,eventId:x.eventId,event:x.event,page:x.page,flow:x.flow,step:x.step,section:x.section,
    source:traffic(x.source),firstSource:traffic(x.firstSource),ad:advertising(x),device:x.device,engagedMs:x.engagedMs,scroll:x.scroll,
    country:/^[A-Z]{2}$/.test(req.headers['x-vercel-ip-country']||'')?req.headers['x-vercel-ip-country']:'ZZ'};
  try{
    const response=await fetch(COLLECTOR,{method:'POST',redirect:'manual',signal:AbortSignal.timeout(3500),headers:{'Content-Type':'application/json',Origin:req.headers.origin},body:JSON.stringify(payload)});
    return res.status(response.status===204?204:[400,409,429].includes(response.status)?response.status:503).end();
  }catch{return res.status(503).end();}
};
