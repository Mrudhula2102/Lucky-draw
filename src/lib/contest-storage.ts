// Contest storage service with Supabase + localStorage fallback
import { supabase } from './supabase-db';

export interface Contest {
  id: number;
  name: string;
  theme?: string;
  description?: string;
  entry_form_id?: number;
  start_date: string;
  end_date: string;
  entry_rules?: any;
  status: 'DRAFT' | 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  created_by?: number;
  created_at: string;
}

const STORAGE_KEY = 'lucky_draw_contests';

export class ContestStorageService {
  // Try Supabase first, fallback to localStorage
  static async createContest(contestData: Omit<Contest, 'id' | 'created_at'>): Promise<Contest> {
    try {
      // Try Supabase first
      const { data, error } = await supabase
        .from('contests')
        .insert(contestData)
        .select()
        .single();
      
      if (!error) {
        console.log('✅ Contest created in Supabase:', data);
        return data;
      }
      
      console.warn('⚠️ Supabase RLS blocked, using localStorage fallback');
    } catch (err) {
      console.warn('⚠️ Supabase error, using localStorage fallback:', err);
    }
    
    // Fallback to localStorage
    return this.createContestInLocalStorage(contestData);
  }

  static async getAllContests(): Promise<Contest[]> {
    try {
      // Try Supabase first
      const { data, error } = await supabase
        .from('contests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data.length > 0) {
        console.log('✅ Loaded contests from Supabase:', data.length);
        return data;
      }
    } catch (err) {
      console.warn('⚠️ Supabase error, using localStorage fallback:', err);
    }
    
    // Fallback to localStorage
    return this.getContestsFromLocalStorage();
  }

  static async getContestById(id: number): Promise<Contest | null> {
    try {
      // Try Supabase first
      const { data, error } = await supabase
        .from('contests')
        .select('*')
        .eq('id', id)
        .single();
      
      if (!error) {
        console.log('✅ Loaded contest from Supabase:', data.id);
        return data;
      }
    } catch (err) {
      console.warn('⚠️ Supabase error, using localStorage fallback:', err);
    }
    
    // Fallback to localStorage
    const contests = this.getContestsFromLocalStorage();
    return contests.find(c => c.id === id) || null;
  }

  static async updateContest(id: number, updates: Partial<Contest>): Promise<Contest> {
    try {
      // Try Supabase first
      const { data, error } = await supabase
        .from('contests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (!error) {
        console.log('✅ Contest updated in Supabase:', data);
        return data;
      }
    } catch (err) {
      console.warn('⚠️ Supabase error, using localStorage fallback:', err);
    }
    
    // Fallback to localStorage
    return this.updateContestInLocalStorage(id, updates);
  }

  static async deleteContest(id: number): Promise<void> {
    try {
      // Try Supabase first
      const { error } = await supabase
        .from('contests')
        .delete()
        .eq('id', id);
      
      if (!error) {
        console.log('✅ Contest deleted from Supabase');
        return;
      }
    } catch (err) {
      console.warn('⚠️ Supabase error, using localStorage fallback:', err);
    }
    
    // Fallback to localStorage
    this.deleteContestFromLocalStorage(id);
  }

  // localStorage methods
  private static createContestInLocalStorage(contestData: Omit<Contest, 'id' | 'created_at'>): Contest {
    const contests = this.getContestsFromLocalStorage();
    const newContest: Contest = {
      ...contestData,
      id: Date.now(), // Simple ID generation
      created_at: new Date().toISOString(),
    };
    
    contests.push(newContest);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contests));
    
    console.log('✅ Contest created in localStorage:', newContest);
    return newContest;
  }

  private static getContestsFromLocalStorage(): Contest[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (err) {
      console.error('Error reading from localStorage:', err);
      return [];
    }
  }

  private static updateContestInLocalStorage(id: number, updates: Partial<Contest>): Contest {
    const contests = this.getContestsFromLocalStorage();
    const index = contests.findIndex(c => c.id === id);
    
    if (index === -1) {
      throw new Error('Contest not found');
    }
    
    contests[index] = { ...contests[index], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contests));
    
    console.log('✅ Contest updated in localStorage:', contests[index]);
    return contests[index];
  }

  private static deleteContestFromLocalStorage(id: number): void {
    const contests = this.getContestsFromLocalStorage();
    const filtered = contests.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    
    console.log('✅ Contest deleted from localStorage');
  }

  // Utility method to check storage status
  static async getStorageStatus(): Promise<{ supabase: boolean; localStorage: number }> {
    let supabaseWorking = false;
    
    try {
      const { error } = await supabase.from('contests').select('*').limit(1);
      supabaseWorking = !error;
    } catch (err) {
      supabaseWorking = false;
    }
    
    const localContests = this.getContestsFromLocalStorage();
    
    return {
      supabase: supabaseWorking,
      localStorage: localContests.length
    };
  }
}
