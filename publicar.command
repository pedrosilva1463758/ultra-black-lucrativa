#!/bin/zsh
# Publica o projeto: git -> GitHub -> Vercel
cd "$(dirname "$0")"
exec > >(tee -a publicar.log) 2>&1
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
[ -s "$HOME/.nvm/nvm.sh" ] && source "$HOME/.nvm/nvm.sh"
NAME="ultra-black-lucrativa"
step() { echo "\n==== $1 ===="; }

step "1/5 Git"
if [ ! -d .git ]; then git init -b main; fi
git config user.name >/dev/null || git config user.name "Pedro"
git config user.email >/dev/null || git config user.email "gerenciadorpedro@gmail.com"
git add .
git commit -m "primeira versão" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_0122eTWrbCdh9UhFuUngjEeu" || echo "(nada novo pra commitar)"

step "2/5 GitHub"
if ! command -v gh >/dev/null; then
  if command -v brew >/dev/null; then brew install gh; else echo "GH_MISSING: instale o GitHub CLI (https://cli.github.com)"; fi
fi
if command -v gh >/dev/null; then
  gh auth status >/dev/null 2>&1 || { echo ">> Faça login no GitHub na janela do navegador que vai abrir"; gh auth login --web -h github.com -p https; }
  if git remote get-url origin >/dev/null 2>&1; then git push -u origin main; else gh repo create "$NAME" --public --source=. --push; fi
  echo "GITHUB_URL: $(gh repo view --json url -q .url 2>/dev/null)"
fi

step "3/5 Vercel login"
npx --yes vercel@latest whoami >/dev/null 2>&1 || { echo ">> Faça login na Vercel na janela do navegador que vai abrir"; npx --yes vercel@latest login; }

step "4/5 Vercel projeto + variáveis"
npx --yes vercel@latest link --yes --project "$NAME"
set -a; source .env.local; set +a
for V in NEXT_PUBLIC_SUPABASE_URL NEXT_PUBLIC_SUPABASE_ANON_KEY BREVO_API_KEY BREVO_LIST_ID BREVO_SENDER_EMAIL BREVO_SENDER_NAME NEXT_PUBLIC_WHATSAPP_GROUP_URL; do
  VAL="${(P)V}"
  if [ -n "$VAL" ]; then
    npx --yes vercel@latest env rm "$V" production --yes >/dev/null 2>&1
    printf '%s' "$VAL" | npx --yes vercel@latest env add "$V" production && echo "env ok: $V"
  fi
done
npx --yes vercel@latest git connect --yes 2>&1 || echo "(git connect: conecte o repo em Settings > Git na Vercel se precisar)"

step "5/5 Deploy produção"
npx --yes vercel@latest --prod --yes
echo "\n==== FIM ====\nPode fechar esta janela."
