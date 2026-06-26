import { useState, useEffect, useCallback } from 'react';
import { fetchProducts, fetchCategories } from './api';
import Header from './components/Header';
import Filters from './components/Filters';
import ProductTable from './components/ProductTable';
import Pagination from './components/Pagination';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorAlert from './components/ErrorAlert';
import EmptyState from './components/EmptyState';

const CATEGORIES = [
  'All',
  'Electronics',
  'Clothing',
  'Home & Kitchen',
  'Books',
  'Sports & Outdoors',
  'Toys & Games',
  'Automotive',
  'Health & Beauty',
  'Office Supplies',
  'Groceries',
];

const LIMIT_OPTIONS = [10, 20, 50, 100];

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('');
  const [limit, setLimit] = useState(20);
  const [cursor, setCursor] = useState(null);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [availableCategories, setAvailableCategories] = useState(CATEGORIES);

  const loadProducts = useCallback(async (opts = {}) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchProducts({
        category: opts.category ?? category,
        limit: opts.limit ?? limit,
        cursor: opts.cursor ?? null,
      });
      setProducts(result.data);
      setNextCursor(result.pagination.nextCursor);
      setHasMore(result.pagination.hasMore);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load products.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [category, limit]);

  // Load categories on mount
  useEffect(() => {
    fetchCategories()
      .then((cats) => {
        if (cats && cats.length > 0) {
          setAvailableCategories(['All', ...cats]);
        }
      })
      .catch(() => {});
  }, []);

  // Load products on mount and when filters change
  useEffect(() => {
    setCursor(null);
    setCurrentPage(1);
    loadProducts({ category, limit, cursor: null });
  }, [category, limit]);

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory === 'All' ? '' : newCategory);
  };

  const handleLimitChange = (newLimit) => {
    setLimit(Number(newLimit));
  };

  const handleNextPage = () => {
    if (!hasMore) return;
    setCursor(nextCursor);
    setCurrentPage((p) => p + 1);
    loadProducts({ category, limit, cursor: nextCursor });
  };

  const handlePrevPage = () => {
    // We can't go back with cursor pagination without storing history
    // Reset to first page
    setCursor(null);
    setCurrentPage(1);
    loadProducts({ category, limit, cursor: null });
  };

  const handleRetry = () => {
    loadProducts({ category, limit, cursor });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Header />

        <Filters
          categories={availableCategories}
          selectedCategory={category || 'All'}
          onCategoryChange={handleCategoryChange}
          limitOptions={LIMIT_OPTIONS}
          selectedLimit={limit}
          onLimitChange={handleLimitChange}
        />

        {loading && <LoadingSpinner />}

        {!loading && error && <ErrorAlert message={error} onRetry={handleRetry} />}

        {!loading && !error && products.length === 0 && <EmptyState />}

        {!loading && !error && products.length > 0 && (
          <>
            <ProductTable products={products} />
            <Pagination
              currentPage={currentPage}
              hasMore={hasMore}
              onPrev={handlePrevPage}
              onNext={handleNextPage}
              isFirstPage={currentPage === 1}
            />
          </>
        )}
      </div>
    </div>
  );
}