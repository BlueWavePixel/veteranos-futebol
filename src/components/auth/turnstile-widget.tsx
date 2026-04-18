"use client";

import { useEffect, useRef } from "react";

/**
 * Renders a Cloudflare Turnstile widget via implicit rendering.
 * The CF script auto-detects .cf-turnstile elements and renders widgets in them.
 * Token is auto-submitted as `cf-turnstile-response` in the FormData.
 */
export function TurnstileWidget({ siteKey }: { siteKey: string }) {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If script already loaded, CF auto-detects new .cf-turnstile elements on next tick
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src*="turnstile/v0/api.js"]',
    );
    if (existing) {
      // Trigger render on already-loaded script
      if (
        typeof window !== "undefined" &&
        (window as unknown as { turnstile?: { render: (el: HTMLElement, opts: Record<string, unknown>) => string } }).turnstile &&
        divRef.current
      ) {
        try {
          (window as unknown as { turnstile: { render: (el: HTMLElement, opts: Record<string, unknown>) => string } }).turnstile.render(
            divRef.current,
            { sitekey: siteKey, theme: "dark" },
          );
        } catch {
          // Widget already rendered in this element — ignore
        }
      }
      return;
    }

    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, [siteKey]);

  return (
    <div
      ref={divRef}
      className="cf-turnstile flex justify-center my-2"
      data-sitekey={siteKey}
      data-theme="dark"
    />
  );
}
