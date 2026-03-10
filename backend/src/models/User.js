import bcrypt from 'bcryptjs';

/**
 * Modèle User pour la logique métier et la validation
 */
class User {
    /**
     * Valider les données d'un utilisateur
     * @param {Object} data - Données de l'utilisateur (email, password, name)
     * @returns {Object} - Resultat de validation { isValid: boolean, error: string }
     */
    static validate(data) {
        if (!data.email || !data.email.includes('@')) {
            return { isValid: false, error: 'Email invalide' };
        }
        if (!data.password || data.password.length < 6) {
            return { isValid: false, error: 'Le mot de passe doit contenir au moins 6 caractères' };
        }
        if (data.name && data.name.length < 2) {
            return { isValid: false, error: 'Le nom est trop court' };
        }
        return { isValid: true };
    }

    /**
     * Hacher un mot de passe
     * @param {string} password - Mot de passe en clair
     * @returns {Promise<string>} - Mot de passe haché
     */
    static async hashPassword(password) {
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(password, salt);
    }

    /**
     * Comparer un mot de passe en clair avec un haché
     * @param {string} password - Mot de passe en clair
     * @param {string} hashedPassword - Mot de passe haché
     * @returns {Promise<boolean>}
     */
    static async comparePassword(password, hashedPassword) {
        return bcrypt.compare(password, hashedPassword);
    }

    /**
     * Nettoyer l'objet utilisateur pour l'envoi au client (retirer les données sensibles)
     * @param {Object} user - Objet utilisateur brut de la DB
     * @returns {Object} - Utilisateur sans mot de passe
     */
    static sanitize(user) {
        if (!user) return null;
        const { password, ...safeUser } = user;
        return safeUser;
    }
}

export default User;
