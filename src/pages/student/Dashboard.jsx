import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Calendar,
    ArrowRight,
    TrendingUp,
    ShieldCheck,
    Sparkles,
    PartyPopper
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../../components/ui/Button";


// Since I am not sure if shadcn/ui dialog components exist in the user's project, 
// I will implement a custom simple modal for the confirmation to be safe and self-contained.

export default function StudentDashboard() {
    const { userProfile, upgradeToOrganizer } = useAuth();
    const navigate = useNavigate();
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const [isUpgrading, setIsUpgrading] = useState(false);

    const handleUpgrade = async () => {
        setIsUpgrading(true);
        try {
            await upgradeToOrganizer();
            setIsUpgradeModalOpen(false);

            toast.success("Welcome to the team!", {
                description: "You have been successfully upgraded to an Organizer.",
                duration: 4000,
                icon: <PartyPopper className="w-5 h-5 text-green-500" />
            });

            // Small delay for the user to see the success message before redirection/UI update takes effect
            setTimeout(() => {
                navigate("/organizer/dashboard");
            }, 1000);

        } catch (error) {
            toast.error("Something went wrong", {
                description: "Failed to upgrade account. Please try again."
            });
        } finally {
            setIsUpgrading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                        Welcome back, {userProfile?.firstName}! 👋
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Here's what's happening on campus today.
                    </p>
                </div>
                <Button asChild className="hidden md:flex">
                    <Link to="/events">
                        Browse Events
                        <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                </Button>
            </header>

            {/* Quick Stats / Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-500/5 border border-violet-500/20 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 rounded-xl bg-violet-500/20 text-violet-600">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Upcoming Events</p>
                            <h3 className="text-2xl font-bold">12</h3>
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        <span className="text-green-600 font-medium">+2</span> new this week
                    </p>
                </div>

                {/* Placeholder for Registered Events */}
                <div className="p-6 rounded-2xl bg-card border border-border shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">My Registrations</p>
                            <h3 className="text-2xl font-bold">0</h3>
                        </div>
                    </div>
                </div>

                {/* Become Organizer CTA Card */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 shadow-sm relative overflow-hidden group hover:shadow-md transition-all cursor-pointer"
                    onClick={() => setIsUpgradeModalOpen(true)}>
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <ShieldCheck className="w-24 h-24 rotate-12" />
                    </div>

                    <div className="flex items-center gap-4 mb-4 relative z-10">
                        <div className="p-3 rounded-xl bg-amber-500/20 text-amber-600">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-amber-700 dark:text-amber-500">Want to host?</p>
                            <h3 className="text-xl font-bold">Become an Organizer</h3>
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground relative z-10 mb-3">
                        Create events, manage attendees, and lead the campus community.
                    </p>
                    <div className="flex items-center text-sm font-medium text-amber-600 group-hover:underline">
                        Apply Now <ArrowRight className="ml-1 w-4 h-4" />
                    </div>
                </div>
            </div>

            {/* Recent Events List Preview (Mock for now, or link to Browse) */}
            <div className="p-6 rounded-2xl bg-card border border-border shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold">Recommended For You</h2>
                    <Link to="/events" className="text-sm text-primary hover:underline">View All</Link>
                </div>

                <div className="text-center py-10 text-muted-foreground bg-muted/30 rounded-xl border border-dashed">
                    <Calendar className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p>Head over to the <Link to="/events" className="text-primary hover:underline">Events Page</Link> to discover what's happening!</p>
                </div>
            </div>

            {/* Custom Modal Implementation */}
            {isUpgradeModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-background border border-border w-full max-w-md p-6 rounded-2xl shadow-xl scale-100 animate-in zoom-in-95 duration-200 m-4">
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="h-16 w-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-4">
                                <ShieldCheck className="w-8 h-8 text-amber-600 dark:text-amber-500" />
                            </div>
                            <h2 className="text-xl font-bold">Become an Organizer?</h2>
                            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                                As an organizer, you'll gain the ability to create and manage your own events.
                                <br /><br />
                                <strong>Note:</strong> In a real-world scenario, this would require admin approval. For this demo, you'll be approved instantly!
                            </p>
                        </div>

                        <div className="flex gap-3 justify-end">
                            <Button variant="outline" onClick={() => setIsUpgradeModalOpen(false)} disabled={isUpgrading}>
                                Cancel
                            </Button>
                            <Button onClick={handleUpgrade} disabled={isUpgrading} className="bg-amber-600 hover:bg-amber-700 text-white">
                                {isUpgrading ? "Upgrading..." : "Yes, Upgrade Me"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
