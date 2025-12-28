// Google Identity Services type declarations
interface GoogleCredentialResponse {
    credential: string;
    select_by: string;
}

interface GoogleAccountsId {
    initialize: (config: {
        client_id: string;
        callback: (response: GoogleCredentialResponse) => void;
        auto_select?: boolean;
        context?: 'signin' | 'signup' | 'use';
    }) => void;
    renderButton: (
        element: HTMLElement | null,
        config: {
            theme?: 'outline' | 'filled_blue' | 'filled_black';
            size?: 'large' | 'medium' | 'small';
            width?: string | number;
            text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
            shape?: 'rectangular' | 'pill' | 'circle' | 'square';
            logo_alignment?: 'left' | 'center';
            locale?: string;
        }
    ) => void;
    prompt: (notification?: (notification: {
        isDisplayed: () => boolean;
        isNotDisplayed: () => boolean;
        getNotDisplayedReason: () => string;
        isSkippedMoment: () => boolean;
        getSkippedReason: () => string;
        isDismissedMoment: () => boolean;
        getDismissedReason: () => string;
    }) => void) => void;
    cancel: () => void;
    disableAutoSelect: () => void;
    storeCredential: (credential: {
        id: string;
        password: string;
    }, callback?: () => void) => void;
    revoke: (hint: string, callback?: (response: { successful: boolean; error?: string }) => void) => void;
}

interface Google {
    accounts: {
        id: GoogleAccountsId;
    };
}

declare global {
    interface Window {
        google?: Google;
    }
}

export { };
