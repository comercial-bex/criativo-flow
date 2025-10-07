import { Search } from "lucide-react";
import { Input } from "./input";
import { useDebounce } from "@/hooks/use-debounce";
import { useState, useEffect } from "react";

interface SearchInputProps {
  onSearch: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({ onSearch, placeholder = "Buscar...", className }: SearchInputProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    onSearch(debouncedSearch);
  }, [debouncedSearch, onSearch]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={`pl-9 ${className}`}
      />
    </div>
  );
}
