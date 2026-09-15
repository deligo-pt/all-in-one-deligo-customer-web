"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

/** Copies a code to the clipboard and says so for two seconds — the old app's
 *  referral and voucher "Copy". A browser that refuses the clipboard leaves the
 *  label unchanged; the code stays on screen to copy by hand. */
export function CopyButton({
  text,
  label,
  copiedLabel,
  className,
}: {
  text: string;
  label: string;
  copiedLabel: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="outline"
      size="sm"
      className={className}
      aria-live="polite"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          setCopied(false);
        }
      }}
    >
      {copied ? copiedLabel : label}
    </Button>
  );
}
