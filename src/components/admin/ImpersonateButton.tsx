"use client";

import { impersonateUser } from "@/app/actions/impersonate"; // Certifique-se que a action existe
import { Button } from "@/components/ui/button";
import { Ghost, Loader2 } from "lucide-react";
import { useState } from "react";

interface ImpersonateButtonProps {
  email: string;
  name: string;
}

export const ImpersonateButton = ({ email, name }: ImpersonateButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleImpersonate = async () => {
    // Confirmação de segurança
    if (!confirm(`ATENÇÃO: Você será desconectado da sua conta ADMIN e entrará como "${name}".\n\nDeseja continuar?`)) {
      return;
    }

    setIsLoading(true);
    try {
      const link = await impersonateUser(email);

      if (link) {
        // Redireciona para o Magic Link
        window.location.href = link;
      } else {
        alert("Erro: Link não gerado. Verifique se o usuário tem email válido.");
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao tentar acessar a conta. Verifique se você é MASTER.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleImpersonate}
      disabled={isLoading}
      type="button" // Importante para não submeter o formulário
      className="gap-2 border-dashed border-2 bg-red-100 text-red-700 hover:bg-red-200 border-red-300 ml-2"
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ghost className="w-4 h-4" />}
      Impersonar Usuário
    </Button>
  );
};
