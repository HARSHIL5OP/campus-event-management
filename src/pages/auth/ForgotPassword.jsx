import { Link } from "react-router-dom"
import { Loader2, ArrowLeft, MailCheck } from "lucide-react"
import { useState } from "react"
import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"
import { Label } from "../../components/ui/Label"
import { motion } from "framer-motion"
import { useAuth } from "../../contexts/AuthContext"
import { toast } from "sonner"

const ForgotPassword = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [email, setEmail] = useState("")
    const { resetPassword } = useAuth()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            await resetPassword(email)
            setIsSubmitted(true)
            toast.success("Password reset link sent")
        } catch (error) {
            console.error(error)
            const errorMessage = error.message.replace('Firebase: ', '').replace('Error (auth/', '').replace(').', '').replace(/-/g, ' ');
            toast.error(errorMessage.charAt(0).toUpperCase() + errorMessage.slice(1))
        } finally {
            setIsLoading(false)
        }
    }

    if (isSubmitted) {
        return (
            <div className="space-y-6 text-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4"
                >
                    <MailCheck className="h-8 w-8 text-primary" />
                </motion.div>
                <div className="space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Check your email</h2>
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                        We have sent a password reset link to your email address.
                    </p>
                </div>
                <div className="pt-4">
                    <Button variant="outline" asChild className="w-full">
                        <Link to="/login">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to log in
                        </Link>
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                    Didn't receive the email? <button className="text-primary hover:underline" onClick={() => setIsSubmitted(false)}>Click to resend</button>
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Link
                    to="/login"
                    className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Link>
                <h2 className="text-3xl font-bold tracking-tight">Forgot password?</h2>
                <p className="text-sm text-muted-foreground">
                    No worries, we'll send you reset instructions.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        required
                        autoFocus
                        className="bg-background/50"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <Button className="w-full" type="submit" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending link...
                        </>
                    ) : (
                        "Reset Password"
                    )}
                </Button>
            </form>
        </div>
    )
}

export default ForgotPassword
