import Link from 'next/link'

export const metadata = {
  title: 'Purchase Completed - MXbeats',
}

type CheckoutSuccessPageProps = {
  searchParams?: Promise<{ flow?: string; source?: string }>
}

export default async function CheckoutSuccessPage({ searchParams }: CheckoutSuccessPageProps) {
  const params = searchParams ? await searchParams : undefined
  const flow = String(params?.flow ?? '').toLowerCase()
  const source = String(params?.source ?? '').toLowerCase()
  const isUpgrade = flow === 'upgrade'

  return (
    <section className="max-w-3xl mx-auto px-4 py-14" data-checkout-source={source || 'unknown'}>
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-gray-900">Thank you for your purchase</h1>

        <p className="mt-4 text-gray-700 leading-relaxed">
          Your payment was completed successfully. Please check your email and follow the
          instructions to finish authorization and access your product files.
        </p>

        {isUpgrade ? (
          <p className="mt-3 text-gray-700 leading-relaxed">
            If this was an upgrade or crossgrade, open your Purchases page and refresh your license
            information in the app.
          </p>
        ) : (
          <p className="mt-3 text-gray-700 leading-relaxed">
            If this was your first order, use the credentials sent by email to sign in to your user
            panel and download the installer.
          </p>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/user-panel/purchases"
            className="inline-block bg-black text-white px-5 py-2 text-sm tracking-wider uppercase rounded hover:bg-gray-800 transition-colors"
          >
            Go to Purchases
          </Link>
          <Link
            href="/sign-in"
            className="inline-block border border-gray-300 text-gray-800 px-5 py-2 text-sm tracking-wider uppercase rounded hover:bg-gray-50 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/downloads"
            className="inline-block border border-gray-300 text-gray-800 px-5 py-2 text-sm tracking-wider uppercase rounded hover:bg-gray-50 transition-colors"
          >
            Downloads
          </Link>
        </div>
      </div>
    </section>
  )
}
