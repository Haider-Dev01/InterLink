import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'

export function Layout({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex flex-1">
        {/* Sidebar placeholder */}
        <aside className="w-64 border-r hidden md:block border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-4">
          <p className="text-sm text-slate-500">Navigation</p>
        </aside>
        
        <main className="flex-1 p-6">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  )
}
