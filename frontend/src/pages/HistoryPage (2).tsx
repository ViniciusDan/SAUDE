import { Breadcrumbs } from "../components/Breadcrumbs";

export function HistoryPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: "Dashboard", path: "/" }, { label: "Histórico" }]} />
      <h1 className="text-3xl font-bold text-[#212529] dark:text-white mb-6">Histórico Clínico</h1>
      <p className="text-[#6c757d] dark:text-gray-400">Página em desenvolvimento...</p>
    </div>
  );
}

