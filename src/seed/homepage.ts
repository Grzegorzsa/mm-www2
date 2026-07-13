import { getPayload } from 'payload'
import type { Payload } from 'payload'
import config from '../payload.config'
import path from 'path'

const mediaDir = path.resolve(process.cwd(), 'media')

const mediaFiles = [
  { filename: 'mx_beats_side01.jpg', alt: 'MX Beats Slide' },
  { filename: 'home-features-1.jpg', alt: 'MX Beats Feature 1' },
  { filename: 'home-features-2.jpg', alt: 'MX Beats Feature 2' },
  { filename: 'home-features-3.jpg', alt: 'MX Beats Feature 3' },
  { filename: 'home-features-4.jpg', alt: 'MX Beats Feature 4' },
  { filename: 'home-features-5.jpg', alt: 'MX Beats Feature 5' },
  { filename: 'mxgrid_intro-1.mp4', alt: 'MX Grid intro' },
]

async function ensureMedia(payload: Payload, filename: string, alt: string): Promise<number> {
  const existing = await payload.find({
    collection: 'media',
    where: { filename: { equals: filename } },
    limit: 1,
  })

  if (existing.docs.length > 0) {
    console.log(`  Media "${filename}" already exists (id=${existing.docs[0].id}) — skipping.`)
    return existing.docs[0].id as number
  }

  const doc = await payload.create({
    collection: 'media',
    data: { alt },
    filePath: path.join(mediaDir, filename),
  })
  console.log(`  Created media: ${filename} → id=${doc.id}`)
  return doc.id as number
}

async function seed() {
  const payload = await getPayload({ config: await config })

  // Ensure all media records exist
  const ids: Record<string, number> = {}
  for (const file of mediaFiles) {
    ids[file.filename] = await ensureMedia(payload, file.filename, file.alt)
  }

  // Update homepage global (upsert)
  await payload.updateGlobal({
    slug: 'homepage',
    data: {
      hero: {
        heroImage: ids['mx_beats_side01.jpg'],
        headline1: 'Unlock your',
        headline2: 'creativity',
        subline: 'with our unique music production tool',
      },
      intro: {
        text: 'Build, arrange, and perform with MXGRID\u2014a powerful music creation suite built for seamless beat-making and fluid loop sequencing. From raw samples to finished tracks, shape your sound with total precision.',
        ctaLabel: 'GET IT NOW',
        ctaUrl: '#pricing',
      },
      features: [
        {
          heading: 'Live Performance at Your Fingertips',
          description:
            'Play live using your mouse or MIDI controller. Express yourself in real-time performance.',
          image: ids['home-features-1.jpg'],
        },
        {
          heading: 'Ample Space for Creativity',
          description:
            'With over 500 slots, organize your samples, loops and beats without limitations. Let your imagination run wild.',
          image: ids['home-features-2.jpg'],
        },
        {
          heading: 'Automated Sample Import',
          description:
            'Streamline your workflow by automating the import process for media files. The software assigns tempo, color, icon, and instrument group to each sample.',
          image: ids['home-features-3.jpg'],
        },
        {
          heading: 'Plugin with 32 Outputs',
          description:
            'Explore a world of effects and creative possibilities. With 32 outputs, you can route audio to various channels, apply effects, and achieve professional-grade soundscapes.',
          image: ids['home-features-4.jpg'],
        },
        {
          heading: 'Launchpad X and MIDI Device Support',
          description:
            'MXbeats is Launchpad X-ready, providing native support for this popular MIDI controller and other compatible devices.',
          image: ids['home-features-5.jpg'],
        },
      ],
      timeline: {
        heading: 'Timeline Editor',
        subheading: 'for Complete Song Creation',
        description:
          'Compose entire songs with built-in timeline editor. Arrange loops, beats and samples creating cohesive musical pieces.',
        image: ids['mxgrid_intro-1.mp4'],
      },
      pricing: [
        { feature: 'Price', essentials: 'Free', loops: '$49', beats: '$89', composer: '$139' },
        {
          feature: 'Timeline Editor',
          essentials: 'true',
          loops: 'true',
          beats: 'true',
          composer: 'true',
        },
        {
          feature: 'MIDI Controller Support',
          essentials: 'true',
          loops: 'true',
          beats: 'true',
          composer: 'true',
        },
        {
          feature: 'Play Loops and Samples',
          essentials: 'true',
          loops: 'true',
          beats: 'true',
          composer: 'true',
        },
        {
          feature: 'Slots for Loops and Samples',
          essentials: '512',
          loops: '512',
          beats: '512',
          composer: '512',
        },
        {
          feature: 'Max Number of Outputs',
          essentials: '2',
          loops: '32',
          beats: '32',
          composer: '32',
        },
        {
          feature: 'Standalone App',
          essentials: 'true',
          loops: 'true',
          beats: 'true',
          composer: 'true',
        },
        {
          feature: 'DAW Plugin',
          essentials: 'false',
          loops: 'true',
          beats: 'true',
          composer: 'true',
        },
        {
          feature: 'Render Audio',
          essentials: 'false',
          loops: 'true',
          beats: 'true',
          composer: 'true',
        },
        {
          feature: 'DSP',
          essentials: 'false',
          loops: 'true',
          beats: 'true',
          composer: 'true',
        },
        {
          feature: 'Play Beats',
          essentials: 'false',
          loops: 'true',
          beats: 'true',
          composer: 'true',
        },
        {
          feature: 'Edit Beats',
          essentials: 'false',
          loops: 'false',
          beats: 'true',
          composer: 'true',
        },
        {
          feature: 'Convert MIDI to Beats',
          essentials: 'false',
          loops: 'false',
          beats: 'true',
          composer: 'true',
        },
        {
          feature: 'Factory Beat Presets',
          essentials: 'false',
          loops: 'false',
          beats: 'true',
          composer: 'true',
        },
        {
          feature: 'External MIDI & Plugin Routing',
          essentials: 'false',
          loops: 'false',
          beats: 'true',
          composer: 'true',
        },
      ],
      demo: {
        demoHeading: 'Unlock the Full Potential: Try Our Free Demo!',
        demoDescription:
          "No Strings Attached: Try our demo for free, as long as you like, with no obligations. You won't be asked for credit card details or any commitment.",
        demoUrl: '/downloads',
        demoBtnLabel: 'Download Demo',
      },
      meta: {
        title: 'MXbeats \u2014 Music Production and Arrangement Software',
        description:
          'MXbeats is an evolving music production platform for performance, arrangement, and sound design.',
        image: ids['mx_beats_side01.jpg'],
      },
    },
  })

  console.log('Homepage seeded.')
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
