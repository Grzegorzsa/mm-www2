import { getPayload } from 'payload'
import config from '../payload.config'

const termsContent = {
  root: {
    type: 'root',
    children: [
      heading('Terms and Conditions', 1),
      heading('1. Introduction', 3),
      paragraph(
        'These terms and conditions govern your use of the mxbeats.com website and the purchase of our products. By using our website or purchasing our software, you accept these terms in full. If you disagree with any part of these terms, please do not use our website or services.',
      ),
      heading('2. Software License (EULA)', 3),
      paragraph(
        'All software downloaded or purchased from this site is subject to our End User License Agreement (EULA). By installing the software, you agree to the terms set forth in that agreement, which is incorporated here by reference.',
      ),
      heading('3. Payment Methods and Currency', 3),
      ul([
        'Payments are processed in your local currency whenever possible by our authorized payment gateway providers.',
        'The stated price on the website is an approximation. The final price depends on actual exchange rates at the time of transaction and any applicable local taxes (e.g., VAT).',
        'Condition of Sale: Your license is valid only upon our receipt of full payment. If you purchase via a third-party reseller who fails to remit payment to us, we reserve the right to revoke the license.',
      ]),
      heading('4. Warranty and Support', 3),
      ul([
        "Our software is provided 'as is,' without any warranties of any kind.",
        'We offer limited technical support via our contact form and email. We do not guarantee a specific response time, though we strive to assist all customers promptly.',
      ]),
      heading('5. Updates and Major Versions', 3),
      ul([
        'Standard Updates: Customers receive lifetime free updates for the major version they purchased (e.g., all 1.x updates).',
        'Major Upgrades: If a major version (e.g., 2.0) is released within six (6) months of your purchase date, you are eligible for a free upgrade. Outside of this window, major upgrades may require an additional fee.',
      ]),
      heading('6. License Consolidation Policy', 3),
      ul([
        'The standard purchase is for a single-user license.',
        'In the event that a user purchases multiple licenses for the same product, the features of these licenses will be consolidated into a single master license associated with the user\'s account.',
      ]),
      heading('7. Limitations of Liability', 3),
      ul([
        'We will not be liable for any damages of any kind arising from the use of this site or any product downloaded, including direct, indirect, incidental, punitive, and consequential damages.',
        'The Licensor is not responsible for any issues arising from third-party resellers or unauthorized distributors.',
      ]),
      heading('8. Contact Information', 3),
      paragraph('Questions regarding these Terms and Conditions should be sent to us via mxbeats.com/contact.'),
    ],
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  },
}

const privacyContent = {
  root: {
    type: 'root',
    children: [
      heading('Privacy Policy', 1),
      heading('1. Information Collected', 3),
      paragraph('When you interact with our website or use our software, we collect the following information:'),
      ol([
        'Account Data: We collect your email address to provide access to the user panel, validate software licenses, and communicate essential updates or account information.',
        'Device and License Data: We collect information regarding your operating system and computer username to manage your active installations and ensure proper license validation.',
        'Transaction Data: When you make a purchase, we collect data about the products purchased and the transaction amount.',
      ]),
      paragraph('Payment Security: We do not store your credit card or payment method details on our servers. All payments are processed securely by our third-party payment providers.'),
      heading('2. Use of Collected Information', 3),
      ol([
        'Service Delivery: To manage user accounts, provide access to personalized features, and validate software activations.',
        'Communication: To send relevant emails, technical notifications, and support responses.',
        'Analytics: We use basic Google Analytics to measure website traffic and improve our services.',
        'Sales Transactions: To process orders, fulfill purchases, and comply with tax and legal obligations.',
      ]),
      heading('3. Data Security', 3),
      paragraph('We take data security seriously. We implement appropriate technical and organizational measures—such as encryption and secure access controls—to protect your data from unauthorized access, loss, or misuse.'),
      heading('4. User Rights', 3),
      ol([
        'Access: Request access to the personal data we hold about you.',
        'Rectification: Correct any inaccuracies in your data.',
        'Erasure: Request the deletion of your account and associated data.',
        'Object: Object to or restrict the processing of your data.',
      ]),
      heading('5. Cookies and Tracking', 3),
      paragraph('Our website uses cookies to enable core functionality (such as keeping you logged in) and to analyze website traffic. You can adjust your browser settings to manage cookies.'),
      heading('6. Data Retention', 3),
      paragraph('We retain your information for as long as your account is active or as needed to provide you with software updates and support.'),
      heading('7. Contact Information', 3),
      paragraph('If you have any questions or concerns about our privacy policy, please contact us at mxbeats.com/contact.'),
    ],
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  },
}

const refundContent = {
  root: {
    type: 'root',
    children: [
      heading('Refund Policy', 1),
      heading('Trial Versions', 3),
      paragraph('We offer trial/demo versions of our products to allow customers to experience them before making a purchase. We strongly recommend installing these trial/demo versions to ensure compatibility with your system.'),
      heading('Refund Eligibility', 3),
      paragraph('We approve refunds for purchases made within the last 30 days under the following circumstances:'),
      ol([
        'Unsolvable Technical Issues: If you encounter an unsolvable technical issue caused by a bug or other product-related problem that renders the product unusable (e.g., frequent crashes), you are eligible for a refund.',
        'System Requirements Met: Refunds are granted only when all system requirements described on the product page were met at the time of purchase.',
      ]),
      heading('Non-Refundable Situations', 3),
      paragraph('You will NOT be eligible for a refund if:'),
      ul([
        'The Software has been successfully activated or registered on a device and no technical fault prevents its use.',
        'The refund request is made after 30 days from the date of purchase.',
        "The request is based on a 'change of mind' after successful activation.",
        'Termination for Cause: Your license has been terminated due to a violation of the EULA.',
      ]),
      heading('Third-Party Purchases (Resellers)', 3),
      paragraph('If you purchased the Software through an authorized third-party reseller, any refund requests must be processed through that reseller. The Licensor is not responsible for issuing refunds for payments made to third parties.'),
      heading('Contact Information', 3),
      paragraph('To request a refund, please contact us via our contact form with your order details and a description of the technical issue.'),
    ],
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  },
}

function heading(text: string, level: number) {
  return {
    type: 'heading',
    tag: `h${level}`,
    children: [{ type: 'text', text, version: 1 }],
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  }
}

function paragraph(text: string) {
  return {
    type: 'paragraph',
    children: [{ type: 'text', text, version: 1 }],
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  }
}

function ul(items: string[]) {
  return {
    type: 'list',
    listType: 'bullet',
    children: items.map((item) => ({
      type: 'listitem',
      children: [{ type: 'text', text: item, version: 1 }],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    })),
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
    start: 1,
    tag: 'ul',
  }
}

function ol(items: string[]) {
  return {
    type: 'list',
    listType: 'number',
    children: items.map((item, i) => ({
      type: 'listitem',
      value: i + 1,
      children: [{ type: 'text', text: item, version: 1 }],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    })),
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
    start: 1,
    tag: 'ol',
  }
}

const pages = [
  {
    title: 'Terms and Conditions',
    slug: 'terms-and-conditions',
    content: termsContent,
    metaDescription: 'Read the Terms and Conditions for using MXbeats software and website.',
  },
  {
    title: 'Privacy Policy',
    slug: 'privacy-policy',
    content: privacyContent,
    metaDescription: 'Read the MXbeats Privacy Policy to understand how we collect and use your data.',
  },
  {
    title: 'Refund Policy',
    slug: 'refund-policy',
    content: refundContent,
    metaDescription: 'Read the MXbeats Refund Policy to understand our refund eligibility and process.',
  },
]

async function seed() {
  const payload = await getPayload({ config: await config })

  for (const page of pages) {
    const existing = await payload.find({
      collection: 'pages',
      where: { slug: { equals: page.slug } },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      console.log(`Page "${page.slug}" already exists — skipping.`)
      continue
    }

    await payload.create({
      collection: 'pages',
      data: page as any,
    })
    console.log(`Created page: ${page.slug}`)
  }

  console.log('Seed complete.')
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
