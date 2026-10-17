import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createAppServer} from '../scripts/server.mjs';

test('production server serves assets and accepts the Render HTTPS origin',async()=>{
 const server=await createAppServer({RENDER:'true',OPENAI_API_KEY:'test'});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base=`http://127.0.0.1:${server.address().port}`;
 try{
  assert.deepEqual(await(await fetch(base+'/api/status')).json(),{ready:true});
  assert.equal((await fetch(base+'/vendor/mammoth.js')).status,200);
  const send=origin=>fetch(base+'/api/tailor',{method:'POST',headers:{origin,'x-forwarded-proto':'https','Content-Type':'application/json'},body:JSON.stringify({resume:'short',job:'short'})});
  // A matching public origin passes the origin check and reaches validation.
  assert.equal((await send(base.replace('http:','https:'))).status,400);
  assert.equal((await send('https://foreign.example')).status,403);
  assert.equal((await fetch(base+'/api/tailor',{method:'POST',body:'x'.repeat(160001)})).status,413);
 }finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
});
