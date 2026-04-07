"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { t, type Locale } from "@/lib/i18n/translations";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: Record<string, unknown>
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

export function LoginForm({ locale }: { locale: Locale }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showEmailChange, setShowEmailChange] = useState(false);
  const [oldEmail, setOldEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [changeSubmitted, setChangeSubmitted] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  const renderWidget = useCallback(() => {
    if (!siteKey || !turnstileRef.current || !window.turnstile) return;
    if (widgetIdRef.current) return; // already rendered

    widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
      sitekey: siteKey,
      callback: (token: string) => setTurnstileToken(token),
      "expired-callback": () => setTurnstileToken(null),
      theme: "dark",
    });
  }, [siteKey]);

  useEffect(() => {
    if (!siteKey) return;

    // If turnstile is already loaded (e.g., HMR), render immediately
    if (window.turnstile) {
      renderWidget();
      return;
    }

    // Load the script
    const script = document.createElement("script");
    script.src =
      "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad";
    script.async = true;

    (window as unknown as Record<string, unknown>).onTurnstileLoad =
      renderWidget;
    document.head.appendChild(script);

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, renderWidget]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/auth/magic-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        ...(turnstileToken ? { turnstileToken } : {}),
      }),
    });
    setLoading(false);
    setSent(true);
  }

  async function handleEmailChange(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/auth/request-email-change", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oldEmail, newEmail }),
    });
    setChangeSubmitted(true);
  }

  if (sent) {
    return (
      <div className="text-center p-4">
        <div className="text-4xl mb-4">&#9993;</div>
        <h2 className="text-xl font-bold mb-2">{t("login", "emailSent", locale)}</h2>
        <p className="text-sm text-muted-foreground">{t("login", "emailSentDesc", locale)}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">{t("form", "coordinatorEmail", locale)}</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@exemplo.com"
            required
          />
        </div>
        {siteKey && (
          <div ref={turnstileRef} className="flex justify-center" />
        )}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? t("login", "sending", locale) : t("login", "sendAccessLink", locale)}
        </Button>
      </form>

      <div className="border-t pt-4">
        <button
          type="button"
          onClick={() => setShowEmailChange(!showEmailChange)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
        >
          {t("login", "changeEmailLink", locale)}
        </button>

        {showEmailChange && !changeSubmitted && (
          <form onSubmit={handleEmailChange} className="space-y-3 mt-3">
            <div>
              <Label htmlFor="oldEmail" className="text-xs">{t("login", "changeEmailCurrentLabel", locale)}</Label>
              <Input
                id="oldEmail"
                type="email"
                value={oldEmail}
                onChange={(e) => setOldEmail(e.target.value)}
                required
                className="h-8 text-sm"
              />
            </div>
            <div>
              <Label htmlFor="newEmail" className="text-xs">{t("login", "changeEmailNewLabel", locale)}</Label>
              <Input
                id="newEmail"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
                className="h-8 text-sm"
              />
            </div>
            <Button type="submit" variant="outline" size="sm" className="w-full">
              {t("login", "changeEmailSubmit", locale)}
            </Button>
          </form>
        )}

        {changeSubmitted && (
          <p className="text-sm text-green-400 mt-3">{t("login", "changeEmailSent", locale)}</p>
        )}
      </div>
    </div>
  );
}
