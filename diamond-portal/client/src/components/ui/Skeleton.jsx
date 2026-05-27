export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />;
}

export function BookingCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex justify-between mb-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="h-5 w-48 mb-2" />
      <Skeleton className="h-3 w-64 mb-1" />
      <Skeleton className="h-3 w-24" />
    </div>
  );
}

export default Skeleton;
