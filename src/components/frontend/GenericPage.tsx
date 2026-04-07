import { type ReactNode } from 'react'
import { RichText } from '@payloadcms/richtext-lexical/react'

interface GenericPageProps {
  title: string
  subtitle?: string
  content?: any
  children?: ReactNode
}

export default function GenericPage({ title, subtitle, content, children }: GenericPageProps) {
  return (
    <div className="bg-white min-h-[calc(100vh-320px)]">
      {/* Hero section with title */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-4xl md:text-5xl font-bold tracked-wide mb-3">{title}</h1>
          {subtitle && <p className="text-lg text-slate-300">{subtitle}</p>}
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-16">
        {content ? (
          <div className="prose prose-slate max-w-none prose-headings:font-bold prose-h2:text-3xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:text-slate-900 prose-h3:text-2xl prose-h3:mt-6 prose-h3:mb-3 prose-h3:text-slate-800 prose-h4:text-xl prose-h4:mt-4 prose-h4:mb-2 prose-h4:text-slate-700 prose-p:text-slate-700 prose-p:leading-relaxed prose-p:mb-4 prose-a:text-blue-600 prose-a:font-medium hover:prose-a:text-blue-700 prose-strong:text-slate-900 prose-strong:font-semibold prose-ul:my-4 prose-ul:pl-6 prose-li:text-slate-700 prose-li:mb-2 prose-ol:my-4 prose-ol:pl-6 prose-blockquote:border-l-4 prose-blockquote:border-slate-300 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-slate-600">
            <RichText data={content} />
          </div>
        ) : (
          <div className="prose prose-slate max-w-none prose-headings:font-bold prose-h2:text-3xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:text-slate-900 prose-h3:text-2xl prose-h3:mt-6 prose-h3:mb-3 prose-h3:text-slate-800 prose-h4:text-xl prose-h4:mt-4 prose-h4:mb-2 prose-h4:text-slate-700 prose-p:text-slate-700 prose-p:leading-relaxed prose-p:mb-4 prose-a:text-blue-600 prose-a:font-medium hover:prose-a:text-blue-700 prose-strong:text-slate-900 prose-strong:font-semibold prose-ul:my-4 prose-ul:pl-6 prose-li:text-slate-700 prose-li:mb-2 prose-ol:my-4 prose-ol:pl-6 prose-blockquote:border-l-4 prose-blockquote:border-slate-300 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-slate-600">
            {children}
          </div>
        )}
      </div>
    </div>
  )
}
