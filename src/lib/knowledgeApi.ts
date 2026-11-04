import { API_BASE_URL, getToken } from './apiClient';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  created_at?: string;
  role?: string;
}

export interface OrganizationMember {
  id: string;
  user_id: string;
  email: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  created_at?: string;
}

export interface KnowledgeBase {
  id: string;
  org_id: string;
  name: string;
  description: string;
  vector_provider: string;
  collection_name: string;
  graph_provider?: string | null;
  embedding_model: string;
  document_count: number;
  created_at?: string;
}

export interface KnowledgeDocument {
  id: string;
  knowledge_base_id: string;
  org_id: string;
  filename: string;
  mime_type: string;
  status: 'pending' | 'processing' | 'indexed' | 'failed';
  chunk_count: number;
  error_message?: string | null;
  created_at?: string;
}

export interface RetrievalEvidence {
  document_id: string;
  chunk_id: string;
  text: string;
  score: number;
  metadata: Record<string, any>;
  source: string;
}

export interface RetrievalTrace {
  query: string;
  org_id: string;
  knowledge_base_ids: string[];
  retrieval_mode: string;
  evidence: RetrievalEvidence[];
  graph_entities: any[];
  graph_relationships: any[];
  latency_ms: number;
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ---------------------------------------------------------------------------
// Organization API
// ---------------------------------------------------------------------------

export async function fetchOrganizations(): Promise<Organization[]> {
  const res = await fetch(`${API_BASE_URL}/api/v1/organizations`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch organizations: ${res.statusText}`);
  return res.json();
}

export async function createOrganization(name: string, slug?: string): Promise<Organization> {
  const res = await fetch(`${API_BASE_URL}/api/v1/organizations`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ name, slug }),
  });
  if (!res.ok) throw new Error(`Failed to create organization: ${res.statusText}`);
  return res.json();
}

export async function fetchOrgMembers(orgId: string): Promise<OrganizationMember[]> {
  const res = await fetch(`${API_BASE_URL}/api/v1/organizations/${orgId}/members`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch members: ${res.statusText}`);
  return res.json();
}

export async function addOrgMember(orgId: string, email: string, role: string): Promise<OrganizationMember> {
  const res = await fetch(`${API_BASE_URL}/api/v1/organizations/${orgId}/members`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ email, role }),
  });
  if (!res.ok) throw new Error(`Failed to add member: ${res.statusText}`);
  return res.json();
}

// ---------------------------------------------------------------------------
// Knowledge Base API
// ---------------------------------------------------------------------------

export async function fetchKnowledgeBases(orgId: string): Promise<KnowledgeBase[]> {
  const res = await fetch(`${API_BASE_URL}/api/v1/knowledge-bases?org_id=${encodeURIComponent(orgId)}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch knowledge bases: ${res.statusText}`);
  return res.json();
}

export async function createKnowledgeBase(payload: {
  org_id: string;
  name: string;
  description?: string;
  vector_provider: string;
  vector_config?: Record<string, any>;
  collection_name?: string;
  graph_provider?: string;
  graph_config?: Record<string, any>;
}): Promise<KnowledgeBase> {
  const res = await fetch(`${API_BASE_URL}/api/v1/knowledge-bases`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to create knowledge base: ${res.statusText}`);
  return res.json();
}

export async function validateConnection(payload: {
  provider_type: 'vector' | 'graph';
  provider_name: string;
  config: Record<string, any>;
}): Promise<{ valid: boolean; message: string; details?: any }> {
  const res = await fetch(`${API_BASE_URL}/api/v1/knowledge-bases/validate-connection`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Connection validation failed: ${res.statusText}`);
  return res.json();
}

export async function fetchDocuments(kbId: string): Promise<KnowledgeDocument[]> {
  const res = await fetch(`${API_BASE_URL}/api/v1/knowledge-bases/${kbId}/documents`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch documents: ${res.statusText}`);
  return res.json();
}

export async function uploadDocumentText(
  kbId: string,
  filename: string,
  text: string,
  mimeType: string = 'text/plain'
): Promise<KnowledgeDocument> {
  const res = await fetch(`${API_BASE_URL}/api/v1/knowledge-bases/${kbId}/documents`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      filename,
      content_text: text,
      mime_type: mimeType,
    }),
  });
  if (!res.ok) throw new Error(`Failed to upload document: ${res.statusText}`);
  return res.json();
}

export async function deleteDocument(kbId: string, docId: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/v1/knowledge-bases/${kbId}/documents/${docId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to delete document: ${res.statusText}`);
}

export async function testRetrieval(
  kbId: string,
  query: string,
  mode: string = 'vector',
  topK: number = 3
): Promise<RetrievalTrace> {
  const res = await fetch(`${API_BASE_URL}/api/v1/knowledge-bases/${kbId}/retrieve`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      query,
      retrieval_mode: mode,
      top_k: topK,
    }),
  });
  if (!res.ok) throw new Error(`Retrieval query failed: ${res.statusText}`);
  return res.json();
}

