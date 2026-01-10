import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff, Loader2, ArrowRight, Github } from "lucide-react"
import { useState } from "react"
import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"
import { Label } from "../../components/ui/Label"
import { useAuth } from "../../contexts/AuthContext"
import { toast } from "sonner"

const Login = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const navigate = useNavigate()
    const { login, loginWithGoogle, loginWithGithub } = useAuth()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            await login(email, password)
            toast.success("Login successful")
            navigate("/home")
        } catch (error) {
            console.error(error)
            // Clean up firebase error messages
            const errorMessage = error.message.replace('Firebase: ', '').replace('Error (auth/', '').replace(').', '').replace(/-/g, ' ');
            toast.error(errorMessage.charAt(0).toUpperCase() + errorMessage.slice(1))
        } finally {
            setIsLoading(false)
        }
    }

    const handleGoogleLogin = async () => {
        try {
            await loginWithGoogle()
            toast.success("Login successful")
            navigate("/home")
        } catch (error) {
            console.error(error)
            const errorMessage = error.message.replace('Firebase: ', '').replace('Error (auth/', '').replace(').', '').replace(/-/g, ' ');
            toast.error(errorMessage.charAt(0).toUpperCase() + errorMessage.slice(1))
        }
    }

    const handleGithubLogin = async () => {
        try {
            await loginWithGithub()
            toast.success("Login successful")
            navigate("/home")
        } catch (error) {
            console.error(error)
            const errorMessage = error.message.replace('Firebase: ', '').replace('Error (auth/', '').replace(').', '').replace(/-/g, ' ');
            toast.error(errorMessage.charAt(0).toUpperCase() + errorMessage.slice(1))
        }
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2 text-center">
                <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
                <p className="text-sm text-muted-foreground">
                    Enter your email to sign in to your account
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        placeholder="name@example.com"
                        type="email"
                        required
                        autoFocus
                        autoComplete="email"
                        className="bg-background/50"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <Link
                            to="/forgot-password"
                            className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                        >
                            Forgot password?
                        </Link>
                    </div>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            required
                            autoComplete="current-password"
                            className="bg-background/50 pr-10"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                            ) : (
                                <Eye className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        id="remember"
                        className="h-4 w-4 rounded border-input bg-transparent text-primary shadow-sm focus-visible:ring-1 focus-visible:ring-ring transition-all"
                    />
                    <label
                        htmlFor="remember"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground"
                    >
                        Remember me for 30 days
                    </label>
                </div>

                <Button className="w-full flex items-center gap-2 group" type="submit" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Signing in...
                        </>
                    ) : (
                        <>
                            Sign In
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </Button>
            </form>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="w-full" type="button" onClick={handleGithubLogin}>
                    <Github className="mr-2 h-4 w-4" />
                    GitHub
                </Button>
                <Button variant="outline" className="w-full" type="button" onClick={handleGoogleLogin}>
                    <div className="mr-2 h-4 w-4 flex items-center justify-center font-bold">G</div>
                    Google
                </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/register" className="font-semibold text-primary hover:text-primary/80 underline-offset-4 hover:underline transition-colors">
                    Sign up
                </Link>
            </div>
        </div>
    )
}

export default Login
