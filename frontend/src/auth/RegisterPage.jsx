import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import AuthLayout from './AuthLayout.jsx';
import { useAuth } from './AuthContext.jsx';

// Page d'inscription qui utilise le contexte d'authentification pour gérer la session utilisateur et le token JWT
export default function RegisterPage() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Gestion de la soumission du formulaire d'inscription
    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register(name, email, password);
            navigate('/', { replace: true });
        } catch (err) {
            setError(err.message || "Erreur lors de l'inscription");
        } finally {
            setLoading(false);
        }
    }

    return (
        // Composant de mise en page pour la page d'inscription
        <AuthLayout
            title="Créer un compte"
            subtitle="Une vue claire sur toutes vos tâches, au même endroit."
            footer={{
                text: 'Déjà inscrit ?',
                to: '/login',
                linkLabel: 'Se connecter',
            }}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="rounded-lg border border-red-500/60 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                        {error}
                    </div>
                )}
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-200">Nom</label>
                    <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none ring-indigo-500/70 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1"
                        placeholder="Votre nom"
                    />
                </div>
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
                        placeholder="Minimum 6 caractères"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-500 px-3 py-2 text-sm font-medium text-white shadow-sm shadow-indigo-500/40 transition hover:bg-indigo-400 disabled:opacity-70"
                >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    <span>S'inscrire</span>
                </button>
            </form>
        </AuthLayout>
    );
}