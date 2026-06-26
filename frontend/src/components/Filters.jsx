import { BiFilterAlt, BiListUl } from 'react-icons/bi';

export default function Filters({
  categories,
  selectedCategory,
  onCategoryChange,
  limitOptions,
  selectedLimit,
  onLimitChange,
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
            <BiFilterAlt className="text-blue-500" />
            Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:w-48">
          <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
            <BiListUl className="text-blue-500" />
            Per page
          </label>
          <select
            value={selectedLimit}
            onChange={(e) => onLimitChange(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            {limitOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}