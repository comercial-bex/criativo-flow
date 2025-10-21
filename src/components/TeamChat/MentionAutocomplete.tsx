import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { BexAvatar, BexAvatarFallback, BexAvatarImage } from '@/components/ui/bex-avatar';

interface User {
  id: string;
  nome: string;
  avatar_url?: string;
  especialidade?: string;
}

interface MentionAutocompleteProps {
  query: string;
  onSelect: (user: User) => void;
}

export function MentionAutocomplete({ query, onSelect }: MentionAutocompleteProps) {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const searchUsers = async () => {
      if (!query) {
        setUsers([]);
        return;
      }

      const { data, error } = await supabase
        .from('pessoas')
        .select('id, nome, avatar_url')
        .ilike('nome', `%${query}%`)
        .limit(5);

      if (!error && data) {
        setUsers(data);
      }
    };

    searchUsers();
  }, [query]);

  if (users.length === 0) return null;

  return (
    <div className="absolute bottom-full mb-2 w-full bg-popover border rounded-lg shadow-lg">
      <Command>
        <CommandList>
          <CommandGroup heading="Mencionar">
            {users.map((user) => (
              <CommandItem
                key={user.id}
                onSelect={() => onSelect(user)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <BexAvatar className="h-6 w-6">
                  <BexAvatarImage src={user.avatar_url} />
                  <BexAvatarFallback>
                    {user.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </BexAvatarFallback>
                </BexAvatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">{user.nome}</p>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
}
