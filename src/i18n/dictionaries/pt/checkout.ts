/** The checkout screen's words, in Portuguese. See `en/checkout.ts` for what
 *  each is for. */
const checkout = {
  title: "Finalizar compra",

  fulfilmentTitle: "Como quer receber?",
  fulfilmentDelivery: "Entrega",
  fulfilmentDeliveryBody: "Um estafeta leva à sua morada",
  fulfilmentPickup: "Recolha na loja",
  fulfilmentPickupBody: "Levante na loja, sem taxa de entrega",
  pickupUnavailable: "Esta loja já não tem horários de recolha hoje",
  pickupFrom: "Levantar em",
  pickupTimeLabel: "Hora de recolha",
  pickupChange: "Alterar hora",
  pickupTitle: "Escolha a hora de recolha",
  pickupBody:
    "Escolha um intervalo de 30 minutos. O pedido fica pronto a levantar a partir do início.",
  pickupToday: "Hoje",
  pickupTomorrow: "Amanhã",
  pickupNoSlots: "Sem horários de recolha neste dia",
  pickupConfirm: "Confirmar hora de recolha",

  deliveryTitle: "Detalhes da entrega",
  deliveryEdit: "Alterar",
  deliveryNoAddress: "Ainda sem morada de entrega",
  deliveryMapAlt: "Mapa da morada de entrega",
  deliveryDetail: "{distance} km · {minutes} min",
  instructionTitle: "Instruções de entrega",

  paymentTitle: "Método de pagamento",
  paymentShowAll: "Ver todos",
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
  savedCards: "Cartões guardados",
  savedCardExpiry: "Válido até {expiry}",
  newCard: "Usar outro cartão",
  saveCard: "Guardar este cartão",
  saveCardBody:
    "Para pagar mais depressa da próxima vez. O cartão fica guardado pelo fornecedor de pagamento.",
  gatewayNotice:
    "Conclui o pagamento na página segura do fornecedor de pagamento e depois volta aqui.",
  instantNotice: "Este cartão é cobrado de imediato, sem redirecionamento.",
  chooseMethod: "Escolha primeiro como quer pagar.",
  payNow: "Pagar agora",

  addressTitle: "Escolha uma morada de entrega",
  addressBody:
    "A encomenda é entregue na sua morada ativa. Escolher outra torna-a a sua morada ativa em toda a aplicação.",
  addressActive: "Ativa",
  addressHome: "Casa",
  addressOffice: "Escritório",
  addressCurrent: "Localização atual",
  addressOther: "Outra",
  addressEmpty: "Sem moradas guardadas",
  addressEmptyBody: "Adicione uma morada à sua conta e volte à finalização da compra.",

  voucherTitle: "Aplicar um voucher",
  voucherCodeLabel: "Código do voucher",
  voucherCodePlaceholder: "Introduza o código do voucher",
  voucherApply: "Aplicar",
  voucherApplied: "Aplicado",
  voucherRemove: "Remover voucher",
  voucherEmpty: "Sem vouchers para esta encomenda",
  voucherEmptyBody:
    "Nenhuma das suas ofertas se aplica a esta loja neste momento. Ainda pode introduzir um código acima.",
  voucherUnavailable: "Não foi possível carregar os vouchers",
  voucherUnavailableBody:
    "Ainda pode introduzir um código acima, ou tentar de novo daqui a pouco.",
  voucherPercent: "{value}% de desconto",
  voucherFlat: "{amount} de desconto",
  voucherBogo: "Compre {buy}, leve {get}",
  voucherCap: "até {amount}",
  voucherMin: "encomenda mín. {amount}",
  voucherUntil: "até {date}",

  vatIncluded: "IVA incl. {amount}",
  vatAdded: "+ IVA {amount}",

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
  confirmedClose: "Fechar",
  paymentPaid: "Pago",

  returnFinishing: "A concluir a sua encomenda…",
  returnFailedTitle: "A sua encomenda não foi criada",
  returnFailedBody:
    "Se o pagamento foi feito, tente de novo: a encomenda é criada a partir da finalização, sem cobrar duas vezes.",
  returnMissingTitle: "Nenhum pagamento pendente",
  returnMissingBody:
    "Este navegador não tem nenhuma compra à espera de pagamento. O que já encomendou está nas suas encomendas.",
  retry: "Tentar de novo",
  viewOrders: "Ver as minhas encomendas",
  failedTitle: "Pagamento não concluído",
  failedBody: "Nada foi encomendado. Pode pagar de novo a partir do carrinho.",
  backToCart: "Voltar ao carrinho",

  preparing: "A preparar a finalização da compra…",
  emptyTitle: "Nada para finalizar",
  emptyBody: "O seu carrinho não tem nenhuma loja selecionada para finalizar.",
  unavailableTitle: "Não foi possível carregar a finalização",
  unavailableBody:
    "Não foi possível ler a encomenda agora. Nada foi cobrado; tente de novo.",
  actionFailed: "Não foi possível concluir, e nada foi cobrado. Tente de novo.",
  previewOnly:
    "Esta é uma pré-visualização do design. Nada é enviado a partir desta página.",
} satisfies Record<string, string>;

export default checkout;
