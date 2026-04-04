import { getPayload } from 'payload'
import config from '@/payload.config'
import Link from 'next/link'
import { Check, X } from 'lucide-react'

export const metadata = {
  title: 'MXbeats — Music Looping Software',
  description:
    'MXbeats is a cutting-edge music looping software that empowers musicians, producers, and performers.',
}

const pricingRows: Array<{
  feature: string
  essentials: boolean | string | React.ReactNode
  loops: boolean | string | React.ReactNode
}> = [
  {
    feature: 'Price',
    essentials: 'Free',
    loops: (
      <>
        <del>$79</del> <small className="text-sm">— Free (Beta)</small>
      </>
    ),
  },
  { feature: 'Timeline Editor', essentials: true, loops: true },
  { feature: 'MIDI Controller Support', essentials: true, loops: true },
  { feature: 'Play Loops and Samples', essentials: true, loops: true },
  { feature: 'Slots for Loops and Samples', essentials: '512', loops: '512' },
  { feature: 'Max Number of Outputs', essentials: '2', loops: '32' },
  { feature: 'Standalone App', essentials: true, loops: true },
  { feature: 'DAW Plugin', essentials: false, loops: true },
  { feature: 'Render Audio', essentials: false, loops: true },
  { feature: 'DSP', essentials: false, loops: true },
  { feature: 'License Type', essentials: 'Personal use only', loops: 'Commercial (Beta)' },
]

import React from 'react'

function BoolCell({ value }: { value: boolean }) {
  return value ? (
    <Check className="mx-auto text-green-500" size={22} />
  ) : (
    <X className="mx-auto text-gray-400" size={22} />
  )
}

function FeatureBlock({
  image,
  heading,
  description,
  textColor = '#fff',
}: {
  image: string
  heading: string
  description: string
  textColor?: string
}) {
  return (
    <div
      className="relative w-full sm:w-1/2 flex items-center justify-center"
      style={{
        paddingBottom: '30%',
        backgroundImage: `url('${image}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: textColor,
        minHeight: 180,
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="mx-[13%]">
          <h3 className="text-[2vw] tracking-[0.7vw] leading-tight mt-0 font-semibold">
            {heading}
          </h3>
          <p className="text-[1.2vw] tracking-[0.2vw] font-semibold mt-2">{description}</p>
        </div>
      </div>
    </div>
  )
}

export default async function HomePage() {
  let homepageData: any = null
  try {
    const payload = await getPayload({ config: await config })
    homepageData = await payload.findGlobal({ slug: 'homepage' })
  } catch {
    // fallback to hardcoded defaults
  }

  const hero = homepageData?.hero
  const intro = homepageData?.intro
  const timeline = homepageData?.timeline

  return (
    <>
      {/* Hero */}
      <section
        className="relative w-full"
        style={{
          paddingBottom: '47%',
          backgroundImage: "url('/images/home/slide-1.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: 300,
        }}
      >
        <div
          className="absolute inset-0 w-1/2"
          style={{
            background: 'linear-gradient(90deg, rgba(3,10,38,1) 0%, rgba(0,0,0,0) 100%)',
            opacity: 0.75,
          }}
        />
        <div className="absolute inset-0 flex items-center">
          <div
            className="ml-[5vw] w-[40vw] font-semibold leading-none"
            style={{ marginTop: '-7%' }}
          >
            <div className="text-[4.5vw] tracking-[0.71vw]">{hero?.headline1 ?? 'Unlock your'}</div>
            <div className="text-[5.8vw] tracking-[0.71vw]">{hero?.headline2 ?? 'creativity'}</div>
            <div className="text-[1.65vw] tracking-[0.71vw] opacity-75 mt-[1vw] leading-snug">
              {hero?.subline ?? 'with our unique music production tool'}
            </div>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="bg-black text-[#b8b5b2] text-center py-8 px-8">
        <p className="text-xl lg:text-2xl max-w-3xl mx-auto leading-relaxed">
          {intro?.text ??
            'MXbeats is a cutting-edge music looping software that empowers musicians, producers, and performers to create, arrange, and perform their music with ease and precision.'}
        </p>
        <div className="mt-6">
          <Link
            href={intro?.ctaUrl ?? '/downloads'}
            className="inline-block border border-white text-white px-8 py-3 text-sm tracking-[4px] uppercase hover:bg-white hover:text-black transition-colors font-medium"
          >
            {intro?.ctaLabel ?? 'GET IT NOW'}
          </Link>
        </div>
      </section>

      {/* Feature 1 — full width with right-side overlay */}
      <section
        className="relative"
        style={{
          paddingBottom: '38%',
          backgroundImage: "url('/images/home/home-features-1.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: 200,
        }}
      >
        <div className="absolute inset-y-0 right-0 w-1/2 bg-black/60 flex items-center justify-center">
          <div className="mx-[13%]">
            <h3 className="text-[2vw] tracking-[0.7vw] leading-tight mt-0 font-semibold">
              Live Performance at Your Fingertips
            </h3>
            <p className="text-[1.2vw] tracking-[0.2vw] font-semibold mt-2">
              Play live using your mouse, computer keyboard, or MIDI controller. Express yourself in
              real-time performance.
            </p>
          </div>
        </div>
      </section>

      {/* Features grid row 1 */}
      <div className="flex flex-col sm:flex-row">
        <FeatureBlock
          image="/images/home/home-features-2.jpg"
          heading="Ample Space for Creativity"
          description="With over 500 slots, organize your loops and samples without limitations. Let your imagination run wild."
        />
        <FeatureBlock
          image="/images/home/home-features-3.jpg"
          heading="Automated Sample Import"
          description="Streamline your workflow by automating the import process for media files. The software assigns tempo, color, icon, and instrument group to each sample."
          textColor="#000"
        />
      </div>

      {/* Timeline */}
      <section
        className="text-center py-8 px-4 text-white"
        style={{
          backgroundImage: "url('/images/home/home-features-4back.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="max-w-5xl mx-auto">
          <h3 className="text-[2vw] tracking-[0.7vw] leading-none mt-2 font-semibold">
            {timeline?.heading ?? 'Timeline Editor'}
            <br />
            <span className="text-[1.5vw]">
              {timeline?.subheading ?? 'for Complete Song Creation'}
            </span>
          </h3>
          <video
            autoPlay
            muted
            loop
            playsInline
            poster="/images/home/mxgrid-intro.png"
            className="w-full max-w-full mt-4 mx-auto block"
          >
            <source src="/images/home/mxgrid-intro.mp4" type="video/mp4" />
          </video>
          <p className="text-[1.2vw] tracking-[0.2vw] font-semibold mt-4">
            {timeline?.description ??
              'Compose entire songs with built-in timeline editor. Arrange loops and samples creating cohesive musical pieces.'}
          </p>
        </div>
      </section>

      {/* Features grid row 2 */}
      <div className="flex flex-col sm:flex-row">
        <FeatureBlock
          image="/images/home/home-features-5.jpg"
          heading="Plugin with 32 Outputs"
          description="Explore a world of effects and creative possibilities. With 32 outputs, you can route audio to various channels, apply effects, and achieve professional-grade soundscapes."
        />
        <FeatureBlock
          image="/images/home/home-features-6.jpg"
          heading="Launchpad X and MIDI Device Support"
          description="MXbeats is Launchpad X-ready, providing native support for this popular MIDI controller and other compatible devices."
        />
      </div>

      {/* Pricing */}
      <section id="pricing" className="bg-[#e3e3e1] text-[#464946] text-center py-10 px-4">
        <h3 className="text-5xl font-semibold mb-6">Pricing</h3>
        <div className="overflow-x-auto">
          <table className="border-separate border-spacing-0 w-full max-w-5xl mx-auto">
            <thead>
              <tr>
                <th className="bg-transparent w-[44%] p-4" />
                <th className="bg-[#72cd78] text-white p-4 min-w-50 text-xl font-semibold">
                  MXbeats Essentials
                </th>
                <th className="bg-[#3fbef2] text-white p-4 min-w-50 text-xl font-semibold">
                  MXbeats Loops
                </th>
              </tr>
            </thead>
            <tbody>
              {pricingRows.map((row, i) => (
                <tr key={i}>
                  <th className="bg-[#fafafa] border border-white text-left px-6 py-2 text-lg font-medium">
                    {row.feature}
                  </th>
                  <td className="bg-white border border-white text-center px-6 py-2 text-lg">
                    {typeof row.essentials === 'boolean' ? (
                      <BoolCell value={row.essentials} />
                    ) : (
                      row.essentials
                    )}
                  </td>
                  <td className="bg-white border border-white text-center px-6 py-2 text-lg">
                    {typeof row.loops === 'boolean' ? <BoolCell value={row.loops} /> : row.loops}
                  </td>
                </tr>
              ))}
              <tr>
                <th className="bg-[#fafafa] border border-white border-b-4 px-6 py-4" />
                <td className="bg-white border border-white border-b-4 text-center px-6 py-4">
                  <Link
                    href="/downloads"
                    className="inline-block bg-[#72cd78] text-white px-6 py-2 text-sm tracking-widest uppercase hover:bg-[#5ab360] transition-colors font-medium rounded"
                  >
                    Download
                  </Link>
                </td>
                <td className="bg-white border border-white border-b-4 text-center px-6 py-4">
                  <Link
                    href="/register"
                    className="inline-block bg-[#3fbef2] text-white px-6 py-2 text-sm tracking-widest uppercase hover:bg-[#2da8d8] transition-colors font-medium rounded"
                  >
                    Register
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Try Demo */}
      <section className="bg-[#b3b2b2] text-[#3c3c3c] text-center py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-2xl font-semibold mb-3">
            Unlock the Full Potential: Try Our Free Demo!
          </h3>
          <p className="mb-5">
            No Strings Attached: Try our demo for free, as long as you like, with no obligations.
            You won&apos;t be asked for credit card details or any commitment.
          </p>
          <Link
            href="/downloads"
            className="inline-block bg-black text-white px-8 py-3 text-sm tracking-[4px] uppercase hover:bg-gray-800 transition-colors font-medium"
          >
            DOWNLOAD DEMO
          </Link>
        </div>
      </section>
    </>
  )
}
