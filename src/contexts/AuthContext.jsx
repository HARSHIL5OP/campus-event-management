import { createContext, useContext, useEffect, useState } from "react";
import {
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    signInWithPopup,
    GoogleAuthProvider,
    GithubAuthProvider
} from "firebase/auth";
import { auth, db, googleProvider, githubProvider } from "../lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const signup = async (email, password, additionalData) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Create user document in Firestore
        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            email: user.email,
            role: "student",
            organizerRequestStatus: "none",
            createdAt: new Date().toISOString(),
            ...additionalData
        });

        return userCredential;
    };

    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const loginWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            // Check if user document exists, if not create it
            const userDoc = await getDoc(doc(db, "users", result.user.uid));
            if (!userDoc.exists()) {
                await setDoc(doc(db, "users", result.user.uid), {
                    uid: result.user.uid,
                    email: result.user.email,
                    role: "student",
                    organizerRequestStatus: "none",
                    createdAt: new Date().toISOString(),
                    firstName: result.user.displayName?.split(' ')[0] || '',
                    lastName: result.user.displayName?.split(' ').slice(1).join(' ') || '',
                });
            }
            return result;
        } catch (error) {
            throw error;
        }
    };

    const loginWithGithub = async () => {
        try {
            const result = await signInWithPopup(auth, githubProvider);
            // Check if user document exists, if not create it
            const userDoc = await getDoc(doc(db, "users", result.user.uid));
            if (!userDoc.exists()) {
                await setDoc(doc(db, "users", result.user.uid), {
                    uid: result.user.uid,
                    email: result.user.email,
                    role: "student",
                    organizerRequestStatus: "none",
                    createdAt: new Date().toISOString(),
                    firstName: result.user.displayName?.split(' ')[0] || '',
                    lastName: result.user.displayName?.split(' ').slice(1).join(' ') || '',
                });
            }
            return result;
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        return signOut(auth);
    };

    const resetPassword = (email) => {
        return sendPasswordResetEmail(auth, email);
    };

    const value = {
        user,
        signup,
        login,
        loginWithGoogle,
        loginWithGithub,
        logout,
        resetPassword,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
