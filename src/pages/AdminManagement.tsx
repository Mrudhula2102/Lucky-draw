import React, { useState, useEffect } from 'react';
import {
  Users,
  Shield,
  Activity,
  Lock,
  Search,
  Edit,
  Eye,
  Trash2,
  UserCheck,
  Crown,
  Calendar,
  Settings,
  Plus,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { AdminService, Admin, AdminActivityLog } from '../services/adminService';
import { toast } from 'react-hot-toast';

interface AdminWithStats extends Admin {
  lastActivity?: string;
  permissionCount?: number;
  isLocked?: boolean;
}

interface SummaryCard {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  change?: string;
  changeType?: 'increase' | 'decrease';
}

export const AdminManagement: React.FC = () => {
  const [admins, setAdmins] = useState<AdminWithStats[]>([]);
  const [activityLogs, setActivityLogs] = useState<AdminActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'activity' | 'permissions' | 'access'>('users');
  const [selectedAdmin, setSelectedAdmin] = useState<AdminWithStats | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activityFilter, setActivityFilter] = useState({
    adminId: '',
    action: '',
    status: '',
    dateRange: 'all',
  });
  const [activitySearch, setActivitySearch] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'MODERATOR' as 'ADMIN' | 'SUPERADMIN' | 'MODERATOR',
    two_factor: false,
  });

  // Summary statistics
  const [summaryStats, setSummaryStats] = useState({
    totalAdmins: 0,
    totalModerators: 0,
    activeUsers: 0,
    twoFactorEnabled: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [adminsData, activityData, roleStats] = await Promise.all([
        AdminService.getAllAdmins(),
        AdminService.getAdminActivityLogs(),
        AdminService.getAdminRoleStats(),
      ]);

      // Enhance admins with additional stats
      const enhancedAdmins: AdminWithStats[] = adminsData.map(admin => ({
        ...admin,
        lastActivity: activityData
          .filter(log => log.admin_id === admin.admin_id)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]?.timestamp,
        permissionCount: getPermissionCount(admin.role),
        isLocked: Math.random() > 0.8, // Random for demo
      }));

      setAdmins(enhancedAdmins);
      setActivityLogs(activityData);

      // Calculate summary statistics
      const now = new Date();
      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      setSummaryStats({
        totalAdmins: roleStats.superAdmins + roleStats.admins,
        totalModerators: roleStats.moderators,
        activeUsers: enhancedAdmins.filter(admin => 
          admin.last_login && new Date(admin.last_login) > last24Hours
        ).length,
        twoFactorEnabled: enhancedAdmins.filter(admin => admin.two_factor).length,
      });

    } catch (error) {
      console.error('Error loading admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const getPermissionCount = (role: string): number => {
    const permissionCounts = {
      SUPERADMIN: 18,
      ADMIN: 14,
      MODERATOR: 7,
    };
    return permissionCounts[role as keyof typeof permissionCounts] || 0;
  };

  const getRoleBadge = (role: string) => {
    const variants = {
      SUPERADMIN: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', icon: Crown },
      ADMIN: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200', icon: Shield },
      MODERATOR: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200', icon: UserCheck },
    };

    const config = variants[role as keyof typeof variants] || variants.MODERATOR;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
        <Icon className="w-3 h-3" />
        {role === 'SUPERADMIN' ? 'Super Admin' : role.charAt(0) + role.slice(1).toLowerCase()}
      </span>
    );
  };

  const getTwoFactorBadge = (enabled: boolean) => {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
        enabled 
          ? 'bg-green-100 text-green-800 border border-green-200' 
          : 'bg-gray-100 text-gray-800 border border-gray-200'
      }`}>
        <Lock className="w-3 h-3" />
        {enabled ? 'Enabled' : 'Disabled'}
      </span>
    );
  };

  const handleAction = async (action: string, admin: AdminWithStats) => {
    try {
      switch (action) {
        case 'edit':
          setSelectedAdmin(admin);
          setFormData({
            name: admin.name,
            email: admin.email,
            password: '',
            role: admin.role,
            two_factor: admin.two_factor,
          });
          setShowEditModal(true);
          break;
        case 'view':
          setSelectedAdmin(admin);
          toast.success(`Viewing ${admin.name} details`);
          break;
        case 'lock':
          // Toggle lock status (for demo purposes, we'll just update a local state)
          const updatedAdmins = admins.map(a => 
            a.admin_id === admin.admin_id 
              ? { ...a, isLocked: !a.isLocked }
              : a
          );
          setAdmins(updatedAdmins);
          toast.success(`${admin.isLocked ? 'Unlocked' : 'Locked'} ${admin.name}`);
          break;
        case 'delete':
          if (window.confirm(`Are you sure you want to delete ${admin.name}?`)) {
            await AdminService.deleteAdmin(admin.admin_id);
            
            // Log the admin deletion activity
            try {
              await AdminService.logActivity(
                1, // Current admin ID (you should get this from auth context)
                'DELETE_ADMIN',
                'admins',
                admin.admin_id,
                undefined,
                'SUCCESS'
              );
            } catch (logError) {
              console.warn('Failed to log activity:', logError);
            }
            
            toast.success(`Deleted ${admin.name}`);
            await loadData();
          }
          break;
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      toast.error(`Failed to ${action} admin`);
    }
  };

  const handleCreateAdmin = async () => {
    try {
      if (!formData.name || !formData.email || !formData.password) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Check if email already exists
      const existingAdmin = await AdminService.getAdminByEmail(formData.email);
      if (existingAdmin) {
        toast.error('An admin with this email already exists');
        return;
      }

      // Create admin with proper field names (AdminService expects snake_case)
      const newAdmin = await AdminService.createAdmin({
        name: formData.name,
        email: formData.email,
        password_hash: formData.password, // In production, this should be hashed
        role: formData.role,
        two_factor: formData.two_factor,
      });

      // Log the admin creation activity
      try {
        await AdminService.logActivity(
          1, // Current admin ID (you should get this from auth context)
          'CREATE_ADMIN',
          'admins',
          newAdmin.admin_id,
          undefined,
          'SUCCESS'
        );
      } catch (logError) {
        console.warn('Failed to log activity:', logError);
      }

      toast.success('Admin created successfully');
      setShowCreateModal(false);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'MODERATOR',
        two_factor: false,
      });
      await loadData();
    } catch (error) {
      console.error('Error creating admin:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create admin';
      toast.error(`Failed to create admin: ${errorMessage}`);
    }
  };

  const handleUpdateAdmin = async () => {
    try {
      if (!selectedAdmin || !formData.name || !formData.email) {
        toast.error('Please fill in all required fields');
        return;
      }

      const updateData: Partial<Admin> = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        two_factor: formData.two_factor,
      };

      // Only include password if it's provided
      if (formData.password) {
        updateData.password_hash = formData.password;
      }

      await AdminService.updateAdmin(selectedAdmin.admin_id, updateData);

      // Log the admin update activity
      try {
        await AdminService.logActivity(
          1, // Current admin ID (you should get this from auth context)
          'UPDATE_ADMIN',
          'admins',
          selectedAdmin.admin_id,
          undefined,
          'SUCCESS'
        );
      } catch (logError) {
        console.warn('Failed to log activity:', logError);
      }

      toast.success('Admin updated successfully');
      setShowEditModal(false);
      setSelectedAdmin(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'MODERATOR',
        two_factor: false,
      });
      await loadData();
    } catch (error) {
      console.error('Error updating admin:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update admin';
      toast.error(`Failed to update admin: ${errorMessage}`);
    }
  };

  const filteredAdmins = admins.filter(admin =>
    admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredActivityLogs = activityLogs.filter(log => {
    // Search filter
    const matchesSearch = activitySearch === '' || 
      log.action.toLowerCase().includes(activitySearch.toLowerCase()) ||
      log.target_table.toLowerCase().includes(activitySearch.toLowerCase()) ||
      log.status.toLowerCase().includes(activitySearch.toLowerCase());

    // Admin filter
    const matchesAdmin = activityFilter.adminId === '' || 
      log.admin_id.toString() === activityFilter.adminId;

    // Action filter
    const matchesAction = activityFilter.action === '' || 
      log.action === activityFilter.action;

    // Status filter
    const matchesStatus = activityFilter.status === '' || 
      log.status === activityFilter.status;

    // Date range filter
    let matchesDate = true;
    if (activityFilter.dateRange !== 'all') {
      const logDate = new Date(log.timestamp);
      const now = new Date();
      
      switch (activityFilter.dateRange) {
        case 'today':
          matchesDate = logDate.toDateString() === now.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = logDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = logDate >= monthAgo;
          break;
      }
    }

    return matchesSearch && matchesAdmin && matchesAction && matchesStatus && matchesDate;
  });

  const getAdminName = (adminId: number): string => {
    const admin = admins.find(a => a.admin_id === adminId);
    return admin ? admin.name : `Admin #${adminId}`;
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE_ADMIN':
        return <Plus className="w-4 h-4 text-green-600" />;
      case 'UPDATE_ADMIN':
        return <Edit className="w-4 h-4 text-blue-600" />;
      case 'DELETE_ADMIN':
        return <Trash2 className="w-4 h-4 text-red-600" />;
      case 'LOGIN':
        return <Shield className="w-4 h-4 text-purple-600" />;
      case 'LOGOUT':
        return <Lock className="w-4 h-4 text-gray-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const summaryCards: SummaryCard[] = [
    {
      title: 'Total Admins',
      value: summaryStats.totalAdmins,
      icon: <Users className="w-6 h-6" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: '+12%',
      changeType: 'increase',
    },
    {
      title: 'Total Moderators',
      value: summaryStats.totalModerators,
      icon: <Shield className="w-6 h-6" />,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      change: '+8%',
      changeType: 'increase',
    },
    {
      title: 'Active Users',
      value: summaryStats.activeUsers,
      icon: <Activity className="w-6 h-6" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: '+24%',
      changeType: 'increase',
    },
    {
      title: '2FA Enabled',
      value: summaryStats.twoFactorEnabled,
      icon: <Lock className="w-6 h-6" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: '+15%',
      changeType: 'increase',
    },
  ];

  const tabs = [
    { id: 'users', label: 'Users', icon: Users },
    { id: 'activity', label: 'Activity Log', icon: Activity },
    { id: 'permissions', label: 'Permission Matrix', icon: Settings },
    { id: 'access', label: 'Dashboard Access', icon: Eye },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading admin data...</span>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Management</h1>
          <p className="text-gray-600">Manage admin users, roles, and permissions</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Admin
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((card, index) => (
          <div
            key={card.title}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                {card.change && (
                  <p className={`text-xs mt-1 ${
                    card.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {card.change} from last month
                  </p>
                )}
              </div>
              <div className={`p-3 rounded-lg ${card.bgColor}`}>
                <div className={card.color}>
                  {card.icon}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'users' && (
            <div className="space-y-4">
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search admins..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                    <Filter className="w-4 h-4" />
                    Filter
                  </button>
                  <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        2FA
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Login
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Permissions
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAdmins.map((admin) => (
                      <tr
                        key={admin.admin_id}
                        className="transition-colors hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <span className="text-white font-medium text-sm">
                                  {admin.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{admin.name}</div>
                              <div className="text-sm text-gray-500">{admin.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getRoleBadge(admin.role)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getTwoFactorBadge(admin.two_factor)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {admin.last_login 
                              ? new Date(admin.last_login).toLocaleDateString()
                              : 'Never'
                            }
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {admin.permissionCount} permissions
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleAction('edit', admin)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:scale-110 transition-transform"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleAction('view', admin)}
                              className="text-green-600 hover:text-green-900 p-1 rounded hover:scale-110 transition-transform"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleAction('lock', admin)}
                              className={`p-1 rounded hover:scale-110 transition-transform ${
                                admin.isLocked 
                                  ? 'text-red-600 hover:text-red-900' 
                                  : 'text-yellow-600 hover:text-yellow-900'
                              }`}
                              title={admin.isLocked ? 'Unlock' : 'Lock'}
                            >
                              <Lock className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleAction('delete', admin)}
                              className="text-red-600 hover:text-red-900 p-1 rounded hover:scale-110 transition-transform"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredAdmins.length === 0 && (
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No admins found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding a new admin.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-6">
              {/* Activity Filters */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Activity Filters</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                    <input
                      type="text"
                      placeholder="Search activities..."
                      value={activitySearch}
                      onChange={(e) => setActivitySearch(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Admin</label>
                    <select
                      value={activityFilter.adminId}
                      onChange={(e) => setActivityFilter(prev => ({ ...prev, adminId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Admins</option>
                      {admins.map(admin => (
                        <option key={admin.admin_id} value={admin.admin_id}>
                          {admin.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
                    <select
                      value={activityFilter.action}
                      onChange={(e) => setActivityFilter(prev => ({ ...prev, action: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Actions</option>
                      <option value="CREATE_ADMIN">Create Admin</option>
                      <option value="UPDATE_ADMIN">Update Admin</option>
                      <option value="DELETE_ADMIN">Delete Admin</option>
                      <option value="LOGIN">Login</option>
                      <option value="LOGOUT">Logout</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time Range</label>
                    <select
                      value={activityFilter.dateRange}
                      onChange={(e) => setActivityFilter(prev => ({ ...prev, dateRange: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">Last 7 Days</option>
                      <option value="month">Last 30 Days</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-4">
                  <p className="text-sm text-gray-600">
                    Showing {filteredActivityLogs.length} of {activityLogs.length} activities
                  </p>
                  <button
                    onClick={() => {
                      setActivityFilter({ adminId: '', action: '', status: '', dateRange: 'all' });
                      setActivitySearch('');
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>

              {/* Activity List */}
              <div className="space-y-3">
                {filteredActivityLogs.length === 0 ? (
                  <div className="text-center py-12">
                    <Activity className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No activities found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {activitySearch || activityFilter.adminId || activityFilter.action || activityFilter.dateRange !== 'all'
                        ? 'Try adjusting your filters.'
                        : 'Admin activities will appear here.'}
                    </p>
                  </div>
                ) : (
                  filteredActivityLogs.map((log) => (
                    <div key={log.log_id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            {getActionIcon(log.action)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-medium text-gray-900">
                                {getAdminName(log.admin_id)}
                              </p>
                              <span className="text-sm text-gray-500">performed</span>
                              <span className="text-sm font-medium text-gray-900">
                                {log.action.replace('_', ' ').toLowerCase()}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>Table: {log.target_table}</span>
                              {log.target_id && <span>ID: {log.target_id}</span>}
                              {log.session_id && <span>Session: {log.session_id.slice(0, 8)}...</span>}
                              <span>{new Date(log.timestamp).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            log.status === 'SUCCESS' 
                              ? 'bg-green-100 text-green-800' 
                              : log.status === 'FAILURE'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {log.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Load More Button */}
              {filteredActivityLogs.length > 0 && filteredActivityLogs.length < activityLogs.length && (
                <div className="text-center">
                  <button
                    onClick={() => {
                      // Load more activities - you can implement pagination here
                      toast('Load more functionality can be implemented here', {
                        icon: 'ℹ️',
                        duration: 3000,
                      });
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Load More Activities
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'permissions' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Permission Matrix</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Permission matrix view coming soon...</p>
              </div>
            </div>
          )}

          {activeTab === 'access' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Dashboard Access Control</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Dashboard access control coming soon...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Admin Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Admin</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter admin name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter email address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter password"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="MODERATOR">Moderator</option>
                  <option value="ADMIN">Admin</option>
                  <option value="SUPERADMIN">Super Admin</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="two_factor"
                  checked={formData.two_factor}
                  onChange={(e) => setFormData(prev => ({ ...prev, two_factor: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="two_factor" className="ml-2 block text-sm text-gray-900">
                  Enable Two-Factor Authentication
                </label>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setFormData({
                    name: '',
                    email: '',
                    password: '',
                    role: 'MODERATOR',
                    two_factor: false,
                  });
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAdmin}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Admin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Admin Modal */}
      {showEditModal && selectedAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Admin</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter admin name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter email address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Leave empty to keep current password"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="MODERATOR">Moderator</option>
                  <option value="ADMIN">Admin</option>
                  <option value="SUPERADMIN">Super Admin</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="edit_two_factor"
                  checked={formData.two_factor}
                  onChange={(e) => setFormData(prev => ({ ...prev, two_factor: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="edit_two_factor" className="ml-2 block text-sm text-gray-900">
                  Enable Two-Factor Authentication
                </label>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedAdmin(null);
                  setFormData({
                    name: '',
                    email: '',
                    password: '',
                    role: 'MODERATOR',
                    two_factor: false,
                  });
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateAdmin}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Update Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
