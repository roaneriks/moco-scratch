import { NavLink, Outlet } from 'react-router-dom'

const navItems = {
  Analytics: [
    { to: '/overview', label: 'Overview' },
    { to: '/artworks', label: 'Artworks' },
    { to: '/audience', label: 'Audience' },
  ],
  Management: [
    { to: '/collection', label: 'Collection' },
  ],
}

export default function Layout() {
  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <aside className="w-56 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col">
        <div className="px-6 pt-8 pb-6">
          <span className="font-display text-2xl font-extrabold tracking-tight text-gray-900">
            MOCO
          </span>
          <p className="mt-1 text-xs text-gray-400 font-medium tracking-wide uppercase">
            Staff dashboard
          </p>
        </div>

        <nav className="flex-1 px-3 space-y-6 overflow-y-auto">
          {Object.entries(navItems).map(([section, items]) => (
            <div key={section}>
              <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                {section}
              </p>
              <ul className="space-y-0.5">
                {items.map(({ to, label }) => (
                  <li key={to}>
                    <NavLink
                      to={to}
                      className={({ isActive }) =>
                        `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-[#E4007B]/10 text-[#E4007B]'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`
                      }
                    >
                      {label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  )
}
