import { Expo, type ExpoPushMessage, type ExpoPushTicket } from 'expo-server-sdk';

const expo = new Expo();

/**
 * Send a batch of Expo push messages, chunked per Expo's own recommendation.
 * Logs (not throws) on a per-chunk send failure so one bad chunk doesn't
 * abort the rest — callers get the tickets to inspect for per-message errors.
 */
export async function sendExpoPushNotifications(
  messages: ExpoPushMessage[],
): Promise<ExpoPushTicket[]> {
  const chunks = expo.chunkPushNotifications(messages);
  const tickets: ExpoPushTicket[] = [];
  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    } catch (err) {
      console.error('[sendExpoPushNotifications] chunk send failed:', err);
    }
  }
  return tickets;
}
