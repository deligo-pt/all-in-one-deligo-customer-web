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

  unavailableTitle: "O seu carrinho ainda não está ligado",
  unavailableBody:
    "Este ecrã está construído; o carrinho por trás dele é ligado numa fase posterior. Nada aqui são dados de exemplo — simplesmente não há nada para mostrar até que exista.",

  notWired:
    "O carrinho ainda não está ligado. Este controlo é real e o pedido que enviaria chega numa fase posterior — nada foi alterado.",
} satisfies Record<string, string>;

export default cart;
