/** The checkout screen's words, in Portuguese. See `en/checkout.ts` for what
 *  each is for and why the payment methods are named here at all. */
const checkout = {
  title: "Finalizar compra",

  scheduleLabel: "Entrega agendada",
  scheduleChange: "Alterar",
  scheduleChoose: "Escolher hora de entrega",
  scheduleChooseBody:
    "Escolha um horário que lhe convenha, ou deixe assim e entregamos assim que possível.",

  deliveryTitle: "Detalhes da entrega",
  deliveryEdit: "Editar",
  deliveryNoAddress: "Ainda sem morada de entrega",
  deliveryMapAlt: "Mapa da morada de entrega",
  instructionTitle: "Instruções de entrega",

  paymentTitle: "Método de pagamento",
  paymentShowAll: "Ver todos",
  paymentShowLess: "Ver menos",
  methodMbway: "MB WAY",
  methodMbwayBody: "Pagamento móvel instantâneo (Portugal)",
  methodCard: "Cartão de Crédito/Débito",
  methodCardBody: "Visa, Mastercard, Amex",
  methodApplePay: "Apple Pay",
  methodApplePayBody: "Pagamento rápido e seguro com a carteira Apple",
  methodPaypal: "PayPal",
  methodPaypalBody: "Pagar através da conta PayPal",
  methodGooglePay: "Google Pay",
  methodGooglePayBody: "Opção de pagamento com a carteira Google",
  methodOther: "Outros métodos de pagamento",
  methodOtherBody: "Opções alternativas",

  cardNumber: "Número do cartão",
  cardNumberPlaceholder: "0000 0000 0000 0000",
  cardHolder: "Nome do titular",
  cardHolderPlaceholder: "Introduza o nome como está no cartão",
  cardExpiry: "Data de validade",
  cardExpiryPlaceholder: "MM/AA",
  cardCvv: "CVV",
  cardCvvPlaceholder: "••••••",
  cardNotice:
    "Os dados do cartão são introduzidos no formulário seguro do fornecedor de pagamento, que chega numa fase posterior. Estes campos não recolhem nada.",

  tipTitle: "Dar gorjeta ao estafeta",
  tipLater: "Mais tarde",
  tipLabel: "Gorjeta",

  locationTitle: "Selecione a sua localização exata",
  locationBody: "Mostramos-lhe os restaurantes perto de si",
  locationAddressLabel: "Morada de entrega",
  locationAddressPlaceholder: "Introduza a sua morada",
  locationLocateMe: "Localizar-me",
  locationConfirm: "Confirmar localização",

  voucherTitle: "Aplicar um voucher",
  voucherCodeLabel: "Código do voucher",
  voucherCodePlaceholder: "Introduza o código do voucher",
  voucherApply: "Aplicar",
  voucherApplied: "Aplicado",
  voucherTerms: "Termos e Condições",
  voucherEmpty: "Sem vouchers disponíveis",
  voucherEmptyBody:
    "Não tem vouchers nesta conta neste momento. Ainda pode introduzir um código acima.",
  voucherUnavailable: "Os vouchers ainda não estão disponíveis",
  voucherUnavailableBody:
    "Este painel está construído; os vouchers por trás dele são ligados numa fase posterior. Nada aqui são dados de exemplo.",

  scheduleTitle: "Entrega inteligente",
  scheduleBody: "Escolha quando chega",
  scheduleYourDelivery: "A sua entrega",
  scheduleRecommended: "Recomendado:",
  scheduleEmpty: "Sem janelas de entrega",
  scheduleEmptyBody: "Não há nada para reservar nesta loja neste momento.",
  scheduleUnavailable: "As janelas de entrega ainda não estão disponíveis",
  scheduleUnavailableBody:
    "Este seletor está construído; as janelas por trás dele são ligadas numa fase posterior.",

  confirmedTitle: "Pedido confirmado!",
  confirmedBody: "O seu pedido foi feito com sucesso.",
  confirmedReference: "Pedido n.º",
  confirmedDelivery: "Entrega",
  confirmedPayment: "Pagamento",
  confirmedTotal: "Total",
  confirmedStayUpdated: "Mantenha-se a par",
  confirmedStayUpdatedBody:
    "Avisamos quando o seu pedido estiver a ser preparado, a caminho e entregue.",
  confirmedBackHome: "Voltar à página inicial",

  unavailableTitle: "A finalização da compra ainda não está ligada",
  unavailableBody:
    "Este ecrã está construído; os endpoints de encomenda e pagamento por trás dele são ligados numa fase posterior. Nada aqui são dados de exemplo — simplesmente não há nada para finalizar até que exista.",
  notWired:
    "A finalização da compra ainda não está ligada. Este controlo é real e o pedido que enviaria chega numa fase posterior — nenhuma encomenda foi feita e nada foi cobrado.",
} satisfies Record<string, string>;

export default checkout;
