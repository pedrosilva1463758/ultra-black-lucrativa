#!/bin/zsh
# Clique duas vezes para rodar o Check-in Ultra Black localmente
cd "$(dirname "$0")"
export PATH="/opt/homebrew/bin:/usr/local/bin:$HOME/.nvm/versions/node/$(ls $HOME/.nvm/versions/node 2>/dev/null | tail -1)/bin:$PATH"
[ -s "$HOME/.nvm/nvm.sh" ] && source "$HOME/.nvm/nvm.sh"
echo "\n✨ Check-in Ultra Black Lucrativa\n"
if [ ! -d node_modules ]; then echo "Instalando dependências (só na primeira vez)..."; npm install; fi
( while ! curl -s -o /dev/null http://localhost:3000; do sleep 1; done; open -a "Google Chrome" http://localhost:3000 ) &
npm run dev -- -p 3000
