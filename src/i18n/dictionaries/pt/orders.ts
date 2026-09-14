/** The order and notification screens' words, in Portuguese. See
 *  `en/orders.ts` for what each is for. */
const orders = {
  title: "Os Meus Pedidos",
  subtitle: "Tudo o que encomendou, e onde está cada um.",
  tabAll: "Todos",
  tabOngoing: "Em curso",
  tabComplete: "Concluídos",
  tabCancelled: "Cancelados",
  track: "Seguir pedido",
  details: "Detalhes",
  reorder: "Encomendar de novo",
  orderImage: "Fotografia do pedido",
  emptyTitle: "Ainda não há pedidos aqui",
  emptyBody: "Os pedidos que fizer aparecem aqui, com o estado e os recibos.",

  trackerLabel: "Progresso do pedido",
  stepConfirmed: "Confirmado",
  stepKitchen: "Cozinha",
  stepPacked: "Embalado",
  stepReady: "Pronto para recolha",
  stepCollected: "Recolhido",
  stepPicked: "Separado",
  stepRiderPicked: "Com o estafeta",
  stepOnWay: "A caminho",

  riderTitle: "O seu estafeta",
  riderImage: "Fotografia do estafeta",
  deliveryCode: "Código de entrega",
  deliveryCodeBody: "Dê este código ao estafeta quando o seu pedido chegar.",
  cancel: "Cancelar pedido",
  invoice: "Descarregar fatura",
  writeReview: "Escrever uma avaliação",

  reviewTitle: "Como correu o seu pedido?",
  reviewOverall: "Experiência geral",
  reviewThanks: "Obrigado pela sua avaliação",
  reviewPlaceholder: "Conte-nos mais... Partilhe a sua opinião (opcional)",
  reviewRider: "Como foi o {name}?",
  reviewStars: "Avaliar {count} em 5",
  reviewSubmit: "Enviar avaliação",
  reviewSkip: "Agora não",

  notificationsTitle: "Notificações",
  notificationsSubtitle:
    "Mantenha-se a par dos seus pedidos, viagens, entregas e ofertas exclusivas.",
  notificationsAll: "Todas",
  notificationsUnread: "{count} por ler",
  notificationImage: "Ilustração da notificação",
  notificationsEmpty: "Nada de novo",
  notificationsEmptyBody:
    "As atualizações sobre os seus pedidos, viagens e entregas chegam aqui.",

  unavailableTitle: "Os seus pedidos ainda não estão ligados",
  unavailableBody:
    "Este ecrã está construído; os pedidos por trás dele são ligados numa fase posterior. Nada aqui são dados de exemplo — simplesmente não há nada para mostrar até que exista.",
  notificationsUnavailable: "As notificações ainda não estão ligadas",
  notificationsUnavailableBody:
    "Este ecrã está construído; as notificações por trás dele são ligadas numa fase posterior.",
  notWired:
    "Isto ainda não está ligado. O controlo é real e o pedido que enviaria chega numa fase posterior — nada foi cancelado, reencomendado ou enviado.",
} satisfies Record<string, string>;

export default orders;
