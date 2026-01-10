import { Link, useNavigate } from "react-router-dom"
import { Loader2, ArrowRight, Check } from "lucide-react"
import { useState } from "react"
import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"
import { Label } from "../../components/ui/Label"
import { useAuth } from "../../contexts/AuthContext"
import { toast } from "sonner"
import { cn } from "../../lib/utils"

const Register = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [email, setEmail] = useState("")
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [typing, setTyping] = useState(false)

    const { signup } = useAuth()
    const navigate = useNavigate()

    // Visual password strength indicator logic
    const hasMinLength = password.length >= 8
    const hasNumber = /\d/.test(password)
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    // Calculate strength score 0-3
    const strength = [hasMinLength, hasNumber, hasSpecial].filter(Boolean).length

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            toast.error("Passwords do not match")
            return
        }

        setIsLoading(true)
        try {
            await signup(email, password, { firstName, lastName })
            toast.success("Account created successfully")
            setTimeout(() => {
                navigate("/login")
            }, 2000)
        } catch (error) {
            console.error(error)
            // Clean up firebase error messages
            const errorMessage = error.message.replace('Firebase: ', '').replace('Error (auth/', '').replace(').', '').replace(/-/g, ' ');
            toast.error(errorMessage.charAt(0).toUpperCase() + errorMessage.slice(1))
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2 text-center">
                <h2 className="text-3xl font-bold tracking-tight">Create an account</h2>
                <p className="text-sm text-muted-foreground">
                    Join the campus community today
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="firstName">First name</Label>
                        <Input
                            id="firstName"
                            placeholder="John"
                            required
                            className="bg-background/50"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lastName">Last name</Label>
                        <Input
                            id="lastName"
                            placeholder="Doe"
                            required
                            className="bg-background/50"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="john.doe@university.edu"
                        required
                        className="bg-background/50"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value)
                            setTyping(true)
                        }}
                        placeholder="Create a password"
                        required
                        className="bg-background/50"
                    />

                    {/* Password Strength Visualization */}
                    {typing && (
                        <div className="space-y-2 pt-1 transition-all">
                            <div className="flex gap-1 h-1">
                                <div className={cn("flex-1 rounded-full transition-all duration-300", strength >= 0 ? (strength >= 1 ? "bg-red-500" : "bg-muted") : "bg-muted")} />
                                <div className={cn("flex-1 rounded-full transition-all duration-300", strength >= 2 ? "bg-yellow-500" : "bg-muted")} />
                                <div className={cn("flex-1 rounded-full transition-all duration-300", strength >= 3 ? "bg-green-500" : "bg-muted")} />
                            </div>
                            <ul className="grid grid-cols-2 text-xs text-muted-foreground gap-1">
                                <li className={cn("flex items-center gap-1", hasMinLength && "text-green-500")}>
                                    {hasMinLength ? <Check className="w-3 h-3" /> : <div className="w-1 h-1 rounded-full bg-muted-foreground/30 mx-1" />}
                                    Min 8 chars
                                </li>
                                <li className={cn("flex items-center gap-1", hasNumber && "text-green-500")}>
                                    {hasNumber ? <Check className="w-3 h-3" /> : <div className="w-1 h-1 rounded-full bg-muted-foreground/30 mx-1" />}
                                    1 Number
                                </li>
                                <li className={cn("flex items-center gap-1", hasSpecial && "text-green-500")}>
                                    {hasSpecial ? <Check className="w-3 h-3" /> : <div className="w-1 h-1 rounded-full bg-muted-foreground/30 mx-1" />}
                                    1 Special char
                                </li>
                            </ul>
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm your password"
                        required
                        className="bg-background/50"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </div>

                <div className="flex items-start space-x-2 pt-2">
                    <input
                        type="checkbox"
                        id="terms"
                        required
                        className="mt-1 h-4 w-4 rounded border-input bg-transparent text-primary shadow-sm focus-visible:ring-1 focus-visible:ring-ring"
                    />
                    <label
                        htmlFor="terms"
                        className="text-xs text-muted-foreground leading-snug"
                    >
                        I agree to the <Link to="#" className="text-primary hover:underline">Terms of Service</Link> and <Link to="#" className="text-primary hover:underline">Privacy Policy</Link>.
                    </label>
                </div>

                <Button className="w-full flex items-center gap-2" type="submit" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating account...
                        </>
                    ) : (
                        <>
                            Create Account
                            <ArrowRight className="h-4 w-4" />
                        </>
                    )}
                </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="font-semibold text-primary hover:text-primary/80 underline-offset-4 hover:underline transition-colors">
                    Sign in
                </Link>
            </div>
        </div>
    )
}

export default Register
