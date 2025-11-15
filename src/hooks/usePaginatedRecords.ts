/**
 * Custom hook for paginated attendance records
 * Handles large datasets efficiently
 */

import { useState, useMemo } from 'react';
import type { Attendance } from '@/types';

interface PaginationOptions {
  pageSize?: number;
  initialPage?: number;
}

export function usePaginatedRecords(records: Attendance[], options: PaginationOptions = {}) {
  const { pageSize = 20, initialPage = 1 } = options;
  const [currentPage, setCurrentPage] = useState(initialPage);

  // Calculate pagination
  const totalPages = Math.ceil(records.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  // Get current page records
  const paginatedRecords = useMemo(() => {
    return records.slice(startIndex, endIndex);
  }, [records, startIndex, endIndex]);

  // Navigation functions
  const goToPage = (page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
  };

  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);
  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);

  return {
    paginatedRecords,
    currentPage,
    totalPages,
    pageSize,
    totalRecords: records.length,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    goToPage,
    nextPage,
    prevPage,
    goToFirstPage,
    goToLastPage,
    startIndex: startIndex + 1,
    endIndex: Math.min(endIndex, records.length),
  };
}
