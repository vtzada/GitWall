import { useState } from "react";
import "./App.css";
import { calculateCurrentStreak } from "./domain/streak/calculateCurrentStreak";
import { calculateLongestStreak } from "./domain/streak/calculateLongestStreak";
import {
  fetchContributions,
  type ContributionPayload,
  type GithubError,
} from "./tauri/commands";

function App() {
  const [username, setUsername] = useState("vtzada");
  const [token, setToken] = useState("");
  const [data, setData] = useState<ContributionPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleFetch() {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const result = await fetchContributions({
        username,
        year: new Date().getFullYear(),
        token,
      });
      setData(result);
    } catch (e) {
      const ge = e as GithubError;
      setError(typeof ge === "object" ? JSON.stringify(ge) : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0e14] p-8 text-neutral-200">
      <h1 className="mb-6 text-3xl font-semibold text-emerald-400">
        GitWall — teste de integração
      </h1>

      <div className="mb-4 flex max-w-xl flex-col gap-3">
        <input
          className="rounded border border-neutral-700 bg-neutral-900 px-3 py-2"
          placeholder="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="rounded border border-neutral-700 bg-neutral-900 px-3 py-2"
          placeholder="token (ghp_...)"
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
        <button
          className="rounded bg-emerald-600 px-4 py-2 font-medium hover:bg-emerald-500 disabled:opacity-50"
          onClick={handleFetch}
          disabled={loading || !username || !token}
        >
          {loading ? "Buscando..." : "Buscar contribuições"}
        </button>
      </div>

      {error && (
        <pre className="mb-4 max-w-2xl overflow-auto rounded bg-red-950 p-4 text-sm text-red-300">
          {error}
        </pre>
      )}

      {data && (
        <div className="max-w-2xl">
          <div className="mb-2 text-sm text-neutral-400">
            {data.user.login} · {data.days.length} dias · {data.total}{" "}
            contribuições
          </div>
          <pre className="overflow-auto rounded bg-neutral-900 p-4 text-xs">
            {JSON.stringify(data.days.slice(0, 5), null, 2)}
          </pre>
        </div>
      )}
      {data && (
        <div className="mt-4 text-sm text-neutral-400">
          Streak atual: {calculateCurrentStreak(data.days as any)} · Maior:{" "}
          {calculateLongestStreak(data.days as any)}
        </div>
      )}
    </main>
  );
}

export default App;
