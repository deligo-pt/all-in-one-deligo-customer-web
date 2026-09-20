/** The cart screen's words, in Portuguese. See `en/cart.ts` for what each is
 *  for and where the translations came from. */
const cart = {
  title: "O Seu Carrinho",
  subtitle: "Tudo o que escolheu na DeliGo, num só lugar.",

  items_one: "{count} artigo",
  items_other: "{count} artigos",

  filters: "Filtrar por serviço",
  filterAll: "Todos",

  chooseStore: "Selecione esta loja para fazer checkout",
  selectStore: "Selecionar para Finalizar",
  selectedStore: "Selecionado para Finalizar",
  deliveryEstimate: "Entrega est.:",
  remove: "Remover",
  quantity: "Quantidade",
  increaseQuantity: "Aumentar quantidade",
  decreaseQuantity: "Diminuir quantidade",
  addons: "Extras",
  itemImage: "Fotografia do artigo",

  deliveryIn: "Entrega em",
  addMoreItems: "Adicionar mais itens",
  applyVoucher: "Aplicar um voucher",
  orderSummary: "Resumo do Pedido",
  chargeSubtotal: "Subtotal",
  chargeDelivery: "Taxa de Entrega",
  chargeService: "Taxa de Serviço",
  chargeTip: "Gorjeta do Estafeta",
  chargeDiscount: "Desconto",
  grandTotal: "Total Geral (taxas e impostos incl.)",
  placeOrder: "Fazer Pedido",

  emptyTitle: "O seu carrinho está vazio",
  emptyBody:
    "Ainda não adicionou nada. Escolha um restaurante e tudo o que selecionar aparece aqui.",
  browse: "Explorar restaurantes",

  unavailableTitle: "Não foi possível carregar o carrinho",
  unavailableBody:
    "Não conseguimos aceder ao carrinho agora. Tente novamente dentro de momentos.",

  goToCheckout: "Finalizar compra",
  actionFailed: "Não foi possível concluir. O carrinho mostra o estado atual.",
  selectToSeeTotal:
    "Selecione uma loja para ver o total — as encomendas são feitas uma loja de cada vez.",
  previewOnly:
    "Esta é a pré-visualização do design — nada aqui altera um carrinho real.",
  notWired: "Os vouchers são aplicados no checkout, que é ligado na próxima fase.",
} satisfies Record<string, string>;

export default cart;
