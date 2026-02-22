'use client';

import { useState } from 'react';
import nowData from '@/data/now.json';
import { CLIENTS } from '@/app/clients/data';

// SHA-256 of admin password — change by running:
// node -e "const c=require('crypto');console.log(c.createHash('sha256').update('YOUR_NEW_PASSWORD').digest('hex'))"
const ADMIN_HASH = '401b4d6c69937db32ae45f66b66af19ffc54e07146549bec2ea564b190352156';

// Deploy endpoint — proxied via CF Pages Function (hook URL stored server-side as CF_DEPLOY_HOOK secret)
const DEPLOY_ENDPOINT = '/api/deploy';

const GITHUB_BASE = 'https://github.com/Lobsterclawsss/noaberger/edit/master';

type DeployStatus = 'idle' | 'loading' | 'done' | 'error';

const statusColors: Record<string, string> = {
  planning: 'text-secondary',
  'in-progress': 'text-teal',
  review: 'text-mint',
  complete: 'text-mint',
};

export default function Admin() {
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [deployStatus, setDeployStatus] = useState<DeployStatus>('idle');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const encoder = new TextEncoder();
    const buf = await crypto.subtle.digest('SHA-256', encoder.encode(password));
    const hex = Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    if (hex === ADMIN_HASH) {
      setUnlocked(true);
      setAuthError('');
    } else {
      setAuthError('Incorrect password.');
    }
  }

  async function triggerDeploy() {
    setDeployStatus('loading');
    try {
      const res = await fetch(DEPLOY_ENDPOINT, { method: 'POST' });
      setDeployStatus(res.ok ? 'done' : 'error');
    } catch {
      setDeployStatus('error');
    }
  }

  if (!unlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-xs">
          <p className="text-secondary text-xs tracking-widest uppercase mb-6">Admin</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoFocus
              className="w-full bg-elevated border border-white/10 rounded-lg px-4 py-3 text-white placeholder-secondary focus:outline-none focus:border-teal/50 text-sm"
            />
            {authError && <p className="text-red-400 text-xs">{authError}</p>}
            <button
              type="submit"
              className="w-full bg-teal hover:bg-teal-hover text-white py-3 rounded-lg text-sm font-medium transition-colors"
            >
              Unlock →
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 px-6">
      <div className="container mx-auto max-w-3xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-2xl font-bold text-white">Admin</h1>
          <div className="flex gap-5">
            <a href="https://noaberger.com" target="_blank" rel="noopener noreferrer"
              className="text-secondary hover:text-white text-sm transition-colors">
              noaberger.com ↗
            </a>
            <a href="https://github.com/Lobsterclawsss/noaberger" target="_blank" rel="noopener noreferrer"
              className="text-secondary hover:text-white text-sm transition-colors">
              GitHub ↗
            </a>
            <a href="https://dash.cloudflare.com" target="_blank" rel="noopener noreferrer"
              className="text-secondary hover:text-white text-sm transition-colors">
              CF ↗
            </a>
          </div>
        </div>

        {/* Deploy */}
        <section className="mb-10">
          <h2 className="text-xs font-semibold text-teal tracking-widest uppercase mb-4">Deploy</h2>
          <div className="border border-white/10 rounded-xl p-5 bg-surface flex items-center justify-between">
            <div>
              <p className="text-white text-sm font-medium">Trigger Rebuild</p>
              <p className="text-secondary text-xs mt-1">
                Runs Obsidian Now sync + RSS generator, then deploys to noaberger.com
              </p>
            </div>
            <button
              onClick={triggerDeploy}
              disabled={deployStatus === 'loading'}
              className="bg-teal hover:bg-teal-hover disabled:opacity-40 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors flex-shrink-0 ml-4"
            >
              {deployStatus === 'idle' && 'Deploy →'}
              {deployStatus === 'loading' && 'Queuing…'}
              {deployStatus === 'done' && 'Queued ✓'}
              {deployStatus === 'error' && 'Error — retry'}
            </button>
          </div>
        </section>

        {/* Now Section */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-teal tracking-widest uppercase">Now Section</h2>
            <a
              href={`${GITHUB_BASE}/data/now.json`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary hover:text-teal text-xs transition-colors"
            >
              Edit on GitHub →
            </a>
          </div>
          <div className="border border-white/10 rounded-xl overflow-hidden">
            {nowData.items.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-4 px-5 py-4 border-b border-white/10 last:border-0 bg-surface"
              >
                <span className="text-teal mt-0.5 flex-shrink-0">→</span>
                <div>
                  <p className="text-white text-sm">{item.text}</p>
                  <p className="text-secondary text-xs mt-0.5">{item.date}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-secondary text-xs mt-2">
            Updated: {nowData.updatedAt} · Or create{' '}
            <span className="font-mono">Now.md</span> in Obsidian vault → Deploy to sync
          </p>
        </section>

        {/* Client Portal */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-teal tracking-widest uppercase">Client Portal</h2>
            <a
              href={`${GITHUB_BASE}/app/clients/data.ts`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary hover:text-teal text-xs transition-colors"
            >
              Edit on GitHub →
            </a>
          </div>
          <div className="border border-white/10 rounded-xl overflow-hidden">
            {CLIENTS.map((client) => (
              <div
                key={client.token}
                className="flex items-center justify-between px-5 py-4 border-b border-white/10 last:border-0 bg-surface"
              >
                <div>
                  <p className="text-white text-sm font-medium">{client.name}</p>
                  <p className="text-secondary text-xs mt-0.5 font-mono">/clients/{client.token}</p>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                  <span className={`text-xs ${statusColors[client.projects[0]?.status ?? 'planning']}`}>
                    {client.projects[0]?.status ?? '—'}
                  </span>
                  <a
                    href={`/clients/${client.token}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-secondary hover:text-teal text-xs transition-colors"
                  >
                    View ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Links */}
        <section>
          <h2 className="text-xs font-semibold text-teal tracking-widest uppercase mb-4">Quick Links</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Live Site', url: 'https://noaberger.com' },
              { label: 'Pages Preview', url: 'https://noaberger.pages.dev' },
              { label: 'GitHub Repo', url: 'https://github.com/Lobsterclawsss/noaberger' },
              { label: 'CF Pages Dashboard', url: 'https://dash.cloudflare.com' },
            ].map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-white/10 rounded-lg px-4 py-3 bg-surface hover:border-teal/30 transition-colors text-white text-sm"
              >
                {link.label} →
              </a>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
