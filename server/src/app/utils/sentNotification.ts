import { initializeApp, cert } from 'firebase-admin/app';
import AppError from '../errors/AppError';
import httpStatus from 'http-status'
import { TNotification } from '../modules/notification/notification.interface';
import config from '../config';
import { getNotificationQueue } from '../queues/queues';

const firebaseConfig = {
  type: "service_account",
  project_id: config.firebase.project_id,
  private_key_id: config.firebase.private_key_id,
  private_key: config.firebase.private_key,
  client_email: config.firebase.client_email,
  client_id: config.firebase.client_id,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: config.firebase.client_x509_cert_url,
};

initializeApp({
  credential: cert(firebaseConfig as any),
});

export const sendNotification = async (
  fcmToken: string[],
  payload: TNotification,
): Promise<any> => {
  // Enqueue notification job for asynchronous processing
  try {
    const queue = getNotificationQueue();
    await queue.add('send-notification', {
      channel: 'push',
      receiver: payload.receiver,
      message: payload.message,
      description: payload.description,
      model_type: payload.model_type,
      reference: payload.reference,
      fcmTokens: fcmToken,
    });
    // Optionally return a placeholder response
    return { enqueued: true };
  } catch (error) {
    console.error('Error enqueuing notification job:', error);
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to enqueue notification');
  }
};