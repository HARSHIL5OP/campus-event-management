import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Loader2, ShieldAlert } from "lucide-react";
import { Button } from "../ui/Button";
import { Link } from "react-router-dom";

const OrganizerRoute = () => {
    const { user, userProfile, loading } = useAuth();

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    // Double check both auth and profile role
    if (!user || !userProfile) {
        return <Navigate to="/login" replace />;
    }

    if (userProfile.role !== "organizer") {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-background p-4 text-center">
                <div className="h-20 w-20 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
                    <ShieldAlert className="w-10 h-10 text-destructive" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Access Restricted</h1>
                <p className="text-muted-foreground max-w-md mb-8">
                    This page is reserved for event organizers only. Your current role is
                    <span className="font-semibold text-foreground"> "{userProfile.role}"</span>.
                </p>
                <div className="flex gap-4">
                    <Button asChild variant="outline">
                        <Link to="/home">Return Home</Link>
                    </Button>
                    {/* Optional: Add a button to request organizer access if that feature existed */}
                </div>
            </div>
        );
    }

    return <Outlet />;
};

export default OrganizerRoute;
