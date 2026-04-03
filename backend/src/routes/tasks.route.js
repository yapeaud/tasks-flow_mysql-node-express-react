import express from 'express';
import Task from '../models/Task.js';
import TaskRepository from '../repositories/task.repository.js';
import { authenticateJWT } from '../middleware/auth.middleware.js';

const router = express.Router();

// Protéger toutes les routes
router.use(authenticateJWT);

// GET /api/tasks  – récupérer les tâches (avec filtre optionnel par status)
router.get('/', async (req, res) => {
    try {
        const userId = req.user.userId;
        const { status } = req.query;

        const filters = {};
        if (status && Object.values(Task.STATUS).includes(status)) {
            filters.status = status;
        }

        const tasks = await TaskRepository.findByUserId(userId, filters);
        return res.json(tasks.map((t) => Task.format(t)));
    } catch (err) {
        console.error('Get tasks error:', err);
        return res.status(500).json({ success: false, message: 'Erreur lors de la récupération des tâches' });
    }
});

// POST /api/tasks – créer une nouvelle tâche
router.post('/', async (req, res) => {
    try {
        const userId = req.user.userId;
        const { title, description, status = 'todo', dueDate } = req.body;

        const validation = Task.validate({ title, userId, status });
        if (!validation.isValid) {
            return res.status(400).json({ success: false, message: validation.error });
        }

        const task = await TaskRepository.create(title, description, userId, status);

        // Si une date d'échéance est fournie, l'enregistrer via update
        if (dueDate && task) {
            const updated = await TaskRepository.update(task.id, userId, { due_date: dueDate });
            return res.status(201).json(Task.format(updated || task));
        }

        return res.status(201).json(Task.format(task));
    } catch (err) {
        console.error('Create task error:', err);
        return res.status(500).json({ success: false, message: 'Erreur lors de la création de la tâche' });
    }
});

// PATCH /api/tasks/:id – mettre à jour une tâche
router.patch('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const { title, description, status, dueDate } = req.body;

        // Vérifier que la tâche appartient à l'utilisateur
        const existing = await TaskRepository.findById(id, userId);
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Tâche non trouvée' });
        }

        // Construire les mises à jour
        const updates = {};
        if (title !== undefined) updates.title = title.trim();
        if (description !== undefined) updates.description = description.trim();
        if (dueDate !== undefined) updates.due_date = dueDate;
        if (status !== undefined && Object.values(Task.STATUS).includes(status)) {
            updates.status = status;
            updates.completed = status === Task.STATUS.DONE;
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ success: false, message: 'Aucun champ à mettre à jour' });
        }

        const updatedTask = await TaskRepository.update(id, userId, updates);
        return res.json(Task.format(updatedTask));
    } catch (err) {
        console.error('Update task error:', err);
        return res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour de la tâche' });
    }
});

// DELETE /api/tasks/:id – supprimer une tâche
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const deleted = await TaskRepository.delete(id, userId);
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Tâche non trouvée' });
        }

        return res.json({ success: true, message: 'Tâche supprimée avec succès' });
    } catch (err) {
        console.error('Delete task error:', err);
        return res.status(500).json({ success: false, message: 'Erreur lors de la suppression' });
    }
});

export default router;
