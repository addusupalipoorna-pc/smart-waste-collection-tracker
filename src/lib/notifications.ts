import { supabase } from '@/lib/supabase';
import type { NotificationType } from '@/types';

export async function sendNotification(
  userId: string,
  title: string,
  message: string,
  type: NotificationType = 'info',
  relatedComplaintId?: string
) {
  try {
    await supabase.from('notifications').insert({
      user_id: userId,
      title,
      message,
      type,
      related_complaint_id: relatedComplaintId || null,
    });
  } catch (err) {
    console.error('Failed to send notification:', err);
  }
}
