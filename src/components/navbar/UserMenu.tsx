'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, LogOut } from 'lucide-react';
import { AuthUser } from '@/types/api';

interface UserMenuProps {
  currentUser: AuthUser;
  onLogout: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ currentUser, onLogout }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = currentUser.email ? currentUser.email.slice(0, 2).toUpperCase() : 'NO';

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-8 items-center gap-1.5 rounded-lg border pl-1 pr-2 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-colors"
        style={{ borderColor: 'var(--border-color)' }}
        aria-label="User menu"
        aria-expanded={open}
      >
        <span
          className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #2563EB, #60A5FA)' }}
        >
          {initials}
        </span>
        <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className="absolute right-0 mt-1.5 w-52 rounded-xl border shadow-lg z-50 animate-in slide-in-from-top-2 duration-150"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-color)',
            boxShadow: 'var(--shadow-elevated)',
          }}
        >
          <div className="border-b px-4 py-3" style={{ borderColor: 'var(--border-color)' }}>
            <div className="flex items-center gap-2.5">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white shrink-0"
                style={{ background: 'linear-gradient(135deg, #2563EB, #60A5FA)' }}
              >
                {initials}
              </span>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-[var(--text-primary)] truncate">
                  {currentUser.email}
                </div>
                <div className="text-[10px] text-[var(--text-muted)]">Workspace: default</div>
              </div>
            </div>
          </div>
          <div className="p-1.5">
            <button
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-[var(--status-error)] hover:bg-[var(--status-error-bg)] transition-colors"
            >
              <LogOut size={13} />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
