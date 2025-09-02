import { debounce } from "lodash";
import { Search } from "lucide-react";
import { Input } from "@/common/components/ui/input";
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
    <div className="relative w-full max-w-[300px]">
      <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        aria-label="Search"
        placeholder="Search"
        value={query}
        onChange={handleChange}
        className="pl-9 h-9"
      />
    </div>
  );
};

export default TableSearch;
