export default function Sidebar({ tabs, activeTab, setActiveTab, theme, toggleTheme }) {
  return (
    <aside
      className="w-[240px] flex-shrink-0 flex flex-col"
      style={{ background: 'linear-gradient(180deg, #503FB6 0%, #2D245D 100%)', borderRight: '1px solid var(--color-border)' }}
    >
      {/* Header */}
      <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div>
          <p className="text-[10px] font-bold tracking-widest" style={{ color: 'var(--color-text-muted)' }}>ONE IMPACT</p>
          <p className="font-semibold text-sm mt-1" style={{ color: 'var(--color-text-primary)' }}>Hub</p>
        </div>
        <button
          onClick={toggleTheme}
          className="w-[30px] h-[30px] rounded-lg flex items-center justify-center border-none cursor-pointer transition-colors"
          style={{ background: 'var(--color-bg-input)', color: 'var(--color-text-secondary)' }}
          title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
        >
          {theme === 'dark' ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>
      </div>

      {/* Tabs / Views */}
      <nav className="flex flex-col gap-0.5 p-3 flex-1">
        <p className="text-[10px] font-bold tracking-wider mb-2 px-3" style={{ color: 'var(--color-text-label)' }}>
          VIEWS
        </p>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="text-left px-3 py-2 rounded-lg text-[13px] font-medium transition-all border-none cursor-pointer"
            style={{
              background: activeTab === tab.id ? 'var(--color-bg-active)' : 'transparent',
              color: activeTab === tab.id ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
            }}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 flex flex-col gap-3" style={{ borderTop: '1px solid var(--color-border)' }}>
        <a
          href="/orientacoes.html"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-[12px] no-underline rounded-lg px-3 py-2 transition-colors"
          style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.75)' }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          Orientações
        </a>
        <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
          v1.0.0
        </p>
      </div>
    </aside>
  )
}