import { useState } from "react";

/**
 * Custom hook for managing table filters with local and saved states.
 *
 * @param filterConfig - Configuration for the filters.
 *
 * @returns An object containing:
 *  - localFilters: The filter values the user has selected but not yet applied.
 *  - savedFilters: The filter values that have been applied by the user.
 *  - saveFilters: A function to save the selected filters as applied filters.
 *  - updateLocalFilter: A function to update a filter value temporarily (before applying it).
 *  - updateSavedFilter: A function to update a filter value and apply it to the saved filters.
 *  - clearFilters: A function to reset all filters to their initial values.
 *  - resetLocalFilters: A function to reset the selected filters to the last saved values.
 */

export const useTableFilters = <T extends Record<string, any>>(filterConfig: T) => {
  const [savedFilters, setSavedFilters] = useState<T>(filterConfig);
  const [localFilters, setLocalFilters] = useState<T>(filterConfig);

  const updateLocalFilter = <K extends keyof T>(key: K, value: T[K]) => {
    setLocalFilters((prevFilters) => ({ ...prevFilters, [key]: value }));
  };

  const updateSavedFilter = <K extends keyof T>(key: K, value: T[K]) => {
    setSavedFilters((prevFilters) => ({ ...prevFilters, [key]: value }));
    setLocalFilters((prevFilters) => ({ ...prevFilters, [key]: value }));
  };

  const clearFilters = () => {
    setLocalFilters(filterConfig);
  };

  const saveFilters = () => setSavedFilters(localFilters);
  const resetLocalFilters = () => setLocalFilters(savedFilters);

  return {
    localFilters,
    savedFilters,
    saveFilters,
    updateLocalFilter,
    updateSavedFilter,
    clearFilters,
    resetLocalFilters,
  };
};
