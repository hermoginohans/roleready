import http from 'node:http';
import worker from '../worker/index.js';
import {readAssets} from './assets.mjs';
const assets=await readAssets();
const port=Number(process.env.PORT||3000);
http.createServer(async(req,res)=>{try{const parts=[];let size=0;for await(const c of req){size+=c.length;if(size>160000){res.writeHead(413);res.end('Too large');return;}parts.push(c);}const request=new Request('http://localhost:'+port+req.url,{method:req.method,headers:req.headers,...(req.method==='GET'||req.method==='HEAD'?{}:{body:Buffer.concat(parts)})});const r=await worker.fetch(request,{...process.env,ASSETS:assets});res.writeHead(r.status,Object.fromEntries(r.headers));res.end(Buffer.from(await r.arrayBuffer()));}catch{res.writeHead(500);res.end('Server error');}}).listen(port,'127.0.0.1',()=>console.log('Local: http://localhost:'+port));
