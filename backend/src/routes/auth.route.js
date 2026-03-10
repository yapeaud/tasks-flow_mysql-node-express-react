// Importation d'express pour la création du routeur et des routes d'authentification
import express from 'express';

// Importation des fonctions de contrôle pour l'enregistrement et la connexion des utilisateurs
import { register, login } from '../controllers/auth.controller.js';

// Importation du middleware d'authentification pour protéger les routes nécessitant une authentification
const router = express.Router();

router.post('/register', register); // Route pour l'enregistrement des utilisateurs
router.post('/login', login); // Route pour la connexion des utilisateurs

export default router;