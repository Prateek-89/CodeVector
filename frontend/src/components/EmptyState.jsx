import { BiPackage } from 'react-icons/bi';

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <BiPackage className="text-5xl mb-3" />
      <p className="text-lg font-medium text-gray-500">No products found.</p>
      <p className="text-sm text-gray-400 mt-1">Try adjusting your filters.</p>
    </div>
  );
}