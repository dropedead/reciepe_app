import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, Users, ArrowRight, Mail, Plus, X, Loader2, CheckCircle2,
  AlertCircle, Crown, Shield, User, Sparkles, LogOut, ChevronDown, Check
} from 'lucide-react';
import { authApi, invitationsApi } from '../api';
import { useAuth } from '../contexts/AuthContext';

interface InviteeItem {
  email: string;
  role: 'ADMIN' | 'MEMBER';
}

const Onboarding = () => {
  const navigate = useNavigate();
  const { refreshUser, logout } = useAuth();
  
  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  
  // Step 1: Organization setup
  const [orgName, setOrgName] = useState('');
  const [orgDescription, setOrgDescription] = useState('');
  const [isCreatingOrg, setIsCreatingOrg] = useState(false);
  const [orgError, setOrgError] = useState('');
  
  // Step 2: Team invitations
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'ADMIN' | 'MEMBER'>('MEMBER');
  const [invitees, setInvitees] = useState<InviteeItem[]>([]);
  const [isSendingInvites, setIsSendingInvites] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [showRoleModal, setShowRoleModal] = useState(false);

  // Check onboarding status on mount
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const response = await authApi.getOnboardingStatus();
        const { hasOrganization, onboardingCompleted } = response.data;
        
        // If onboarding is already completed, redirect to dashboard
        if (onboardingCompleted) {
          navigate('/', { replace: true });
          return;
        }
        
        // If user already has an organization but onboarding not completed,
        // they left during step 2, so skip to step 2
        if (hasOrganization) {
          setCurrentStep(2);
        }
      } catch (err) {
        console.error('Failed to check onboarding status:', err);
      } finally {
        setIsCheckingStatus(false);
      }
    };
    
    checkOnboardingStatus();
  }, [navigate]);


  // Handle organization creation
  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrgError('');
    
    if (!orgName.trim()) {
      setOrgError('Nama organisasi wajib diisi');
      return;
    }

    setIsCreatingOrg(true);
    try {
      await authApi.setupOrganization({ 
        name: orgName.trim(), 
        description: orgDescription.trim() || undefined 
      });
      await refreshUser();
      setCurrentStep(2);
    } catch (err: any) {
      setOrgError(err.response?.data?.error || 'Gagal membuat organisasi');
    } finally {
      setIsCreatingOrg(false);
    }
  };

  // Add invitee to list
  const handleAddInvitee = () => {
    if (!inviteEmail.trim()) return;
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      setInviteError('Format email tidak valid');
      return;
    }

    // Check for duplicates
    if (invitees.some(inv => inv.email.toLowerCase() === inviteEmail.toLowerCase())) {
      setInviteError('Email sudah ditambahkan');
      return;
    }

    setInvitees([...invitees, { email: inviteEmail.trim(), role: inviteRole }]);
    setInviteEmail('');
    setInviteRole('MEMBER');
    setInviteError('');
  };

  // Remove invitee from list
  const handleRemoveInvitee = (email: string) => {
    setInvitees(invitees.filter(inv => inv.email !== email));
  };

  // Send invitations and complete onboarding
  const handleFinishOnboarding = async () => {
    setIsSendingInvites(true);
    try {
      // Send invitations if any
      for (const invitee of invitees) {
        try {
          await invitationsApi.create({ email: invitee.email, role: invitee.role });
        } catch (err) {
          console.error(`Failed to invite ${invitee.email}:`, err);
        }
      }
      
      // Complete onboarding
      await authApi.completeOnboarding();
      await refreshUser();
      
      // Navigate to dashboard
      navigate('/', { replace: true });
    } catch (err: any) {
      setInviteError(err.response?.data?.error || 'Gagal menyelesaikan onboarding');
    } finally {
      setIsSendingInvites(false);
    }
  };

  // Skip invitations
  const handleSkip = async () => {
    setIsSendingInvites(true);
    try {
      await authApi.completeOnboarding();
      await refreshUser();
      navigate('/', { replace: true });
    } catch (err: any) {
      setInviteError(err.response?.data?.error || 'Gagal menyelesaikan onboarding');
    } finally {
      setIsSendingInvites(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN': return <Shield size={14} className="text-blue-400" />;
      default: return <User size={14} className="text-gray-400" />;
    }
  };

  // Show loading while checking status
  if (isCheckingStatus) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="text-primary-500 animate-spin" />
          <p className="text-gray-500 dark:text-dark-400">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] bg-gradient-to-br from-primary-500/10 via-transparent to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-primary-600/10 via-transparent to-transparent rounded-full blur-3xl" />
      </div>

      {/* Logout button */}
      <button
        onClick={logout}
        className="absolute top-4 right-4 flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-dark-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
      >
        <LogOut size={16} />
        <span>Logout</span>
      </button>


      <div className="relative w-full max-w-lg">
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
            currentStep >= 1 ? 'bg-primary-500 text-white' : 'bg-gray-200 dark:bg-dark-700 text-gray-500'
          } transition-colors`}>
            {currentStep > 1 ? <CheckCircle2 size={20} /> : <Building2 size={20} />}
          </div>
          <div className={`w-16 h-1 rounded-full ${
            currentStep > 1 ? 'bg-primary-500' : 'bg-gray-200 dark:bg-dark-700'
          } transition-colors`} />
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
            currentStep >= 2 ? 'bg-primary-500 text-white' : 'bg-gray-200 dark:bg-dark-700 text-gray-500'
          } transition-colors`}>
            <Users size={20} />
          </div>
        </div>

        <div className="card p-8 animate-fade-in">
          {currentStep === 1 && (
            <>
              {/* Step 1: Organization Setup */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Building2 size={28} className="text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Buat Organisasi Anda
                </h1>
                <p className="text-gray-500 dark:text-dark-400">
                  Organisasi adalah tempat Anda mengelola resep, menu, dan tim
                </p>
              </div>

              {orgError && (
                <div className="alert alert-error mb-6">
                  <AlertCircle size={18} />
                  <span>{orgError}</span>
                </div>
              )}

              <form onSubmit={handleCreateOrganization} className="space-y-5">
                <div>
                  <label htmlFor="org-name" className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
                    Nama Organisasi <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Building2 size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-dark-400" />
                    <input
                      type="text"
                      id="org-name"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      placeholder="Contoh: Warung Makan Sederhana"
                      required
                      className="input pl-11"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="org-desc" className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
                    Deskripsi <span className="text-gray-400">(Opsional)</span>
                  </label>
                  <textarea
                    id="org-desc"
                    value={orgDescription}
                    onChange={(e) => setOrgDescription(e.target.value)}
                    placeholder="Deskripsi singkat tentang bisnis Anda..."
                    rows={3}
                    className="input resize-none"
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary w-full py-3 mt-6"
                  disabled={isCreatingOrg}
                >
                  {isCreatingOrg ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Membuat Organisasi...
                    </>
                  ) : (
                    <>
                      Lanjutkan
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {currentStep === 2 && (
            <>
              {/* Step 2: Team Invitations */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Users size={28} className="text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Undang Tim Anda
                </h1>
                <p className="text-gray-500 dark:text-dark-400">
                  Tambahkan anggota tim untuk berkolaborasi (Opsional)
                </p>
              </div>

              {inviteError && (
                <div className="alert alert-error mb-6">
                  <AlertCircle size={18} />
                  <span>{inviteError}</span>
                </div>
              )}

              {/* Add invitee form */}
              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-dark-400" />
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="email@contoh.com"
                    className="input pl-11"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInvitee())}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowRoleModal(true)}
                  className="input w-32 bg-white dark:bg-dark-800 text-gray-900 dark:text-white cursor-pointer flex items-center justify-between gap-1"
                >
                  <div className="flex items-center gap-1.5">
                    {inviteRole === 'ADMIN' ? <Shield size={14} className="text-blue-500" /> : <User size={14} className="text-gray-500" />}
                    <span className="text-sm">{inviteRole === 'ADMIN' ? 'Admin' : 'Member'}</span>
                  </div>
                  <ChevronDown size={14} className="text-gray-400" />
                </button>
                <button 
                  type="button"
                  onClick={handleAddInvitee}
                  className="btn btn-primary px-3"
                >
                  <Plus size={18} />
                </button>
              </div>

              {/* Role Selection Modal */}
              {showRoleModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowRoleModal(false)}>
                  <div 
                    className="bg-white dark:bg-dark-800 rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl animate-fade-in"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pilih Role</h3>
                      <button 
                        onClick={() => setShowRoleModal(false)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {/* Member Option */}
                      <button
                        onClick={() => { setInviteRole('MEMBER'); setShowRoleModal(false); }}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                          inviteRole === 'MEMBER' 
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10' 
                            : 'border-gray-200 dark:border-dark-600 hover:border-gray-300 dark:hover:border-dark-500 hover:bg-gray-50 dark:hover:bg-dark-700/50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            inviteRole === 'MEMBER' ? 'bg-primary-100 dark:bg-primary-500/20' : 'bg-gray-100 dark:bg-dark-700'
                          }`}>
                            <User size={20} className={inviteRole === 'MEMBER' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-dark-400'} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900 dark:text-white">Member</span>
                              {inviteRole === 'MEMBER' && <Check size={16} className="text-primary-500" />}
                            </div>
                            <p className="text-sm text-gray-500 dark:text-dark-400 mt-1">
                              Dapat melihat dan mengedit resep, menu, dan bahan. Tidak dapat mengelola anggota tim.
                            </p>
                          </div>
                        </div>
                      </button>

                      {/* Admin Option */}
                      <button
                        onClick={() => { setInviteRole('ADMIN'); setShowRoleModal(false); }}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                          inviteRole === 'ADMIN' 
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10' 
                            : 'border-gray-200 dark:border-dark-600 hover:border-gray-300 dark:hover:border-dark-500 hover:bg-gray-50 dark:hover:bg-dark-700/50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            inviteRole === 'ADMIN' ? 'bg-blue-100 dark:bg-blue-500/20' : 'bg-gray-100 dark:bg-dark-700'
                          }`}>
                            <Shield size={20} className={inviteRole === 'ADMIN' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-dark-400'} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900 dark:text-white">Admin</span>
                              {inviteRole === 'ADMIN' && <Check size={16} className="text-blue-500" />}
                            </div>
                            <p className="text-sm text-gray-500 dark:text-dark-400 mt-1">
                              Akses penuh ke semua fitur. Dapat mengelola anggota tim dan mengundang pengguna baru.
                            </p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Invitee list */}
              {invitees.length > 0 && (
                <div className="space-y-2 mb-6 max-h-48 overflow-y-auto">
                  {invitees.map((invitee, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-700/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-500/20 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-400">
                          <Mail size={14} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{invitee.email}</p>
                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-dark-400">
                            {getRoleIcon(invitee.role)}
                            <span>{invitee.role}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveInvitee(invitee.email)}
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {invitees.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-dark-400">
                  <Users size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Belum ada anggota yang ditambahkan</p>
                  <p className="text-xs mt-1">Anda bisa mengundang anggota nanti</p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3 mt-6">
                <button 
                  type="button"
                  onClick={handleSkip}
                  className="btn btn-secondary flex-1 py-3"
                  disabled={isSendingInvites}
                >
                  Skip untuk Nanti
                </button>
                <button 
                  type="button"
                  onClick={handleFinishOnboarding}
                  className="btn btn-primary flex-1 py-3"
                  disabled={isSendingInvites}
                >
                  {isSendingInvites ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      {invitees.length > 0 ? 'Kirim & Selesai' : 'Selesai'}
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer hint */}
        <p className="text-center text-sm text-gray-500 dark:text-dark-400 mt-6">
          <Crown size={14} className="inline mr-1" />
          Anda akan menjadi <span className="font-medium text-primary-600 dark:text-primary-400">Owner</span> dari organisasi ini
        </p>
      </div>
    </div>
  );
};

export default Onboarding;
