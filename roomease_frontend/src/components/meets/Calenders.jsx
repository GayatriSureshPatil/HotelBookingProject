

function Calendars({
    unavailableDates,
    
    EventDate,
    
  }) {
    
  
    // Check if a date is unavailable
    const isDateUnavailable = (date) => {
      return unavailableDates.some(
        (unavailableDate) =>
          stripTime(unavailableDate).getTime() === stripTime(date).getTime()
      );
    };
  
    // Assign class to grayed-out dates
    const dayClassName = (date) => {
      return isDateUnavailable(date) || date < today ? "grayed-out" : undefined;
    };
  
    
  
    const today = new Date();
    today.setHours(0, 0, 0, 0);
  
    return (
      
        <div>
          <p>Select a Check-In Date:</p>
          <DatePicker
            selected={checkInDate}
            onChange={(date) => setCheckInDate(date)}
            dayClassName={dayClassName}
            filterDate={(date) => date >= today && !isDateUnavailable(date)} // Disable previous dates
            inline
            calendarClassName="custom-calendar"
          />
        </div>
        
       </div>
    );
  }