import Link from "next/link";
import { listSellers } from "@/lib/admin-queries";

export const dynamic = "force-dynamic";

export default async function AdminSellersPage() {
  const sellers = await listSellers();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-baseline justify-between">
        <h1 className="text-[28px] font-medium">Sellers</h1>
        <div className="text-[13px] text-[var(--text-subtle)]">
          {sellers.length.toLocaleString()} total
        </div>
      </div>

      <div className="border border-[#2a2a2a] rounded-lg overflow-hidden">
        <table className="w-full text-[14px]">
          <thead className="bg-[#141414] text-[var(--text-subtle)] text-left text-[12px] uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Submissions</th>
              <th className="px-4 py-3">Timezone</th>
              <th className="px-4 py-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {sellers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[var(--text-subtle)]">
                  No sellers yet.
                </td>
              </tr>
            ) : (
              sellers.map((s) => (
                <tr key={s.id} className="border-t border-[#2a2a2a] hover:bg-[#141414]">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/sellers/${s.id}`}
                      className="hover:text-[var(--text-strong)]"
                    >
                      {s.display_name || "—"}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-[var(--text-subtle)]">{s.email}</td>
                  <td className="px-4 py-3">{s.submission_count}</td>
                  <td className="px-4 py-3 text-[var(--text-subtle)]">{s.timezone}</td>
                  <td className="px-4 py-3 text-[var(--text-subtle)]">
                    {new Date(s.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
