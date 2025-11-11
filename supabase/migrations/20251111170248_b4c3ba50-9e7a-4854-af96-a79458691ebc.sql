-- Sincronizar preços corretos da tabela assinaturas para produtos
UPDATE produtos p
SET 
  preco_padrao = a.preco,
  posts_mensais = a.posts_mensais,
  reels_suporte = a.reels_suporte,
  anuncios_facebook = a.anuncios_facebook,
  anuncios_google = a.anuncios_google,
  updated_at = NOW()
FROM assinaturas a
WHERE p.id = a.id 
  AND p.tipo = 'plano_assinatura';