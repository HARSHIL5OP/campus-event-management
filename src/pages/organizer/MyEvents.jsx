import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    PlusCircle,
    Calendar,
    MapPin,
    Users,
    ArrowRight,
    Loader2,
    Clock
} from "lucide-react";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../../components/ui/Button";
import { format } from "date-fns";

export default function MyEvents() {
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMyEvents = async () => {
            if (!user) return;

            try {
                // Ensure we only fetch this organizer's events
                const eventsRef = collection(db, "events");
                const q = query(
                    eventsRef,
                    where("organizerId", "==", user.uid),
                    orderBy("startAt", "desc")
                );

                const querySnapshot = await getDocs(q);
                const eventsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setEvents(eventsData);
            } catch (err) {
                console.error("Error fetching my events:", err);
                // Fallback if index is missing for orderBy
                if (err.message.includes("index")) {
                    try {
                        const eventsRef = collection(db, "events");
                        const q = query(eventsRef, where("organizerId", "==", user.uid));
                        const querySnapshot = await getDocs(q);
                        const eventsData = querySnapshot.docs.map(doc => ({
                            id: doc.id,
                            ...doc.data()
                        }));
                        // Sort manually in client
                        eventsData.sort((a, b) => b.startAt.seconds - a.startAt.seconds);
                        setEvents(eventsData);
                    } catch (retryErr) {
                        setError("Failed to load your events. Please try again.");
                    }
                } else {
                    setError("Failed to load your events.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchMyEvents();
    }, [user]);

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center bg-destructive/10 rounded-xl border border-destructive/20">
                <p className="text-destructive font-semibold">{error}</p>
                <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                    Retry
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Events</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage events you have created.
                    </p>
                </div>
                <Button asChild>
                    <Link to="/organizer/events/create">
                        <PlusCircle className="mr-2 w-4 h-4" />
                        Create New Event
                    </Link>
                </Button>
            </div>

            {events.length === 0 ? (
                <div className="p-12 text-center border border-dashed rounded-xl bg-muted/30">
                    <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold">No events found</h3>
                    <p className="text-muted-foreground mb-6">You haven't created any events yet.</p>
                    <Button variant="outline" asChild>
                        <Link to="/organizer/events/create">Create your first event</Link>
                    </Button>
                </div>
            ) : (
                <div className="grid gap-6">
                    {events.map((event) => (
                        <div
                            key={event.id}
                            className="group flex flex-col md:flex-row gap-6 p-6 bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all"
                        >
                            {/* Date Box */}
                            <div className="flex-shrink-0 flex md:flex-col items-center justify-center w-full md:w-24 h-24 bg-primary/5 rounded-lg border border-primary/10 text-primary gap-1">
                                <span className="text-xs font-bold uppercase tracking-wider">
                                    {format(event.startAt.toDate(), "MMM")}
                                </span>
                                <span className="text-2xl font-bold">
                                    {format(event.startAt.toDate(), "d")}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {format(event.startAt.toDate(), "yyyy")}
                                </span>
                            </div>

                            {/* Event Info */}
                            <div className="flex-1 space-y-3">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                                            {event.title}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-4 h-4" />
                                                {format(event.startAt.toDate(), "h:mm a")}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="w-4 h-4" />
                                                {event.venue}
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${event.isPublished
                                            ? "bg-green-500/10 text-green-600 border-green-500/20"
                                            : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                        }`}>
                                        {event.isPublished ? "Published" : "Draft"}
                                    </span>
                                </div>

                                <div className="pt-2 border-t border-border/50 flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Users className="w-4 h-4 text-muted-foreground" />
                                        <span className="font-semibold">{event.registeredCount || 0}</span>
                                        <span className="text-muted-foreground">registered</span>
                                        <span className="text-muted-foreground/50 mx-1">•</span>
                                        <span className="text-muted-foreground">
                                            {(event.capacity - (event.registeredCount || 0))} seats left
                                        </span>
                                    </div>

                                    <Button variant="outline" size="sm" asChild className="group/btn">
                                        <Link to={`/organizer/events/${event.id}`}>
                                            Manage Event
                                            <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
