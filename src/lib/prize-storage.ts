// Prize storage service with Supabase + localStorage fallback
import { supabase } from './supabase-db';

export interface Prize {
  prize_id: number;
  contest_id: number;
  prize_name: string;
  value?: number;
  quantity: number;
  description?: string;
}

const STORAGE_KEY = 'lucky_draw_prizes';

export class PrizeStorageService {
  // Try Supabase first, fallback to localStorage
  static async createPrize(prizeData: Omit<Prize, 'prize_id'>): Promise<Prize> {
    try {
      // Try Supabase first
      const { data, error } = await supabase
        .from('prizes')
        .insert(prizeData)
        .select()
        .single();
      
      if (!error) {
        console.log('✅ Prize created in Supabase:', data);
        return data;
      }
      
      console.warn('⚠️ Supabase RLS blocked, using localStorage fallback');
    } catch (err) {
      console.warn('⚠️ Supabase error, using localStorage fallback:', err);
    }
    
    // Fallback to localStorage
    return this.createPrizeInLocalStorage(prizeData);
  }

  static async getAllPrizes(): Promise<Prize[]> {
    try {
      // Try Supabase first
      const { data, error } = await supabase
        .from('prizes')
        .select('*')
        .order('prize_id', { ascending: false });
      
      if (!error && data.length > 0) {
        console.log('✅ Loaded prizes from Supabase:', data.length);
        return data;
      }
    } catch (err) {
      console.warn('⚠️ Supabase error, using localStorage fallback:', err);
    }
    
    // Fallback to localStorage
    return this.getPrizesFromLocalStorage();
  }

  static async getPrizesByContest(contestId: number): Promise<Prize[]> {
    const allPrizes = await this.getAllPrizes();
    return allPrizes.filter(prize => prize.contest_id === contestId);
  }

  static async updatePrize(id: number, updates: Partial<Prize>): Promise<Prize> {
    try {
      // Try Supabase first
      const { data, error } = await supabase
        .from('prizes')
        .update(updates)
        .eq('prize_id', id)
        .select()
        .single();
      
      if (!error) {
        console.log('✅ Prize updated in Supabase:', data);
        return data;
      }
    } catch (err) {
      console.warn('⚠️ Supabase error, using localStorage fallback:', err);
    }
    
    // Fallback to localStorage
    return this.updatePrizeInLocalStorage(id, updates);
  }

  static async deletePrize(id: number): Promise<void> {
    try {
      // Try Supabase first
      const { error } = await supabase
        .from('prizes')
        .delete()
        .eq('prize_id', id);
      
      if (!error) {
        console.log('✅ Prize deleted from Supabase');
        return;
      }
    } catch (err) {
      console.warn('⚠️ Supabase error, using localStorage fallback:', err);
    }
    
    // Fallback to localStorage
    this.deletePrizeFromLocalStorage(id);
  }

  // localStorage methods
  private static createPrizeInLocalStorage(prizeData: Omit<Prize, 'prize_id'>): Prize {
    const prizes = this.getPrizesFromLocalStorage();
    const newPrize: Prize = {
      ...prizeData,
      prize_id: Date.now(), // Simple ID generation
    };
    
    prizes.push(newPrize);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prizes));
    
    console.log('✅ Prize created in localStorage:', newPrize);
    return newPrize;
  }

  private static getPrizesFromLocalStorage(): Prize[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (err) {
      console.error('Error reading from localStorage:', err);
      return [];
    }
  }

  private static updatePrizeInLocalStorage(id: number, updates: Partial<Prize>): Prize {
    const prizes = this.getPrizesFromLocalStorage();
    const index = prizes.findIndex(p => p.prize_id === id);
    
    if (index === -1) {
      throw new Error('Prize not found');
    }
    
    prizes[index] = { ...prizes[index], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prizes));
    
    console.log('✅ Prize updated in localStorage:', prizes[index]);
    return prizes[index];
  }

  private static deletePrizeFromLocalStorage(id: number): void {
    const prizes = this.getPrizesFromLocalStorage();
    const filtered = prizes.filter(p => p.prize_id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    
    console.log('✅ Prize deleted from localStorage');
  }

  // Utility method to check storage status
  static async getStorageStatus(): Promise<{ supabase: boolean; localStorage: number }> {
    let supabaseWorking = false;
    
    try {
      const { error } = await supabase.from('prizes').select('*').limit(1);
      supabaseWorking = !error;
    } catch (err) {
      supabaseWorking = false;
    }
    
    const localPrizes = this.getPrizesFromLocalStorage();
    
    return {
      supabase: supabaseWorking,
      localStorage: localPrizes.length
    };
  }
}
