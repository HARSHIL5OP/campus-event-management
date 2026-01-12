import { useEffect, useState } from "react";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import StudentEventCard from "../../components/events/StudentEventCard";
import { Loader2, CalendarX2, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "../../components/ui/Button";

const EventListing = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchEvents = async () => {
        setLoading(true);
        setError(null);
        try {
            const eventsRef = collection(db, "events");
            // Query: isPublished == true, ordered by startAt
            const q = query(
                eventsRef,
                where("isPublished", "==", true),
                orderBy("startAt", "asc")
            );

            const querySnapshot = await getDocs(q);
            const eventsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setEvents(eventsData);
        } catch (err) {
            console.error("Error fetching events:", err);

            // Check for missing index error (common with compound queries)
            if (err.message && err.message.includes("index")) {
                setError("Missing Database Index. Open your browser console (F12) and click the link from Firebase to create it.");
            } else if (err.code === "permission-denied") {
                setError("Permission denied. Check your Firestore Security Rules.");
            } else {
                setError(`Error: ${err.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    // Container animation variants
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    if (loading) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Finding upcoming events...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
                <div className="bg-destructive/10 p-4 rounded-full mb-4">
                    <CalendarX2 className="w-8 h-8 text-destructive" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Oops! Something went wrong.</h3>
                <p className="text-muted-foreground max-w-md mb-6">{error}</p>
                <Button onClick={fetchEvents} className="gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
            {/* Header Section */}
            <header className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                    Discover Events
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl">
                    Browse and register for upcoming workshops, seminars, and campus activities.
                </p>
            </header>

            {/* Empty State */}
            {events.length === 0 ? (
                <div className="min-h-[50vh] flex flex-col items-center justify-center text-center border-2 border-dashed border-border/50 rounded-2xl p-8 bg-card/30">
                    <div className="bg-secondary/50 p-4 rounded-full mb-4">
                        <CalendarX2 className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No Upcoming Events</h3>
                    <p className="text-muted-foreground max-w-md">
                        There are no published events at the moment. Check back later!
                    </p>
                </div>
            ) : (
                /* Event Grid */
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {events.map((event) => (
                        <motion.div key={event.id} variants={item}>
                            <StudentEventCard event={event} />
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </div>
    );
};

export default EventListing;
