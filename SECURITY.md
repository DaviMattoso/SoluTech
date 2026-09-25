# Central de Segurança — SoluTech

Esta é a página única para consultar, configurar e revisar a segurança do site.
O formulário envia as mensagens diretamente ao Web3Forms; o servidor da
SoluTech publica somente os arquivos estáticos autorizados e não recebe os
dados enviados pelo formulário.

Última revisão: 25 de setembro de 2026.

## O que já está aplicado no código

- hCaptcha visível no formulário e validação antes do envio;
- limites de tamanho nos campos e prazo máximo de 15 segundos no envio;
- formulário enviado somente por HTTPS para a API do Web3Forms;
- Content Security Policy (CSP) limitada ao site, Google Fonts, Web3Forms e
  hCaptcha;
- proteção contra incorporação do site em páginas de terceiros;
- bloqueio de câmera, microfone, localização, pagamentos e USB no navegador;
- ocultação da identificação do Express;
- lista fechada de arquivos públicos: `index.html`, `style.css`, `script.js` e
  a pasta `img`;
- arquivos `.env`, código do servidor, documentação e anotações não são
  publicados;
- limites de tempo no servidor para reduzir conexões lentas abusivas;
- configuração `.htaccess` para aplicar as proteções quando o site for
  publicado diretamente pelo cPanel em Apache/LiteSpeed;
- nenhuma chave privada é necessária no projeto.

## Ação obrigatória: ativar o hCaptcha no Web3Forms

O componente já está no site, mas a proteção precisa ser marcada como
obrigatória na conta que criou a chave pública presente no formulário.

1. Entre em [Web3Forms](https://app.web3forms.com/).
2. Abra o formulário vinculado ao domínio `solutechdigital.com.br`.
3. Entre em **Spam Protection**, **Captcha** ou opção equivalente.
4. Selecione **hCaptcha** e ative a exigência para todos os envios.
5. Salve e faça os três testes abaixo em uma janela anônima.

Testes obrigatórios:

1. Tente enviar sem marcar o CAPTCHA: o envio deve ser recusado.
2. Marque o CAPTCHA e envie uma mensagem real: o e-mail deve chegar uma única
   vez.
3. Confira no painel se o envio foi registrado e se a proteção aparece ativa.

A integração segue a [documentação oficial do hCaptcha no
Web3Forms](https://docs.web3forms.com/getting-started/customizations/spam-protection/hcaptcha).

### Se começar a chegar spam

1. Confirme primeiro se o hCaptcha continua obrigatório no painel.
2. Pause temporariamente o formulário pelo Web3Forms, se o volume estiver alto.
3. Gere uma nova `access_key` no painel.
4. Substitua somente o valor comentado como **ALTERAR** em `index.html`.
5. Revogue a chave anterior e repita os três testes.

A `access_key` do Web3Forms aparece no HTML por ser um identificador público do
formulário. Ela não deve ser tratada como senha, mas pode e deve ser trocada em
caso de abuso.

## Configuração na TargetHost

### 1. Proteger a conta

1. Entre no portal da TargetHost.
2. Abra o **cPanel** da hospedagem.
3. Pesquise por **Autenticação de dois fatores** na seção **Segurança**.
4. Ative o 2FA e guarde os códigos de recuperação fora do computador.
5. Use uma senha exclusiva e não compartilhe a conta principal.

### 2. Confirmar HTTPS

1. No cPanel, abra **SSL/TLS Status**, **Let's Encrypt** ou o item equivalente.
2. Confirme certificado válido para:
   - `solutechdigital.com.br`;
   - `www.solutechdigital.com.br`.
3. Ative o redirecionamento permanente de HTTP para HTTPS.
4. Escolha um endereço principal e redirecione o outro para ele, evitando duas
   versões do mesmo site.
5. Ative a renovação automática do certificado, se a opção aparecer.

### 3. Confirmar WAF e proteção anti-DDoS

O CAPTCHA reduz envios automatizados do formulário, mas não bloqueia sozinho um
ataque DDoS. Esse tipo de proteção deve acontecer antes de o tráfego alcançar o
site.

1. No cPanel, procure **ModSecurity**, **Web Application Firewall**,
   **Imunify360** ou **Cloudflare**.
2. Ative o WAF e as regras OWASP para os dois nomes do domínio.
3. Se essas opções não aparecerem, abra um chamado na
   [central da TargetHost](https://www.seguro.targethost.com.br/) com este texto:

   > Solicito a confirmação de que o domínio solutechdigital.com.br está com
   > SSL, WAF com regras OWASP e proteção anti-DDoS ativos. Também preciso saber
   > onde consultar bloqueios, relatórios e limites no painel.

4. Peça ao suporte para confirmar se a proteção anti-DDoS cobre o plano
   contratado, não apenas a infraestrutura geral.

A TargetHost informa proteção anti-DDoS em sua
[infraestrutura](https://www.targethost.com.br/nossa-infraestrutura/) e anuncia
WAF, regras OWASP, Cloudflare e SSL em planos de
[hospedagem cloud](https://www.targethost.com.br/produtos/hospedagem-cloud/),
mas a disponibilidade deve ser confirmada para o plano contratado.

### 4. Se a hospedagem executar o servidor Node.js

Use somente estas variáveis de ambiente:

```env
NODE_ENV=production
PORT=3000
```

No painel, configure o arquivo inicial como `server/server.js` e execute as
dependências de produção dentro de `server`:

```text
npm install --omit=dev
npm start
```

Não crie variáveis privadas que o site não utiliza. O arquivo `server/.env`
local está ignorado pelo Git; a hospedagem deve guardar essas configurações no
gerenciador próprio de variáveis.

### 5. Se a hospedagem publicar somente HTML/CSS/JavaScript

Mantenha o arquivo `.htaccess` na mesma pasta pública de `index.html`. Ele força
HTTPS, bloqueia `server`, `docs`, arquivos ocultos e documentos internos, impede
listagem de diretórios e aplica CSP, `frame-ancestors`, `Referrer-Policy` e
`Permissions-Policy`.

Depois da publicação, confirme no navegador que o site abre normalmente. Se a
hospedagem retornar erro `500`, restaure o site e abra um chamado pedindo a
ativação dos módulos `rewrite`, `headers`, `authz_core` e `autoindex` ou a
aplicação equivalente das regras presentes em `.htaccess`.

## Teste depois de cada publicação

- abra o site pelo domínio com `https://` e confirme que não há aviso de
  certificado;
- teste no computador e no celular;
- confirme que imagens, estilos e interações carregam normalmente;
- tente enviar o formulário sem CAPTCHA e confirme o bloqueio;
- envie uma mensagem válida e confirme o recebimento;
- abra `/server/server.js`, `/server/.env`, `/SECURITY.md` e
  `/docs/historico/Diario%20de%20um%20dev.txt`: todos devem retornar `404`;
- confira o console do navegador: não deve haver erro de CSP nem de conteúdo
  misto;
- execute `npm audit` na pasta `server` antes de publicar alterações de
  dependências.

## Rotina recomendada

Toda semana:

- revisar no Web3Forms o volume e a origem dos envios;
- verificar alertas e bloqueios da hospedagem;
- confirmar que o site e o formulário continuam disponíveis.

Todo mês:

- atualizar as dependências com cuidado e executar `npm audit`;
- testar o backup e a restauração da hospedagem;
- revisar usuários do cPanel, FTP, SSH e e-mail e remover acessos antigos;
- confirmar a renovação automática do SSL.

Sempre que alguém sair da equipe:

- remover o acesso da pessoa;
- trocar senhas que tenham sido compartilhadas;
- renovar chaves e tokens aos quais ela tinha acesso;
- revisar os registros de acesso da hospedagem.

## Resposta rápida a incidentes

### Muitos envios de formulário

1. Pause o formulário no Web3Forms.
2. Confirme a obrigatoriedade do hCaptcha.
3. Gere uma nova `access_key` e revogue a anterior.
4. Guarde horários, quantidade e exemplos sem publicar dados pessoais.
5. Abra um chamado no Web3Forms e na TargetHost.

### Site lento ou indisponível por tráfego anormal

1. Não altere o código às pressas.
2. Abra imediatamente um chamado de possível DDoS na TargetHost.
3. Informe domínio, horário de início, duração e sintomas.
4. Peça bloqueio na borda/CDN, análise dos logs e confirmação do WAF.
5. Depois do incidente, registre o que ocorreu e as medidas adotadas.

### Suspeita de invasão ou vazamento

1. Coloque o site em manutenção pelo painel da hospedagem.
2. Troque as senhas do portal, cPanel, FTP/SSH e e-mails administrativos.
3. Revogue chaves e sessões ativas.
4. Preserve logs e um backup do estado afetado antes de limpar arquivos.
5. Restaure uma cópia confiável, atualize as dependências e só então publique.

Nenhuma proteção isolada elimina todos os riscos. CAPTCHA protege o fluxo do
formulário; WAF e regras OWASP filtram requisições maliciosas; SSL protege os
dados em trânsito; 2FA protege a conta; anti-DDoS e CDN tratam volume de rede;
backup permite recuperação.
