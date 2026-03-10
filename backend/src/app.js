// Importation d'express pour la création de l'application et la gestion des routes
import express from 'express';

// Importation de la fonction de configuration de l'application pour appliquer les middlewares et autres configurations globales
import { configureApp } from './config/index.js';

// Importation des routes d'authentification et de gestion des tâches
import authRoutes from './routes/auth.route.js';

// Importation des routes de gestion des tâches pour les monter sur l'application
import taskRoutes from './routes/tasks.route.js';

const app = express();

// Configuration de base
configureApp(app);

// Montage des routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

export default app;