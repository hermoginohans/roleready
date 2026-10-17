import {mkdir,copyFile,readFile,writeFile} from 'node:fs/promises';
import {readAssets} from './assets.mjs';
await mkdir(new URL('../dist/server/',import.meta.url),{recursive:true});
await mkdir(new URL('../dist/.openai/',import.meta.url),{recursive:true});
const source=await readFile(new URL('../worker/index.js',import.meta.url),'utf8');
const awaitedAssets=await readAssets();
await writeFile(new URL('../dist/server/index.js',import.meta.url),source.replace('const bundledAssets = {};',()=> 'const bundledAssets = '+JSON.stringify(awaitedAssets)+';'));
await copyFile(new URL('../.openai/hosting.json',import.meta.url),new URL('../dist/.openai/hosting.json',import.meta.url));
console.log('Worker artifact built.');
