import { Calendar, MapPin, Users, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../ui/Button";

const StudentEventCard = ({ event }) => {
    const { id, title, startAt, venue, registeredCount = 0, capacity = 0 } = event;

    // Format Date & Time
    const eventDate = startAt?.toDate ? startAt.toDate() : new Date(startAt);

    // Check if date is valid
    const isValidDate = !isNaN(eventDate.getTime());

    const dateStr = isValidDate
        ? eventDate.toLocaleDateString("en-US", {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        })
        : "Date TBD";

    const timeStr = isValidDate
        ? eventDate.toLocaleTimeString("en-US", {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        })
        : "";

    // Calculate seats filled percentage
    const fillPercentage = capacity > 0 ? Math.min((registeredCount / capacity) * 100, 100) : 0;
    const isFull = registeredCount >= capacity;

    return (
        <div className="group relative bg-card hover:bg-accent/5 transition-all duration-300 border border-border/50 rounded-xl overflow-hidden hover:shadow-lg hover:shadow-primary/5 flex flex-col h-full">
            {/* Top decorative bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-primary/80 to-primary/40" />

            <div className="p-5 flex flex-col flex-grow">
                {/* Date Badge */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-secondary/50 px-2.5 py-1 rounded-md">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{dateStr} • {timeStr}</span>
                    </div>
                    {isFull && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-destructive/10 text-destructive uppercase tracking-wider">
                            Full
                        </span>
                    )}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold tracking-tight text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {title}
                </h3>

                {/* Venue */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span className="truncate">{venue}</span>
                </div>

                <div className="mt-auto space-y-4">
                    {/* Capacity Indicator */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5" />
                                <span>{registeredCount} / {capacity} registered</span>
                            </span>
                            <span className="font-medium">{Math.round(fillPercentage)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-destructive' : 'bg-primary'
                                    }`}
                                style={{ width: `${fillPercentage}%` }}
                            />
                        </div>
                    </div>

                    {/* Action Button */}
                    <Button asChild className="w-full justify-between group/btn bg-background text-foreground hover:text-primary-foreground hover:bg-primary border border-input hover:border-primary transition-all duration-300 shadow-sm">
                        <Link to={`/event/${id}`}>
                            <span className="font-medium">View Details</span>
                            <ArrowRight className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default StudentEventCard;
