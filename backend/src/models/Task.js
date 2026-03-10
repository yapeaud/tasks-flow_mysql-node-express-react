/**
 * Modèle Task pour la gestion des statuts et la validation
 */
class Task {
    // Constantes de statut (alignées avec l'énum Prisma)
    static STATUS = {
        TODO: 'todo',
        IN_PROGRESS: 'in_progress',
        DONE: 'done'
    };

    /**
     * Valider les données d'une tâche
     * @param {Object} data - Données de la tâche (title, userId, status)
     * @returns {Object} - Resultat de validation { isValid: boolean, error: string }
     */
    static validate(data) {
        if (!data.title || data.title.trim().length === 0) {
            return { isValid: false, error: 'Le titre est obligatoire' };
        }
        if (data.status && !Object.values(this.STATUS).includes(data.status)) {
            return { isValid: false, error: 'Statut invalide' };
        }
        if (!data.userId) {
            return { isValid: false, error: 'L\'ID utilisateur est obligatoire' };
        }
        return { isValid: true };
    }

    /**
     * Formater une tâche pour la réponse API
     * @param {Object} task - Objet tâche brut
     * @returns {Object} - Tâche formatée
     */
    static format(task) {
        if (!task) return null;
        return {
            ...task,
            isCompleted: task.completed || task.status === this.STATUS.DONE,
            // S'assurer que les dates sont bien au format ISO si présentes
            createdAt: task.created_at || task.createdAt,
            updatedAt: task.updated_at || task.updatedAt
        };
    }
}

export default Task;
