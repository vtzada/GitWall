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
    <header className="flex animate-fade-in flex-col gap-1.5 leading-tight">
      <h1 className="font-serif text-[clamp(2rem,4vmin,3.5rem)] font-normal tracking-tight text-text-primary">
        {displayName}
      </h1>
      <p className="text-[clamp(1rem,1.8vmin,1.4rem)] text-text-muted">
        @{login}
      </p>
    </header>
  );
}