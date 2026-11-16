import assert from 'node:assert/strict';
import {products,calculate} from '../lib/catalog.ts';
import {referenceRates,grossForNet,splitAmounts} from '../lib/commerce-rules.ts';
import {checkoutPayload,paymentModes,confirmedPayment} from '../lib/payments.ts';
const customer=JSON.stringify({name:'Teste local',email:'test@example.com',phone:'61999999999'});
let cases=0;
for(const p of products.filter(p=>p.kind!=='vip'&&p.price!==null&&!p.quoteOnly)){
 for(const extra of [false,true]){
  const quote=calculate([{id:p.id,qty:1,extra}],products);
  for(const total of [quote.total,quote.total-(p.kind==='ritual'?Math.round(p.price*.10):0),quote.total-1]){
   const halves=splitAmounts(total);assert.equal(halves[0]+halves[1],total);assert.ok(Math.abs(halves[0]-halves[1])<=1);
   for(const rate of referenceRates){const g=grossForNet(total,rate),factor=BigInt(10000-Math.round(rate*100));assert.ok(BigInt(g)*factor>=BigInt(total)*10000n);assert.ok(BigInt(g-1)*factor<BigInt(total)*10000n)}
   for(const mode of ['pix','pix2','card'])for(const amount of mode==='pix2'?halves:[total]){
    const payload=checkoutPayload({id:'EA-LOCAL-P1',total:amount,customer},'https://example.com','salade_sinais',mode);
    assert.equal(payload.items[0].price,amount);assert.equal(payload.options.assured_installments,0);assert.equal(payload.options.single_payment,true);
    assert.deepEqual(payload.options.payment_methods_enabled,mode==='card'?['credit_card']:['credit_card','pix']);
    assert.ok(confirmedPayment(true,{success:true,paid:true,amount,paid_amount:grossForNet(amount,16.66)},amount));cases++;
   }
  }
 }
}
assert.equal(grossForNet(9580,4.20),10000);assert.equal(grossForNet(8334,16.66),10000);
assert.deepEqual(splitAmounts(81431),[40715,40716]);
for(const rate of [-1,100,NaN,Infinity,4.201])assert.throws(()=>grossForNet(10000,rate));
for(const n of [0,-1,1.2,NaN,Infinity])assert.throws(()=>grossForNet(n,4.2));
assert.deepEqual(paymentModes({}),{pix:false,pix2:false,card:false});
assert.deepEqual(paymentModes({PIX_VERIFIED:'true',PIX_SPLIT_VERIFIED:'true',CARD_FEES_VERIFIED:'true'}),{pix:false,pix2:false,card:false});
console.log(`${cases} payload/cálculo checks passed; all priced services; 12 rates; odd cents; no live API calls.`);
