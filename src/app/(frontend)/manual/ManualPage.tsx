import type { Metadata } from 'next'
import './manual.css'

export const metadata: Metadata = {
  title: 'Manual — MX GRID by MXbeats',
  description:
    'Full documentation for MX GRID: installation, main panel, box editor, page editor, arranger, and project settings.',
}

export default function ManualPage() {
  return (
    <div className="manual">
      <div className="container">
        {/* ── Sidebar Table of Contents ── */}
        <aside>
          <h2>Manual</h2>
          <ul>
            <li>
              <a href="#intro">Introduction</a>
            </li>
            <li>
              <a href="#main-panel">Main Panel</a>
              <ul>
                <li>
                  <a href="#main-menu">Main Menu</a>
                </li>
                <li>
                  <a href="#toolbar">Toolbar</a>
                </li>
                <li>
                  <a href="#media-grid">Media Grid</a>
                </li>
                <li>
                  <a href="#stop-group">Stop Group Buttons</a>
                </li>
                <li>
                  <a href="#page-buttons">Page Buttons</a>
                </li>
              </ul>
            </li>
            <li>
              <a href="#edit-box">Box Editor</a>
              <ul>
                <li>
                  <a href="#edit-samples">Edit Samples</a>
                </li>
                <li>
                  <a href="#edit-loops">Edit Loops</a>
                </li>
                <li>
                  <a href="#dsp-effects">DSP Effects</a>
                </li>
              </ul>
            </li>
            <li>
              <a href="#edit-page">Page Editor</a>
            </li>
            <li>
              <a href="#edit-timeline">Timeline Editor</a>
            </li>
            <li>
              <a href="#settings">Project Settings</a>
            </li>
            <li>
              <a href="#product-registration">Registration</a>
            </li>
          </ul>
        </aside>

        {/* ── Main Content ── */}
        <div className="content">
          {/* Mobile ToC */}
          <div className="mobile-toc">
            <details>
              <summary>Table of Contents</summary>
              <ul>
                <li>
                  <a href="#intro">Introduction</a>
                </li>
                <li>
                  <a href="#main-panel">Main Panel</a>
                </li>
                <li className="sub">
                  <a href="#main-menu">Main Menu</a>
                </li>
                <li className="sub">
                  <a href="#toolbar">Toolbar</a>
                </li>
                <li className="sub">
                  <a href="#media-grid">Media Grid</a>
                </li>
                <li className="sub">
                  <a href="#stop-group">Stop Group Buttons</a>
                </li>
                <li className="sub">
                  <a href="#page-buttons">Page Buttons</a>
                </li>
                <li>
                  <a href="#edit-box">Box Editor</a>
                </li>
                <li className="sub">
                  <a href="#edit-samples">Edit Samples</a>
                </li>
                <li className="sub">
                  <a href="#edit-loops">Edit Loops</a>
                </li>
                <li className="sub">
                  <a href="#dsp-effects">DSP Effects</a>
                </li>
                <li>
                  <a href="#edit-page">Page Editor</a>
                </li>
                <li>
                  <a href="#edit-timeline">Timeline Editor</a>
                </li>
                <li>
                  <a href="#settings">Project Settings</a>
                </li>
                <li>
                  <a href="#product-registration">Registration</a>
                </li>
              </ul>
            </details>
          </div>

          {/* ── Introduction ── */}
          <section>
            <h3 id="intro">Introduction</h3>
            <div className="two-col">
              <div>
                <video autoPlay muted loop playsInline poster="/images/manual/intro.png">
                  <source src="/images/manual/intro.mp4" type="video/mp4" />
                </video>
              </div>
              <div>
                <p>
                  <strong>MX GRID</strong> by MXbeats is a versatile music production tool designed
                  for both live performers and studio musicians. Available as a standalone
                  application and DAW plugin (VST/AU), it provides 32 outputs for flexible routing
                  and 512 slots for loops, one-shots, and audio clips.
                </p>
                <p>
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
          </section>

          {/* ── Main Panel ── */}
          <section>
            <h3 id="main-panel">Main Panel</h3>
            <div className="two-col">
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/manual/main-panel.png" alt="MX GRID main panel" />
              </div>
              <div>
                <ol className="ref-list">
                  <li>
                    <a href="#main-menu">Main Menu</a>
                  </li>
                  <li>
                    <a href="#toolbar">Toolbar</a>
                  </li>
                  <li>
                    <a href="#stop-group">Stop Group Buttons</a>
                  </li>
                  <li>
                    <a href="#media-grid">Media Grid</a>
                  </li>
                  <li>
                    <a href="#page-buttons">Page Buttons</a>
                  </li>
                </ol>
              </div>
            </div>
          </section>

          {/* ── Main Menu ── */}
          <section>
            <h3 id="main-menu">Main Menu</h3>

            <h4>File</h4>
            <ul>
              <li>
                <strong>New Project</strong> — reset to default state.
              </li>
              <li>
                <strong>Reload Project</strong> — revert to the last saved state.
              </li>
              <li>
                <strong>Open Project</strong> — load a project file.
              </li>
              <li>
                <strong>Save / Save As</strong> — save the current project.
              </li>
              <li>
                <strong>Render Audio</strong> — generate a stereo audio file from the Timeline
                arrangement. <strong>(Pro)</strong>
              </li>
              <li>
                <strong>Exit</strong> — close the application.
              </li>
            </ul>

            <h4>Edit</h4>
            <ul>
              <li>
                <strong>Audio Settings</strong> — configure audio device type (ASIO, Windows Audio,
                etc.), sound card, output channels, sample rate, and MIDI input/output devices.
              </li>
              <li>
                <strong>Project Settings</strong> —{' '}
                <a href="#settings">project-specific settings dialog</a>.
              </li>
              <li>
                <strong>Turn off All Sounds</strong> — immediately silences all playing clips.
              </li>
              <li>
                <strong>Refresh MIDI Grid Device</strong> — refreshes the state and colors on the
                connected MIDI controller.
              </li>
            </ul>

            <h4>View</h4>
            <ul>
              <li>
                <strong>Box Editor</strong> — <a href="#edit-box">open the editor panel</a>.
              </li>
              <li>
                <strong>Page Editor</strong> —{' '}
                <a href="#edit-page">rearrange boxes and batch operations</a>.
              </li>
              <li>
                <strong>Timeline Editor</strong> —{' '}
                <a href="#edit-timeline">open the Arranger to compose songs</a>.
              </li>
              <li>
                <strong>Zoom In / Zoom Out</strong> — adjust the application size for different
                screen resolutions.
              </li>
              <li>
                <strong>Light Mode / Dark Mode</strong> — switch the color theme.
              </li>
            </ul>

            <h4>Help</h4>
            <ul>
              <li>
                <strong>Online Help</strong> — open the online manual on the product website.
              </li>
              <li>
                <strong>User Panel</strong> — open the user panel on the website.
              </li>
              <li>
                <strong>Register Product</strong> —{' '}
                <a href="#product-registration">registration and license management</a>.
              </li>
              <li>
                <strong>About</strong> — display the installed version and current license
                information.
              </li>
            </ul>
          </section>

          {/* ── Toolbar ── */}
          <section>
            <h3 id="toolbar">Toolbar</h3>
            <p>
              <img src="/images/manual/open-project-icon.png" alt="open project" className="ico" />
              <strong>Open Project</strong> — Open a project file
            </p>
            <p>
              <img src="/images/manual/save-project-icon.png" alt="save project" className="ico" />
              <strong>Save Project</strong> — Save the current project file
            </p>
            <p>
              <a href="#edit-box">
                <img src="/images/manual/edit-box-icon.png" alt="edit box" className="ico" />
              </a>
              <strong>Box Editor</strong> — Edit individual clip parameters
            </p>
            <p>
              <a href="#edit-page">
                <img src="/images/manual/edit-page-icon.png" alt="edit page" className="ico" />
              </a>
              <strong>Page Editor</strong> — Rearrange clips and batch operations
            </p>
            <p>
              <a href="#edit-timeline">
                <img
                  src="/images/manual/edit-timeline-icon.png"
                  alt="show arranger"
                  className="ico"
                />
              </a>
              <strong>Show Arranger</strong> — Switch to arrangement mode
            </p>
            <p>
              <img
                src="/images/manual/mute-all-sounds-icon.png"
                alt="mute all sounds"
                className="ico"
              />
              <strong>All Sounds Off</strong> — Panic button — mute all playing clips
            </p>
            <p>
              <img
                src="/images/manual/refresh-device-icon.png"
                alt="refresh device"
                className="ico"
              />
              <strong>Refresh MIDI Device</strong> — Update the state of your MIDI grid controller
            </p>

            <h4>Transport Control</h4>
            <img
              src="/images/manual/transport-control-main.png"
              alt="transport control"
              className="toolbar-widget"
            />
            <p>
              Starts or stops playback in Session or Arranger mode. During playback, an arc-shaped
              progress bar around the Stop button shows the current position within the bar. A label
              next to the button displays the current mode: <strong>&ldquo;Session&rdquo;</strong>{' '}
              or <strong>&ldquo;Arrangement&rdquo;</strong>.
            </p>

            <h4>Tempo Widget</h4>
            <img
              src="/images/manual/tempo-widget.png"
              alt="tempo widget"
              className="toolbar-widget"
            />
            <p>
              Sets the current project tempo (BPM). Tap the metronome icon repeatedly to set tempo,
              or click the tempo value to type it manually. Use the <strong>+/−</strong> buttons to
              adjust by 1 BPM.
            </p>
            <p>
              If any loop has a different tempo than the project, an <strong>Apply</strong> button
              appears — click it to convert all mismatched loops to the project tempo.
            </p>
          </section>

          {/* ── Media Grid ── */}
          <section>
            <h3 id="media-grid">Media Grid</h3>
            <p>
              The <strong>Media Grid</strong> is the central area of the application — a virtual
              controller consisting of 64 square buttons (8×8) spread across 8 pages, providing a
              total of <strong>512 slots</strong> for loops or samples.
            </p>

            <h4>Samples</h4>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/manual/sample-boxes.png" alt="sample boxes" style={{ width: 200 }} />
            <p>
              <strong>Samples</strong> (one-shots) can be triggered at any point. They support
              variable velocity and can be routed to 32 outputs for VST effects processing. A gray
              progress bar at the top of the box shows playback progress.
            </p>

            <h4>Loops</h4>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/manual/loop-boxes.png" alt="loop boxes" style={{ width: 200 }} />
            <p>
              <strong>Loops</strong> are synchronized with the song. When triggered, a loop waits
              for the next bar boundary before starting playback.
            </p>
            <ul>
              <li>
                A <strong>flashing box</strong> indicates the loop is waiting for the next bar.
              </li>
              <li>
                A <strong>pulsing box</strong> with a progress arc means the loop is playing.
              </li>
              <li>
                Each loop belongs to one of <strong>8 instrument groups</strong>. Only one loop per
                group can play at a time.
              </li>
              <li>
                The <strong>play mode icon</strong> (top-left) shows whether the loop repeats or
                plays once.
              </li>
            </ul>

            <h4>Stopping Individual Clips</h4>
            <p>
              During playback of any clip (loop or sample), hovering over the box reveals a{' '}
              <strong>Stop button</strong> in the top-left corner. Clicking it immediately stops
              playback of that individual clip — no need to use the Stop Group buttons or the All
              Sounds Off (panic) button.
            </p>

            <h4>Loading Clips</h4>
            <p>
              <strong>Drag and drop</strong> audio files (WAV, AIF, AIFF, MP3, OGG) or entire
              folders from your file explorer onto the grid. The application automatically detects
              clip type and assigns tempo, color, icon, instrument group, and name. You can also
              load clips via the{' '}
              <a href="#edit-box">
                <strong>Box Editor</strong>
              </a>
              .
            </p>
          </section>

          {/* ── Stop Group Buttons ── */}
          <section>
            <h3 id="stop-group">Stop Group Buttons</h3>
            <p>
              The top row above the grid contains <strong>8 Stop Group</strong> buttons — one for
              each instrument group. MX GRID organizes sounds into instrument groups (e.g.,
              percussion, bass-line).
            </p>
            <ul>
              <li>Only one loop from a given group can play at a time.</li>
              <li>
                When a group is playing, its Stop button lights up <strong>red</strong>.
              </li>
              <li>
                Clicking a Stop button makes it flash (waiting for the bar end), then stops the
                group.
              </li>
            </ul>
          </section>

          {/* ── Page Buttons ── */}
          <section>
            <h3 id="page-buttons">Page Buttons</h3>
            <p>
              The column of <strong>8 page buttons</strong> on the right side of the grid lets you
              switch between pages. Each page provides 64 slots, giving a total of{' '}
              <strong>512 slots</strong> across all 8 pages. The active page button is{' '}
              <strong>light blue</strong>; inactive pages are gray.
            </p>
          </section>

          {/* ── Box Editor ── */}
          <section>
            <h3 id="edit-box">Box Editor</h3>
            <p>
              <img src="/images/manual/edit-box-icon.png" alt="edit box" className="ico" />
              The <strong>Box Editor</strong> opens a right-side panel for editing individual clip
              parameters. Activate it from the{' '}
              <a href="#toolbar">
                <strong>toolbar</strong>
              </a>{' '}
              or the menu (View → Box Editor), then click any box on the grid to edit it. Clicking
              an empty slot lets you create a new sample or loop.
            </p>
            <video autoPlay muted loop playsInline poster="/images/manual/box-edit.png">
              <source src="/images/manual/box-edit.mp4" type="video/mp4" />
            </video>

            <h4 id="edit-samples">Edit Samples</h4>
            <div className="two-col">
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/manual/edit-sample-panel.png" alt="edit sample panel" />
              </div>
              <div>
                <ol>
                  <li>
                    Toolbar:
                    <ul>
                      <li>
                        <strong>Load file(s)</strong> — load one or more audio files. Additional
                        files fill consecutive empty slots.
                      </li>
                      <li>
                        <strong>Load folder</strong> — load all audio files from a folder.
                      </li>
                      <li>
                        <strong>Convert to Loop</strong> — converts the sample into a loop.
                      </li>
                      <li>
                        <strong>Open in external app</strong> — edit the file in your system&apos;s
                        default audio editor (e.g., Audacity). <strong>(Pro)</strong>
                      </li>
                      <li>
                        <strong>Clear Box</strong> — remove the clip and reset the slot.
                      </li>
                    </ul>
                  </li>
                  <li>Playback: Play/Stop button and the file path of the loaded audio file.</li>
                  <li>
                    Waveform: Visual waveform thumbnail. Click anywhere to start playback from that
                    position. Shows current time and total duration.
                  </li>
                  <li>
                    Name: Text field for the clip name (max <strong>12 characters</strong>). The
                    name appears on the grid box.
                  </li>
                  <li>
                    Icon: Choose from <strong>200+ music-related icons</strong>. Select the empty
                    icon to display the name in the center instead.
                  </li>
                  <li>
                    Volume &amp; Pan: <strong>Vol</strong>: 0%–200%. <strong>Pan</strong>: −100%
                    (left) to +100% (right).
                  </li>
                  <li>
                    Color: Choose one of 16 colors. Colors are mirrored on your MIDI controller.
                  </li>
                  <li>
                    Outputs: Route audio to specific stereo pairs (up to{' '}
                    <strong>32 channels</strong>). Available in DAW plugin mode for adding external
                    effects.
                  </li>
                  <li>
                    Choke Samples: Comma-separated <strong>Box IDs</strong> that will be silenced
                    when this sample triggers (e.g., closed hi-hat stopping an open hi-hat).
                  </li>
                  <li>
                    Enable Velocity: When enabled, volume varies based on MIDI strike force.
                    Requires a velocity-sensitive controller.
                  </li>
                  <li>
                    Stop on Note Off: When enabled, the sample stops immediately on mouse/pad
                    release. When disabled (default), the sample plays to completion.
                  </li>
                </ol>
              </div>
            </div>

            <h4 id="edit-loops">Edit Loops</h4>
            <p>
              The Loop Editor shares most features with the Sample Editor. Only the differences are
              covered below.
            </p>
            <div className="two-col">
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/manual/edit-loop-panel.png" alt="edit loop panel" />
              </div>
              <div>
                <ol>
                  <li>
                    Group Number: Assign the loop to one of <strong>8 instrument groups</strong>.
                    When another loop from the same group starts, the previous one stops
                    automatically.
                  </li>
                  <li>
                    Duration: The loop length in <strong>musical bars</strong>.
                  </li>
                  <li>
                    Original Tempo: The original BPM of the audio clip. Click the{' '}
                    <strong>Auto</strong> button (metronome icon) to detect it automatically.
                    Multiple clicks may yield different results as various detection algorithms are
                    used.
                  </li>
                  <li>
                    Loop Checkbox: <strong>Enabled</strong>: the loop repeats after finishing.{' '}
                    <strong>Disabled</strong>: playback stops after one cycle.
                  </li>
                </ol>
                <p>
                  <strong>Note:</strong> &ldquo;Convert to Loop&rdquo; is replaced by{' '}
                  <strong>Convert to Sample</strong> in the toolbar. When previewing a loop during
                  song playback, it synchronizes with the song rather than playing from the
                  beginning.
                </p>
              </div>
            </div>

            <h4 id="dsp-effects">
              DSP Effects <span>(Pro)</span>
            </h4>
            <p>
              Both sample and loop editors include a <strong>DSP Effects</strong> section at the
              bottom with five knobs:
            </p>
            <ol>
              <li>
                <strong>Lo Pass</strong> — low-pass filter
              </li>
              <li>
                <strong>Hi Pass</strong> — high-pass filter
              </li>
              <li>
                <strong>Tempo</strong> — playback speed (50%–200%), without changing pitch
              </li>
              <li>
                <strong>Pitch</strong> — pitch shift (−12 to +12 semitones), without changing
                duration
              </li>
              <li>
                <strong>Fine Tune</strong> — fine pitch adjustment (works with the Pitch knob)
              </li>
            </ol>
            <p>
              Each of the first four knobs has an enable/disable toggle. Fine Tune activates
              automatically with Pitch. A small frequency spectrum display shows the filtered
              result. Combining Lo Pass and Hi Pass creates band-pass or band-reject filtering.
            </p>
            <p>
              Click <strong>Apply</strong> to cache the processed audio for better performance, or{' '}
              <strong>Cancel</strong> to discard changes.
            </p>
          </section>

          {/* ── Page Editor ── */}
          <section>
            <h3 id="edit-page">Page Editor</h3>
            <p>
              The <strong>Page Editor</strong> lets you organize your grid and perform batch
              operations on multiple boxes.
            </p>
            <p>
              Use <strong>left-click</strong> to select and drag individual boxes. Use{' '}
              <strong>right-click</strong> to select multiple boxes, then drag them together.
            </p>
            <video autoPlay muted loop playsInline poster="/images/manual/page-edit.png">
              <source src="/images/manual/page-edit.mp4" type="video/mp4" />
            </video>

            <h4>Edit</h4>
            <p>
              <strong>Edit</strong> — modify parameters of selected boxes: icon, color, output,
              volume, pan, group number, duration, original tempo, loop mode, choke samples, enable
              velocity, stop on note off. Available options depend on the clip type.
            </p>
            <p>
              <strong>Copy / Paste / Cut / Delete</strong> — standard clipboard operations.
            </p>
            <h4>Convert</h4>
            <p>
              <strong>Sample</strong> — convert selected loops to samples.
            </p>
            <p>
              <strong>Loop</strong> — convert selected samples to loops.
            </p>
            <p>
              <strong>Tempo</strong> — convert selected loops to the project tempo.{' '}
              <strong>(Pro)</strong>
            </p>
            <h4>Actions</h4>
            <p>
              <strong>Deselect</strong> — deselect all boxes.
            </p>
            <p>
              <strong>Undo / Redo</strong>
            </p>
          </section>

          {/* ── Timeline Editor ── */}
          <section>
            <h3 id="edit-timeline">Arranger (Timeline Editor)</h3>
            <p>
              <img
                src="/images/manual/edit-timeline-icon.png"
                alt="show arranger"
                className="ico"
              />
              The Arranger lets you compose a song by dragging and dropping clips onto a timeline
              grid.
            </p>
            <video autoPlay muted loop playsInline poster="/images/manual/timeline-edit.png">
              <source src="/images/manual/timeline-edit.mp4" type="video/mp4" />
            </video>
            <div className="two-col">
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/manual/timeline-panel.png" alt="Timeline panel" />
              </div>
              <div>
                <ol className="ref-list">
                  <li>
                    <a href="#timeline-play-controllers">Transport Controls</a>
                  </li>
                  <li>
                    <a href="#edit-timeline-buttons">Edit Buttons</a>
                  </li>
                  <li>
                    <a href="#timeline-duration">Song Length</a>
                  </li>
                  <li>
                    <a href="#timeline-solo-mute">Solo / Mute</a>
                  </li>
                  <li>
                    <a href="#timeline-bar-no">TIME Column</a>
                  </li>
                  <li>
                    <a href="#loop-tracks">Loop Tracks</a>
                  </li>
                  <li>
                    <a href="#sample-tracks">Sample Tracks</a>
                  </li>
                  <li>
                    <a href="#timeline-grid">Timeline Grid</a>
                  </li>
                </ol>
              </div>
            </div>

            <h4 id="timeline-play-controllers">1) Transport Controls</h4>
            <img
              src="/images/manual/transport-controls.png"
              alt="transport controls"
              className="toolbar-widget"
            />
            <p>
              <strong>Play / Pause / Stop</strong> — <strong>Play</strong> starts the arrangement;
              during playback the button changes to <strong>Pause</strong>. A separate{' '}
              <strong>Stop</strong> button stops playback and resets the playhead.
            </p>
            <p>
              Next to the transport buttons, a <strong>position display</strong> shows the current
              playback position in musical bars.
            </p>
            <p>
              The <strong>Toggle Looping</strong> button enables continuous playback — when active,
              the song automatically restarts from the beginning after reaching the end.
            </p>

            <h4 id="edit-timeline-buttons">2) Edit Buttons</h4>
            <p>
              <img src="/images/manual/drag-buttons-icon.png" alt="drag button" className="ico" />
              <strong>Drag and Drop</strong> — enabled by default. Drag clips from the Media Grid
              onto the timeline. Dragging a clip back to the grid removes it from the timeline. The
              target track is highlighted while dragging.
            </p>
            <p>
              Additional buttons: <strong>Copy</strong>, <strong>Paste</strong>,{' '}
              <strong>Cut</strong>, <strong>Delete</strong>, <strong>Undo</strong>, and{' '}
              <strong>Redo</strong>.
            </p>

            <h4 id="timeline-duration">3) Song Length</h4>
            <p>
              Sets the total song length in musical bars (minimum 16). Use the text field or +/−
              buttons. If reducing the length would cut existing content, an <strong>Apply</strong>{' '}
              button appears with a confirmation dialog.
            </p>

            <h4 id="timeline-solo-mute">4) Solo / Mute</h4>
            <p>
              Each track has <strong>S</strong> (solo) and <strong>M</strong> (mute) buttons below
              the track number for selective listening.
            </p>

            <h4 id="timeline-bar-no">5) TIME Column</h4>
            <ul>
              <li>
                <strong>Click center</strong> — place the playhead at that bar.
              </li>
              <li>
                <strong>Click left edge (top)</strong> — set a temporary song start point.
              </li>
              <li>
                <strong>Click left edge (bottom)</strong> — set a temporary song end point.
              </li>
              <li>Inactive parts of the song are grayed out.</li>
            </ul>

            <h4 id="loop-tracks">6) Loop Tracks</h4>
            <ul>
              <li>
                <strong>8 tracks</strong> reserved for loops (one per instrument group).
              </li>
              <li>
                In <a href="#settings">Strict Mode</a>, loops can only be placed on the track
                matching their group number.
              </li>
              <li>
                Adjust loop start and length by dragging the top or bottom edge of the loop cell.
              </li>
            </ul>

            <h4 id="sample-tracks">7) Sample Tracks</h4>
            <ul>
              <li>
                <strong>4 tracks</strong> reserved for samples.
              </li>
              <li>Samples can be freely moved within the sample tracks.</li>
              <li>
                <strong>Right-click</strong> a sample for additional options:
              </li>
            </ul>
            <p>
              <img
                src="/images/manual/timeline-sample-edit.png"
                alt="sample edit"
                className="toolbar-widget"
              />
              <strong>Velocity</strong> — set the sample&apos;s playback volume.{' '}
              <strong>Time Shift</strong> — set the exact trigger time within the bar.
            </p>

            <h4 id="timeline-grid">8) Timeline Grid</h4>
            <ul>
              <li>
                Consists of <strong>13 columns</strong>: 1 TIME column + 8 loop tracks + 4 sample
                tracks.
              </li>
              <li>Each cell represents one bar.</li>
              <li>Drag clips from the grid onto the timeline to build your arrangement.</li>
            </ul>
          </section>

          {/* ── Project Settings ── */}
          <section>
            <h3 id="settings">Project Settings</h3>
            <div className="two-col">
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/manual/settings-window.png" alt="Project Settings" />
              </div>
              <div>
                <ul>
                  <li>
                    <strong>Controller</strong> — select a MIDI controller (None, Launchpad X).
                  </li>
                  <li>
                    <strong>Zoom</strong> — adjust the application zoom level for different screen
                    sizes.
                  </li>
                  <li>
                    <strong>Theme</strong> — switch between Light and Dark mode.
                  </li>
                  <li>
                    <strong>Master Volume</strong> — overall volume control to prevent clipping and
                    distortion.
                  </li>
                  <li>
                    <strong>Latency Compensation</strong> — used in <strong>VST mode</strong> to
                    compensate for sound card latency and ensure accurate timing.
                  </li>
                  <li>
                    <strong>Use Relative Paths</strong> — stores file paths relative to the project
                    location. Makes it easy to <strong>move or share</strong> projects between
                    computers.
                  </li>
                  <li>
                    <strong>Strict Mode</strong> — enforces that loops are placed on the{' '}
                    <a href="#loop-tracks">timeline track</a> matching their instrument group
                    number.
                  </li>
                  <li>
                    <strong>Clear Cache</strong> — clears cached DSP-processed audio files. The
                    current cache size is shown next to the button.
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* ── Product Registration ── */}
          <section>
            <h3 id="product-registration">Product Registration</h3>
            <div className="two-col">
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/manual/register-product.png"
                  alt="Registration and License Management"
                />
              </div>
              <div>
                <ul>
                  <li>
                    <h4>Register the Product</h4>
                    <ul>
                      <li>
                        Go to <strong>Help → Register Product</strong> and enter the email and
                        password used when registering on the product website.
                      </li>
                      <li>The software connects to the server and retrieves your license.</li>
                      <li>
                        You can register on <strong>up to 2 computers</strong> simultaneously.
                      </li>
                    </ul>
                  </li>
                  <li>
                    <h4>Refresh License</h4>
                    <ul>
                      <li>
                        After upgrading your license tier (e.g., from Essentials to Loops Pro),
                        click <strong>Refresh License</strong> to update.
                      </li>
                      <li>The software periodically checks the license status automatically.</li>
                    </ul>
                  </li>
                  <li>
                    <h4>Deactivate License</h4>
                    <ul>
                      <li>
                        Click <strong>Deactivate License</strong> to unregister this machine and
                        free up an activation slot.
                      </li>
                      <li>Use this when transferring the license to another computer.</li>
                    </ul>
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
