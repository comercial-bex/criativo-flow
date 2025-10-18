# Log de Migração - Unificação de Pessoas

## ✅ Fase 1 - Estrutura de Dados (COMPLETA)

### Database
- ✅ Criada tabela `pessoas` com todos os campos unificados
- ✅ Criada tabela `pessoa_papeis` (enum) 
- ✅ Migração de dados de `profiles` (34 registros)
- ✅ Migração de dados de `rh_colaboradores` (4 registros)
- ✅ RLS policies aplicadas
- ✅ Funções auxiliares criadas:
  - `normalizar_cpf()`
  - `adicionar_papel_pessoa()`
  - `remover_papel_pessoa()`

### Hooks
- ✅ `usePessoas.ts` - Hook principal para CRUD de pessoas
- ✅ `useProfileData.ts` - Atualizado para usar `pessoas`
- ✅ `useEspecialistas.ts` - Atualizado para usar `pessoas`
- ✅ `usePessoasCompat.ts` - Hook de compatibilidade para migração gradual

### Componentes
- ✅ `ColaboradorQuickCreate.tsx` - Atualizado
- ✅ `ColaboradorForm.tsx` - Atualizado
- ✅ `PessoasManager.tsx` - Usando nova estrutura
- ✅ `ProfileCard.tsx` - Simplificado (removido campo especialidade)

## 🔄 Fase 2 - Migração Gradual (EM ANDAMENTO)

### Próximos Passos
1. Identificar e atualizar componentes que usam `.from('profiles')`
2. Migrar componentes críticos primeiro:
   - ✅ UserProfileSection.tsx
   - 🔄 useAuth.tsx (verificar integração)
   - 🔄 useAccessControl.ts
   - ⏳ Componentes de Admin
   - ⏳ Componentes de RH
   - ⏳ Outros componentes

### Componentes com `.from('profiles')` (66 ocorrências em 49 arquivos)
- Admin/NewUserModal.tsx
- AudiovisualScheduleModal.tsx
- Auth/LoginDiagnostic.tsx
- CriarProjetoAvulsoModal.tsx
- EspecialistasSelector.tsx
- NewEventModal.tsx
- PlanoEditorial.tsx
- PostsContentView.tsx
- ProjetoEspecialistas.tsx
- SecurityTestPanel.tsx
- SimplifiedAdminControls.tsx
- SmartRedirect.tsx
- TarefasKanban.tsx
- TaskActivities.tsx
- TaskParticipants.tsx
- TeamChat/MentionAutocomplete.tsx
- TeamChat/NewThreadDialog.tsx
- VisaoGeral.tsx
- hooks/useAIContext.ts
- hooks/useAdminPendencies.ts
- hooks/useAuth.tsx
- hooks/useClientDashboard.ts
- hooks/useEspecialistaData.ts
- hooks/useEspecialistasGRS.ts
- hooks/useModalPreload.ts
- hooks/useRealtimeNotifications.ts
- hooks/useSignUpWithValidation.ts
- hooks/useTeamChat.ts
- hooks/useTypingIndicator.ts
- hooks/useUniversalSearch.ts
- E outros...

## 🎯 Fase 3 - Limpeza (PENDENTE)
- ⏳ Remover tabela `profiles` (após 100% migração)
- ⏳ Remover tabela `rh_colaboradores` (após 100% migração)
- ⏳ Remover hook `usePessoasCompat.ts`
- ⏳ Atualizar documentação

## 📊 Métricas de Progresso
- Estrutura de dados: 100%
- Hooks principais: 90%
- Componentes: 15%
- Migração total: ~35%

## ⚠️ Avisos de Segurança
- ✅ RLS policies configuradas
- ✅ Validação de CPF implementada
- ⚠️ Security warnings não-críticos existentes (Function Search Path, Extension in Public)

## 📝 Notas
- Tabela `profiles` ainda existe e será mantida temporariamente para compatibilidade
- Novos registros devem ser criados em `pessoas`
- Hook de compatibilidade `usePessoasCompat` disponível para facilitar migração
