// Test utility for prize creation - can be called from browser console
import { DatabaseService } from '../services/database';

// Add to window object for browser console access
declare global {
  interface Window {
    testPrizeCreation: () => Promise<any>;
    testPrizeOperations: () => Promise<any>;
  }
}

export const testPrizeCreation = async () => {
  console.log('🎁 Testing Prize Creation...');
  
  try {
    // Create a test prize for contest ID 3 (which we know exists)
    const prizeData = {
      contest_id: 3,
      prize_name: 'Test iPhone 15 Pro',
      value: 120000,
      quantity: 1,
      description: 'Testing prize creation functionality'
    };
    
    console.log('Creating prize:', prizeData);
    const newPrize = await DatabaseService.createPrize(prizeData);
    console.log('✅ Prize created successfully:', newPrize);
    
    // Get all prizes for this contest
    const contestPrizes = await DatabaseService.getPrizesByContest(3);
    console.log('✅ Prizes for contest 3:', contestPrizes);
    
    return newPrize;
  } catch (error) {
    console.error('❌ Prize creation failed:', error);
    throw error;
  }
};

export const testPrizeOperations = async () => {
  console.log('🎁 Testing Full Prize Operations...');
  
  try {
    // 1. Create a prize
    const prize1 = await DatabaseService.createPrize({
      contest_id: 3,
      prize_name: 'AirPods Pro',
      value: 25000,
      quantity: 2,
      description: 'Wireless earbuds'
    });
    console.log('✅ Created prize 1:', prize1);
    
    // 2. Create another prize
    const prize2 = await DatabaseService.createPrize({
      contest_id: 3,
      prize_name: 'iPad Air',
      value: 60000,
      quantity: 1,
      description: 'Latest iPad model'
    });
    console.log('✅ Created prize 2:', prize2);
    
    // 3. Get all prizes for contest
    const allPrizes = await DatabaseService.getPrizesByContest(3);
    console.log('✅ All prizes for contest 3:', allPrizes);
    
    // 4. Update a prize
    const updatedPrize = await DatabaseService.updatePrize(prize1.prize_id, {
      prize_name: 'AirPods Pro Max',
      value: 55000
    });
    console.log('✅ Updated prize:', updatedPrize);
    
    // 5. Get updated list
    const updatedList = await DatabaseService.getPrizesByContest(3);
    console.log('✅ Updated prize list:', updatedList);
    
    console.log('🎉 All prize operations completed successfully!');
    return { prize1, prize2, updatedPrize, allPrizes: updatedList };
    
  } catch (error) {
    console.error('❌ Prize operations failed:', error);
    throw error;
  }
};

// Make functions available globally for browser console
if (typeof window !== 'undefined') {
  window.testPrizeCreation = testPrizeCreation;
  window.testPrizeOperations = testPrizeOperations;
}
