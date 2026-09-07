"use client";

import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { Chip } from "@/components/ui/Chip";
import { Drawer } from "@/components/ui/Drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { EmptyState } from "@/components/ui/EmptyState";
import { Field } from "@/components/ui/Field";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Input, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { Radio, RadioGroupRoot } from "@/components/ui/Radio";
import { Rating } from "@/components/ui/Rating";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { Spinner } from "@/components/ui/Spinner";
import { Switch } from "@/components/ui/Switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Toaster, toast } from "@/components/ui/Toast";
import { Tooltip, TooltipProvider } from "@/components/ui/Tooltip";

/**
 * Sample copy for the gallery.
 *
 * Deliberately untranslated, and deliberately gathered here rather than typed
 * into the JSX below. This page is a development tool — it never ships — and a
 * fixture is not a string a customer reads. Keeping them in one object is what
 * makes that claim checkable: everything user-facing in the real app comes from
 * a dictionary, and the exceptions are the twenty lines below.
 */
const FIXTURES = {
  buttonLabel: "Add to cart",
  linkLabel: "Show on map",
  placeholder: "Search stores, restaurants, or cuisines",
  emailLabel: "Email",
  emailHelp: "We use this for order updates only.",
  emailError: "Enter a valid email address.",
  notesLabel: "Delivery notes",
  chips: ["Food (3)", "Groceries (2)", "Electronics (2)"],
  selectPlaceholder: "Choose a time",
  times: ["As soon as possible", "In 30 minutes", "In 1 hour"],
  tabs: ["All", "Food", "Groceries"],
  radios: ["Deliver to door", "Meet at door", "Leave at door"],
  faq: [
    {
      q: "How long does delivery take?",
      a: "Most orders arrive within 30 to 45 minutes.",
    },
    { q: "Can I schedule an order?", a: "Yes — pick a slot at checkout." },
  ],
  menu: ["Profile", "Orders", "Sign out"],
  modalTitle: "Apply a voucher",
  modalBody: "Enter the code exactly as it appears in your email.",
  drawerTitle: "Sign in",
  drawerBody: "Continue with the account you already use.",
  close: "Close",
  cancel: "Cancel",
  confirm: "Confirm",
  tooltip: "Set address",
  avatarAlt: "Ana Ribeiro",
  avatarFallback: "AR",
  ratingLabel: "4.3 out of 5",
  emptyTitle: "No orders yet",
  emptyBody: "When you place an order it will appear here.",
  emptyAction: "Browse restaurants",
  quantity: {
    decrease: "Decrease quantity",
    increase: "Increase quantity",
    label: "Quantity",
  },
  paging: { nav: "Pagination", previous: "Previous page", next: "Next page" },
  toast: { trigger: "Show toast", title: "Added to cart", body: "Margherita · 1 item" },
} as const;

function Row({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <section className="border-line-subtle border-t pt-8">
      <h2 className="text-ink-subtle text-12 tracking-wider mb-4 font-medium uppercase">
        {name}
      </h2>
      <div className="flex flex-wrap items-center gap-4">{children}</div>
    </section>
  );
}

export function Gallery() {
  const [checked, setChecked] = useState<boolean | "indeterminate">(true);
  const [switched, setSwitched] = useState(true);
  const [quantity, setQuantity] = useState(2);
  const [page, setPage] = useState(3);
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedChip, setSelectedChip] = useState(0);

  const icons: IconName[] = [
    "check",
    "chevron-down",
    "chevron-left",
    "chevron-right",
    "chevron-up",
    "close",
    "search",
    "plus",
    "minus",
    "alert",
    "star",
  ];

  return (
    <TooltipProvider>
      <main className="bg-surface mx-auto max-w-5xl space-y-10 px-8 py-16">
        <h1 className="text-32 text-ink-strong tracking-tight font-semibold">
          {"DeliGo"}
        </h1>

        <Row name="Button · variant">
          <Button>{FIXTURES.buttonLabel}</Button>
          <Button variant="secondary">{FIXTURES.buttonLabel}</Button>
          <Button variant="outline">{FIXTURES.buttonLabel}</Button>
          <Button variant="ghost">{FIXTURES.buttonLabel}</Button>
          <Button variant="danger">{FIXTURES.buttonLabel}</Button>
          <Button variant="link">{FIXTURES.linkLabel}</Button>
        </Row>

        <Row name="Button · size, shape, state">
          <Button size="sm">{FIXTURES.buttonLabel}</Button>
          <Button size="md">{FIXTURES.buttonLabel}</Button>
          <Button size="lg">{FIXTURES.buttonLabel}</Button>
          <Button shape="pill">{FIXTURES.buttonLabel}</Button>
          <Button loading>{FIXTURES.buttonLabel}</Button>
          <Button disabled>{FIXTURES.buttonLabel}</Button>
          <Button size="icon" aria-label={FIXTURES.close}>
            <Icon name="close" />
          </Button>
          <Button size="icon-sm" variant="outline" aria-label={FIXTURES.close}>
            <Icon name="plus" className="size-4" />
          </Button>
          <Button startIcon={<Icon name="search" className="size-4" />}>
            {FIXTURES.buttonLabel}
          </Button>
        </Row>

        <Row name="Icon">
          {icons.map((name) => (
            <span key={name} className="text-ink flex flex-col items-center gap-1">
              <Icon name={name} />
              <span className="text-8 text-ink-subtle">{name}</span>
            </span>
          ))}
          <Spinner className="text-brand" />
        </Row>

        <Row name="Input · Textarea · Field">
          <div className="w-full max-w-sm space-y-4">
            <Input placeholder={FIXTURES.placeholder} />
            <Input
              placeholder={FIXTURES.placeholder}
              startIcon={<Icon name="search" className="size-5" />}
            />
            <Input placeholder={FIXTURES.placeholder} disabled />
            <Field label={FIXTURES.emailLabel} help={FIXTURES.emailHelp} required>
              {(ids) => (
                <Input type="email" placeholder={FIXTURES.placeholder} {...ids} />
              )}
            </Field>
            <Field label={FIXTURES.emailLabel} error={FIXTURES.emailError}>
              {(ids) => <Input type="email" invalid {...ids} />}
            </Field>
            <Field label={FIXTURES.notesLabel}>
              {(ids) => <Textarea placeholder={FIXTURES.placeholder} {...ids} />}
            </Field>
          </div>
        </Row>

        <Row name="Badge · Chip">
          <Badge>{FIXTURES.chips[0]}</Badge>
          <Badge tone="neutral">{FIXTURES.chips[1]}</Badge>
          <Badge tone="success">{FIXTURES.chips[2]}</Badge>
          <Badge tone="warning">{FIXTURES.chips[0]}</Badge>
          <Badge tone="danger">{FIXTURES.chips[1]}</Badge>
          <Badge tone="solid">{FIXTURES.chips[2]}</Badge>
          {FIXTURES.chips.map((chip, i) => (
            <Chip
              key={chip}
              selected={i === selectedChip}
              onClick={() => setSelectedChip(i)}
            >
              {chip}
            </Chip>
          ))}
        </Row>

        <Row name="Checkbox · Radio · Switch">
          <Checkbox checked={checked} onCheckedChange={setChecked} />
          <Checkbox checked="indeterminate" />
          <Checkbox disabled />
          <RadioGroupRoot defaultValue={FIXTURES.radios[0]}>
            {FIXTURES.radios.map((option) => (
              <div key={option} className="flex items-center gap-3">
                <Radio value={option} id={option} />
                <label htmlFor={option} className="text-14 text-ink">
                  {option}
                </label>
              </div>
            ))}
          </RadioGroupRoot>
          <Switch checked={switched} onCheckedChange={setSwitched} />
          <Switch disabled />
        </Row>

        <Row name="Select">
          <div className="w-full max-w-sm">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder={FIXTURES.selectPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {FIXTURES.times.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Row>

        <Row name="Tabs">
          <Tabs defaultValue={FIXTURES.tabs[0]} className="w-full">
            <TabsList>
              {FIXTURES.tabs.map((tab) => (
                <TabsTrigger key={tab} value={tab}>
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>
            {FIXTURES.tabs.map((tab) => (
              <TabsContent key={tab} value={tab} className="text-14 text-ink-muted">
                {tab}
              </TabsContent>
            ))}
          </Tabs>
        </Row>

        <Row name="Accordion">
          <Accordion type="single" collapsible className="w-full">
            {FIXTURES.faq.map((entry) => (
              <AccordionItem key={entry.q} value={entry.q}>
                <AccordionTrigger>{entry.q}</AccordionTrigger>
                <AccordionContent>{entry.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Row>

        <Row name="Card · Skeleton · Avatar · Rating">
          <Card interactive className="w-56">
            <Skeleton className="rounded-16 h-28 w-full rounded-b-none" />
            <CardBody className="space-y-2">
              <p className="text-14 text-ink-strong font-semibold">
                {FIXTURES.avatarAlt}
              </p>
              <Rating value={4.3} label={FIXTURES.ratingLabel} />
            </CardBody>
          </Card>
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Avatar alt={FIXTURES.avatarAlt} fallback={FIXTURES.avatarFallback} />
        </Row>

        <Row name="Overlays">
          <Tooltip label={FIXTURES.tooltip}>
            <Button variant="outline" size="icon" aria-label={FIXTURES.tooltip}>
              <Icon name="search" />
            </Button>
          </Tooltip>

          <Button variant="outline" onClick={() => setModalOpen(true)}>
            {FIXTURES.modalTitle}
          </Button>
          <Modal
            open={modalOpen}
            onOpenChange={setModalOpen}
            title={FIXTURES.modalTitle}
            description={FIXTURES.modalBody}
            closeLabel={FIXTURES.close}
            footer={
              <>
                <Button variant="ghost" onClick={() => setModalOpen(false)}>
                  {FIXTURES.cancel}
                </Button>
                <Button onClick={() => setModalOpen(false)}>{FIXTURES.confirm}</Button>
              </>
            }
          >
            <Input placeholder={FIXTURES.placeholder} />
          </Modal>

          <Button variant="outline" onClick={() => setDrawerOpen(true)}>
            {FIXTURES.drawerTitle}
          </Button>
          <Drawer
            open={drawerOpen}
            onOpenChange={setDrawerOpen}
            title={FIXTURES.drawerTitle}
            description={FIXTURES.drawerBody}
            closeLabel={FIXTURES.close}
          >
            <div className="space-y-3">
              <Button block variant="secondary">
                {FIXTURES.menu[0]}
              </Button>
              <Button block variant="secondary">
                {FIXTURES.menu[1]}
              </Button>
            </div>
          </Drawer>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                endIcon={<Icon name="chevron-down" className="size-4" />}
              >
                {FIXTURES.menu[0]}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>{FIXTURES.menu[0]}</DropdownMenuItem>
              <DropdownMenuItem>{FIXTURES.menu[1]}</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>{FIXTURES.menu[2]}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            onClick={() =>
              toast(FIXTURES.toast.title, { description: FIXTURES.toast.body })
            }
          >
            {FIXTURES.toast.trigger}
          </Button>
        </Row>

        <Row name="QuantityStepper · Pagination">
          <QuantityStepper
            value={quantity}
            onChange={setQuantity}
            decreaseLabel={FIXTURES.quantity.decrease}
            increaseLabel={FIXTURES.quantity.increase}
            quantityLabel={FIXTURES.quantity.label}
          />
          <Pagination
            page={page}
            pageCount={12}
            onPageChange={setPage}
            label={FIXTURES.paging.nav}
            previousLabel={FIXTURES.paging.previous}
            nextLabel={FIXTURES.paging.next}
            pageLabel={(n) => `${FIXTURES.paging.nav} ${n}`}
          />
        </Row>

        <Row name="EmptyState">
          <EmptyState
            icon={<Icon name="alert" className="size-8" />}
            title={FIXTURES.emptyTitle}
            description={FIXTURES.emptyBody}
            action={<Button variant="outline">{FIXTURES.emptyAction}</Button>}
            className="w-full"
          />
        </Row>

        <Toaster />
      </main>
    </TooltipProvider>
  );
}
