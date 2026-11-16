/** Reserve a browser tab during the click, before the asynchronous API request. */
export function beginCheckout(){
  const tab=window.open('about:blank','_blank');
  if(tab)tab.opener=null;
  return {
    open(value:unknown){
      const url=new URL(typeof value==='string'?value:'');
      if(url.protocol!=='https:'||url.hostname!=='checkout.infinitepay.io'||url.username||url.password)throw Error('Endereço de pagamento inválido. Entre em contato com o atendimento.');
      if(tab&&!tab.closed)tab.location.replace(url.href);
      return url.href;
    },
    cancel(){if(tab&&!tab.closed)tab.close();}
  };
}

export async function postShop(body:unknown){
  let r:Response;
  try{r=await fetch('/api/shop',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});}
  catch{throw Error('Falha de conexão. Consulte seus pedidos antes de tentar novamente.');}
  const d:any=await r.json().catch(()=>null);
  if(!r.ok||!d)throw Error(d?.error||(r.status===401?'Entre com sua conta para continuar.':'Não foi possível concluir. Consulte seus pedidos ou fale pelo WhatsApp.'));
  return d;
}
