import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { AppLayout } from "../../layouts/AppLayout";
import { MachinesService } from "../../services/machines.service";
import { parseApiError } from "../../api/errors";
import type { Machine } from "../../types/machines";

export function MachinesListPage() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadMachines() {
    setLoading(true);
    try {
      const data = await MachinesService.list();
      setMachines(data);
    } catch (e) {
      toast.error(parseApiError(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(machine: Machine) {
    const ok = window.confirm(`Delete machine "${machine.name}"?`);
    if (!ok) return;

    try {
      await MachinesService.remove(machine.id);
      toast.success("Machine deleted.");
      await loadMachines();
    } catch (e) {
      toast.error(parseApiError(e));
    }
  }

  useEffect(() => {
    void loadMachines();
  }, []);

  return (
    <AppLayout title="Machines">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Machines</h1>
            <p className="mt-1 text-sm text-slate-600">
              Manage your machines catalog.
            </p>
          </div>

          <Link
            to="/machines/new"
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
          >
            New machine
          </Link>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <th className="py-2">Name</th>
                <th className="py-2">Line</th>
                <th className="py-2">Location</th>
                <th className="py-2">Model</th>
                <th className="py-2">Serial</th>
                <th className="py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-500">
                    Loading machines...
                  </td>
                </tr>
              )}

              {!loading && machines.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-500">
                    No machines yet.
                  </td>
                </tr>
              )}

              {!loading &&
                machines.map((machine) => (
                  <tr
                    key={machine.id}
                    className="border-b border-slate-100 last:border-b-0"
                  >
                    <td className="py-3 font-medium text-slate-900">
                      {machine.name}
                    </td>
                    <td className="py-3 text-slate-600">
                      {machine.line ?? "-"}
                    </td>
                    <td className="py-3 text-slate-600">
                      {machine.location ?? "-"}
                    </td>
                    <td className="py-3 text-slate-600">
                      {machine.model ?? "-"}
                    </td>
                    <td className="py-3 text-slate-600">
                      {machine.serial_number ?? "-"}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/machines/${machine.id}/edit`}
                          className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(machine)}
                          className="rounded-md border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
