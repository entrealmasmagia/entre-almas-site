export const referenceRates=[4.20,6.09,7.01,7.91,8.80,9.67,12.59,13.42,14.25,15.06,15.87,16.66];
// Integer arithmetic prevents floating-point errors at exact cent boundaries.
export function grossForNet(net:number,rate:number){
 const bps=Math.round(rate*100);
 if(!Number.isSafeInteger(net)||net<1||!Number.isFinite(rate)||rate<0||rate>=100||Math.abs(rate*100-bps)>1e-8)throw Error('Valor ou taxa inválida.');
 const denominator=BigInt(10000-bps),numerator=BigInt(net)*BigInt(10000);
 const gross=Number((numerator+denominator-BigInt(1))/denominator);
 if(!Number.isSafeInteger(gross))throw Error('Valor fora do limite.');
 return gross;
}
export function splitAmounts(total:number){if(!Number.isSafeInteger(total)||total<200)throw Error('Valor insuficiente.');const a=Math.floor(total/2);return [a,total-a]}
