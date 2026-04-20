import type { GlobalConfig } from 'payload'

export const WelcomeEmail: GlobalConfig = {
  slug: 'welcome-email',
  label: 'Welcome Email',
  admin: {
    description:
      'Email template sent to new users after email verification, along with welcome licenses',
  },
  access: {
    read: ({ req: { user } }) => user?.collection === 'admin-users',
    update: ({ req: { user } }) => user?.collection === 'admin-users',
  },
  fields: [
    {
      name: 'subject',
      type: 'text',
      required: true,
      defaultValue: 'Welcome to MXbeats!',
    },
    {
      name: 'text',
      type: 'textarea',
      required: true,
      defaultValue: `Thank you for signing up!

An MX GRID Essentials license has been added to your account.

You can log in to your account here: https://mxbeats.com/sign-in



Thanks,
MXbeats Team`,
      admin: {
        description: 'Plain text version of the email',
      },
    },
    {
      name: 'html',
      type: 'code',
      required: true,
      admin: {
        language: 'html',
        description: 'HTML version of the email',
      },
      defaultValue: `<div style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px;">
  <h2 style="color: #800a9d;">Welcome to the beat! 🎹</h2>

  <p>
    Thank you for signing up! We're excited to let you know that an
    <strong>MX GRID Essentials</strong> license has been successfully added to your account.
  </p>

  <p>You can start using your license right away by logging in below:</p>

  <p style="margin: 25px 0;">
    <a
      href="https://mxbeats.com/sign-in"
      style="background-color: #800a9d; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;"
    >
      Log in to MXbeats
    </a>
  </p>

  <p style="font-size: 13px; color: #666;">
    If the button doesn't work, use this link:<br />
    <a href="https://mxbeats.com/sign-in" style="color: #800a9d;">https://mxbeats.com/sign-in</a>
  </p>

  <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />

  <p>
    Happy creating,<br />
    <strong>The MXbeats Team</strong>
  </p>
</div>`,
    },
  ],
}
