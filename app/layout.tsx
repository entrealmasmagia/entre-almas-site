import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'Entre Almas | Cartomancia & Magia',description:'Consultas oraculares, trabalhos espirituais e Acesso Oculto VIP com Janaína. Atendimento individualizado, exclusivamente online por mensagens.',icons:{icon:'/favicon.svg'}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="pt-BR"><body>{children}</body></html>}
