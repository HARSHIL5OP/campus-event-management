import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { toast } from "sonner";
import { Loader2, CalendarPlus, MapPin, Users, Calendar, AlignLeft, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const CreateEvent = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        venue: "",
        startAt: "",
        capacity: "",
        isPublished: true
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.title || !formData.description || !formData.venue || !formData.startAt || !formData.capacity) {
            toast.error("Please fill in all required fields.");
            return;
        }

        if (parseInt(formData.capacity) <= 0) {
            toast.error("Capacity must be greater than 0.");
            return;
        }

        setLoading(true);

        try {
            // Create the event object matching the spec
            const eventData = {
                title: formData.title,
                description: formData.description,
                venue: formData.venue,
                startAt: Timestamp.fromDate(new Date(formData.startAt)),
                capacity: parseInt(formData.capacity),
                organizerId: user.uid,
                registeredCount: 0,
                isPublished: formData.isPublished,
                createdAt: Timestamp.now()
            };

            await addDoc(collection(db, "events"), eventData);

            toast.success("Event created successfully");

            // Navigate or reset? Requirement says redirect to dashboard is optional content-wise
            // Since we don't have a dashboard yet, let's redirect to home or stay here with reset form
            // Redirecting to home for now as a safe fallback
            setTimeout(() => navigate("/home"), 1500);

        } catch (error) {
            console.error("Error creating event:", error);
            toast.error("Failed to create event. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background p-6 md:p-12 lg:p-16">
            <div className="max-w-3xl mx-auto space-y-8">

                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                >
                    <div className="flex items-center gap-3 text-primary mb-2">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <CalendarPlus className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-semibold tracking-wider uppercase text-primary/80">Organizer Portal</span>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-foreground">Create New Event</h1>
                    <p className="text-lg text-muted-foreground">
                        Plan your next campus hit. Fill in the details below to launch your event.
                    </p>
                </motion.div>

                {/* Form Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden"
                >
                    <div className="h-1 bg-gradient-to-r from-primary to-accent w-full" />

                    <form onSubmit={handleSubmit} className="p-8 space-y-8">

                        {/* Title & Venue */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2.5">
                                <Label htmlFor="title" className="text-base font-medium flex items-center gap-2">
                                    Event Title <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="title"
                                    name="title"
                                    placeholder="e.g. Annual Tech Symposium 2026"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="bg-background/50 h-12 text-base focus:ring-2 ring-primary/20 transition-all"
                                    required
                                />
                            </div>

                            <div className="space-y-2.5">
                                <Label htmlFor="venue" className="text-base font-medium flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-muted-foreground" />
                                    Venue <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="venue"
                                    name="venue"
                                    placeholder="e.g. Main Auditorium"
                                    value={formData.venue}
                                    onChange={handleChange}
                                    className="bg-background/50 h-12 text-base focus:ring-2 ring-primary/20 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2.5">
                            <Label htmlFor="description" className="text-base font-medium flex items-center gap-2">
                                <AlignLeft className="w-4 h-4 text-muted-foreground" />
                                Description <span className="text-destructive">*</span>
                            </Label>
                            <textarea
                                id="description"
                                name="description"
                                rows={5}
                                placeholder="Describe expectations, agenda, and speakers..."
                                value={formData.description}
                                onChange={handleChange}
                                className="flex w-full rounded-md border border-input bg-background/50 px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y min-h-[120px]"
                                required
                            />
                        </div>

                        {/* Date & Capacity */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2.5">
                                <Label htmlFor="startAt" className="text-base font-medium flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                    Date & Time <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="startAt"
                                    name="startAt"
                                    type="datetime-local"
                                    value={formData.startAt}
                                    onChange={handleChange}
                                    className="bg-background/50 h-12 text-base block w-full"
                                    required
                                />
                            </div>

                            <div className="space-y-2.5">
                                <Label htmlFor="capacity" className="text-base font-medium flex items-center gap-2">
                                    <Users className="w-4 h-4 text-muted-foreground" />
                                    Capacity <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="capacity"
                                    name="capacity"
                                    type="number"
                                    min="1"
                                    placeholder="e.g. 200"
                                    value={formData.capacity}
                                    onChange={handleChange}
                                    className="bg-background/50 h-12 text-base"
                                    required
                                />
                            </div>
                        </div>

                        {/* Publish Toggle */}
                        <div className="flex items-center space-x-3 p-4 bg-secondary/20 rounded-lg border border-border/50">
                            <input
                                type="checkbox"
                                id="isPublished"
                                name="isPublished"
                                checked={formData.isPublished}
                                onChange={handleChange}
                                className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <div className="space-y-0.5">
                                <Label htmlFor="isPublished" className="text-base font-medium cursor-pointer">
                                    Publish Immediately
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    If unchecked, event will be saved as a draft.
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-4 flex items-center justify-end gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate("/home")}
                                className="h-12 px-6"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="h-12 px-8 text-base shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40 hover:-translate-y-0.5"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Creating Event...
                                    </>
                                ) : (
                                    <>
                                        <Send className="mr-2 h-5 w-5" />
                                        Launch Event
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default CreateEvent;
