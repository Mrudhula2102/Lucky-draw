import React, { useState, useEffect } from 'react';
import { SupabaseService } from '../lib/supabase-db';
import type { Contest, Participant } from '../lib/supabase-db';

// Example component showing how to use the Prisma services
const ContestExample: React.FC = () => {
  const [contests, setContests] = useState<Contest[]>([]);
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(false);

  // Load all contests on component mount
  useEffect(() => {
    loadContests();
  }, []);

  const loadContests = async () => {
    try {
      setLoading(true);
      const contestData = await SupabaseService.getAllContests();
      setContests(contestData);
    } catch (error) {
      console.error('Error loading contests:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadParticipants = async (contestId: number) => {
    try {
      setLoading(true);
      const participantData = await SupabaseService.getParticipantsByContest(contestId);
      setParticipants(participantData);
    } catch (error) {
      console.error('Error loading participants:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSampleContest = async () => {
    try {
      setLoading(true);
      const newContest = await SupabaseService.createContest({
        name: "Sample Contest",
        description: "This is a sample contest created via Supabase",
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        status: "UPCOMING",
        // Note: You'll need to provide created_by (admin ID) in a real implementation
      });
      
      setContests(prev => [newContest, ...prev]);
      alert('Contest created successfully!');
    } catch (error) {
      console.error('Error creating contest:', error);
      alert('Error creating contest. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const addSampleParticipant = async (contestId: number) => {
    try {
      setLoading(true);
      const newParticipant = await SupabaseService.addParticipant({
        contest_id: contestId,
        name: `Participant ${Date.now()}`,
        contact: `user${Date.now()}@example.com`,
        validated: true,
        unique_token: `token_${Date.now()}`,
      });
      
      setParticipants(prev => [newParticipant, ...prev]);
      alert('Participant added successfully!');
    } catch (error) {
      console.error('Error adding participant:', error);
      alert('Error adding participant. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const executeRandomDraw = async (contestId: number) => {
    try {
      setLoading(true);
      // Note: You'll need to provide executed_by (admin ID) in a real implementation
      const result = await SupabaseService.executeRandomDraw(
        contestId,
        1, // Replace with actual admin ID
        1  // Number of winners
      );
      
      alert(`Draw executed! ${result.winners.length} winner(s) selected.`);
    } catch (error) {
      console.error('Error executing draw:', error);
      alert('Error executing draw. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Prisma Services Example</h1>
      
      {/* Contest Management */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Contests</h2>
          <button
            onClick={createSampleContest}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            disabled={loading}
          >
            Create Sample Contest
          </button>
        </div>
        
        <div className="grid gap-4">
          {contests.map((contest) => (
            <div
              key={contest.contest_id}
              className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => {
                setSelectedContest(contest);
                loadParticipants(contest.contest_id);
              }}
            >
              <h3 className="font-semibold">{contest.name}</h3>
              <p className="text-gray-600">{contest.description}</p>
              <p className="text-sm text-gray-500">
                Status: {contest.status} | 
                Participants: {(contest as any).participants?.length || 0} |
                Prizes: {(contest as any).prizes?.length || 0}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Contest Details */}
      {selectedContest && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Contest: {selectedContest.name}
          </h2>
          
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => addSampleParticipant(selectedContest.contest_id)}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              disabled={loading}
            >
              Add Sample Participant
            </button>
            
            <button
              onClick={() => executeRandomDraw(selectedContest.contest_id)}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
              disabled={loading || participants.length === 0}
            >
              Execute Random Draw
            </button>
          </div>

          {/* Participants List */}
          <div>
            <h3 className="font-semibold mb-2">Participants ({participants.length})</h3>
            <div className="grid gap-2">
              {participants.map((participant) => (
                <div
                  key={participant.participant_id}
                  className="border rounded p-3 bg-gray-50"
                >
                  <p className="font-medium">{participant.name}</p>
                  <p className="text-sm text-gray-600">{participant.contact}</p>
                  <p className="text-xs text-gray-500">
                    Validated: {participant.validated ? 'Yes' : 'No'} |
                    Entry: {new Date(participant.entry_timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">Instructions:</h3>
        <ol className="list-decimal list-inside text-blue-700 space-y-1">
          <li>First, update your DATABASE_URL in the .env file with your Supabase credentials</li>
          <li>Run <code className="bg-blue-100 px-1 rounded">npm run db:push</code> to create the database tables</li>
          <li>Create a sample contest using the button above</li>
          <li>Click on a contest to select it and add participants</li>
          <li>Execute a random draw to select winners</li>
        </ol>
      </div>
    </div>
  );
};

export default ContestExample;
