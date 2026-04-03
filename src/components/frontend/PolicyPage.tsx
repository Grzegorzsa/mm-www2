import { type ReactNode } from 'react'
import { RichText } from '@payloadcms/richtext-lexical/react'

interface PolicyPageProps {
  title: string
  cmsContent?: any
  children?: ReactNode
}

export default function PolicyPage({ title, cmsContent, children }: PolicyPageProps) {
  return (
    <div className="bg-[#2d2d2d] min-h-[calc(100vh-320px)] pb-4">
      <div className="max-w-4xl mx-auto bg-[#5f686d] text-white px-6 py-8 mb-4">
        <h1 className="text-3xl font-bold text-center tracking-widest mb-8">{title}</h1>
        {cmsContent ? (
          <div className="prose prose-invert prose-headings:text-white prose-h3:text-orange-400 prose-h4:text-[#ffc57b] prose-a:text-white hover:prose-a:text-red-300 max-w-none">
            <RichText data={cmsContent} />
          </div>
        ) : (
          <div className="prose prose-invert prose-h3:text-orange-400 prose-h4:text-[#ffc57b] prose-a:text-white hover:prose-a:text-red-300 max-w-none [&_ul]:list-disc [&_ol]:list-decimal [&_li]:ml-4">
            {children}
          </div>
        )}
      </div>
    </div>
  )
}
