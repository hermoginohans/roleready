import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import worker from '../worker/index.js';
const req=(body,origin='https://example.com')=>new Request('https://example.com/api/tailor',{method:'POST',headers:{origin,'Content-Type':'application/json'},body:JSON.stringify(body)});
test('page and browser script parse; endpoints report missing connection',async()=>{
 const page=await worker.fetch(new Request('https://example.com/'));
 assert.equal(page.status,200);const html=await page.text();new vm.Script(html.match(/<script>([\s\S]*?)<\/script>/)[1]);
 assert.equal((await worker.fetch(req({}))).status,503);
 assert.deepEqual(await(await worker.fetch(new Request('https://example.com/api/status'))).json(),{ready:false});
});
test('validates input and rejects foreign origins before calling AI',async()=>{
 assert.equal((await worker.fetch(req({resume:'short',job:'short'}),{OPENAI_API_KEY:'test'})).status,400);
 assert.equal((await worker.fetch(req({},'https://foreign.com'),{OPENAI_API_KEY:'test'})).status,403);
});
test('copies the edited cover letter and selects text if clipboard access fails',async()=>{
 const html=await(await worker.fetch(new Request('https://example.com/'))).text();
 const nodes=new Map();let copied,selected=false;
 const element=id=>{if(!nodes.has(id))nodes.set(id,{value:'',textContent:'',addEventListener(){},focus(){},select(){selected=true;}});return nodes.get(id);};
 const clipboard={writeText:async value=>{copied=value;}};
 const context=vm.createContext({document:{getElementById:element},navigator:{clipboard},window:{},fetch:async()=>({json:async()=>({ready:false})})});
 vm.runInContext(html.match(/<script>([\s\S]*?)<\/script>/)[1],context);
 element('coverLetter').value='My edited cover letter';await element('copyCoverLetter').onclick();
 assert.equal(copied,'My edited cover letter');assert.equal(element('coverLetterStatus').textContent,'Cover letter copied.');
 clipboard.writeText=async()=>{throw Error('Permission denied');};await element('copyCoverLetter').onclick();assert.equal(selected,true);assert.match(element('coverLetterStatus').textContent,/Ctrl\+C/);
 element('coverLetter').value='';await element('copyCoverLetter').onclick();assert.match(element('coverLetterStatus').textContent,/enter a cover letter/);
});
test('tailoring sends factual constraints, handles upstream errors and returns structured output',async()=>{
 const original=globalThis.fetch;try{
 const expected={resume:'A factual resume',coverLetter:'Dear Hiring Team,\nMy support experience aligns with this role.',review:['Relevant support experience; Salesforce is not evidenced.'],changes:['Reworded summary'],gaps:['Salesforce not evidenced']};
 globalThis.fetch=async(url,options)=>{assert.equal(url,'https://api.openai.com/v1/responses');const input=JSON.parse(options.body);assert.equal(input.store,false);assert.match(input.instructions,/Never invent/);assert.equal(input.text.format.strict,true);return Response.json({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify(expected)}]}]});};
 assert.deepEqual(await(await worker.fetch(req({resume:'a'.repeat(100),job:'b'.repeat(100)}),{OPENAI_API_KEY:'test'})).json(),expected);
 globalThis.fetch=async()=>new Response('',{status:429});assert.equal((await worker.fetch(req({resume:'a'.repeat(100),job:'b'.repeat(100)}),{OPENAI_API_KEY:'test'})).status,502);
 }finally{globalThis.fetch=original;}
});
