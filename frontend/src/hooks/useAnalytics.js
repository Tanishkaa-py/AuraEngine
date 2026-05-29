import { useState, useEffect } from "react";
import { fetchAnalytics, fetchCategories } from "../utils/api";

const useAnalytics = () => {
  const [analytics,   setAnalytics]   = useState(null);
  const [categories,  setCategories]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [{ data: analyticsRes }, { data: catRes }] = await Promise.all([
          fetchAnalytics(),
          fetchCategories(),
        ]);
        setAnalytics(analyticsRes.data);
        setCategories(catRes.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return { analytics, categories, loading, error };
};

export default useAnalytics;