import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Contest, ContestStatus, ParticipationMethod } from '../../types';
import { formatDate, formatNumber } from '../../utils/helpers';
import { Calendar, Users, Award, Clock, FileText, CheckCircle } from 'lucide-react';

interface ContestDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  contest: Contest;
}

export const ContestDetailsModal: React.FC<ContestDetailsModalProps> = ({ isOpen, onClose, contest }) => {
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

  const getParticipationMethodLabel = (method: ParticipationMethod) => {
    // Participation methods have been removed
    return String(method);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Contest Details"
      size="lg"
      footer={
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Header Section */}
        <div className="border-b border-gray-200 pb-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{contest.name}</h2>
              <p className="text-sm text-gray-600 mt-1">{contest.theme}</p>
            </div>
            {getStatusBadge(contest.status)}
          </div>
        </div>

        {/* Description */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Description</h3>
          </div>
          <p className="text-gray-700 leading-relaxed">{contest.description}</p>
        </div>

        {/* Date Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold text-blue-900">Start Date</h4>
            </div>
            <p className="text-blue-800">{formatDate(contest.startDate)}</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-purple-600" />
              <h4 className="font-semibold text-purple-900">End Date</h4>
            </div>
            <p className="text-purple-800">{formatDate(contest.endDate)}</p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-green-600" />
              <h4 className="font-semibold text-green-900">Total Participants</h4>
            </div>
            <p className="text-2xl font-bold text-green-800">{formatNumber(contest.totalParticipants)}</p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-orange-600" />
              <h4 className="font-semibold text-orange-900">Total Entries</h4>
            </div>
            <p className="text-2xl font-bold text-orange-800">{formatNumber(contest.totalEntries)}</p>
          </div>
        </div>

        {/* Prizes */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Prizes ({contest.prizes.length})</h3>
          </div>
          <div className="space-y-3">
            {contest.prizes.map((prize, index) => (
              <div
                key={prize.id}
                className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-yellow-500 text-white text-xs font-bold rounded-full">
                        {index + 1}
                      </span>
                      <h4 className="font-semibold text-gray-900">{prize.name}</h4>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-lg font-bold text-yellow-700">{prize.value}</p>
                    <p className="text-xs text-gray-600">Qty: {prize.quantity}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Entry Rules */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Entry Rules</h3>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-gray-700 whitespace-pre-line">{contest.entryRules}</p>
          </div>
        </div>

        {/* Participation Methods - Hidden as methods have been removed */}
        {contest.participationMethod.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Participation Methods</h3>
            <div className="flex flex-wrap gap-2">
              {contest.participationMethod.map((method) => (
                <Badge key={method} variant="info">
                  {getParticipationMethodLabel(method)}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="border-t border-gray-200 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Created:</span> {formatDate(contest.createdAt)}
            </div>
            <div>
              <span className="font-medium">Last Updated:</span> {formatDate(contest.updatedAt)}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
