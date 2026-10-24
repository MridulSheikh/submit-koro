import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ComponentProps } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "cn";

function Pagination({ className, ...props }: ComponentProps<"nav">) {
  return <nav aria-label="pagination" role="navigation" data-slot="pagination" className={cn("mx-auto flex w-full justify-center", className)} {...props} />;
}

function PaginationContent({ className, ...props }: ComponentProps<"ul">) {
  return <ul data-slot="pagination-content" className={cn("flex flex-row items-center gap-1", className)} {...props} />;
}

function PaginationItem(props: ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />;
}

type PaginationLinkProps = ComponentProps<typeof Link> & {
  isActive?: boolean;
  size?: "default" | "sm" | "lg" | "icon" | "icon-sm" | "icon-lg" | "icon-xs" | "xs";
};

function PaginationLink({ className, isActive = false, size = "icon", ...props }: PaginationLinkProps) {
  return <Link data-slot="pagination-link" aria-current={isActive ? "page" : undefined} data-active={isActive} className={cn(buttonVariants({ variant: isActive ? "outline" : "ghost", size }), className)} {...props} />;
}

type PaginationDirectionProps = {
  href: string;
  disabled?: boolean;
  className?: string;
};

function PaginationPrevious({ href, disabled = false, className }: PaginationDirectionProps) {
  return <PaginationLink href={href} size="default" aria-disabled={disabled} tabIndex={disabled ? -1 : undefined} className={cn("gap-1.5 px-3", disabled && "pointer-events-none opacity-50", className)}><ChevronLeft aria-hidden="true" className="size-4" /><span>Previous</span></PaginationLink>;
}

function PaginationNext({ href, disabled = false, className }: PaginationDirectionProps) {
  return <PaginationLink href={href} size="default" aria-disabled={disabled} tabIndex={disabled ? -1 : undefined} className={cn("gap-1.5 px-3", disabled && "pointer-events-none opacity-50", className)}><span>Next</span><ChevronRight aria-hidden="true" className="size-4" /></PaginationLink>;
}

export { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious };
