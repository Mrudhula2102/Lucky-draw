import { supabase } from '../lib/supabase-db';

// Type definitions for Admin
export interface Admin {
  admin_id: number;
  name: string;
  email: string;
  password_hash: string;
  role: 'ADMIN' | 'SUPERADMIN' | 'MODERATOR';
  two_factor: boolean;
  created_at: string;
  last_login?: string | null;
}

export interface AdminActivityLog {
  log_id: number;
  admin_id: number;
  action: string;
  target_table: string;
  target_id?: number | null;
  session_id?: string | null;
  status: 'SUCCESS' | 'FAILURE' | 'PENDING';
  timestamp: string;
}

export class AdminService {
  // Create a new admin
  static async createAdmin(data: Omit<Admin, 'admin_id' | 'created_at'>): Promise<Admin> {
    const { data: admin, error } = await supabase
      .from('admins')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return admin;
  }

  // Get admin by email
  static async getAdminByEmail(email: string): Promise<Admin | null> {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data;
  }

  // Get admin by ID
  static async getAdminById(id: number): Promise<Admin | null> {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('admin_id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  // Update admin
  static async updateAdmin(id: number, updates: Partial<Admin>): Promise<Admin> {
    const { data, error } = await supabase
      .from('admins')
      .update(updates)
      .eq('admin_id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Update last login
  static async updateLastLogin(id: number): Promise<Admin> {
    const { data, error } = await supabase
      .from('admins')
      .update({ last_login: new Date().toISOString() })
      .eq('admin_id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Get all admins
  static async getAllAdmins(): Promise<Admin[]> {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Log admin activity
  static async logActivity(
    adminId: number,
    action: string,
    targetTable: string,
    targetId?: number,
    sessionId?: string,
    status: 'SUCCESS' | 'FAILURE' | 'PENDING' = 'SUCCESS'
  ): Promise<AdminActivityLog> {
    const { data, error } = await supabase
      .from('admin_activity_log')
      .insert({
        admin_id: adminId,
        action,
        target_table: targetTable,
        target_id: targetId,
        session_id: sessionId,
        status,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Get admin activity logs
  static async getAdminActivityLogs(
    adminId?: number,
    limit: number = 50
  ): Promise<AdminActivityLog[]> {
    let query = supabase
      .from('admin_activity_log')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (adminId) {
      query = query.eq('admin_id', adminId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  // Check admin permissions
  static async checkAdminPermissions(
    adminId: number,
    requiredRole: 'ADMIN' | 'SUPERADMIN' | 'MODERATOR'
  ): Promise<boolean> {
    const { data: admin, error } = await supabase
      .from('admins')
      .select('role')
      .eq('admin_id', adminId)
      .single();

    if (error || !admin) return false;

    // Role hierarchy: SUPERADMIN > ADMIN > MODERATOR
    const roleHierarchy: Record<string, number> = {
      SUPERADMIN: 3,
      ADMIN: 2,
      MODERATOR: 1,
    };

    return (roleHierarchy[admin.role] || 0) >= (roleHierarchy[requiredRole] || 0);
  }

  // Delete admin
  static async deleteAdmin(id: number): Promise<void> {
    const { error } = await supabase
      .from('admins')
      .delete()
      .eq('admin_id', id);

    if (error) throw error;
  }

  // Get admin role statistics
  static async getAdminRoleStats() {
    const [superAdmins, admins, moderators] = await Promise.all([
      supabase.from('admins').select('admin_id', { count: 'exact', head: true }).eq('role', 'SUPERADMIN'),
      supabase.from('admins').select('admin_id', { count: 'exact', head: true }).eq('role', 'ADMIN'),
      supabase.from('admins').select('admin_id', { count: 'exact', head: true }).eq('role', 'MODERATOR'),
    ]);

    return {
      superAdmins: superAdmins.count || 0,
      admins: admins.count || 0,
      moderators: moderators.count || 0,
      total: (superAdmins.count || 0) + (admins.count || 0) + (moderators.count || 0),
    };
  }

  // Get admin statistics
  static async getAdminStats(adminId: number) {
    const [contests, draws, messages, activities] = await Promise.all([
      supabase.from('contests').select('contest_id', { count: 'exact', head: true }).eq('created_by', adminId),
      supabase.from('draws').select('draw_id', { count: 'exact', head: true }).eq('executed_by', adminId),
      supabase.from('messages').select('message_id', { count: 'exact', head: true }).eq('sent_by', adminId),
      supabase.from('admin_activity_log').select('log_id', { count: 'exact', head: true }).eq('admin_id', adminId),
    ]);

    return {
      contestsCreated: contests.count || 0,
      drawsExecuted: draws.count || 0,
      messagesSent: messages.count || 0,
      activitiesLogged: activities.count || 0,
    };
  }
}
