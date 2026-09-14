/**
 * The sign-in flow's words.
 *
 * Its own namespace because it is its own screen: the drawer is reachable from
 * every route in the application, but only the routes somebody actually signs
 * in from should pay for these strings. `SignInDrawer` loads this chunk when it
 * opens; nothing before that.
 *
 * The copy is the design file's, transcribed from the four auth frames. Where
 * the previous app had the same sentence the Portuguese is carried over
 * verbatim — it was professionally translated and there is nothing to gain from
 * re-inventing it.
 */
const auth = {
  // "Welcome to DeliGo", with the name in brand pink. Split so the name comes
  // from `common.appName` and is never translated or mis-cased, and so the
  // sentence can be reordered in a language that needs it.
  welcomeTitle: "Welcome to",
  welcomeSubtitle: "Login or create an account. We’ll send you a quick OTP to verify.",

  phoneLabel: "Enter your phone number",
  // Nine digits in the shape Portuguese mobile numbers take. The design draws
  // a row of x's; a real example is the same number of characters and actually
  // tells somebody what is expected.
  phonePlaceholder: "912 345 678",
  emailLabel: "Enter your email address",
  emailPlaceholder: "name@gmail.com",

  continueWithOtp: "Continue With OTP",

  verifyTitle: "Verify Your Account",
  // The design uses the phone sentence on both verify frames — a copy-paste
  // slip of the same kind as the duplicated FAQ question on the landing page.
  // The email variant says email, and warns about the spam folder: an OTP mail
  // is a one-off from an unfamiliar sender, which is exactly what filters hold
  // back, and somebody who never thinks to look there concludes it is broken.
  verifySubtitlePhone: "Enter the {length}-digit code we sent to your phone number.",
  verifySubtitleEmail:
    "Enter the {length}-digit code we sent to your email address. If it isn’t there, check your spam folder.",
  codeLabel: "Verification code",

  changePhone: "Change Phone Number",
  changeEmail: "Change Email Address",
  verifyOtp: "Verify OTP",

  // Not in the design, and kept anyway: without it a code that never arrives
  // is a dead end, and the previous app has had one since launch. The backend
  // rate-limits these, so the button names the wait rather than failing four
  // times a second.
  resendCode: "Resend code",
  resendIn: "Resend in {seconds}s",
  codeSent: "Code sent.",

  or: "OR",
  continueWithGoogle: "Continue with Google",
  continueWithFacebook: "Continue with Facebook",
  continueWithEmail: "Continue with Email",
  continueWithPhone: "Continue with Phone",

  phoneRequired: "Enter your phone number.",
  emailRequired: "Enter your email address.",
  otpRequired: "Enter the {length}-digit code we sent you.",

  // Track B's honest answer. The screens are built before the API is connected
  // (Plan.md §8, Phase 15), and the alternative to saying so is a form that
  // appears to work and silently does nothing — which is the class of bug this
  // rebuild exists to stop repeating.
  signInUnavailable: "We couldn’t reach DeliGo. Check your connection and try again.",
  socialFailed: "Sign-in failed. Please try again.",
  socialEmailRequired:
    "We could not get your email address from that account. Allow email access and try again, or log in with your phone number.",
  socialAlreadyLinked: "That account is already connected to another DeliGo user.",
  socialUnavailable: "This sign-in option is temporarily unavailable.",

  notWired:
    "Sign-in is not connected yet. This screen is complete; the API behind it arrives in a later phase, and nothing you type here is sent anywhere.",

  termsIntro: "By continuing, you agree to our",
  termsOfService: "Terms of Service",
  and: "and",
  privacyPolicy: "Privacy Policy",

  signInTitle: "Sign in to DeliGo",

  deviceLimitTitle: "Device limit exceeded",
  deviceLimitBody:
    "You have reached your maximum device limit. Do you want to remove an existing session and sign in here?",
  deviceLimitCancel: "Cancel",
  deviceLimitConfirm: "Remove a session",
} satisfies Record<string, string>;

export default auth;
