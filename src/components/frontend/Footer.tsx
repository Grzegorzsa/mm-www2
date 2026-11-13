import Link from 'next/link'

const footerLinkColumns = [
  [
    { href: '/manual', label: 'Manual' },
    { href: '/downloads', label: 'Downloads' },
    { href: '/contact', label: 'Contact' },
  ],
  [
    { href: '/terms-and-conditions', label: 'Terms & Conditions' },
    { href: '/privacy-policy', label: 'Privacy Policy' },
    { href: '/cookie-policy', label: 'Cookie Policy' },
  ],
]

const Footer = () => {
  return (
    <footer className="bg-[#212121] text-[#999] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-8">
          {footerLinkColumns.map((column) => (
            <div key={column[0].href} className="flex flex-col gap-2">
              {column.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm hover:underline hover:text-gray-300 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
          <div className="flex">
            <a
              href="https://www.youtube.com/playlist?list=PLIjkMp6XqJSs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm hover:underline hover:text-gray-300 transition-colors"
            >
              YouTube
            </a>
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
