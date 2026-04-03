import { query } from './db.js';

/**
 * Applique les migrations nécessaires au démarrage du serveur.
 * Idempotent : peut être appelé plusieurs fois sans erreur.
 */
export async function runMigrations() {
    try {
        // Synchroniser isCompleted avec status pour les anciennes lignes
        await query(`
            UPDATE "Task"
            SET "isCompleted" = true
            WHERE status = 'done' AND "isCompleted" = false;
        `);

        console.log('✅ Migrations appliquées avec succès');
    } catch (error) {
        console.error('❌ Erreur lors des migrations:', error.message);
    }
}
