import { BiTime } from 'react-icons/bi';

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function truncateId(id) {
  return id.substring(0, 8) + '...';
}

export default function ProductTable({ products }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="sticky top-0 bg-gray-50 text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">
                ID
              </th>
              <th className="sticky top-0 bg-gray-50 text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">
                Name
              </th>
              <th className="sticky top-0 bg-gray-50 text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">
                Category
              </th>
              <th className="sticky top-0 bg-gray-50 text-right px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">
                Price
              </th>
              <th className="sticky top-0 bg-gray-50 text-right px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">
                <span className="inline-flex items-center gap-1">
                  <BiTime className="text-blue-500" />
                  Updated
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((product, index) => (
              <tr
                key={product.id}
                className={`${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                } hover:bg-blue-50/50 transition-colors`}
              >
                <td className="px-4 py-3 font-mono text-xs text-gray-500" title={product.id}>
                  {truncateId(product.id)}
                </td>
                <td className="px-4 py-3 font-medium text-gray-900 max-w-[250px] truncate">
                  {product.name}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {product.category}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-mono font-medium text-gray-900">
                  ${parseFloat(product.price).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right text-gray-500 text-xs whitespace-nowrap">
                  {formatDate(product.updatedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}