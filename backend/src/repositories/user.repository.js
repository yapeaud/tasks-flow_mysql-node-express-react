import { query } from '../config/db.js';
import { randomUUID } from 'crypto';

export const UserRepository = {
    // Créer un utilisateur
    create: async (email, password, name = null) => {
        const id = randomUUID();
        const result = await query(
            'INSERT INTO "User" (id, email, password, name, "updatedAt") VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
            [id, email, password, name]
        );
        return result.rows[0];
    },

    // Trouver par email
    findByEmail: async (email) => {
        const result = await query(
            'SELECT * FROM "User" WHERE email = $1',
            [email]
        );
        return result.rows[0];
    },

    // Trouver par ID
    findById: async (id) => {
        const result = await query(
            'SELECT id, email, name, "createdAt", "updatedAt" FROM "User" WHERE id = $1',
            [id]
        );
        return result.rows[0];
    },

    // Mettre à jour
    update: async (id, updates) => {
        const fields = Object.keys(updates);
        const values = Object.values(updates);
        const setClause = fields.map((field, index) => `"${field}" = $${index + 1}`).join(', ');

        const result = await query(
            `UPDATE "User" SET ${setClause}, "updatedAt" = NOW() WHERE id = $${fields.length + 1} RETURNING *`,
            [...values, id]
        );
        return result.rows[0];
    },

    // Trouver par ID (incluant le mot de passe pour vérification)
    findByIdWithPassword: async (id) => {
        const result = await query(
            'SELECT * FROM "User" WHERE id = $1',
            [id]
        );
        return result.rows[0];
    },

    // Mettre à jour le mot de passe
    updatePassword: async (id, hashedPassword) => {
        const result = await query(
            'UPDATE "User" SET password = $1, "updatedAt" = NOW() WHERE id = $2 RETURNING id',
            [hashedPassword, id]
        );
        return result.rows[0];
    },

    // Mettre à jour le refresh token (colonne non implémentée dans le schéma actuel)
    updateRefreshToken: async (id, refreshTokenHash) => {
        // La colonne refresh_token n'existe pas encore dans la base de données.
        // Pour l'activer, ajouter la colonne via une migration Prisma.
        return null;
    },

    // Supprimer
    delete: async (id) => {
        const result = await query(
            'DELETE FROM "User" WHERE id = $1 RETURNING id',
            [id]
        );
        return result.rowCount > 0;
    }
};

export default UserRepository;