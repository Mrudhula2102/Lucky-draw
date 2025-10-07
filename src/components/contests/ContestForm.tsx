import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Input, TextArea } from '../common/Input';
import { Contest, ContestStatus, Prize } from '../../types';
import { Plus, Trash2 } from 'lucide-react';

interface ContestFormProps {
  contest: Contest | null;
  onSave: (contest: Partial<Contest>) => void;
  onCancel: () => void;
}

export const ContestForm: React.FC<ContestFormProps> = ({ contest, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: contest?.name || '',
    theme: contest?.theme || '',
    description: contest?.description || '',
    startDate: contest?.startDate || '',
    endDate: contest?.endDate || '',
    status: contest?.status || ContestStatus.DRAFT,
    entryRules: contest?.entryRules || 'one entry',
    participationMethod: contest?.participationMethod || [],
  });

  const [prizes, setPrizes] = useState<Prize[]>(contest?.prizes || []);
  const [newPrize, setNewPrize] = useState({ name: '', value: '', quantity: '' });
  const [dateError, setDateError] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Validate dates
    if (name === 'startDate' || name === 'endDate') {
      const startDate = name === 'startDate' ? value : formData.startDate;
      const endDate = name === 'endDate' ? value : formData.endDate;
      
      if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
        setDateError('Incorrect date: End date must be after start date');
      } else {
        setDateError('');
      }
    }
  };

  const handleAddPrize = () => {
    if (newPrize.name && newPrize.value && newPrize.quantity) {
      setPrizes([
        ...prizes,
        {
          id: Date.now().toString(),
          name: newPrize.name,
          value: parseFloat(newPrize.value),
          quantity: parseInt(newPrize.quantity),
        },
      ]);
      setNewPrize({ name: '', value: '', quantity: '' });
    }
  };

  const handleRemovePrize = (id: string) => {
    setPrizes(prizes.filter((p) => p.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate dates before submission
    if (formData.startDate && formData.endDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
      setDateError('Incorrect date: End date must be after start date');
      return;
    }
    
    onSave({ ...formData, prizes });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Contest Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <Input
            label="Theme"
            name="theme"
            value={formData.theme}
            onChange={handleChange}
            required
          />
        </div>
        <TextArea
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          required
        />
      </div>

      {/* Dates and Status */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Schedule</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Start Date"
            name="startDate"
            type="date"
            value={formData.startDate}
            onChange={handleChange}
            required
          />
          <Input
            label="End Date"
            name="endDate"
            type="date"
            value={formData.endDate}
            onChange={handleChange}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="input-field"
            >
              <option value={ContestStatus.DRAFT}>Draft</option>
              <option value={ContestStatus.UPCOMING}>Upcoming</option>
              <option value={ContestStatus.ONGOING}>Ongoing</option>
              <option value={ContestStatus.COMPLETED}>Completed</option>
              <option value={ContestStatus.CANCELLED}>Cancelled</option>
            </select>
          </div>
        </div>
        {dateError && (
          <p className="text-sm text-red-600 font-medium">{dateError}</p>
        )}
      </div>

      {/* Entry Rules */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Entry Rules</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Entry Type</label>
          <select
            name="entryRules"
            value={formData.entryRules}
            onChange={handleChange}
            className="input-field"
            required
          >
            <option value="one entry">One Entry</option>
            <option value="multiple entry">Multiple Entry</option>
          </select>
        </div>
      </div>

      {/* Prizes */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Prizes</h3>
        
        {/* Existing Prizes */}
        {prizes.length > 0 && (
          <div className="space-y-2">
            {prizes.map((prize) => (
              <div
                key={prize.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">{prize.name}</p>
                  <p className="text-sm text-gray-600">
                    Value: ₹{prize.value.toLocaleString()} | Quantity: {prize.quantity}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemovePrize(prize.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add New Prize */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Input
            placeholder="Prize name"
            value={newPrize.name}
            onChange={(e) => setNewPrize({ ...newPrize, name: e.target.value })}
          />
          <Input
            type="number"
            placeholder="Value (₹)"
            value={newPrize.value}
            onChange={(e) => setNewPrize({ ...newPrize, value: e.target.value })}
          />
          <Input
            type="number"
            placeholder="Quantity"
            value={newPrize.quantity}
            onChange={(e) => setNewPrize({ ...newPrize, quantity: e.target.value })}
          />
          <Button
            type="button"
            variant="secondary"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleAddPrize}
          >
            Add Prize
          </Button>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {contest ? 'Update Contest' : 'Create Contest'}
        </Button>
      </div>
    </form>
  );
};
