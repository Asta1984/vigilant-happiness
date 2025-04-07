export interface DateLog {
    startDate: Date;
    endDate: Date;
  }
  
  // Generate all dates within a range
  export const getDatesInRange = (startDate: Date, endDate: Date): Date[] => {
    const dates = [];
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  };
  
  // Group individual dates into consecutive ranges
  export const groupDatesIntoRanges = (dates: Date[]): DateLog[] => {
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
  

// Format date range for display
export const formatDateRange = (startDate: Date, endDate: Date) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const formatDate = (date: Date) => {
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  };
  
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};
  
  
  // Get the number of days in a date range
  export const getDaysCount = (startDate: Date, endDate: Date) => {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };
  