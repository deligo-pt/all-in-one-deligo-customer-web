"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { checkoutApi } from "./api";

export type StartCopy = {
  preparing: string;
  unavailableTitle: string;
  backToCart: string;
};

/**
 * `/checkout` with no summary yet: builds one from the cart's active store
 * (`POST /checkout`) and replaces the URL with its id.
 *
 * A POST on arrival is what the old app did on every "Checkout" press; `useRef`
 * keeps React's development double-run from building two. A refusal shows the
 * API's own sentence.
 */
export function CheckoutStart({
  checkoutPath,
  cartHref,
  copy,
}: {
  checkoutPath: string;
  cartHref: string;
  copy: StartCopy;
}) {
  const router = useRouter();
  const started = useRef(false);
  const [failure, setFailure] = useState<string | null>(null);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    checkoutApi.start().then(
      (id) => router.replace(`${checkoutPath}?id=${encodeURIComponent(id)}`),
      (error: unknown) =>
        setFailure(error instanceof Error && error.message ? error.message : ""),
    );
  }, [checkoutPath, router]);

  return (
    <div className="max-w-shell mx-auto w-full px-8 py-16">
      {failure === null ? (
        <p role="status" className="text-16 text-ink-muted text-center">
          {copy.preparing}
        </p>
      ) : (
        <EmptyState
          icon={<Icon name="cart" className="size-8" />}
          title={copy.unavailableTitle}
          description={failure || undefined}
          action={
            <Button asChild>
              <Link href={cartHref}>{copy.backToCart}</Link>
            </Button>
          }
        />
      )}
    </div>
  );
}
