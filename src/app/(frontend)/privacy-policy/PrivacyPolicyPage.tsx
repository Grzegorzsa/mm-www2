import { getPayload } from 'payload'
import config from '@/payload.config'
import PolicyPage from '@/components/frontend/PolicyPage'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — MXbeats',
  description: 'Read the MXbeats Privacy Policy to understand how we collect and use your data.',
}

export default async function PrivacyPolicyPage() {
  let cmsContent: any = null
  try {
    const payload = await getPayload({ config: await config })
    const result = await payload.find({
      collection: 'pages',
      where: { slug: { equals: 'privacy-policy' } },
      limit: 1,
    })
    cmsContent = result.docs[0]?.content ?? null
  } catch {
    // fall through to static content
  }

  return (
    <PolicyPage title="Privacy Policy" cmsContent={cmsContent}>
      <h3>1. Information We Collect</h3>
      <p>
        When you register for an account or make a purchase, we collect personal information such as
        your name, email address, and payment details. We may also collect non-personal information,
        such as browser type, IP address, and pages visited on our website.
      </p>

      <h3>2. How We Use Your Information</h3>
      <ul>
        <li>To process transactions and deliver the products you have purchased.</li>
        <li>To send you important information about your account and our services.</li>
        <li>To provide customer support and respond to inquiries.</li>
        <li>To improve our website and customer experience.</li>
        <li>
          To send promotional emails about new products or special offers (you may opt out at any
          time).
        </li>
      </ul>

      <h3>3. Data Security</h3>
      <p>
        We implement a variety of security measures to maintain the safety of your personal
        information. All sensitive data is transmitted via Secure Socket Layer (SSL) technology and
        encrypted in our database. We do not store your full credit card information; payment
        processing is handled by our authorized and PCI-compliant third-party payment gateways.
      </p>

      <h3>4. Your Rights</h3>
      <p>
        You have the right to access, correct, or delete the personal data we hold about you. To
        exercise these rights, please contact us via our <a href="/contact">contact form</a>.
      </p>

      <h3>5. Cookies</h3>
      <p>
        We use cookies to improve your browsing experience. These are small files stored on your
        device that help us remember your preferences and understand how you use our site. You can
        choose to disable cookies in your browser settings, but this may affect some functionality.
      </p>

      <h3>6. Data Retention</h3>
      <p>
        We retain your personal data for as long as your account is active or as needed to provide
        you with our services. You may request deletion of your account and associated data at any
        time by contacting us.
      </p>

      <h3>7. Contact Us</h3>
      <p>
        If you have any questions about this Privacy Policy, please contact us via{' '}
        <a href="/contact">mxbeats.com/contact</a>.
      </p>
    </PolicyPage>
  )
}
