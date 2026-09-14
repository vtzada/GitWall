import type { GithubError } from "@/tauri/commands";

interface WallpaperErrorProps {
  error: GithubError | string;
  onRetry: () => void;
  onOpenSettings: () => void;
}

export function WallpaperError({
  error,
  onRetry,
  onOpenSettings,
}: WallpaperErrorProps) {
  let title = "Erro de Conexão";
  let message = "Não foi possível obter suas contribuições do GitHub no momento.";

  if (typeof error === "object" && error !== null) {
    if (error.kind === "AuthRequired") {
      title = "Autenticação Necessária";
      message = "O token do GitHub não foi configurado ou é inválido. Verifique suas credenciais.";
    } else if (error.kind === "UserNotFound") {
      title = "Usuário Não Encontrado";
      message = `O usuário do GitHub "${error.message}" não existe. Verifique a digitação nas configurações.`;
    } else if (error.kind === "RateLimited") {
      title = "Limite de Requisições Atingido";
      message = "A taxa limite da API do GitHub foi excedida temporariamente. Tente novamente mais tarde.";
    } else if (error.kind === "Network") {
      title = "Sem Conexão com a Internet";
      message = "Verifique sua conexão de rede e tente novamente.";
    } else if (error.kind === "Api") {
      title = "Erro da API do GitHub";
      message = error.message;
    }
  } else if (typeof error === "string") {
    message = error;
  }

  return (
    <div className="flex animate-fade-in flex-col gap-6 max-w-lg">
      <div className="flex flex-col gap-2">
        <h2 className="font-serif text-3xl font-normal tracking-tight text-accent">
          {title}
        </h2>
        <p className="text-sm text-text-secondary leading-relaxed">
          {message}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onRetry}
          className="rounded bg-accent px-4 py-2 text-xs font-medium text-[#0a0d12] hover:bg-[#ebd28b] transition-colors cursor-pointer"
        >
          Tentar novamente
        </button>
        <button
          onClick={onOpenSettings}
          className="rounded border border-hairline bg-[#141a22] px-4 py-2 text-xs font-medium text-text-primary hover:bg-[#1e2632] transition-colors cursor-pointer"
        >
          Abrir Configurações
        </button>
      </div>
    </div>
  );
}
