// Validate date format (YYYY-MM-DD)
export const isValidDate = (dateString: string): boolean => {
  // Check format YYYY-MM-DD
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  // Check if it's a real date
  const date = new Date(dateString);
  const [year, month, day] = dateString.split('-').map(Number);
  
  // Validate year, month, day are valid
  if (year < 2000 || year > 2100) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  
  // Check if date exists (e.g., no Feb 30)
  return date.getFullYear() === year && 
         date.getMonth() + 1 === month && 
         date.getDate() === day;
}