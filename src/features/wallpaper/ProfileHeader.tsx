interface ProfileHeaderProps {
  name: string | null;
  login: string;
}

/**
 * Nome em serif + handle em sans. Sem avatar, sem foto.
 */
export function ProfileHeader({ name, login }: ProfileHeaderProps) {
  const displayName = name?.trim() || login;

  return (
    <header className="flex animate-fade-in flex-col gap-1 leading-tight">
      <h1 className="font-serif text-[clamp(1.75rem,3.2vmin,2.75rem)] font-normal tracking-tight text-text-primary">
        {displayName}
      </h1>
      <p className="text-[clamp(0.9rem,1.4vmin,1.1rem)] text-text-muted">
        @{login}
      </p>
    </header>
  );
}