/**
 * `errors`, in Portuguese. Carried from the previous app, which had the same
 * two strings professionally translated.
 */
const errors = {
  notFoundTitle: "Página Não Encontrada",
  notFoundDescription:
    "Parece que chegou a um beco sem saída. A página que procura foi movida ou já não existe.",
  unexpectedTitle: "Algo correu mal",
  unexpectedDescription:
    "Ocorreu um erro inesperado ao carregar esta página. Pode tentar novamente ou voltar à página inicial.",
  tryAgain: "Tentar novamente",
  criticalError: "Ocorreu um erro crítico. Tente novamente.",
} satisfies Record<string, string>;

export default errors;
