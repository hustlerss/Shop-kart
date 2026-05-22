import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api.js';
import Loader from '../../components/Loader.jsx';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete user "${name}"?`)) return;
    try {
      await adminAPI.deleteUser(id);
      setUsers(users.filter(u => u._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <p className="text-sm text-gray-400 font-medium">{users.length} registered accounts</p>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="ml-auto px-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-accent transition-all font-sans"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-premium border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 text-left font-bold">User</th>
              <th className="px-4 py-4 text-left font-bold">Role</th>
              <th className="px-4 py-4 text-left font-bold">City</th>
              <th className="px-4 py-4 text-left font-bold">Joined</th>
              <th className="px-4 py-4 text-left font-bold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredUsers.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${user.role === 'admin' ? 'bg-accent/15 text-accent' : 'bg-primary/10 text-primary'}`}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-xs text-primary">{user.name}</p>
                      <p className="text-gray-400 text-[0.68rem]">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${user.role === 'admin' ? 'bg-accent/10 text-accent border-accent/20' : 'bg-primary/5 text-primary border-primary/10'}`}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-4 text-xs text-gray-500">{user.address?.city || '—'}</td>
                <td className="px-4 py-4 text-xs text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })}
                </td>
                <td className="px-4 py-4">
                  {user.role !== 'admin' ? (
                    <button
                      onClick={() => handleDelete(user._id, user.name)}
                      className="text-xs font-bold text-red-500 border border-red-100 hover:border-red-300 hover:bg-red-50 px-3 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  ) : (
                    <span className="text-xs text-gray-300 font-medium">Protected</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <div className="text-[3rem] mb-3">👤</div>
            <p className="font-semibold">No users found.</p>
            <p className="text-xs mt-1">
              {searchQuery ? `No results for "${searchQuery}".` : 'No registered accounts yet.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
