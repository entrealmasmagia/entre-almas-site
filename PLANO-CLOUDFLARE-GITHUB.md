# ENTRE ALMAS — plano de migração segura (versão 12)

## Estado
Este pacote contém o código original exportado, separado do banco privado. Não foi publicado e os pagamentos permanecem desativados. **Não publicar em produção antes de substituir a autenticação específica do ChatGPT Sites.**

## Bloqueadores de segurança
1. `lib/store.ts` confia nos cabeçalhos `oai-authenticated-user-id` e `oai-authenticated-user-email`, que só são seguros quando inseridos por um gateway confiável. Na Cloudflare independente, substituir por autenticação com sessão verificada no servidor e autorização administrativa.
2. `app/chatgpt-auth.ts` e fluxo de login dependem da hospedagem original. Reimplementar login administrativo e recuperação de acesso.
3. Provisionar D1 (`DB`) e R2 (`BUCKET`) e associar os bindings ao Worker. Nunca importar o banco privado para o GitHub.
4. Configurar `INFINITEPAY_API_KEY` como secret da Cloudflare, nunca em código ou no navegador. Manter `PAYMENTS_ENABLED`, `PIX_ENABLED`, `CARD_ENABLED` desativados até teste real controlado.
5. Testar webhook verificando a transação junto ao provedor e idempotência de confirmações.

## Correções funcionais prioritárias
- Agenda: o backup contém 0 registros na tabela `availability`. Criar horários reais pelo painel autenticado, validar fuso de Brasília, duração e concorrência; não criar disponibilidade fictícia.
- Desconto de primeira contratação: a versão 12 só registra pedido de desconto e exige aprovação manual. Implementar elegibilidade baseada em identidade verificada e histórico de trabalhos espirituais, incluindo histórico anterior ao banco exportado; evitar uso repetido e corrida entre pedidos simultâneos. Aplicar desconto apenas à base elegível, sem urgência, e recalcular no servidor.
- Checkout: testar criação de cobrança PIX/cartão, retorno, conciliação e webhook em ambiente restrito; PIX em 2x para rituais via WhatsApp e execução somente após quitação integral.

## Etapas de implantação
1. Criar repositório GitHub **privado** e enviar apenas o conteúdo desta pasta.
2. Configurar projeto Cloudflare Workers, D1, R2 e variáveis/segredos no painel, após adaptar os identificadores de recursos.
3. Migrar o banco privado por canal seguro, somente após conferir backups e dados existentes.
4. Corrigir autenticação e testar isolamento entre clientes antes de expor qualquer endpoint.
5. Testar agenda, desconto, carrinho, cobranças e webhook com testes automatizados e manuais.
6. Publicar em domínio de testes; só depois de aprovação migrar o domínio público.

## Limites
A exportação não contém credenciais nem inventário completo de objetos R2 não referenciados. Não há confirmação de funcionamento fora do ChatGPT Sites.
