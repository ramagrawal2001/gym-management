import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { setSearchQuery } from '../store/slices/uiSlice';

export const useGlobalSearch = () => {
  const dispatch = useDispatch();
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const search = useCallback(async (query) => {
    if (!query || query.trim() === '') {
      setSearchResults([]);
      dispatch(setSearchQuery(''));
      return;
    }

    dispatch(setSearchQuery(query));
    setIsSearching(true);

    try {
      // This would typically call multiple API endpoints
      // For now, it's a placeholder that can be extended
      // You can add actual search logic here that searches across:
      // - Members
      // - Leads
      // - Classes
      // - Equipment
      // etc.

      // Placeholder - replace with actual search implementation
      setSearchResults([]);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [dispatch]);

  const clearSearch = useCallback(() => {
    setSearchResults([]);
    dispatch(setSearchQuery(''));
  }, [dispatch]);

  return {
    searchResults,
    isSearching,
    search,
    clearSearch
  };
};

