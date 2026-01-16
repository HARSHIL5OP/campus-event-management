import { Link, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    Calendar,
    LogOut,
    PlusCircle,
    GraduationCap,
    Shield
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../ui/Button";

export default function Sidebar({ className = "" }) {
    const { userProfile, logout } = useAuth();
    const location = useLocation();

    // Default to student if no profile yet (should be handled by protection wrapper though)
    const role = userProfile?.role || "student";

    const isActive = (path) => location.pathname === path;

    const navItems = role === "student" ? [
        { label: "Dashboard", path: "/student/dashboard", icon: LayoutDashboard },
        { label: "Browse Events", path: "/events", icon: Calendar },
        // { label: "My Registrations", path: "/student/registrations", icon: Ticket }, // Placeholder
    ] : [
        { label: "Dashboard", path: "/organizer/dashboard", icon: LayoutDashboard },
        { label: "Create Event", path: "/organizer/events/create", icon: PlusCircle },
        { label: "My Events", path: "/organizer/events", icon: Calendar },
    ];

    return (
        <aside className={`flex flex-col h-full bg-card/50 backdrop-blur-xl border-r border-border w-64 p-6 transition-all duration-300 ${className}`}>
            {/* Logo / Brand */}
            <div className="mb-10 flex items-center gap-3 px-2">
                <div className="h-10 w-10 bg-gradient-to-br from-primary to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                    <GraduationCap className="text-white w-6 h-6" />
                </div>
                <div>
                    <h1 className="font-bold text-lg tracking-tight">CampusEvent</h1>
                    <span className="text-xs text-muted-foreground font-medium px-1.5 py-0.5 bg-secondary rounded-full uppercase tracking-wider">
                        {role}
                    </span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2">
                {navItems.map((item) => {
                    const active = isActive(item.path);
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                        >
                            <div className={`
                                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                                ${active
                                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 translate-x-1"
                                    : "hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                                }
                            `}>
                                <item.icon className={`w-5 h-5 ${active ? "animate-pulse" : ""}`} />
                                <span className="font-medium">{item.label}</span>
                            </div>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Actions */}
            <div className="mt-auto pt-6 border-t border-border space-y-4">
                {/* User Mini Profile */}
                <div className="flex items-center gap-3 px-2">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                        {userProfile?.firstName?.[0] || "U"}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium truncate">{userProfile?.firstName} {userProfile?.lastName}</p>
                        <p className="text-xs text-muted-foreground truncate">{userProfile?.email}</p>
                    </div>
                </div>

                <Button
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-3"
                    onClick={logout}
                >
                    <LogOut className="w-4 h-4" />
                    Logout
                </Button>
            </div>
        </aside>
    );
}
