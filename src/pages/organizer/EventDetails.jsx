import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { doc, getDoc, collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../../components/ui/Button";
import {
    Calendar,
    MapPin,
    Users,
    Clock,
    ArrowLeft,
    Loader2,
    ShieldAlert,
    UserCheck,
    Download
} from "lucide-react";
import { format } from "date-fns";

export default function OrganizerEventDetails() {
    // 1️⃣ VERIFY ROUTE PARAM: strictly matching App.jsx (:eventId)
    const { eventId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [event, setEvent] = useState(null);
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Initial Event Fetch & Auth Check
    useEffect(() => {
        const fetchEventDetails = async () => {
            console.log("📍 [OrganizerEventDetails] Params check:", { eventId, userId: user?.uid });

            if (!user || !eventId) return;
            // Only set loading true if we haven't loaded the event yet
            if (!event) setLoading(true);

            try {
                // 1. Fetch Event Document
                const eventDocRef = doc(db, "events", eventId);
                const eventDoc = await getDoc(eventDocRef);

                if (!eventDoc.exists()) {
                    console.error("❌ [OrganizerEventDetails] Event not found:", eventId);
                    setError("Event not found");
                    setLoading(false);
                    return;
                }

                const eventData = eventDoc.data();
                console.log("✅ [OrganizerEventDetails] Event loaded:", eventData.title);

                // 2. Authorization Check
                if (eventData.organizerId !== user.uid) {
                    console.warn("⛔ [OrganizerEventDetails] Unauthorized access attempt");
                    setError("Unauthorized access");
                    setLoading(false);
                    return;
                }

                // Set event data
                setEvent({ id: eventDoc.id, ...eventData });
                setLoading(false);

            } catch (err) {
                console.error("❌ [OrganizerEventDetails] Error loading event details:", err);
                setError("Failed to load event details.");
                setLoading(false);
            }
        };

        fetchEventDetails();
    }, [eventId, user]);

    // Separate effect for registrations using REAL-TIME LISTENER
    // 3️⃣ CORRECT DATA FLOW: Wait for event validation, then attach listener
    useEffect(() => {
        // Guard: Wait for event to be fully loaded/validated to avoid permission errors
        if (!event || !eventId) return;

        console.log("🔄 [OrganizerEventDetails] Setting up registration listener for path:", `events/${eventId}/registrations`);

        // 2️⃣ VERIFY COLLECTION REFERENCE: Using eventId from params directly (though validated via event existence)
        const registrationsRef = collection(db, "events", eventId, "registrations");

        // Use a query with ordering if possible
        const q = query(registrationsRef, orderBy("createdAt", "desc"));

        // 4️⃣ USE onSnapshot ON THE CORRECT PATH
        const unsubscribe = onSnapshot(q, (snapshot) => {
            console.log(`📦 [OrganizerEventDetails] Real-time update. Docs found: ${snapshot.docs.length}`);

            const regs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setRegistrations(regs);
        }, (error) => {
            console.warn("⚠️ [OrganizerEventDetails] Snapshot primary order failed (index missing?), using fallback:", error);

            // Fallback listener without server-side ordering
            if (error.code === 'failed-precondition' || error.message.includes('index')) {
                // We can't cleanly replace the specific unsubscribe variable here due to scope,
                // but we can start a new unmanaged one or just accept the client sort pattern for dev.
                // For robustness, we will try the safe simple query:

                // Note: In a real prod app, you should create the index. 
                // For this project, we handle gracefully.
                onSnapshot(registrationsRef, (fallbackSnap) => {
                    const regs = fallbackSnap.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));

                    // Client-side sort
                    regs.sort((a, b) => {
                        const timeA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
                        const timeB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
                        return timeB - timeA;
                    });

                    console.log(`📦 [OrganizerEventDetails] Fallback update. Docs found: ${regs.length}`);
                    setRegistrations(regs);
                });
            }
        });

        // 5️⃣ CLEANUP
        return () => {
            console.log("🛑 [OrganizerEventDetails] Unsubscribing listener");
            unsubscribe();
        };
    }, [event, eventId]);

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
                <ShieldAlert className="w-12 h-12 text-destructive" />
                <h2 className="text-xl font-bold">{error === "Unauthorized access" ? "Access Denied" : "Error"}</h2>
                <p className="text-muted-foreground">{error === "Unauthorized access" ? "You do not have permission to view this event." : error}</p>
                <Button variant="outline" asChild>
                    <Link to="/organizer/events">Back to My Events</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Header Navigation */}
            <div>
                <Button variant="ghost" asChild className="pl-0 hover:pl-2 transition-all text-muted-foreground hover:text-foreground">
                    <Link to="/organizer/events">
                        <ArrowLeft className="mr-2 w-4 h-4" />
                        Back to My Events
                    </Link>
                </Button>
            </div>

            {/* Event Overview Card */}
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 md:p-8 space-y-6">
                    <div className="flex flex-col md:flex-row justify-between gap-4 md:items-start">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${event.isPublished
                                    ? "bg-green-500/10 text-green-600 border-green-500/20"
                                    : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                    }`}>
                                    {event.isPublished ? "Published" : "Draft"}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    Created {format(event.createdAt?.toDate ? event.createdAt.toDate() : new Date(), "MMM d, yyyy")}
                                </span>
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight">{event.title}</h1>
                        </div>

                        {/* Summary Stats for Header */}
                        <div className="flex gap-4 p-4 bg-muted/40 rounded-lg border border-border/50">
                            <div className="text-center">
                                <p className="text-xs font-medium text-muted-foreground uppercase">Registered</p>
                                <p className="text-2xl font-bold">{event.registeredCount || 0}</p>
                            </div>
                            <div className="w-px bg-border h-full mx-2" />
                            <div className="text-center">
                                <p className="text-xs font-medium text-muted-foreground uppercase">Capacity</p>
                                <p className="text-2xl font-bold text-muted-foreground">{event.capacity}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-border">
                        <div className="flex items-center gap-3 text-muted-foreground">
                            <Calendar className="w-5 h-5 text-primary" />
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70">Date</p>
                                <p className="font-medium text-foreground">
                                    {format(event.startAt?.toDate ? event.startAt.toDate() : new Date(), "PPP")}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-muted-foreground">
                            <Clock className="w-5 h-5 text-primary" />
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70">Time</p>
                                <p className="font-medium text-foreground">
                                    {format(event.startAt?.toDate ? event.startAt.toDate() : new Date(), "p")}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-muted-foreground">
                            <MapPin className="w-5 h-5 text-primary" />
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70">Venue</p>
                                <p className="font-medium text-foreground">{event.venue}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Registration Insights Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <UserCheck className="w-5 h-5 text-primary" />
                        Attendee List
                    </h2>
                    <Button variant="outline" size="sm" disabled={registrations.length === 0}>
                        <Download className="mr-2 w-4 h-4" />
                        Export CSV
                    </Button>
                </div>

                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                    {registrations.length === 0 ? (
                        <div className="p-12 text-center text-muted-foreground">
                            <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>No registrations yet.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                                    <tr>
                                        <th className="px-6 py-4 font-medium">Student Name</th>
                                        <th className="px-6 py-4 font-medium">Email</th>
                                        <th className="px-6 py-4 font-medium">Student ID</th>
                                        <th className="px-6 py-4 font-medium">Registered At</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {registrations.map((reg) => (
                                        <tr key={reg.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-6 py-4 font-medium text-foreground">
                                                {/* Fallbacks in case old records used different keys */}
                                                {reg.name || reg.userName || "Unknown"}
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground">
                                                {reg.email || reg.userEmail || "No Email"}
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground font-mono text-xs">
                                                {reg.studentId || reg.userId || "N/A"}
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground">
                                                {/* Handle both timestamp field names */}
                                                {(reg.createdAt?.toDate ? reg.createdAt.toDate() : (reg.registeredAt?.toDate ? reg.registeredAt.toDate() : null))
                                                    ? format(
                                                        reg.createdAt?.toDate ? reg.createdAt.toDate() : reg.registeredAt.toDate(),
                                                        "MMM d, yyyy • h:mm a"
                                                    )
                                                    : "N/A"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
