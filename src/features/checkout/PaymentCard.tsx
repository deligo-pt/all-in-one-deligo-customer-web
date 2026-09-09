import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { PAYMENT_METHODS, type PaymentMethodId } from "./paymentMethods";

export type PaymentCopy = {
  title: string;
  showAll: string;
  showLess: string;
  /** One name and one description per method, keyed by id. A `Record`, not a
   *  function: this object is built on the server and handed to a client
   *  component, and a function cannot cross that boundary — the lesson
   *  `FilterCopy` taught in Phase 7. */
  methodName: Record<PaymentMethodId, string>;
  methodDescription: Record<PaymentMethodId, string>;
  cardNumber: string;
  cardNumberPlaceholder: string;
  cardHolder: string;
  cardHolderPlaceholder: string;
  cardExpiry: string;
  cardExpiryPlaceholder: string;
  cardCvv: string;
  cardCvvPlaceholder: string;
  cardNotice: string;
};

/** How many rows are visible before `Show all`. The design draws two. */
const COLLAPSED = 2;

/**
 * How the order gets paid for.
 *
 * Measured: the card at 24px radius over a `line` border; the heading at
 * 20/600; each option a 72px row at 16px radius with a 40×40 `brand-tint` tile
 * at 8px radius, a radio on the end, and 16 between rows; `Show all` at 16/500
 * in brand.
 *
 * ## Two corrections to the file
 *
 * **The method's name and its description are drawn the wrong way round.** The
 * file gives `MB WAY` 12/400 in black and `Instant mobile payment (Portugal)`
 * 16/500 in grey — a caption above a heading. Every one of the six rows has it,
 * which is what an instance override applied to the wrong text layer looks
 * like. The name leads here, at 16/500, over the description at 14/400 in
 * `ink-muted`.
 *
 * **The rows are a radio group, not six toggles.** The file draws a 20px
 * circle; a customer pays one way. Native radios, so arrow keys, a single tab
 * stop and the group's name all come free.
 *
 * ## The card form
 *
 * Built as drawn, and **wired to nothing** — no state leaves this component,
 * no name a password manager recognises, autocomplete off. Card details belong
 * to the payment provider, not to us: the old app pays through REDUNIQ, and
 * putting a real PAN through our own DOM would pull this application into PCI
 * scope for no benefit. See D-14; Phase 18 replaces these four inputs with the
 * provider's hosted fields, and the notice under them says so meanwhile.
 */
export function PaymentCard({
  value,
  onChange,
  copy,
}: {
  value: PaymentMethodId | null;
  onChange: (next: PaymentMethodId) => void;
  copy: PaymentCopy;
}) {
  const groupName = "checkout-payment-method";

  return (
    <section className="border-line rounded-24 bg-surface flex flex-col gap-6 border px-6 py-8">
      <h2 className="text-20 text-ink font-semibold">{copy.title}</h2>

      <div className="flex flex-col gap-4" role="radiogroup" aria-label={copy.title}>
        {PAYMENT_METHODS.map((method, index) => {
          const selected = value === method.id;
          return (
            <div key={method.id} className="flex flex-col gap-4">
              <label
                className={[
                  "rounded-16 flex cursor-pointer items-center gap-4 border p-4 transition-colors",
                  index >= COLLAPSED ? "max-lg:hidden" : "",
                  selected
                    ? "border-brand bg-brand-tint"
                    : "border-line hover:bg-surface-muted",
                ].join(" ")}
              >
                <span
                  aria-hidden
                  className="bg-brand-tint text-brand rounded-8 flex size-10 shrink-0 items-center justify-center"
                >
                  <Icon name={method.icon} className="size-6" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="text-16 text-ink font-medium">
                    {copy.methodName[method.id]}
                  </span>
                  <span className="text-14 text-ink-muted">
                    {copy.methodDescription[method.id]}
                  </span>
                </span>
                <input
                  type="radio"
                  name={groupName}
                  className="accent-brand size-5 shrink-0"
                  checked={selected}
                  onChange={() => onChange(method.id)}
                />
              </label>

              {method.expands && selected ? <CardForm copy={copy} /> : null}
            </div>
          );
        })}
      </div>

      {/* Below `lg` the list collapses to two rows and this reveals the rest,
          which is the design's own affordance. On a wide screen every option
          already fits, so the control would expand something that is not
          folded — see D-8 on why every breakpoint in this project is ours. */}
      <Button variant="link" className="text-16 self-start font-medium lg:hidden">
        {copy.showAll}
      </Button>
    </section>
  );
}

function CardForm({ copy }: { copy: PaymentCopy }) {
  const field =
    "border-line-subtle rounded-12 text-16 text-ink placeholder:text-ink-muted h-14 w-full border px-4";
  const label = "text-16 text-brand";

  return (
    <div className="border-line rounded-24 flex flex-col gap-4 border px-10 py-5">
      <div className="flex flex-col gap-1.5">
        <label className={label} htmlFor="checkout-card-number">
          {copy.cardNumber}
        </label>
        <input
          id="checkout-card-number"
          className={field}
          placeholder={copy.cardNumberPlaceholder}
          autoComplete="off"
          inputMode="numeric"
          disabled
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={label} htmlFor="checkout-card-holder">
          {copy.cardHolder}
        </label>
        <input
          id="checkout-card-holder"
          className={field}
          placeholder={copy.cardHolderPlaceholder}
          autoComplete="off"
          disabled
        />
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex min-w-40 flex-1 flex-col gap-1.5">
          <label className={label} htmlFor="checkout-card-expiry">
            {copy.cardExpiry}
          </label>
          <input
            id="checkout-card-expiry"
            className={field}
            placeholder={copy.cardExpiryPlaceholder}
            autoComplete="off"
            inputMode="numeric"
            disabled
          />
        </div>
        <div className="flex w-36 flex-col gap-1.5">
          <label className={label} htmlFor="checkout-card-cvv">
            {copy.cardCvv}
          </label>
          <input
            id="checkout-card-cvv"
            className={field}
            placeholder={copy.cardCvvPlaceholder}
            autoComplete="off"
            inputMode="numeric"
            disabled
          />
        </div>
      </div>

      {/* Not decoration. These four inputs are `disabled` and carry nothing
          away, and the sentence says why — a card form that looks ready to
          take a number is worse than one that admits it is not. */}
      <p className="text-14 text-ink-muted">{copy.cardNotice}</p>
    </div>
  );
}
