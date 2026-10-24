import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

export default function PagePagination({ label, summary, page, pages, previousHref, nextHref }: {
  label: string;
  summary: string;
  page: number;
  pages: number;
  previousHref: string;
  nextHref: string;
}) {
  return <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
    <span className="text-xs text-slate-500">{summary}</span>
    <Pagination aria-label={label} className="mx-0 w-auto justify-end">
      <PaginationContent>
        <PaginationItem><PaginationPrevious href={previousHref} disabled={page <= 1} /></PaginationItem>
        <PaginationItem><PaginationNext href={nextHref} disabled={page >= pages} /></PaginationItem>
      </PaginationContent>
    </Pagination>
  </div>;
}
