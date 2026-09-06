const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const {webcrypto}=require('node:crypto');
const source=fs.readFileSync(require('node:path').join(__dirname,'../assets/analytics.js'),'utf8');
const memory=()=>{const items=new Map();return {getItem:k=>items.get(k)||null,setItem:(k,v)=>items.set(k,v),removeItem:k=>items.delete(k)};};
function run(search,storage={},choice='granted',privacy={}){
  const localStorage=storage.localStorage||memory(),sessionStorage=storage.sessionStorage||memory();
  localStorage.setItem('sd.analytics.choice.v1',JSON.stringify({value:choice,at:Date.now()}));
  const sent=[],listeners={};
  const context={URL,URLSearchParams,crypto:webcrypto,Uint8Array,Date,performance:{now:()=>0},AbortSignal,
    location:{hostname:'www.scautdom.com',pathname:'/',search},navigator:{userAgent:'Mobile',...privacy},localStorage,sessionStorage,
    document:{referrer:'',visibilityState:'visible',documentElement:{scrollHeight:1000},querySelectorAll:()=>[],addEventListener:()=>{}},
    innerHeight:500,scrollY:0,addEventListener:(name,fn)=>{listeners[name]=fn;},setTimeout:()=>{},setInterval:()=>{},
    fetch:async(url,options)=>{sent.push({url,body:JSON.parse(options.body)});return {ok:true};}};
  context.window=context;vm.runInNewContext(source,context);return {...context,sent,listeners};
}
const link=id=>'?utm_source=propellerads&utm_campaign=md_ru_tg_scout_v1&utm_content=17&clickid='+id+'&pa_campaign=55&pa_zone=77';
test('declined statistics and browser privacy signals prevent click collection',()=>{
  for(const [choice,privacy] of [['denied',{}],['granted',{doNotTrack:'1'}],['granted',{globalPrivacyControl:true}]]){
    const r=run(link('click-12345678'),{},choice,privacy);assert.equal(r.sent.length,0);assert.equal(r.ScautdomAnalytics.context(),null);assert.equal(r.sessionStorage.getItem('sd.analytics.session.v1'),null);
  }
});
test('click survives internal navigation while another paid click starts a new visit',()=>{
  const a=run(link('click-12345678'));
  assert.equal(a.sent[0].body.ad.clickId,'click-12345678');assert.equal(a.sent[0].body.ad.zoneId,'77');
  assert.deepEqual(Object.keys(a.ScautdomAnalytics.context()),['sessionId']);
  const b=run('',a);assert.equal(b.sent[0].body.sessionId,a.sent[0].body.sessionId);assert.equal(b.sent[0].body.ad.clickId,'click-12345678');
  const c=run(link('click-87654321'),b);assert.notEqual(c.sent[0].body.sessionId,b.sent[0].body.sessionId);assert.equal(c.sent[0].body.ad.clickId,'click-87654321');
  assert(!a.localStorage.getItem('sd.analytics.visitor.v1').includes('click-12345678'));
});
test('unexpanded macros, other sources and email-shaped values are not click IDs',()=>{
  for(const q of [link('${SUBID}'),link('name@example.com'),link('click-12345678').replace('propellerads','another')])assert.equal(run(q).sent[0].body.ad,null);
});
test('revoking statistics clears stored attribution',()=>{
  const r=run(link('click-12345678'));r.localStorage.setItem('sd.analytics.choice.v1',JSON.stringify({value:'denied',at:Date.now()}));
  r.listeners.storage({key:'sd.analytics.choice.v1'});assert.equal(r.ScautdomAnalytics.context(),null);assert.equal(r.sessionStorage.getItem('sd.analytics.session.v1'),null);
});
