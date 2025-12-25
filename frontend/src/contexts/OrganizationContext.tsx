import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { organizationsApi, setCurrentOrganizationId } from '../api';

export interface Organization {
    id: number;
    name: string;
    slug: string;
    description?: string;
    logoUrl?: string;
    role: string;
    isDefault: boolean;
    _count?: {
        members: number;
        recipes: number;
        menus: number;
    };
}

interface OrganizationContextType {
    organizations: Organization[];
    currentOrganization: Organization | null;
    isLoading: boolean;
    error: string | null;
    switchOrganization: (organizationId: number) => Promise<void>;
    refreshOrganizations: () => Promise<void>;
    createOrganization: (name: string, description?: string) => Promise<Organization>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export const useOrganization = () => {
    const context = useContext(OrganizationContext);
    if (context === undefined) {
        throw new Error('useOrganization must be used within an OrganizationProvider');
    }
    return context;
};

interface OrganizationProviderProps {
    children: ReactNode;
}

export const OrganizationProvider = ({ children }: OrganizationProviderProps) => {
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refreshOrganizations = useCallback(async () => {
        try {
            setError(null);
            const response = await organizationsApi.getAll();
            const orgs = response.data as Organization[];
            setOrganizations(orgs);

            // Set default organization
            const defaultOrg = orgs.find(org => org.isDefault) || orgs[0];
            if (defaultOrg && (!currentOrganization || currentOrganization.id !== defaultOrg.id)) {
                setCurrentOrganization(defaultOrg);
                setCurrentOrganizationId(defaultOrg.id);
            }
        } catch (err: any) {
            // If 401, user is not authenticated - this is expected
            if (err.response?.status !== 401) {
                setError(err.response?.data?.error || 'Gagal memuat organisasi');
            }
            setOrganizations([]);
            setCurrentOrganization(null);
            setCurrentOrganizationId(null);
        } finally {
            setIsLoading(false);
        }
    }, [currentOrganization]);

    useEffect(() => {
        refreshOrganizations();
    }, []);

    const switchOrganization = async (organizationId: number) => {
        const org = organizations.find(o => o.id === organizationId);
        if (org) {
            setCurrentOrganization(org);
            setCurrentOrganizationId(org.id);
            
            // Set as default on server
            try {
                await organizationsApi.setDefault(organizationId);
                // Update local state
                setOrganizations(prev => 
                    prev.map(o => ({ ...o, isDefault: o.id === organizationId }))
                );
            } catch (err) {
                console.error('Failed to set default organization:', err);
            }
        }
    };

    const createOrganization = async (name: string, description?: string): Promise<Organization> => {
        const response = await organizationsApi.create({ name, description });
        await refreshOrganizations();
        return response.data;
    };

    const value = {
        organizations,
        currentOrganization,
        isLoading,
        error,
        switchOrganization,
        refreshOrganizations,
        createOrganization,
    };

    return (
        <OrganizationContext.Provider value={value}>
            {children}
        </OrganizationContext.Provider>
    );
};
