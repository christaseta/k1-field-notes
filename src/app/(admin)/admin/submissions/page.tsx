import Link from "next/link";
import { listSubmissions } from "@/lib/admin-queries";
import type { FeedbackKind } from "@/lib/db-types";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

type SearchParams = {
  kind?: string;
  tag?: string;
  from?: string;
  to?: string;
  page?: string;
};

export default async function AdminSubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const kind = (["daily", "weekly", "spontaneous"] as const).includes(
    params.kind as FeedbackKind,
  )
    ? (params.kind as FeedbackKind)
    : undefined;

  const { rows, total } = await listSubmissions({
    kind,
    tag: params.tag || undefined,
    from: params.from || undefined,
    to: params.to ? new Date(params.to).toISOString() : undefined,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-baseline justify-between">
        <h1 className="text-[28px] font-medium">Submissions</h1>
        <div className="text-[13px] text-[var(--text-subtle)]">
          {total.toLocaleString()} total
        </div>
      </div>

      <form className="flex flex-wrap items-end gap-3 text-[13px]">
        <label className="flex flex-col gap-1">
          <span className="text-[var(--text-subtle)]">Kind</span>
          <select
            name="kind"
            defaultValue={kind ?? ""}
            className="bg-black border border-[#2a2a2a] rounded px-3 py-2"
          >
            <option value="">All</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="spontaneous">Spontaneous</option>
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[var(--text-subtle)]">Tag</span>
          <input
            name="tag"
            defaultValue={params.tag ?? ""}
            placeholder="e.g. pricing"
            className="bg-black border border-[#2a2a2a] rounded px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[var(--text-subtle)]">From</span>
          <input
            type="date"
            name="from"
            defaultValue={params.from ?? ""}
            className="bg-black border border-[#2a2a2a] rounded px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[var(--text-subtle)]">To</span>
          <input
            type="date"
            name="to"
            defaultValue={params.to ?? ""}
            className="bg-black border border-[#2a2a2a] rounded px-3 py-2"
          />
        </label>
        <button
          type="submit"
          className="px-4 py-2 border border-[#2a2a2a] rounded hover:bg-[#141414]"
        >
          Apply
        </button>
        <Link
          href="/admin/submissions"
          className="px-4 py-2 text-[var(--text-subtle)] hover:text-[var(--text-strong)]"
        >
          Reset
        </Link>
      </form>

      <div className="border border-[#2a2a2a] rounded-lg overflow-hidden">
        <table className="w-full text-[14px]">
          <thead className="bg-[#141414] text-[var(--text-subtle)] text-left text-[12px] uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Seller</th>
              <th className="px-4 py-3">Kind</th>
              <th className="px-4 py-3">Tags</th>
              <th className="px-4 py-3">Preview</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[var(--text-subtle)]">
                  No submissions match these filters.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-t border-[#2a2a2a] hover:bg-[#141414]">
                  <td className="px-4 py-3 whitespace-nowrap text-[var(--text-subtle)]">
                    <Link
                      href={`/admin/submissions/${row.id}`}
                      className="hover:text-[var(--text-strong)]"
                    >
                      {new Date(row.submitted_at).toLocaleString()}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {row.seller ? (
                      <Link
                        href={`/admin/sellers/${row.seller.id}`}
                        className="hover:text-[var(--text-strong)]"
                      >
                        {row.seller.display_name || row.seller.email}
                      </Link>
                    ) : (
                      row.seller_id
                    )}
                  </td>
                  <td className="px-4 py-3 capitalize">{row.kind}</td>
                  <td className="px-4 py-3 text-[var(--text-subtle)]">
                    {row.tags?.length ? row.tags.join(", ") : "—"}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-subtle)] truncate max-w-[400px]">
                    {row.note ||
                      row.answers?.find((a) => a.answer)?.answer ||
                      "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          searchParams={params}
        />
      )}
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  searchParams,
}: {
  page: number;
  totalPages: number;
  searchParams: SearchParams;
}) {
  const buildHref = (p: number) => {
    const qs = new URLSearchParams();
    Object.entries(searchParams).forEach(([k, v]) => {
      if (v && k !== "page") qs.set(k, v);
    });
    qs.set("page", String(p));
    return `/admin/submissions?${qs.toString()}`;
  };
  return (
    <div className="flex items-center justify-between text-[13px]">
      <div className="text-[var(--text-subtle)]">
        Page {page} of {totalPages}
      </div>
      <div className="flex gap-2">
        {page > 1 && (
          <Link
            href={buildHref(page - 1)}
            className="px-3 py-1.5 border border-[#2a2a2a] rounded hover:bg-[#141414]"
          >
            ← Prev
          </Link>
        )}
        {page < totalPages && (
          <Link
            href={buildHref(page + 1)}
            className="px-3 py-1.5 border border-[#2a2a2a] rounded hover:bg-[#141414]"
          >
            Next →
          </Link>
        )}
      </div>
    </div>
  );
}
