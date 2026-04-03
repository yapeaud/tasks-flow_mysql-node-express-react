import { query } from '../config/db.js';
import { randomUUID } from 'crypto';

const VALID_STATUSES = ['todo', 'in_progress', 'done'];

const TaskRepository = {

    // Créer une tâche
    create: async (title, description, userId, status = 'todo') => {
        const safeStatus = VALID_STATUSES.includes(status) ? status : 'todo';
        const isCompleted = safeStatus === 'done';
        const id = randomUUID();
        const result = await query(
            `INSERT INTO "Task" (id, title, description, "userId", "isCompleted", status, "createdAt", "updatedAt")
             VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING *`,
            [id, title, description || null, userId, isCompleted, safeStatus]
        );
        return result.rows[0];
    },

    // Trouver toutes les tâches d'un utilisateur
    findByUserId: async (userId, filters = {}) => {
        let sql = `
            SELECT *
            FROM "Task"
            WHERE "userId" = $1
        `;
        const params = [userId];
        let paramIndex = 2;

        if (filters.status && VALID_STATUSES.includes(filters.status)) {
            sql += ` AND status = $${paramIndex}`;
            params.push(filters.status);
            paramIndex++;
        }

        sql += ' ORDER BY "createdAt" DESC';

        const result = await query(sql, params);
        return result.rows;
    },

    // Trouver par ID et userId
    findById: async (id, userId) => {
        const result = await query(
            `SELECT * FROM "Task" WHERE id = $1 AND "userId" = $2`,
            [id, userId]
        );
        return result.rows[0] || null;
    },

    // Mettre à jour une tâche
    update: async (id, userId, updates) => {
        // Map snake_case incoming keys to Prisma camelCase column names
        const columnMap = {
            title: 'title',
            description: 'description',
            status: 'status',
            completed: 'isCompleted',
            isCompleted: 'isCompleted',
            due_date: 'dueDate',
            dueDate: 'dueDate',
        };

        const filtered = Object.entries(updates)
            .map(([k, v]) => [columnMap[k], v])
            .filter(([k]) => k !== undefined);

        if (filtered.length === 0) return null;

        const fields = filtered.map(([k]) => k);
        const values = filtered.map(([, v]) => v);

        const setClause = fields.map((field, i) => `"${field}" = $${i + 1}`).join(', ');

        const result = await query(
            `UPDATE "Task" SET ${setClause}, "updatedAt" = NOW()
             WHERE id = $${fields.length + 1} AND "userId" = $${fields.length + 2}
             RETURNING *`,
            [...values, id, userId]
        );
        return result.rows[0] || null;
    },

    // Supprimer une tâche
    delete: async (id, userId) => {
        const result = await query(
            'DELETE FROM "Task" WHERE id = $1 AND "userId" = $2 RETURNING id',
            [id, userId]
        );
        return result.rowCount > 0;
    },
};

export default TaskRepository;
