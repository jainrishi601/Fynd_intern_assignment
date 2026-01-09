import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, MessageSquarePlus } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Layout({ children }: { children: React.ReactNode }) {
    const location = useLocation();

    const navItems = [
        { path: '/', label: 'Submit Review', icon: MessageSquarePlus },
        { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    ];

    return (
        <div className="min-h-screen p-4 md:p-8 flex flex-col max-w-7xl mx-auto">
            <header className="flex justify-between items-center mb-8 glass-panel p-4">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                    ReviewAI
                </h1>
                <nav className="flex gap-4">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
                                    isActive
                                        ? "bg-blue-100 text-blue-700 font-medium shadow-sm"
                                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                                )}
                            >
                                <Icon size={18} />
                                <span className="hidden sm:inline">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </header>
            <main className="flex-1">
                {children}
            </main>
        </div>
    );
}
