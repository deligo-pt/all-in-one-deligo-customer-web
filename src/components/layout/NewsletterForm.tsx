"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

/**
 * The footer's newsletter sign-up.
 *
 * There is no subscribe endpoint in the API (Plan.md §2.3 lists it among the
 * features the design describes and the backend does not answer for). Rather
 * than wire it to nothing or fake a success, the form submits to nowhere and
 * says so in one place — here — until Phase 21 either finds the endpoint or
 * writes the specification for it.
 *
 * The field is a real `<input type="email">` in a real `<form>` so that
 * browser validation, autofill and Enter all work the day it is connected.
 */
export function NewsletterForm({
  placeholder,
  submitLabel,
}: {
  placeholder: string;
  submitLabel: string;
}) {
  const [email, setEmail] = useState("");

  return (
    <form
      className="flex items-center gap-2"
      onSubmit={(event) => {
        // No endpoint yet — see above. Prevented rather than left to navigate
        // away, which is what an unhandled submit does.
        event.preventDefault();
      }}
    >
      <Input
        type="email"
        name="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        aria-label={placeholder}
        placeholder={placeholder}
        className="text-14 rounded-8 h-11"
      />
      <Button type="submit" size="sm" className="shrink-0">
        {submitLabel}
      </Button>
    </form>
  );
}
