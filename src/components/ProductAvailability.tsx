import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Calendar } from '../components/ui/calendar';
import { DateRange } from 'react-day-picker';
import useAvailabilityStore from '../store/useAvailabilityStore';
import { getDatesInRange, groupDatesIntoRanges, formatDateRange, getDaysCount } from '../utils/dateUtils';
import { Button } from './ui/button';
import { ChevronRight, MoveLeftIcon } from 'lucide-react';
import { Home, Heart, PlusCircle, MessageCircle, User } from 'lucide-react';
import NavigationItem from '../components/NavigationDock';

export function ProductAvailability() {
  const [isEditing, setIsEditing] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [localDateRanges, setLocalDateRanges] = useState<DateRange[]>([]);

  const { dates, isLoading, fetchUnavailableDates, saveUnavailableDates } = useAvailabilityStore();
  // Progress bar segments
  const segments = Array(4).fill(null);
  const activeSegment = 3;

  useEffect(() => {
    fetchUnavailableDates();
  }, [fetchUnavailableDates]);

  const handleAddDateLog = () => {
    if (!dateRange?.from || !dateRange?.to) return;
    
    // Add the current dateRange to localDateRanges
    setLocalDateRanges(prev => [...prev, { from: dateRange.from, to: dateRange.to }]);
    
    // Clear the current selection
    setDateRange(undefined);
  };

  const handleSaveAvailability = async () => {
    // Combine all local date ranges and existing dates
    const allDatesToSave = new Set<string>();
    
    // Add existing dates
    dates.forEach(date => {
      allDatesToSave.add(
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      );
    });
    
    // Add all new date ranges
    localDateRanges.forEach(range => {
      if (range.from && range.to) {
        const newDates = getDatesInRange(range.from, range.to);
        newDates.forEach(date => {
          allDatesToSave.add(
            `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
          );
        });
      }
    });
    
    // Convert back to Date objects
    const datesToSave = Array.from(allDatesToSave).map(dateStr => new Date(dateStr));
    
    // Save to backend
    await saveUnavailableDates(datesToSave);
    
    // Reset state
    setLocalDateRanges([]);
    setDateRange(undefined);
    setIsEditing(false);
  };

  const removeDateRange = async (index: number) => {
    const ranges = groupDatesIntoRanges(dates);
    const rangeToRemove = ranges[index];
    const datesToRemove = getDatesInRange(rangeToRemove.startDate, rangeToRemove.endDate);
    const updatedDates = dates.filter(date => !datesToRemove.some(d => d.toISOString() === date.toISOString()));

    await saveUnavailableDates(updatedDates, 'Updated after removal');
  };

  const removeLocalDateRange = (index: number) => {
    setLocalDateRanges(prev => prev.filter((_, i) => i !== index));
  };

  const existingDateRanges = groupDatesIntoRanges(dates);
  
  // Calculate total days from both existing dates and new local ranges
  const existingTotalDays = existingDateRanges.reduce(
    (sum, log) => sum + getDaysCount(log.startDate, log.endDate), 0
  );
  
  const localTotalDays = localDateRanges.reduce(
    (sum, range) => range.from && range.to ? sum + getDaysCount(range.from, range.to) : sum, 0
  );
  
  const totalDays = existingTotalDays + localTotalDays;

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
      <MoveLeftIcon className="w-6 h-6" />
        <h2 className="text-l font-semibold mb-4">Product Unavailability</h2>
        {/* Progress Bar */}
        <div className="mb-8 justify-items-center">
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
                const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                return dayNames[date.getDay()];
              },
            }}
            disabled={[
              ...existingDateRanges.map(log => ({ from: log.startDate, to: log.endDate })),
              // Don't disable local date ranges that are pending save
            ]}
          />
        </div>

        <div className='max-w-md'>
          {(existingDateRanges.length > 0 || localDateRanges.length > 0) && (
            <p className="text-sm text-gray-700 font-medium text-nowrap">
              The product will be unavailable for {totalDays} days.
            </p>
          )}

          {/* Display existing date ranges */}
          {existingDateRanges.map((log, index) => (
            <div key={`existing-${index}`} className="flex items-center justify-between p-2 rounded-lg">
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

          {/* Display local date ranges that are pending save */}
          {localDateRanges.map((range, index) => (
            <div key={`local-${index}`} className="flex items-center justify-between p-2 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 mx-2">
                    • {range.from && range.to ? formatDateRange(range.from, range.to) : ''} 
                  </span>
                  <button
                    onClick={() => removeLocalDateRange(index)}
                    className="ml-2 text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-2 flex justify-around gap-4">
          <Button 
            variant={'outline'} 
            onClick={handleAddDateLog} 
            className="px-4 py-2 border-2 border-primary w-full text-gray-600 hover:text-gray-800 font-bold transition-colors" 
            disabled={!dateRange?.from || !dateRange?.to || isLoading}
          >
            Add date log
          </Button>
          <Button 
            onClick={handleSaveAvailability} 
            disabled={(localDateRanges.length === 0) || isLoading} 
            className="px-4 py-2 w-full text-white rounded-lg bg-[#635ae7] hover:bg-[#635ae7]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="w-6 h-5 text-gray-100" strokeWidth={2} />
          </Button>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
          <div className="flex items-center justify-between max-w-md mx-auto">
            <NavigationItem icon={Home} label="Home" />
            <NavigationItem icon={Heart} label="Saved" />
            <NavigationItem icon={PlusCircle} label="Post" isActive />
            <NavigationItem icon={MessageCircle} label="Chat" />
            <NavigationItem icon={User} label="Profile" />
          </div>
        </div>
      </div>
    </>
  );
}