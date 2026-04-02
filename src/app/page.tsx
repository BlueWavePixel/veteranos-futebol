import { db } from "@/lib/db";
import { teams } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";
import { MapWrapper } from "@/components/map/map-wrapper";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getLocale } from "@/lib/i18n/get-locale";
import { t, tFn } from "@/lib/i18n/translations";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const locale = await getLocale();

  const allTeams = await db
    .select({
      id: teams.id,
      slug: teams.slug,
      name: teams.name,
      location: teams.location,
      latitude: teams.latitude,
      longitude: teams.longitude,
    })
    .from(teams)
    .where(eq(teams.isActive, true))
    .orderBy(teams.name);

  const [{ total }] = await db
    .select({ total: count() })
    .from(teams)
    .where(eq(teams.isActive, true));

  const teamsOnMap = allTeams.filter((team) => team.latitude && team.longitude).length;

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">{t("home", "title", locale)}</h1>
        <p className="text-muted-foreground text-lg mb-4">
          {t("home", "subtitle", locale)}
        </p>
        <p className="text-2xl font-mono font-bold text-primary">
          {total} {t("home", "teamsRegistered", locale)}
        </p>
      </section>

      <section className="mb-8 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6">
          {t("home", "howItWorks", locale)}{" "}
          <span className="text-base font-normal text-muted-foreground">
            ({t("home", "forNewUsers", locale)})
          </span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="space-y-2">
            <div className="text-3xl">📋</div>
            <h3 className="font-semibold">{t("home", "step1Title", locale)}</h3>
            <p className="text-sm text-muted-foreground">
              {t("home", "step1Desc", locale)}
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-3xl">🔍</div>
            <h3 className="font-semibold">{t("home", "step2Title", locale)}</h3>
            <p className="text-sm text-muted-foreground">
              {t("home", "step2Desc", locale)}
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-3xl">📅</div>
            <h3 className="font-semibold">{t("home", "step3Title", locale)}</h3>
            <p className="text-sm text-muted-foreground">
              {t("home", "step3Desc", locale)}
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-lg border bg-muted/50 p-5 text-sm text-muted-foreground space-y-2">
          <p>{t("home", "aboutPlatform", locale)}</p>
          <p>{t("home", "afterRegister", locale)}</p>
          <p>
            {(() => {
              const suggestionsWord = t("common", "suggestions", locale);
              const hint = t("home", "questionsHint", locale);
              const parts = hint.split(suggestionsWord);
              return parts.map((part, i, arr) =>
                i < arr.length - 1 ? (
                  // eslint-disable-next-line react/no-array-index-key
                  <span key={i}>
                    {part}
                    <a href="/sugestoes" className="text-primary hover:underline">
                      {suggestionsWord}
                    </a>
                  </span>
                ) : (
                  // eslint-disable-next-line react/no-array-index-key
                  <span key={i}>{part}</span>
                )
              );
            })()}
          </p>
        </div>
      </section>

      <section className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
        <Link href="/equipas">
          <Button size="lg" variant="outline">
            {t("home", "viewAllTeams", locale)}
          </Button>
        </Link>
        <Link href="/registar">
          <Button size="lg">{t("home", "registerMyTeam", locale)}</Button>
        </Link>
      </section>

      <section className="mb-8">
        <MapWrapper teams={allTeams} />
        <p className="text-sm text-muted-foreground text-center mt-2">
          {tFn("home", "teamsOnMap", locale)(teamsOnMap, total)}
        </p>
      </section>
    </div>
  );
}
