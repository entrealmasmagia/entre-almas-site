import assert from 'node:assert/strict';
import {paymentModes,checkoutPayload} from '../lib/payments.ts';
assert.deepEqual(paymentModes({PAYMENTS_ENABLED:'true',PIX_ENABLED:'true',CARD_ENABLED:'true'}),{pix:true,pix2:false,card:true});
assert.deepEqual(paymentModes({PAYMENTS_ENABLED:'false',PIX_ENABLED:'true',CARD_ENABLED:'true'}),{pix:false,pix2:false,card:false});
assert.deepEqual(paymentModes({PAYMENTS_ENABLED:'true',PIX_VERIFIED:'true',CARD_FEES_VERIFIED:'true'}),{pix:false,pix2:false,card:false});
assert.deepEqual(paymentModes({PAYMENTS_ENABLED:'true',PIX_ENABLED:'true',CARD_ENABLED:'false',PIX_SPLIT_VERIFIED:'true'}),{pix:true,pix2:false,card:false});
const p=checkoutPayload({id:'LOCAL',total:3500,customer:JSON.stringify({name:'Teste local',email:'test@example.com',phone:'61999999999'})},'https://example.com','salade_sinais','card');
assert.equal(p.items[0].price,3500);assert.equal(p.options.assured_installments,0);assert.deepEqual(p.options.payment_methods_enabled,['credit_card']);
console.log('Operational activation separated from verification. PIX2 remains manual; no duplicated card fee. No charge generated.');
