import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Shield, Loader } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Badge } from '../components/common/Badge';
import { Table } from '../components/common/Table';
import { Modal } from '../components/common/Modal';
import { formatDate } from '../utils/helpers';
import { AdminService, Admin, AdminActivityLog } from '../services/adminService';
import toast from 'react-hot-toast';

export const Users: React.FC = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [activityLogs, setActivityLogs] = useState<AdminActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [roleStats, setRoleStats] = useState({
    total: 0,
    superAdmins: 0,
    admins: 0,
    moderators: 0,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'activity'>('users');

  const [adminForm, setAdminForm] = useState({
    name: '',
    email: '',
    passwordHash: '', // In real app, this would be handled securely
    role: 'MODERATOR' as 'ADMIN' | 'SUPERADMIN' | 'MODERATOR',
    twoFactor: false,
  });

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [adminsData, activityData, statsData] = await Promise.all([
        AdminService.getAllAdmins(),
        AdminService.getAdminActivityLogs(),
        AdminService.getAdminRoleStats(),
      ]);
      
      setAdmins(adminsData);
      setActivityLogs(activityData);
      setRoleStats(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error(`Failed to load data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredAdmins = admins.filter(
    (admin) =>
      admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role: 'ADMIN' | 'SUPERADMIN' | 'MODERATOR') => {
    const variants: Record<string, 'success' | 'info' | 'warning'> = {
      SUPERADMIN: 'success',
      ADMIN: 'info',
      MODERATOR: 'warning',
    };
    return <Badge variant={variants[role]}>{role}</Badge>;
  };

  const adminColumns = [
    {
      key: 'name',
      header: 'User',
      render: (admin: Admin) => (
        <div>
          <p className="font-medium text-gray-900">{admin.name}</p>
          <p className="text-sm text-gray-500">{admin.email}</p>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (admin: Admin) => getRoleBadge(admin.role),
    },
    {
      key: 'twoFactor',
      header: '2FA',
      render: (admin: Admin) => (
        <Badge variant={admin.two_factor ? 'success' : 'default'} size="sm">
          {admin.two_factor ? 'Enabled' : 'Disabled'}
        </Badge>
      ),
    },
    {
      key: 'lastLogin',
      header: 'Last Login',
      render: (admin: Admin) =>
        admin.last_login ? formatDate(admin.last_login, 'MMM dd, yyyy HH:mm') : 'Never',
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (admin: Admin) => formatDate(admin.created_at, 'MMM dd, yyyy'),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (admin: Admin) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEdit(admin)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(admin.admin_id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const activityColumns = [
    {
      key: 'adminId',
      header: 'Admin ID',
    },
    {
      key: 'action',
      header: 'Action',
      render: (log: AdminActivityLog) => (
        <span className="font-medium text-gray-900">{log.action}</span>
      ),
    },
    {
      key: 'targetTable',
      header: 'Resource',
      render: (log: AdminActivityLog) => (
        <Badge variant="info">
          {log.target_table} {log.target_id ? `#${log.target_id}` : ''}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (log: AdminActivityLog) => {
        const variants: Record<string, 'success' | 'warning' | 'danger'> = {
          SUCCESS: 'success',
          PENDING: 'warning',
          FAILURE: 'danger',
        };
        return <Badge variant={variants[log.status]} size="sm">{log.status}</Badge>;
      },
    },
    {
      key: 'timestamp',
      header: 'Timestamp',
      render: (log: AdminActivityLog) => formatDate(log.timestamp, 'MMM dd, yyyy HH:mm:ss'),
    },
  ];

  const handleEdit = (admin: Admin) => {
    setEditingAdmin(admin);
    setAdminForm({
      name: admin.name,
      email: admin.email,
      passwordHash: '', // Don't pre-fill password
      role: admin.role,
      twoFactor: admin.two_factor,
    });
    setShowCreateModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this admin?')) {
      try {
        await AdminService.deleteAdmin(id);
        toast.success('Admin deleted successfully!');
        await loadData();
      } catch (error) {
        console.error('Error deleting admin:', error);
        toast.error('Failed to delete admin');
      }
    }
  };

  const handleSaveAdmin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!adminForm.name || !adminForm.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);

      if (editingAdmin) {
        // Update existing admin
        const updates: Partial<Admin> = {
          name: adminForm.name,
          email: adminForm.email,
          role: adminForm.role,
          two_factor: adminForm.twoFactor,
        };
        
        // Only include password if provided
        if (adminForm.passwordHash) {
          updates.password_hash = adminForm.passwordHash; // In real app, hash this
        }

        await AdminService.updateAdmin(editingAdmin.admin_id, updates);
        toast.success('Admin updated successfully!');
      } else {
        // Create new admin
        if (!adminForm.passwordHash) {
          toast.error('Password is required for new admin');
          return;
        }

        await AdminService.createAdmin({
          name: adminForm.name,
          email: adminForm.email,
          password_hash: adminForm.passwordHash, // In real app, hash this
          role: adminForm.role,
          two_factor: adminForm.twoFactor,
        });
        toast.success('Admin created successfully!');
      }

      setShowCreateModal(false);
      setEditingAdmin(null);
      setAdminForm({
        name: '',
        email: '',
        passwordHash: '',
        role: 'MODERATOR',
        twoFactor: false,
      });
      await loadData();
    } catch (error) {
      console.error('Error saving admin:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to save admin: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-primary-600" />
        <span className="ml-2 text-gray-600">Loading users...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User & Role Management</h1>
          <p className="text-gray-600 mt-1">Manage admin users and monitor activities</p>
        </div>
        <Button
          variant="primary"
          icon={<Plus className="w-5 h-5" />}
          onClick={() => {
            setEditingAdmin(null);
            setAdminForm({
              name: '',
              email: '',
              passwordHash: '',
              role: 'MODERATOR',
              twoFactor: false,
            });
            setShowCreateModal(true);
          }}
        >
          Add User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">{roleStats.total}</p>
            <p className="text-sm text-gray-600 mt-1">Total Users</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{roleStats.superAdmins}</p>
            <p className="text-sm text-gray-600 mt-1">Super Admins</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">{roleStats.admins}</p>
            <p className="text-sm text-gray-600 mt-1">Admins</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-yellow-600">{roleStats.moderators}</p>
            <p className="text-sm text-gray-600 mt-1">Moderators</p>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'users'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Users
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'activity'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Activity Log
        </button>
      </div>

      {/* Content */}
      {activeTab === 'users' ? (
        <>
          {/* Search */}
          <Card>
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-5 h-5" />}
            />
          </Card>

          {/* Users Table */}
          <Card>
            <Table data={filteredAdmins} columns={adminColumns} emptyMessage="No users found" />
          </Card>
        </>
      ) : (
        <Card title="Activity Log" subtitle="Recent admin activities">
          <Table
            data={activityLogs}
            columns={activityColumns}
            emptyMessage="No activity logs found"
          />
        </Card>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingAdmin(null);
        }}
        title={editingAdmin ? 'Edit Admin' : 'Add New Admin'}
        size="md"
      >
        <form onSubmit={handleSaveAdmin} className="space-y-4">
          <Input
            label="Name"
            value={adminForm.name}
            onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
            required
          />

          <Input
            label="Email"
            type="email"
            value={adminForm.email}
            onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
            required
          />

          <Input
            label={editingAdmin ? "Password (leave blank to keep current)" : "Password"}
            type="password"
            value={adminForm.passwordHash}
            onChange={(e) => setAdminForm({ ...adminForm, passwordHash: e.target.value })}
            required={!editingAdmin}
            placeholder={editingAdmin ? "Leave blank to keep current password" : "Enter password"}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={adminForm.role}
              onChange={(e) => setAdminForm({ ...adminForm, role: e.target.value as 'ADMIN' | 'SUPERADMIN' | 'MODERATOR' })}
              className="input-field"
            >
              <option value="SUPERADMIN">Super Admin</option>
              <option value="ADMIN">Admin</option>
              <option value="MODERATOR">Moderator</option>
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={adminForm.twoFactor}
              onChange={(e) =>
                setAdminForm({ ...adminForm, twoFactor: e.target.checked })
              }
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">Enable Two-Factor Authentication</span>
          </label>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowCreateModal(false);
                setEditingAdmin(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? 'Saving...' : editingAdmin ? 'Update Admin' : 'Create Admin'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
