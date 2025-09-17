// Helper function to generate unique IDs with a counter to prevent collisions
let idCounter = 0;
const generateUniqueId = (prefix = ''): string => {
  idCounter++;
  return `${prefix}${Date.now()}_${idCounter}`;
};

export default generateUniqueId;
