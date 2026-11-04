'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Database,
  Plus,
  Search,
  Upload,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Shield,
  Layers,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import {
  KnowledgeBase,
  KnowledgeDocument,
  Organization,
  RetrievalTrace,
  fetchOrganizations,
  createOrganization,
  fetchKnowledgeBases,
  createKnowledgeBase,
  validateConnection,
  fetchDocuments,
  uploadDocumentText,
  deleteDocument,
  testRetrieval,
} from '@/lib/knowledgeApi';

export const KnowledgeView: React.FC = () => {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');
  const [kbs, setKbs] = useState<KnowledgeBase[]>([]);
  const [selectedKbId, setSelectedKbId] = useState<string>('');
  const [docs, setDocs] = useState<KnowledgeDocument[]>([]);

  // Form states
  const [showCreateKb, setShowCreateKb] = useState(false);
  const [showUploadDoc, setShowUploadDoc] = useState(false);
  const [newKbName, setNewKbName] = useState('');
  const [newKbDesc, setNewKbDesc] = useState('');
  const [vectorProvider, setVectorProvider] = useState('chroma');
  const [collectionName, setCollectionName] = useState('default');
  const [connValidationResult, setConnValidationResult] = useState<{ valid: boolean; message: string } | null>(null);

  // Doc upload state
  const [docFilename, setDocFilename] = useState('');
  const [docContent, setDocContent] = useState('');

  // Retrieval Test state
  const [testQuery, setTestQuery] = useState('');
  const [retrievalResult, setRetrievalResult] = useState<RetrievalTrace | null>(null);
  const [isRetrieving, setIsRetrieving] = useState(false);

  // Status/loading
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load organizations on mount
  useEffect(() => {
    loadOrgs();
  }, []);

  async function loadOrgs() {
    try {
      setLoading(true);
      const data = await fetchOrganizations();
      setOrgs(data);
      if (data.length > 0) {
        setSelectedOrgId(data[0].id);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not load organizations.');
    } finally {
      setLoading(false);
    }
  }

  // Load KBs when selected org changes
  useEffect(() => {
    if (!selectedOrgId) return;
    loadKBs(selectedOrgId);
  }, [selectedOrgId]);

  async function loadKBs(orgId: string) {
    try {
      const data = await fetchKnowledgeBases(orgId);
      setKbs(data);
      if (data.length > 0) {
        setSelectedKbId(data[0].id);
      } else {
        setSelectedKbId('');
        setDocs([]);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not load knowledge bases.');
    }
  }

  // Load Docs when selected KB changes
  useEffect(() => {
    if (!selectedKbId) return;
    loadDocs(selectedKbId);
  }, [selectedKbId]);

  async function loadDocs(kbId: string) {
    try {
      const data = await fetchDocuments(kbId);
      setDocs(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not load documents.');
    }
  }

  async function handleValidateConnection() {
    try {
      const res = await validateConnection({
        provider_type: 'vector',
        provider_name: vectorProvider,
        config: { collection_name: collectionName },
      });
      setConnValidationResult(res);
    } catch (err: any) {
      setConnValidationResult({ valid: false, message: err.message });
    }
  }

  async function handleCreateKb(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedOrgId || !newKbName) return;
    try {
      setLoading(true);
      await createKnowledgeBase({
        org_id: selectedOrgId,
        name: newKbName,
        description: newKbDesc,
        vector_provider: vectorProvider,
        collection_name: collectionName,
        vector_config: { collection_name: collectionName },
      });
      setShowCreateKb(false);
      setNewKbName('');
      setNewKbDesc('');
      setConnValidationResult(null);
      await loadKBs(selectedOrgId);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create knowledge base.');
    } finally {
      setLoading(false);
    }
  }

  async function handleUploadDoc(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedKbId || !docFilename || !docContent) return;
    try {
      setLoading(true);
      await uploadDocumentText(selectedKbId, docFilename, docContent);
      setShowUploadDoc(false);
      setDocFilename('');
      setDocContent('');
      await loadDocs(selectedKbId);
      await loadKBs(selectedOrgId);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to upload document.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteDoc(docId: string) {
    if (!selectedKbId) return;
    try {
      await deleteDocument(selectedKbId, docId);
      await loadDocs(selectedKbId);
      await loadKBs(selectedOrgId);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete document.');
    }
  }

  async function handleTestRetrieval() {
    if (!selectedKbId || !testQuery) return;
    try {
      setIsRetrieving(true);
      const res = await testRetrieval(selectedKbId, testQuery);
      setRetrievalResult(res);
    } catch (err: any) {
      setErrorMessage(err.message || 'Retrieval query failed.');
    } finally {
      setIsRetrieving(false);
    }
  }

  const selectedKb = kbs.find((k) => k.id === selectedKbId);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div
        className="rounded-2xl border p-6 shadow-sm relative overflow-hidden"
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}
            >
              <Database size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  Knowledge Bases &amp; RAG Connectors
                </h2>
                <span
                  className="rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider"
                  style={{ backgroundColor: 'rgba(37,99,235,0.1)', color: 'var(--primary)' }}
                >
                  Production Active
                </span>
              </div>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                Customer-owned vector and graph database connectors with tenant isolation and RBAC.
              </p>
            </div>
          </div>

          {/* Org Selector */}
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
              Organization:
            </label>
            <select
              value={selectedOrgId}
              onChange={(e) => setSelectedOrgId(e.target.value)}
              className="rounded-lg border px-3 py-1.5 text-xs font-medium focus:outline-none"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)',
              }}
            >
              {orgs.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name} ({org.role || 'member'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {errorMessage && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-500">
            <AlertCircle size={14} />
            <span>{errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="ml-auto underline text-[11px] font-medium"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* Main Grid: KB List & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Knowledge Base List */}
        <div
          className="rounded-2xl border p-5 shadow-sm space-y-4"
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Layers size={16} /> Knowledge Stores
            </h3>
            <button
              onClick={() => setShowCreateKb(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg text-white"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <Plus size={14} /> New
            </button>
          </div>

          <div className="space-y-2">
            {kbs.length === 0 ? (
              <p className="text-xs py-4 text-center" style={{ color: 'var(--text-muted)' }}>
                No knowledge bases found for this organization.
              </p>
            ) : (
              kbs.map((kb) => (
                <div
                  key={kb.id}
                  onClick={() => setSelectedKbId(kb.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedKbId === kb.id ? 'ring-2' : ''
                  }`}
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                    borderColor: 'var(--border-color)',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                      {kb.name}
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 font-semibold uppercase">
                      {kb.vector_provider}
                    </span>
                  </div>
                  <p className="text-[11px] mt-1 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                    {kb.description || 'No description provided.'}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    <span>{kb.document_count} doc(s)</span>
                    <span>•</span>
                    <span>{kb.embedding_model.split('/').pop()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: KB Details, Document Management & Retrieval Test */}
        <div className="lg:col-span-2 space-y-6">
          {selectedKb ? (
            <>
              {/* Document Management Panel */}
              <div
                className="rounded-2xl border p-5 shadow-sm space-y-4"
                style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                      Indexed Documents ({docs.length})
                    </h3>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      Documents partitioned under collection: <code className="text-[11px]">{selectedKb.collection_name}</code>
                    </p>
                  </div>
                  <button
                    onClick={() => setShowUploadDoc(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-white"
                    style={{ backgroundColor: 'var(--primary)' }}
                  >
                    <Upload size={14} /> Upload Document
                  </button>
                </div>

                <div className="space-y-2">
                  {docs.length === 0 ? (
                    <div className="text-center py-6 border border-dashed rounded-xl" style={{ borderColor: 'var(--border-color)' }}>
                      <FileText size={28} className="mx-auto mb-2 opacity-40" />
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        No documents indexed yet. Upload policies, FAQs, or manuals.
                      </p>
                    </div>
                  ) : (
                    docs.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 rounded-xl border text-xs"
                        style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}
                      >
                        <div className="flex items-center gap-3">
                          <FileText size={16} className="text-blue-500" />
                          <div>
                            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                              {doc.filename}
                            </p>
                            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                              {doc.chunk_count} chunks • Status: {doc.status}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteDoc(doc.id)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Retrieval Test Console */}
              <div
                className="rounded-2xl border p-5 shadow-sm space-y-4"
                style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
              >
                <div className="flex items-center gap-2">
                  <Search size={16} style={{ color: 'var(--primary)' }} />
                  <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                    Retrieval Evidence Test Console
                  </h3>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={testQuery}
                    onChange={(e) => setTestQuery(e.target.value)}
                    placeholder="Ask a question or enter keywords to retrieve grounded chunks..."
                    className="flex-1 rounded-lg border px-3 py-2 text-xs focus:outline-none"
                    style={{
                      backgroundColor: 'var(--bg-elevated)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)',
                    }}
                  />
                  <button
                    onClick={handleTestRetrieval}
                    disabled={isRetrieving || !testQuery}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg text-white disabled:opacity-50"
                    style={{ backgroundColor: 'var(--primary)' }}
                  >
                    {isRetrieving ? <RefreshCw size={14} className="animate-spin" /> : <Search size={14} />}
                    Retrieve
                  </button>
                </div>

                {retrievalResult && (
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
                      <span>Retrieved {retrievalResult.evidence.length} chunks</span>
                      <span>Latency: {retrievalResult.latency_ms}ms</span>
                    </div>
                    {retrievalResult.evidence.map((ev, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border text-xs space-y-1"
                        style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}
                      >
                        <div className="flex items-center justify-between text-[11px] font-semibold text-blue-600">
                          <span>Relevance Score: {(ev.score * 100).toFixed(1)}%</span>
                          <span>Chunk: {ev.chunk_id}</span>
                        </div>
                        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                          {ev.text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div
              className="rounded-2xl border p-12 text-center shadow-sm"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
            >
              <Database size={36} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                No Knowledge Base Selected
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                Select a knowledge base on the left or create a new one to manage documents and test retrieval.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Create Knowledge Base */}
      {showCreateKb && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div
            className="w-full max-w-md rounded-2xl border p-6 shadow-xl space-y-4"
            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
          >
            <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              Create Knowledge Base
            </h3>
            <form onSubmit={handleCreateKb} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Name
                </label>
                <input
                  required
                  type="text"
                  value={newKbName}
                  onChange={(e) => setNewKbName(e.target.value)}
                  placeholder="e.g., Support Policies"
                  className="w-full rounded-lg border px-3 py-2 text-xs focus:outline-none"
                  style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}
                />
              </div>
              <div>
                <label className="font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newKbDesc}
                  onChange={(e) => setNewKbDesc(e.target.value)}
                  placeholder="Policy and procedure reference manuals..."
                  className="w-full rounded-lg border px-3 py-2 text-xs focus:outline-none"
                  style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}
                />
              </div>
              <div>
                <label className="font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Vector Store Provider
                </label>
                <select
                  value={vectorProvider}
                  onChange={(e) => setVectorProvider(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-xs focus:outline-none"
                  style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}
                >
                  <option value="chroma">Chroma (Local / Remote)</option>
                  <option value="pinecone">Pinecone</option>
                  <option value="weaviate">Weaviate</option>
                  <option value="qdrant">Qdrant</option>
                </select>
              </div>
              <div>
                <label className="font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Collection / Index Name
                </label>
                <input
                  type="text"
                  value={collectionName}
                  onChange={(e) => setCollectionName(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-xs focus:outline-none"
                  style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleValidateConnection}
                  className="px-3 py-1.5 rounded-lg border text-[11px] font-semibold"
                  style={{ borderColor: 'var(--border-color)' }}
                >
                  Test Connection
                </button>
                {connValidationResult && (
                  <span
                    className={`text-[11px] font-semibold ${
                      connValidationResult.valid ? 'text-green-600' : 'text-red-500'
                    }`}
                  >
                    {connValidationResult.valid ? 'Valid ✓' : 'Failed ✗'}
                  </span>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateKb(false)}
                  className="px-4 py-2 rounded-lg border text-xs"
                  style={{ borderColor: 'var(--border-color)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-white"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Upload Document */}
      {showUploadDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div
            className="w-full max-w-lg rounded-2xl border p-6 shadow-xl space-y-4"
            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
          >
            <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              Upload Knowledge Document
            </h3>
            <form onSubmit={handleUploadDoc} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Document Filename
                </label>
                <input
                  required
                  type="text"
                  value={docFilename}
                  onChange={(e) => setDocFilename(e.target.value)}
                  placeholder="e.g., refund_policy_2026.txt"
                  className="w-full rounded-lg border px-3 py-2 text-xs focus:outline-none"
                  style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}
                />
              </div>
              <div>
                <label className="font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Text Content
                </label>
                <textarea
                  required
                  rows={6}
                  value={docContent}
                  onChange={(e) => setDocContent(e.target.value)}
                  placeholder="Paste raw text, policies, or knowledge data here..."
                  className="w-full rounded-lg border px-3 py-2 text-xs focus:outline-none"
                  style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowUploadDoc(false)}
                  className="px-4 py-2 rounded-lg border text-xs"
                  style={{ borderColor: 'var(--border-color)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-white"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  Index Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
