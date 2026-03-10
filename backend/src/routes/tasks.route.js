
// Importation d'express pour la création du routeur et des routes de gestion des tâches
import express from 'express';

// Importation du modèle Task pour la validation et le formatage
import Task from '../models/Task.js';

// Importation du repository Task pour l'accès aux données
import TaskRepository from '../repositories/task.repository.js';

// Importation du middleware d'authentification
import { authenticateJWT } from '../middleware/auth.middleware.js';

// Création du routeur pour les tâches
const router = express.Router();

// Protéger toutes les routes de ce routeur
router.use(authenticateJWT);

// Route pour récupérer toutes les tâches de l'utilisateur connecté
router.get('/', async (req, res) => {
    try {
        const userId = req.user.userId;
        const { status } = req.query;

        const filters = {};
        if (status) {
            filters.completed = (status === 'done');
        }

        const tasks = await TaskRepository.findByUserId(userId, filters);

        // Formater les tâches pour la réponse
        const formattedTasks = tasks.map(task => Task.format(task));

        return res.json(formattedTasks);
    } catch (err) {
        console.error('Get tasks error:', err);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des tâches'
        });
    }
});

// Route pour créer une nouvelle tâche
router.post('/', async (req, res) => {
    try {
        const userId = req.user.userId;
        const { title, description, status } = req.body;

        // Validation via le modèle
        const validation = Task.validate({ title, userId, status });
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: validation.error
            });
        }

        const isCompleted = (status === Task.STATUS.DONE);
        const task = await TaskRepository.create(title, description, userId, isCompleted);

        return res.status(201).json(Task.format(task));
    } catch (err) {
        console.error('Create task error:', err);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la création de la tâche'
        });
    }
});

// Route pour mettre à jour une tâche
router.patch('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const updates = req.body;

        // Vérifier si la tâche existe et appartient à l'utilisateur
        const existingTask = await TaskRepository.findById(id, userId);
        if (!existingTask) {
            return res.status(404).json({
                success: false,
                message: 'Tâche non trouvée'
            });
        }

        // Si le statut est mis à jour, mettre à jour 'completed' en conséquence
        if (updates.status) {
            updates.completed = (updates.status === Task.STATUS.DONE);
        }

        const updatedTask = await TaskRepository.update(id, userId, updates);
        return res.json(Task.format(updatedTask));
    } catch (err) {
        console.error('Update task error:', err);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour de la tâche'
        });
    }
});

// Route pour supprimer une tâche
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const deleted = await TaskRepository.delete(id, userId);
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Tâche non trouvée ou déjà supprimée'
            });
        }

        return res.json({
            success: true,
            message: 'Tâche supprimée avec succès'
        });
    } catch (err) {
        console.error('Delete task error:', err);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression de la tâche'
        });
    }
});

export default router;
