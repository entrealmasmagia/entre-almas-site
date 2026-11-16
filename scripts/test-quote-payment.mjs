import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const source=fs.readFileSync('app/api/shop/route.ts','utf8');
const branch=source.slice(source.indexOf(" if(b.action==='acceptQuote')"),source.indexOf(" if(b.action==='redeem')"));
const code=ts.transpile(branch,{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.None});
const run=new (Object.getPrototypeOf(async function(){}).constructor)('b','one','owned','catalog','db','stmt','out','fail','owner','now',code);
async function execute(mode,splitConsent,status='Proposta enviada',existing=null){
 const writes=[];const q={id:'Q-local',owner:'owner',status,amount:54700,service_id:'personalizado',customer:'{}',proposal:'Proposta de teste',order_id:existing};
 const result=await run({action:'acceptQuote',id:q.id,consent:true,paymentMode:mode,splitConsent},async()=>q,(q,owner)=>assert.equal(q.owner,owner),async()=>[{id:'personalizado',name:'Personalizado',kind:'ritual'}],()=>({batch:async a=>writes.push(...a)}),(sql,...args)=>({sql,args}),x=>x,s=>{throw Error(s)},'owner','2026-11-14T23:00:00Z');
 return {result,writes};
}
for(const mode of ['pix','pix2','card']){const {writes}=await execute(mode,true);assert.equal(writes.length,2);assert.equal(writes[0].args.at(-1),mode);assert.equal(writes[0].args[4],54700);assert.equal(writes[0].sql.match(/\?/g).length,writes[0].args.length)}
await assert.rejects(execute('pix2',false),/quitação/);
await assert.rejects(execute('card',true,'Em análise'),/proposta/);
assert.equal((await execute('card',true,'Aceito','EA-existing')).writes.length,0);
console.log('Approved custom quotes: three modes, split consent, unapproved and repeated acceptance verified. No database/provider writes.');
