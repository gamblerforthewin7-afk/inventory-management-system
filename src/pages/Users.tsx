import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { User, UserRole } from '../types';
import { Badge } from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';
import { Users as UsersIcon, Shield, CheckCircle, Lock } from 'lucide-react';

export const UsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);

  const loadUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (userId: number, newRole: UserRole) => {
    await api.updateUserRole(userId, newRole);
    loadUsers();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-dark-border pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">System Access & Role Control</h1>
          <p className="text-xs text-text-secondary mt-1">
            Manage user accounts and role assignments (Admin, Inventory Manager, Warehouse Staff).
          </p>
        </div>
      </div>

      <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden shadow-dark-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-dark-panel border-b border-dark-border text-zinc-400 font-medium">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Email</th>
                <th className="p-4">Department</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-dark-panel/50">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-600/40 flex items-center justify-center text-red-400 font-bold">
                        {u.fullName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-text-primary">{u.fullName}</div>
                        <div className="text-[10px] text-zinc-500 font-mono">@{u.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-zinc-300 font-mono">{u.email}</td>
                  <td className="p-4 text-zinc-400">{u.department}</td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded text-xs font-bold capitalize ${
                        u.role === 'admin'
                          ? 'bg-red-950 text-red-400 border border-red-800'
                          : u.role === 'manager'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <Badge variant="success">Active</Badge>
                  </td>
                  <td className="p-4 text-right">
                    {currentUser?.role === 'admin' ? (
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                        className="bg-dark-panel border border-dark-border rounded px-2 py-1 text-xs text-text-primary focus:border-red-600 cursor-pointer"
                      >
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                        <option value="staff">Staff</option>
                      </select>
                    ) : (
                      <span className="text-zinc-500 text-[10px]">Read-only</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
