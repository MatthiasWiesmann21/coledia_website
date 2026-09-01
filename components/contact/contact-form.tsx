"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { CheckCircle2, Send } from "lucide-react";
import type { z } from "zod";

import { buildContactSchema } from "@/lib/schemas/contact";
import { submitContact } from "@/lib/actions/contact";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export function ContactForm() {
  const t = useTranslations("contact.form");
  const [state, setState] = React.useState<"idle" | "success" | "error">("idle");

  const schema = buildContactSchema({
    name: t("validation.name"),
    email: t("validation.email"),
    message: t("validation.message"),
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", organization: "", message: "", coffee: false },
  });

  async function onSubmit(values: z.infer<typeof schema>) {
    const result = await submitContact(values);
    if (result.ok) {
      setState("success");
      form.reset();
    } else {
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 rounded-3xl border border-green-brand/30 bg-green-brand/5 p-12 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-green-brand/12 text-green-brand">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <p className="text-xl font-bold">{t("successTitle")}</p>
        <p className="max-w-sm text-sm text-muted-foreground">{t("successText")}</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-5 rounded-3xl border border-border bg-card p-7 shadow-sm sm:p-8"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("name")}</FormLabel>
                <FormControl>
                  <Input {...field} autoComplete="name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("email")}</FormLabel>
                <FormControl>
                  <Input type="email" {...field} autoComplete="email" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="organization"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("organization")}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("message")}</FormLabel>
              <FormControl>
                <Textarea placeholder={t("messagePlaceholder")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="coffee"
          render={({ field }) => (
            <FormItem className="flex-row items-center gap-3 rounded-2xl border border-border bg-muted/40 px-4 py-3">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <FormLabel className="font-normal">{t("coffee")}</FormLabel>
            </FormItem>
          )}
        />

        {state === "error" && (
          <p className="text-sm font-medium text-orange-brand">{t("errorText")}</p>
        )}

        <Button type="submit" size="lg" disabled={form.formState.isSubmitting} className="self-start">
          <Send className="h-4 w-4" />
          {form.formState.isSubmitting ? t("sending") : t("submit")}
        </Button>
      </form>
    </Form>
  );
}
