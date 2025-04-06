import { useState, useEffect,  } from 'react';
import { X } from 'lucide-react';
import { Calendar } from '../components/ui/calendar';
import { DateRange } from 'react-day-picker';
import useAvailabilityStore from '../store/useAvailabilityStore';
import { getDatesInRange, groupDatesIntoRanges, formatDateRange, getDaysCount } from '../utils/dateUtils';
import { Button } from './ui/button';
import { ChevronRight } from 'lucide-react';
import { Home, Heart, PlusCircle, MessageCircle, User } from 'lucide-react';
import NavigationItem from '../components/NavigationDock';

export function ProductAvailability() {
  const [isEditing, setIsEditing] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [reason, setReason] = useState('');

  const { dates, isLoading, fetchUnavailableDates, saveUnavailableDates } = useAvailabilityStore();
  // Progress bar segments
  const segments = Array(3).fill(null);
  const activeSegment = 2; 
  

  useEffect(() => {
    fetchUnavailableDates();
  }, [fetchUnavailableDates]);

  const handleSaveAvailability = async () => {
    if (!dateRange?.from || !dateRange?.to) return;
  
    const newDates = getDatesInRange(dateRange.from, dateRange.to);
    const allDates = [...new Set([...dates, ...newDates].map(date => 
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    ))].map(dateStr => new Date(dateStr));
  
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

      <>
      <div className=" mx-auto bg-white">
      <h2 className="text-l font-semibold mb-4">Product Unvailability</h2>
      {/* Progress Bar */}
      <div className="mb-4 justify-items-center">
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

          <div className="flex items-center justify-center">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={setDateRange}
              className="rounded-md border scale-90 origin-top"
              numberOfMonths={1}
              formatters={{
                formatWeekdayName: (date) => {
                  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
                  return dayNames[date.getDay()];
                },
              }}
              disabled={dateRanges.map(log => ({ from: log.startDate, to: log.endDate }))}
            />
          </div>

      <div>
        {dateRanges.length > 0 && (
          <p className="text-sm text-gray-700 font-medium text-nowrap">
            The product will be unavailable for {totalDays} days.
          </p>
        )}
  
        {dateRanges.map((log, index) => (
          <div key={index} className="flex items-center justify-between p-2 rounded-lg ">
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 mx-2">
                • {formatDateRange(log.startDate, log.endDate)}
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

      <div className="mt-2 flex justify-around gap-4 mb-4">
        <Button variant={'outline'} onClick={() => setIsEditing(false)} className="px-4 py-2 border-2 border-primary w-full text-gray-600 hover:text-gray-800 font-bold transition-colors" disabled={isLoading}>
          Add date log
        </Button>
        <Button onClick={handleSaveAvailability} disabled={!dateRange?.from || !dateRange?.to || isLoading} className="px-4 py-2 w-full text-white rounded-lg bg-[#635ae7] hover:bg-[#635ae7]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          Next
          <ChevronRight className="w-6 h-5 text-gray-100 "  strokeWidth={2}  />
        </Button>
      </div>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <NavigationItem icon={Home} label="Home" />
          <NavigationItem icon={Heart} label="Saved" />
          <NavigationItem icon={PlusCircle} label="Post" isActive/>
          <NavigationItem icon={MessageCircle} label="Chat" />
          <NavigationItem icon={User} label="Profile" />
        </div>
      </div>
      </div>
      </>
  );
}
