import prisma from '../config/database';

// Types
export interface CreateNotificationInput {
    userId: number;
    type: 'INVITATION' | 'SYSTEM' | 'INFO';
    title: string;
    message: string;
    data?: Record<string, any>;
}

// Create a new notification
export const createNotification = async (input: CreateNotificationInput) => {
    const notification = await prisma.notification.create({
        data: {
            userId: input.userId,
            type: input.type,
            title: input.title,
            message: input.message,
            data: input.data || null,
        },
    });
    return notification;
};

// Get all notifications for a user
export const getNotifications = async (userId: number, unreadOnly = false) => {
    const notifications = await prisma.notification.findMany({
        where: {
            userId,
            ...(unreadOnly ? { isRead: false } : {}),
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
    return notifications;
};

// Get unread notification count
export const getUnreadCount = async (userId: number) => {
    const count = await prisma.notification.count({
        where: {
            userId,
            isRead: false,
        },
    });
    return count;
};

// Mark a notification as read
export const markAsRead = async (notificationId: number, userId: number) => {
    const notification = await prisma.notification.updateMany({
        where: {
            id: notificationId,
            userId, // Ensure user owns this notification
        },
        data: {
            isRead: true,
        },
    });
    return notification.count > 0;
};

// Mark all notifications as read
export const markAllAsRead = async (userId: number) => {
    const result = await prisma.notification.updateMany({
        where: {
            userId,
            isRead: false,
        },
        data: {
            isRead: true,
        },
    });
    return result.count;
};

// Delete a notification
export const deleteNotification = async (notificationId: number, userId: number) => {
    const result = await prisma.notification.deleteMany({
        where: {
            id: notificationId,
            userId,
        },
    });
    return result.count > 0;
};

// Create invitation notification
export const createInvitationNotification = async (
    inviteeId: number,
    inviterId: number,
    organizationName: string,
    invitationId: number,
    role: string
) => {
    // Get inviter name
    const inviter = await prisma.user.findUnique({
        where: { id: inviterId },
        select: { name: true },
    });

    return createNotification({
        userId: inviteeId,
        type: 'INVITATION',
        title: 'Undangan Tim',
        message: `${inviter?.name || 'Seseorang'} mengundang Anda untuk bergabung ke organisasi "${organizationName}" sebagai ${role}`,
        data: {
            invitationId,
            inviterId,
            organizationName,
            role,
        },
    });
};
