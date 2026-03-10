// server.js
import dotenv from "dotenv";
import app from './app.js';
import { connectDB, pool } from './config/db.js';

dotenv.config();

const PORT = process.env.PORT;

const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`🚀 Serveur démarré sur le port ${PORT}`);
            console.log(`🔗 API disponible sur http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Échec du démarrage du serveur:', error);
        process.exit(1);
    }
};

startServer();

// Arrêt gracieux : fermer le pool proprement
process.on('SIGINT', async () => {
    console.log('\n🛑 Arrêt du serveur...');
    await pool.end(); // Ferme toutes les connexions du pool
    console.log('🔌 Pool PostgreSQL fermé');
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Signal SIGTERM reçu, fermeture...');
    await pool.end();
    process.exit(0);
});