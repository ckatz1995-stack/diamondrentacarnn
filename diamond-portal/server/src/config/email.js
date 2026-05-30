import sgMail from '@sendgrid/mail';
import { env } from './env.js';

if (env.SENDGRID_API_KEY) {
  sgMail.setApiKey(env.SENDGRID_API_KEY);
}

export { sgMail };
