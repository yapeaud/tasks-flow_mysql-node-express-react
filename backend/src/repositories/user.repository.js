import { query } from '../config/db.js';

export const UserRepository = {
    // Créer un utilisateur
    create: async (email, password, name = null) => {
        const result = await query(
            'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING *',
            [email, password, name]
        );
        return result.rows[0];
    },

    // Trouver par email
    findByEmail: async (email) => {
        const result = await query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );
        return result.rows[0];
    },

    // Trouver par ID
    findById: async (id) => {
        const result = await query(
            'SELECT id, email, name, created_at, updated_at FROM users WHERE id = $1',
            [id]
        );
        return result.rows[0];
    },

    // Mettre à jour
    update: async (id, updates) => {
        const fields = Object.keys(updates);
        const values = Object.values(updates);
        const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');

        const result = await query(
            `UPDATE users SET ${setClause}, updated_at = NOW() WHERE id = $${fields.length + 1} RETURNING *`,
            [...values, id]
        );
        return result.rows[0];
    },

    // Trouver par ID (incluant le mot de passe pour vérification)
    findByIdWithPassword: async (id) => {
        const result = await query(
            'SELECT * FROM users WHERE id = $1',
            [id]
        );
        return result.rows[0];
    },

    // Mettre à jour le mot de passe
    updatePassword: async (id, hashedPassword) => {
        const result = await query(
            'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2 RETURNING id',
            [hashedPassword, id]
        );
        return result.rows[0];
    },

    // Mettre à jour le refresh token
    updateRefreshToken: async (id, refreshTokenHash) => {
        const result = await query(
            'UPDATE users SET refresh_token = $1, updated_at = NOW() WHERE id = $2 RETURNING id',
            [refreshTokenHash, id]
        );
        return result.rows[0];
    },

    // Supprimer
    delete: async (id) => {
        const result = await query(
            'DELETE FROM users WHERE id = $1 RETURNING id',
            [id]
        );
        return result.rowCount > 0;
    }
};

export default UserRepository;