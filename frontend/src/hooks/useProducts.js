import { useEffect, useState, useCallback } from 'react';
import productService from '../api/productService';

/**
 * Fetches the product list for the given query params and re-fetches
 * whenever they change. Returns loading/error state alongside pagination
 * metadata so ProductList can render skeletons, empty and error states.
 */
const useProducts = (params) => {
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => setReloadToken((t) => t + 1), []);

  useEffect(() => {
    let ignore = false;
    setIsLoading(true);
    setError(null);

    productService
      .getProducts(params)
      .then((res) => {
        if (ignore) return;
        setProducts(res.data.data);
        setMeta(res.data.meta);
      })
      .catch((err) => {
        if (ignore) return;
        setError(err?.message || 'Failed to load products');
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(params), reloadToken]);

  return { products, meta, isLoading, error, reload };
};

export default useProducts;
