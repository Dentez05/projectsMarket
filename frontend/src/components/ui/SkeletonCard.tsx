export default function SkeletonCard() {
  return (
    <div className="bg-[#232a3b] rounded-2xl border border-[#2e3548] overflow-hidden">
      <div className="skeleton h-48 w-full" />
      <div className="p-5 space-y-3">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="flex gap-1.5 mt-2">
          <div className="skeleton h-5 w-12 rounded" />
          <div className="skeleton h-5 w-14 rounded" />
          <div className="skeleton h-5 w-10 rounded" />
        </div>
        <div className="flex justify-between items-center mt-4">
          <div className="skeleton h-5 w-20 rounded" />
          <div className="skeleton h-8 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  );
}