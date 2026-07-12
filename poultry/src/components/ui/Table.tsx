import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Search, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';

interface Column<T> {
  header: string;
  accessorKey?: keyof T | string;
  sortable?: boolean;
  cell?: (row: T) => React.ReactNode;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  enableSearch?: boolean;
  searchKeys?: (keyof T)[];
  onRowClick?: (row: T) => void;
  actions?: React.ReactNode;
  filters?: React.ReactNode;
  pageSize?: number;
}

export function Table<T extends Record<string, any>>({
  data,
  columns,
  searchPlaceholder = 'Search records...',
  enableSearch = true,
  searchKeys = [],
  onRowClick,
  actions,
  filters,
  pageSize = 10,
}: TableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter Data
  const filteredData = useMemo(() => {
    if (!searchTerm || !searchKeys.length) return data;
    return data.filter(item => {
      return searchKeys.some(key => {
        const val = item[key as string];
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(searchTerm.toLowerCase());
      });
    });
  }, [data, searchTerm, searchKeys]);

  // Sort Data
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    const sorted = [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      
      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      const strA = String(aVal).toLowerCase();
      const strB = String(bVal).toLowerCase();
      return sortOrder === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });
    return sorted;
  }, [filteredData, sortKey, sortOrder]);

  // Paginate Data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortOrder === 'asc') {
        setSortOrder('desc');
      } else {
        setSortKey(null);
      }
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const renderCellValue = (row: T, col: Column<T>) => {
    if (col.cell) {
      return col.cell(row);
    }
    if (col.accessorKey) {
      return String(row[col.accessorKey as string] ?? '');
    }
    return '';
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Search & Actions Bar */}
      {(enableSearch || actions || filters) && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {enableSearch && (
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search size={18} />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={e => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder={searchPlaceholder}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all dark:text-slate-100"
              />
            </div>
          )}
          <div className="flex flex-wrap items-center gap-3">
            {filters}
            {actions}
          </div>
        </div>
      )}

      {/* Table Content */}
      <div className="w-full overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-xs">
        <table className="w-full border-collapse text-left text-sm text-slate-600 dark:text-slate-350">
          <thead className="bg-slate-50 dark:bg-slate-850/50 text-slate-700 dark:text-slate-200 border-b border-slate-100 dark:border-slate-850">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className="px-6 py-4.5 font-semibold select-none"
                >
                  {col.sortable && col.accessorKey ? (
                    <button
                      onClick={() => handleSort(col.accessorKey as string)}
                      className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors focus:outline-none cursor-pointer"
                    >
                      {col.header}
                      {sortKey === col.accessorKey ? (
                        sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                      ) : (
                        <div className="opacity-30 group-hover:opacity-100">
                          <ChevronUp size={10} className="mb-0.5" />
                          <ChevronDown size={10} className="-mt-0.5" />
                        </div>
                      )}
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`transition-colors duration-150 ${
                    onRowClick 
                      ? 'hover:bg-slate-50/70 dark:hover:bg-slate-850/30 cursor-pointer' 
                      : 'hover:bg-slate-50/30 dark:hover:bg-slate-850/10'
                  }`}
                >
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className="px-6 py-4 dark:border-slate-800">
                      {renderCellValue(row, col)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Inbox size={40} className="text-slate-350 dark:text-slate-600 animate-pulse" />
                    <p className="text-slate-505 dark:text-slate-500 font-medium">No records found</p>
                    <p className="text-xs text-slate-400">Try adjusting your filters or search term</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-2 px-1">
          <p className="text-xs text-slate-500">
            Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{(currentPage - 1) * pageSize + 1}</span> to{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {Math.min(currentPage * pageSize, sortedData.length)}
            </span>{' '}
            of <span className="font-semibold text-slate-700 dark:text-slate-300">{sortedData.length}</span> records
          </p>
          
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-850 disabled:opacity-40 disabled:pointer-events-none hover:text-slate-900 transition cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .map((page, idx, arr) => {
                const prev = arr[idx - 1];
                const showEllipsis = prev && page - prev > 1;
                
                return (
                  <React.Fragment key={page}>
                    {showEllipsis && <span className="text-slate-400 text-sm px-1">...</span>}
                    <button
                      onClick={() => handlePageChange(page)}
                      className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        currentPage === page
                          ? 'bg-emerald-600 text-white'
                          : 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-850'
                      }`}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                );
              })}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-850 disabled:opacity-40 disabled:pointer-events-none hover:text-slate-900 transition cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
