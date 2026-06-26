import { BiErrorCircle } from 'react-icons/bi';

export default function ErrorAlert({ message, onRetry }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
      <div className="flex items-start gap-3">
        <BiErrorCircle className="text-red-500 text-xl mt-0.5 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-red-800">Failed to load products.</p>
          <p className="text-sm text-red-600 mt-1">{message}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-3 py-1.5 text-sm font-medium rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}