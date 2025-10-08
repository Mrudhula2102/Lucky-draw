import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, QrCode } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Badge } from '../components/common/Badge';
import { Table } from '../components/common/Table';
import { Modal } from '../components/common/Modal';
import { Contest, ContestStatus } from '../types';
import { DatabaseService } from '../services/database';
import { formatDate, formatNumber } from '../utils/helpers';
import { ContestForm } from '../components/contests/ContestForm';
import { QRCodeModal } from '../components/contests/QRCodeModal';
import { ContestDetailsModal } from '../components/contests/ContestDetailsModal';
import QRCode from 'qrcode';
import { supabase } from '../lib/supabase-db';

// Function to generate QR code and upload to Supabase Storage
const generateAndUploadQRCode = async (contestId: number, contestName: string): Promise<string> => {
  try {
    // Use the specified URL for all QR codes
    const qrCodeUrl = 'https://hips.hearstapps.com/hmg-prod/images/cutest-cat-breeds-ragdoll-663a8c6d52172.jpg?crop=0.5989005497251375xw:1xh;center,top&resize=980:*';
    
    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(qrCodeUrl, {
      width: 500,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    // Convert data URL to blob
    const response = await fetch(qrCodeDataUrl);
    const blob = await response.blob();
    
    // Create file name
    const fileName = `contest-${contestId}-${Date.now()}.png`;
    const filePath = `qr-codes/${fileName}`;
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('contest-qr-codes')
      .upload(filePath, blob, {
        contentType: 'image/png',
        upsert: true
      });
    
    if (error) {
      console.error('Error uploading QR code:', error);
      throw error;
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('contest-qr-codes')
      .getPublicUrl(filePath);
    
    return publicUrl;
  } catch (error) {
    console.error('Error in generateAndUploadQRCode:', error);
    throw error;
  }
};

export const Contests: React.FC = () => {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load contests from Supabase
  useEffect(() => {
    loadContests();
  }, []);

  const loadContests = async () => {
    try {
      setLoading(true);
      setError(null);
      const contestData = await DatabaseService.getAllContests();
      
      // Convert Supabase format to frontend format and load prizes
      const formattedContests: Contest[] = await Promise.all(
        contestData.map(async (contest) => {
          // Load prizes for this contest using our new service
          const contestPrizes = await DatabaseService.getPrizesByContest(contest.contest_id);
          
          return {
            id: contest.contest_id.toString(),
            name: contest.name,
            theme: contest.theme || '',
            description: contest.description || '',
            startTime: contest.start_time || '',
            endTime: contest.end_time || '',
            status: contest.status as ContestStatus,
            prizes: contestPrizes.map((prize: any) => ({
              id: prize.prize_id.toString(),
              name: prize.prize_name,
              value: prize.value || 0,
              quantity: prize.quantity
            })),
            entryRules: typeof contest.entry_rules === 'object' && contest.entry_rules !== null 
              ? (contest.entry_rules as any).type || 'one entry'
              : contest.entry_rules || 'one entry',
            participationMethod: [],
            totalParticipants: (contest as any).participants?.length || 0,
            totalEntries: (contest as any).participants?.length || 0,
            createdBy: contest.created_by?.toString() || '1',
            createdAt: contest.created_at,
            updatedAt: contest.created_at,
            qrCodeUrl: contest.qr_code_url || undefined,
          };
        })
      );
      
      setContests(formattedContests);
    } catch (err) {
      console.error('Error loading contests:', err);
      setError('Failed to load contests. Please try again.');
      // Fallback to sample data if database fails
      setContests([{
        id: 'sample-1',
        name: 'Sample Contest (Demo)',
        theme: 'Demo',
        description: 'This is sample data - database connection needed',
        startTime: '2025-09-15T10:00',
        endTime: '2025-10-15T18:00',
        status: ContestStatus.ONGOING,
        prizes: [],
        entryRules: 'one entry',
        participationMethod: [],
        totalParticipants: 0,
        totalEntries: 0,
        createdBy: '1',
        createdAt: '2025-09-01',
        updatedAt: '2025-09-01',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContest = async (contestData: any) => {
    try {
      console.log('Creating contest with data:', contestData);
      
      // Ensure times are provided
      if (!contestData.startTime || !contestData.endTime) {
        setError('Start time and end time are required');
        return;
      }
      
      const contestPayload = {
        name: contestData.name,
        theme: contestData.theme || null,
        description: contestData.description || null,
        // Handle both old and new schema during transition
        start_date: contestData.startTime ? contestData.startTime.split('T')[0] : new Date().toISOString().split('T')[0],
        end_date: contestData.endTime ? contestData.endTime.split('T')[0] : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        start_time: contestData.startTime,
        end_time: contestData.endTime,
        entry_rules: contestData.entryRules || null,
        status: contestData.status || 'UPCOMING',
      };
      
      console.log('Contest payload:', contestPayload);
      
      const result = await DatabaseService.createContest(contestPayload);
      console.log('Contest created successfully:', result);
      
      // Generate and upload QR code
      try {
        const qrCodeUrl = await generateAndUploadQRCode(result.contest_id, result.name);
        console.log('QR Code generated and uploaded:', qrCodeUrl);
        
        // Update contest with QR code URL
        await DatabaseService.updateContest(result.contest_id, {
          qr_code_url: qrCodeUrl
        });
      } catch (qrError) {
        console.error('Error generating QR code:', qrError);
        // Don't fail the whole operation if QR generation fails
      }
      
      // Also create prizes if any
      if (contestData.prizes && contestData.prizes.length > 0) {
        console.log('Creating prizes for contest:', result.contest_id);
        for (const prize of contestData.prizes) {
          await DatabaseService.createPrize({
            contest_id: result.contest_id,
            prize_name: prize.name,
            value: prize.value,
            quantity: prize.quantity,
            description: prize.description || null,
          });
        }
        console.log('Prizes created successfully');
      }
      
      // Reload contests after creation
      await loadContests();
      setShowCreateModal(false);
      setError(null);
    } catch (err: any) {
      console.error('Error creating contest:', err);
      console.error('Error details:', err.message, err.details, err.hint);
      setError(`Failed to create contest: ${err.message || 'Please try again.'}`);
    }
  };

  const handleDeleteContest = async (contestId: string) => {
    try {
      await DatabaseService.deleteContest(parseInt(contestId));
      await loadContests(); // Reload after deletion
    } catch (err) {
      console.error('Error deleting contest:', err);
      setError('Failed to delete contest. Please try again.');
    }
  };

  const handleUpdateContest = async (contestData: any) => {
    if (!editingContest) return;
    
    try {
      await DatabaseService.updateContest(parseInt(editingContest.id), {
        name: contestData.name,
        theme: contestData.theme,
        description: contestData.description,
        start_time: contestData.startTime,
        end_time: contestData.endTime,
        entry_rules: contestData.entryRules,
        status: contestData.status,
      });
      
      // Reload contests after update
      await loadContests();
      setShowCreateModal(false);
      setEditingContest(null);
    } catch (err) {
      console.error('Error updating contest:', err);
      setError('Failed to update contest. Please try again.');
    }
  };


  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null);
  const [editingContest, setEditingContest] = useState<Contest | null>(null);

  const getStatusBadge = (status: ContestStatus) => {
    const variants: Record<ContestStatus, 'success' | 'warning' | 'info' | 'default' | 'danger'> = {
      [ContestStatus.ONGOING]: 'success',
      [ContestStatus.UPCOMING]: 'info',
      [ContestStatus.COMPLETED]: 'default',
      [ContestStatus.DRAFT]: 'warning',
      [ContestStatus.CANCELLED]: 'danger',
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const filteredContests = contests.filter((contest) => {
    const matchesSearch = contest.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || contest.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      key: 'name',
      header: 'Contest Name',
      render: (contest: Contest) => (
        <div>
          <p className="font-medium text-gray-900">{contest.name}</p>
          <p className="text-sm text-gray-500">{contest.theme}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (contest: Contest) => getStatusBadge(contest.status),
    },
    {
      key: 'schedule',
      header: 'Schedule',
      render: (contest: Contest) => {
        const startFormatted = formatDate(contest.startTime, 'MMM dd, yyyy HH:mm');
        const endFormatted = formatDate(contest.endTime, 'MMM dd, yyyy HH:mm');
        
        return (
          <div className="text-sm">
            <p>{startFormatted}</p>
            <p className="text-gray-500">to {endFormatted}</p>
          </div>
        );
      },
    },
    {
      key: 'participants',
      header: 'Participants',
      render: (contest: Contest) => (
        <span className="font-medium">{formatNumber(contest.totalParticipants)}</span>
      ),
    },
    {
      key: 'prizes',
      header: 'Prizes',
      render: (contest: Contest) => (
        <span className="font-medium">{contest.prizes.length}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (contest: Contest) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleViewQR(contest)}
            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            title="View QR Code"
          >
            <QrCode className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleView(contest)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="View"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEdit(contest)}
            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(contest.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const handleViewQR = (contest: Contest) => {
    setSelectedContest(contest);
    setShowQRModal(true);
  };

  const handleView = (contest: Contest) => {
    setSelectedContest(contest);
    setShowDetailsModal(true);
  };

  const handleEdit = (contest: Contest) => {
    setEditingContest(contest);
    setShowCreateModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this contest?')) {
      await handleDeleteContest(id);
    }
  };

  const handleSaveContest = async (contestData: any) => {
    if (editingContest) {
      await handleUpdateContest(contestData);
    } else {
      await handleCreateContest(contestData);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contest Management</h1>
          <p className="text-gray-600 mt-1">Create and manage your lucky draw contests</p>
        </div>
        <Button
          variant="primary"
          icon={<Plus className="w-5 h-5" />}
          onClick={() => {
            setEditingContest(null);
            setShowCreateModal(true);
          }}
        >
          Create Contest
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="text-red-600 text-sm">{error}</div>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Loading Display */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="text-gray-600">Loading contests...</div>
        </div>
      )}

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Input
              placeholder="Search contests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-5 h-5" />}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as ContestStatus | 'ALL')}
              className="input-field"
            >
              <option value="ALL">All Status</option>
              <option value={ContestStatus.DRAFT}>Draft</option>
              <option value={ContestStatus.UPCOMING}>Upcoming</option>
              <option value={ContestStatus.ONGOING}>Ongoing</option>
              <option value={ContestStatus.COMPLETED}>Completed</option>
              <option value={ContestStatus.CANCELLED}>Cancelled</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Contests Table */}
      <Card>
        <Table data={filteredContests} columns={columns} emptyMessage="No contests found" />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingContest(null);
        }}
        title={editingContest ? 'Edit Contest' : 'Create New Contest'}
        size="xl"
      >
        <ContestForm
          contest={editingContest}
          onSave={handleSaveContest}
          onCancel={() => {
            setShowCreateModal(false);
            setEditingContest(null);
          }}
        />
      </Modal>

      {/* QR Code Modal */}
      {selectedContest && (
        <QRCodeModal
          isOpen={showQRModal}
          onClose={() => {
            setShowQRModal(false);
            setSelectedContest(null);
          }}
          contest={selectedContest}
        />
      )}

      {/* Contest Details Modal */}
      {selectedContest && (
        <ContestDetailsModal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedContest(null);
          }}
          contest={selectedContest}
        />
      )}
    </div>
  );
};
