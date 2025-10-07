// Unified storage monitoring and status service
import { supabase } from './supabase-db';

export interface StorageStatus {
  contests: {
    supabase: boolean;
    localStorage: number;
    total: number;
  };
  prizes: {
    supabase: boolean;
    localStorage: number;
    total: number;
  };
  participants: {
    supabase: boolean;
    localStorage: number;
    total: number;
  };
  overall: {
    usingSupabase: boolean;
    usingLocalStorage: boolean;
    isHybrid: boolean;
  };
}

export class StorageMonitor {
  static async getStorageStatus(): Promise<StorageStatus> {
    const status: StorageStatus = {
      contests: { supabase: false, localStorage: 0, total: 0 },
      prizes: { supabase: false, localStorage: 0, total: 0 },
      participants: { supabase: false, localStorage: 0, total: 0 },
      overall: { usingSupabase: false, usingLocalStorage: false, isHybrid: false }
    };

    // Check contests
    try {
      const { data: contestsData, error } = await supabase.from('contests').select('*');
      status.contests.supabase = !error && contestsData.length > 0;
    } catch (err) {
      status.contests.supabase = false;
    }
    
    const localContests = this.getLocalStorageData('lucky_draw_contests');
    status.contests.localStorage = localContests.length;
    status.contests.total = status.contests.supabase ? 0 : localContests.length; // Use localStorage count if Supabase is empty

    // Check prizes
    try {
      const { data: prizesData, error } = await supabase.from('prizes').select('*');
      status.prizes.supabase = !error && prizesData.length > 0;
    } catch (err) {
      status.prizes.supabase = false;
    }
    
    const localPrizes = this.getLocalStorageData('lucky_draw_prizes');
    status.prizes.localStorage = localPrizes.length;
    status.prizes.total = status.prizes.supabase ? 0 : localPrizes.length;

    // Check participants
    try {
      const { data: participantsData, error } = await supabase.from('participants').select('*');
      status.participants.supabase = !error && participantsData.length > 0;
    } catch (err) {
      status.participants.supabase = false;
    }
    
    const localParticipants = this.getLocalStorageData('lucky_draw_participants');
    status.participants.localStorage = localParticipants.length;
    status.participants.total = status.participants.supabase ? 0 : localParticipants.length;

    // Overall status
    status.overall.usingSupabase = status.contests.supabase || status.prizes.supabase || status.participants.supabase;
    status.overall.usingLocalStorage = status.contests.localStorage > 0 || status.prizes.localStorage > 0 || status.participants.localStorage > 0;
    status.overall.isHybrid = status.overall.usingSupabase && status.overall.usingLocalStorage;

    return status;
  }

  static async testSupabaseConnection(): Promise<boolean> {
    try {
      const { error } = await supabase.from('contests').select('*').limit(1);
      return !error;
    } catch (err) {
      return false;
    }
  }

  static async testSupabaseInsert(): Promise<boolean> {
    try {
      const testData = {
        name: 'Connection Test',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 86400000).toISOString(),
        status: 'DRAFT'
      };
      
      const { error } = await supabase.from('contests').insert(testData).select().single();
      
      if (!error) {
        // Clean up test data
        await supabase.from('contests').delete().eq('name', 'Connection Test');
        return true;
      }
      
      return false;
    } catch (err) {
      return false;
    }
  }

  private static getLocalStorageData(key: string): any[] {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch (err) {
      return [];
    }
  }

  static logStorageStatus(status: StorageStatus): void {
    console.log('📊 Storage Status Report:');
    console.log('├─ Contests:', status.contests.total, '(Supabase:', status.contests.supabase ? '✅' : '❌', '| localStorage:', status.contests.localStorage + ')');
    console.log('├─ Prizes:', status.prizes.total, '(Supabase:', status.prizes.supabase ? '✅' : '❌', '| localStorage:', status.prizes.localStorage + ')');
    console.log('├─ Participants:', status.participants.total, '(Supabase:', status.participants.supabase ? '✅' : '❌', '| localStorage:', status.participants.localStorage + ')');
    console.log('└─ Mode:', status.overall.isHybrid ? '🔄 Hybrid' : status.overall.usingSupabase ? '☁️ Supabase' : '💾 localStorage');
  }

  // Add to window for browser console access
  static setupBrowserAccess(): void {
    if (typeof window !== 'undefined') {
      (window as any).storageMonitor = {
        getStatus: () => this.getStorageStatus(),
        testConnection: () => this.testSupabaseConnection(),
        testInsert: () => this.testSupabaseInsert(),
        logStatus: async () => {
          const status = await this.getStorageStatus();
          this.logStorageStatus(status);
          return status;
        }
      };
    }
  }
}

// Initialize browser access
StorageMonitor.setupBrowserAccess();
