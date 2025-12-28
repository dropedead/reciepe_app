import { Request, Response } from 'express';
import * as authService from '../services/authService';

// Register
export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Email, password, dan nama wajib diisi' });
        }

        const result = await authService.register({ email, password, name });

        // Set cookie
        res.cookie('token', result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.status(201).json({
            message: 'Registrasi berhasil',
            user: result.user,
            token: result.token,
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(400).json({ error: error instanceof Error ? error.message : 'Registrasi gagal' });
    }
};

// Login
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email dan password wajib diisi' });
        }

        const result = await authService.login({ email, password });

        // Set cookie
        res.cookie('token', result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.json({
            message: 'Login berhasil',
            user: result.user,
            token: result.token,
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(401).json({ error: error instanceof Error ? error.message : 'Login gagal' });
    }
};

// Logout
export const logout = async (req: Request, res: Response) => {
    res.clearCookie('token');
    res.json({ message: 'Logout berhasil' });
};

// Get current user
export const me = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Tidak terautentikasi' });
        }
        res.json({ user: req.user });
    } catch (error) {
        console.error('Me error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan' });
    }
};

// Verify email
export const verifyEmail = async (req: Request, res: Response) => {
    try {
        const { token } = req.params;
        await authService.verifyEmail(token);
        res.json({ message: 'Email berhasil diverifikasi' });
    } catch (error) {
        console.error('Verify email error:', error);
        res.status(400).json({ error: error instanceof Error ? error.message : 'Verifikasi gagal' });
    }
};

// Request password reset
export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email wajib diisi' });
        }

        const resetToken = await authService.requestPasswordReset(email);

        // TODO: Send email with reset link
        // For now, return token in response (development only)
        res.json({
            message: 'Link reset password telah dikirim ke email Anda',
            resetToken: process.env.NODE_ENV !== 'production' ? resetToken : undefined,
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(400).json({ error: error instanceof Error ? error.message : 'Gagal mengirim reset link' });
    }
};

// Reset password
export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ error: 'Password baru wajib diisi' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password minimal 6 karakter' });
        }

        await authService.resetPassword(token, password);
        res.json({ message: 'Password berhasil direset' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(400).json({ error: error instanceof Error ? error.message : 'Reset password gagal' });
    }
};

// Change password (for authenticated users)
export const changePassword = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Tidak terautentikasi' });
        }

        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Password saat ini dan password baru wajib diisi' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'Password baru minimal 6 karakter' });
        }

        await authService.changePassword(req.user.id, currentPassword, newPassword);
        res.json({ message: 'Password berhasil diubah' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(400).json({ error: error instanceof Error ? error.message : 'Gagal mengubah password' });
    }
};

// Update profile (for authenticated users)
export const updateProfile = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Tidak terautentikasi' });
        }

        const { name, email, avatar } = req.body;

        const result = await authService.updateProfile(req.user.id, { name, email, avatar });

        res.json({
            message: result.emailChanged
                ? 'Profil berhasil diperbarui. Silakan verifikasi email baru Anda.'
                : 'Profil berhasil diperbarui',
            user: result.user,
            emailChanged: result.emailChanged,
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(400).json({ error: error instanceof Error ? error.message : 'Gagal memperbarui profil' });
    }
};

// ============================================
// Google OAuth Login
// ============================================

import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req: Request, res: Response) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({ error: 'Google credential wajib diisi' });
        }

        // Verify the ID token
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload) {
            return res.status(401).json({ error: 'Token Google tidak valid' });
        }

        const { sub: googleId, email, name, picture } = payload;

        if (!email) {
            return res.status(400).json({ error: 'Email diperlukan dari akun Google' });
        }

        const result = await authService.googleAuth({
            email,
            name: name || email.split('@')[0],
            googleId: googleId!,
            avatar: picture,
        });

        // Set cookie
        res.cookie('token', result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.json({
            message: 'Login dengan Google berhasil',
            user: result.user,
            token: result.token,
        });
    } catch (error) {
        console.error('Google login error:', error);
        res.status(401).json({ error: 'Autentikasi Google gagal' });
    }
};

// ============================================
// Onboarding Endpoints
// ============================================

// Setup organization (Onboarding Step 1)
export const setupOrganization = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Tidak terautentikasi' });
        }

        const { name, description } = req.body;

        if (!name || name.trim().length === 0) {
            return res.status(400).json({ error: 'Nama organisasi wajib diisi' });
        }

        const organization = await authService.setupOrganization(req.user.id, { name, description });

        res.status(201).json({
            message: 'Organisasi berhasil dibuat',
            organization,
        });
    } catch (error) {
        console.error('Setup organization error:', error);
        res.status(400).json({ error: error instanceof Error ? error.message : 'Gagal membuat organisasi' });
    }
};

// Complete onboarding (skip invitation step)
export const completeOnboarding = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Tidak terautentikasi' });
        }

        await authService.completeOnboarding(req.user.id);

        res.json({ message: 'Onboarding selesai', success: true });
    } catch (error) {
        console.error('Complete onboarding error:', error);
        res.status(400).json({ error: 'Gagal menyelesaikan onboarding' });
    }
};

// Get onboarding status
export const getOnboardingStatus = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Tidak terautentikasi' });
        }

        const status = await authService.getUserOnboardingStatus(req.user.id);

        res.json(status);
    } catch (error) {
        console.error('Get onboarding status error:', error);
        res.status(500).json({ error: 'Gagal mendapatkan status onboarding' });
    }
};
