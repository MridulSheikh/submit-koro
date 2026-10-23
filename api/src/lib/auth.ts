import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import config from "../config";
import transporter from "./nodemailer";
import generateEmailTempletes from "../helpers/emailTemplates";
import { prisma } from "../../lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  advanced:{
    database: {
      joins:true
    }
  },
  trustedOrigins: [config.CLIENT_URL!],
  user: {
    additionalFields: {
      roleKey: {
        type: "string",
        required: false,
        input: false,
        defaultValue: "STUDENT"
      },
      status: {
        type: "string",
        defaultValue: "ACTIVE",
        required: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,
    onExistingUserSignUp: async ({ user }) => {
      console.log("Existing user signup:", user.email);
    },
  },
  emailVerification: {
    sendOnSignUp: true,
     autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      try {
        const VerificationUrl = `${config.CLIENT_URL}/verify-email?token=${token}`
        const info = await transporter.sendMail({
          from: config.SMTP_USER,
          to: user.email,
          subject: "Verify your email!",
          html: generateEmailTempletes(user.email, VerificationUrl)
        });
        console.log("Message sent:", info.messageId);
      } catch (error) {
        console.error("Email send failed:", error);
      }
    },
  },

});
