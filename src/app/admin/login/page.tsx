"use client";

import { signIn } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminLoginPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Administração</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-6">
            Acesso restrito a moderadores. Entre com a sua conta Google
            autorizada.
          </p>
          <Button
            onClick={() => signIn("google", { callbackUrl: "/admin" })}
            className="w-full"
          >
            Entrar com Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
