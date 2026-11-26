import {Database} from 'bun:sqlite';
import {mkdirSync} from 'node:fs';
import {validate,catalogue,changes,personalize,rankWithGroq,research} from './scout.js';
mkdirSync('data',{recursive:true});
const db=new Database('data/scout.sqlite',{create:true});
db.exec('CREATE TABLE IF NOT EXISTS state (key TEXT PRIMARY KEY, value TEXT NOT NULL)');
const get=key=>{const r=db.query('SELECT value FROM state WHERE key=?').get(key);return r?JSON.parse(r.value):null;};
const put=(key,value)=>db.query('INSERT OR REPLACE INTO state VALUES (?,?)').run(key,JSON.stringify(value));
let searching=false;
const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'};
const json=(body,status=200)=>Response.json(body,{status,headers});
Bun.serve({hostname:process.env.HOST||'127.0.0.1',port:Number(process.env.PORT||8080),maxRequestBodySize:16384,idleTimeout:120,async fetch(req){
  const url=new URL(req.url);
  if(req.method==='GET'&&url.pathname==='/health')return json({ok:true,connectorConfigured:Boolean(process.env.SCOUT_GATEWAY_URL),rankerConfigured:Boolean(process.env.SCOUT_RANK_URL&&process.env.SCOUT_RANK_TOKEN),researchConfigured:Boolean(process.env.SCOUT_EXA_GATEWAY_URL)});
  if(req.method==='GET'&&url.pathname==='/api/state')return json({preferences:get('preferences'),saved:get('saved')||[],lastResult:get('lastResult')});
  if(req.method==='POST') {
    if(req.headers.get('origin')!==url.origin)return json({error:'Please use the Stage Scout page to make changes.'},403);
    try {
      const body=await req.json();
      if(url.pathname==='/api/save') {
        const id=Number(body.id),saved=get('saved')||[];const existing=saved.find(x=>x.id===id);
        const item=(get('lastResult')?.items||[]).find(x=>x.id===id);
        if(!existing&&!item)return json({error:'Search for this performance before saving it.'},400);
        const next=existing?saved.filter(x=>x.id!==id):[...saved,item];put('saved',next);return json({saved:next});
      }
      if(url.pathname==='/api/scout') {
        if(searching)return json({error:'A search is already running. Give it a moment.'},429);
        const query=validate(body);searching=true;
        try {
          const found=await catalogue(query);const snapshotKey='snapshot:'+JSON.stringify([query.city.toLowerCase(),query.state,query.from,query.to,query.regional]);
          const previous=get(snapshotKey);let result;
          try{result=await rankWithGroq(query,found.items,process.env.SCOUT_RANK_URL,process.env.SCOUT_RANK_TOKEN)||await personalize(query,found.items,process.env.SCOUT_GATEWAY_URL);}
          catch{result={mode:'catalogue',items:found.items,note:'Taste recommendations are temporarily unavailable. These are matching catalogue listings.'};}
          result.items=previous?changes(previous,result.items):result.items;
          let web;
          try {web=await research(query,process.env.SCOUT_EXA_GATEWAY_URL);}
          catch {web={sources:[],note:'Web research is temporarily unavailable. Catalogue results are still shown.'};}
          result={...result,web,query,checkedAt:new Date().toISOString(),truncated:found.truncated};
          put(snapshotKey,found.items);put('preferences',query);put('lastResult',result);return json(result);
        }finally{searching=false;}
      }
    }catch(error){return json({error:error.message||'Something went wrong. Please try again.'},400);}
  }
  const files={'/':'index.html','/app.js':'app.js','/style.css':'style.css'};
  if(req.method==='GET'&&files[url.pathname])return new Response(Bun.file(new URL('./public/'+files[url.pathname],import.meta.url)),{headers:{...headers,'Content-Security-Policy':"default-src 'self'; img-src 'self' https:; style-src 'self'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'"}});
  return json({error:'Not found'},404);
}});
console.log('Stage Scout listening on port '+(process.env.PORT||8080));
