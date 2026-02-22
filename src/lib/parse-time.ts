export const timeStringToMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};
export const minutesToTimeString = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}:00`;
};

export const timeLabels = (startTime: string, endTime: string) => {
  const startMinutes = timeStringToMinutes(startTime);
  const endMinutes = timeStringToMinutes(endTime);
  const labels = [];
  for (let time = startMinutes; time <= endMinutes; time += 30) {
    labels.push(formatPsqlTime(minutesToTimeString(time)));
  }
  return labels;
};

// HH:MM:SS -> HH:MM am/pm
export const formatPsqlTime = (time: string) => {
  const [hourStr, minuteStr] = time.split(":");
  let hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);
  const ampm = hour >= 12 ? "pm" : "am";
  hour = hour % 12 || 12; // Convert to 12-hour format
  return `${hour}:${minute.toString().padStart(2, "0")} ${ampm}`;
};
