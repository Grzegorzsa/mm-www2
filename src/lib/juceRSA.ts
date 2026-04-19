/**
 * JUCE-compatible RSA encryption/decryption.
 *
 * Port of the JUCE RSA algorithm to JavaScript using BigInt.
 * The JUCE framework uses a custom RSA implementation that is not compatible
 * with standard Node.js crypto, so we replicate it here.
 *
 * Environment variables required:
 *   RSA_PRIVATE_KEY - JUCE RSA private key (format: "hex_part1,hex_part2")
 *   RSA_PUBLIC_KEY  - JUCE RSA public key  (format: "hex_part1,hex_part2")
 */

const privateKey = process.env.RSA_PRIVATE_KEY || ''
const publicKey = process.env.RSA_PUBLIC_KEY || ''

function objToBase64(obj: object): string {
  return toBase64(JSON.stringify(obj))
}

function toBase64(str: string): string {
  return Buffer.from(str).toString('base64')
}

const modPow = (base: bigint, exp: bigint, mod: bigint): bigint => {
  let result = 1n
  base = base % mod

  while (exp > 0n) {
    if (exp % 2n === 1n) {
      result = (result * base) % mod
    }
    exp = exp >> 1n
    base = (base * base) % mod
  }

  return result
}

const applyJuceRSAKey = (value: bigint, key: string): bigint => {
  const [part1 = '', part2 = ''] = key.split(',')

  const keyPart1 = BigInt('0x' + part1)
  const keyPart2 = BigInt('0x' + part2)

  let result = 0n

  while (value !== 0n) {
    result *= keyPart2

    const remainder = value % keyPart2
    value /= keyPart2

    result += modPow(remainder, keyPart1, keyPart2)
  }

  return result
}

const encrypt = (message: string): bigint => {
  const value = BigInt('0x' + Buffer.from(message).reverse().toString('hex'))
  return applyJuceRSAKey(value, privateKey)
}

const decrypt = (encrypted: bigint): bigint => applyJuceRSAKey(encrypted, publicKey)

const insertValue = (xmlString: string): bigint =>
  applyJuceRSAKey(BigInt('0x' + Buffer.from(xmlString).reverse().toString('hex')), privateKey)

const juceResponseMessage = (xmlString: string): string =>
  `<MESSAGE message="Thanks for registering our product!"><KEY>#${insertValue(xmlString).toString(16)}</KEY></MESSAGE>\0`

/**
 * Create an XML error response for the JUCE client.
 */
function juceErrorXml(message: string): string {
  if (!message) {
    message =
      'Sorry, we were not able to authorise your request. Please provide a valid email address and password.'
  }
  return `<?xml version="1.0" encoding="utf-8"?>\n    <ERROR error="${message}"></ERROR>`
}

/**
 * Create a signed XML certificate for the JUCE client.
 *
 * The certificate contains user info, machine binding, expiry times,
 * and license options (extensions, etc.) encoded as base64 JSON in the config attribute.
 */
function createCertificate(
  user: string,
  email: string,
  mach: string,
  product: string,
  token: string,
  options: object,
): string {
  const now = Date.now()
  const msFromDays = (days: number) => 1000 * 60 * 60 * 24 * days
  const expiryTime = (now + msFromDays(90)).toString(16)
  const refreshTime = (now + msFromDays(30)).toString(16)
  const optionsStr = objToBase64(options)

  const keyXml = `
  <?xml version="1.0" encoding="UTF-8"?>
  <key
    user="${user}"
    email="${email}"
    mach="${mach}"
    app="${product}"
    expiryTime="${expiryTime}"
    refreshTime="${refreshTime}"
    config="${optionsStr}"
    token="${token}"
  />`

  return juceResponseMessage(keyXml)
}

export {
  applyJuceRSAKey,
  encrypt,
  decrypt,
  juceResponseMessage,
  juceErrorXml,
  createCertificate,
  objToBase64,
  toBase64,
}
