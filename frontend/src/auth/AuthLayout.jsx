import React from 'react';
import { Link } from 'react-router-dom';
import { CheckSquare } from 'lucide-react';

// Composant de mise en page pour les pages d'authentification (connexion et inscription)
export default function AuthLayout({ title, subtitle, children, footer }) {
    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
            <div className="grid w-full max-w-4xl gap-10 rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-2xl shadow-slate-950/60 md:grid-cols-[1.1fr,1fr]">
                <div className="flex flex-col justify-between gap-6">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
                        <p className="mt-2 text-sm text-slate-400">{subtitle}</p>
                    </div>
                    <ul className="space-y-2 text-sm text-slate-300">
                        <li className="flex items-center gap-2">
                            <CheckSquare className="h-4 w-4 text-indigo-400" />
                            <span>Gérez vos tâches par statut : À faire, En cours, Terminé.</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <CheckSquare className="h-4 w-4 text-indigo-400" />
                            <span>Interface moderne, rapide et responsive.</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <CheckSquare className="h-4 w-4 text-indigo-400" />
                            <span>Vos données sont isolées et protégées.</span>
                        </li>
                    </ul>
                    <p className="text-xs text-slate-500">
                        En continuant, vous acceptez nos conditions d'utilisation.
                    </p>
                </div>
                <div className="flex flex-col justify-center gap-6 rounded-xl border border-slate-800 bg-slate-900/80 p-6">
                    {children}
                    {footer && (
                        <p className="mt-2 text-center text-xs text-slate-400">
                            {footer.text}{' '}
                            <Link to={footer.to} className="font-medium text-indigo-400 hover:text-indigo-300">
                                {footer.linkLabel}
                            </Link>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}