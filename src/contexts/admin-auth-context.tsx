"use client";

import type { User } from "firebase/auth";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { auth } from "@/lib/firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type AuthError,
} from "firebase/auth";
import type { AdminLoginFormValues } from "@/schemas/admin-login";

interface AdminAuthContextType {
  adminUser: User | null;
  loading: boolean;
  error: AuthError | null;
  login: (values: AdminLoginFormValues) => Promise<void>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const loginTimestamp = localStorage.getItem('adminLoginTimestamp');
        const now = new Date().getTime();
        const ONE_HOUR_IN_MS = 60 * 60 * 1000; // 1 hour

        // Check if the timestamp exists and if it's older than one hour
        if (loginTimestamp && (now - parseInt(loginTimestamp, 10) > ONE_HOUR_IN_MS)) {
          console.log("Admin session has expired. Logging out for security.");
          // Sign out and clear the timestamp.
          firebaseSignOut(auth).then(() => {
            localStorage.removeItem('adminLoginTimestamp');
          });
          // onAuthStateChanged will be triggered again with user=null by signOut,
          // which will then set the adminUser state to null.
        } else {
          setAdminUser(user);
        }
      } else {
        // No user is signed in, or they have just been signed out.
        localStorage.removeItem('adminLoginTimestamp');
        setAdminUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (values: AdminLoginFormValues) => {
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      // On successful login, set the session start timestamp.
      localStorage.setItem('adminLoginTimestamp', new Date().getTime().toString());
      // User state will be updated by the onAuthStateChanged listener.
    } catch (err) {
      setError(err as AuthError);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      await firebaseSignOut(auth);
      // The onAuthStateChanged listener will handle clearing the timestamp.
    } catch (err) {
      setError(err as AuthError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminAuthContext.Provider value={{ adminUser, loading, error, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}
