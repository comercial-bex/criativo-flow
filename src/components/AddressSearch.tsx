import { useState, useEffect } from "react";
import { MapPin, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AddressSuggestion {
  place_id: string;
  description: string;
  main_text: string;
  secondary_text: string;
}

interface AddressSearchProps {
  onAddressSelect: (address: string, coordinates?: { lat: number; lng: number }) => void;
  value: string;
  placeholder?: string;
  className?: string;
}

export function AddressSearch({ onAddressSelect, value, placeholder = "Digite o endereço...", className }: AddressSearchProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  // Update input value when prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Simulate address search with common Brazilian addresses for demo
  const searchAddresses = async (query: string) => {
    if (!query.trim() || query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      const mockSuggestions: AddressSuggestion[] = [
        {
          place_id: "1",
          description: `${query} - Centro, São Paulo - SP, Brasil`,
          main_text: `${query} - Centro`,
          secondary_text: "São Paulo - SP, Brasil"
        },
        {
          place_id: "2", 
          description: `${query} - Copacabana, Rio de Janeiro - RJ, Brasil`,
          main_text: `${query} - Copacabana`,
          secondary_text: "Rio de Janeiro - RJ, Brasil"
        },
        {
          place_id: "3",
          description: `${query} - Savassi, Belo Horizonte - MG, Brasil`,
          main_text: `${query} - Savassi`,
          secondary_text: "Belo Horizonte - MG, Brasil"
        },
        {
          place_id: "4",
          description: `${query} - Boa Viagem, Recife - PE, Brasil`,
          main_text: `${query} - Boa Viagem`,
          secondary_text: "Recife - PE, Brasil"
        },
        {
          place_id: "5",
          description: `${query} - Centro, Macapá - AP, Brasil`,
          main_text: `${query} - Centro`,
          secondary_text: "Macapá - AP, Brasil"
        }
      ];
      
      setSuggestions(mockSuggestions);
      setIsLoading(false);
    }, 500);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setShowSuggestions(true);
    
    // Debounce the search
    const timeoutId = setTimeout(() => {
      searchAddresses(newValue);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const handleSuggestionClick = (suggestion: AddressSuggestion) => {
    setInputValue(suggestion.description);
    setShowSuggestions(false);
    setSuggestions([]);

    // Generate mock coordinates based on city
    let coordinates: { lat: number; lng: number } | undefined;
    if (suggestion.secondary_text.includes("São Paulo")) {
      coordinates = { lat: -23.5505, lng: -46.6333 };
    } else if (suggestion.secondary_text.includes("Rio de Janeiro")) {
      coordinates = { lat: -22.9068, lng: -43.1729 };
    } else if (suggestion.secondary_text.includes("Belo Horizonte")) {
      coordinates = { lat: -19.9191, lng: -43.9386 };
    } else if (suggestion.secondary_text.includes("Recife")) {
      coordinates = { lat: -8.0476, lng: -34.8770 };
    } else if (suggestion.secondary_text.includes("Macapá")) {
      coordinates = { lat: 0.0348, lng: -51.0694 };
    }

    onAddressSelect(suggestion.description, coordinates);
  };

  const handleManualInput = () => {
    // Allow manual input without suggestions
    onAddressSelect(inputValue);
    setShowSuggestions(false);
  };

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => {
            // Delay hiding suggestions to allow clicking
            setTimeout(() => setShowSuggestions(false), 200);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleManualInput();
            }
          }}
          placeholder={placeholder}
          className="pl-10"
        />
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (suggestions.length > 0 || isLoading) && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-80 overflow-y-auto">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-3 text-center text-sm text-muted-foreground">
                <div className="animate-pulse flex items-center justify-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Buscando endereços...</span>
                </div>
              </div>
            ) : (
              <>
                {suggestions.map((suggestion) => (
                  <div
                    key={suggestion.place_id}
                    className="flex items-start space-x-3 p-3 hover:bg-muted cursor-pointer transition-colors border-b last:border-b-0"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <MapPin className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {suggestion.main_text}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {suggestion.secondary_text}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Manual input option */}
                <div
                  className="flex items-center space-x-3 p-3 hover:bg-muted cursor-pointer transition-colors bg-muted/30"
                  onClick={handleManualInput}
                >
                  <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">
                      Usar: "{inputValue}"
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Pressione Enter ou clique para usar este endereço
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* No results message */}
      {showSuggestions && !isLoading && suggestions.length === 0 && inputValue.trim() && inputValue.length >= 3 && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50">
          <CardContent className="p-3 text-center text-sm text-muted-foreground">
            <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <div>Nenhuma sugestão encontrada</div>
            <div className="text-xs mt-1">Pressione Enter para usar "{inputValue}" mesmo assim</div>
          </CardContent>
        </Card>
      )}

      {/* Helper text */}
      {showSuggestions && inputValue.length > 0 && inputValue.length < 3 && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50">
          <CardContent className="p-3 text-center text-xs text-muted-foreground">
            Digite pelo menos 3 caracteres para ver sugestões
          </CardContent>
        </Card>
      )}
    </div>
  );
}