// controllers/auth.controller.js
import { UserRepository } from '../repositories/user.repository.js';
import AuthService from '../services/auth.service.js';
import User from '../models/User.js';

/**
 * Inscription d'un nouvel utilisateur
 * POST /api/auth/register
 */
export const register = async (req, res) => {
    try {
        const { email, password, name } = req.body;

        // 1. Validation des entrées via le modèle User
        const validation = User.validate({ email, password, name });
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: validation.error
            });
        }

        // 2. Vérifier si l'utilisateur existe déjà
        const existingUser = await UserRepository.findByEmail(email);
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Cet email est déjà utilisé'
            });
        }

        // 3. Hasher le mot de passe via le modèle User
        const hashedPassword = await User.hashPassword(password);

        // 4. Créer l'utilisateur
        const user = await UserRepository.create(email, hashedPassword, name || null);

        // 5. Générer les tokens
        const accessToken = AuthService.generateAccessToken({
            userId: user.id,
            email: user.email
        });

        const refreshToken = AuthService.generateRefreshToken({
            userId: user.id,
            email: user.email
        });

        // Optionnel: Stocker le refresh token
        // await UserRepository.updateRefreshToken(user.id, await User.hashPassword(refreshToken));

        // 6. Envoyer la réponse (santisée via le modèle User)
        res.status(201).json({
            success: true,
            message: 'Utilisateur créé avec succès',
            data: {
                user: User.sanitize(user),
                tokens: {
                    accessToken,
                    refreshToken,
                    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
                }
            }
        });

    } catch (error) {
        console.error('❌ Erreur register:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de l\'inscription'
        });
    }
};

/**
 * Connexion d'un utilisateur
 * POST /api/auth/login
 */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation basique
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email et mot de passe sont requis'
            });
        }

        // Trouver l'utilisateur (incluant le mot de passe pour vérification)
        const user = await UserRepository.findByEmail(email);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Identifiants invalides'
            });
        }

        // Vérifier le mot de passe via le modèle User
        const isMatch = await User.comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Identifiants invalides'
            });
        }

        // Générer les tokens
        const accessToken = AuthService.generateAccessToken({
            userId: user.id,
            email: user.email
        });

        const refreshToken = AuthService.generateRefreshToken({
            userId: user.id,
            email: user.email
        });

        // Mettre à jour le refresh token
        await UserRepository.updateRefreshToken(user.id, await User.hashPassword(refreshToken));

        res.json({
            success: true,
            message: 'Connexion réussie',
            data: {
                user: User.sanitize(user),
                tokens: {
                    accessToken,
                    refreshToken,
                    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
                }
            }
        });

    } catch (error) {
        console.error('❌ Erreur login:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la connexion'
        });
    }
};

/**
 * Rafraîchir les tokens
 */
export const refreshTokens = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        const token = refreshToken || req.cookies?.refreshToken;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token requis'
            });
        }

        const decoded = AuthService.verifyToken(token, 'refresh');
        const user = await UserRepository.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        const newAccessToken = AuthService.generateAccessToken({
            userId: user.id,
            email: user.email
        });

        const newRefreshToken = AuthService.generateRefreshToken({
            userId: user.id,
            email: user.email
        });

        // Rotation du refresh token
        await UserRepository.updateRefreshToken(user.id, await User.hashPassword(newRefreshToken));

        res.json({
            success: true,
            data: {
                tokens: {
                    accessToken: newAccessToken,
                    refreshToken: newRefreshToken,
                    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
                }
            }
        });

    } catch (error) {
        console.error('❌ Erreur refreshTokens:', error);
        res.status(401).json({
            success: false,
            message: 'Session expirée ou refresh token invalide'
        });
    }
};

/**
 * Déconnexion
 */
export const logout = async (req, res) => {
    try {
        if (req.user?.userId) {
            await UserRepository.updateRefreshToken(req.user.userId, null);
        }
        res.json({
            success: true,
            message: 'Déconnexion réussie'
        });
    } catch (error) {
        console.error('❌ Erreur logout:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la déconnexion'
        });
    }
};

/**
 * Obtenir le profil
 */
export const getProfile = async (req, res) => {
    try {
        const user = await UserRepository.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        res.json({
            success: true,
            data: { user: User.sanitize(user) }
        });
    } catch (error) {
        console.error('❌ Erreur getProfile:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération du profil'
        });
    }
};

/**
 * Mise à jour du profil
 */
export const updateProfile = async (req, res) => {
    try {
        const { name } = req.body;
        const userId = req.user.userId;

        if (!name || name.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Le nom doit contenir au moins 2 caractères'
            });
        }

        const updatedUser = await UserRepository.update(userId, { name: name.trim() });
        res.json({
            success: true,
            message: 'Profil mis à jour avec succès',
            data: { user: User.sanitize(updatedUser) }
        });
    } catch (error) {
        console.error('❌ Erreur updateProfile:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour du profil'
        });
    }
};

/**
 * Changement de mot de passe
 */
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.userId;

        if (!currentPassword || !newPassword || newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Données invalides'
            });
        }

        const user = await UserRepository.findByIdWithPassword(userId);
        const isMatch = await User.comparePassword(currentPassword, user.password);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Mot de passe actuel incorrect'
            });
        }

        const hashedPassword = await User.hashPassword(newPassword);
        await UserRepository.updatePassword(userId, hashedPassword);

        res.json({
            success: true,
            message: 'Mot de passe mis à jour avec succès'
        });
    } catch (error) {
        console.error('❌ Erreur changePassword:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors du changement de mot de passe'
        });
    }
};
