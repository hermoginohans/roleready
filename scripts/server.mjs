import http from 'node:http';
import {pathToFileURL} from 'node:url';
import worker from '../worker/index.js';
import {readAssets} from './assets.mjs';

export async function createAppServer(env=process.env){
 const assets=await readAssets();
 return http.createServer(async(req,res)=>{
  try{
   const parts=[];let size=0;
   for await(const chunk of req){
    size+=chunk.length;
    if(size>160000){res.writeHead(413);res.end('Too large');return;}
    parts.push(chunk);
   }
   // Render terminates HTTPS at its proxy. Preserve the public origin so the
   // worker's same-origin check also works on the deployed HTTPS website.
   const protocol=env.RENDER==='true'&&req.headers['x-forwarded-proto']==='https'?'https':'http';
   const origin=env.PUBLIC_URL||`${protocol}://${req.headers.host}`;
   const request=new Request(new URL(req.url,origin),{
    method:req.method,headers:req.headers,
    ...(req.method==='GET'||req.method==='HEAD'?{}:{body:Buffer.concat(parts)})
   });
   const response=await worker.fetch(request,{...env,ASSETS:assets});
   res.writeHead(response.status,Object.fromEntries(response.headers));
   res.end(Buffer.from(await response.arrayBuffer()));
  }catch{res.writeHead(500);res.end('Server error');}
 });
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const port=Number(process.env.PORT||3000);
 const server=await createAppServer();
 server.listen(port,process.env.HOST||'0.0.0.0',()=>console.log(`RoleReady listening on port ${port}`));
 for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>server.close(()=>process.exit(0)));
}
