
/*
Configuration globale (CORS, env, etc.)
*/
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

// Configuration de CORS pour autoriser les requêtes depuis le frontend
export const configureApp = (app) => {
    //Configuration de base
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    //CORS
    app.use(cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
    }));

    //Route de test
    app.get('/', (req, res) => {
        res.json({ message: 'L\'API Todo Flow est en cours d\'exécution' });
    });

    return app;
}
