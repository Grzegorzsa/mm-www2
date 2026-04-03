import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Manual — MX GRID by MXbeats',
  description:
    'Full documentation for MX GRID: installation, main panel, box editor, page editor, arranger, and project settings.',
}

const IMG = (src: string) => `/images/manual/${src}`

/* ── Shared icon inline helper ── */
function Ico({ src, alt }: { src: string; alt: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={IMG(src)}
      alt={alt}
      className="inline-block h-8 align-middle rounded border border-gray-300 bg-[#d9d9da] p-[2px] mr-3"
    />
  )
}

function ToolbarWidget({ src, alt }: { src: string; alt: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={IMG(src)}
      alt={alt}
      className="inline-block h-12 align-middle rounded border border-gray-300 bg-[#d9d9da] p-[2px] mr-3 mb-2"
    />
  )
}

/* ── Shared section card ── */
function Section({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white text-[#444] rounded-xl shadow-md border border-black/6 leading-relaxed mb-4 p-4 md:p-6">
      {children}
    </div>
  )
}

export default function ManualPage() {
  return (
    <div className="bg-[#eaeaea] min-h-screen pb-8">
      <div className="max-w-[1400px] mx-auto flex gap-5 px-2 md:px-4">
        {/* ── Sidebar Table of Contents ── */}
        <aside className="hidden lg:block w-60 flex-shrink-0 sticky top-20 self-start max-h-[calc(100vh-84px)] overflow-y-auto rounded-xl shadow-md border border-black/8 bg-[#fafafa] text-[#444] p-4 mt-5">
          <h2 className="text-center tracking-[0.15em] text-2xl text-[#1a8a9e] border-b-2 border-gray-200 pb-2 mb-3">
            Manual
          </h2>
          <ul className="space-y-1 text-sm">
            <li className="font-bold">
              <a href="#intro" className="hover:text-[#1a8a9e] transition-colors">Introduction</a>
            </li>
            <li className="font-bold">
              <a href="#main-panel" className="hover:text-[#1a8a9e] transition-colors">Main Panel</a>
              <ul className="pl-3 mt-1 space-y-1 font-normal">
                <li><a href="#main-menu" className="hover:text-[#1a8a9e] transition-colors">Main Menu</a></li>
                <li><a href="#toolbar" className="hover:text-[#1a8a9e] transition-colors">Toolbar</a></li>
                <li><a href="#media-grid" className="hover:text-[#1a8a9e] transition-colors">Media Grid</a></li>
                <li><a href="#stop-group" className="hover:text-[#1a8a9e] transition-colors">Stop Group Buttons</a></li>
                <li><a href="#page-buttons" className="hover:text-[#1a8a9e] transition-colors">Page Buttons</a></li>
              </ul>
            </li>
            <li className="font-bold">
              <a href="#edit-box" className="hover:text-[#1a8a9e] transition-colors">Box Editor</a>
              <ul className="pl-3 mt-1 space-y-1 font-normal">
                <li><a href="#edit-samples" className="hover:text-[#1a8a9e] transition-colors">Edit Samples</a></li>
                <li><a href="#edit-loops" className="hover:text-[#1a8a9e] transition-colors">Edit Loops</a></li>
                <li><a href="#dsp-effects" className="hover:text-[#1a8a9e] transition-colors">DSP Effects</a></li>
              </ul>
            </li>
            <li className="font-bold">
              <a href="#edit-page" className="hover:text-[#1a8a9e] transition-colors">Page Editor</a>
            </li>
            <li className="font-bold">
              <a href="#edit-timeline" className="hover:text-[#1a8a9e] transition-colors">Timeline Editor</a>
            </li>
            <li className="font-bold">
              <a href="#settings" className="hover:text-[#1a8a9e] transition-colors">Project Settings</a>
            </li>
            <li className="font-bold">
              <a href="#product-registration" className="hover:text-[#1a8a9e] transition-colors">Registration</a>
            </li>
          </ul>
        </aside>

        {/* ── Main Content ── */}
        <div className="flex-1 min-w-0 mt-5 lg:ml-64">
          {/* Mobile ToC */}
          <div className="lg:hidden bg-[#fafafa] text-[#444] rounded-xl shadow-md border border-black/8 p-4 mb-4">
            <details>
              <summary className="font-bold text-[#1a8a9e] cursor-pointer">Table of Contents</summary>
              <ul className="mt-2 space-y-1 text-sm pl-2">
                <li><a href="#intro" className="hover:text-[#1a8a9e]">Introduction</a></li>
                <li><a href="#main-panel" className="hover:text-[#1a8a9e]">Main Panel</a></li>
                <li className="pl-3"><a href="#main-menu" className="hover:text-[#1a8a9e]">Main Menu</a></li>
                <li className="pl-3"><a href="#toolbar" className="hover:text-[#1a8a9e]">Toolbar</a></li>
                <li className="pl-3"><a href="#media-grid" className="hover:text-[#1a8a9e]">Media Grid</a></li>
                <li className="pl-3"><a href="#stop-group" className="hover:text-[#1a8a9e]">Stop Group Buttons</a></li>
                <li className="pl-3"><a href="#page-buttons" className="hover:text-[#1a8a9e]">Page Buttons</a></li>
                <li><a href="#edit-box" className="hover:text-[#1a8a9e]">Box Editor</a></li>
                <li className="pl-3"><a href="#edit-samples" className="hover:text-[#1a8a9e]">Edit Samples</a></li>
                <li className="pl-3"><a href="#edit-loops" className="hover:text-[#1a8a9e]">Edit Loops</a></li>
                <li className="pl-3"><a href="#dsp-effects" className="hover:text-[#1a8a9e]">DSP Effects</a></li>
                <li><a href="#edit-page" className="hover:text-[#1a8a9e]">Page Editor</a></li>
                <li><a href="#edit-timeline" className="hover:text-[#1a8a9e]">Timeline Editor</a></li>
                <li><a href="#settings" className="hover:text-[#1a8a9e]">Project Settings</a></li>
                <li><a href="#product-registration" className="hover:text-[#1a8a9e]">Registration</a></li>
              </ul>
            </details>
          </div>

          {/* ── Introduction ── */}
          <Section>
            <h3 id="intro" className="text-[#1a8a9e] text-2xl font-bold border-b-2 border-gray-200 pb-2 mb-4">
              Introduction
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <video
                  autoPlay muted loop playsInline
                  poster={IMG('intro.png')}
                  className="w-full rounded-lg border border-gray-200 cursor-pointer"
                >
                  <source src={IMG('intro.mp4')} type="video/mp4" />
                </video>
              </div>
              <div>
                <p className="mb-3">
                  <strong>MX GRID</strong> by MXbeats is a versatile music production tool designed
                  for both live performers and studio musicians. Available as a standalone application
                  and DAW plugin (VST/AU), it provides 32 outputs for flexible routing and 512 slots
                  for loops, one-shots, and audio clips.
                </p>
                <p className="mb-3">
                  MX GRID supports two playback modes: <strong>Session</strong> for real-time
                  triggering of clips using a mouse or MIDI controller (e.g., Launchpad), and{' '}
                  <strong>Arranger</strong> for composing complete songs on a timeline. Seamless
                  integration with grid controllers and effortless media management provide a
                  distinctive experience for music creators.
                </p>
                <p>
                  Simply drag audio files (WAV, AIFF, MP3, OGG) or entire folders onto the grid —
                  the application automatically detects whether each file is a sample or loop and
                  assigns parameters like tempo, color, icon, and instrument group.
                </p>
              </div>
            </div>
          </Section>

          {/* ── Main Panel ── */}
          <Section>
            <h3 id="main-panel" className="text-[#1a8a9e] text-2xl font-bold border-b-2 border-gray-200 pb-2 mb-4">
              Main Panel
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={IMG('main-panel.png')} alt="MX GRID main panel" className="w-full rounded-lg border border-gray-200 cursor-pointer" />
              </div>
              <div>
                <ol className="list-decimal pl-5 space-y-1 font-semibold">
                  <li><a href="#main-menu" className="text-[#1a8a9e] hover:underline">Main Menu</a></li>
                  <li><a href="#toolbar" className="text-[#1a8a9e] hover:underline">Toolbar</a></li>
                  <li><a href="#stop-group" className="text-[#1a8a9e] hover:underline">Stop Group Buttons</a></li>
                  <li><a href="#media-grid" className="text-[#1a8a9e] hover:underline">Media Grid</a></li>
                  <li><a href="#page-buttons" className="text-[#1a8a9e] hover:underline">Page Buttons</a></li>
                </ol>
              </div>
            </div>
          </Section>

          {/* ── Main Menu ── */}
          <Section>
            <h3 id="main-menu" className="text-[#1a8a9e] text-2xl font-bold border-b-2 border-gray-200 pb-2 mb-4">
              Main Menu
            </h3>

            <h4 className="text-[#1a8a9e] font-bold mt-4 mb-2">File</h4>
            <ul className="space-y-1">
              <li><strong>New Project</strong> — reset to default state.</li>
              <li><strong>Reload Project</strong> — revert to the last saved state.</li>
              <li><strong>Open Project</strong> — load a project file.</li>
              <li><strong>Save / Save As</strong> — save the current project.</li>
              <li><strong>Render Audio</strong> — generate a stereo audio file from the Timeline arrangement. <strong>(Pro)</strong></li>
              <li><strong>Exit</strong> — close the application.</li>
            </ul>

            <h4 className="text-[#1a8a9e] font-bold mt-5 mb-2">Edit</h4>
            <ul className="space-y-1">
              <li><strong>Audio Settings</strong> — configure audio device type (ASIO, Windows Audio, etc.), sound card, output channels, sample rate, and MIDI input/output devices.</li>
              <li><strong>Project Settings</strong> — <a href="#settings" className="text-[#1a8a9e] hover:underline">project-specific settings dialog</a>.</li>
              <li><strong>Turn off All Sounds</strong> — immediately silences all playing clips.</li>
              <li><strong>Refresh MIDI Grid Device</strong> — refreshes the state and colors on the connected MIDI controller.</li>
            </ul>

            <h4 className="text-[#1a8a9e] font-bold mt-5 mb-2">View</h4>
            <ul className="space-y-1">
              <li><strong>Box Editor</strong> — <a href="#edit-box" className="text-[#1a8a9e] hover:underline">open the editor panel</a>.</li>
              <li><strong>Page Editor</strong> — <a href="#edit-page" className="text-[#1a8a9e] hover:underline">rearrange boxes and batch operations</a>.</li>
              <li><strong>Timeline Editor</strong> — <a href="#edit-timeline" className="text-[#1a8a9e] hover:underline">open the Arranger to compose songs</a>.</li>
              <li><strong>Zoom In / Zoom Out</strong> — adjust the application size for different screen resolutions.</li>
              <li><strong>Light Mode / Dark Mode</strong> — switch the color theme.</li>
            </ul>

            <h4 className="text-[#1a8a9e] font-bold mt-5 mb-2">Help</h4>
            <ul className="space-y-1">
              <li><strong>Online Help</strong> — open the online manual on the product website.</li>
              <li><strong>User Panel</strong> — open the user panel on the website.</li>
              <li><strong>Register Product</strong> — <a href="#product-registration" className="text-[#1a8a9e] hover:underline">registration and license management</a>.</li>
              <li><strong>About</strong> — display the installed version and current license information.</li>
            </ul>
          </Section>

          {/* ── Toolbar ── */}
          <Section>
            <h3 id="toolbar" className="text-[#1a8a9e] text-2xl font-bold border-b-2 border-gray-200 pb-2 mb-4">
              Toolbar
            </h3>
            <p className="mb-2"><Ico src="open-project-icon.png" alt="open project" /><strong>Open Project</strong> — Open a project file</p>
            <p className="mb-2"><Ico src="save-project-icon.png" alt="save project" /><strong>Save Project</strong> — Save the current project file</p>
            <p className="mb-2">
              <a href="#edit-box"><Ico src="edit-box-icon.png" alt="edit box" /></a>
              <strong>Box Editor</strong> — Edit individual clip parameters
            </p>
            <p className="mb-2">
              <a href="#edit-page"><Ico src="edit-page-icon.png" alt="edit page" /></a>
              <strong>Page Editor</strong> — Rearrange clips and batch operations
            </p>
            <p className="mb-2">
              <a href="#edit-timeline"><Ico src="edit-timeline-icon.png" alt="show arranger" /></a>
              <strong>Show Arranger</strong> — Switch to arrangement mode
            </p>
            <p className="mb-2"><Ico src="mute-all-sounds-icon.png" alt="mute all sounds" /><strong>All Sounds Off</strong> — Panic button — mute all playing clips</p>
            <p className="mb-4"><Ico src="refresh-device-icon.png" alt="refresh device" /><strong>Refresh MIDI Device</strong> — Update the state of your MIDI grid controller</p>

            <h4 className="text-[#1a8a9e] font-bold mt-4 mb-2">Transport Control</h4>
            <ToolbarWidget src="transport-control-main.png" alt="transport control" />
            <p className="mb-3">
              Starts or stops playback in Session or Arranger mode. During playback, an arc-shaped
              progress bar around the Stop button shows the current position within the bar. A label
              next to the button displays the current mode: <strong>&ldquo;Session&rdquo;</strong> or{' '}
              <strong>&ldquo;Arrangement&rdquo;</strong>.
            </p>

            <h4 className="text-[#1a8a9e] font-bold mt-4 mb-2">Tempo Widget</h4>
            <ToolbarWidget src="tempo-widget.png" alt="tempo widget" />
            <p className="mb-2">
              Sets the current project tempo (BPM). Tap the metronome icon repeatedly to set tempo,
              or click the tempo value to type it manually. Use the <strong>+/−</strong> buttons to
              adjust by 1 BPM.
            </p>
            <p>
              If any loop has a different tempo than the project, an <strong>Apply</strong> button
              appears — click it to convert all mismatched loops to the project tempo.
            </p>
          </Section>

          {/* ── Media Grid ── */}
          <Section>
            <h3 id="media-grid" className="text-[#1a8a9e] text-2xl font-bold border-b-2 border-gray-200 pb-2 mb-4">
              Media Grid
            </h3>
            <p className="mb-3">
              The <strong>Media Grid</strong> is the central area of the application — a virtual
              controller consisting of 64 square buttons (8×8) spread across 8 pages, providing a
              total of <strong>512 slots</strong> for loops or samples.
            </p>

            <h4 className="text-[#1a8a9e] font-bold mt-4 mb-2">Samples</h4>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={IMG('sample-boxes.png')} alt="sample boxes" style={{ width: 200 }} className="rounded-lg border border-gray-200 cursor-pointer mb-2" />
            <p className="mb-3">
              <strong>Samples</strong> (one-shots) can be triggered at any point. They support
              variable velocity and can be routed to 32 outputs for VST effects processing. A gray
              progress bar at the top of the box shows playback progress.
            </p>

            <h4 className="text-[#1a8a9e] font-bold mt-4 mb-2">Loops</h4>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={IMG('loop-boxes.png')} alt="loop boxes" style={{ width: 200 }} className="rounded-lg border border-gray-200 cursor-pointer mb-2" />
            <p className="mb-3">
              <strong>Loops</strong> are synchronized with the song. When triggered, a loop waits
              for the next bar boundary before starting playback.
            </p>
            <ul className="space-y-1 mb-3">
              <li>A <strong>flashing box</strong> indicates the loop is waiting for the next bar.</li>
              <li>A <strong>pulsing box</strong> with a progress arc means the loop is playing.</li>
              <li>Each loop belongs to one of <strong>8 instrument groups</strong>. Only one loop per group can play at a time.</li>
              <li>The <strong>play mode icon</strong> (top-left) shows whether the loop repeats or plays once.</li>
            </ul>

            <h4 className="text-[#1a8a9e] font-bold mt-4 mb-2">Stopping Individual Clips</h4>
            <p className="mb-3">
              During playback of any clip (loop or sample), hovering over the box reveals a{' '}
              <strong>Stop button</strong> in the top-left corner. Clicking it immediately stops
              playback of that individual clip — no need to use the Stop Group buttons or the All
              Sounds Off (panic) button.
            </p>

            <h4 className="text-[#1a8a9e] font-bold mt-4 mb-2">Loading Clips</h4>
            <p>
              <strong>Drag and drop</strong> audio files (WAV, AIF, AIFF, MP3, OGG) or entire
              folders from your file explorer onto the grid. The application automatically detects
              clip type and assigns tempo, color, icon, instrument group, and name. You can also load
              clips via the <a href="#edit-box" className="text-[#1a8a9e] hover:underline"><strong>Box Editor</strong></a>.
            </p>
          </Section>

          {/* ── Stop Group Buttons ── */}
          <Section>
            <h3 id="stop-group" className="text-[#1a8a9e] text-2xl font-bold border-b-2 border-gray-200 pb-2 mb-4">
              Stop Group Buttons
            </h3>
            <p className="mb-3">
              The top row above the grid contains <strong>8 Stop Group</strong> buttons — one for
              each instrument group. MX GRID organizes sounds into instrument groups (e.g.,
              percussion, bass-line).
            </p>
            <ul className="space-y-1">
              <li>Only one loop from a given group can play at a time.</li>
              <li>When a group is playing, its Stop button lights up <strong>red</strong>.</li>
              <li>Clicking a Stop button makes it flash (waiting for the bar end), then stops the group.</li>
            </ul>
          </Section>

          {/* ── Page Buttons ── */}
          <Section>
            <h3 id="page-buttons" className="text-[#1a8a9e] text-2xl font-bold border-b-2 border-gray-200 pb-2 mb-4">
              Page Buttons
            </h3>
            <p>
              The column of <strong>8 page buttons</strong> on the right side of the grid lets you
              switch between pages. Each page provides 64 slots, giving a total of{' '}
              <strong>512 slots</strong> across all 8 pages. The active page button is{' '}
              <strong>light blue</strong>; inactive pages are gray.
            </p>
          </Section>

          {/* ── Box Editor ── */}
          <Section>
            <h3 id="edit-box" className="text-[#1a8a9e] text-2xl font-bold border-b-2 border-gray-200 pb-2 mb-4">
              Box Editor
            </h3>
            <p className="mb-3">
              <Ico src="edit-box-icon.png" alt="edit box" />
              The <strong>Box Editor</strong> opens a right-side panel for editing individual clip
              parameters. Activate it from the{' '}
              <a href="#toolbar" className="text-[#1a8a9e] hover:underline"><strong>toolbar</strong></a>{' '}
              or the menu (View → Box Editor), then click any box on the grid to edit it. Clicking
              an empty slot lets you create a new sample or loop.
            </p>
            <video
              autoPlay muted loop playsInline
              poster={IMG('box-edit.png')}
              className="w-full rounded-lg border border-gray-200 cursor-pointer mb-4"
            >
              <source src={IMG('box-edit.mp4')} type="video/mp4" />
            </video>

            <h4 id="edit-samples" className="text-[#1a8a9e] font-bold mt-4 mb-3">Edit Samples</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={IMG('edit-sample-panel.png')} alt="edit sample panel" className="w-full rounded-lg border border-gray-200 cursor-pointer" />
              </div>
              <div>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Toolbar:
                    <ul className="list-none pl-3 mt-1 space-y-1 font-normal">
                      <li><strong>Load file(s)</strong> — load one or more audio files. Additional files fill consecutive empty slots.</li>
                      <li><strong>Load folder</strong> — load all audio files from a folder.</li>
                      <li><strong>Convert to Loop</strong> — converts the sample into a loop.</li>
                      <li><strong>Open in external app</strong> — edit the file in your system&apos;s default audio editor (e.g., Audacity). <strong>(Pro)</strong></li>
                      <li><strong>Clear Box</strong> — remove the clip and reset the slot.</li>
                    </ul>
                  </li>
                  <li>Playback: Play/Stop button and the file path of the loaded audio file.</li>
                  <li>Waveform: Visual waveform thumbnail. Click anywhere to start playback from that position. Shows current time and total duration.</li>
                  <li>Name: Text field for the clip name (max <strong>12 characters</strong>). The name appears on the grid box.</li>
                  <li>Icon: Choose from <strong>200+ music-related icons</strong>. Select the empty icon to display the name in the center instead.</li>
                  <li>Volume &amp; Pan: <strong>Vol</strong>: 0%–200%. <strong>Pan</strong>: −100% (left) to +100% (right).</li>
                  <li>Color: Choose one of 16 colors. Colors are mirrored on your MIDI controller.</li>
                  <li>Outputs: Route audio to specific stereo pairs (up to <strong>32 channels</strong>). Available in DAW plugin mode for adding external effects.</li>
                  <li>Choke Samples: Comma-separated <strong>Box IDs</strong> that will be silenced when this sample triggers (e.g., closed hi-hat stopping an open hi-hat).</li>
                  <li>Enable Velocity: When enabled, volume varies based on MIDI strike force. Requires a velocity-sensitive controller.</li>
                  <li>Stop on Note Off: When enabled, the sample stops immediately on mouse/pad release. When disabled (default), the sample plays to completion.</li>
                </ol>
              </div>
            </div>

            <h4 id="edit-loops" className="text-[#1a8a9e] font-bold mt-6 mb-3">Edit Loops</h4>
            <p className="mb-3">The Loop Editor shares most features with the Sample Editor. Only the differences are covered below.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={IMG('edit-loop-panel.png')} alt="edit loop panel" className="w-full rounded-lg border border-gray-200 cursor-pointer" />
              </div>
              <div>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Group Number: Assign the loop to one of <strong>8 instrument groups</strong>. When another loop from the same group starts, the previous one stops automatically.</li>
                  <li>Duration: The loop length in <strong>musical bars</strong>.</li>
                  <li>Original Tempo: The original BPM of the audio clip. Click the <strong>Auto</strong> button (metronome icon) to detect it automatically. Multiple clicks may yield different results as various detection algorithms are used.</li>
                  <li>Loop Checkbox: <strong>Enabled</strong>: the loop repeats after finishing. <strong>Disabled</strong>: playback stops after one cycle.</li>
                </ol>
                <p className="mt-3">
                  <strong>Note:</strong> &ldquo;Convert to Loop&rdquo; is replaced by <strong>Convert to Sample</strong> in the toolbar. When previewing a loop during song playback, it synchronizes with the song rather than playing from the beginning.
                </p>
              </div>
            </div>

            <h4 id="dsp-effects" className="text-[#1a8a9e] font-bold mt-6 mb-3">DSP Effects <span className="text-sm font-normal">(Pro)</span></h4>
            <p className="mb-3">
              Both sample and loop editors include a <strong>DSP Effects</strong> section at the
              bottom with five knobs:
            </p>
            <ol className="list-decimal pl-5 space-y-1 mb-3">
              <li><strong>Lo Pass</strong> — low-pass filter</li>
              <li><strong>Hi Pass</strong> — high-pass filter</li>
              <li><strong>Tempo</strong> — playback speed (50%–200%), without changing pitch</li>
              <li><strong>Pitch</strong> — pitch shift (−12 to +12 semitones), without changing duration</li>
              <li><strong>Fine Tune</strong> — fine pitch adjustment (works with the Pitch knob)</li>
            </ol>
            <p className="mb-2">
              Each of the first four knobs has an enable/disable toggle. Fine Tune activates
              automatically with Pitch. A small frequency spectrum display shows the filtered result.
              Combining Lo Pass and Hi Pass creates band-pass or band-reject filtering.
            </p>
            <p>
              Click <strong>Apply</strong> to cache the processed audio for better performance, or{' '}
              <strong>Cancel</strong> to discard changes.
            </p>
          </Section>

          {/* ── Page Editor ── */}
          <Section>
            <h3 id="edit-page" className="text-[#1a8a9e] text-2xl font-bold border-b-2 border-gray-200 pb-2 mb-4">
              Page Editor
            </h3>
            <p className="mb-3">
              The <strong>Page Editor</strong> lets you organize your grid and perform batch
              operations on multiple boxes.
            </p>
            <p className="mb-3">
              Use <strong>left-click</strong> to select and drag individual boxes. Use{' '}
              <strong>right-click</strong> to select multiple boxes, then drag them together.
            </p>
            <video
              autoPlay muted loop playsInline
              poster={IMG('page-edit.png')}
              className="w-full rounded-lg border border-gray-200 cursor-pointer mb-4"
            >
              <source src={IMG('page-edit.mp4')} type="video/mp4" />
            </video>

            <h4 className="text-[#1a8a9e] font-bold mt-4 mb-2">Edit</h4>
            <p className="mb-2">
              <strong>Edit</strong> — modify parameters of selected boxes: icon, color, output,
              volume, pan, group number, duration, original tempo, loop mode, choke samples, enable
              velocity, stop on note off. Available options depend on the clip type.
            </p>
            <p className="mb-3"><strong>Copy / Paste / Cut / Delete</strong> — standard clipboard operations.</p>
            <h4 className="text-[#1a8a9e] font-bold mt-4 mb-2">Convert</h4>
            <p className="mb-2"><strong>Sample</strong> — convert selected loops to samples.</p>
            <p className="mb-2"><strong>Loop</strong> — convert selected samples to loops.</p>
            <p className="mb-3"><strong>Tempo</strong> — convert selected loops to the project tempo. <strong>(Pro)</strong></p>
            <h4 className="text-[#1a8a9e] font-bold mt-4 mb-2">Actions</h4>
            <p><strong>Deselect</strong> — deselect all boxes.</p>
            <p><strong>Undo / Redo</strong></p>
          </Section>

          {/* ── Timeline Editor ── */}
          <Section>
            <h3 id="edit-timeline" className="text-[#1a8a9e] text-2xl font-bold border-b-2 border-gray-200 pb-2 mb-4">
              Arranger (Timeline Editor)
            </h3>
            <p className="mb-3">
              <Ico src="edit-timeline-icon.png" alt="show arranger" />
              The Arranger lets you compose a song by dragging and dropping clips onto a timeline grid.
            </p>
            <video
              autoPlay muted loop playsInline
              poster={IMG('timeline-edit.png')}
              className="w-full rounded-lg border border-gray-200 cursor-pointer mb-4"
            >
              <source src={IMG('timeline-edit.mp4')} type="video/mp4" />
            </video>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={IMG('timeline-panel.png')} alt="Timeline panel" className="w-full rounded-lg border border-gray-200 cursor-pointer" />
              </div>
              <div>
                <ol className="list-decimal pl-5 space-y-1 font-semibold">
                  <li><a href="#timeline-play-controllers" className="text-[#1a8a9e] hover:underline font-normal">Transport Controls</a></li>
                  <li><a href="#edit-timeline-buttons" className="text-[#1a8a9e] hover:underline font-normal">Edit Buttons</a></li>
                  <li><a href="#timeline-duration" className="text-[#1a8a9e] hover:underline font-normal">Song Length</a></li>
                  <li><a href="#timeline-solo-mute" className="text-[#1a8a9e] hover:underline font-normal">Solo / Mute</a></li>
                  <li><a href="#timeline-bar-no" className="text-[#1a8a9e] hover:underline font-normal">TIME Column</a></li>
                  <li><a href="#loop-tracks" className="text-[#1a8a9e] hover:underline font-normal">Loop Tracks</a></li>
                  <li><a href="#sample-tracks" className="text-[#1a8a9e] hover:underline font-normal">Sample Tracks</a></li>
                  <li><a href="#timeline-grid" className="text-[#1a8a9e] hover:underline font-normal">Timeline Grid</a></li>
                </ol>
              </div>
            </div>

            <h4 id="timeline-play-controllers" className="text-[#1a8a9e] font-bold mt-4 mb-2">1) Transport Controls</h4>
            <ToolbarWidget src="transport-controls.png" alt="transport controls" />
            <p className="mb-2">
              <strong>Play / Pause / Stop</strong> — <strong>Play</strong> starts the arrangement;
              during playback the button changes to <strong>Pause</strong>. A separate{' '}
              <strong>Stop</strong> button stops playback and resets the playhead.
            </p>
            <p className="mb-2">
              Next to the transport buttons, a <strong>position display</strong> shows the current
              playback position in musical bars.
            </p>
            <p className="mb-3">
              The <strong>Toggle Looping</strong> button enables continuous playback — when active,
              the song automatically restarts from the beginning after reaching the end.
            </p>

            <h4 id="edit-timeline-buttons" className="text-[#1a8a9e] font-bold mt-4 mb-2">2) Edit Buttons</h4>
            <p className="mb-2">
              <Ico src="drag-buttons-icon.png" alt="drag button" />
              <strong>Drag and Drop</strong> — enabled by default. Drag clips from the Media Grid
              onto the timeline. Dragging a clip back to the grid removes it from the timeline. The
              target track is highlighted while dragging.
            </p>
            <p className="mb-3">Additional buttons: <strong>Copy</strong>, <strong>Paste</strong>, <strong>Cut</strong>, <strong>Delete</strong>, <strong>Undo</strong>, and <strong>Redo</strong>.</p>

            <h4 id="timeline-duration" className="text-[#1a8a9e] font-bold mt-4 mb-2">3) Song Length</h4>
            <p className="mb-3">
              Sets the total song length in musical bars (minimum 16). Use the text field or +/−
              buttons. If reducing the length would cut existing content, an <strong>Apply</strong>{' '}
              button appears with a confirmation dialog.
            </p>

            <h4 id="timeline-solo-mute" className="text-[#1a8a9e] font-bold mt-4 mb-2">4) Solo / Mute</h4>
            <p className="mb-3">
              Each track has <strong>S</strong> (solo) and <strong>M</strong> (mute) buttons below
              the track number for selective listening.
            </p>

            <h4 id="timeline-bar-no" className="text-[#1a8a9e] font-bold mt-4 mb-2">5) TIME Column</h4>
            <ul className="space-y-1 mb-3">
              <li><strong>Click center</strong> — place the playhead at that bar.</li>
              <li><strong>Click left edge (top)</strong> — set a temporary song start point.</li>
              <li><strong>Click left edge (bottom)</strong> — set a temporary song end point.</li>
              <li>Inactive parts of the song are grayed out.</li>
            </ul>

            <h4 id="loop-tracks" className="text-[#1a8a9e] font-bold mt-4 mb-2">6) Loop Tracks</h4>
            <ul className="space-y-1 mb-3">
              <li><strong>8 tracks</strong> reserved for loops (one per instrument group).</li>
              <li>In <a href="#settings" className="text-[#1a8a9e] hover:underline">Strict Mode</a>, loops can only be placed on the track matching their group number.</li>
              <li>Adjust loop start and length by dragging the top or bottom edge of the loop cell.</li>
            </ul>

            <h4 id="sample-tracks" className="text-[#1a8a9e] font-bold mt-4 mb-2">7) Sample Tracks</h4>
            <ul className="space-y-1 mb-3">
              <li><strong>4 tracks</strong> reserved for samples.</li>
              <li>Samples can be freely moved within the sample tracks.</li>
              <li><strong>Right-click</strong> a sample for additional options:</li>
            </ul>
            <p className="mb-3">
              <ToolbarWidget src="timeline-sample-edit.png" alt="sample edit" />
              <strong>Velocity</strong> — set the sample&apos;s playback volume.{' '}
              <strong>Time Shift</strong> — set the exact trigger time within the bar.
            </p>

            <h4 id="timeline-grid" className="text-[#1a8a9e] font-bold mt-4 mb-2">8) Timeline Grid</h4>
            <ul className="space-y-1">
              <li>Consists of <strong>13 columns</strong>: 1 TIME column + 8 loop tracks + 4 sample tracks.</li>
              <li>Each cell represents one bar.</li>
              <li>Drag clips from the grid onto the timeline to build your arrangement.</li>
            </ul>
          </Section>

          {/* ── Project Settings ── */}
          <Section>
            <h3 id="settings" className="text-[#1a8a9e] text-2xl font-bold border-b-2 border-gray-200 pb-2 mb-4">
              Project Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={IMG('settings-window.png')} alt="Project Settings" className="w-full rounded-lg border border-gray-200 cursor-pointer" />
              </div>
              <div>
                <ul className="space-y-2">
                  <li><strong>Controller</strong> — select a MIDI controller (None, Launchpad X).</li>
                  <li><strong>Zoom</strong> — adjust the application zoom level for different screen sizes.</li>
                  <li><strong>Theme</strong> — switch between Light and Dark mode.</li>
                  <li><strong>Master Volume</strong> — overall volume control to prevent clipping and distortion.</li>
                  <li><strong>Latency Compensation</strong> — used in <strong>VST mode</strong> to compensate for sound card latency and ensure accurate timing.</li>
                  <li><strong>Use Relative Paths</strong> — stores file paths relative to the project location. Makes it easy to <strong>move or share</strong> projects between computers.</li>
                  <li><strong>Strict Mode</strong> — enforces that loops are placed on the <a href="#loop-tracks" className="text-[#1a8a9e] hover:underline">timeline track</a> matching their instrument group number.</li>
                  <li><strong>Clear Cache</strong> — clears cached DSP-processed audio files. The current cache size is shown next to the button.</li>
                </ul>
              </div>
            </div>
          </Section>

          {/* ── Product Registration ── */}
          <Section>
            <h3 id="product-registration" className="text-[#1a8a9e] text-2xl font-bold border-b-2 border-gray-200 pb-2 mb-4">
              Product Registration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={IMG('register-product.png')} alt="Registration and License Management" className="w-full rounded-lg border border-gray-200 cursor-pointer" />
              </div>
              <div>
                <ul className="space-y-3">
                  <li>
                    <h4 className="text-[#1a8a9e] font-semibold mb-1">Register the Product</h4>
                    <ul className="space-y-1 pl-3">
                      <li>Go to <strong>Help → Register Product</strong> and enter the email and password used when registering on the product website.</li>
                      <li>The software connects to the server and retrieves your license.</li>
                      <li>You can register on <strong>up to 2 computers</strong> simultaneously.</li>
                    </ul>
                  </li>
                  <li>
                    <h4 className="text-[#1a8a9e] font-semibold mb-1">Refresh License</h4>
                    <ul className="space-y-1 pl-3">
                      <li>After upgrading your license tier (e.g., from Essentials to Loops Pro), click <strong>Refresh License</strong> to update.</li>
                      <li>The software periodically checks the license status automatically.</li>
                    </ul>
                  </li>
                  <li>
                    <h4 className="text-[#1a8a9e] font-semibold mb-1">Deactivate License</h4>
                    <ul className="space-y-1 pl-3">
                      <li>Click <strong>Deactivate License</strong> to unregister this machine and free up an activation slot.</li>
                      <li>Use this when transferring the license to another computer.</li>
                    </ul>
                  </li>
                </ul>
              </div>
            </div>
          </Section>
        </div>
      </div>
    </div>
  )
}
