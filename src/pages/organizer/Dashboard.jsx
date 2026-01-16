import { Link } from "react-router-dom";
import {
    PlusCircle,
    Calendar,
    Users,
    BarChart3,
    ArrowRight
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../../components/ui/Button";

export default function OrganizerDashboard() {
    const { userProfile } = useAuth();

    // Mock stats
    const stats = [
        { label: "Total Events", value: "4", icon: Calendar, color: "text-blue-600", bg: "bg-blue-500/10" },
        { label: "Total Attendees", value: "128", icon: Users, color: "text-green-600", bg: "bg-green-500/10" },
        { label: "Upcoming", value: "2", icon: BarChart3, color: "text-violet-600", bg: "bg-violet-500/10" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Organizer Dashboard</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your events and track performance.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button asChild>
                        <Link to="/organizer/events/create">
                            <PlusCircle className="mr-2 w-4 h-4" />
                            Create New Event
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="p-6 rounded-2xl bg-card border border-border shadow-sm flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                            <h3 className="text-2xl font-bold">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Events / Management Section */}
            <div className="grid gap-6">
                <div className="p-6 rounded-2xl bg-card border border-border shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold">Your Recent Events</h2>
                        <Button variant="ghost" className="text-sm" asChild>
                            <Link to="/organizer/events">View All</Link>
                        </Button>
                    </div>

                    {/* Empty State / Call to Action */}
                    <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed border-border">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                            <PlusCircle className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">No events created yet?</h3>
                        <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                            Start building your first event to engage with the student community.
                        </p>
                        <Button asChild>
                            <Link to="/organizer/events/create">Create Event</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
