# MX GRID — Short Application Description

## Purpose

MX GRID by MXbeats is a music production app designed to let users build full tracks quickly, even without advanced music theory knowledge.

It works as:

- Standalone app (Windows/macOS)
- VST/AU plugin (license-dependent)

Projects are saved as `.mxg` files.

---

## Core Idea

MX GRID combines two workflows:

1. **Session Mode** (performance): trigger clips in real time from an 8x8 grid.
2. **Arranger Mode** (composition): place clips on a vertical timeline to create a full song.

Supported clip types:

- **Sample** (one-shot)
- **Loop** (sync playback, grouped behavior)
- **MIDI Note** (triggers external instruments/plugins)
- **Beat** (step-sequencer drum pattern)

---

## Fast Content Import

You can drag files or full folders directly onto the grid:

- Audio: WAV, AIFF, MP3, OGG
- MIDI drums: MID, MIDI

MX GRID auto-detects clip type, assigns metadata (tempo, key, color, icon, instrument), and can convert MIDI drum files into Beats.

The built-in **Media Explorer** provides searchable library browsing, filtering, preview playback, and drag-and-drop import.

---

## Grid Behavior (Session)

### Samples

- Trigger immediately
- Optional velocity response
- Optional stop on note release

### Loops and Beats

- Start at bar boundary for sync
- Assigned to 1 of 8 instrument groups
- Only one active loop/beat per group at a time
- Group Stop buttons allow per-group stop control

Visual feedback shows waiting, playing, and progress state directly on the grid.

---

## Main Interface Areas

1. **Main Menu** — project actions, app settings, UI modes, help.
2. **Toolbar** — quick access to open/save/edit/arranger/media explorer/transport/tempo/volume.
3. **Media Grid (8x8)** — main performance area.
4. **Box Editor** — per-clip editing.
5. **Page Editor** — batch operations and slot organization.
6. **Arranger (Timeline)** — full song structure.
7. **Media Explorer** — folder library, search, filters, previews.

The project supports 8 pages of grid slots, so total capacity is up to 512 clip positions.

---

## Box Editor (Clip Editing)

Used to edit one selected slot.

Common controls include:

- Name, icon, color
- Instrument type and key
- Volume and pan
- File loading/clearing

Loop-specific controls include:

- Group number
- Duration (bars)
- Original tempo and auto-detection
- Loop on/off

For Pro users, built-in DSP tools include filters, tempo/pitch/fine-tune, with apply/caching support.

---

## Page Editor (Batch + Layout)

Designed for larger edits on multiple slots:

- Multi-select (right click, Shift range)
- Drag/reorder clips on page
- Copy/paste/cut/delete
- Convert sample ↔ loop
- Batch parameter editing (where applicable)
- Undo/redo

Useful for quick page cleanup and consistent metadata setup.

---

## Arranger (Timeline)

Arranger uses a **vertical timeline**:

- Time flows downward
- Tracks are columns
- 8 loop tracks + 4 sample tracks (+ time column)

Key features:

- Drag clips from grid to timeline
- Resize/move loop clips
- Edit sample velocity and time shift
- Solo/mute per track
- Song length control (in bars)
- Play/pause/stop and loop playback
- Export/drag WAV or MIDI to DAW workflows

---

## Beat + Step Sequencer

A Beat is a programmable loop pattern using samples or MIDI notes.

Step Sequencer highlights:

- Up to 16 tracks, up to 8 bars
- Per-track step resolution
- Velocity/time shift editing
- Swing, humanization, probability
- Track solo/mute and instrument assignment

Factory preset library (400+) is included for fast start.

---

## Licensing (Summary)

- **Demo**: save/render disabled, periodic voice reminder.
- **Essentials**: free core version, standalone only.
- **Loops Pro**: full feature access (including Pro-tagged tools).

License activation is account-based, supports up to 2 computers, and can be refreshed/deactivated from the app.

---

## Best Use Case in One Line

MX GRID is built for quickly turning raw sample folders and MIDI drums into playable live sets and arranged full songs, with an easy path from idea to export.
