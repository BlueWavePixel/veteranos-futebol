import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Aceder à Minha Equipa</CardTitle>
        </CardHeader>
        <CardContent>
          {error === "expired" && (
            <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-3 text-sm text-yellow-400 mb-4">
              O link expirou. Peça um novo abaixo.
            </div>
          )}
          {error === "invalid" && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive mb-4">
              Link inválido. Peça um novo abaixo.
            </div>
          )}
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
