import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {crc32} from 'node:zlib';
import vm from 'node:vm';
import worker from '../worker/index.js';
import {readAssets} from '../scripts/assets.mjs';

async function importer(){
 const html=await(await worker.fetch(new Request('https://example.com/'))).text();
 const elements=new Map();
 const context=vm.createContext({Uint8Array,setTimeout,window:{},document:{getElementById(id){if(!elements.has(id))elements.set(id,{value:'',addEventListener(){}});return elements.get(id);}},fetch:async()=>({json:async()=>({ready:false})})});
 vm.runInContext(html.match(/<script>([\s\S]*?)<\/script>/)[1],context);
 return vm.runInContext('readResumeFile',context);
}
function file(name,data){const b=Buffer.from(data);return{name,size:b.length,text:async()=>b.toString(),arrayBuffer:async()=>b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength)};}
function zip(files){
 const locals=[],central=[];let offset=0;
 for(const [name,value] of Object.entries(files)){const n=Buffer.from(name),b=Buffer.from(value),crc=crc32(b);const l=Buffer.alloc(30);l.writeUInt32LE(0x04034b50);l.writeUInt16LE(20,4);l.writeUInt32LE(crc,14);l.writeUInt32LE(b.length,18);l.writeUInt32LE(b.length,22);l.writeUInt16LE(n.length,26);locals.push(l,n,b);
 const c=Buffer.alloc(46);c.writeUInt32LE(0x02014b50);c.writeUInt16LE(20,4);c.writeUInt16LE(20,6);c.writeUInt32LE(crc,16);c.writeUInt32LE(b.length,20);c.writeUInt32LE(b.length,24);c.writeUInt16LE(n.length,28);c.writeUInt32LE(offset,42);central.push(c,n);offset+=l.length+n.length+b.length;}
 const directory=Buffer.concat(central),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(Object.keys(files).length,8);end.writeUInt16LE(Object.keys(files).length,10);end.writeUInt32LE(directory.length,12);end.writeUInt32LE(offset,16);return Buffer.concat([...locals,directory,end]);
}
function pdf(text='Resume Experience'){
 const stream=text?'BT /F1 12 Tf 72 720 Td ('+text+') Tj ET':'';
 const objects=['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>','<< /Length '+Buffer.byteLength(stream)+' >>\nstream\n'+stream+'\nendstream'];
 let result='%PDF-1.4\n';const offsets=[0];for(let i=0;i<objects.length;i++){offsets.push(Buffer.byteLength(result));result+=(i+1)+' 0 obj\n'+objects[i]+'\nendobj\n';}const start=Buffer.byteLength(result);result+='xref\n0 6\n0000000000 65535 f \n'+offsets.slice(1).map(o=>String(o).padStart(10,'0')+' 00000 n \n').join('')+'trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n'+start+'\n%%EOF';return result;
}
test('imports text and rejects unsupported, empty and oversized input',async()=>{
 const read=await importer();assert.equal(await read(file('resume.TXT','Resume\r\nExperience')),'Resume\nExperience');
 await assert.rejects(read(file('resume.doc','old file')),/save as .docx/);
 await assert.rejects(read(file('resume.txt','   ')),/No resume text/);
 await assert.rejects(read({name:'resume.pdf',size:11*1024*1024}),/10 MB/);
 await assert.rejects(read(file('resume.txt','a'.repeat(40001))),/40,000/);
});
test('extracts a real Word document using the bundled reader',async()=>{
 const context=vm.createContext({setTimeout,clearTimeout,Uint8Array,ArrayBuffer,TextDecoder,TextEncoder,console});context.window=context;
 vm.runInContext(await readFile(new URL('../vendor/mammoth.js',import.meta.url),'utf8'),context);
 const doc=zip({'[Content_Types].xml':'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>','_rels/.rels':'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>','word/document.xml':'<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Alex Morgan</w:t></w:r></w:p><w:p><w:r><w:t>Customer Support Experience</w:t></w:r></w:p></w:body></w:document>'});
 const read=await importer();const text=await read(file('resume.docx',doc),{word:async()=>context.mammoth});assert.match(text,/Alex Morgan/);assert.match(text,/Customer Support Experience/);
 await assert.rejects(read(file('bad.docx','not a zip'),{word:async()=>context.mammoth}),/could not be read/);
});
test('extracts real PDF text and detects image-only PDFs',async()=>{
 // Text extraction does not render; Node lacks the browser DOMMatrix constructor.
 globalThis.DOMMatrix??=class DOMMatrix{};
 const reader=await import('../vendor/pdf.mjs');reader.GlobalWorkerOptions.workerSrc=new URL('../vendor/pdf.worker.mjs',import.meta.url).href;
 const readers={pdf:async()=>({GlobalWorkerOptions:{},getDocument:reader.getDocument})};
 const read=await importer();assert.equal(await read(file('resume.pdf',pdf()),readers),'Resume Experience');
 await assert.rejects(read(file('scan.pdf',pdf('')),readers),/scanned PDF/);
});
test('serves local reader assets with JavaScript content type',async()=>{
 const assets=await readAssets();for(const path of Object.keys(assets)){const r=await worker.fetch(new Request('https://example.com'+path),{ASSETS:assets});assert.equal(r.status,200);assert.match(r.headers.get('Content-Type'),path.endsWith('.json')?/json/:/javascript/);assert.ok((await r.text()).length>1000);}
});
