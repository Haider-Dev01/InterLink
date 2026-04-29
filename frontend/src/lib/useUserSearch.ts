import { useEffect, useState } from 'react';

import { searchService } from '../services/searchService';

type SearchResult = {
  id: string;
  label: string;
  subtitle: string;
  to: string;
  image?: string | null;
};

function buildUserLabel(user: any) {
  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
  return fullName || user.email || 'Utilisateur';
}

export function useUserSearch() {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedQuery(searchInput.trim());
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    let active = true;

    if (!debouncedQuery) {
      setSearchResults([]);
      setIsSearching(false);
      return () => {
        active = false;
      };
    }

    setIsSearching(true);

    searchService
      .searchUsers(debouncedQuery)
      .then((res) => {
        if (!active) {
          return;
        }

        const users = (res.data?.users ?? []).map((user: any) => ({
          id: user.id,
          label: buildUserLabel(user),
          subtitle: `${user.role} · ${user.email || 'Email non renseigne'}`,
          to: `/profile/${user.id}`,
          image: user.profileImage,
        }));

        setSearchResults(users.slice(0, 8));
      })
      .catch((error) => {
        if (!active) {
          return;
        }

        console.error('Search failed', error);
        setSearchResults([]);
      })
      .finally(() => {
        if (active) {
          setIsSearching(false);
        }
      });

    return () => {
      active = false;
    };
  }, [debouncedQuery]);

  return {
    isSearching,
    searchInput,
    searchResults,
    setSearchInput,
    clearSearch: () => {
      setSearchInput('');
      setDebouncedQuery('');
      setSearchResults([]);
      setIsSearching(false);
    },
  };
}
