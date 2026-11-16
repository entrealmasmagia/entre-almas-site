export const paymentTestAmount=3500;
export function isPaymentTest(order:any){
 try{const items=JSON.parse(order.items),c=JSON.parse(order.customer);return typeof order.id==='string'&&order.id.startsWith('EA-TEST-')&&c.technicalTest===true&&order.total===paymentTestAmount&&items.length===1&&items[0].id==='__technical_test'&&items[0].points===0&&items[0].duration===0}catch{return false}
}
export function mayConfirmPayment(env:Record<string,unknown>,order:any,bill?:any){return isPaymentTest(order)?env.INFINITEPAY_TESTS_ENABLED==='true':env.PAYMENTS_ENABLED==='true'||typeof bill?.checkout==='string'&&bill.checkout.startsWith('https://checkout.infinitepay.io/')}
