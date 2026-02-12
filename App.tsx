
import React from 'react';
import { CustomTable } from './components/CustomTable';
import { LayoutDashboard, Users, BarChart3, Bell, Search, Command } from 'lucide-react';

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar - Hidden on mobile, visible on desktop */}
      <aside className="hidden lg:flex w-64 bg-slate-900 text-slate-300 flex-col border-r border-slate-800">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/20">
            P
          </div>
          <span className="text-white font-bold text-xl tracking-tight">ProDash</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 mt-4">
          <SidebarItem icon={<LayoutDashboard size={20} />} label="Overview" active />
          <SidebarItem icon={<Users size={20} />} label="Team Members" />
          <SidebarItem icon={<BarChart3 size={20} />} label="Analytics" />
          <SidebarItem icon={<Bell size={20} />} label="Notifications" />
        </nav>
        
        <div className="p-4 mt-auto border-t border-slate-800">
          <div className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-xl border border-slate-700">
            <img src="https://picsum.photos/40/40?random=1" className="rounded-lg" alt="Profile" />
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">Admin User</p>
              <p className="text-xs text-slate-500 truncate">admin@prodash.ai</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search resources..." 
                className="w-full bg-slate-100 border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 rounded-lg py-2 pl-10 pr-4 text-sm transition-all outline-none"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400 text-[10px] font-bold px-1.5 py-0.5 border border-slate-200 rounded">
                <Command size={10} />
                <span>K</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors relative">
               <Bell size={20} />
               <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white"></span>
             </button>
             <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>
             <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-md shadow-indigo-600/10">
               + Create
             </button>
          </div>
        </header>

        {/* Dynamic Table Section */}
        <div className="p-6 max-w-7xl mx-auto w-full">
          <CustomTable />
        </div>
      </main>
    </div>
  );
};

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, active }) => (
  <button className={`
    w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
    ${active 
      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 font-medium' 
      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}
  `}>
    {icon}
    <span className="text-sm">{label}</span>
  </button>
);

export default App;
