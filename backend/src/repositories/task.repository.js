import { query } from '../config/db.js';

export const TaskRepository = {
    // Créer une tâche
    create: async (title, description, userId, completed = false) => {
        const result = await query(
            `INSERT INTO tasks (title, description, user_id, completed) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
            [title, description, userId, completed]
        );
        return result.rows[0];
    },

    // Trouver toutes les tâches d'un utilisateur
    findByUserId: async (userId, filters = {}) => {
        let sql = `
      SELECT t.*, u.email as user_email 
      FROM tasks t 
      LEFT JOIN users u ON t.user_id = u.id 
      WHERE t.user_id = $1
    `;
        const params = [userId];
        let paramIndex = 2;

        // Filtre optionnel : completed
        if (filters.completed !== undefined) {
            sql += ` AND t.completed = $${paramIndex}`;
            params.push(filters.completed);
            paramIndex++;
        }

        sql += ' ORDER BY t.created_at DESC';

        const result = await query(sql, params);
        return result.rows;
    },

    // Trouver par ID
    findById: async (id, userId) => {
        const result = await query(
            `SELECT t.*, u.email as user_email FROM tasks t LEFT JOIN users u ON t.user_id = u.id WHERE t.id = $1 AND t.user_id = $2`,
            [id, userId]
        );
        return result.rows[0];
    },

    // Mettre à jour
    update: async (id, userId, updates) => {
        const fields = Object.keys(updates);
        const values = Object.values(updates);
        const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');

        const result = await query(
            `UPDATE tasks SET ${setClause}, updated_at = NOW() 
        WHERE id = $${fields.length + 1} AND user_id = $${fields.length + 2} 
       RETURNING *`,
            [...values, id, userId]
        );
        return result.rows[0];
    },

    // Supprimer
    delete: async (id, userId) => {
        const result = await query(
            'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id',
            [id, userId]
        );
        return result.rowCount > 0;
    }
};

export default TaskRepository;