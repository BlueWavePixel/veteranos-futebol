import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { getLocale } from "@/lib/i18n/get-locale";
import { t } from "@/lib/i18n/translations";

export default async function RegistoSucessoPage() {
  const locale = await getLocale();

  return (
    <div className="container mx-auto px-4 py-16 max-w-lg">
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-5xl mb-4">&#9989;</div>
          <h1 className="text-2xl font-bold mb-2">
            {t("registerSuccess", "title", locale)}
          </h1>
          <p className="text-muted-foreground mb-6">
            {t("registerSuccess", "desc", locale)}
          </p>
          <Link href="/equipas">
            <Button variant="outline">
              {t("registerSuccess", "viewAll", locale)}
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
