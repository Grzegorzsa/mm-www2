import { RedeemForm } from './RedeemForm'

export async function Redeem() {
  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-1">Redeem</h1>
      <p className="text-sm text-gray-500 mb-6">
        Activate a one-time code and assign a new license.
      </p>
      <RedeemForm />
    </div>
  )
}
