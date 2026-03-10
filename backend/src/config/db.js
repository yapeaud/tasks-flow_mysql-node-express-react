// src/config/db.js
import pkg from 'pg';
const { Pool } = pkg;

// Création du pool de connexions
export const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    max: 20,                    // Nombre max de connexions dans le pool
    idleTimeoutMillis: 30000,   // Fermer les connexions inutilisées après 30s
    connectionTimeoutMillis: 2000, // Timeout pour acquérir une connexion
});

// Test de connexion
export const connectDB = async () => {
    try {
        const client = await pool.connect();
        console.log('✅ PostgreSQL connecté via Pool');
        console.log(`🔗 Host: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}`);
        client.release(); // Libérer la connexion pour le pool
        return true;
    } catch (error) {
        console.error('❌ Erreur de connexion au pool PostgreSQL:', error.message);
        process.exit(1);
    }
};

// Helper pour exécuter des requêtes avec gestion d'erreurs
export const query = async (text, params) => {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log('📝 Requête exécutée', { text, duration, rows: res.rowCount });
        return res;
    } catch (error) {
        console.error('❌ Erreur de requête:', { error: error.message, text });
        throw error;
    }
};

// Helper pour les transactions
export const transaction = async (callback) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

export default pool;