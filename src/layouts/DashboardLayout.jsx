import { Outlet, Navigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import { useAuth } from "../contexts/AuthContext";
import { Loader2 } from "lucide-react";

export default function DashboardLayout() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden">
            {/* Sidebar - Hidden on mobile, typically controlled by a sheet/drawer on small screens (simplified for this step) */}
            <div className="hidden md:block">
                <Sidebar />
            </div>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto relative z-0">
                <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 min-h-full">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
