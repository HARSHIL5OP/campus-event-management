import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc, collection, query, where, getDocs, runTransaction, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../../components/ui/Button";
import { toast } from "sonner";
import {
    Loader2,
    Calendar,
    MapPin,
    Users,
    ArrowLeft,
    Share2,
    Info,
    CheckCircle2,
    AlertCircle
} from "lucide-react";
import confetti from "canvas-confetti";

const EventDetails = () => {
    const { id } = useParams();
    const { user, userProfile } = useAuth();

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);
    const [error, setError] = useState(null);

    // Fetch Event & Registration Status
    useEffect(() => {
        const fetchEventAndStatus = async () => {
            setLoading(true);
            try {
                // 1. Fetch Event Details
                const eventRef = doc(db, "events", id);
                const eventSnap = await getDoc(eventRef);

                if (!eventSnap.exists()) {
                    setError("Event not found");
                    return;
                }

                setEvent({ id: eventSnap.id, ...eventSnap.data() });

                // 2. Check Registration Status (Only for Students)
                if (user && userProfile?.role === "student") {
                    // Check if a registration doc exists with ID = user.uid in the subcollection
                    // This is the most efficient way if we use user.uid as doc ID
                    // But let me check if we can assume doc ID is user ID. 
                    // The prompt says "Check if registration already exists: events/{eventId}/registrations where studentId == current user uid"
                    // So we should query by field to be safe according to requirements, or check specific doc if we implement it that way.
                    // I will implement using user.uid as the document ID for the registration to ensure uniqueness effortlessly.
                    // But for reading existing status as per "where studentId == uid" instruction:

                    const registrationsRef = collection(db, "events", id, "registrations");
                    const q = query(registrationsRef, where("studentId", "==", user.uid));
                    const snapshot = await getDocs(q);

                    if (!snapshot.empty) {
                        setIsRegistered(true);
                    }
                }

            } catch (err) {
                console.error("Error fetching event details:", err);
                setError("Failed to load event details.");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchEventAndStatus();
        }
    }, [id, user, userProfile]);

    const handleRegister = async () => {
        if (!user || userProfile?.role !== "student") return;

        setRegistering(true);
        try {
            await runTransaction(db, async (transaction) => {
                const eventRef = doc(db, "events", id);
                const eventDoc = await transaction.get(eventRef);

                if (!eventDoc.exists()) {
                    throw "Event does not exist!";
                }

                const eventData = eventDoc.data();

                // Re-check capacity
                if (eventData.registeredCount >= eventData.capacity) {
                    throw "Event is fully booked!";
                }

                // Check for existing registration in transaction (Double Check)
                // We use user.uid as the document ID for the registration to guarantee uniqueness at the DB level
                const registrationRef = doc(db, "events", id, "registrations", user.uid);
                const registrationDoc = await transaction.get(registrationRef);

                if (registrationDoc.exists()) {
                    throw "You are already registered for this event.";
                }

                // Create Registration
                transaction.set(registrationRef, {
                    studentId: user.uid,
                    name: `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim() || user.email,
                    email: user.email,
                    createdAt: serverTimestamp()
                });

                // Increment Count
                transaction.update(eventRef, {
                    registeredCount: eventData.registeredCount + 1
                });
            });

            // Success UI
            setIsRegistered(true);
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
            toast.success("Successfully registered for the event!");

        } catch (err) {
            console.error("Registration failed:", err);
            // Handle specific string errors thrown above or generic Firebase errors
            const message = typeof err === 'string' ? err : "Registration failed. Please try again.";
            toast.error(message);
        } finally {
            setRegistering(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
                <Info className="w-12 h-12 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold text-foreground">Event Not Found</h2>
                <p className="text-muted-foreground mt-2 mb-6">{error || "The event you are looking for does not exist or has been removed."}</p>
                <Button asChild variant="outline">
                    <Link to="/events">Browse Events</Link>
                </Button>
            </div>
        );
    }

    // Derived State
    const eventDate = event.startAt?.toDate ? event.startAt.toDate() : new Date(event.startAt);
    const dateStr = eventDate.toLocaleDateString("en-US", { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    const timeStr = eventDate.toLocaleTimeString("en-US", { hour: 'numeric', minute: '2-digit', hour12: true });

    const percentageFilled = Math.round((event.registeredCount / event.capacity) * 100);
    const isFull = event.registeredCount >= event.capacity;
    const isStudent = userProfile?.role === "student";

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Navigation Bar */}
            <div className="border-b border-border/40 sticky top-0 bg-background/80 backdrop-blur-md z-10">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link to="/events" className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Events
                    </Link>
                    <div className="flex items-center gap-2">
                        {/* Placeholder for future share functionality */}
                        <Button variant="ghost" size="icon" className="text-muted-foreground">
                            <Share2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <div className="grid md:grid-cols-3 gap-8 lg:gap-12">

                    {/* Main Content (Left 2 cols) */}
                    <div className="md:col-span-2 space-y-8">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                                <Calendar className="w-4 h-4" />
                                <span>{dateStr}</span>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-4 leading-tight">
                                {event.title}
                            </h1>
                            <div className="flex items-center text-muted-foreground gap-2 text-lg">
                                <MapPin className="w-5 h-5 shrink-0" />
                                <span>{event.venue}</span>
                            </div>
                        </div>

                        <div className="prose prose-blue prose-lg dark:prose-invert max-w-none text-muted-foreground/90 leading-relaxed">
                            <h3 className="text-foreground font-semibold text-xl mb-3">About this Event</h3>
                            <p className="whitespace-pre-wrap">{event.description}</p>
                        </div>
                    </div>

                    {/* Sidebar Action Card (Right 1 col) */}
                    <div className="relative">
                        <div className="sticky top-24 space-y-6">
                            <div className="bg-card border border-border/50 rounded-2xl shadow-sm p-6 space-y-6">
                                <div>
                                    <h3 className="font-semibold text-foreground mb-4">Event Details</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 text-muted-foreground">
                                            <div className="p-2 bg-secondary/50 rounded-md">
                                                <Calendar className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70">Date</p>
                                                <p className="text-sm font-medium text-foreground">{dateStr}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-muted-foreground">
                                            <div className="p-2 bg-secondary/50 rounded-md">
                                                <div className="w-5 h-5 flex items-center justify-center font-bold text-primary text-xs">AM</div>
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70">Time</p>
                                                <p className="text-sm font-medium text-foreground">{timeStr}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-muted-foreground">
                                            <div className="p-2 bg-secondary/50 rounded-md">
                                                <Users className="w-5 h-5 text-primary" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-center mb-1.5">
                                                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70">Availability</p>
                                                    <span className={`text-xs font-bold ${isFull ? "text-destructive" : "text-primary"}`}>
                                                        {isFull ? "Full" : `${event.capacity - event.registeredCount} seats left`}
                                                    </span>
                                                </div>
                                                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full transition-all duration-500 rounded-full ${isFull ? "bg-destructive" : "bg-primary"}`}
                                                        style={{ width: `${percentageFilled}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-border/50">
                                    {isStudent ? (
                                        <>
                                            {isRegistered ? (
                                                <Button className="w-full bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20 cursor-default h-12 text-base shadow-none">
                                                    <CheckCircle2 className="w-5 h-5 mr-2" />
                                                    Registered
                                                </Button>
                                            ) : isFull ? (
                                                <Button disabled className="w-full h-12 text-base">
                                                    Event Full
                                                </Button>
                                            ) : (
                                                <Button
                                                    onClick={handleRegister}
                                                    disabled={registering}
                                                    className="w-full h-12 text-base shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
                                                >
                                                    {registering ? (
                                                        <>
                                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                            Registering...
                                                        </>
                                                    ) : (
                                                        "Register Now"
                                                    )}
                                                </Button>
                                            )}
                                            {isRegistered && (
                                                <p className="text-xs text-center text-muted-foreground mt-3">
                                                    You're all set! We've sent a confirmation to your email.
                                                </p>
                                            )}
                                        </>
                                    ) : (
                                        <div className="bg-secondary/30 rounded-lg p-4 flex items-start gap-3">
                                            <AlertCircle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                                            <p className="text-sm text-muted-foreground">
                                                Based on your role as <strong>{userProfile?.role}</strong>, you cannot register specifically for this event.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default EventDetails;
