export function RoleSelectionScreen() {
  const goToCollector = () => {
    window.location.href = '/?role=collector';
  };

  const openAdmin = () => {
    window.location.href = 'https://sih-kabadiwala-connect.vercel.app/';
  };

  const openGovernment = () => {
    window.location.href = 'https://sih-kabadiwala-govt-dashboard.vercel.app/';
  };

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl flex-col justify-center">
        <div className="mb-10 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-emerald-400">
            Smart India Hackathon 2026
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Kabadiwala Connect
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            A connected e-waste collection and monitoring platform for collectors,
            administrators, and government authorities.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <button
            type="button"
            onClick={goToCollector}
            className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-7 text-left transition hover:-translate-y-1 hover:bg-emerald-500/15"
          >
            <div className="mb-5 text-3xl">♻️</div>
            <h2 className="text-xl font-semibold">Collector</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Create e-waste lots, classify materials with AI, and manage collections.
            </p>
            <span className="mt-6 inline-block text-sm font-semibold text-emerald-400">
              Open Collector →
            </span>
          </button>

          <button
            type="button"
            onClick={openAdmin}
            className="rounded-2xl border border-blue-400/30 bg-blue-500/10 p-7 text-left transition hover:-translate-y-1 hover:bg-blue-500/15"
          >
            <div className="mb-5 text-3xl">🖥️</div>
            <h2 className="text-xl font-semibold">Admin Dashboard</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Monitor lots, collectors, operations, and platform activity.
            </p>
            <span className="mt-6 inline-block text-sm font-semibold text-blue-400">
              Open Admin →
            </span>
          </button>

          <button
            type="button"
            onClick={openGovernment}
            className="rounded-2xl border border-violet-400/30 bg-violet-500/10 p-7 text-left transition hover:-translate-y-1 hover:bg-violet-500/15"
          >
            <div className="mb-5 text-3xl">🏛️</div>
            <h2 className="text-xl font-semibold">Government Dashboard</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              View aggregated e-waste data and monitoring insights for authorities.
            </p>
            <span className="mt-6 inline-block text-sm font-semibold text-violet-400">
              Open Government →
            </span>
          </button>
        </div>

        <p className="mt-10 text-center text-xs text-slate-500">
          Backend and AI services are connected through the shared platform API.
        </p>
      </div>
    </div>
  );
}
