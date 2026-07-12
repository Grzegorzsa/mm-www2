export const purchaseWelcomeEmailDefaults = {
  subject: 'Thank you for your purchase, order {{externalOrderId}}',
  text: `Hello,

Thank you for your purchase of {{applicationName}}.

Purchased variant: {{variantName}}

Your order ID: {{externalOrderId}}

Download the application here:
{{downloadsUrl}}

How to activate the app:
1. Install and launch the application.
2. In the login screen, enter this email in the user/email field: {{loginEmail}}
3. Enter this password: {{loginPassword}}
4. Complete authorization inside the app.

Use the credentials above to authorize the desktop application. If this account was created during purchase, this is your generated password.

If you purchased a higher variant and already have the application installed, for example in a demo version, open Help -> Register Product, click "Refresh License", and then reload the application.

User panel:
{{userPanelUrl}}

After signing in, we recommend changing your password in the My Account section:
{{accountSecurityNotice}}

You can also sign in here:
{{signInUrl}}

Best regards,
MXbeats Team`,
  html: `<div style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 640px;">
  <h2 style="color: #0f7db7;">Thank you for your purchase</h2>

  <p>
    Your purchase of <strong>{{applicationName}}</strong> has been processed successfully. Your order ID is
    <strong>{{externalOrderId}}</strong>.
  </p>

  <p>Purchased variant: <strong>{{variantName}}</strong></p>

  <p>
    Download the application here:<br />
    <a href="{{downloadsUrl}}" style="color: #0f7db7;">{{downloadsUrl}}</a>
  </p>

  <h3 style="margin-top: 28px; color: #111;">Activation instructions</h3>
  <ol style="padding-left: 20px;">
    <li>Install and launch the application.</li>
    <li>In the login screen, enter this email in the user/email field: <strong>{{loginEmail}}</strong></li>
      <li>Check your inbox for the password reset link we sent to set your password.</li>
    <li>Complete authorization inside the app.</li>
  </ol>

  <p style="background: #f5f9fc; border: 1px solid #d7e7f2; padding: 14px; border-radius: 6px;">
      Use the email address above to sign in, then finish setting your password using the reset link in your inbox.
  </p>

  <p>
    If you purchased a higher variant and already have the application installed, for example in a demo version,
    open <strong>Help -> Register Product</strong>, click <strong>Refresh License</strong>, and then reload the application.
  </p>

  <p>
    User panel:<br />
    <a href="{{userPanelUrl}}" style="color: #0f7db7;">{{userPanelUrl}}</a>
  </p>

  <p>
    After your first sign-in, we recommend changing your password in <strong>My Account</strong>.
    {{accountSecurityNotice}}
  </p>

  <p>
    Direct sign-in page:<br />
    <a href="{{signInUrl}}" style="color: #0f7db7;">{{signInUrl}}</a>
  </p>

  <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />

  <p>
    Best regards,<br />
    <strong>MXbeats Team</strong>
  </p>
</div>`,
}
