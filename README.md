# Check-in · Ultra Black Lucrativa

Formulário interativo (Next.js 15 + React 19 + Framer Motion) com as 19 perguntas do check-in, gravando no Supabase.

## Páginas
- `/` → **Página de captura** (nome, e-mail, WhatsApp) → dispara o e-mail de parabéns pelo Brevo
- `/checkin` → Formulário de qualificação (19 perguntas)
- `/admin` → Painel (check-ins + inscritos, planilhas)

## E-mail de parabéns (Brevo)
Preencha no `.env.local` (e na Vercel quando publicar):
- `BREVO_API_KEY` → Brevo > Configurações > SMTP & API > Chaves de API
- `BREVO_LIST_ID` → número da lista (Brevo > Contatos > Listas). Todo inscrito entra nela.
- `BREVO_SENDER_EMAIL` → remetente verificado (ex.: contato@karentalissaa.com)
- `NEXT_PUBLIC_WHATSAPP_GROUP_URL` → (opcional) link do grupo; aparece no e-mail e na tela de obrigado
- `NEXT_PUBLIC_SITE_URL` → URL pública do site (as imagens do e-mail vêm daqui)

Fluxo: formulário → `/api/inscricao` → salva em `ubf_leads` (Supabase, sem duplicar e-mail) → adiciona contato na lista Brevo → envia o e-mail transacional (template em `lib/emailTemplate.js`). Anti-spam: no máximo 1 e-mail por hora pro mesmo endereço. O status do envio fica na coluna `email_status`.
Textos da captura: objeto `COPY` no topo de `components/CapturePage.jsx`.

## Rodar local
```bash
npm install
npm run dev
```
- Captura: http://localhost:3000
- Check-in: http://localhost:3000/checkin
- Painel (métricas + planilha): http://localhost:3000/admin  → chave: combinada fora do repositório (não versionar)

## Links com identificação do lead
Passe dados do lead e UTMs pela URL que eles são salvos junto da resposta:
```
/?nome=Maria&email=maria@x.com&whatsapp=11999999999&utm_source=instagram&utm_campaign=ubf
```
(também aceita `name`, `phone`, `telefone`)

## Banco (Supabase — projeto "gerenciadorpedro@gmail.com's Project")
- Tabela `public.ubf_checkins` — uma coluna por pergunta, múltipla escolha como array.
- `lead_score` (0–100) e `temperatura` (Quente ≥70 / Morno ≥45 / Frio) calculados automaticamente por trigger (`ubf_calc_score`), com base em: estágio, tempo por dia, renda, forma de pagamento, maior investimento, quem decide, presença na live e nota de vontade.
- Segurança: a chave pública só consegue INSERIR. Leitura só pela função `ubf_admin_list(chave)` (chave guardada como hash em `ubf_admin_config`).
- Trocar a chave do painel (SQL Editor):
  `update ubf_admin_config set key_hash = extensions.crypt('NOVA_CHAVE', extensions.gen_salt('bf')) where id = 1;`

## Planilha
No `/admin`, botão **Baixar planilha** gera CSV no padrão Excel BR (`;` + UTF-8), respeitando filtros e busca.

## Publicar (grátis)
`npx vercel` → configure as variáveis `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` (estão no `.env.local`).

## Editar perguntas
Tudo em `lib/questions.js`. Se mudar o texto de uma opção usada no score, atualize também a função `ubf_calc_score` no Supabase.
