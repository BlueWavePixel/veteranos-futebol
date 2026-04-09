"use client";

import { useRouter } from "next/navigation";

const labels: Record<string, string> = {
  pt: "PT",
  br: "BR",
  es: "ES",
  en: "EN",
};

export function LocaleSwitcher({ current }: { current: string }) {
  const router = useRouter();

  function setLocale(locale: string) {
    // eslint-disable-next-line react-hooks/immutability -- setting a cookie in a click handler is intentional
    document.cookie = `locale=${locale};path=/;max-age=${365 * 24 * 60 * 60};samesite=lax`;
    router.refresh();
  }

  return (
    <div className="flex items-center gap-1 text-xs">
      {Object.entries(labels).map(([code, label]) => (
        <button
          key={code}
          onClick={() => setLocale(code)}
          className={`px-1.5 py-0.5 rounded transition-colors ${
            current === code
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
