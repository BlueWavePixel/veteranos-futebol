import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getLocale } from "@/lib/i18n/get-locale";
import { t } from "@/lib/i18n/translations";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const locale = await getLocale();

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      {error === "expired" && (
        <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-3 text-sm text-yellow-400 mb-6">
          {t("login", "expiredError", locale)}
        </div>
      )}
      {error === "invalid" && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive mb-6">
          {t("login", "invalidError", locale)}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section A: Existing team */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("login", "existingTeamTitle", locale)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {t("login", "existingTeamDesc", locale)}
            </p>
            <LoginForm locale={locale} />
          </CardContent>
        </Card>

        {/* Section B: New team */}
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-lg">{t("login", "newTeamTitle", locale)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-6">
              {t("login", "newTeamDesc", locale)}
            </p>
            <Link href="/registar">
              <Button variant="outline" className="w-full" size="lg">
                {t("login", "registerNewTeam", locale)}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
