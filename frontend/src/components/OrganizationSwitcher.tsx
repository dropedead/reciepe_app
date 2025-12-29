import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Building2 } from 'lucide-react';
import { useOrganization, Organization } from '../contexts/OrganizationContext';

interface OrganizationSwitcherProps {
    collapsed?: boolean;
    variant?: 'default' | 'compact';
}

const OrganizationSwitcher = ({ collapsed = false, variant = 'default' }: OrganizationSwitcherProps) => {
    const { organizations, currentOrganization, switchOrganization, isLoading } = useOrganization();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (isLoading || !currentOrganization) {
        return (
            <div className={`${variant === 'compact' ? 'h-8 w-32' : 'h-12'} bg-gray-200 dark:bg-dark-700/50 rounded-lg animate-pulse`} />
        );
    }

    const handleSelect = async (org: Organization) => {
        await switchOrganization(org.id);
        setIsOpen(false);
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'OWNER': 
                return <span className="badge badge-success text-[10px] px-1.5 py-0.5">Owner</span>;
            case 'ADMIN': 
                return <span className="badge badge-primary text-[10px] px-1.5 py-0.5">Admin</span>;
            default: 
                return <span className="badge badge-secondary text-[10px] px-1.5 py-0.5">Member</span>;
        }
    };

    // Compact variant for top navbar
    if (variant === 'compact') {
        return (
            <div className="relative" ref={dropdownRef}>
                {/* Compact Trigger Button */}
                <button 
                    className="flex items-center gap-2 px-2.5 py-1.5 bg-gray-100 dark:bg-dark-700/50 hover:bg-gray-200 dark:hover:bg-dark-700 
                               rounded-lg transition-colors text-sm"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {/* Small Avatar */}
                    <div className="w-6 h-6 bg-gradient-to-br from-primary-400 to-primary-600 
                                    rounded-md flex items-center justify-center font-bold text-white 
                                    text-xs flex-shrink-0 overflow-hidden">
                        {currentOrganization.logoUrl ? (
                            <img src={currentOrganization.logoUrl} alt={currentOrganization.name} className="w-full h-full object-cover" />
                        ) : (
                            currentOrganization.name.charAt(0).toUpperCase()
                        )}
                    </div>
                    
                    {/* Name - truncated */}
                    <span className="font-medium text-gray-900 dark:text-white truncate max-w-[100px]">
                        {currentOrganization.name}
                    </span>
                    
                    <ChevronDown 
                        size={14} 
                        className={`text-gray-500 dark:text-dark-400 transition-transform duration-200 flex-shrink-0
                                   ${isOpen ? 'rotate-180' : ''}`}
                    />
                </button>
                
                {/* Dropdown */}
                {isOpen && (
                    <div className="absolute z-50 mt-2 right-0 w-64 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600 rounded-xl 
                                    shadow-xl overflow-hidden animate-fade-in">
                        {/* Header */}
                        <div className="px-4 py-2.5 border-b border-gray-200 dark:border-dark-700">
                            <p className="text-xs font-medium text-gray-500 dark:text-dark-400 uppercase tracking-wider">
                                Organisasi Anda
                            </p>
                        </div>
                        
                        {/* Organization List */}
                        <div className="py-2 max-h-64 overflow-y-auto">
                            {organizations.map(org => (
                                <button
                                    key={org.id}
                                    className={`
                                        w-full flex items-center gap-3 px-4 py-2.5 
                                        hover:bg-gray-50 dark:hover:bg-dark-700/50 transition-colors
                                        ${org.id === currentOrganization.id ? 'bg-primary-50 dark:bg-primary-500/10' : ''}
                                    `}
                                    onClick={() => handleSelect(org)}
                                >
                                    <div className={`
                                        w-8 h-8 rounded-lg flex items-center justify-center 
                                        font-semibold text-sm flex-shrink-0 overflow-hidden
                                        ${org.id === currentOrganization.id 
                                            ? 'bg-gradient-to-br from-primary-400 to-primary-600 text-white' 
                                            : 'bg-gray-200 dark:bg-dark-600 text-gray-600 dark:text-dark-300'}
                                    `}>
                                        {org.logoUrl ? (
                                            <img src={org.logoUrl} alt={org.name} className="w-full h-full object-cover" />
                                        ) : (
                                            org.name.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    
                                    {/* Info */}
                                    <div className="flex-1 min-w-0 text-left">
                                        <p className={`text-sm font-medium truncate
                                            ${org.id === currentOrganization.id ? 'text-primary-600 dark:text-primary-400' : 'text-gray-900 dark:text-white'}
                                        `}>
                                            {org.name}
                                        </p>
                                        {getRoleBadge(org.role)}
                                    </div>
                                    
                                    {/* Check Icon */}
                                    {org.id === currentOrganization.id && (
                                        <Check size={16} className="text-primary-600 dark:text-primary-400 flex-shrink-0" />
                                    )}
                                </button>
                            ))}
                        </div>
                        
                        {/* Footer - Add Organization */}
                        <div className="px-4 py-3 border-t border-gray-200 dark:border-dark-700">
                            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm 
                                              text-gray-500 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-dark-700/50 
                                              rounded-lg transition-colors">
                                <Building2 size={16} />
                                Atur Organisasi
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Default variant (for mobile sidebar)
    return (
        <div className="relative" ref={dropdownRef}>
            {/* Trigger Button */}
            <button 
                className="w-full flex items-center gap-3 px-3 py-2.5 bg-gray-100 dark:bg-dark-700/50 hover:bg-gray-200 dark:hover:bg-dark-700 
                           rounded-lg transition-colors group"
                onClick={() => setIsOpen(!isOpen)}
            >
                {/* Avatar */}
                <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-primary-600 
                                rounded-lg flex items-center justify-center font-bold text-white 
                                text-sm flex-shrink-0 shadow-glow overflow-hidden">
                    {currentOrganization.logoUrl ? (
                        <img src={currentOrganization.logoUrl} alt={currentOrganization.name} className="w-full h-full object-cover" />
                    ) : (
                        currentOrganization.name.charAt(0).toUpperCase()
                    )}
                </div>
                
                {/* Info */}
                {!collapsed && (
                    <>
                        <div className="flex-1 min-w-0 text-left">
                            <p className="font-medium text-sm truncate text-gray-900 dark:text-white">
                                {currentOrganization.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-dark-400">
                                {currentOrganization.role === 'OWNER' ? 'Owner' : 
                                 currentOrganization.role === 'ADMIN' ? 'Admin' : 'Member'}
                            </p>
                        </div>
                        <ChevronDown 
                            size={16} 
                            className={`text-gray-500 dark:text-dark-400 transition-transform duration-200 
                                       ${isOpen ? 'rotate-180' : ''}`}
                        />
                    </>
                )}
            </button>
            
            {/* Dropdown */}
            {isOpen && (
                <div className={`
                    absolute z-50 mt-2 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600 rounded-xl 
                    shadow-xl overflow-hidden animate-fade-in
                    ${collapsed ? 'left-full ml-2 top-0 w-64' : 'left-0 right-0'}
                `}>
                    {/* Header */}
                    <div className="px-4 py-2.5 border-b border-gray-200 dark:border-dark-700">
                        <p className="text-xs font-medium text-gray-500 dark:text-dark-400 uppercase tracking-wider">
                            Organisasi Anda
                        </p>
                    </div>
                    
                    {/* Organization List */}
                    <div className="py-2 max-h-64 overflow-y-auto">
                        {organizations.map(org => (
                            <button
                                key={org.id}
                                className={`
                                    w-full flex items-center gap-3 px-4 py-2.5 
                                    hover:bg-gray-50 dark:hover:bg-dark-700/50 transition-colors
                                    ${org.id === currentOrganization.id ? 'bg-primary-50 dark:bg-primary-500/10' : ''}
                                `}
                                onClick={() => handleSelect(org)}
                            >
                                {/* Avatar */}
                                <div className={`
                                    w-8 h-8 rounded-lg flex items-center justify-center 
                                    font-semibold text-sm flex-shrink-0 overflow-hidden
                                    ${org.id === currentOrganization.id 
                                        ? 'bg-gradient-to-br from-primary-400 to-primary-600 text-white' 
                                        : 'bg-gray-200 dark:bg-dark-600 text-gray-600 dark:text-dark-300'}
                                `}>
                                    {org.logoUrl ? (
                                        <img src={org.logoUrl} alt={org.name} className="w-full h-full object-cover" />
                                    ) : (
                                        org.name.charAt(0).toUpperCase()
                                    )}
                                </div>
                                
                                {/* Info */}
                                <div className="flex-1 min-w-0 text-left">
                                    <p className={`text-sm font-medium truncate
                                        ${org.id === currentOrganization.id ? 'text-primary-600 dark:text-primary-400' : 'text-gray-900 dark:text-white'}
                                    `}>
                                        {org.name}
                                    </p>
                                    {getRoleBadge(org.role)}
                                </div>
                                
                                {/* Check Icon */}
                                {org.id === currentOrganization.id && (
                                    <Check size={16} className="text-primary-600 dark:text-primary-400 flex-shrink-0" />
                                )}
                            </button>
                        ))}
                    </div>
                    
                    {/* Footer - Add Organization */}
                    <div className="px-4 py-3 border-t border-gray-200 dark:border-dark-700">
                        <button className="w-full flex items-center gap-2 px-3 py-2 text-sm 
                                          text-gray-500 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-dark-700/50 
                                          rounded-lg transition-colors">
                            <Building2 size={16} />
                            Atur Organisasi
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrganizationSwitcher;
