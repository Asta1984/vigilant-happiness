import { useState, useEffect,  } from 'react';
import { X } from 'lucide-react';
import { Calendar } from '../components/ui/calendar';
import { DateRange } from 'react-day-picker';
import useAvailabilityStore from '../store/useAvailabilityStore';
import { getDatesInRange, groupDatesIntoRanges, formatDateRange, getDaysCount } from '../utils/dateUtils';

export function ProductAvailability() {
  const [isEditing, setIsEditing] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [reason, setReason] = useState('');

  const { dates, isLoading, error, fetchUnavailableDates, saveUnavailableDates } = useAvailabilityStore();
  // Progress bar segments
  const segments = Array(3).fill(null);
  const activeSegment = 2; 
  

  useEffect(() => {
    fetchUnavailableDates();
  }, [fetchUnavailableDates]);

  const handleSaveAvailability = async () => {
    if (!dateRange?.from || !dateRange?.to) return;

    const newDates = getDatesInRange(dateRange.from, dateRange.to);
    const allDates = [...new Set([...dates, ...newDates].map(date => date.toISOString().split('T')[0]))]
      .map(dateStr => new Date(dateStr));

    await saveUnavailableDates(allDates, reason);
    setDateRange(undefined);
    setReason('');
    setIsEditing(false);
  };

  const removeDateRange = async (index: number) => {
    const ranges = groupDatesIntoRanges(dates);
    const rangeToRemove = ranges[index];
    const datesToRemove = getDatesInRange(rangeToRemove.startDate, rangeToRemove.endDate);
    const updatedDates = dates.filter(date => !datesToRemove.some(d => d.toISOString() === date.toISOString()));

    await saveUnavailableDates(updatedDates, 'Updated after removal');
  };

  const dateRanges = groupDatesIntoRanges(dates);
  const totalDays = dateRanges.reduce((sum, log) => sum + getDaysCount(log.startDate, log.endDate), 0);

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        disabled={isLoading}
      >
        Update Availability
      </button>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Product Availability</h2>
      {/* Progress Bar */}
      <div className="mb-12 justify-items-center">
          <div className="flex gap-3 w-1/2">
            {segments.map((_, index) => (
              <div
                key={index}
                className={`h-1 flex-1 rounded-full ${
                  index <= activeSegment - 1 ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-500 rounded-lg">
          {error}
        </div>
      )}

      <input
        type="text"
        placeholder="Reason (optional)"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="mb-4 p-2 border rounded w-full"
      />

      <div className="flex items-center justify-center p-4">
        <Calendar
          mode="range"
          selected={dateRange}
          onSelect={setDateRange}
          className="rounded-md border"
          numberOfMonths={1}
          disabled={dateRanges.map(log => ({ from: log.startDate, to: log.endDate }))}
        />
      </div>

      <div className="mt-6">
        {dateRanges.length > 0 && (
          <p className="text-sm text-gray-700 font-medium mb-4">
            The product will be unavailable for {totalDays} days in total
          </p>
        )}
  
        {dateRanges.map((log, index) => (
          <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg mb-2">
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 mx-2">
                ⦿ {formatDateRange(log.startDate, log.endDate)}
                </span>
                <button
                  onClick={() => removeDateRange(index)}
                  className="ml-2 text-gray-500 hover:text-gray-700"
                  disabled={isLoading}
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        ))}
        </div>

      <div className="mt-6 flex justify-end gap-4">
        <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors" disabled={isLoading}>
          Cancel
        </button>
        <button onClick={handleSaveAvailability} disabled={!dateRange?.from || !dateRange?.to || isLoading} className="px-4 py-2  text-white rounded-lg bg-purple-800 hover:bg-purple-500/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {isLoading ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}
