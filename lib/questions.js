// Todas as perguntas do Check-in · Ultra Black Friday (fiéis ao Google Forms)
// type: single | multi | scale | text | section
// key: coluna na tabela public.ubf_checkins

export const EVENT = {
  name: "Ultra Black Lucrativa",
  dateLabel: "08 de Outubro às 20h",
  startISO: "2026-10-08T23:00:00Z", // 20h de Brasília
  endISO: "2026-10-09T01:00:00Z",
};

export const STEPS = [
  {
    type: "section",
    id: "s-perfil",
    eyebrow: "Parte 1 de 4",
    title: "Quem é você",
    text: "Duas perguntas rapidinhas pra eu começar a te conhecer.",
  },
  {
    type: "single",
    key: "idade",
    title: "Qual a sua idade?",
    options: ["Até 24 anos", "De 25 a 34 anos", "De 35 a 44 anos", "De 45 a 54 anos", "55 anos ou mais"],
  },
  {
    type: "single",
    key: "rotina",
    title: "Hoje, qual dessas mais parece com a sua rotina?",
    options: [
      "Trabalho de carteira assinada",
      "Trabalho por conta própria",
      "Cuido da casa e da família",
      "Estou procurando trabalho",
      "Sou estudante",
      "Sou aposentada",
      "Outra situação",
    ],
  },
  {
    type: "section",
    id: "s-partida",
    eyebrow: "Parte 2 de 4",
    title: "Seu ponto de partida",
    text: "Onde você está hoje. Sem julgamento: todo mundo começa de algum lugar.",
  },
  {
    type: "single",
    key: "estagio",
    title: "Qual frase mais parece com você hoje?",
    options: [
      "Nunca vendi nada pela internet",
      "Já tentei, mas nunca fiz uma venda",
      "Já fiz algumas vendas, mas nada constante",
      "Já recebo comissão todo mês e quero crescer",
    ],
  },
  {
    type: "multi",
    key: "contas_afiliada",
    title: "Onde você já tem conta de afiliada?",
    hint: "Pode marcar mais de uma.",
    options: ["Shopee", "TikTok Shop", "Outra plataforma de afiliados", "Ainda não tenho conta de afiliada"],
    exclusive: "Ainda não tenho conta de afiliada",
  },
  {
    type: "single",
    key: "seguidores",
    title: "Somando tudo, quantos seguidores tem o seu perfil maior?",
    options: ["Não posto nada, só uso pra ver", "Menos de 1 mil", "Entre 1 mil e 10 mil", "Mais de 10 mil"],
  },
  {
    type: "single",
    key: "maior_trava",
    title: "O que MAIS te trava hoje pra ganhar dinheiro com a internet?",
    options: [
      "Não sei por onde começar",
      "Tenho vergonha de aparecer",
      "Acho que preciso de muitos seguidores",
      "Não sei escolher o produto",
      "Não me dou bem com tecnologia",
      "Não tenho tempo",
      "Já tentei e não vendeu",
      "Tenho medo de cair em golpe",
      "Outro",
    ],
    other: { option: "Outro", key: "maior_trava_outro", placeholder: "Conta pra mim o que te trava…" },
  },
  {
    type: "single",
    key: "tempo_por_dia",
    title: "Quanto tempo por dia você consegue separar pra isso?",
    options: ["Menos de 30 minutos", "De 30 minutos a 1 hora", "De 1 a 2 horas", "Mais de 2 horas"],
  },
  {
    type: "section",
    id: "s-quer",
    eyebrow: "Parte 3 de 4",
    title: "O que você quer",
    text: "Agora me conta o que você quer aprender e aonde quer chegar.",
  },
  {
    type: "multi",
    key: "quer_aprender",
    title: "O que você mais quer aprender?",
    hint: "Pode marcar quantas quiser.",
    options: [
      "Escolher produto que vende de verdade",
      "Gravar vídeo de achadinho sem mostrar o rosto",
      "Editar vídeo pelo celular",
      "Usar inteligência artificial pra criar roteiro e legenda",
      "Vender pelo TikTok Shop",
      "Vender pela Shopee",
      "Ganhar dinheiro com cortes de vídeo",
      "Fazer meus vídeos chegarem em mais gente",
      "Aproveitar a Black Friday e o Natal pra vender mais",
    ],
  },
  {
    type: "single",
    key: "caminho_escolhido",
    title: "Se você tivesse que escolher um caminho só pra começar, qual seria?",
    options: ["Achadinhos da Shopee", "Vendas pelo TikTok Shop", "Cortes de vídeo", "Ainda não sei, quero entender a diferença"],
  },
  {
    type: "single",
    key: "destino_da_renda",
    title: "E quando essa renda começar a entrar, onde ela entra primeiro?",
    options: [
      "Pagar dívidas",
      "Ajudar nas contas da casa",
      "Presentes e o Natal da família",
      "Guardar e ter uma reserva",
      "Realizar um sonho, tipo viagem, casa ou carro",
      "Ter liberdade pra largar o emprego",
    ],
  },
  {
    type: "section",
    id: "s-dinheiro",
    eyebrow: "Parte 4 de 4",
    title: "Dinheiro e jeito de comprar",
    text:
      "Agora cinco perguntas sobre dinheiro e sobre o seu jeito de comprar. Não tem resposta certa. É isso que me ajuda a pensar uma condição na Ultra Black Friday que caiba pra maioria de quem tá aqui.",
  },
  {
    type: "single",
    key: "renda_mensal",
    title: "Qual é a sua renda mensal hoje, somando tudo?",
    options: ["Não tenho renda", "Até R$ 1.000", "De R$ 1.000 a R$ 3.000", "De R$ 3.000 a R$ 5.000", "Mais de R$ 5.000"],
  },
  {
    type: "single",
    key: "meta_mensal",
    title: "E quanto você quer ganhar por mês com a internet?",
    options: ["De R$ 500 a R$ 1.000", "De R$ 1.000 a R$ 3.000", "De R$ 3.000 a R$ 5.000", "Mais de R$ 5.000"],
  },
  {
    type: "single",
    key: "forma_pagamento",
    title: "Quando você precisa comprar alguma coisa mais cara, tipo um celular novo, como costuma pagar?",
    options: [
      "À vista, no Pix",
      "Parcelado no cartão de crédito",
      "Boleto parcelado ou crediário",
      "Junto o dinheiro e compro depois",
      "Peço ajuda a alguém",
    ],
  },
  {
    type: "single",
    key: "maior_investimento",
    title: "Qual foi o maior valor que você já investiu num curso ou mentoria online?",
    options: ["Nunca investi em curso online", "Até R$ 100", "De R$ 100 a R$ 500", "De R$ 500 a R$ 1.000", "Mais de R$ 1.000"],
  },
  {
    type: "single",
    key: "quem_decide",
    title: "Na sua casa, quem decide as compras maiores?",
    options: ["Eu decido sozinha", "Eu decido, mas converso com alguém antes", "Outra pessoa decide"],
  },
  {
    type: "section",
    id: "s-live",
    eyebrow: "Reta final",
    title: "A live",
    text: "Últimas perguntas. Depois disso é só me esperar no dia 08.",
  },
  {
    type: "single",
    key: "presenca_live",
    title: "Você vai estar na Ultra Black Friday, dia 08 de outubro, às 20h?",
    options: ["Vou, já deixei o lembrete", "Vou tentar", "Nesse horário fica difícil pra mim"],
  },
  {
    type: "scale",
    key: "nota_vontade",
    title: "De 0 a 10, quanto você quer começar a vender antes da Black Friday de novembro?",
    min: 0,
    max: 10,
    minLabel: "Tô só curiosa",
    maxLabel: "Quero muito, tô decidida",
  },
  {
    type: "text",
    key: "pergunta_live",
    title: "Se você pudesse me fazer uma pergunta na live, qual seria?",
    hint: "Pode ser qualquer coisa. As que mais aparecerem, eu respondo ao vivo.",
    placeholder: "Escreve aqui a sua pergunta…",
    maxLength: 2000,
  },
  {
    type: "text",
    key: "comentario_extra",
    title: "Tem alguma coisa que você quer me contar e eu não perguntei?",
    hint: "Opcional.",
    optional: true,
    placeholder: "Fica à vontade…",
    maxLength: 3000,
  },
];

export const QUESTIONS = STEPS.filter((s) => s.type !== "section");
export const TOTAL_QUESTIONS = QUESTIONS.length; // 19
