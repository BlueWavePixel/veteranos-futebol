import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";

export default function AdminLoginPage() {
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
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
