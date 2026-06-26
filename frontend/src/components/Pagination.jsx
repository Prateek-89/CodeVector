import { BiChevronLeft, BiChevronRight } from 'react-icons/bi';

export default function Pagination({ currentPage, hasMore, onPrev, onNext, isFirstPage }) {
  return (
    <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-3">
      <p className="text-sm text-gray-600">
        Page <span className="font-semibold text-gray-900">{currentPage}</span>
      </p>

      <div className="flex gap-2">
        <button
          onClick={onPrev}
          disabled={isFirstPage}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <BiChevronLeft className="text-lg" />
          Previous
        </button>

        <button
          onClick={onNext}
          disabled={!hasMore}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
          <BiChevronRight className="text-lg" />
        </button>
      </div>
    </div>
  );
}