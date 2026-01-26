import { modeType } from '../notification/notification.interface';
import { messages } from '../notification/notification.constant';
import { TUser } from './user.interface';
import { findAdmin } from '../../utils/findAdmin';
import { sendNotification } from '../../utils/sentNotification';
import emailSender from '../../utils/emailSender';

export const sendUserStatusNotifYToAdmin = async (
  status: 'active' | 'blocked',
  user: TUser,
) => {
  const admin = await findAdmin();
  if (!admin || !admin?.fcmToken) throw new Error('Admin not found or missing FCM token!');

  let message = '';
  let description = '';

  if (status === 'active') {
    message = messages.userManagement.accountActivated;
    description = `User ${user?.firstName + " " + user.lastName} (ID: ${user?.id}) has been successfully activated.`;
  } else {
    message = messages.userManagement.accountDeactivated;
    description = `User ${user?.firstName + " " + user.lastName} (ID: ${user?.id}) has been blocked from accessing the system.`;
  }

  const notifyPayload = {
    receiver: admin._id,
    message,
    description,
    reference: user._id,
    model_type: modeType.User,
  };

  await sendNotification([admin.fcmToken], notifyPayload);
};


export const sendUserStatusNotifYToUser = async (
  status: 'active' | 'blocked',
  user: TUser,
) => {
  if (!user?.fcmToken) throw new Error('User FCM token is missing!');

  let message = '';
  let description = '';

  if (status === 'active') {
    message = messages.userManagement.accountActivated;
    description = `Your account has been successfully activated. You can now access all available features.`;
  } else {
    message = messages.userManagement.accountDeactivated;
    description = `Your account has been blocked. Please contact support for further assistance.`;
  }

  const notifyPayload = {
    receiver: user._id,
    message,
    description,
    reference: user._id,
    model_type: modeType.User,
  };

  await sendNotification([user.fcmToken], notifyPayload);
};


export const sendBusinessInvitationEmail = async (
  email: string,
  name: string,
  password: string,
) => {
  await emailSender(
    email,
    'Business Account Invitation Submitted',
    `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #333;">Welcome Aboard, ${name}!</h2>
        <p>You have been invited by our <strong>Admin</strong> to join the Save Key platform as an Business.</p>

        <p style="color: #555;">Here are your login credentials:</p>
        <div style="background:#f4f4f4;padding:15px;border-radius:5px;margin:15px 0;">
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Password:</strong> ${password}</p>
        </div>

        <p style="color:#555;">
          👉 Please log in using the credentials above. For security, we highly recommend changing your password after your first login.
        </p>
        <p style="color:#555;">Once you log in, you will be able to complete your profile and begin your journey with us.</p>

        <p>Welcome aboard!<br/>— Save Key Team</p>
      </div>
    `,
  );
};
