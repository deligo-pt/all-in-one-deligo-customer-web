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
  seeRestaurants: "Ver restaurantes",
  trustedBy: "Escolhido por milhões em todo o mundo",

  filtersTitle: "Filtrar",
  filtersReset: "Limpar tudo",
  sortBy: "Ordenar por",
  sortRecommended: "Recomendado",
  sortBestValue: "Melhor valor",
  sortPriceAsc: "Preço: do mais baixo ao mais alto",
  sortPriceDesc: "Preço: do mais alto ao mais baixo",
  delivery: "Entrega",
  deliveryInstant: "Imediata",
  deliveryPickup: "Recolha",
  deals: "Promoções",
  dietary: "Dieta",
  cuisine: "Cozinha",

  deliveringTo: "A entregar em",
  changeAddress: "Alterar",
  setAddress: "Defina uma morada de entrega",
  restaurantsAvailable: "restaurantes disponíveis na sua localização",
  favouriteCuisines: "Cozinhas favoritas",
  allRestaurants: "Todos os restaurantes",
  vendorImage: "Fotografia do restaurante",
  rating: "Classificação",

  noRestaurants: "Nenhum restaurante corresponde a estes filtros",
  noRestaurantsBody: "Experimente remover um filtro ou alargar as opções de entrega.",

  catalogueUnavailable: "Os restaurantes ainda não estão disponíveis",
  catalogueUnavailableBody:
    "Este ecrã está construído; o catálogo por trás dele é ligado numa fase posterior. Nada aqui são dados fictícios — simplesmente não há nada para mostrar até lá.",

  reviews: "Avaliações",
  availableDeals: "Promoções disponíveis",
  availableDealsBody: "Poupe mais nos seus artigos favoritos",
  searchItems: "Pesquisar neste menu",
  searchItemsPlaceholder: "Pesquisar artigos...",
  menuNavigation: "Categorias do menu",
  noItems: "Nenhum artigo corresponde a essa pesquisa",
  noItemsBody:
    "Experimente uma palavra mais curta ou limpe a pesquisa para ver todo o menu.",
  yourCart: "O seu carrinho",
  cartEmpty: "O seu carrinho está vazio",
  addToCart: "Adicionar ao carrinho",
  optionRequired: "OBRIGATÓRIO",
  chooseRequiredOptions: "Escolha uma opção em cada grupo obrigatório para continuar.",
  specialInstructions: "Instruções especiais",
  specialInstructionsPlaceholder: "Alguma alergia ou pedido especial? Diga-nos aqui...",
  quantity: "Quantidade",
  increaseQuantity: "Aumentar quantidade",
  decreaseQuantity: "Diminuir quantidade",
  closeProduct: "Fechar",
  cartNotWired:
    "O carrinho ainda não está ligado. Tudo o que escolheu aqui é real; o pedido que o enviaria chega numa fase posterior.",

  vendorUnavailable: "Este restaurante ainda não está disponível",
  vendorUnavailableBody:
    "A página está construída; o menu por trás dela chega com o catálogo numa fase posterior.",
} satisfies Record<string, string>;

export default food;
