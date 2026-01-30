export default function SortButton({ sortOption, setShowSortDropdown, showSortDropdown }: { sortOption: string, setShowSortDropdown: (show: boolean) => void, showSortDropdown: boolean }) {
  return (
    <button
      onClick={() => setShowSortDropdown(!showSortDropdown)}
      className="flex items-center gap-2 rounded-lg border border-line-gray bg-white px-3 sm:px-4 py-2 text-sm sm:text-md-m text-black-400"
    >
      {sortOption}
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        className={`transition-transform ${showSortDropdown ? "rotate-180" : ""}`}
      >
        <path
          d="M2.5 4.5L6 8L9.5 4.5"
          stroke="#999"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}