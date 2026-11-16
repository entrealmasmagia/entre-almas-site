# ENTRE ALMAS — atualização salva, sem publicação

## Estado desta entrega (14/11/2026)

Esta revisão preserva a identidade do projeto, o endereço gratuito, os registros antigos e os segredos existentes. Não publica, não abre acesso público e não ativa pagamentos. A produção continua na versão anteriormente publicada. As alterações de schema são aditivas e só serão aplicadas em produção em uma futura publicação autorizada.

## Implementado na nova versão

- Calendário de disponibilidade por blocos de 15 minutos, duração configurável por serviço e horário de Brasília. Reserva temporária de 30 minutos, com chave única por bloco e transação atômica para impedir sobreposições. Avulsas continuam sem agendamento. Confirmação definitiva após quitação integral; reservas expiradas exigem nova data disponível. Admin abre/fecha disponibilidade, preserva horários ocupados e reagenda pedidos quitados.
- Texto Sobre Mim solicitado, retrato real e seis fotografias reais em WebP, com ampliação. Fontes legíveis e preços em reais. Numeração decorativa das perguntas retirada. Adoçamento Simples não aparece nem aceita novas compras; histórico preservado.
- Proteção + Limpeza por R$766; Cortes & Afastamentos mantém R$577; personalizados a partir de R$547, com formulário, análise administrativa, proposta e aceite antes do pedido. Orientação opcional de consulta pré-magia R$177.
- Painel autenticado: serviços novos, categorias, preços, descrições, indicações, imagens, visibilidade, exclusão do catálogo sem apagar histórico, avaliação prévia, promoções, adicionais, descontos, disponibilidade, pedidos, clientes, propostas e fidelidade. Imagens novas utilizam R2; uploads precisam da publicação autorizada do binding.
- Desconto inicial de 10% depende de aprovação. Urgência espiritual R$277; prioridade de consulta R$27. Preços e totais calculados no servidor em centavos, com snapshots por pedido. Desconto não incide sobre urgência.
- Prazos dos trabalhos: 10–30 dias úteis; urgência até 5 dias úteis; ambos após quitação integral. No PIX 2x, jamais após os primeiros 50%.
- Pedido, parcelas, vencimento combinado, saldo pendente, início da contagem após quitação, mensagens WhatsApp e histórico individual.
- Fidelidade: meta12, recompensa original de 3 perguntas, pontuação diferenciada e histórico de resgates. Pontos após pagamento integral; deduplicação por pedido, transação, importação e resgate. O saldo não pode ficar negativo.

## Pagamentos: preparado não significa ativo

INFINITEPAY_API_KEY e ADMIN_EMAIL constavam como segredos na revisão5 da configuração. Valores não foram lidos nem divulgados. A presença no cadastro não comprova validade na InfinitePay nem presença no novo runtime, pois esta versão não foi publicada. O diagnóstico autenticado do painel mostra somente booleanos.

O servidor gera links em `POST https://api.checkout.infinitepay.io/links`, com total em centavos, identificador de parcela, customer, redirect_url e webhook. Usa X-Api-Key exclusivamente no servidor. `options.single_payment=true` impede repetir o link. `assured_installments=0` solicita repasse das taxas em todas as parcelas. Não aplicamos simultaneamente gross-up manual e repasse automático.

Confirmação utiliza `/payment_check`: exige success=true, paid=true, amount exato e modalidade correta. Cartão exige installments entre1 e12. Webhook usa invoice_slug e transaction_nsu. Voltar ao site ou abrir checkout nunca confirma sozinho. Repetições não somam o mesmo pagamento nem os mesmos pontos.

PIX integral: pedido quitado após confirmação oficial. PIX2: duas cobranças independentes, valores que somam exatamente o total mesmo com centavo ímpar; vencimento da segunda definido pelo admin conforme combinado. Primeira parcela mantém AGUARDANDO QUITAÇÃO; segunda libera pagamento confirmado e inicia prazo. O servidor impede execução sem100% e pontos antes da quitação. Cartão aprovado libera integralmente sem esperar vencimentos das parcelas do cartão.

**Limitação oficial:** a documentação atual de payment_methods_enabled mantém cartão ligado, permitindo apenas ligar/desligar PIX. Não foi validado um checkout exclusivamente PIX. A estrutura de duas parcelas existe no site, mas a modalidade PIX2 não pode ser anunciada como operacional até haver solução oficialmente suportada e testada. Pagamentos em modalidade divergente exigem conferência, sem liberação automática indevida.

A documentação oficial confirma que o Checkout Integrado utiliza as mesmas taxas do Link de Pagamento da conta. O print enviado mostra o plano 1 Dia Útil para Visa, Mastercard, Elo e Amex: 4,20%; 6,09%; 7,01%; 7,91%; 8,80%; 9,67%; 12,59%; 13,42%; 14,25%; 15,06%; 15,87%; 16,66%. Essa tabela é aplicável se esse plano e essas condições estiverem vigentes na conta; outras bandeiras não estão confirmadas pelo print. A seleção do plano é feita na InfinitePay, não por um campo inventado no payload. As taxas ficam como referência no painel e não são somadas manualmente ao valor enviado. A fórmula `bruto = líquido / (1 - taxa)` usa arredondamento para cima em centavos. Ainda não foram verificadas as taxas efetivas da conta, o plano1 Dia Útil ou o recebimento líquido real. O checkout deverá apresentar total e parcelas efetivos antes de confirmar.

Cada modalidade exige seu teste e flag explícita no servidor: PAYMENTS_ENABLED + PIX_VERIFIED, PIX_SPLIT_VERIFIED ou CARD_FEES_VERIFIED. Nenhuma foi criada/ativada. A FAQ distingue modalidades em preparação das modalidades validadas.

Links originais foram preservados no catálogo. Novos pedidos usam a integração dinâmica quando ativada, conforme solicitação mais recente. Pedidos antigos com links fixos exigem conciliação administrativa com referências oficiais. VIP mantém o plano automático externo fornecido e não é cobrado novamente pelo carrinho; sincronização de benefícios/renovações VIP não é automática.

Emissão com resposta incerta fica em `issuing` para impedir novas cobranças duplicadas. Conferir na InfinitePay antes de qualquer recuperação. Não há liberação automática de uma emissão ambígua.

## Verificações já concluídas — não confundir com teste financeiro real

- TypeScript e build de produção aprovados.
- Testes de regras comerciais: R$62 para pergunta prioritária, R$874 para harmonização urgente, R$814,30 com desconto aprovado; preços adulterados rejeitados; quantidades e serviços ocultos/retirados; links originais e VIP preservados.
- Testes isolados de servidor com SQLite em memória e respostas simuladas: autenticação/origem, isolamento entre contas, CRUD de serviços, promoções, orçamento antes/depois do aceite, conflito de horário e rollback, disponibilidade ocupada, divisão de centavos, arredondamento, valor/modalidade divergentes, parcela50% sem execução/pontos, quitação100%, confirmação de cartão12x e rejeição13x, repetição de webhook, transação duplicada, importação e resgate idempotentes, saldo insuficiente.
- Migrações aplicadas ao D1 local de teste, sem acesso de escrita à produção.
- Navegador: catálogo e novos serviços, fotos reais carregadas, ampliação, calendário com data aberta e seleção14h, formulário e indicação de pagamentos desativados; larguras390 e768 sem rolagem horizontal nas telas inspecionadas. Desktop preservado. Dados e horários usados nessa revisão visual eram locais e não são publicados.
- Nenhuma cobrança real foi criada; PIX, PIX2, cartão, líquido recebido e entrega do webhook ainda não foram testados na conta InfinitePay. Login administrativo e uploadR2 no novo runtime dependem de publicação autorizada.

## Pendências exatas

1. Autorização para publicar esta versão, aplicar migração e provisionar R2. Continuar sem ativar pagamentos durante essa etapa. Confirmar no painel a presença da chave no runtime publicado.
2. Confirmar na conta InfinitePay: Checkout Integrado habilitado, chave pertencente à conta salade_sinais, plano1 Dia Útil e taxas efetivas. Não enviar a chave pelo chat.
3. Resolver acesso externo HTTPS ao webhook. O site está privado; um callback externo não consegue concluir login de navegador. Mudança de acesso exige autorização e revisão; não expor token de bypass na URL.
4. Teste financeiro controlado pelo titular: emissão, PIX integral, crédito1x/12x, repasse e líquido, confirmação automática sem retorno, duplicação, falha, emissão ambígua. PIX2 exige primeiro validar a restrição de modalidade descrita acima. Só habilitar flags correspondentes às modalidades realmente aprovadas.
5. Antes de abrir agenda, cadastrar disponibilidade real e revisar eventuais agendamentos antigos confirmados: registros anteriores não são convertidos silenciosamente em reservas. Não excluir pedidos antigos. Consultas pendentes precisam de data disponível após quitação.
6. Migrar fidelidade anterior: exportação autorizada de clientes_fidelidade e movimentos_fidelidade do Supabase original, preservando IDs e ordem; vinculação explícita a cada conta do novo site, nunca somente pelo nome. O painel recebe movimentos vinculados em lotes de100 e evita IDs repetidos. Dados anteriores não foram importados automaticamente.
7. Domínio entrealmas.com.br continuava pendente na última verificação; esta atualização não mudou DNS nem acesso. Preservado https://entre-almas-jana-consultas.urbancone8.chatgpt.site.

Documentação oficial consultada: https://www.infinitepay.io/checkout-documentacao

## Complemento sobre a versão 5 — integração dinâmica

- Todos os serviços com preço definido usam o total calculado no servidor, sem cadastrar novos links individuais. Orçamentos personalizados aprovados agora também permitem escolher PIX integral, PIX2 ou cartão antes de criar o pedido, com aceite explícito da quitação integral para PIX2. A disponibilidade financeira continua condicionada às flags e testes.
- Arredondamento do gross-up passou a usar aritmética inteira para evitar centavos extras por imprecisão de ponto flutuante. Este cálculo é uma simulação de conferência; o checkout recebe o valor líquido contratado e realiza o repasse oficial, uma única vez. A escolha de 1–12 parcelas e seu total ocorre na página da InfinitePay. Não há parâmetro documentado para forçar a parcela escolhida no site.
- Testes novos e focados: 576 verificações de payload/cálculo em todos os serviços com preço, adicionais e desconto de ritual, 12 taxas, divisão de centavo ímpar, ausência de acréscimo duplicado e bloqueio sem ativação. Testes do fluxo de aceite de orçamento verificam as três modalidades, o consentimento PIX2, proposta não aprovada e aceite repetido. Não repetidos os testes visuais/agenda/fidelidade já concluídos.
- Scripts preservados: scripts/test-payment-calculations.mjs e scripts/test-quote-payment.mjs. Respostas financeiras reais, confirmação do líquido no extrato, plano vigente, webhook acessível e PIX-only permanecem pendentes.
- Para teste real, é necessário ambiente publicado com autorização, chave válida no runtime e endpoint HTTPS acessível à InfinitePay. Como não há sandbox documentado, uma transação controlada exige autorização específica do titular; não foi feita nem foi criada cobrança real nesta entrega. Manter PAYMENTS_ENABLED ausente/false e todas as flags de validação desativadas.

## Publicação técnica autorizada e PIX manual (14/11/2026, Brasília)

Versão 6 publicada com sucesso, env revision5, mantendo acesso privado e pagamentos automáticos desativados. A chave consta como segredo, mas a verificação de presença no painel exige login da titular; validade na InfinitePay ainda não confirmada. O acesso externo ao webhook não foi liberado: preservar audiência até autorização explícita.

Ajuste solicitado: PIX2 passa exclusivamente ao WhatsApp. Checkout automático PIX2 bloqueado mesmo se PIX_SPLIT_VERIFIED for definido. Cliente combina vencimento e envia pedido; enviar mensagem não confirma pagamento. Administradora registra cada parcela no painel apenas após conferir extrato, informando valor exato e E2E de 32 caracteres. Auditoria preserva titular administrativa, pedido, parcela, valor, referência e data. Transações e pontos deduplicados. Após50% mantém Aguardando quitação; após100% libera prazo/pontos. Não há alteração de schema nesta revisão.

Teste local específico scripts/test-manual-pix.mjs aprovado: SQLite real, autenticação administrativa exigida na rota, ordem das parcelas, valor, confirmação explícita, auditoria, duplicação de referência, primeira parcela pendente, segunda integral e fidelidade uma vez. Nenhum recebimento real foi lançado.

### Teste real preparado para aprovação (não executado)

Caso inicial: PIX integral da consulta 1 Pergunta, valor R$35,00, sem adicional nem desconto. Titular deverá autorizar a emissão e realizar o pagamento por conta própria. Deve ser identificado como teste e não criar reserva de agenda. Antes da emissão: validar login/admin, presença da chave no runtime e acesso público estável ao webhook, mantendo pagamentos de clientes bloqueados. É necessário um fluxo restrito à administradora para o teste; a versão atual mantém a criação online globalmente bloqueada. Não ligar PAYMENTS_ENABLED para fazer teste com clientes expostos. Critérios: cobrança R$35, confirmação oficial via payment_check, recebimento líquido/extrato, atualização sem retorno ao site e reenvio sem duplicação. Cartão1x/12x exige teste separado e apresentação do total efetivo antes da autorização; este primeiro teste PIX não valida cartão.

## Validação pública autorizada

Acesso público autorizado pela titular; painel e operações administrativas continuam exigindo identidade e permissão no servidor. PAYMENTS_ENABLED configurado explicitamente false. PIX2 continua manual pelo WhatsApp.

Diagnóstico sanitizado em /api/infinitepay/health: consulta somente payment_check com referências inexistentes de teste, nunca /links; compara resposta com controle de chave inválida. Limita-se a duas consultas por revisão mediante lock/cache no banco. Retorna apenas presença booleana da chave, códigos HTTP e classificação conservadora, sem valores secretos ou registros de clientes. HTTP200 isolado não comprova autenticação caso o controle inválido também retorne200. GET do webhook comprova alcance e não confirma pagamento. A chamada HTTP do executor retornou403 com código1010 mesmo após liberação pública; não confundir bloqueio do cliente de teste com resposta da função de webhook. Verificação financeira e entrega real da InfinitePay ainda dependem de teste autorizado.

## Testes financeiros restritos antes da liberação geral

Preparado fluxo administrativo com INFINITEPAY_TESTS_ENABLED separado de PAYMENTS_ENABLED. A flag de testes continua ausente/desativada até autorização específica da titular. Somente admin pode criar e emitir checkout dos testes, valor base fixo R$35,00 por modalidade, com consentimento e dados do pagador. Não altera preços de serviços. Pedidos EA-TEST não ocupam agenda, não liberam atendimento e não recebem pontos. Um teste pendente por modalidade é reutilizado.

Webhook confirma somente testes habilitados enquanto clientes estão bloqueados; sempre consulta payment_check antes da quitação. Guarda evidência sanitizada da origem da confirmação (webhook ou retorno), valor base, total pago e parcelas para revisão administrativa. Evidência de total pago não comprova líquido recebido: conferir o extrato InfinitePay separadamente. INFINITEPAY_TESTS_ENABLED não liga PIX/cartão de clientes e nunca habilita PIX2 automático.

Validação local scripts/test-restricted-payments.mjs passou: permissão administrativa, preço fixo, autorização, rejeição de eventos não pagos/valor ou modalidade divergente, confirmação por webhook simulada, repetição sem pontos/recebimento duplicados, crédito12x simulado e evidência sem segredo. Teste real continua NÃO realizado. Antes da emissão, pedir autorização explícita para PIX de R$35 e cartão baseR$35 com total efetivo mostrado pelo provedor. Pagamento deve ser realizado pela titular/pagador autorizado, nunca automaticamente pelo agente. Depois de verificar recebimento, webhook e pedido, pedir confirmação final antes de PAYMENTS_ENABLED=true e das flags das modalidades aprovadas.

## Liberação operacional solicitada pela titular

A instrução posterior "Autorize pagamentos para clientes" autoriza a liberação operacional de PIX integral e cartão. PAYMENTS_ENABLED, PIX_ENABLED e CARD_ENABLED controlam disponibilidade. Não foram marcadas flags de testes como verificadas: testes financeiros reais NÃO foram concluídos, nenhum checkout de teste foi gerado e nenhum pagamento foi realizado pelo agente. A chave foi aceita pela API e o endpoint do webhook está acessível; entrega real, recebimento líquido e parcelamento real permanecem sem validação financeira.

PIX2 permanece manual por WhatsApp com confirmação administrativa, sem checkout automático. Repasse do cartão permanece exclusivamente no provedor (assured_installments=0), sem gross-up somado ao pedido. Painel exibe a distinção entre habilitação operacional e validação. A ativação não afeta serviços, preços, pedidos, agenda, proteção de dados ou pontuação.

Teste focal scripts/test-payment-activation.mjs aprovado: flags operacionais, chave geral de bloqueio, PIX2 permanentemente manual, ausência de taxa duplicada. Testes isolados de segurança/confirmacão continuam passando, sem chamadas financeiras reais.
