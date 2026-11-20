'use client';

import React, { useEffect, useState } from 'react';
import { UserPlus, ShieldCheck, Trash2 } from 'lucide-react';
import {
  Organization, OrganizationMember, fetchOrganizations, createOrganization,
  fetchOrgMembers, addOrgMember, updateOrgMemberRole, removeOrgMember,
} from '@/lib/knowledgeApi';

const ROLES: OrganizationMember['role'][] = ['owner', 'admin', 'member', 'viewer'];

export const OrganizationAccessCard: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [orgId, setOrgId] = useState('');
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [orgName, setOrgName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<OrganizationMember['role']>('member');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const selectedOrganization = organizations.find((org) => org.id === orgId);
  const canManageMembers = selectedOrganization?.role === 'owner' || selectedOrganization?.role === 'admin';

  async function loadOrganizations(preferredOrgId?: string) {
    const orgs = await fetchOrganizations();
    setOrganizations(orgs);
    const currentId = preferredOrgId && orgs.some((org) => org.id === preferredOrgId)
      ? preferredOrgId
      : orgs.some((org) => org.id === orgId) ? orgId : orgs[0]?.id ?? '';
    setOrgId(currentId);
    if (currentId) setMembers(await fetchOrgMembers(currentId));
    else setMembers([]);
  }

  useEffect(() => {
    let cancelled = false;
    fetchOrganizations().then(async (orgs) => {
      if (cancelled) return;
      setOrganizations(orgs);
      const firstOrgId = orgs[0]?.id ?? '';
      setOrgId(firstOrgId);
      if (firstOrgId) {
        const initialMembers = await fetchOrgMembers(firstOrgId);
        if (!cancelled) setMembers(initialMembers);
      }
    }).catch((err: unknown) => {
      if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load organizations.');
    });
    return () => { cancelled = true; };
  }, []);

  async function perform(action: () => Promise<void>) {
    try { setBusy(true); setError(''); await action(); }
    catch (err) { setError(err instanceof Error ? err.message : 'Organization update failed.'); }
    finally { setBusy(false); }
  }

  async function selectOrg(value: string) {
    setOrgId(value);
    setMembers(value ? await fetchOrgMembers(value) : []);
  }

  return (
    <section className="rounded-2xl border p-5 shadow-sm space-y-4" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
      <header className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}><ShieldCheck size={19} /></span>
        <div><h3 className="text-sm font-bold text-[var(--text-primary)]">Role Based Access Control (RBAC)</h3><p className="text-xs text-[var(--text-secondary)]">Organization roles control who can view data, create knowledge bases, and manage members.</p></div>
      </header>

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {[
          ['Owner', 'Full organization and member control'],
          ['Admin', 'Manage members and organization data'],
          ['Member', 'Create and update shared resources'],
          ['Viewer', 'Read organization resources'],
        ].map(([name, description]) => (
          <div key={name} className="rounded-xl border p-3" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}>
            <p className="text-xs font-bold text-[var(--text-primary)]">{name}</p>
            <p className="mt-1 text-[10px] leading-relaxed text-[var(--text-secondary)]">{description}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <select aria-label="Organization" value={orgId} onChange={(event) => selectOrg(event.target.value)} className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-xs text-[var(--text-primary)]" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}>
          {organizations.length === 0 && <option value="">No organizations yet</option>}
          {organizations.map((org) => <option key={org.id} value={org.id}>{org.name} · {org.role}</option>)}
        </select>
        <form className="flex gap-2" onSubmit={(event) => { event.preventDefault(); if (!orgName.trim()) return; void perform(async () => { const created = await createOrganization(orgName.trim()); setOrgName(''); await loadOrganizations(created.id); }); }}>
          <input aria-label="New organization name" value={orgName} onChange={(event) => setOrgName(event.target.value)} placeholder="New organization" className="w-36 rounded-lg border px-3 py-2 text-xs text-[var(--text-primary)]" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }} />
          <button disabled={busy || !orgName.trim()} className="rounded-lg px-3 py-2 text-xs font-semibold text-white disabled:opacity-50" style={{ backgroundColor: 'var(--primary)' }}>Create</button>
        </form>
      </div>

      {orgId && <>
        {canManageMembers && <form className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto_auto]" onSubmit={(event) => { event.preventDefault(); if (!email.trim()) return; void perform(async () => { await addOrgMember(orgId, email.trim(), role); setEmail(''); setMembers(await fetchOrgMembers(orgId)); }); }}>
          <input type="email" aria-label="Member email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Add registered user by email" className="rounded-lg border px-3 py-2 text-xs text-[var(--text-primary)]" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }} />
          <select aria-label="New member role" value={role} onChange={(event) => setRole(event.target.value as OrganizationMember['role'])} className="rounded-lg border px-3 py-2 text-xs text-[var(--text-primary)]" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}>
            {ROLES.filter((value) => value !== 'owner').map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
          <button disabled={busy || !email.trim()} className="flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-white disabled:opacity-50" style={{ backgroundColor: 'var(--primary)' }}><UserPlus size={14} /> Add member</button>
        </form>}
        <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
          {members.map((member) => <div key={member.user_id} className="flex flex-wrap items-center gap-2 py-3">
            <div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-[var(--text-primary)]">{member.full_name || member.email || member.user_id}</p><p className="truncate text-[10px] text-[var(--text-secondary)]">{member.email}</p></div>
            {canManageMembers ? <select aria-label={`Role for ${member.email || member.user_id}`} value={member.role} disabled={busy || (member.role === 'owner' && selectedOrganization?.role !== 'owner')} onChange={(event) => { const nextRole = event.target.value as OrganizationMember['role']; void perform(async () => { await updateOrgMemberRole(orgId, member.user_id, nextRole); setMembers(await fetchOrgMembers(orgId)); }); }} className="rounded-lg border px-2 py-1.5 text-xs capitalize text-[var(--text-primary)] disabled:opacity-60" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}>
              {ROLES.filter((value) => value !== 'owner' || selectedOrganization?.role === 'owner' || member.role === 'owner').map((value) => <option key={value} value={value}>{value}</option>)}
            </select> : <span className="rounded-full px-2.5 py-1 text-[10px] font-bold capitalize" style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>{member.role}</span>}
            {canManageMembers && <button aria-label={`Remove ${member.email || member.user_id}`} disabled={busy || member.role === 'owner'} onClick={() => void perform(async () => { await removeOrgMember(orgId, member.user_id); setMembers(await fetchOrgMembers(orgId)); })} className="rounded-lg p-2 text-[var(--text-secondary)] hover:bg-rose-500/10 hover:text-rose-600 disabled:opacity-50"><Trash2 size={14} /></button>}
          </div>)}
        </div>
      </>}
      {error && <p role="alert" className="text-xs font-medium text-rose-700 dark:text-rose-300">{error}</p>}
      <p className="text-[10px] text-[var(--text-muted)]">Owners and admins can manage members. Server-side role checks protect organization data.</p>
    </section>
  );
};
