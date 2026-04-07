import Image from 'next/image'
import Link from 'next/link'

const Logo = () => {
  return (
    <Link href="/" className="flex items-center">
      <Image
        src="/logo.png"
        alt="MXBeats"
        width={180}
        height={40}
        style={{ width: 'auto', height: 34 }}
        priority
      />
    </Link>
  )
}

export default Logo
