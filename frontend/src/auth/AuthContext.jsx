import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(undefined);

const STORAGE_KEY = 'todo-flow-auth';

// Contexte d'authentification pour gérer la session utilisateur et le token d'authentification JWT
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setUser(parsed.user || null);
                setToken(parsed.token || null);
            } catch {
                window.localStorage.removeItem(STORAGE_KEY);
            }
        }
        setLoading(false);
    }, []);

    // Sauvegarde de la session dans le state et le localStorage
    function saveSession(nextUser, nextToken) {
        setUser(nextUser);
        setToken(nextToken);
        window.localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ user: nextUser, token: nextToken })
        );
    }

    // Effacement de la session du state et du localStorage
    function clearSession() {
        setUser(null);
        setToken(null);
        window.localStorage.removeItem(STORAGE_KEY);
    }

    // Fonction de connexion qui envoie les identifiants à l'API et gère la réponse
    async function login(email, password) {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.message || 'Connexion échouée');
        }
        saveSession(data.data.user, data.data.tokens.accessToken);
    }

    // Fonction d'inscription qui envoie les informations à l'API et gère la réponse
    async function register(name, email, password) {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.message || "Inscription échouée");
        }
        saveSession(data.data.user, data.data.tokens.accessToken);
    }

    const value = {
        user,
        token,
        loading,
        login,
        register,
        logout: clearSession,
    };

    // Fournit le contexte d'authentification à tous les composants enfants
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook personnalisé pour accéder facilement au contexte d'authentification dans les composants
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth must be used inside AuthProvider');
    }
    return ctx;
}