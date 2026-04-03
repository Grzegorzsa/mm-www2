import { getPayload } from 'payload'
import config from '@/payload.config'
import PolicyPage from '@/components/frontend/PolicyPage'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms and Conditions — MXbeats',
  description: 'Read the Terms and Conditions for using MXbeats software and website.',
}

export default async function TermsAndConditionsPage() {
  let cmsContent: any = null
  try {
    const payload = await getPayload({ config: await config })
    const result = await payload.find({
      collection: 'pages',
      where: { slug: { equals: 'terms-and-conditions' } },
      limit: 1,
    })
    cmsContent = result.docs[0]?.content ?? null
  } catch {
    // fall through to static content
  }

  return (
    <PolicyPage title="Terms and Conditions" cmsContent={cmsContent}>
      <h3>1. Introduction</h3>
      <p>
        These terms and conditions govern your use of the mxbeats.com website and the purchase of
        our products. By using our website or purchasing our software, you accept these terms in
        full. If you disagree with any part of these terms, please do not use our website or
        services.
      </p>

      <h3>2. Software License (EULA)</h3>
      <p>
        All software downloaded or purchased from this site is subject to our End User License
        Agreement (EULA). By installing the software, you agree to the terms set forth in that
        agreement, which is incorporated here by reference.
      </p>

      <h3>3. Payment Methods and Currency</h3>
      <ul>
        <li>
          Payments are processed in your local currency whenever possible by our authorized payment
          gateway providers.
        </li>
        <li>
          The stated price on the website is an approximation. The final price depends on actual
          exchange rates at the time of transaction and any applicable local taxes (e.g., VAT).
        </li>
        <li>
          <strong>Condition of Sale:</strong> Your license is valid only upon our receipt of full
          payment. If you purchase via a third-party reseller who fails to remit payment to us, we
          reserve the right to revoke the license.
        </li>
      </ul>

      <h3>4. Warranty and Support</h3>
      <ul>
        <li>Our software is provided &ldquo;as is,&rdquo; without any warranties of any kind.</li>
        <li>
          We offer limited technical support via our contact form and email. We do not guarantee a
          specific response time, though we strive to assist all customers promptly.
        </li>
      </ul>

      <h3>5. Updates and Major Versions</h3>
      <ul>
        <li>
          <strong>Standard Updates:</strong> Customers receive lifetime free updates for the major
          version they purchased (e.g., all 1.x updates).
        </li>
        <li>
          <strong>Major Upgrades:</strong> If a major version (e.g., 2.0) is released within six
          (6) months of your purchase date, you are eligible for a free upgrade to that new version.
          Outside of this window, major upgrades may require an additional fee.
        </li>
      </ul>

      <h3>6. License Consolidation Policy</h3>
      <ul>
        <li>The standard purchase is for a single-user license.</li>
        <li>
          In the event that a user purchases multiple licenses for the same product, the features of
          these licenses will be consolidated into a single master license associated with the
          user&apos;s account.
        </li>
      </ul>

      <h3>7. Limitations of Liability</h3>
      <ul>
        <li>
          We will not be liable for any damages of any kind arising from the use of this site or any
          product downloaded, including but not limited to direct, indirect, incidental, punitive,
          and consequential damages.
        </li>
        <li>
          The Licensor is not responsible for any issues arising from third-party resellers or
          unauthorized distributors.
        </li>
      </ul>

      <h3>8. Contact Information</h3>
      <p>
        Questions regarding these Terms and Conditions should be sent to us via{' '}
        <a href="/contact">mxbeats.com/contact</a>.
      </p>
    </PolicyPage>
  )
}
