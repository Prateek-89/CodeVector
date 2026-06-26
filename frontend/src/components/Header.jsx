import { BiPackage } from 'react-icons/bi';

export default function Header() {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-1">
        <BiPackage className="text-blue-600 text-3xl" />
        <h1 className="text-2xl font-bold text-gray-900">Product Browser</h1>
      </div>
      <p className="text-gray-500 ml-[44px]">Browse and filter over 200,000 products</p>
    </div>
  );
}