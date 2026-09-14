/**
 * As palavras da vertical de comida.
 *
 * Transcrito dos três ecrãs de design. Onde uma cadeia nomeia dados em vez de
 * interface — o nome de um restaurante, um preço, "120+" — não está aqui:
 * esses valores vêm da API exatamente como enviados.
 */
const food = {
  heroBadge: "Novo: sabores frescos chegaram",
  heroTitleLead: "A sua comida favorita,",
  heroTitleAccent: "entregue fresca.",
  heroBody:
    "Dos favoritos locais às cozinhas do mundo, descubra refeições deliciosas dos melhores restaurantes perto de si — entregues rápido, frescas e à sua porta.",
  addressPlaceholder: "Introduza a sua morada",
  addressLabel: "Morada de entrega",
  locateMe: "Localizar-me",
  locationNotFound:
    "Não encontrámos essa morada. Experimente acrescentar a cidade ou o código postal.",
  locationDenied:
    "O acesso à localização está desativado para este site. Escreva a sua morada.",
  locationUnavailable:
    "Não conseguimos obter a localização agora. Experimente escrever a sua morada.",
  locationPosition:
    "O seu dispositivo não conseguiu determinar onde está. Verifique se os serviços de localização estão ativos para o navegador, ou escreva a sua morada.",
  currentLocation: "Localização atual",
  seeRestaurants: "Ver restaurantes",
  trustedBy: "Escolhido por milhões em todo o mundo",

  deliveringTo: "A entregar em",
  changeAddress: "Alterar",
  setAddress: "Defina uma morada de entrega",
  restaurantsAvailable: "restaurantes disponíveis na sua localização",
  favouriteCuisines: "Cozinhas favoritas",
  allRestaurants: "Todos os restaurantes",
  vendorImage: "Fotografia do restaurante",
  rating: "Classificação",

  noRestaurants: "Nenhum restaurante corresponde a estes filtros",
  noRestaurantsBody:
    "Nenhum restaurante perto desta morada serve essa cozinha. Remova-a para ver todos.",

  catalogueUnavailable: "Os restaurantes estão indisponíveis de momento",
  catalogueUnavailableBody:
    "Não conseguimos carregar a lista de restaurantes agora. Tente novamente dentro de momentos.",

  openUntil: "Aberto · Fecha às {time}",
  closedOpensAt: "Fechado · Abre às {time}",
  percentOff: "{value}% DESCONTO",
  amountOff: "{value} DESCONTO",
  reviewsCount_one: "({count} avaliação)",
  reviewsCount_other: "({count} avaliações)",
  clearCuisine: "Mostrar todas as cozinhas",
  noLocationTitle: "Onde devemos entregar?",
  noLocationBody:
    "Defina a sua morada ou use a sua localização atual e mostramos os restaurantes que entregam aí.",
  searchHeading: "Pesquisa",
  searchTitle: "Resultados para “{query}”",
  searchCount_one: "{count} prato",
  searchCount_other: "{count} pratos",
  searchPrompt: "Escreva pelo menos {min} letras na pesquisa para encontrar um prato.",
  searchEmpty: "Nada corresponde a “{query}”",
  searchEmptyBody:
    "Experimente uma palavra mais curta, ou o nome do prato em vez do restaurante.",
  searchUnavailable: "A pesquisa está indisponível de momento",
  searchUnavailableBody:
    "Não conseguimos contactar a pesquisa agora. Tente novamente dentro de momentos.",
  outOfStock: "Esgotado",
  previousPage: "Anterior",
  nextPage: "Seguinte",
  reviews: "Avaliações",
  availableDeals: "Promoções disponíveis",
  availableDealsBody: "Poupe mais nos seus artigos favoritos",
  searchItems: "Pesquisar neste menu",
  searchItemsPlaceholder: "Pesquisar artigos...",
  menuNavigation: "Categorias do menu",
  noItems: "Nenhum artigo corresponde a essa pesquisa",
  noItemsBody:
    "Experimente uma palavra mais curta ou limpe a pesquisa para ver todo o menu.",
  noMenu: "Este restaurante ainda não adicionou o menu",
  noMenuBody: "Volte em breve ou escolha outro restaurante perto de si.",
  otherCategory: "Outros",
  signInToAdd: "Inicie sessão para adicionar pratos ao carrinho.",
  signInAction: "Iniciar sessão",
  offlineAdd: "Esta é a pré-visualização do design — nada é adicionado a partir daqui.",
  yourCart: "O seu carrinho",
  cartEmpty: "O seu carrinho está vazio",
  addToCart: "Adicionar ao carrinho",
  optionRequired: "OBRIGATÓRIO",
  chooseRequiredOptions: "Escolha uma opção em cada grupo obrigatório para continuar.",
  specialInstructionsPlaceholder: "Alguma alergia ou pedido especial? Diga-nos aqui...",
  quantity: "Quantidade",
  increaseQuantity: "Aumentar quantidade",
  decreaseQuantity: "Diminuir quantidade",
  closeProduct: "Fechar",

  vendorUnavailable: "Este restaurante está indisponível de momento",
  vendorUnavailableBody:
    "Não conseguimos carregar este restaurante agora. Tente novamente dentro de momentos.",
} satisfies Record<string, string>;

export default food;
