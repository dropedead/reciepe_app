import { useState, useEffect, useCallback } from 'react';
import { 
  User, Mail, Crown, Shield, Users, Plus, X, Send, Trash2, Clock, 
  RefreshCw, AlertCircle, Loader2, Check, ChevronDown
} from 'lucide-react';
import { useOrganization } from '../contexts/OrganizationContext';
import { organizationsApi, invitationsApi } from '../api';

interface Member {
  id: number;
  userId: number;
  role: string;
  joinedAt: string;
  user: {
    id: number;
    email: string;
    name: string;
    avatar?: string | null;
  };
}

interface Invitation {
  id: number;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
  createdAt: string;
  inviter: {
    name: string;
    email: string;
  };
}

const TeamManagement = () => {
  const { currentOrganization } = useOrganization();
  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('MEMBER');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [showRolePicker, setShowRolePicker] = useState(false);

  const loadData = useCallback(async () => {
    if (!currentOrganization) return;

    setIsLoading(true);
    setError(null);

    try {
      const [membersRes, invitationsRes] = await Promise.all([
        organizationsApi.getMembers(currentOrganization.id),
        invitationsApi.getAll(),
      ]);

      setMembers(membersRes.data);
      setInvitations(invitationsRes.data.filter((inv: Invitation) => inv.status === 'PENDING'));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Gagal memuat data tim');
    } finally {
      setIsLoading(false);
    }
  }, [currentOrganization]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInviting(true);
    setInviteError(null);

    try {
      await invitationsApi.create({ email: inviteEmail, role: inviteRole });
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteRole('MEMBER');
      loadData();
    } catch (err: any) {
      setInviteError(err.response?.data?.error || 'Gagal mengirim undangan');
    } finally {
      setIsInviting(false);
    }
  };

  const handleCancelInvitation = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin membatalkan undangan ini?')) return;
    try {
      await invitationsApi.cancel(id);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Gagal membatalkan undangan');
    }
  };

  const handleResendInvitation = async (id: number) => {
    try {
      await invitationsApi.resend(id);
      alert('Undangan berhasil dikirim ulang');
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Gagal mengirim ulang undangan');
    }
  };

  const handleUpdateRole = async (userId: number, newRole: string) => {
    if (!currentOrganization) return;
    try {
      await organizationsApi.updateMemberRole(currentOrganization.id, userId, newRole);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Gagal mengubah role');
    }
  };

  const handleRemoveMember = async (userId: number, memberName: string) => {
    if (!currentOrganization) return;
    if (!confirm(`Apakah Anda yakin ingin menghapus ${memberName} dari tim?`)) return;
    try {
      await organizationsApi.removeMember(currentOrganization.id, userId);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Gagal menghapus member');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'OWNER': return <Crown size={14} className="text-green-400" />;
      case 'ADMIN': return <Shield size={14} className="text-blue-400" />;
      default: return <User size={14} className="text-gray-400 dark:text-dark-400" />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'OWNER': return 'badge-success';
      case 'ADMIN': return 'badge-primary';
      default: return 'badge-secondary';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (!currentOrganization) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="empty-state">
          <Users size={48} className="mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Tidak Ada Organisasi</h3>
          <p className="text-sm">Silakan pilih organisasi terlebih dahulu</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Users size={28} />
            Manajemen Tim
          </h1>
          <p className="text-gray-500 dark:text-dark-400 mt-1">
            Kelola anggota tim di <span className="text-primary-600 dark:text-primary-400 font-medium">{currentOrganization.name}</span>
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowInviteModal(true)}>
          <Plus size={18} />
          Undang Anggota
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin text-primary-500" />
        </div>
      ) : (
        <>
          {/* Members Section */}
          <div className="card">
            <div className="p-5 border-b border-gray-200 dark:border-dark-700 flex items-center gap-3">
              <Users size={20} className="text-primary-600 dark:text-primary-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Anggota Tim ({members.length})
              </h2>
            </div>
            <div className="p-5">
              {members.length === 0 ? (
                <div className="empty-state py-8">
                  <Users size={32} className="mb-3 opacity-50" />
                  <p>Belum ada anggota tim</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {members.map((member) => (
                    <div 
                      key={member.id} 
                      className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-dark-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
                    >
                      {/* Avatar */}
                      <div className="relative">
                        {member.user.avatar ? (
                          <img 
                            src={member.user.avatar} 
                            alt={member.user.name} 
                            className="w-12 h-12 rounded-full object-cover shadow-sm bg-gray-100"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-sm">
                            {member.user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900 dark:text-white truncate">{member.user.name}</span>
                          {getRoleIcon(member.role)}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-dark-400 truncate">{member.user.email}</p>
                        <p className="text-xs text-gray-500 dark:text-dark-500">Bergabung {formatDate(member.joinedAt)}</p>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <select
                          className={`badge ${getRoleBadge(member.role)} cursor-pointer bg-transparent border-none text-xs font-semibold`}
                          value={member.role}
                          onChange={(e) => handleUpdateRole(member.userId, e.target.value)}
                          disabled={member.role === 'OWNER'}
                        >
                          <option value="OWNER">Owner</option>
                          <option value="ADMIN">Admin</option>
                          <option value="MEMBER">Member</option>
                        </select>
                        {member.role !== 'OWNER' && (
                          <button
                            className="btn btn-ghost btn-icon text-dark-400 hover:text-red-400 hover:bg-red-500/10"
                            onClick={() => handleRemoveMember(member.userId, member.user.name)}
                            title="Hapus dari tim"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Pending Invitations Section */}
          {invitations.length > 0 && (
            <div className="card">
              <div className="p-5 border-b border-gray-200 dark:border-dark-700 flex items-center gap-3">
                <Clock size={20} className="text-amber-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Undangan Pending ({invitations.length})
                </h2>
              </div>
              <div className="p-5">
                <div className="space-y-3">
                  {invitations.map((invitation) => (
                    <div 
                      key={invitation.id} 
                      className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-dark-700/50 rounded-lg border-l-2 border-amber-500"
                    >
                      {/* Icon */}
                      <div className="w-10 h-10 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center flex-shrink-0">
                        <Mail size={18} />
                      </div>
                      
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">{invitation.email}</p>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-dark-400 mt-1">
                          <span className={`badge ${getRoleBadge(invitation.role)}`}>{invitation.role}</span>
                          <span>•</span>
                          <span>Dikirim {formatDate(invitation.createdAt)}</span>
                          <span>•</span>
                          <span>Kadaluarsa {formatDate(invitation.expiresAt)}</span>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          className="btn btn-ghost btn-icon text-gray-400 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400"
                          onClick={() => handleResendInvitation(invitation.id)}
                          title="Kirim ulang undangan"
                        >
                          <RefreshCw size={16} />
                        </button>
                        <button
                          className="btn btn-ghost btn-icon text-gray-400 dark:text-dark-400 hover:text-red-500 dark:hover:text-red-400"
                          onClick={() => handleCancelInvitation(invitation.id)}
                          title="Batalkan undangan"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="modal-overlay" onClick={() => setShowInviteModal(false)}>
          <div className="modal max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Undang Anggota Baru</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowInviteModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleInvite}>
              <div className="modal-body space-y-4">
                {inviteError && (
                  <div className="alert alert-error">
                    <AlertCircle size={18} />
                    <span>{inviteError}</span>
                  </div>
                )}
                
                <div>
                  <label htmlFor="invite-email" className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-dark-400" />
                    <input
                      type="email"
                      id="invite-email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="email@contoh.com"
                      required
                      className="input pl-11"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
                    Role
                  </label>
                  
                  {/* Role Picker Cards */}
                  <div className="space-y-3">
                    {/* Member Option */}
                    <button
                      type="button"
                      onClick={() => setInviteRole('MEMBER')}
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
                      type="button"
                      onClick={() => setInviteRole('ADMIN')}
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
              
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowInviteModal(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" disabled={isInviting}>
                  {isInviting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Mengirim...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Kirim Undangan
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;
