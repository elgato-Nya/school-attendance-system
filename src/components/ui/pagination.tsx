/**
 * Pagination Component
 * Reusable pagination controls
 */

import { Button } from './button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  startIndex: number;
  endIndex: number;
  totalRecords: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  startIndex,
  endIndex,
  totalRecords,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pageNumbers = [];
  const maxVisible = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);

  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4">
      {/* Records info - hidden on mobile, shown on desktop */}
      <div className="hidden sm:block text-sm text-muted-foreground">
        Showing <span className="font-medium">{startIndex}</span> to{' '}
        <span className="font-medium">{endIndex}</span> of{' '}
        <span className="font-medium">{totalRecords}</span> records
      </div>

      {/* Mobile: Compact info */}
      <div className="sm:hidden text-xs text-muted-foreground">
        {startIndex}-{endIndex} of {totalRecords}
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-1 sm:space-x-2">
        {/* First page button - always show */}
        {showFirstLast && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            aria-label="First page"
            className="h-8 w-8 sm:h-10 sm:w-10"
          >
            <ChevronsLeft className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        )}

        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
          className="h-8 w-8 sm:h-10 sm:w-10"
        >
          <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>

        {/* Desktop: Show first page + ellipsis */}
        {startPage > 1 && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(1)}
              className="hidden sm:inline-flex min-w-10"
            >
              1
            </Button>
            {startPage > 2 && (
              <span key="ellipsis-start" className="hidden sm:inline text-muted-foreground px-1">
                ...
              </span>
            )}
          </>
        )}

        {/* Page numbers - show fewer on mobile */}
        {pageNumbers
          .filter((page) => {
            // On mobile, only show current page and adjacent pages
            if (typeof window !== 'undefined' && window.innerWidth < 640) {
              return Math.abs(page - currentPage) <= 1;
            }
            return true;
          })
          .map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPageChange(page)}
              className="h-8 min-w-8 sm:h-10 sm:min-w-10 text-xs sm:text-sm"
            >
              {page}
            </Button>
          ))}

        {/* Desktop: Show last page + ellipsis */}
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <span key="ellipsis-end" className="hidden sm:inline text-muted-foreground px-1">
                ...
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(totalPages)}
              className="hidden sm:inline-flex min-w-10"
            >
              {totalPages}
            </Button>
          </>
        )}

        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
          className="h-8 w-8 sm:h-10 sm:w-10"
        >
          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>

        {/* Last page button - always show */}
        {showFirstLast && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            aria-label="Last page"
            className="h-8 w-8 sm:h-10 sm:w-10"
          >
            <ChevronsRight className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
