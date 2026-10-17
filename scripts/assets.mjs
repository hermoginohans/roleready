import {readFile} from 'node:fs/promises';
export async function readAssets(){
 const names=['pdf.mjs','pdf.worker.mjs','mammoth.js','jspdf.js'];
 const assets=Object.fromEntries(await Promise.all(names.map(async name=>['/vendor/'+name,await readFile(new URL('../vendor/'+name,import.meta.url),'utf8')])));
 const fonts={};for(const name of ['NotoSans-Regular.ttf','NotoSans-Bold.ttf','NotoSerif-Bold.ttf'])fonts[name]=(await readFile(new URL('../vendor/'+name,import.meta.url))).toString('base64');
 assets['/vendor/resume-fonts.json']=JSON.stringify(fonts);return assets;
}
