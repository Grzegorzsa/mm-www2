import Link from 'next/link'

const footerLinks = [
  { href: '/manual', label: 'Manual' },
  { href: '/downloads', label: 'Downloads' },
  { href: '/contact', label: 'Contact' },
  { href: '/terms-and-conditions', label: 'Terms & Conditions' },
  { href: '/privacy-policy', label: 'Privacy Policy' },
  { href: '/refund-policy', label: 'Refund Policy' },
]

const Footer = () => {
  return (
    <footer className="bg-[#212121] text-[#999] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between gap-6">
          <div className="flex flex-col gap-2">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm hover:underline hover:text-gray-300 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            {/* Social media links can be added here */}
          </div>
        </div>
        <div className="mt-8 text-center text-sm">
          Copyright &copy; {new Date().getFullYear()} MXbeats.com. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

export default Footer
