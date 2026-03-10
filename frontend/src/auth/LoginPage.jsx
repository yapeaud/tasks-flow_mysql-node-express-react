import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import AuthLayout from './AuthLayout.jsx';
import { useAuth } from './AuthContext.jsx';

// Page de connexion qui utilise le contexte d'authentification pour gérer la session utilisateur et le token JWT
export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Gestion de la soumission du formulaire de connexion
    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/', { replace: true });
        } catch (err) {
            setError(err.message || 'Erreur de connexion');
        } finally {
            setLoading(false);
        }
    }

    return (
        // Composant de mise en page pour la page de connexion
        <AuthLayout
            title="Connexion"
            subtitle="Reprenez le contrôle de votre journée en quelques secondes."
            footer={{
                text: "Pas encore de compte ?",
                to: '/register',
                linkLabel: "Créer un compte",
            }}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="rounded-lg border border-red-500/60 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                        {error}
                    </div>
                )}
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-200">Email</label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none ring-indigo-500/70 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1"
                        placeholder="vous@example.com"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-200">Mot de passe</label>
                    <input
                        type="password"
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none ring-indigo-500/70 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1"
                        placeholder="••••••••"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-500 px-3 py-2 text-sm font-medium text-white shadow-sm shadow-indigo-500/40 transition hover:bg-indigo-400 disabled:opacity-70"
                >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    <span>Se connecter</span>
                </button>
            </form>
        </AuthLayout>
    );
}