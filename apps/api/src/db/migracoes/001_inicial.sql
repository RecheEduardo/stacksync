-- Esquema inicial (Parte 4, seção 11), recortado ao escopo do PRODUCT.md v1.
-- Três escolhas de mão única (11): tudo pertence a uma organização, respostas têm histórico só por
-- acréscimo e vereditos são imutáveis.

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'stacksync_app') THEN
    CREATE ROLE stacksync_app NOLOGIN;
  END IF;
END $$;

DO $$ BEGIN
  EXECUTE format('GRANT stacksync_app TO %I', current_user);
EXCEPTION WHEN others THEN NULL;
END $$;

-- ------------------------------------------------------------------ identidade (sem RLS)
-- Espaço anônimo por navegador: a organização nasce com a sessão (PRODUCT.md não inclui login).
CREATE TABLE organizacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  criada_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE sessoes (
  token_hash text PRIMARY KEY,
  org_id uuid NOT NULL REFERENCES organizacoes (id) ON DELETE CASCADE,
  criada_em timestamptz NOT NULL DEFAULT now(),
  vista_em timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX sessoes_org ON sessoes (org_id);

-- ------------------------------------------------------------------ IA do usuário
CREATE TABLE credenciais_ia (
  org_id uuid PRIMARY KEY REFERENCES organizacoes (id) ON DELETE CASCADE,
  provedor text NOT NULL,
  modelo text NOT NULL,
  endpoint text,
  -- Cifrada com AES-256-GCM; nula quando a chave vale só para a sessão (fica em memória).
  chave_cifrada text,
  ultimos4 text,
  so_sessao boolean NOT NULL DEFAULT false,
  testada_em timestamptz,
  atualizada_em timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------ análises e respostas
CREATE TABLE analises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES organizacoes (id) ON DELETE CASCADE,
  nome text NOT NULL,
  subnivel text NOT NULL,
  profundidade text NOT NULL,
  ideia text,
  -- Proposta da IA para a ideia prévia e a decisão do usuário (RN-79).
  ideia_proposta jsonb,
  ideia_movimentos jsonb,
  ideia_decisao text,
  versao_conteudo text NOT NULL,
  arquivada boolean NOT NULL DEFAULT false,
  primeiro_veredito_em timestamptz,
  criada_em timestamptz NOT NULL DEFAULT now(),
  atualizada_em timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX analises_org ON analises (org_id, atualizada_em DESC);

CREATE TABLE respostas (
  analise_id uuid NOT NULL REFERENCES analises (id) ON DELETE CASCADE,
  org_id uuid NOT NULL,
  pergunta text NOT NULL,
  valor jsonb,
  origem text NOT NULL,
  faixa_opcoes jsonb,
  faixa_sinal jsonb,
  fonte text,
  medida_em text,
  texto_livre text,
  meio text NOT NULL,
  versao int NOT NULL DEFAULT 1,
  atualizada_em timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (analise_id, pergunta)
);

-- Só por acréscimo; gravado na mesma transação da resposta (11.3).
CREATE TABLE eventos_resposta (
  id bigserial PRIMARY KEY,
  org_id uuid NOT NULL,
  analise_id uuid NOT NULL REFERENCES analises (id) ON DELETE CASCADE,
  pergunta text NOT NULL,
  antes jsonb,
  depois jsonb,
  apos_veredito boolean NOT NULL,
  criado_em timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX eventos_resposta_analise ON eventos_resposta (analise_id, id);

-- Percurso adaptativo (RG-12): a pergunta escolhida, as elegíveis e a ordem padrão, para comparar.
CREATE TABLE percursos (
  id bigserial PRIMARY KEY,
  org_id uuid NOT NULL,
  analise_id uuid NOT NULL REFERENCES analises (id) ON DELETE CASCADE,
  hash_estado text NOT NULL,
  pergunta text NOT NULL,
  origem text NOT NULL,
  ordem_padrao text,
  elegiveis jsonb NOT NULL,
  perfil text,
  motivo text,
  falha text,
  versao_estrutura text NOT NULL,
  criado_em timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX percursos_analise ON percursos (analise_id, hash_estado, id DESC);

-- Respostas sugeridas exibidas (RG-13) e o que foi escolhido: alimenta a métrica de ancoragem.
CREATE TABLE sugestoes_resposta (
  analise_id uuid NOT NULL REFERENCES analises (id) ON DELETE CASCADE,
  org_id uuid NOT NULL,
  pergunta text NOT NULL,
  opcoes jsonb NOT NULL,
  origem text NOT NULL,
  falha text,
  escolha text,
  criado_em timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (analise_id, pergunta)
);

-- Texto livre interpretado pela IA (RG-01): só vale depois de confirmado (RN-79).
CREATE TABLE interpretacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  analise_id uuid NOT NULL REFERENCES analises (id) ON DELETE CASCADE,
  pergunta text NOT NULL,
  modo text NOT NULL,
  texto text NOT NULL,
  proposta jsonb,
  status text NOT NULL DEFAULT 'proposta',
  falha text,
  provedor text,
  modelo text,
  versao_prompt text,
  criada_em timestamptz NOT NULL DEFAULT now(),
  decidida_em timestamptz
);
CREATE INDEX interpretacoes_analise ON interpretacoes (analise_id, criada_em DESC);

-- ------------------------------------------------------------------ resultado
CREATE TABLE vereditos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  analise_id uuid NOT NULL REFERENCES analises (id) ON DELETE CASCADE,
  hash_entradas text NOT NULL,
  as_of text NOT NULL,
  versao_motor text NOT NULL,
  versao_conteudo text NOT NULL,
  versao_calibracao text NOT NULL,
  categoria text NOT NULL,
  indice_lo int NOT NULL,
  indice_hi int NOT NULL,
  confianca text NOT NULL,
  veredito_ideia text,
  variante_plano text NOT NULL,
  entrada jsonb NOT NULL,
  documento jsonb NOT NULL,
  criado_em timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX vereditos_analise ON vereditos (analise_id, criado_em DESC);

CREATE FUNCTION vereditos_imutaveis() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  -- Só o expurgo (exclusão pedida pelo titular) apaga vereditos; ninguém os altera (RN-82).
  IF TG_OP = 'DELETE' AND current_setting('app.expurgo', true) = 'on' THEN
    RETURN OLD;
  END IF;
  RAISE EXCEPTION 'vereditos são imutáveis (RN-82)';
END $$;
CREATE TRIGGER vereditos_imutaveis BEFORE UPDATE OR DELETE ON vereditos
  FOR EACH ROW EXECUTE FUNCTION vereditos_imutaveis();

-- Raciocínio guiado (RG-10) e candidatas (RG-14): fora do hash do veredito; regenerar cria versão nova.
CREATE TABLE raciocinios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  veredito_id uuid NOT NULL REFERENCES vereditos (id) ON DELETE CASCADE,
  versao int NOT NULL,
  status text NOT NULL,
  provedor text,
  modelo text,
  versao_prompt text,
  hash_contexto text,
  blocos jsonb NOT NULL DEFAULT '[]',
  descartados jsonb NOT NULL DEFAULT '[]',
  sintese text,
  candidatas jsonb NOT NULL DEFAULT '[]',
  falha text,
  criado_em timestamptz NOT NULL DEFAULT now(),
  concluido_em timestamptz,
  UNIQUE (veredito_id, versao)
);

-- Metadados das chamadas à IA do usuário, sem conteúdo (DT-18): alimentam a tela de consumo.
CREATE TABLE chamadas_ia (
  id bigserial PRIMARY KEY,
  org_id uuid NOT NULL,
  analise_id uuid,
  etapa text NOT NULL,
  provedor text NOT NULL,
  modelo text NOT NULL,
  tokens_entrada int NOT NULL DEFAULT 0,
  tokens_saida int NOT NULL DEFAULT 0,
  latencia_ms int NOT NULL,
  resultado text NOT NULL,
  criado_em timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX chamadas_ia_org ON chamadas_ia (org_id, criado_em DESC);

CREATE TABLE links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  veredito_id uuid NOT NULL REFERENCES vereditos (id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expira_em timestamptz NOT NULL,
  revogado_em timestamptz,
  acessos int NOT NULL DEFAULT 0,
  criado_em timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX links_veredito ON links (veredito_id);

-- Fila de curadoria da base de tecnologias (DT-31): sem org_id e sem dado de análise.
CREATE TABLE candidatas_tecnologia (
  nome_normalizado text PRIMARY KEY,
  nome text NOT NULL,
  decisoes jsonb NOT NULL DEFAULT '[]',
  ocorrencias int NOT NULL DEFAULT 1,
  primeira_em timestamptz NOT NULL DEFAULT now(),
  ultima_em timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------ isolamento por organização
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['credenciais_ia', 'analises', 'respostas', 'eventos_resposta', 'percursos',
    'sugestoes_resposta', 'interpretacoes', 'vereditos', 'raciocinios', 'chamadas_ia'] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    -- Sem o contexto, current_setting falha e o acesso falha fechado (11.6).
    EXECUTE format($p$CREATE POLICY por_organizacao ON %I
      USING (org_id = current_setting('app.org_id')::uuid)
      WITH CHECK (org_id = current_setting('app.org_id')::uuid)$p$, t);
  END LOOP;
END $$;

ALTER TABLE links ENABLE ROW LEVEL SECURITY;
ALTER TABLE links FORCE ROW LEVEL SECURITY;
-- O link de leitura é acessível pela organização dona ou por quem tem o token (e só o dele).
CREATE POLICY por_organizacao_ou_token ON links
  USING (org_id = nullif(current_setting('app.org_id', true), '')::uuid
         OR token_hash = nullif(current_setting('app.link_token', true), ''))
  WITH CHECK (org_id = nullif(current_setting('app.org_id', true), '')::uuid
         OR token_hash = nullif(current_setting('app.link_token', true), ''));

GRANT SELECT, INSERT, UPDATE, DELETE ON credenciais_ia TO stacksync_app;
GRANT SELECT, INSERT, UPDATE ON analises TO stacksync_app;
GRANT SELECT, INSERT, UPDATE ON respostas TO stacksync_app;
GRANT SELECT, INSERT ON eventos_resposta TO stacksync_app;
GRANT SELECT, INSERT ON percursos TO stacksync_app;
GRANT SELECT, INSERT, UPDATE ON sugestoes_resposta TO stacksync_app;
GRANT SELECT, INSERT, UPDATE ON interpretacoes TO stacksync_app;
GRANT SELECT, INSERT ON vereditos TO stacksync_app;
GRANT SELECT, INSERT, UPDATE ON raciocinios TO stacksync_app;
GRANT SELECT, INSERT ON chamadas_ia TO stacksync_app;
GRANT SELECT, INSERT, UPDATE ON links TO stacksync_app;
GRANT SELECT, INSERT, UPDATE ON candidatas_tecnologia TO stacksync_app;
GRANT USAGE ON SEQUENCE eventos_resposta_id_seq, percursos_id_seq, chamadas_ia_id_seq TO stacksync_app;
