import { getPayload } from 'payload'
import config from '@/payload.config'
import PolicyPage from '@/components/frontend/PolicyPage'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Refund Policy — MXbeats',
  description: 'Read the MXbeats Refund Policy to understand your rights and our refund process.',
}

export default async function RefundPolicyPage() {
  let cmsContent: any = null
  try {
    const payload = await getPayload({ config: await config })
    const result = await payload.find({
      collection: 'pages',
      where: { slug: { equals: 'refund-policy' } },
      limit: 1,
    })
    cmsContent = result.docs[0]?.content ?? null
  } catch {
    // fall through to static content
  }

  return (
    <PolicyPage title="Refund Policy" cmsContent={cmsContent}>
      <h3>1. Free Trial</h3>
      <p>
        We offer a free trial of our software so you can evaluate it before making a purchase. We
        strongly encourage you to take advantage of the trial period to ensure the software meets
        your needs.
      </p>

      <h3>2. Refund Eligibility</h3>
      <p>
        We offer refunds within <strong>14 days</strong> of the purchase date, provided:
      </p>
      <ul>
        <li>The software has a major confirmed bug that we are unable to fix in a timely manner.</li>
        <li>
          The software does not perform as described on the product page, and the issue cannot be
          resolved through support.
        </li>
      </ul>
      <p>
        Refund requests must be submitted through our <a href="/contact">contact form</a> with a
        description of the issue.
      </p>

      <h3>3. Non-Refundable Circumstances</h3>
      <p>We do not offer refunds in the following situations:</p>
      <ul>
        <li>
          You have changed your mind after purchase (a free trial is available for this purpose).
        </li>
        <li>
          The software does not meet your personal preferences or workflow, if it otherwise functions
          as technically described.
        </li>
        <li>
          The license key has been downloaded or activated (unless the refund criteria above are
          met).
        </li>
        <li>
          Issues arising from your own hardware, operating system, or incompatible third-party
          software.
        </li>
      </ul>

      <h3>4. Third-Party Purchases</h3>
      <p>
        If you purchase our software through a third-party reseller or marketplace, their refund
        policy may apply. Please contact the reseller directly for purchases made through their
        platform.
      </p>

      <h3>5. Contact Us</h3>
      <p>
        To request a refund or if you have questions about this policy, please contact us via{' '}
        <a href="/contact">mxbeats.com/contact</a>.
      </p>
    </PolicyPage>
  )
}
