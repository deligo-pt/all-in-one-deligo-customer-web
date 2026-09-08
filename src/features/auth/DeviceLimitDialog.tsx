"use client";

import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { useTranslation } from "@/hooks/useTranslation";

/**
 * "You are signed in on too many devices."
 *
 * The one sign-in failure that has a way forward, which is why it gets a dialog
 * instead of a line of red text. The backend answers it with `LIMIT_EXCEEDED`
 * and a human message that reads "Request limit exceeded" — misleading copy
 * that the old app learned not to branch on and not to show. `AuthFailure`
 * carries `kind: "device-limit"` instead, and the words here are ours.
 *
 * Confirming repeats the *exact* attempt that failed with `forceLogin`, so
 * agreeing does not send anyone back through a provider's consent screen or
 * make them ask for a second code. `useAuthFlow` holds that retry.
 */
export function DeviceLimitDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  const { t } = useTranslation("auth");
  const { t: common } = useTranslation("common");

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={t("deviceLimitTitle")}
      description={t("deviceLimitBody")}
      closeLabel={common("close")}
      footer={
        <>
          <Button variant="outline" shape="pill" onClick={() => onOpenChange(false)}>
            {t("deviceLimitCancel")}
          </Button>
          <Button shape="pill" onClick={onConfirm}>
            {t("deviceLimitConfirm")}
          </Button>
        </>
      }
    >
      <div className="bg-brand-tint text-brand mx-auto flex size-16 items-center justify-center rounded-full">
        <Icon name="devices" className="size-8" />
      </div>
    </Modal>
  );
}
