import React from 'react';

// Base Skeleton component with shimmer animation
const Skeleton = ({ className = '', ...props }: { className?: string; [key: string]: any }) => {
    return (
        <div
            className={`animate-pulse bg-gray-200 dark:bg-dark-700 rounded ${className}`}
            {...props}
        />
    );
};

// Card skeleton for recipe/ingredient cards
export const CardSkeleton = () => (
    <div className="card p-4 space-y-4">
        {/* Header with icon */}
        <div className="flex items-start gap-3">
            <Skeleton className="w-12 h-12 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </div>
        </div>
        
        {/* Stats row */}
        <div className="flex justify-between gap-4">
            <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-6 w-24" />
            </div>
            <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-6 w-24" />
            </div>
        </div>
        
        {/* Divider */}
        <Skeleton className="h-px w-full" />
        
        {/* Description */}
        <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
        </div>
        
        {/* Buttons */}
        <div className="flex gap-2">
            <Skeleton className="h-10 flex-1 rounded-lg" />
            <Skeleton className="h-10 w-14 rounded-lg" />
        </div>
    </div>
);

// Simple card skeleton for smaller cards
export const SimpleCardSkeleton = () => (
    <div className="card p-4 space-y-3">
        <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </div>
        </div>
        <div className="flex gap-2">
            <Skeleton className="h-8 flex-1 rounded-lg" />
            <Skeleton className="h-8 w-12 rounded-lg" />
        </div>
    </div>
);

// Table row skeleton
export const TableRowSkeleton = ({ columns = 5 }: { columns?: number }) => (
    <tr className="border-b border-gray-200 dark:border-dark-700">
        {Array.from({ length: columns }).map((_, i) => (
            <td key={i} className="px-4 py-3">
                <Skeleton className={`h-4 ${i === 0 ? 'w-32' : i === columns - 1 ? 'w-16' : 'w-24'}`} />
            </td>
        ))}
    </tr>
);

// Table skeleton
export const TableSkeleton = ({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) => (
    <div className="card overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-gray-50 dark:bg-dark-700/50">
                    <tr>
                        {Array.from({ length: columns }).map((_, i) => (
                            <th key={i} className="px-4 py-3 text-left">
                                <Skeleton className="h-4 w-20" />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: rows }).map((_, i) => (
                        <TableRowSkeleton key={i} columns={columns} />
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

// Page header skeleton
export const PageHeaderSkeleton = () => (
    <div className="space-y-2 mb-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-5 w-80" />
    </div>
);

// Actions bar skeleton (search + buttons)
export const ActionsBarSkeleton = () => (
    <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between mb-6">
        <Skeleton className="h-11 w-full max-w-md rounded-lg" />
        <div className="flex gap-2">
            <Skeleton className="h-11 w-32 rounded-lg" />
            <Skeleton className="h-11 w-11 rounded-lg" />
        </div>
    </div>
);

// Grid of card skeletons
export const CardGridSkeleton = ({ count = 6 }: { count?: number }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: count }).map((_, i) => (
            <CardSkeleton key={i} />
        ))}
    </div>
);

// Full page skeleton for data pages
export const PageSkeleton = ({ type = 'cards' }: { type?: 'cards' | 'table' }) => (
    <div className="space-y-6">
        <PageHeaderSkeleton />
        <ActionsBarSkeleton />
        {type === 'cards' ? <CardGridSkeleton count={6} /> : <TableSkeleton rows={8} columns={6} />}
    </div>
);

// Dashboard stat card skeleton
export const StatCardSkeleton = () => (
    <div className="card p-5 space-y-3">
        <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="w-10 h-10 rounded-lg" />
        </div>
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-4 w-32" />
    </div>
);

// Dashboard skeleton
export const DashboardSkeleton = () => (
    <div className="space-y-6">
        <PageHeaderSkeleton />
        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <StatCardSkeleton key={i} />
            ))}
        </div>
        {/* Recent items */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6 space-y-4">
                <Skeleton className="h-6 w-40" />
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <div className="flex-1">
                            <Skeleton className="h-4 w-32" />
                        </div>
                        <Skeleton className="h-4 w-16" />
                    </div>
                ))}
            </div>
            <div className="card p-6 space-y-4">
                <Skeleton className="h-6 w-40" />
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <div className="flex-1">
                            <Skeleton className="h-4 w-32" />
                        </div>
                        <Skeleton className="h-4 w-16" />
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export default Skeleton;
