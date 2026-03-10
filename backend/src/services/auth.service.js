// src/services/auth.service.js
import jwt from 'jsonwebtoken';

/**
 * Générer un token d'accès JWT
 */
export const generateAccessToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        issuer: 'todoflow-api',
        audience: 'todoflow-users'
    });
};

/**
 * Générer un token de rafraîchissement (optionnel mais recommandé)
 */
export const generateRefreshToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
        issuer: 'todoflow-api',
        audience: 'todoflow-users'
    });
};

/**
 * Vérifier et décoder un token
 */
export const verifyToken = (token, type = 'access') => {
    try {
        const secret = type === 'access'
            ? process.env.JWT_SECRET
            : process.env.JWT_REFRESH_SECRET;

        return jwt.verify(token, secret, {
            issuer: 'todoflow-api',
            audience: 'todoflow-users'
        });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('Token expiré');
        } else if (error.name === 'JsonWebTokenError') {
            throw new Error('Token invalide');
        }
        throw error;
    }
};

/**
 * Extraire le token du header Authorization
 */
export const extractTokenFromHeader = (authHeader) => {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.substring(7); // Retirer "Bearer "
};

export default {
    generateAccessToken,
    generateRefreshToken,
    verifyToken,
    extractTokenFromHeader
};