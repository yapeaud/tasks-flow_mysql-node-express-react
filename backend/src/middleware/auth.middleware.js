// src/middleware/auth.middleware.js
import AuthService from '../services/auth.service.js';

/**
 * Middleware pour protéger les routes avec JWT
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction next()
 */
export const authenticateJWT = async (req, res, next) => {
    try {
        // 1. Extraire le token du header
        const authHeader = req.headers.authorization;
        const token = AuthService.extractTokenFromHeader(authHeader);

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token d\'authentification requis',
                error: 'UNAUTHORIZED'
            });
        }

        // 2. Vérifier et décoder le token
        const decoded = AuthService.verifyToken(token, 'access');

        // 3. Attacher l'utilisateur à la requête
        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            // Ajoutez d'autres claims si nécessaire
        };

        next();
    } catch (error) {
        console.error('❌ Erreur d\'authentification:', error.message);

        if (error.message === 'Token expiré') {
            return res.status(401).json({
                success: false,
                message: 'Session expirée, veuillez vous reconnecter',
                error: 'TOKEN_EXPIRED'
            });
        }

        if (error.message === 'Token invalide') {
            return res.status(401).json({
                success: false,
                message: 'Token d\'authentification invalide',
                error: 'INVALID_TOKEN'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Erreur interne du serveur',
            error: 'INTERNAL_ERROR'
        });
    }
};

/**
 * Middleware optionnel : vérifier les rôles (RBAC)
 * @param {Array} allowedRoles - Liste des rôles autorisés
 */
export const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentification requise',
                error: 'UNAUTHORIZED'
            });
        }

        // Si aucun rôle spécifié, l'utilisateur authentifié a accès
        if (allowedRoles.length === 0) {
            return next();
        }

        // Vérifier si le rôle de l'utilisateur est dans la liste autorisée
        // (À adapter selon votre système de rôles)
        const userRole = req.user.role; // À récupérer depuis la BDD si nécessaire

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: 'Accès refusé : permissions insuffisantes',
                error: 'FORBIDDEN'
            });
        }

        next();
    };
};

/**
 * Middleware optionnel : rafraîchir le token d'accès
 * Utile pour une expérience utilisateur fluide
 */
export const refreshTokenIfNeeded = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const accessToken = AuthService.extractTokenFromHeader(authHeader);

        if (!accessToken) {
            return next(); // Pas de token, on continue (route publique)
        }

        try {
            // Si le token est valide, on continue normalement
            const decoded = AuthService.verifyToken(accessToken, 'access');
            req.user = { userId: decoded.userId, email: decoded.email };
            return next();
        } catch (error) {
            // Si le token est expiré mais qu'on a un refresh token...
            if (error.message === 'Token expiré') {
                const refreshToken = req.cookies?.refreshToken || req.headers['x-refresh-token'];

                if (refreshToken) {
                    try {
                        const refreshDecoded = AuthService.verifyToken(refreshToken, 'refresh');

                        // Générer un nouveau access token
                        const newAccessToken = AuthService.generateAccessToken({
                            userId: refreshDecoded.userId,
                            email: refreshDecoded.email
                        });

                        // Attacher le nouveau token à la réponse
                        res.setHeader('X-New-Access-Token', newAccessToken);

                        // Attacher l'utilisateur à la requête
                        req.user = {
                            userId: refreshDecoded.userId,
                            email: refreshDecoded.email
                        };

                        return next();
                    } catch (refreshError) {
                        // Refresh token invalide ou expiré
                        return res.status(401).json({
                            success: false,
                            message: 'Session expirée, veuillez vous reconnecter',
                            error: 'SESSION_EXPIRED'
                        });
                    }
                }
            }
            // Autre erreur de token
            return next(); // On laisse le middleware principal gérer
        }
    } catch (error) {
        console.error('❌ Erreur refreshTokenIfNeeded:', error);
        next(); // En cas d'erreur, on ne bloque pas la requête
    }
};

export default {
    authenticateJWT,
    authorizeRoles,
    refreshTokenIfNeeded
};