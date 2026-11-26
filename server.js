import {Database} from 'bun:sqlite';
import {mkdirSync} from 'node:fs';
import {createHash, randomUUID} from 'node:crypto';
import {validate,catalogue,changes,personalize,rankWithGroq,research} from './scout.js';

mkdirSync('data',{recursive:true});
const db=new Database('data/scout.sqlite',{create:true});
db.exec(`CREATE TABLE IF NOT EXISTS state (key TEXT PRIMARY KEY, value TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS rate_limits (bucket TEXT PRIMARY KEY, window_start INTEGER NOT NULL, count INTEGER NOT NULL);`);
const get=key=>{const row=db.query('SELECT value FROM state WHERE key=?').get(key);return row?JSON.parse(row.value):null;};
const put=(key,value)=>db.query('INSERT OR REPLACE INTO state VALUES (?,?)').run(key,JSON.stringify(value));
const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'};
const windowMs=Number(process.env.SCOUT_RATE_WINDOW_MS||3600000);
const visitorLimit=Number(process.env.SCOUT_VISITOR_SEARCH_LIMIT||8);
const ipLimit=Number(process.env.SCOUT_IP_SEARCH_LIMIT||24);
const globalLimit=Number(process.env.SCOUT_GLOBAL_SEARCH_LIMIT||160);
const concurrencyLimit=Number(process.env.SCOUT_SEARCH_CONCURRENCY||4);
const publicOrigin=process.env.SCOUT_PUBLIC_ORIGIN||'https://stage-scout-hkui.sprites.app';
let activeSearches=0;

function cookieValue(header,name){return (header||'').split(';').map(part=>part.trim()).find(part=>part.startsWith(name+'='))?.slice(name.length+1)||null;}
function visitor(req){
  const existing=cookieValue(req.headers.get('cookie'),'scout_vid');
  if(existing&&/^[a-f0-9-]{36}$/i.test(existing))return {id:existing,new:false};
  return {id:randomUUID(),new:true};
}
function visitorHeaders(current){
  const next=new Headers(headers);
  if(current.new)next.append('Set-Cookie',`scout_vid=${current.id}; Path=/; Max-Age=2592000; HttpOnly; SameSite=Lax; Secure`);
  return next;
}
function json(body,status,current){return Response.json(body,{status,headers:visitorHeaders(current)});}
function respond(response,current){
  if(!current.new)return response;
  const next=new Headers(response.headers);next.append('Set-Cookie',`scout_vid=${current.id}; Path=/; Max-Age=2592000; HttpOnly; SameSite=Lax; Secure`);
  return new Response(response.body,{status:response.status,statusText:response.statusText,headers:next});
}
function hash(value){return createHash('sha256').update(value).digest('base64url');}
function clientAddress(req){return req.headers.get('fly-client-ip')||req.headers.get('x-real-ip')||req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'unknown';}
function takeLimit(current,req){
  const now=Date.now();const start=now-now%windowMs;
  const limits=[[`visitor:${hash(current.id)}`,visitorLimit],[`network:${hash(clientAddress(req))}`,ipLimit],['global',globalLimit]];
  const read=db.query('SELECT window_start,count FROM rate_limits WHERE bucket=?');
  const blocked=limits.find(([bucket,limit])=>{const row=read.get(bucket);return row&&row.window_start===start&&row.count>=limit;});
  if(blocked)return {ok:false,retryAfter:Math.ceil((start+windowMs-now)/60000)};
  const write=db.query('INSERT OR REPLACE INTO rate_limits (bucket,window_start,count) VALUES (?,?,?)');
  for(const [bucket] of limits){const row=read.get(bucket);write.run(bucket,start,row&&row.window_start===start?row.count+1:1);}
  return {ok:true};
}
function stateKey(current,key){return `visitor:${current.id}:${key}`;}

Bun.serve({hostname:process.env.HOST||'127.0.0.1',port:Number(process.env.PORT||8080),maxRequestBodySize:16384,idleTimeout:120,async fetch(req){
  const url=new URL(req.url);const current=visitor(req);
  if(req.method==='GET'&&url.pathname==='/health')return json({ok:true,connectorConfigured:Boolean(process.env.SCOUT_GATEWAY_URL),rankerConfigured:Boolean(process.env.SCOUT_RANK_URL&&process.env.SCOUT_RANK_TOKEN),researchConfigured:Boolean(process.env.SCOUT_EXA_GATEWAY_URL),publicReady:true},200,current);
  if(req.method==='GET'&&url.pathname==='/api/state')return json({preferences:get(stateKey(current,'preferences')),saved:get(stateKey(current,'saved'))||[],lastResult:get(stateKey(current,'lastResult'))},200,current);
  if(req.method==='POST'){
    const origin=req.headers.get('origin');
    if(origin!==url.origin&&origin!==publicOrigin)return json({error:'Please use the Stage Scout page to make changes.'},403,current);
    try{
      const body=await req.json();
      if(url.pathname==='/api/save'){
        const id=Number(body.id),saved=get(stateKey(current,'saved'))||[];const existing=saved.find(x=>x.id===id);
        const item=(get(stateKey(current,'lastResult'))?.items||[]).find(x=>x.id===id);
        if(!existing&&!item)return json({error:'Search for this performance before saving it.'},400,current);
        if(!existing&&saved.length>=50)return json({error:'Your shortlist is full. Remove a saved production before adding another.'},400,current);
        const next=existing?saved.filter(x=>x.id!==id):[...saved,item];put(stateKey(current,'saved'),next);return json({saved:next},200,current);
      }
      if(url.pathname==='/api/scout'){
        const query=validate(body);const rate=takeLimit(current,req);
        if(!rate.ok)return json({error:`You’ve reached the search limit. Please try again in about ${rate.retryAfter} minute${rate.retryAfter===1?'':'s'}.`},429,current);
        if(activeSearches>=concurrencyLimit)return json({error:'Scout is busy with a few searches. Please try again in a moment.'},429,current);
        activeSearches++;
        try{
          const found=await catalogue(query);const snapshotKey=stateKey(current,'snapshot:'+JSON.stringify([query.city.toLowerCase(),query.state,query.from,query.to,query.regional]));
          const previous=get(snapshotKey);let result;
          try{result=await rankWithGroq(query,found.items,process.env.SCOUT_RANK_URL,process.env.SCOUT_RANK_TOKEN)||await personalize(query,found.items,process.env.SCOUT_GATEWAY_URL);}
          catch{result={mode:'catalogue',items:found.items,note:'Taste recommendations are temporarily unavailable. These are matching catalogue listings.'};}
          result.items=previous?changes(previous,result.items):result.items;
          let web;
          try{web=await research(query,process.env.SCOUT_EXA_GATEWAY_URL);}
          catch{web={sources:[],note:'Web research is temporarily unavailable. Catalogue results are still shown.'};}
          result={...result,web,query,checkedAt:new Date().toISOString(),truncated:found.truncated};
          put(snapshotKey,found.items);put(stateKey(current,'preferences'),query);put(stateKey(current,'lastResult'),result);return json(result,200,current);
        }finally{activeSearches--;}
      }
    }catch(error){return json({error:error.message||'Something went wrong. Please try again.'},400,current);}
  }
  const files={'/':'index.html','/app.js':'app.js','/style.css':'style.css'};
  if(req.method==='GET'&&files[url.pathname])return respond(new Response(Bun.file(new URL('./public/'+files[url.pathname],import.meta.url)),{headers:{...headers,'Content-Security-Policy':"default-src 'self'; img-src 'self' https:; style-src 'self'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'"}}),current);
  return json({error:'Not found'},404,current);
}});
console.log('Stage Scout listening on port '+(process.env.PORT||8080));
