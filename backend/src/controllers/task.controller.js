import { TaskRepository } from '../repositories/task.repository.js';

export const getTasks = async (req, res) => {
    try {
        const userId = req.user.userId; // Depuis le middleware auth
        const { completed } = req.query;

        const filters = {};
        if (completed !== undefined) {
            filters.completed = completed === 'true';
        }

        const tasks = await TaskRepository.findByUserId(userId, filters);

        res.json({ success: true, count: tasks.length, data: tasks });
    } catch (error) {
        console.error('❌ Erreur getTasks:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des tâches' });
    }
};

export const createTask = async (req, res) => {
    try {
        const { title, description, completed } = req.body;
        const userId = req.user.userId;

        if (!title?.trim()) {
            return res.status(400).json({ message: 'Le titre est requis' });
        }

        const task = await TaskRepository.create(
            title.trim(),
            description?.trim() || null,
            userId,
            completed || false
        );

        res.status(201).json({ success: true, data: task });
    } catch (error) {
        console.error('❌ Erreur createTask:', error);
        res.status(500).json({ message: 'Erreur lors de la création de la tâche' });
    }
};

export const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, completed } = req.body;
        const userId = req.user.userId;

        const updates = {};
        if (title !== undefined) updates.title = title.trim();
        if (description !== undefined) updates.description = description.trim();
        if (completed !== undefined) updates.completed = completed;

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: 'Aucun champ à mettre à jour' });
        }

        const task = await TaskRepository.update(id, userId, updates);

        if (!task) {
            return res.status(404).json({ message: 'Tâche non trouvée' });
        }

        res.json({ success: true, data: task });
    } catch (error) {
        console.error('❌ Erreur updateTask:', error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour' });
    }
};

export const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const deleted = await TaskRepository.delete(id, userId);

        if (!deleted) {
            return res.status(404).json({ message: 'Tâche non trouvée' });
        }

        res.json({ success: true, message: 'Tâche supprimée avec succès' });
    } catch (error) {
        console.error('❌ Erreur deleteTask:', error);
        res.status(500).json({ message: 'Erreur lors de la suppression' });
    }
};