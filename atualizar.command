#!/bin/zsh
# Salva as alterações e manda pro GitHub (a Vercel publica sozinha)
cd "$(dirname "$0")"
exec > >(tee -a publicar.log) 2>&1
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
echo "\n==== ATUALIZAR $(date) ===="
git add -A
git commit -m "${1:-atualização}" || echo "(nada novo)"
git push && echo "PUSH_OK"
echo "==== FIM ATUALIZAR ===="
