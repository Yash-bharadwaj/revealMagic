
import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
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
        if (errorMsg.includes('Local API server is not running')) {
          showToast(
            'Performer created successfully! User account creation failed. Please start the local API server or use the create-user script.',
            'error'
          );
        } else {
          showToast(
            `Performer created successfully! User account creation failed: ${errorMsg}. Use the create-user script to create the account manually.`,
            'error'
          );
        }
        setShowAddModal(false);
        await loadUsers();
      } else {
        // Performer creation failed
        showToast(`Failed to create performer: ${errorMsg}`, 'error');
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
      showToast(error.message || 'Failed to delete performer. Please try again.', 'error');
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
          <p className="text-zinc-500 font-medium">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-zinc-800 selection:text-white">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">System Infrastructure</h1>
            <p className="text-sm text-zinc-500 mt-2 uppercase tracking-widest font-medium">Network Administration</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowAddModal(true)}
              className="h-11 px-6 bg-white hover:bg-zinc-200 text-black text-xs font-black uppercase tracking-widest rounded-lg transition-all flex items-center gap-2 shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path>
              </svg>
              Add Performer
            </button>
          </div>
        </header>

        {/* Performer Registry Table */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">Active Registry</h3>
            <div className="h-px flex-1 mx-8 bg-zinc-900"></div>
          </div>
          
          <div className="border border-zinc-900 rounded-2xl overflow-hidden bg-zinc-950/30">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-900">
                  <th className="px-8 py-5 text-[10px] font-black text-zinc-600 uppercase tracking-widest">Identification</th>
                  <th className="px-8 py-5 text-[10px] font-black text-zinc-600 uppercase tracking-widest hidden sm:table-cell">Email</th>
                  <th className="px-8 py-5 text-[10px] font-black text-zinc-600 uppercase tracking-widest hidden sm:table-cell">Secret Key</th>
                  <th className="px-8 py-5 text-[10px] font-black text-zinc-600 uppercase tracking-widest text-center">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {performers.map((p) => {
                  const linkedUser = users.find(u => u.performerId === p.id);
                  return (
                    <tr key={p.id} className="group hover:bg-white/[0.01] transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-5">
                          <div className="w-10 h-10 rounded-md bg-white flex items-center justify-center text-[10px] font-black text-black">
                            {p.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white tracking-tight">{p.name}</p>
                            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-0.5">@{p.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 hidden sm:table-cell">
                        {linkedUser ? (
                          <span className="text-[10px] text-zinc-400 font-mono">{linkedUser.email}</span>
                        ) : (
                          <span className="text-[10px] text-zinc-700">—</span>
                        )}
                      </td>
                      <td className="px-8 py-6 hidden sm:table-cell">
                        <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900 px-3 py-1.5 rounded border border-zinc-800">
                          /{p.id}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex justify-center">
                          <button 
                            onClick={() => handleDeleteClick(p.id)}
                            disabled={isDeletingPerformer}
                            className="text-rose-600 hover:text-rose-500 transition-all px-3 py-1.5 rounded-lg border border-rose-800/50 hover:border-rose-600 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-rose-600"
                            title="Delete Performer"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    <td colSpan={4} className="px-8 py-24 text-center text-[10px] text-zinc-700 uppercase tracking-[0.5em] font-black">
                      Registry Empty
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>


        <footer className="mt-24 text-center pb-12">
           <div className="h-px w-12 bg-zinc-900 mx-auto mb-8"></div>
           <p className="text-[10px] text-zinc-800 font-black uppercase tracking-[0.6em]">System Management Terminal • Alpha-9</p>
        </footer>
      </main>

      {/* High Contrast Add Performer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300 overflow-y-auto">
          <div className="bg-black border border-zinc-800 w-full max-w-[800px] rounded-2xl p-10 shadow-2xl scale-in-center animate-in zoom-in-95 duration-200 my-8">
            <h2 className="text-2xl font-bold tracking-tight text-white mb-2">Create New Performer</h2>
            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mb-10">Add Performer Profile & Login Account</p>
            
            <form onSubmit={handleAddPerformer} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Full Name</label>
                  <input 
                    type="text" 
                    value={newPerformer.name}
                    onChange={(e) => setNewPerformer({...newPerformer, name: e.target.value})}
                    className="w-full bg-black border border-zinc-800 rounded-lg px-4 h-12 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-white transition-colors"
                    placeholder="Enter performer's full name"
                    required
                    autoFocus
                  />
                  <p className="text-[9px] text-zinc-600 mt-1">The performer's display name</p>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Username</label>
                  <input 
                    type="text" 
                    value={newPerformer.username}
                    onChange={(e) => setNewPerformer({...newPerformer, username: e.target.value})}
                    className="w-full bg-black border border-zinc-800 rounded-lg px-4 h-12 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-white transition-colors"
                    placeholder="Enter username (e.g., johnsmith)"
                    required
                  />
                  <p className="text-[9px] text-zinc-600 mt-1">A unique username for this performer</p>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Login URL ID</label>
                  <input 
                    type="text" 
                    value={newPerformer.customId}
                    onChange={(e) => setNewPerformer({...newPerformer, customId: e.target.value})}
                    className="w-full bg-black border border-zinc-800 rounded-lg px-4 h-12 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-white transition-colors"
                    placeholder="Enter custom ID (e.g., john-smith)"
                    required
                  />
                  <p className="text-[9px] text-zinc-600 mt-1">Custom ID for login URL. Only letters, numbers, hyphens, and underscores allowed.</p>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Login Email</label>
                  <input 
                    type="email" 
                    value={newPerformer.email}
                    onChange={(e) => setNewPerformer({...newPerformer, email: e.target.value})}
                    className="w-full bg-black border border-zinc-800 rounded-lg px-4 h-12 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-white transition-colors"
                    placeholder="Enter email address (e.g., performer@example.com)"
                    required
                  />
                  <p className="text-[9px] text-zinc-600 mt-1">Email address for logging into the dashboard</p>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Login Password</label>
                  <input 
                    type="password" 
                    value={newPerformer.password}
                    onChange={(e) => setNewPerformer({...newPerformer, password: e.target.value})}
                    className="w-full bg-black border border-zinc-800 rounded-lg px-4 h-12 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-white transition-colors"
                    placeholder="Enter password (min 6 characters)"
                    required
                    minLength={6}
                  />
                  <p className="text-[9px] text-zinc-600 mt-1">Password must be at least 6 characters long</p>
                </div>
              </div>
              
              <div className="flex flex-col gap-4 pt-4">
                <button 
                  type="submit"
                  disabled={isCreatingPerformer}
                  className="w-full h-12 bg-white hover:bg-zinc-200 text-black text-xs font-black uppercase tracking-widest rounded-lg transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isCreatingPerformer ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                      <span>Creating Performer...</span>
                    </>
                  ) : (
                    'Create Performer Account'
                  )}
                </button>
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={isCreatingPerformer}
                  className="w-full h-12 bg-transparent text-zinc-500 hover:text-white text-[10px] font-black uppercase tracking-[0.3em] transition-all disabled:opacity-50"
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
                  ? `Are you sure you want to delete "${deleteConfirm.performerName}"?\n\nThis will delete:\n- Performer profile\n- User account (Firestore & Firebase Auth)\n- All associated data`
                  : `Are you sure you want to delete "${deleteConfirm.performerName}"?\n\nAll their data will be lost.`;
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
