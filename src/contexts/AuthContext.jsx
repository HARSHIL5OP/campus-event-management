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
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            // If we have a user, we must be in a loading state while fetching their profile
            // This prevents the app from rendering protected routes with a user but no profile
            if (currentUser) {
                setLoading(true);
                try {
                    const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                    if (userDoc.exists()) {
                        setUserProfile(userDoc.data());
                    } else {
                        console.warn("User profile not found in Firestore");
                        setUserProfile(null);
                    }
                    // Only set the user availability AFTER the profile is attempted
                    setUser(currentUser);
                } catch (error) {
                    console.error("Error fetching user profile:", error);
                    // In case of error, we might want to still allow access or force logout?
                    // For now, logging the error but keeping the user logged in (might need fallbacks)
                    // Or we could set user(null) to force re-login.
                    setUser(currentUser);
                }
            } else {
                setUserProfile(null);
                setUser(null);
            }

            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const signup = async (email, password, additionalData) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const newProfile = {
            uid: user.uid,
            email: user.email,
            role: "student",
            organizerRequestStatus: "none",
            createdAt: new Date().toISOString(),
            ...additionalData
        };

        // Create user document in Firestore
        try {
            await setDoc(doc(db, "users", user.uid), newProfile);
            setUserProfile(newProfile);
        } catch (error) {
            console.error("Error writing to Firestore during signup:", error);
            throw error;
        }

        return userCredential;
    };

    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const loginWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const userDocRef = doc(db, "users", result.user.uid);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
                const newProfile = {
                    uid: result.user.uid,
                    email: result.user.email,
                    role: "student",
                    organizerRequestStatus: "none",
                    createdAt: new Date().toISOString(),
                    firstName: result.user.displayName?.split(' ')[0] || '',
                    lastName: result.user.displayName?.split(' ').slice(1).join(' ') || '',
                };
                try {
                    await setDoc(userDocRef, newProfile);
                    setUserProfile(newProfile);
                } catch (firestoreError) {
                    console.error("Error writing to Firestore during Google login:", firestoreError);
                    throw firestoreError;
                }
            } else {
                setUserProfile(userDoc.data());
            }
            return result;
        } catch (error) {
            console.error("Error with Google Login/Firestore:", error);
            throw error;
        }
    };

    const loginWithGithub = async () => {
        try {
            const result = await signInWithPopup(auth, githubProvider);
            const userDocRef = doc(db, "users", result.user.uid);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
                const newProfile = {
                    uid: result.user.uid,
                    email: result.user.email,
                    role: "student",
                    organizerRequestStatus: "none",
                    createdAt: new Date().toISOString(),
                    firstName: result.user.displayName?.split(' ')[0] || '',
                    lastName: result.user.displayName?.split(' ').slice(1).join(' ') || '',
                };
                try {
                    await setDoc(userDocRef, newProfile);
                    setUserProfile(newProfile);
                } catch (firestoreError) {
                    console.error("Error writing to Firestore during Github login:", firestoreError);
                    throw firestoreError;
                }
            } else {
                setUserProfile(userDoc.data());
            }
            return result;
        } catch (error) {
            console.error("Error with Github Login/Firestore:", error);
            throw error;
        }
    };

    const upgradeToOrganizer = async () => {
        if (!user) return;

        try {
            // 1. Update Firestore
            const userRef = doc(db, "users", user.uid);
            await setDoc(userRef, {
                organizerRequestStatus: "approved",
                role: "organizer"
            }, { merge: true });

            // 2. Update local state immediately for instant UI feedback
            setUserProfile(prev => ({
                ...prev,
                organizerRequestStatus: "approved",
                role: "organizer"
            }));

            return true;
        } catch (error) {
            console.error("Error upgrading to organizer:", error);
            throw error;
        }
    };

    const logout = () => {
        setUserProfile(null);
        return signOut(auth);
    };

    const resetPassword = (email) => {
        return sendPasswordResetEmail(auth, email);
    };

    const value = {
        user,
        userProfile,
        signup,
        login,
        loginWithGoogle,
        loginWithGithub,
        logout,
        resetPassword,
        upgradeToOrganizer,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
