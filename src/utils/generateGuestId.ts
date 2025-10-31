/**
 * Generates a unique guest identifier
 * Uses timestamp + random string to ensure uniqueness
 */
export const generateGuestId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomString = Math.random().toString(36).substring(2, 15);
  return `guest_${timestamp}_${randomString}`;
};
