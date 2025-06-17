module.exports.addTimeToCurrentDate = async(close_time) => {
    const currentDate = new Date();

    // Adjusted regex to handle both "1hours" and "1 hours"
    const timeParts = close_time.match(/^(\d+)\s?(hours|days|months)$/);

    if (!timeParts) {
	return [false,'Invalid close_time format. It should be in the format "1 hours", "1hours", "1 days", "1days", etc.'];    
    }

    const value = parseInt(timeParts[1], 10); // Extract the numeric value
    const unit = timeParts[2]; // Extract the time unit (hours, days, months)

    switch (unit) {
        case 'hours':
            currentDate.setHours(currentDate.getHours() + value);
            break;
        case 'days':
            currentDate.setDate(currentDate.getDate() + value);
            break;
        case 'months':
            currentDate.setMonth(currentDate.getMonth() + value);
            break;
        default:
            return [false,'Unsupported time unit'];		    
    }

    return [true,currentDate.toISOString()];
};
