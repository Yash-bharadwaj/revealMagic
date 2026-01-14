
import React, { useState, useEffect } from 'react';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Toast } from '../components/Toast';
import { Performer, User } from '../types';
import { firestoreService } from '../services/firestoreService';

interface UserWithId extends User {
  id: string;
}

const AdminDashboard: React.FC = () => {
  const [performers, setPerformers] = useState<Performer[]>([]);
  const [users, setUsers] = useState<UserWithId[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPerformer, setNewPerformer] = useState({ 
    name: '', 
    username: '', 
    email: '', 
    password: '',
    customId: '' 
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingPerformer, setIsCreatingPerformer] = useState(false);
  const [isDeletingPerformer, setIsDeletingPerformer] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; performerId: string | null; performerName: string }>({
    isOpen: false,
    performerId: null,
    performerName: ''
  });
  const [toast, setToast] = useState<{ isVisible: boolean; message: string; type: 'success' | 'error' | 'info' }>({
    isVisible: false,
    message: '',
    type: 'info'
  });

  useEffect(() => {
    setIsLoading(false);

    // Subscribe to real-time performer updates
    const unsubscribe = firestoreService.subscribePerformers((data) => {
      setPerformers(data);
    });

    // Load users
    loadUsers();

    return () => unsubscribe();
  }, []);

  const loadUsers = async () => {
    try {
      const allUsers = await firestoreService.getAllUsers();
      setUsers(allUsers as UserWithId[]);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ isVisible: true, message, type });
  };

  const handleAddPerformer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPerformer.name || !newPerformer.username || !newPerformer.email || !newPerformer.password || !newPerformer.customId) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    if (newPerformer.password.length < 6) {
      showToast('Password must be at least 6 characters long', 'error');
      return;
    }

    // Validate customId format
    if (!/^[a-zA-Z0-9_-]+$/.test(newPerformer.customId)) {
      showToast('Custom ID can only contain letters, numbers, hyphens, and underscores', 'error');
      return;
    }

    setIsCreatingPerformer(true);
    let createdPerformer: Performer | null = null;
    
    try {
      // First, create the performer with custom ID
      createdPerformer = await firestoreService.addPerformer({
        name: newPerformer.name,
        username: newPerformer.username
      }, newPerformer.customId);

      // Then, create the user account and link it to the performer
      await firestoreService.createUser(
        newPerformer.email,
        newPerformer.password,
        'performer',
        createdPerformer.id
      );

      setNewPerformer({ name: '', username: '', email: '', password: '', customId: '' });
      setShowAddModal(false);
      await loadUsers(); // Reload users to update the display
      showToast('Performer and user account created successfully!', 'success');
    } catch (error: any) {
      console.error('Error adding performer:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        toString: error.toString()
      });
      
      const errorMsg = error.message || error.toString() || 'Failed to create performer. Please try again.';
      
      // Check for specific error types - check both message and error object
      const lowerErrorMsg = errorMsg.toLowerCase();
      const errorCode = error.code || error.details?.code || '';
      const errorCodeLower = errorCode.toLowerCase();
      
      if (lowerErrorMsg.includes('already in use') || 
          lowerErrorMsg.includes('already-exists') || 
          lowerErrorMsg.includes('email address is already') ||
          lowerErrorMsg.includes('already exists') ||
          errorCodeLower.includes('already-exists') ||
          errorCodeLower.includes('already_exists')) {
        console.log('Showing toast for already exists error');
        showToast('This email address is already in use by another account.', 'error');
        if (createdPerformer) {
          // Clean up the created performer if user creation failed
          try {
            await firestoreService.deletePerformer(createdPerformer.id);
          } catch (cleanupError) {
            console.error('Error cleaning up performer:', cleanupError);
          }
        }
        setIsCreatingPerformer(false);
        return;
      }
      
      // If user creation failed but performer was created
      if (createdPerformer) {
        showToast(
          'Performer created successfully! However, the user account could not be created. Please try again.',
          'error'
        );
        setShowAddModal(false);
        await loadUsers();
      } else {
        // Performer creation failed
        showToast('Failed to create performer. Please try again.', 'error');
      }
    } finally {
      setIsCreatingPerformer(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    const performer = performers.find(p => p.id === id);
    const linkedUser = users.find(u => u.performerId === id);
    setDeleteConfirm({
      isOpen: true,
      performerId: id,
      performerName: performer?.name || 'this performer'
    });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.performerId || isDeletingPerformer) return;
    
    setIsDeletingPerformer(true);
    try {
      await firestoreService.deletePerformer(deleteConfirm.performerId);
      await loadUsers(); // Reload users to update the display
      setDeleteConfirm({ isOpen: false, performerId: null, performerName: '' });
      showToast('Performer deleted successfully!', 'success');
    } catch (error: any) {
      console.error('Error deleting performer:', error);
      showToast('Failed to delete performer. Please try again.', 'error');
      setDeleteConfirm({ isOpen: false, performerId: null, performerName: '' });
    } finally {
      setIsDeletingPerformer(false);
    }
  };

  const cancelDelete = () => {
    if (isDeletingPerformer) return;
    setDeleteConfirm({ isOpen: false, performerId: null, performerName: '' });
  };


  if (isLoading) {
    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-white rounded-lg mb-4"></div>
          <p className="text-zinc-500 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-zinc-800 selection:text-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header Section */}
        <header className="flex items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">Admin</h1>
          <button 
            onClick={() => setShowAddModal(true)}
            className="h-10 px-4 sm:px-6 bg-white hover:bg-zinc-200 text-black text-sm font-bold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Add Performer
          </button>
        </header>

        {/* Table with horizontal scroll on mobile */}
        <div className="border border-zinc-900 rounded-xl overflow-hidden bg-zinc-950/30">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-zinc-900">
                  <th className="px-4 sm:px-6 py-3 text-xs font-bold text-zinc-500 uppercase">Name</th>
                  <th className="px-4 sm:px-6 py-3 text-xs font-bold text-zinc-500 uppercase">Email</th>
                  <th className="px-4 sm:px-6 py-3 text-xs font-bold text-zinc-500 uppercase">ID</th>
                  <th className="px-4 sm:px-6 py-3 text-xs font-bold text-zinc-500 uppercase text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {performers.map((p) => {
                  const linkedUser = users.find(u => u.performerId === p.id);
                  return (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-md bg-white flex items-center justify-center text-xs font-black text-black flex-shrink-0">
                            {p.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-white truncate">{p.name}</p>
                            <p className="text-xs text-zinc-500 mt-0.5">@{p.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        {linkedUser ? (
                          <span className="text-xs text-zinc-400 font-mono break-all">{linkedUser.email}</span>
                        ) : (
                          <span className="text-xs text-zinc-600">—</span>
                        )}
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <span className="text-xs font-mono text-zinc-500 bg-zinc-900 px-2 py-1 rounded border border-zinc-800">
                          /{p.id}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex justify-center">
                          <button 
                            onClick={() => handleDeleteClick(p.id)}
                            disabled={isDeletingPerformer}
                            className="text-rose-600 hover:text-rose-500 transition-all px-3 py-1.5 rounded-lg border border-rose-800/50 hover:border-rose-600 text-xs font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {performers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 sm:px-6 py-16 text-center text-sm text-zinc-500">
                      No performers found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add Performer Modal */}
      {showAddModal && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[200] flex items-start sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAddModal(false);
            }
          }}
        >
          <div className="bg-black border border-zinc-800 w-full sm:w-auto sm:max-w-[600px] rounded-none sm:rounded-xl shadow-2xl min-h-full sm:min-h-0 my-0 sm:my-auto">
            <div className="sticky top-0 bg-black border-b border-zinc-800 px-4 sm:px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-bold text-white">Add Performer</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-zinc-500 hover:text-white transition-colors p-1"
                disabled={isCreatingPerformer}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleAddPerformer} className="p-4 sm:p-6 space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-2">Full Name</label>
                  <input 
                    type="text" 
                    value={newPerformer.name}
                    onChange={(e) => setNewPerformer({...newPerformer, name: e.target.value})}
                    className="w-full bg-black border border-zinc-800 rounded-lg px-4 h-11 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-white transition-colors"
                    placeholder="Enter full name"
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-2">Username</label>
                  <input 
                    type="text" 
                    value={newPerformer.username}
                    onChange={(e) => setNewPerformer({...newPerformer, username: e.target.value})}
                    className="w-full bg-black border border-zinc-800 rounded-lg px-4 h-11 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-white transition-colors"
                    placeholder="Enter username"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-2">Login URL ID</label>
                  <input 
                    type="text" 
                    value={newPerformer.customId}
                    onChange={(e) => setNewPerformer({...newPerformer, customId: e.target.value})}
                    className="w-full bg-black border border-zinc-800 rounded-lg px-4 h-11 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-white transition-colors"
                    placeholder="e.g., john-smith"
                    required
                  />
                  <p className="text-[10px] text-zinc-600 mt-1">Letters, numbers, hyphens, and underscores only</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-2">Email</label>
                  <input 
                    type="email" 
                    value={newPerformer.email}
                    onChange={(e) => setNewPerformer({...newPerformer, email: e.target.value})}
                    className="w-full bg-black border border-zinc-800 rounded-lg px-4 h-11 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-white transition-colors"
                    placeholder="Enter email address"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-2">Password</label>
                  <input 
                    type="password" 
                    value={newPerformer.password}
                    onChange={(e) => setNewPerformer({...newPerformer, password: e.target.value})}
                    className="w-full bg-black border border-zinc-800 rounded-lg px-4 h-11 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-white transition-colors"
                    placeholder="Enter password (min 6 characters)"
                    required
                    minLength={6}
                  />
                  <p className="text-[10px] text-zinc-600 mt-1">Must be at least 6 characters</p>
                </div>
              </div>
              
              <div className="flex flex-col gap-3 pt-4 border-t border-zinc-800">
                <button 
                  type="submit"
                  disabled={isCreatingPerformer}
                  className="w-full h-11 bg-white hover:bg-zinc-200 text-black text-sm font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isCreatingPerformer ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    'Create Performer'
                  )}
                </button>
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={isCreatingPerformer}
                  className="w-full h-11 bg-transparent text-zinc-500 hover:text-white text-sm font-medium transition-all disabled:opacity-50 border border-zinc-800 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Delete Performer"
        message={
          deleteConfirm.performerId
            ? (() => {
                const linkedUser = users.find(u => u.performerId === deleteConfirm.performerId);
                return linkedUser
                  ? `Are you sure you want to delete "${deleteConfirm.performerName}"?\n\nThis will permanently delete:\n- Performer profile\n- User account\n- All associated data`
                  : `Are you sure you want to delete "${deleteConfirm.performerName}"?\n\nAll their data will be permanently lost.`;
              })()
            : ''
        }
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeletingPerformer}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
        duration={toast.type === 'error' ? 5000 : 3000}
      />

    </div>
  );
};

export default AdminDashboard;
