# 🎨 Sistema de Cores BEX

## Verde BEX Adaptativo

### Tema Claro (☀️)
- **Primary:** `#4A5D23` - Verde militar (escuro)
- **Uso:** Botões principais, links, destaques
- **Contraste:** 7.2:1 (AAA) em fundo branco
- **Conceito:** Profissional e elegante

### Tema Escuro (🌙)
- **Primary:** `#54C43D` - Verde BEX neon
- **Card:** `#1E1E1E` - Cinza moderno
- **Uso:** Botões, badges, highlights
- **Contraste:** 8.1:1 (AAA) em fundo escuro
- **Conceito:** Moderno e vibrante

### Tema BEX Gamer (🎮)
- **Primary:** `#00FF41` - Matrix green NEON
- **Background:** `#000000` - Preto total
- **Uso:** Todos os elementos interativos
- **Efeitos:** Glow automático, blur em cards
- **Contraste:** Máximo em preto total
- **Conceito:** Cyberpunk futurista

## Badges por Tema

| Status | Light | Dark | Gaming |
|--------|-------|------|--------|
| Sucesso | Verde escuro (#166534) | Verde neon (#22c55e) | Verde neon + glow |
| Aviso | Amarelo escuro (#a16207) | Amarelo claro (#eab308) | Amarelo neon + glow |
| Erro | Vermelho médio (#dc2626) | Vermelho claro (#ef4444) | Vermelho neon + glow |
| Info | Azul escuro (#1e40af) | Azul claro (#3b82f6) | Ciano neon + glow |

## Efeitos Gaming

### Glow Effect
```css
--gaming-glow: 0 0 20px rgba(0, 255, 65, 0.5);
--gaming-glow-strong: 0 0 40px rgba(0, 255, 65, 0.8);
```

### Blur Effect
```css
--gaming-blur: blur(12px);
```

### Aplicação Automática
- Cards: `backdrop-filter` + `box-shadow`
- Hover: Intensificação do glow
- Borders: Neon com opacidade

## Acessibilidade

Todos os temas foram testados para WCAG AA/AAA:
- Light: Contraste mínimo 7:1
- Dark: Contraste mínimo 8:1
- Gaming: Contraste máximo com preto total
