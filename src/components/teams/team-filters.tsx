"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTransition } from "react";
import { t, type Locale } from "@/lib/i18n/translations";

function getClientLocale(): Locale {
  if (typeof document === "undefined") return "pt";
  const match = document.cookie.match(/locale=(\w+)/);
  const val = match?.[1];
  if (val === "pt" || val === "br" || val === "es" || val === "en") return val;
  return "pt";
}

export function TeamFilters({ distritos }: { distritos: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const locale = getClientLocale();

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    startTransition(() => {
      router.push(`/equipas?${params.toString()}`);
    });
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <Input
        placeholder={t("teamsDirectory", "searchPlaceholder", locale)}
        defaultValue={searchParams.get("q") || ""}
        onChange={(e) => updateFilter("q", e.target.value)}
        className="flex-1"
      />
      <Select
        defaultValue={searchParams.get("distrito") || "all"}
        onValueChange={(value) => updateFilter("distrito", value ?? "all")}
      >
        <SelectTrigger className="w-full sm:w-[220px]">
          <SelectValue placeholder={t("teamsDirectory", "districtLabel", locale)} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("teamsDirectory", "allDistricts", locale)}</SelectItem>
          {distritos.map((d) => (
            <SelectItem key={d} value={d}>
              {d}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
