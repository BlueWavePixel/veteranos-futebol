import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";
import { getLocale } from "@/lib/i18n/get-locale";

export default async function AdminLoginPage() {
  const locale = await getLocale();
  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Administração</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-6">
            Acesso restrito a moderadores. Insira o seu email autorizado para
            receber o link de acesso.
          </p>
          <LoginForm locale={locale} />
        </CardContent>
      </Card>
    </div>
  );
}
