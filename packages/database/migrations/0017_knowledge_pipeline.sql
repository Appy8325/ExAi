CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE kb_sources
  ADD COLUMN error_message text,
  ADD COLUMN attempt_count integer NOT NULL DEFAULT 0,
  ADD COLUMN content_hash text,
  ADD COLUMN processing_started_at timestamptz;

DROP TABLE IF EXISTS kb_chunks;

CREATE TABLE kb_documents (
  id uuid PRIMARY KEY DEFAULT concourse.uuid_generate_v7(),
  kb_source_id uuid NOT NULL REFERENCES kb_sources(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  organizer_organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  owner_organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title text NOT NULL,
  raw_text text,
  status text NOT NULL DEFAULT 'pending',
  quarantine_reason text,
  indexed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT kb_documents_status_check CHECK (status IN ('pending','processing','indexed','quarantined','failed'))
);
CREATE INDEX kb_documents_source_id_idx ON kb_documents(kb_source_id);
CREATE INDEX kb_documents_event_status_idx ON kb_documents(event_id, status);

CREATE TABLE kb_chunks (
  id uuid PRIMARY KEY DEFAULT concourse.uuid_generate_v7(),
  kb_document_id uuid NOT NULL REFERENCES kb_documents(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  organizer_organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  owner_organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  chunk_index integer NOT NULL,
  content text NOT NULL,
  embedding vector(1024) NOT NULL,
  token_count integer NOT NULL,
  visibility text NOT NULL DEFAULT 'public',
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT kb_chunks_document_chunk_key UNIQUE (kb_document_id, chunk_index),
  CONSTRAINT kb_chunks_visibility_check CHECK (visibility IN ('public','exhibitor_internal','organizer_internal'))
);
CREATE INDEX kb_chunks_event_visibility_idx ON kb_chunks(event_id, visibility);
CREATE INDEX kb_chunks_embedding_idx ON kb_chunks USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);

GRANT SELECT, INSERT, UPDATE, DELETE ON kb_documents, kb_chunks TO app_tenant;
GRANT ALL PRIVILEGES ON kb_documents, kb_chunks TO app_platform;

ALTER TABLE kb_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_documents FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON kb_documents
  USING (organizer_organization_id = current_setting('app.current_org_id', true)::uuid OR owner_organization_id = current_setting('app.current_org_id', true)::uuid)
  WITH CHECK (organizer_organization_id = current_setting('app.current_org_id', true)::uuid OR owner_organization_id = current_setting('app.current_org_id', true)::uuid);

ALTER TABLE kb_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_chunks FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON kb_chunks
  USING (organizer_organization_id = current_setting('app.current_org_id', true)::uuid OR owner_organization_id = current_setting('app.current_org_id', true)::uuid)
  WITH CHECK (organizer_organization_id = current_setting('app.current_org_id', true)::uuid OR owner_organization_id = current_setting('app.current_org_id', true)::uuid);
