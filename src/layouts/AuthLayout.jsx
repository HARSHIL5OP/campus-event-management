import { Outlet, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, CalendarRange } from "lucide-react"

const AuthLayout = () => {
    const location = useLocation()

    return (
        <div className="flex min-h-screen w-full bg-background text-foreground overflow-hidden font-sans">
            {/* Left Panel - Visuals */}
            <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-black/10">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/20 rounded-full blur-[100px]" />
                    <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] bg-secondary/30 rounded-full blur-[80px]" />
                    <div className="absolute inset-0 bg-noise opacity-[0.03]" /> {/* Noise overlay if we had one, simplified for now */}
                </div>

                {/* Branding */}
                <div className="relative z-10 flex items-center space-x-3">
                    <div className="h-10 w-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                        <CalendarRange className="text-white h-6 w-6" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">CampusEvent</span>
                </div>

                <div className="relative z-10 max-w-lg">
                    <h1 className="text-4xl font-bold tracking-tight mb-4 leading-tight">
                        Manage your campus <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">events</span> like a pro.
                    </h1>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        Organize, track, and engage. The all-in-one platform for student communities.
                    </p>
                </div>

                <div className="relative z-10">
                    <div className="flex items-center space-x-4 p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 max-w-sm">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 flex items-center justify-center shrink-0">
                            <Sparkles className="text-white h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">Coming soon</p>
                            <p className="text-xs text-muted-foreground">AI-powered scheduling assistant</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel - Form Content */}
            <div className="flex-1 flex flex-col relative bg-card">
                {/* Mobile Header */}
                <div className="lg:hidden p-6 pb-0 flex items-center space-x-2">
                    <div className="h-8 w-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                        <CalendarRange className="text-white h-4 w-4" />
                    </div>
                    <span className="text-lg font-bold">CampusEvent</span>
                </div>

                <div className="flex-1 flex items-center justify-center p-4 sm:p-12 md:p-20 relative">
                    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2" />
                    </div>

                    <div className="w-full max-w-md space-y-8 relative z-10">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={location.pathname}
                                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -20, scale: 0.98 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className="w-full"
                            >
                                <Outlet />
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                <div className="p-6 text-center text-xs text-muted-foreground">
                    &copy; 2026 Campus Event Management. All rights reserved.
                </div>
            </div>
        </div>
    )
}

export default AuthLayout
