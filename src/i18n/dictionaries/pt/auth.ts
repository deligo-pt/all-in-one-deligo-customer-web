/**
 * As palavras do fluxo de autenticação.
 *
 * O texto é o do ficheiro de design, transcrito dos quatro ecrãs de
 * autenticação. Onde a aplicação anterior tinha a mesma frase, a tradução é
 * transcrita tal e qual: foi traduzida profissionalmente e não há nada a ganhar
 * em reinventá-la.
 */
const auth = {
  welcomeTitle: "Bem-vindo à",
  welcomeSubtitle:
    "Entrar ou criar uma conta. Enviamos-lhe um OTP rápido para verificar.",

  phoneLabel: "Introduza o seu número de telemóvel",
  phonePlaceholder: "912 345 678",
  emailLabel: "Introduza o seu endereço de e-mail",
  emailPlaceholder: "nome@gmail.com",

  continueWithOtp: "Continuar com OTP",

  verifyTitle: "Verifique a sua conta",
  verifySubtitlePhone:
    "Introduza o código de {length} dígitos que enviámos para o seu telemóvel.",
  verifySubtitleEmail:
    "Introduza o código de {length} dígitos que enviámos para o seu e-mail. Se não o encontrar, verifique a pasta de spam.",
  codeLabel: "Código de verificação",

  changePhone: "Alterar número de telemóvel",
  changeEmail: "Alterar endereço de e-mail",
  verifyOtp: "Verificar OTP",

  resendCode: "Reenviar código",
  resendIn: "Reenviar em {seconds}s",
  codeSent: "Código enviado.",

  or: "OU",
  continueWithGoogle: "Continuar com Google",
  continueWithFacebook: "Continuar com Facebook",
  continueWithEmail: "Continuar com e-mail",
  continueWithPhone: "Continuar com telemóvel",

  phoneRequired: "Introduza o seu número de telemóvel.",
  emailRequired: "Introduza o seu endereço de e-mail.",
  otpRequired: "Introduza o código de {length} dígitos que lhe enviámos.",

  signInUnavailable:
    "Não conseguimos contactar a DeliGo. Verifique a sua ligação e tente novamente.",
  socialFailed: "A autenticação falhou. Tente novamente.",
  socialEmailRequired:
    "Não conseguimos obter o seu email dessa conta. Permita o acesso ao email e tente novamente, ou entre com o seu número de telemóvel.",
  socialAlreadyLinked: "Essa conta já está associada a outro utilizador DeliGo.",
  socialUnavailable: "Esta opção de entrada está temporariamente indisponível.",

  notWired:
    "A autenticação ainda não está ligada. Este ecrã está completo; a API por trás dele chega numa fase posterior e nada do que escrever aqui é enviado para lado nenhum.",

  termsIntro: "Ao continuar, concorda com os nossos",
  termsOfService: "Termos de Serviço",
  and: "e",
  privacyPolicy: "Política de Privacidade",

  signInTitle: "Entrar na DeliGo",

  deviceLimitTitle: "Limite de dispositivos excedido",
  deviceLimitBody:
    "Atingiu o número máximo de dispositivos permitidos. Pretende remover uma sessão existente e iniciar sessão neste dispositivo?",
  deviceLimitCancel: "Cancelar",
  deviceLimitConfirm: "Remover uma sessão",
} satisfies Record<string, string>;

export default auth;
