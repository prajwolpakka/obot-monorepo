import { debounce } from "lodash";
import { Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface Props {
  onSearch: (query: string) => void;
  debounceDelay?: number;
}

const TableSearch = ({ onSearch, debounceDelay = 500 }: Props) => {
  const [query, setQuery] = useState("");

  const debouncedSearch = useCallback(
    debounce((query: string) => onSearch(query), debounceDelay),
    [onSearch, debounceDelay]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    debouncedSearch(newQuery);
  };

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  return (
    <div className="flex items-center w-full max-w-[300px] rounded-lg border bg-background text-foreground px-3">
      <Search className="h-5 w-5 text-muted-foreground" />
      <input
        type="text"
        placeholder={"Search"}
        className="flex-1 border-0 bg-transparent py-2 pl-2 text-sm focus:outline-none focus:ring-0"
        value={query}
        onChange={handleChange}
      />
    </div>
  );
};

export default TableSearch;
