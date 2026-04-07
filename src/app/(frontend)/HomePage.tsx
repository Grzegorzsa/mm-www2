// Clear cache: Remove-Item -Recurse -Force .next
import { getPayload } from 'payload'
import config from '@/payload.config'
import Link from 'next/link'
import { Check, X } from 'lucide-react'
import fallbackContent from '@/globals/pages/homepage.json'
import { Lightbox } from '@/components/frontend/Lightbox'

function BoolCell({ value }: { value: boolean }) {
  return value ? (
    <Check className="mx-auto text-green-500" size={22} />
  ) : (
    <X className="mx-auto text-gray-400" size={22} />
  )
}

function PricingCell({ value }: { value: string }) {
  if (value === 'true') return <BoolCell value={true} />
  if (value === 'false') return <BoolCell value={false} />
  return <>{value}</>
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

function IntroSection({ intro }: any) {
  return (
    <section className="bg-black text-[#b8b5b2] text-center py-8 px-8">
      <p className="text-xl lg:text-2xl max-w-3xl mx-auto leading-relaxed">{intro.text}</p>
      <div className="mt-6">
        <Link
          href={intro.ctaUrl}
          className="inline-block border border-white text-white px-8 py-3 text-sm tracking-[4px] uppercase hover:bg-white hover:text-black transition-colors font-medium"
        >
          {intro.ctaLabel}
        </Link>
      </div>
    </section>
  )
}

function HeroSection({ hero }: any) {
  const heroImage = hero.heroImage?.url ?? hero.heroImage
  return (
    <section
      className="relative w-full"
      style={{
        paddingBottom: '47%',
        backgroundImage: `url('${heroImage}')`,
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
        <div className="ml-[5vw] w-[40vw] font-semibold leading-none" style={{ marginTop: '-7%' }}>
          <div className="text-[4.5vw] tracking-[0.71vw]">{hero.headline1}</div>
          <div className="text-[5.8vw] tracking-[0.71vw]">{hero.headline2}</div>
          <div className="text-[1.65vw] tracking-[0.71vw] opacity-75 mt-[1vw] leading-snug">
            {hero.subline}
          </div>
        </div>
      </div>
    </section>
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

  const data = {
    hero: { ...fallbackContent.hero, ...homepageData?.hero },
    intro: { ...fallbackContent.intro, ...homepageData?.intro },
    features: homepageData?.features?.length ? homepageData.features : fallbackContent.features,
    timeline: { ...fallbackContent.timeline, ...homepageData?.timeline },
    pricing: homepageData?.pricing?.length ? homepageData.pricing : fallbackContent.pricing,
    demo: { ...fallbackContent.demo, ...homepageData?.demo },
  }

  const { hero, intro, features, timeline, pricing, demo } = data

  const imageUrl = (image: any) => (typeof image === 'object' && image?.url ? image.url : image)

  return (
    <>
      <HeroSection hero={hero} />

      <IntroSection intro={intro} />

      {/* Feature 1 — full width with right-side overlay */}
      <section
        className="relative"
        style={{
          paddingBottom: '38%',
          backgroundImage: `url('${imageUrl(features[0].image)}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: 200,
        }}
      >
        <div className="absolute inset-y-0 right-0 w-1/2 bg-black/60 flex items-center justify-center">
          <div className="mx-[13%]">
            <h3 className="text-[2vw] tracking-[0.7vw] leading-tight mt-0 font-semibold">
              {features[0].heading}
            </h3>
            <p className="text-[1.2vw] tracking-[0.2vw] font-semibold mt-2">
              {features[0].description}
            </p>
          </div>
        </div>
      </section>

      {/* Features grid row 1 */}
      <div className="flex flex-col sm:flex-row">
        <FeatureBlock
          image={imageUrl(features[1].image)}
          heading={features[1].heading}
          description={features[1].description}
        />
        <FeatureBlock
          image={imageUrl(features[2].image)}
          heading={features[2].heading}
          description={features[2].description}
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
            {timeline.heading}
            <br />
            <span className="text-[1.5vw]">{timeline.subheading}</span>
          </h3>
          <Lightbox>
            <video
              autoPlay
              muted
              loop
              playsInline
              poster="/images/home/mxgrid-intro.png"
              className="w-full max-w-full mt-4 mx-auto block"
            >
              <source src={imageUrl(timeline.image)} type="video/mp4" />
            </video>
          </Lightbox>
          <p className="text-[1.2vw] tracking-[0.2vw] font-semibold mt-4">{timeline.description}</p>
        </div>
      </section>

      {/* Features grid row 2 */}
      <div className="flex flex-col sm:flex-row">
        <FeatureBlock
          image={imageUrl(features[3].image)}
          heading={features[3].heading}
          description={features[3].description}
        />
        <FeatureBlock
          image={imageUrl(features[4].image)}
          heading={features[4].heading}
          description={features[4].description}
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
              {pricing.map((row: any, i: number) => (
                <tr key={row.id ?? i}>
                  <th className="bg-[#fafafa] border border-white text-left px-6 py-2 text-lg font-medium">
                    {row.feature}
                  </th>
                  <td className="bg-white border border-white text-center px-6 py-2 text-lg">
                    <PricingCell value={row.essentials} />
                  </td>
                  <td className="bg-white border border-white text-center px-6 py-2 text-lg">
                    <PricingCell value={row.loops} />
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
          <h3 className="text-2xl font-semibold mb-3">{demo.demoHeading}</h3>
          <p className="mb-5">{demo.demoDescription}</p>
          <Link
            href={demo.demoUrl}
            className="inline-block bg-black text-white px-8 py-3 text-sm tracking-[4px] uppercase hover:bg-gray-800 transition-colors font-medium"
          >
            {demo.demoBtnLabel.toUpperCase()}
          </Link>
        </div>
      </section>
    </>
  )
}
