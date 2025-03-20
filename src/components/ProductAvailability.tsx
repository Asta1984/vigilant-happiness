import { useState, useEffect } from 'react';
import { Calendar } from './ui/calendar';
import { DateRange } from 'react-day-picker';
import { X } from 'lucide-react';

interface DateLog {
  startDate: Date;
  endDate: Date;
}

const API_BASE_URL = 'http://localhost:8000/calender_api';
const PRODUCT_ID = '1'; // TODO: Replace with actual product ID from your app's context

// Helper function to generate all dates within a range
const getDatesInRange = (startDate: Date, endDate: Date): Date[] => {
  const dates = [];
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
};

// Helper function to group individual dates into consecutive ranges for display
const groupDatesIntoRanges = (dates: Date[]): DateLog[] => {
  if (dates.length === 0) return [];
  const sorted = [...dates].sort((a, b) => a.getTime() - b.getTime());
  const ranges: DateLog[] = [];
  let currentStart = sorted[0];
  let currentEnd = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    const nextDay = new Date(currentEnd);
    nextDay.setDate(nextDay.getDate() + 1);
    if (sorted[i].getTime() === nextDay.getTime()) {
      currentEnd = sorted[i];
    } else {
      ranges.push({ startDate: currentStart, endDate: currentEnd });
      currentStart = sorted[i];
      currentEnd = sorted[i];
    }
  }
  ranges.push({ startDate: currentStart, endDate: currentEnd });
  return ranges;
};

export function ProductAvailability() {
  const [isEditing, setIsEditing] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [dates, setDates] = useState<Date[]>([]); // Track individual dates
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reason, setReason] = useState(''); // Added reason input

  useEffect(() => {
    fetchUnavailableDates();
  }, []);

  const fetchUnavailableDates = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/products/${PRODUCT_ID}/unavailable-dates/`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      // Convert API dates to Date objects
      const fetchedDates = data.map((entry: any) => new Date(entry.unavailable_date));
      setDates(fetchedDates);
    } catch (err) {
      setError('Failed to load dates.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAvailability = async () => {
    if (!dateRange?.from || !dateRange?.to) return;
    
    const newDates = getDatesInRange(dateRange.from, dateRange.to);
    const allDates = [
      ...new Set([...dates, ...newDates].map(date => date.toISOString().split('T')[0]))
    ].map(dateStr => new Date(dateStr));

    try {
      setIsLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/products/${PRODUCT_ID}/unavailable-dates/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dates: allDates.map(date => date.toISOString().split('T')[0]),
            reason: reason || undefined,
          }),
        }
      );
      if (!response.ok) throw new Error('Failed to save');
      setDates(allDates);
      setDateRange(undefined);
      setReason('');
      setIsEditing(false);
    } catch (err) {
      setError('Failed to save dates.');
    } finally {
      setIsLoading(false);
    }
  };

  const removeDateRange = async (index: number) => {
    const ranges = groupDatesIntoRanges(dates);
    const rangeToRemove = ranges[index];
    const datesToRemove = getDatesInRange(rangeToRemove.startDate, rangeToRemove.endDate);
    const updatedDates = dates.filter(
      date => !datesToRemove.some(d => d.toISOString() === date.toISOString())
    );

    try {
      setIsLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/products/${PRODUCT_ID}/unavailable-dates/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dates: updatedDates.map(d => d.toISOString().split('T')[0]),
            reason: 'Updated after removal',
          }),
        }
      );
      if (!response.ok) throw new Error('Failed to delete');
      setDates(updatedDates);
    } catch (err) {
      setError('Failed to delete dates.');
    } finally {
      setIsLoading(false);
    }
  };

  // Render grouped ranges
  const dateRanges = groupDatesIntoRanges(dates);

  const formatDateRange = (startDate: Date, endDate: Date) => {
    return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
  };

  const getDaysCount = (startDate: Date, endDate: Date) => {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

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
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
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

      <div className='flex items-center justify-center p-4'>
        <Calendar
          mode="range"
          selected={dateRange}
          onSelect={setDateRange}
          className="rounded-md border"
          numberOfMonths={1}
          disabled={dateRanges.map(log => ({
            from: log.startDate,
            to: log.endDate
          }))}
        />
      </div>

      <div className="mt-6">
        {dateRanges.map((log, index) => (
          <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg mb-2">
            <div className="flex-1">
              <p className="font-medium">
                {formatDateRange(log.startDate, log.endDate)}
              </p>
              <p className="text-sm text-gray-600">
                The product will be unavailable for {getDaysCount(log.startDate, log.endDate)} days
              </p>
            </div>
            <button
              onClick={() => removeDateRange(index)}
              className="ml-2 text-gray-500 hover:text-gray-700"
              disabled={isLoading}
            >
              <X size={18} />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <button
          onClick={() => setIsEditing(false)}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          onClick={handleSaveAvailability}
          disabled={!dateRange?.from || !dateRange?.to || isLoading}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}