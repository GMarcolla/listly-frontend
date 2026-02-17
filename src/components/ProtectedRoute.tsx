import { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProfileSidebar from './ProfileSidebar';

export default function ProtectedRoute() {
    const { user, loading } = useAuth();
    const [profileOpen, setProfileOpen] = useState(false);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-sm animate-pulse">
                    L
                </div>
            </div>
        );
    }

    if (!user) return <Navigate to="/login" />;

    const initials = user.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
        : user.email?.charAt(0).toUpperCase() || 'U';

    return (
        <>
            {/* Global User Info - Unified Header Trigger */}
            <div className="fixed top-0 right-0 z-50 p-3 h-16 flex items-center pointer-events-none">
                <button
                    onClick={() => setProfileOpen(true)}
                    className="flex items-center gap-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-gray-100 shadow-sm pointer-events-auto group hover:bg-white hover:border-orange-200 transition-all duration-200 cursor-pointer"
                >
                    <div className="text-right hidden sm:block">
                        <p className="text-[11px] font-bold text-gray-900 leading-none group-hover:text-orange-600 transition-colors">{user.name || 'Usuário'}</p>
                        <p className="text-[10px] text-gray-400 font-medium">Meu Perfil</p>
                    </div>
                    <div
                        className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-[11px] font-bold shadow-md shadow-orange-200/50 group-hover:shadow-orange-300/50 group-hover:scale-105 transition-all duration-200 border-2 border-white"
                    >
                        {initials}
                    </div>
                </button>
            </div>

            {/* Page Content */}
            <Outlet />

            {/* Profile Sidebar */}
            <ProfileSidebar open={profileOpen} onOpenChange={setProfileOpen} />
        </>
    );
}
