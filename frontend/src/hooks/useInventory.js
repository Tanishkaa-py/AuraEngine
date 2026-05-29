import { useState, useEffect, useCallback } from "react";
import { fetchInventory } from "../utils/api";
import useDebounce from "./useDebounce";

const useInventory = () => {
  const [products,   setProducts]   = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState(null);

  const [page,     setPage]     = useState(1);
  const [limit]                 = useState(50);
  const [search,   setSearch]   = useState("");
  const [category, setCategory] = useState("all");
  const [sort,     setSort]     = useState("-lastUpdated");

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => { setPage(1); }, [debouncedSearch, category, sort]);

  const loadInventory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit, category, sort };
      if (debouncedSearch) params.search = debouncedSearch;

      const { data } = await fetchInventory(params);
      setProducts(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, category, sort]);

  useEffect(() => { loadInventory(); }, [loadInventory]);

  return {
    products, pagination, loading, error,
    page, setPage,
    search, setSearch,
    category, setCategory,
    sort, setSort,
    refresh: loadInventory,
  };
};

export default useInventory;