import React, { useState } from 'react';
import { Search, Filter, Download, Send, CheckCircle, Package, Truck } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Badge } from '../components/common/Badge';
import { Table } from '../components/common/Table';
import { Winner, PrizeStatus } from '../types';
import { formatDate, downloadCSV } from '../utils/helpers';
import toast from 'react-hot-toast';

export const Winners: React.FC = () => {
  const [winners, setWinners] = useState<Winner[]>([
    {
      id: '1',
      participantId: '1',
      participant: {
        id: '1',
        name: 'Rajesh Kumar',
        email: 'rajesh@example.com',
        phone: '+91 98765 43210',
        contestId: '1',
        entryDate: '2025-09-20T10:30:00Z',
        entryMethod: 'QR' as any,
        isDuplicate: false,
        isValid: true,
      },
      contestId: '1',
      contest: {} as any,
      prize: {
        id: '1',
        name: 'iPhone 15 Pro',
        value: 120000,
        quantity: 1,
      },
      wonAt: '2025-09-25T15:30:00Z',
      prizeStatus: PrizeStatus.PENDING,
      notificationSent: false,
    },
    {
      id: '2',
      participantId: '2',
      participant: {
        id: '2',
        name: 'Priya Sharma',
        email: 'priya@example.com',
        phone: '+91 98765 43211',
        contestId: '1',
        entryDate: '2025-09-21T14:20:00Z',
        entryMethod: 'WHATSAPP' as any,
        isDuplicate: false,
        isValid: true,
      },
      contestId: '1',
      contest: {} as any,
      prize: {
        id: '2',
        name: 'AirPods Pro',
        value: 25000,
        quantity: 1,
      },
      wonAt: '2025-09-25T15:30:00Z',
      prizeStatus: PrizeStatus.DISPATCHED,
      notificationSent: true,
      dispatchedAt: '2025-09-26T10:00:00Z',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<PrizeStatus | 'ALL'>('ALL');

  const filteredWinners = winners.filter((winner) => {
    const matchesSearch =
      winner.participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      winner.participant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      winner.prize.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || winner.prizeStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: PrizeStatus) => {
    const variants: Record<PrizeStatus, { variant: 'success' | 'warning' | 'info' | 'default' | 'danger'; icon: React.ReactNode }> = {
      [PrizeStatus.PENDING]: { variant: 'warning', icon: <CheckCircle className="w-3 h-3" /> },
      [PrizeStatus.NOTIFIED]: { variant: 'info', icon: <Send className="w-3 h-3" /> },
      [PrizeStatus.CLAIMED]: { variant: 'default', icon: <CheckCircle className="w-3 h-3" /> },
      [PrizeStatus.DISPATCHED]: { variant: 'info', icon: <Package className="w-3 h-3" /> },
      [PrizeStatus.DELIVERED]: { variant: 'success', icon: <Truck className="w-3 h-3" /> },
    };
    const { variant, icon } = variants[status];
    return (
      <Badge variant={variant}>
        <span className="flex items-center gap-1">
          {icon}
          {status}
        </span>
      </Badge>
    );
  };

  const columns = [
    {
      key: 'participant',
      header: 'Winner',
      render: (winner: Winner) => (
        <div>
          <p className="font-medium text-gray-900">{winner.participant.name}</p>
          <p className="text-sm text-gray-500">{winner.participant.email}</p>
          <p className="text-sm text-gray-500">{winner.participant.phone}</p>
        </div>
      ),
    },
    {
      key: 'prize',
      header: 'Prize',
      render: (winner: Winner) => (
        <div>
          <p className="font-medium text-gray-900">{winner.prize.name}</p>
          <p className="text-sm text-gray-500">₹{winner.prize.value.toLocaleString()}</p>
        </div>
      ),
    },
    {
      key: 'wonAt',
      header: 'Won Date',
      render: (winner: Winner) => formatDate(winner.wonAt, 'MMM dd, yyyy'),
    },
    {
      key: 'status',
      header: 'Prize Status',
      render: (winner: Winner) => getStatusBadge(winner.prizeStatus),
    },
    {
      key: 'notification',
      header: 'Notification',
      render: (winner: Winner) => (
        <Badge variant={winner.notificationSent ? 'success' : 'warning'} size="sm">
          {winner.notificationSent ? 'Sent' : 'Pending'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (winner: Winner) => (
        <div className="flex items-center gap-2">
          {!winner.notificationSent && (
            <Button
              size="sm"
              variant="primary"
              icon={<Send className="w-3 h-3" />}
              onClick={() => handleSendNotification(winner.id)}
            >
              Notify
            </Button>
          )}
          {winner.prizeStatus === PrizeStatus.PENDING && (
            <Button
              size="sm"
              variant="success"
              onClick={() => handleUpdateStatus(winner.id, PrizeStatus.DISPATCHED)}
            >
              Mark Dispatched
            </Button>
          )}
        </div>
      ),
    },
  ];

  const handleSendNotification = (winnerId: string) => {
    setWinners(
      winners.map((w) =>
        w.id === winnerId ? { ...w, notificationSent: true, prizeStatus: PrizeStatus.NOTIFIED } : w
      )
    );
    toast.success('Notification sent successfully!');
  };

  const handleUpdateStatus = (winnerId: string, status: PrizeStatus) => {
    setWinners(
      winners.map((w) =>
        w.id === winnerId
          ? {
              ...w,
              prizeStatus: status,
              dispatchedAt: status === PrizeStatus.DISPATCHED ? new Date().toISOString() : w.dispatchedAt,
            }
          : w
      )
    );
    toast.success('Prize status updated!');
  };

  const handleExportReport = () => {
    const exportData = filteredWinners.map((w) => ({
      Winner: w.participant.name,
      Email: w.participant.email,
      Phone: w.participant.phone,
      Prize: w.prize.name,
      'Prize Value': `₹${w.prize.value}`,
      'Won Date': formatDate(w.wonAt, 'yyyy-MM-dd'),
      Status: w.prizeStatus,
      'Notification Sent': w.notificationSent ? 'Yes' : 'No',
      'Dispatched Date': w.dispatchedAt ? formatDate(w.dispatchedAt, 'yyyy-MM-dd') : 'N/A',
    }));
    downloadCSV(exportData, `winners-report-${Date.now()}`);
    toast.success('Report exported successfully!');
  };

  const handleBulkNotify = () => {
    const pendingNotifications = winners.filter((w) => !w.notificationSent);
    setWinners(
      winners.map((w) =>
        !w.notificationSent ? { ...w, notificationSent: true, prizeStatus: PrizeStatus.NOTIFIED } : w
      )
    );
    toast.success(`Sent notifications to ${pendingNotifications.length} winners!`);
  };

  const stats = {
    total: winners.length,
    pending: winners.filter((w) => w.prizeStatus === PrizeStatus.PENDING).length,
    dispatched: winners.filter((w) => w.prizeStatus === PrizeStatus.DISPATCHED).length,
    delivered: winners.filter((w) => w.prizeStatus === PrizeStatus.DELIVERED).length,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Winner Management</h1>
          <p className="text-gray-600 mt-1">Manage winners and prize distribution</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            icon={<Send className="w-5 h-5" />}
            onClick={handleBulkNotify}
          >
            Notify All
          </Button>
          <Button
            variant="primary"
            icon={<Download className="w-5 h-5" />}
            onClick={handleExportReport}
          >
            Export Report
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-600 mt-1">Total Winners</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-sm text-gray-600 mt-1">Pending</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">{stats.dispatched}</p>
            <p className="text-sm text-gray-600 mt-1">Dispatched</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{stats.delivered}</p>
            <p className="text-sm text-gray-600 mt-1">Delivered</p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Input
              placeholder="Search winners..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-5 h-5" />}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as PrizeStatus | 'ALL')}
              className="input-field"
            >
              <option value="ALL">All Status</option>
              <option value={PrizeStatus.PENDING}>Pending</option>
              <option value={PrizeStatus.NOTIFIED}>Notified</option>
              <option value={PrizeStatus.CLAIMED}>Claimed</option>
              <option value={PrizeStatus.DISPATCHED}>Dispatched</option>
              <option value={PrizeStatus.DELIVERED}>Delivered</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Winners Table */}
      <Card>
        <Table data={filteredWinners} columns={columns} emptyMessage="No winners found" />
      </Card>
    </div>
  );
};
