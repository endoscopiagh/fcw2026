export function PageLoading() {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="glass-panel rounded-2xl p-4">
          <div className="skeleton h-4 w-36 rounded" />
          <div className="skeleton mt-2 h-5 w-52 rounded" />
        </div>

        <div className="glass-panel rounded-2xl p-6">
          <div className="skeleton h-8 w-56 rounded" />
          <div className="skeleton mt-3 h-4 w-72 rounded" />

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="skeleton h-28 rounded-xl" />
            <div className="skeleton h-28 rounded-xl" />
            <div className="skeleton h-28 rounded-xl" />
            <div className="skeleton h-28 rounded-xl" />
          </div>
        </div>
      </div>
    </main>
  );
}
