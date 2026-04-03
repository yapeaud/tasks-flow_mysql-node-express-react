/**
 * Modèle Task – validation, statuts et formatage de la réponse API
 */
class Task {
    static STATUS = {
        TODO: 'todo',
        IN_PROGRESS: 'in_progress',
        DONE: 'done',
    };

    /**
     * Valider les données d'une tâche
     */
    static validate(data) {
        if (!data.title || data.title.trim().length === 0) {
            return { isValid: false, error: 'Le titre est obligatoire' };
        }
        if (data.status && !Object.values(this.STATUS).includes(data.status)) {
            return { isValid: false, error: 'Statut invalide' };
        }
        if (!data.userId) {
            return { isValid: false, error: "L'ID utilisateur est obligatoire" };
        }
        return { isValid: true };
    }

    /**
     * Formater une tâche pour la réponse API
     */
    static format(task) {
        if (!task) return null;

        // Status : préférer le champ status de la DB, sinon dériver de completed
        const completed = task.completed ?? task.isCompleted;
        const status =
            task.status && Object.values(this.STATUS).includes(task.status)
                ? task.status
                : completed
                ? this.STATUS.DONE
                : this.STATUS.TODO;

        return {
            id: task.id,
            title: task.title,
            description: task.description || null,
            status,
            isCompleted: status === this.STATUS.DONE,
            dueDate: task.due_date || task.dueDate || null,
            createdAt: task.created_at || task.createdAt || null,
            updatedAt: task.updated_at || task.updatedAt || null,
            userId: task.user_id || task.userId,
        };
    }
}

export default Task;
