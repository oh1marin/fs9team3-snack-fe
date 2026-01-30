export default function AddProductBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 flex items-center gap-2 rounded-full bg-illustration-mint px-4 py-3 sm:px-6 sm:py-4 text-md-sb sm:text-lg-sb text-white shadow-lg transition-transform hover:scale-105"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 20 20"
        fill="none"
        className="sm:w-5 sm:h-5"
      >
        <path
          d="M10 4V16M4 10H16"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <span className="hidden sm:inline">상품 등록</span>
      <span className="sm:hidden">등록</span>
    </button>
  );
}
