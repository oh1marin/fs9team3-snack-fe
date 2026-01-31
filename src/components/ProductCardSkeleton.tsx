export default function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl animate-pulse">
      {/* 이미지 영역 */}
      <div className="aspect-square w-full bg-gray-200" />

      {/* 텍스트 영역 - 실제 카드와 동일한 레이아웃 */}
      <div className="p-4 bg-background-peach space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="h-3 w-16 bg-gray-200 rounded" />
          <div className="h-5 w-14 rounded bg-gray-200" />
        </div>
        <div className="h-5 w-full max-w-[85%] bg-gray-200 rounded" />
        <div className="h-5 w-20 bg-gray-200 rounded" />
        <div className="h-3 w-24 bg-gray-200 rounded" />
      </div>
    </div>
  );
}
