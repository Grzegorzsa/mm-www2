import { getPayload } from 'payload'
import config from '../payload.config'

const aside = `<h2>Manual</h2>
<ul>
  <li><a href="#intro">Introduction</a></li>
  <li>
    <a href="#main-panel">Main Panel</a>
    <ul>
      <li><a href="#main-menu">Main Menu</a></li>
      <li><a href="#toolbar">Toolbar</a></li>
      <li><a href="#media-grid">Media Grid</a></li>
      <li><a href="#stop-group">Stop Group Buttons</a></li>
      <li><a href="#page-buttons">Page Buttons</a></li>
    </ul>
  </li>
  <li>
    <a href="#edit-box">Box Editor</a>
    <ul>
      <li><a href="#edit-samples">Edit Samples</a></li>
      <li><a href="#edit-loops">Edit Loops</a></li>
      <li><a href="#dsp-effects">DSP Effects</a></li>
      <li><a href="#edit-note">Edit Notes</a></li>
      <li><a href="#edit-beat">Edit Beats</a></li>
      <li><a href="#step-sequencer">Step Sequencer</a></li>
    </ul>
  </li>
  <li><a href="#edit-page">Page Editor</a></li>
  <li><a href="#edit-timeline">Arranger</a></li>
  <li><a href="#media-explorer">Media Explorer</a></li>
  <li><a href="#settings">Project Settings</a></li>
  <li><a href="#product-registration">Registration</a></li>
</ul>`

const mobileToc = `<details>
  <summary>Table of Contents</summary>
  <ul>
    <li><a href="#intro">Introduction</a></li>
    <li><a href="#main-panel">Main Panel</a></li>
    <li class="sub"><a href="#main-menu">Main Menu</a></li>
    <li class="sub"><a href="#toolbar">Toolbar</a></li>
    <li class="sub"><a href="#media-grid">Media Grid</a></li>
    <li class="sub"><a href="#stop-group">Stop Group Buttons</a></li>
    <li class="sub"><a href="#page-buttons">Page Buttons</a></li>
    <li><a href="#edit-box">Box Editor</a></li>
    <li class="sub"><a href="#edit-samples">Edit Samples</a></li>
    <li class="sub"><a href="#edit-loops">Edit Loops</a></li>
    <li class="sub"><a href="#dsp-effects">DSP Effects</a></li>
    <li class="sub"><a href="#edit-note">Edit Notes</a></li>
    <li class="sub"><a href="#edit-beat">Edit Beats</a></li>
    <li class="sub"><a href="#step-sequencer">Step Sequencer</a></li>
    <li><a href="#edit-page">Page Editor</a></li>
    <li><a href="#edit-timeline">Arranger</a></li>
    <li><a href="#media-explorer">Media Explorer</a></li>
    <li><a href="#settings">Project Settings</a></li>
    <li><a href="#product-registration">Registration</a></li>
  </ul>
</details>`

const sections = [
  // 0 — Introduction
  `<h3 id="intro">Introduction</h3>
<div class="two-col">
  <div>
    <video autoplay muted loop playsinline poster="/images/manual/intro.png">
      <source src="/images/manual/intro.mp4" type="video/mp4" />
    </video>
  </div>
  <div>
    <p><strong>MX GRID</strong> by MXbeats is a versatile music production tool designed for both live performers and studio musicians. Available as a standalone application and DAW plugin (VST/AU), it provides 32 outputs for flexible routing and 512 slots for four clip types: <strong>Loops</strong>, <strong>Samples</strong>, <strong>MIDI Notes</strong>, and <strong>Beats</strong>.</p>
    <p>Simply drag audio files (WAV, AIFF, MP3, OGG), MIDI drum files (MID, MIDI), or entire folders onto the grid \u2014 the application automatically detects whether each file is a sample, loop, or MIDI drum file for Beat conversion, then assigns parameters like tempo, color, icon, and instrument group. You can drag files from any file explorer on your computer, or use the built-in Media Explorer to browse and import directly from your library.</p>
  </div>
</div>`,

  // 1 — Main Panel
  `<h3 id="main-panel">Main Panel</h3>
<div class="two-col">
  <div>
    <img src="/images/manual/main-panel.png" alt="MX GRID main panel" />
  </div>
  <div>
    <ol class="ref-list">
      <li><a href="#main-menu">Main Menu</a></li>
      <li><a href="#toolbar">Toolbar</a></li>
      <li><a href="#stop-group">Stop Group Buttons</a></li>
      <li><a href="#media-grid">Media Grid</a></li>
      <li><a href="#page-buttons">Page Buttons</a></li>
    </ol>
  </div>
</div>`,

  // 2 — Main Menu
  `<h3 id="main-menu">Main Menu</h3>

<h4>File</h4>
<ul>
  <li><strong>New Project</strong> \u2014 reset to default state.</li>
  <li><strong>Reload Project</strong> \u2014 revert to the last saved state.</li>
  <li><strong>Open Project</strong> \u2014 load a project file.</li>
  <li><strong>Save / Save As</strong> \u2014 save the current project.</li>
  <li><strong>Render Audio</strong> \u2014 generate a stereo audio file from the Timeline arrangement. <strong>(Pro)</strong></li>
  <li><strong>Exit</strong> \u2014 close the application.</li>
</ul>

<h4>Edit</h4>
<ul>
  <li><strong>Audio Settings</strong> \u2014 configure audio device type (ASIO, Windows Audio, etc.), sound card, output channels, sample rate, and MIDI input/output devices.</li>
  <li><strong>Project Settings</strong> \u2014 <a href="#settings">project-specific settings dialog</a>.</li>
  <li><strong>Turn off All Sounds</strong> \u2014 immediately silences all playing clips.</li>
  <li><strong>Refresh MIDI Grid Device</strong> \u2014 refreshes the state and colors on the connected MIDI controller.</li>
</ul>

<h4>View</h4>
<ul>
  <li><strong>Media Explorer</strong> \u2014 <a href="#media-explorer">browse and import audio and MIDI drum files from your file system</a>.</li>
  <li><strong>Box Editor</strong> \u2014 <a href="#edit-box">open the editor panel</a>.</li>
  <li><strong>Page Editor</strong> \u2014 <a href="#edit-page">rearrange boxes and batch operations</a>.</li>
  <li><strong>Arranger</strong> \u2014 <a href="#edit-timeline">open the Arranger to compose songs</a>.</li>
  <li><strong>Zoom In / Zoom Out / Zoom 100%</strong> \u2014 scale the interface up or down, or instantly return to default zoom.</li>
  <li><strong>Light Mode / Dark Mode</strong> \u2014 switch the color theme.</li>
</ul>

<h4>Help</h4>
<ul>
  <li><strong>Project Notes</strong> \u2014 add and edit comments for the current project.</li>
  <li><strong>Online Help</strong> \u2014 open the online manual on the product website.</li>
  <li><strong>User Panel</strong> \u2014 open the user panel on the website.</li>
  <li><strong>Register Product</strong> \u2014 <a href="#product-registration">registration and license management</a>.</li>
  <li><strong>About</strong> \u2014 display the installed version and current license information.</li>
</ul>`,

  // 3 — Toolbar
  `<h3 id="toolbar">Toolbar</h3>
<p><img src="/images/manual/open-project-icon.png" alt="open project" class="ico" /> <strong>Open Project</strong> \u2014 Open a project file</p>
<p><img src="/images/manual/save-project-icon.png" alt="save project" class="ico" /> <strong>Save Project</strong> \u2014 Save the current project file</p>
<p><a href="#edit-box"><img src="/images/manual/edit-box-icon.png" alt="edit box" class="ico" /></a> <strong>Box Editor</strong> \u2014 Edit individual clip parameters</p>
<p><a href="#edit-page"><img src="/images/manual/edit-page-icon.png" alt="edit page" class="ico" /></a> <strong>Page Editor</strong> \u2014 Rearrange clips and batch operations</p>
<p><a href="#edit-timeline"><img src="/images/manual/edit-timeline-icon.png" alt="show arranger" class="ico" /></a> <strong>Show Arranger</strong> \u2014 Switch to arrangement mode</p>
<p><img src="/images/manual/media-explorer-icon.png" alt="media explorer" class="ico" /> <strong>Media Explorer</strong> \u2014 Browse and import audio and MIDI drum files from your file system</p>

<h4>Transport Control</h4>
<img src="/images/manual/transport-control-main.png" alt="transport control" class="toolbar-widget" />
<p>Starts or stops playback in Session or Arranger mode. During playback, an arc-shaped progress bar around the Stop button shows the current position within the bar. A label next to the button displays the current mode: <strong>\u201CSession\u201D</strong> or <strong>\u201CArrangement\u201D</strong>.</p>

<h4>Tempo Widget</h4>
<img src="/images/manual/tempo-widget.png" alt="tempo widget" class="toolbar-widget" />
<p>Sets the current project tempo (BPM). Tap the metronome icon repeatedly to set tempo, or click the tempo value to type it manually. Use the <strong>+/\u2212</strong> buttons to adjust by 1 BPM.</p>
<p>If any loop has a different tempo than the project, an <strong>Apply</strong> button appears \u2014 click it to convert all mismatched loops to the project tempo.</p>

<h4>Master Volume Widget</h4>
<img src="/images/manual/master-volume-widget.png" alt="master volume widget" class="toolbar-widget" />
<p>Controls the overall playback volume of the project. Per-channel level meters and clipping indicators are shown to the right of the knob. Clipping indicators light up red if the audio clips at any point; click them to reset.</p>`,

  // 4 — Media Grid
  `<h3 id="media-grid">Media Grid</h3>
<p>The <strong>Media Grid</strong> is the central area of the application \u2014 a virtual controller consisting of 64 square buttons (8\u00D78) spread across 8 pages, providing a total of <strong>512 slots</strong> for Loops, Samples, MIDI Notes, and Beats.</p>

<h4>Samples &amp; Notes</h4>
<img src="/images/manual/sample-boxes.png" alt="sample boxes" style="width:200px" />
<p><strong>Samples</strong> and <strong>MIDI Notes</strong> are both trigger-at-any-time clip types. They are ideal for live finger drumming, fills, accents, and one-shot hits.</p>
<ul>
  <li><strong>Samples</strong> trigger audio files stored in the Grid.</li>
  <li><strong>MIDI Notes</strong> trigger sounds in external MIDI instruments and DAW plugins.</li>
  <li>Both can be used as source material for Beat patterns.</li>
</ul>
<p>Samples support variable velocity and can be routed to up to 32 outputs for VST effects processing. A gray progress bar at the top of the box shows sample playback progress.</p>

<h4>Loops &amp; Beats</h4>
<img src="/images/manual/loop-boxes.png" alt="loop boxes" style="width:200px" />
<p><strong>Loops</strong> and <strong>Beats</strong> are synchronized loop-based clip types. When triggered, both wait for the next bar boundary before starting playback.</p>
<p>A Loop is a fixed rendered audio loop (typically a single WAV file). A Beat is a programmable drum loop pattern that can trigger Samples and MIDI Notes. The musical result is similar \u2014 a repeating rhythmic loop \u2014 but Beats provide much deeper edit control.</p>
<ul>
  <li>A <strong>flashing box</strong> indicates the clip is waiting for the next bar.</li>
  <li>A <strong>pulsing box</strong> with a progress arc means a loop-based clip is playing.</li>
  <li>Each Loop or Beat belongs to one of <strong>8 instrument groups</strong>. Only one loop-based clip per group can play at a time.</li>
  <li>The <strong>play mode icon</strong> (top-left) shows whether the clip repeats or plays once.</li>
</ul>

<h4>Stopping Individual Clips</h4>
<p>During playback of any clip, hovering over the box reveals a <strong>Stop button</strong> in the top-left corner. Clicking it immediately stops playback of that individual clip \u2014 no need to use the Stop Group buttons or the All Sounds Off (panic) button.</p>

<h4>Loading Clips</h4>
<p><strong>Drag and drop</strong> audio files (WAV, AIF, AIFF, MP3, OGG), MIDI drum files (MID, MIDI), or entire folders from your file explorer onto the grid. The application automatically detects clip type, converts MIDI drum files to Beats, and assigns tempo, color, icon, instrument group, and name. You can also load clips via the <a href="#edit-box"><strong>Box Editor</strong></a>.</p>`,

  // 5 — Stop Group Buttons
  `<h3 id="stop-group">Stop Group Buttons</h3>
<p>The top row above the grid contains <strong>8 Stop Group</strong> buttons \u2014 one for each instrument group. MX GRID organizes sounds into instrument groups (e.g., percussion, bass-line).</p>
<ul>
  <li>Only one loop-based clip from a given group can play at a time.</li>
  <li>When a group is playing, its Stop button lights up <strong>red</strong>.</li>
  <li>Clicking a Stop button makes it flash (waiting for the bar end), then stops the group.</li>
</ul>`,

  // 6 — Page Buttons
  `<h3 id="page-buttons">Page Buttons</h3>
<p>The column of <strong>8 page buttons</strong> on the right side of the grid lets you switch between pages. Each page provides 64 slots, giving a total of <strong>512 slots</strong> across all 8 pages. The active page button is <strong>light blue</strong>; inactive pages are gray.</p>`,

  // 7 — Box Editor
  `<h3 id="edit-box">Box Editor</h3>
<p><img src="/images/manual/edit-box-icon.png" alt="edit box" class="ico" /> The <strong>Box Editor</strong> opens a right-side panel for editing individual clip parameters. Activate it from the <a href="#toolbar"><strong>toolbar</strong></a> or the menu (View \u2192 Box Editor), then click any box on the grid to edit it. Clicking an empty slot lets you create a new <strong>Note</strong>, <strong>Sample</strong>, <strong>Loop</strong>, or <strong>Beat</strong>.</p>
<p><strong>Tip:</strong> In Box Edit, Page Edit, or Arranger mode, hold <strong>Alt</strong> and click any box to trigger that clip \u2014 no need to switch modes first.</p>
<video autoplay muted loop playsinline poster="/images/manual/box-edit.png">
  <source src="/images/manual/box-edit.mp4" type="video/mp4" />
</video>

<h4 id="edit-samples">Edit Samples</h4>
<div class="two-col">
  <div>
    <img src="/images/manual/edit-sample-panel.png" alt="edit sample panel" />
  </div>
  <div>
    <ol>
      <li>Toolbar:
        <ul>
          <li><img src="/images/manual/load-files-icon.png" alt="load files" class="ico" /> <strong>Load file(s)</strong> \u2014 load one or more audio files. Additional files fill consecutive empty slots.</li>
          <li><img src="/images/manual/convert-to-loop-icon.png" alt="convert to loop" class="ico" /> <strong>Convert to Loop</strong> \u2014 converts the sample into a loop.</li>
          <li><img src="/images/manual/open-in-editor-icon.png" alt="open in editor" class="ico" /> <strong>Open in external app</strong> \u2014 edit the file in your system\u2019s default audio editor (e.g., Audacity). <strong>(Pro)</strong></li>
          <li><img src="/images/manual/save-meta-icon.png" alt="save meta" class="ico" /> <strong>Save Meta</strong> \u2014 saves the metadata (name, icon, color...)</li>
          <li><img src="/images/manual/clear-box-icon.png" alt="clear box" class="ico" /> <strong>Clear Box</strong> \u2014 remove the clip and reset the slot.</li>
        </ul>
      </li>
      <li>Playback: Play/Stop button and the file path of the loaded audio file.</li>
      <li>Waveform: Visual waveform thumbnail. Click anywhere to start playback from that position. Shows current time and total duration.</li>
      <li>Name: Text field for the clip name (max <strong>12 characters</strong>). The name appears on the grid box.</li>
      <li>Icon: Choose from <strong>200+ music-related icons</strong>. Select the empty icon to display the name in the center instead.</li>
      <li>Color: Choose one of 16 colors. Colors are mirrored on your MIDI controller.</li>
      <li>Volume &amp; Pan: <strong>Vol</strong>: 0%\u2013200%. <strong>Pan</strong>: \u2212100% (left) to +100% (right).</li>
      <li>Outputs: Route audio to specific stereo pairs (up to <strong>32 channels</strong>). Available in DAW plugin mode for adding external effects.</li>
      <li>Instrument Type: Choose the instrument category (e.g., Snare, Guitar, Bass). Helps identify and filter clips in the Media Explorer.</li>
      <li>Choke Samples: Comma-separated <strong>Box IDs</strong> that will be silenced when this sample triggers (e.g., closed hi-hat stopping an open hi-hat).</li>
      <li>Enable Velocity: When enabled, volume varies based on MIDI strike force. Requires a velocity-sensitive controller.</li>
      <li>Stop on Note Off: When enabled, the sample stops immediately on mouse/pad release. When disabled (default), the sample plays to completion.</li>
      <li>Key: Choose the musical key or scale of the clip (e.g., C#, Dm). Useful for organizing clips by pitch.</li>
    </ol>
  </div>
</div>

<h4 id="edit-loops">Edit Loops</h4>
<p>The Loop Editor shares most features with the Sample Editor. Only the differences are covered below.</p>
<div class="two-col">
  <div>
    <img src="/images/manual/edit-loop-panel.png" alt="edit loop panel" />
  </div>
  <div>
    <ol>
      <li>Group Number: Assign the loop to one of <strong>8 instrument groups</strong>. When another loop from the same group starts, the previous one stops automatically.</li>
      <li>Original Tempo: The original BPM of the audio clip. Click the <strong>Auto</strong> button (metronome icon) to detect it automatically. Multiple clicks may yield different results as various detection algorithms are used.</li>
      <li>Duration: The loop length in <strong>musical bars</strong>.</li>
      <li>Loop Checkbox: <strong>Enabled</strong>: the loop repeats after finishing. <strong>Disabled</strong>: playback stops after one cycle.</li>
    </ol>
    <p><strong>Note:</strong> \u201CConvert to Loop\u201D is replaced by <strong>Convert to Sample</strong> in the toolbar. A <strong>Save metadata to audio file</strong> saves the clip\u2019s name, icon, color, BPM, group number, key, and instrument directly into the audio file so these settings are applied automatically on any future import.</p>
  </div>
</div>

<h4 id="dsp-effects">DSP Effects <span>(Pro)</span></h4>
<p>Both sample and loop editors include a <strong>DSP Effects</strong> section at the bottom with five knobs:</p>
<ol>
  <li><strong>Lo Pass</strong> \u2014 low-pass filter</li>
  <li><strong>Hi Pass</strong> \u2014 high-pass filter</li>
  <li><strong>Tempo</strong> \u2014 playback speed (50%\u2013200%), without changing pitch</li>
  <li><strong>Pitch</strong> \u2014 pitch shift (\u221212 to +12 semitones), without changing tempo</li>
  <li><strong>Fine Tune</strong> \u2014 fine pitch adjustment (works with the Pitch knob)</li>
</ol>
<p>Each of the first four knobs has an enable/disable toggle. Fine Tune activates automatically with Pitch. A small frequency spectrum display shows the filtered result. Combining Lo Pass and Hi Pass creates band-pass or band-reject filtering.</p>
<p>Click <strong>Apply</strong> to cache the processed audio for better performance, or <strong>Cancel</strong> to discard changes.</p>

<h4 id="edit-note">Edit Notes</h4>
<p>A <strong>MIDI Note</strong> box maps to a specific MIDI note number, letting you trigger external MIDI instruments or DAW percussion plugins \u2014 not just audio samples. Notes are the building blocks of <a href="#edit-beat">Beat</a> patterns.</p>
<div class="two-col">
  <div>
    <img src="/images/manual/edit-note-panel.png" alt="edit note panel" />
  </div>
  <div>
    <ol>
      <li>Toolbar: <strong>Save</strong>, <strong>Open</strong>, <strong>Delete</strong> \u2014 save or load note definitions from disk.</li>
      <li><strong>MIDI Note Number</strong> \u2014 select the MIDI note to trigger. Use the <strong>Prev / Next</strong> arrows to step through notes, or click <strong>Play</strong> to audition the selected note.</li>
      <li><strong>Name</strong> \u2014 text label for the clip (max 12 characters).</li>
      <li><strong>Color &amp; Icon</strong> \u2014 visual appearance on the grid.</li>
      <li><strong>Type</strong> \u2014 instrument category (e.g., Kick, Snare).</li>
      <li><strong>Key</strong> \u2014 musical pitch of the note (e.g., C#, Dm).</li>
      <li><strong>Preset</strong> \u2014 MIDI preset (e.g., General MIDI 2). Choose the preset that matches your connected instrument or plugin.</li>
      <li><strong>Auto-fill Notes</strong> \u2014 fills the grid automatically with all notes from the selected preset. Perfect for quickly setting up a full drum kit.</li>
    </ol>
  </div>
</div>

<h4 id="edit-beat">Edit Beats</h4>
<p>A <strong>Beat</strong> is a looping percussion pattern built from audio <a href="#edit-samples">Samples</a> or <a href="#edit-note">MIDI Notes</a>. Use imported samples for a classic drum machine feel, or connect MIDI Notes to a hardware drum module or DAW plugin. Over <strong>400 factory presets</strong> from various genres are included to get you started.</p>
<p><strong>Important:</strong> Beats need matching source boxes (for example Kick, Snare, Hi-Hat) to play correctly. If your project has no suitable Sample or MIDI Note boxes assigned to those instrument types, the beat may play partially or remain silent.</p>
<div class="two-col">
  <div>
    <img src="/images/manual/edit-beat-panel.png" alt="edit beat panel" />
  </div>
  <div>
    <ol>
      <li>Toolbar: <strong>Save</strong>, <strong>Open</strong>, <strong>Delete</strong>.</li>
      <li><strong>Play</strong> \u2014 preview the beat.</li>
      <li><strong>Thumbnail</strong> \u2014 visual overview of the step pattern.</li>
      <li><strong>Name</strong> \u2014 beat name (max 12 characters).</li>
      <li><strong>Color &amp; Icon</strong> \u2014 visual appearance on the grid.</li>
      <li><strong>Original Tempo</strong> \u2014 the tempo at which this beat sounds best. Does not affect playback speed; used for filtering saved beats in the Media Explorer.</li>
      <li><strong>Group No</strong> \u2014 instrument group (1\u20138).</li>
      <li><strong>Loop</strong> \u2014 when enabled, the beat repeats indefinitely; when disabled, it plays once and stops.</li>
      <li><strong>Vel</strong> \u2014 velocity scaling for all notes [%]. Affects MIDI velocity, not sample volume \u2014 use with care.</li>
      <li><strong>Open Step Sequencer</strong> \u2014 open the pattern editor. <a href="#step-sequencer">See below.</a></li>
      <li><strong>Load Factory Preset</strong> \u2014 open the preset browser to preview and load built-in patterns.</li>
    </ol>
  </div>
</div>

<h4>Load Factory Preset</h4>
<p>Click <strong>Load Factory Preset</strong> in the Beat editor to open the preset browser.</p>
  <div>
    <img src="/images/manual/beat_presets.png" alt="beat presets" />
  </div>
<ul>
  <li><strong>Search</strong> \u2014 filter presets by name or genre.</li>
  <li><strong>Genre panel</strong> \u2014 pick a style category on the left side.</li>
  <li><strong>Preset panel</strong> \u2014 choose an available preset for the selected genre.</li>
  <li><strong>Info panel</strong> \u2014 review preset details and remap default track instruments.</li>
  <li><strong>Preview</strong> \u2014 audition the selected preset with your current instrument mappings.</li>
  <li><strong>Use Project Tempo</strong> \u2014 switch preview between the preset tempo and your current project tempo.</li>
  <li><strong>Cancel</strong> \u2014 close without applying changes.</li>
  <li><strong>Load</strong> \u2014 apply the selected preset to the current Beat.</li>
</ul>

<h4 id="step-sequencer">Step Sequencer</h4>
<p>The Step Sequencer is where you compose the beat. Each Beat can have up to <strong>16 tracks</strong> and a pattern length of up to <strong>8 bars</strong>.</p>

<h5>Toolbar</h5>
<ul>
  <li><strong>New Beat</strong> \u2014 clear the current pattern and start fresh.</li>
  <li><strong>Open / Save</strong> \u2014 load or save a beat pattern from/to disk.</li>
  <li><strong>Undo / Redo</strong></li>
  <li><strong>Copy / Cut / Paste / Delete</strong> \u2014 operate on selected notes.</li>
  <li><strong>+ / \u2212</strong> \u2014 add or remove a track.</li>
  <li><strong>Panic</strong> \u2014 silence all sounds immediately.</li>
  <li><strong>Play</strong> \u2014 preview the pattern.</li>
  <li><strong>Volume</strong> \u2014 master volume knob for the beat preview.</li>
</ul>

<h5>Global Beat Options</h5>
<ul>
  <li><strong>Tempo</strong> \u2014 defaults to project tempo. Adjust here to hear the beat at a different BPM.</li>
  <li><strong>Swing</strong> \u2014 global swing for the entire pattern.</li>
  <li><strong>Bars</strong> \u2014 pattern length: 1, 2, 4, or 8 bars.</li>
</ul>

<h5>Track Options</h5>
<p>Select a track to reveal its options panel. Use the <strong>Options</strong>, <strong>Velocity</strong>, and <strong>Time-Shift</strong> tabs:</p>
<ul>
  <li><strong>Steps/bar</strong> \u2014 number of steps per bar for this track: 4, 8, or 16.</li>
  <li><strong>Gain</strong> \u2014 velocity offset for all notes in the track.</li>
  <li><strong>Swing</strong> \u2014 per-track swing (stacks with global swing).</li>
  <li><strong>Time Shift</strong> \u2014 offset all notes in the track: \u221250% to +50%.</li>
  <li><strong>Velocity Humanization</strong> \u2014 add subtle velocity variation for a more natural feel.</li>
  <li><strong>Time Humanization</strong> \u2014 add subtle timing variation.</li>
  <li><strong>Probability</strong> \u2014 chance that each note plays. Great for adding organic variation.</li>
</ul>

<h5>Tracks</h5>
<p>Each track consists of:</p>
<ul>
  <li><strong>Drag handle</strong> \u2014 reorder tracks by dragging up or down.</li>
  <li><strong>Select checkbox</strong> \u2014 select the track to view its options.</li>
  <li><strong>Box icon &amp; name</strong> \u2014 shows the Sample or Note assigned to this track. Click the icon to audition it.</li>
  <li><strong>Left / Right arrows</strong> \u2014 cycle through boxes within the same instrument category.</li>
  <li><strong>Instrument type selector</strong> \u2014 choose the category (Kick, Snare, Hi-Hat, etc.).</li>
  <li><strong>Solo / Mute</strong> \u2014 isolate or silence the track during preview.</li>
  <li><strong>Step grid</strong> \u2014 click an empty step to place a note; click a filled step to remove it. Drag <strong>up/down</strong> to adjust velocity; drag <strong>left/right</strong> to shift timing. Default velocity is <strong>100</strong>.</li>
</ul>
<p>When done, click <strong>Save</strong> to apply changes, or <strong>Cancel</strong> to discard them.</p>`,

  // 8 — Page Editor
  `<h3 id="edit-page">Page Editor</h3>
<p>The <strong>Page Editor</strong> lets you organize your grid and perform batch operations on multiple boxes.</p>
<p>Use <strong>left-click</strong> to select and drag individual boxes. Use <strong>right-click</strong> to select multiple boxes, then drag them together. Use <strong>Shift+Click</strong> to select all boxes between the first and second clicked box.</p>
<video autoplay muted loop playsinline poster="/images/manual/page-edit.png">
  <source src="/images/manual/page-edit.mp4" type="video/mp4" />
</video>

<h4>Edit</h4>
<p><strong>Edit</strong> \u2014 modify parameters of selected boxes: icon, color, output, volume, pan, group number, duration, original tempo, loop mode, choke samples, enable velocity, stop on note off. Available options depend on the clip type.</p>
<p><strong>Copy / Paste / Cut / Delete</strong> \u2014 standard clipboard operations.</p>

<h4>Convert</h4>
<p><strong>Sample</strong> \u2014 convert selected loops to samples.</p>
<p><strong>Loop</strong> \u2014 convert selected samples to loops.</p>
<p><strong>Tempo</strong> \u2014 convert selected loops to the project tempo. <strong>(Pro)</strong></p>

<h4>Actions</h4>
<p><strong>Deselect</strong> \u2014 deselect all boxes.</p>
<p><strong>Undo / Redo</strong></p>

<h4>File</h4>
<p><strong>Save Meta</strong> \u2014 saves the metadata (name, icon, color, BPM, group number, key, instrument) of all selected clips directly into their audio files.</p>`,

  // 9 — Timeline Editor
  `<h3 id="edit-timeline">Arranger (Timeline Editor)</h3>
<p><img src="/images/manual/edit-timeline-icon.png" alt="show arranger" class="ico" /> The Arranger lets you compose a song by dragging and dropping clips onto a timeline grid.</p>
<p><strong>Quick Edit:</strong> Right-click any clip on the timeline to instantly edit its basic properties \u2014 no need to open the full Box Editor.</p>
<video autoplay muted loop playsinline poster="/images/manual/timeline-edit.png">
  <source src="/images/manual/timeline-edit.mp4" type="video/mp4" />
</video>
<div class="two-col">
  <div>
    <img src="/images/manual/timeline-panel.png" alt="Timeline panel" />
  </div>
  <div>
    <ol class="ref-list">
      <li><a href="#timeline-play-controllers">Transport Controls</a></li>
      <li><a href="#edit-timeline-buttons">Edit Buttons</a></li>
      <li><a href="#timeline-duration">Song Length</a></li>
      <li><a href="#timeline-solo-mute">Solo / Mute</a></li>
      <li><a href="#timeline-bar-no">TIME Column</a></li>
      <li><a href="#loop-tracks">Loop Tracks</a></li>
      <li><a href="#sample-tracks">Sample Tracks</a></li>
      <li><a href="#timeline-grid">Timeline Grid</a></li>
    </ol>
  </div>
</div>

<h4 id="timeline-play-controllers">1) Transport Controls</h4>
<img src="/images/manual/transport-controls.png" alt="transport controls" class="toolbar-widget" />
<p><strong>Play / Pause / Stop</strong> \u2014 <strong>Play</strong> starts the arrangement; during playback the button changes to <strong>Pause</strong>. A separate <strong>Stop</strong> button stops playback and resets the playhead.</p>
<p>Next to the transport buttons, a <strong>position display</strong> shows the current playback position in musical bars.</p>
<p>The <strong>Toggle Looping</strong> button enables continuous playback \u2014 when active, the song automatically restarts from the beginning after reaching the end.</p>

<h4 id="edit-timeline-buttons">2) Edit Buttons</h4>
<p><img src="/images/manual/drag-buttons-icon.png" alt="drag button" class="ico" /> <strong>Drag and Drop</strong> \u2014 enabled by default. Drag clips from the Media Grid onto the timeline. Dragging a clip back to the grid removes it from the timeline. The target track is highlighted while dragging.</p>
<p>Additional buttons: <strong>Copy</strong>, <strong>Paste</strong>, <strong>Cut</strong>, <strong>Delete</strong>, <strong>Undo</strong>, and <strong>Redo</strong>.</p>
<p><img src="/images/manual/render-timeline.png" alt="render timeline" class="ico" /> <strong>Render Timeline</strong> turns on the export controls for the arranger. It lets you render the whole song or just selected tracks, then use <strong>Drag WAV</strong> and <strong>Drag MIDI</strong> to drop the exported files straight into your DAW.</p>
<p>Use <strong>Shift+Click</strong> to select all cells between two clicked positions, or <strong>Ctrl+Click</strong> to add individual cells to the current selection.</p>

<h4 id="timeline-duration">3) Song Length</h4>
<p>Sets the total song length in musical bars (minimum 16). Use the text field or +/\u2212 buttons. If reducing the length would cut existing content, an <strong>Apply</strong> button appears with a confirmation dialog.</p>

<h4 id="timeline-solo-mute">4) Solo / Mute</h4>
<p>Each track has <strong>S</strong> (solo) and <strong>M</strong> (mute) buttons below the track number for selective listening.</p>

<h4 id="timeline-bar-no">5) TIME Column</h4>
<ul>
  <li><strong>Click center</strong> \u2014 place the playhead at that bar.</li>
  <li><strong>Click left edge (top)</strong> \u2014 set a temporary song start point.</li>
  <li><strong>Click left edge (bottom)</strong> \u2014 set a temporary song end point.</li>
  <li>Inactive parts of the song are grayed out.</li>
</ul>

<h4 id="loop-tracks">6) Loop & Beat Tracks</h4>
<ul>
  <li><strong>8 tracks</strong> reserved for loops and beats (one per instrument group).</li>
  <li>Adjust loop start and length by dragging the top or bottom edge of the loop cell.</li>
  <li><strong>Right-click</strong> a loop for <strong>Vol</strong> and <strong>Pan</strong> controls.</li>
  <li><strong>Right-click</strong> a beat for <strong>Vel</strong> (master velocity).</li>
</ul>

<h4 id="sample-tracks">7) Sample & Note Tracks</h4>
<ul>
  <li><strong>4 tracks</strong> reserved for samples and notes.</li>
  <li>Samples and notes can be freely moved within the sample tracks.</li>
</ul>
<p><strong>Right-click</strong> a sample instance for <strong>Velocity</strong> and <strong>Time Shift</strong>. Use <strong>Master Volume</strong> and <strong>Pan</strong> to adjust the whole sample.</p>
<ul>
  <li><strong>Right-click</strong> a sample for <strong>Master Volume</strong> and <strong>Pan</strong>.</li>
  <li><strong>Right-click</strong> a note for <strong>Velocity</strong> and <strong>Time Shift</strong>.</li>
</ul>

<h4 id="timeline-grid">8) Timeline Grid</h4>
<ul>
  <li>Consists of <strong>13 columns</strong>: 1 TIME column + 8 loop/beat tracks + 4 sample/note tracks.</li>
  <li>Each cell represents one bar.</li>
  <li>Drag clips from the grid onto the timeline to build your arrangement.</li>
</ul>`,

  // 10 — Media Explorer
  `<h3 id="media-explorer">Media Explorer</h3>
<p><img src="/images/manual/media-explorer-icon.png" alt="Media Explorer" class="ico" /> The <strong>Media Explorer</strong> is a built-in tool designed for cataloguing, quickly finding, and previewing media files on your computer. It supports audio files and MIDI drum files. Open it from the toolbar or via <strong>View \u2192 Media Explorer</strong>.</p>

<video autoplay muted loop playsinline poster="/images/manual/media-explorer.png">
  <source src="/images/manual/media-explorer.mp4" type="video/mp4" />
</video>

<h4>Toolbar</h4>
<ul>
  <li><img src="/images/manual/add-folder-icon.png" alt="Add Folder" class="ico" /> <strong>Add Media Folder</strong> \u2014 add a folder to your media library.</li>
  <li><img src="/images/manual/remove-folder-icon.png" alt="Add Folder" class="ico" /> <strong>Remove Selected Folder</strong> \u2014 remove the selected folder from the library.</li>
  <li><img src="/images/manual/stop-parsing-icon.png" alt="Add Folder" class="ico" /> <strong>Stop Parsing</strong> \u2014 stop the background scan at any time.</li>
  <li><img src="/images/manual/auto-preview-icon.png" alt="Add Folder" class="ico" /> <strong>Auto Preview on Hover</strong> \u2014 hover over a one-shot to hear a quick preview. (Not available for loops to keep CPU usage low.)</li>
</ul>

<h4>Folders</h4>
<p>Shows your media folders as a collapsible tree. When you add a folder, MX GRID scans it automatically \u2014 detecting whether each file is a loop, one-shot sample, or MIDI drum file. Audio files receive metadata such as BPM, key, instrument, and waveform thumbnail. MIDI drum files are prepared for Beat conversion with instrument mapping.</p>
<p>Select <strong>All Folders</strong> at the top to browse your entire library at once. The file count for each folder is shown in parentheses.</p>
<p>Drag an entire folder onto the grid to import all its files. Reopening the Explorer triggers a quick rescan to pick up any new or changed files.</p>

<h4>Files</h4>
<p>Lists media files in the selected folder. Use the <strong>Search</strong> field to filter by name or instrument. Click the filter button to narrow results by BPM range, key, or clip type.</p>
<p>Click <strong>Play</strong> to preview a file. When your project is playing, previewing a loop syncs it to the current tempo and the next bar \u2014 the button flashes while it waits to start.</p>
<p>Drag files onto the grid. MIDI drum files are automatically converted to Beats during import. Use <strong>Ctrl+Click</strong> / <strong>Shift+Click</strong> to select multiple files first. Press <strong>Shift+A</strong> to select all files in the current folder.</p>
<p>Click the info button on any file to see its full path, size, type, BPM, key, and duration.</p>

<h4>Transport Bar</h4>
<p>While a file is previewing, a transport bar appears at the bottom of the panel. It shows the waveform, filename, and a <strong>Volume</strong> knob. Click the waveform to jump to any position. The bar stays visible while you scroll.</p>`,

  // 11 — Project Settings
  `<h3 id="settings">Project Settings</h3>
<div class="two-col">
  <div>
    <img src="/images/manual/settings-window.png" alt="Project Settings" />
  </div>
  <div>
    <ul>
      <li><strong>Controller</strong> \u2014 select a MIDI controller (None, Launchpad X).</li>
      <li><strong>MIDI In / MIDI Out</strong> \u2014 select the MIDI ports for your Launchpad controller. Visible when a controller other than None is selected.</li>
      <li><strong>Default MIDI Map</strong> \u2014 choose the MIDI preset used when importing MIDI drum files so instruments map correctly to Beat tracks.</li>
      <li><strong>Sample Latency</strong> \u2014 set extra delay for sample playback (in samples) when you need tighter sync.</li>
      <li><strong>MIDI Latency</strong> \u2014 set extra delay for MIDI events (in samples) to align external instruments with audio.</li>
      <li><strong>Latency Compensation</strong> \u2014 used in <strong>VST mode</strong> to compensate for sound card latency and ensure accurate timing.</li>
      <li><strong>Use Relative Paths</strong> \u2014 stores file paths relative to the project location. Makes it easy to <strong>move or share</strong> projects between computers.</li>
      <li><strong>Auto-Convert Tempo</strong> \u2014 when enabled, all imported loops are automatically converted to the current project tempo.</li>
      <li><strong>Beats MIDI Channel</strong> \u2014 MIDI channel used by the Beat sequencer when sending notes to external instruments and plugins.</li>
      <li><strong>Clear Temp Data</strong> \u2014 clears all temporary data created by the application, including DSP cache files, Media Explorer database entries, and other generated temporary files.</li>
    </ul>
    <p><strong>Sync tip:</strong> If possible, use low-latency audio drivers (for example ASIO). When that is not possible, use Sample Latency and MIDI Latency to keep playback in time.</p>
    <p><strong>Note:</strong> Theme selection is now in the <strong>View</strong> menu (Light Mode / Dark Mode).</p>
  </div>
</div>`,

  // 12 — Product Registration
  `<h3 id="product-registration">Product Registration</h3>
<div class="two-col">
  <div>
    <img src="/images/manual/register-product.png" alt="Registration and License Management" />
  </div>
  <div>
    <ul>
      <li>
        <h4>Register the Product</h4>
        <ul>
          <li>Go to <strong>Help \u2192 Register Product</strong> and enter the email and password used when registering on the product website.</li>
          <li>The software connects to the server and retrieves your license.</li>
          <li>You can register on <strong>up to 2 computers</strong> simultaneously.</li>
        </ul>
      </li>
      <li>
        <h4>Refresh License</h4>
        <ul>
          <li>After upgrading your license tier (e.g., from Essentials to Loops Pro), click <strong>Refresh License</strong> to update.</li>
          <li>The software periodically checks the license status automatically.</li>
        </ul>
      </li>
      <li>
        <h4>Deactivate License</h4>
        <ul>
          <li>Click <strong>Deactivate License</strong> to unregister this machine and free up an activation slot.</li>
          <li>Use this when transferring the license to another computer.</li>
        </ul>
      </li>
    </ul>
  </div>
</div>`,
]

async function seed() {
  const payload = await getPayload({ config: await config })

  await payload.updateGlobal({
    slug: 'manual',
    data: {
      aside,
      mobileToc,
      sections: sections.map((html) => ({ html })),
    },
  })

  console.log('Manual content seeded.')
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
