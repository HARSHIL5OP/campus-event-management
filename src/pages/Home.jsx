
import { useAuth } from "../contexts/AuthContext"
import { Button } from "../components/ui/Button"

const Home = () => {
    const { user, logout } = useAuth()

    return (
        <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
            <h1 className="text-4xl font-bold">Hello World</h1>
            <p className="text-muted-foreground">Logged in as: {user?.email}</p>
            <Button onClick={() => logout()}>Logout</Button>
        </div>
    )
}

export default Home
