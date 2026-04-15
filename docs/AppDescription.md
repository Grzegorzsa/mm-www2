# MX GRID — Application Description

## Purpose of This Document

This document provides a comprehensive textual description of the MX GRID application, primarily intended for AI services that cannot physically interact with the software. It is **not** meant for publication. Its purpose is to serve as a reference for creating user manuals, tutorials, video content, and as a knowledge source for user support.

**Product website:** `https://mxbeats.com/`

---

## 1. About MX GRID

MX GRID by MXbeats is a music production tool designed to simplify the music creation process so that even users without extensive musical knowledge can produce music independently.

### Platform & Distribution

- Available as a **standalone application** and as a **VST/AU plugin** for Windows and macOS.
- On Windows, compiled for both **Intel x64** and **ARM64** processors.
  - Intel x64: distributed as an installer package (built with Inno Setup).
  - ARM64: standalone and VST files are available as separate downloads.
- Projects are saved in a proprietary format with the `.mxg` extension.

### Key Features

- **Simple media management** — drag entire folders of audio files (WAV, AIFF, MP3, OGG) onto the grid. The application automatically detects whether each file is a single-shot sample or a loop and assigns parameters such as tempo, color, icon, name, and instrument group.
- **One-click tempo conversion** — convert all loops to the current project tempo with a single click.
- **Two playback modes:**
  1. **Session** — trigger samples and loops in real time using a mouse or a MIDI controller (e.g., Launchpad). Single-shot samples can be triggered at any moment; loops are triggered synchronously (at the beginning of the next musical bar).
  2. **Arranger (Timeline)** — arrange clips on a timeline to compose complete songs. The timeline provides 8 tracks for loops and 4 tracks for samples.

---

## 2. Clip Types

### 2.1 Single-Shot Samples

Single-shot samples can be triggered at any time with variable velocity (loudness depending on how hard the MIDI pad is pressed).

### 2.2 Loops

Loops always play at a fixed volume. When triggered, the application waits until the end of the current bar to start playback, ensuring synchronization with other clips.

- Each loop belongs to one of **8 instrument groups**.
- Only **one loop per group** can play at a time. Triggering a new loop in a group automatically stops the previously playing loop in that group (after waiting for the bar boundary).
- Loops **repeat by default** after finishing playback. This can be disabled so that the loop stops automatically after one cycle.
- Each instrument group has a dedicated **Stop button** (8 total) to manually stop playback.

---

## 3. Licensing

The application GUI is entirely in English. Three license tiers are available:

| License        | Description                                                                                                                                                                                                           |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Demo**       | Unregistered mode. Most features are available except those reserved for Loops Pro. Project saving and audio rendering are disabled. A periodic voice message plays during Timeline playback to indicate demo status. |
| **Essentials** | Free license with core functionality. Standalone version only — no VST plugin support. Intended as an introductory experience.                                                                                        |
| **Loops Pro**  | Full license with all features unlocked, including VST plugin, audio rendering, and external editor integration.                                                                                                      |

Some UI elements may be hidden depending on the user's license tier. Features marked with **(Pro)** in this document require the Loops Pro license.

---

## 4. Application Interface (GUI) Overview

The application consists of the following main areas:

1. **Main Menu** — top-left corner, always visible
2. **Toolbar** — below the main menu, always visible
3. **Media Grid** — the central grid of square buttons (virtual MIDI controller)
4. **Box Editor** — right-side panel for editing individual clip parameters
5. **Page Editor** — mode for rearranging clips and performing batch operations
6. **Arranger (Timeline)** — song composition view with a vertical timeline
7. **Media Explorer** — right-side panel for browsing and importing audio files from your file system

---

## 5. Main Menu

The main menu is located in the top-left corner and is always visible (unless obscured by a dialog window).

### Menu Structure

```txt
File
├── New Project
├── Reload Project
├── Open Project
├── Save
├── Save As
├── ─────────────
├── Render Audio
├── ─────────────
└── Exit

Edit
├── Audio Settings
├── Project Settings
├── ─────────────
├── Turn off All Sounds
└── Refresh MIDI Grid Device

View
├── Media Explorer
├── ─────────────
├── Box Editor
├── Page Editor
├── Timeline Editor
├── ─────────────
├── Zoom In
├── Zoom Out
├── ─────────────
├── Light Mode
└── Dark Mode

Help
├── Project Notes
├── Online Help
├── User Panel
├── Register Product
└── About
```

### 5.1 File

- **New Project** — resets the application to its default state. A confirmation dialog appears: _"Warning: Are you sure you want to discard your changes?"_ with OK / Cancel options.
- **Reload Project** — reverts the project to its last saved state. Shows the same confirmation dialog as New Project.
- **Open Project** — opens a file browser to load a saved `.mxg` project file.
- **Save** — saves the project under its current name.
- **Save As** — saves the project under a new name.
- **Render Audio** — generates a stereo audio file from the arrangement created in the Timeline. **(Pro)**
- **Exit** — closes the application.

### 5.2 Edit

- **Audio Settings** — standard audio/MIDI hardware settings dialog (provided by the JUCE library). Allows configuration of: audio device type (ASIO, Windows Audio, etc.), sound card, output channels, sample rate, sound card control panel, and MIDI devices.
- **Project Settings** — project-specific settings dialog with Close and Save buttons:
  - **Controller** — MIDI controller selection (None, Launchpad X).
  - **Zoom** — application zoom level.
  - **Theme** — Light or Dark.
  - **Latency Compensation** — checkbox, used in VST mode for better clip synchronization and latency reduction.
  - **Use Relative Paths** — stores file paths relative to the project location, allowing the project folder to be moved or shared with others.
  - **Auto-Convert Tempo** — when enabled, all imported loops are automatically converted to the current project tempo.
  - **Clear Cache** — clears cached audio files generated when applying DSP filters. The current cache size is displayed next to the button.
  - **Clear Media DB** — clears all data stored in the Media Explorer database. The current database size is displayed next to the button.
- **Turn off All Sounds** — immediately silences all playing clips.
- **Refresh MIDI Grid Device** — refreshes the state and colors on the connected MIDI controller (e.g., Launchpad).

### 5.3 View

- **Media Explorer** — opens the Media Explorer panel for browsing and importing audio files from your file system.
- **Box Editor** — opens the right-side panel for editing individual clip settings. Clicking a box on the grid in this mode opens its parameters for editing.
- **Page Editor** — enables rearranging boxes and performing batch modifications (tempo, color, volume, icon, etc.).
- **Timeline Editor** — opens the Arranger for composing songs from available clips.
- **Zoom In / Zoom Out** — adjusts the application size to accommodate different screen resolutions and user preferences.
- **Light Mode / Dark Mode** — switches the application color theme.

### 5.4 Help

- **Project Notes** — opens a dialog to add and edit text comments for the current project.
- **Online Help** — opens the online manual on the product website.
- **User Panel** — opens the user panel on the website.
- **Register Product** — opens the registration/deactivation/license renewal dialog.
- **About** — displays the installed application version and current license information.

---

## 6. Toolbar

The toolbar is located below the main menu and is always visible, regardless of the current mode. Many of its buttons duplicate main menu functions for quick access; some are unique to the toolbar. Hovering over any icon displays a tooltip with the function name.

Buttons (left to right):

- **Open Project** — opens a `.mxg` project file. Icon: folder.
- **Save** — saves the current project. Icon: floppy disk.
- **Edit Box** — opens the Box Editor for the selected slot. Icon: square with a pencil in the bottom-right corner.
- **Edit Page** — opens the Page Editor. Icon: four squares with a pencil in the bottom-right corner.
- **Show Arranger** — toggles the Arranger panel visibility. The tooltip reads "Switch to arrangement mode". Icon: vertical bars with a pencil in the bottom-right corner. Disabled during playback.
- **Media Explorer** — opens the Media Explorer panel. Icon: computer monitor with a magnifying glass (third icon from the left).
- **Transport Control** — starts or stops playback in Session or Arranger mode.
  - The left side has a Play/Stop button: Play is shown when stopped; Stop (highlighted in blue) is shown during playback.
  - During playback, an arc-shaped progress bar is drawn around the Stop button, indicating the current position within the bar. Loop switching occurs at the end of each bar.
  - Next to the button, a label displays the current mode: "Session" or "Arrangement".
- **Tempo Widget** — sets the current project tempo (BPM). Components:
  - **Tap Tempo button** (metronome icon) — tap repeatedly to set tempo.
  - **Tempo display** — shows the current BPM; can be clicked to type a value manually.
  - **+/−** buttons — increment/decrement tempo by 1 BPM (+ on top, − below).
  - **BPM label / Apply button** — normally displays "BPM". If any loop in the project has a different tempo than the project tempo, the label changes to an "Apply" button. Clicking it converts all mismatched loops to the project tempo.
  - **Status messages:**
    - _"Tempo Change"_ — displayed when the project tempo changes during playback (e.g., triggering a loop with a different tempo).
    - _"Tempo Mismatch"_ — displayed when the application runs as a DAW plugin and the host's tempo differs from the clips' tempo.
- **Master Volume Widget** — located at the right end of the toolbar. Controls the overall playback volume of the project. To the right of the volume knob are per-channel level meters and clipping indicators. If the audio clips at any point, the indicators light up red; clicking them resets them.

---

## 7. Media Grid

The Media Grid is the central area of the application, located below the toolbar. It is a virtual controller consisting of **64 square buttons** arranged in an 8×8 grid (8 columns × 8 rows).

### 7.1 Layout

- **Stop Group buttons** (top row, above the grid) — 8 buttons for stopping playback of each instrument group. When a group is playing, its Stop button lights up red and displays the group number with the label "stop". Clicking it causes the button to flash (indicating it is waiting until the end of the current bar), then the group stops and the button goes dark.
- **Page buttons** (right column) — 8 buttons for switching between the 8 pages of the project. This extends the total capacity to **8 × 64 = 512 clip slots**. The active page button is light blue; inactive pages are gray. Each button displays its page number.
- **MXbeats logo** — displayed below the grid.

### 7.2 Box Appearance

Each box on the grid displays information about its assigned clip:

- **Color** — empty slots are gray. Configured slots display one of 16 colors: Orange, Golden Tainoi, Canary, Inch Worm, Green, Ming Green, Spring Green, Bright Turquoise, Blue, Melrose, Indigo, Light Violet, Coral Red, Dusty Pink, Light Gray, White Smoke. These colors are mirrored on a connected MIDI controller.
- **Play mode icon** (top-left corner):
  - Looping loop: two counter-clockwise arrows forming a circle.
  - Non-looping loop: a straight arrow.
  - Sample: no icon.
- **Tempo** (top-center, loops only) — displays the loop's tempo.
- **Instrument icon** (center) — an icon representing the instrument type.
- **Clip name** (below the icon) — if no icon is assigned, the name is displayed in the center instead.
- **Group number** (loops only) — visible on hover as a white number on a semi-transparent black circle.

### 7.3 Playback Visual Feedback

- **Samples:** a gray progress bar appears at the top of the box during playback and disappears when finished.
- **Loops:**
  - **Waiting (flashing):** after triggering, the box flashes rapidly (abrupt on/off), indicating the loop is waiting for the next bar boundary.
  - **Playing (pulsing):** the box pulses smoothly (gradual fade in/out). The group number appears in the center, surrounded by a white arc progress bar that forms a complete circle by the end of the loop cycle.
- **Hover Stop button:** during playback of any clip (loop or sample), hovering over the box reveals a **Stop button** in the top-left corner. Clicking it immediately stops playback of that individual clip without needing to use the Stop Group buttons or the All Sounds Off (panic) button.

### 7.4 Loading Clips into the Grid

There are two ways to load clips:

1. **Drag and drop from the file explorer** — drag audio files (WAV, AIF, AIFF, MP3, OGG) or entire folders onto the grid. If multiple files are dragged, they fill consecutive empty slots. The application automatically detects whether each file is a sample or loop and assigns parameters (tempo, instrument type, color, icon, group number, name). This is the fastest way to load clips.

2. **Via the Box Editor** — activate Box Edit mode and click an empty slot. A prompt asks whether to create a sample or loop. The new clip is initialized as a copy of the last edited clip (or with default values if no clip has been edited yet). Audio files can then be loaded via the editor toolbar.

---

## 8. Box Editor

The Box Editor is the right-side panel for editing individual clip parameters. It is activated from the main menu (View → Box Editor) or the toolbar (Edit Box button).

**Workflow:** activate Box Edit mode, then click a box on the grid to edit it. Clicking an empty slot prompts you to create a new sample or loop. If no slot is selected, the panel displays "Nothing Selected".

Most editing options are shared between samples and loops. Differences are noted in each subsection below.

### 8.1 Sample Editor

#### Toolbar (top of the panel)

- **Load sample file(s)** — loads one or more audio files. If multiple files are selected, the first is loaded into the current slot and the rest into consecutive empty slots. Icon: document with an inward arrow.
- **Load all samples from folder** — loads all audio files from a selected folder. Icon: folder.
- **Convert to Loop** — converts the current sample into a loop.
- **Open in external app** — opens the audio file in the system's default associated application (e.g., Audacity). To use a specific editor, associate the file extension at the OS level. Icon: square with an upward arrow. **(Pro)**
- **Clear Box** — removes the clip and resets the slot to empty. Icon: trash can.

#### Playback Controls

Below the toolbar: a **Play/Stop button** and the **file path** of the loaded audio file, displayed on the same line.

#### Waveform Display

A waveform (oscillogram) thumbnail of the audio file. During playback, a playhead indicates the current position. Clicking on the waveform starts playback from that point. The bottom-left corner shows the current playback time; the bottom-right shows the total duration.

#### Clip Properties

- **Name** — text field (max 12 characters).
- **Icon** — selector with 200+ music-related icons. Selecting the empty (first) icon causes the clip name to be displayed in the center of the box instead.
- **Color** — one of 16 available colors.
- **Outputs** — audio output routing (available in DAW plugin mode). Supports up to 16 stereo pairs (32 channels total), labeled "1/2", "3/4", "5/6", etc.
- **Choke Samples** — comma-separated list of Box IDs whose playback should be stopped when this sample is triggered (e.g., closed hi-hat stopping an open hi-hat).
- **Enable Velocity** — checkbox. When enabled, sample volume varies based on MIDI velocity (strike force). Requires a velocity-sensitive MIDI controller (e.g., Launchpad X supports this; Launchpad Mini does not).
- **Stop on Note Off** — checkbox (off by default). When enabled, the sample stops immediately when the mouse button or MIDI pad is released. When disabled, the sample plays to completion.
- **Instrument Type** — dropdown for selecting the instrument category (e.g., Snare, Guitar, Bass).
- **Key** — dropdown for selecting the musical key or scale of the clip (e.g., C#, Dm).

#### Volume & Pan Knobs

Located to the right of the Name and Icon fields:

- **Vol (Volume)** — 0% to 200%.
- **Pan (Balance)** — −100% (full left) to +100% (full right).

#### DSP Effects Section **(Pro)**

Located at the bottom of the editor. Provides essential built-in effects. For additional processing, use the Outputs routing and apply effects via DAW plugins.

Five knobs:

1. **Lo Pass** — low-pass filter.
2. **Hi Pass** — high-pass filter.
3. **Tempo** — playback speed adjustment (50%–200%), without changing pitch.
4. **Pitch** — pitch shift (−12 to +12 semitones), without changing tempo.
5. **Fine Tune** — fine pitch adjustment, works in conjunction with the Pitch knob.

The first four knobs each have an individual enable/disable toggle button. Fine Tune is automatically enabled when Pitch is activated.

**Frequency display** — a small frequency spectrum graph in the top-left of the DSP widget shows (in blue) the frequencies that will pass through the filters. Combining Lo Pass and Hi Pass settings can create band-pass or band-reject filtering.

**Apply / Cancel buttons** — clicking Apply converts and caches the processed audio, improving playback performance and reducing latency caused by real-time DSP processing.

#### Box ID

Displayed at the very bottom of the Sample Editor. This ID is used when specifying choke targets in the "Choke Samples" field.

### 8.2 Loop Editor

The Loop Editor shares most features with the Sample Editor. Only the differences are described below.

#### Toolbar Differences

- **Convert to Sample** replaces "Convert to Loop".
- **Save metadata to audio file** — saves all clip metadata (name, icon, color, BPM, group number, key, instrument) directly into the audio file. This allows overriding the automatic parser results so that the saved data is used whenever the file is imported into any project in the future.

#### Playback Differences

The Play/Stop button works the same way, except that when a loop is previewed during song playback, it synchronizes with the song rather than playing from the beginning.

#### Additional Loop-Specific Properties

- **Group No** — instrument group number (1–8).
- **Duration [bars]** — dropdown selector for the loop length in musical bars.
- **Original Tempo** — text field showing the original tempo of the audio clip (e.g., 110). An **Auto** button (metronome icon) next to the field uses detection algorithms to determine the tempo automatically. Multiple clicks may yield different results as different algorithms are applied.
- **Loop** — checkbox. When enabled, the loop repeats after finishing. When disabled, playback stops after one cycle.
- **Instrument Type** — dropdown for selecting the instrument category (e.g., Snare, Guitar, Bass).
- **Key** — dropdown for selecting the musical key or scale of the clip (e.g., C#, Dm).

The DSP section and Box ID display are identical to the Sample Editor.

---

## 9. Page Editor

The Page Editor is activated from the main menu (View → Page Editor) or the toolbar (Edit Page button). It opens a right-side panel for organizing boxes on the grid and performing batch operations.

### Interaction

- **Left mouse button** — select and drag individual boxes on the grid.
- **Right mouse button** — select multiple boxes. Selected boxes can then be moved together via drag and drop.
- **Shift+Click** — click a box, then Shift+click another box to select all boxes between them.

### Panel Sections

The Page Editor panel contains four sections:

#### 1. Edit

- **Edit** — opens a dialog to modify parameters of selected boxes: icon, color, output number, pan, volume, group number, duration, original tempo, loop mode, choke samples, enable velocity, stop on note off. Available options depend on the type of selected clips.
- **Copy / Paste / Cut / Delete** — standard clipboard operations for selected boxes.

#### 2. Convert

- **Sample** — converts selected loops to samples.
- **Loop** — converts selected samples to loops.
- **Tempo** — converts the tempo of selected loops to the project tempo. **(Pro)**

#### 3. File

- **Save Meta** — saves the metadata (name, icon, color, BPM, group number, key, instrument) of all selected clips directly into their audio files.

#### 4. Actions

- **Deselect** — deselects all boxes.
- **Undo / Redo** — undo or redo the last action.

---

## 10. Arranger (Timeline Editor)

The Arranger provides a timeline-based composition view for arranging clips into a complete song. Unlike most DAWs, the timeline in MX GRID uses a **vertical layout** — tracks run as columns (left to right) and time flows downward (rows represent bars).

### 10.1 Toolbar

- **Drag Clips from Grid** — enabled by default when the Arranger opens. Allows dragging boxes from the Media Grid onto the timeline via drag and drop. Dragging a clip back to the grid removes it from the timeline. While dragging, the target track is highlighted. Icon: hand with pointing finger and a right arrow.
- **Copy / Paste / Cut / Delete / Undo / Redo** — standard editing buttons.
- **Song Length Widget** — sets the total song length in musical bars (minimum: 16 bars). Includes a text field for manual input and +/− buttons. If reducing the length would cut off existing content, an "Apply" button appears with a confirmation dialog warning that part of the arrangement will be deleted.
- **Multi-selection** — use **Shift+Click** to select everything between two clicked cells, or **Ctrl+Click** to add individual cells to the current selection.

### 10.2 Timeline Layout

The timeline consists of **13 columns** of rounded-square cells:

| Column                | Purpose                                |
| --------------------- | -------------------------------------- |
| **TIME** (1st column) | Bar numbers                            |
| **Tracks 1–8**        | Loop tracks (one per instrument group) |
| **Tracks 9–12**       | Sample tracks                          |

Below the track numbers are **Solo (S)** and **Mute (M)** buttons for each track, allowing selective listening.

### 10.3 TIME Column Interactions

- **Click center** — places the playhead at that bar. Playback starts from this position. Clicking during playback jumps to that bar.
- **Click left edge at the top** — sets a temporary song start point.
- **Click left edge at the bottom** — sets a temporary song end point (does not apply when playback is controlled by a DAW host).
- Inactive (excluded) parts of the song are grayed out.

### 10.4 Working with Loops on the Timeline

- Loops can only be placed on the 8 loop tracks (columns 2–9).
- The start position and length of a loop can be adjusted by dragging the top or bottom edge of the loop cell on the timeline.
- Dragging a loop back to the Media Grid removes it from the timeline.
- Use **Shift+Click** to select all cells between two clicked positions, or **Ctrl+Click** to add individual cells to the selection.

### 10.5 Working with Samples on the Timeline

- Samples can only be placed on the 4 sample tracks (columns 10–13).
- Samples can be freely moved within the sample tracks.
- **Right-click** a sample on the timeline for additional options:
  - **Velocity** — set the sample's playback volume.
  - **Time Shift** — set the exact trigger time within the bar.

### 10.6 Transport Control

When the Arranger is visible, its own toolbar (located at the top of the Arranger panel, separate from the main application toolbar) includes a **Transport Control** widget with the following elements (left to right):

- **Play** button — starts playback of the arrangement. While the song is playing, the button changes to **Pause**, allowing the user to pause and resume playback.
- **Stop** button — stops playback and resets the playhead position.
- **Position display** — shows the current playback position in musical bars.
- **Toggle Looping** button — when enabled, the song automatically restarts from the beginning after reaching the end.

---

## 11. Product Registration

The **About** window (accessible via Help → About or the toolbar info icon) displays the current application version and allows product registration and license management.

### License Tiers

| Tier           | Features                                                                                                                                                                             |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Demo**       | Most features available except Pro-exclusive ones. Project saving and audio rendering are disabled. A periodic voice message plays during Timeline playback to indicate demo status. |
| **Essentials** | Free license with core functionality. Standalone version only — no VST plugin support. Serves as an introductory tier.                                                               |
| **Loops Pro**  | Full license with all features unlocked.                                                                                                                                             |

### Registration Process

To register the product, go to **Help → Register Product**. A dialog window appears prompting for the **email address** and **password** used when registering on the product website. After clicking **Register**, the application connects to the server and retrieves the license information.

### Managing an Existing Registration

If the registration dialog is opened on an already registered product, the login prompt is replaced by two buttons:

- **Refresh License** — re-downloads the license from the server. Useful after upgrading to a higher license tier (e.g., from Essentials to Loops Pro).
- **Deactivate License** — unregisters the product on the current machine, freeing up an activation slot.

### Activation Limits

The product can be registered on **up to 2 computers simultaneously**. To transfer a license to a different machine, deactivate it on the current machine first — this frees up one of the two available activation slots.

The application **periodically checks** with the server to verify whether the license is still valid, has been revoked, or has been updated.

---

## 13. Media Explorer

The Media Explorer is a built-in browser for your audio file library. Open it from the toolbar (computer with magnifying glass icon — third icon from the left) or via **View → Media Explorer**. It appears docked to the right side of the main window, alongside the Box Editor, Page Editor, and Arranger panels.

### 13.1 Toolbar

- **Add Media Folder** — add a folder to your media library.
- **Remove Selected Folder** — remove the currently selected folder from the library.
- **Stop Parsing** — stop the ongoing file-analysis process for the selected folder.
- **Auto Preview One-Shot on Hover** — when enabled, moving the cursor over a file's icon automatically plays a preview of that one-shot sample without requiring a click. This option applies to one-shots only; loop preview on hover is intentionally disabled due to the conversion and synchronization overhead during playback.

### 13.2 Folders Panel

A collapsible panel displaying the folder tree. Toggle visibility using the chevron icon on the right side of the panel header. The header also displays the name of the currently selected folder, so it remains visible even when the tree is collapsed.

any number of media folders can be added to the library. Adding a folder initiates a scanning process that builds a database of audio files — detecting whether each is a loop or one-shot sample, assigning an icon, color, BPM (for loops), key, instrument category, and generating a waveform thumbnail. This enables fast browsing and smooth importing. Scanning can be stopped at any time via the **Stop Parsing** toolbar button.

Subfolders can be browsed and selected. A virtual **All Folders** entry at the top of the panel lets you view all files across all added folders simultaneously. The number of detected media files is shown in parentheses next to each folder name in the tree.

An entire folder can be imported into the project by dragging it onto the grid. During the drag, the first file's icon and the total file count are shown as a visual indicator.

When the Media Explorer is opened and a folder is selected, a quick rescan is performed to detect any files that have changed since the last session.

### 13.3 Files Panel

A collapsible panel listing the audio files in the selected folder. The panel header shows the total file count and a **Search** text field for filtering by filename or instrument category. An advanced filter button reveals additional options: BPM min/max range, Key, loop checkbox, and one-shot checkbox. When any filter is active, an indicator displays the number of active filters along with a **Clear Filters** button.

Each file row displays (left to right): a **Play/Stop** button, an instrument icon, a colour-coded waveform (violet for low frequencies, cyan for high), a loop/one-shot indicator, BPM, key, duration in seconds, and the filename.

Clicking **Play** starts audio preview; the transport bar appears at the bottom of the panel. When the project is playing and a loop is previewed, it is converted to the current project tempo and synchronized — the button flashes until the next bar boundary, then playback starts. Loops previewed without project playback start immediately at their original tempo.

Audio files can be placed on the grid using **drag and drop**. Use **Ctrl+Click** or **Shift+Click** to select multiple files, or **Shift+A** to select all files in the current folder.

Hovering over a file reveals an **info** icon on the right. Clicking it opens a detail window showing the full path, file size, type, BPM, key, and duration.

### 13.4 Transport Control

When a file is being previewed, a transport bar appears at the bottom of the Files panel containing a **Play/Stop** button, a colour-coded waveform, the filename, and a **Volume** knob. The volume knob controls preview playback level. The bar remains visible even when scrolling through the file list. Clicking on the waveform scrubs the playhead to that position (not available in synchronized loop mode).

# Updates

1. W introduction pod koniec można dorzucić jedno zdanie, mówiące iż pliki można przeciągnąć z dowolnego eksplorera plików lub z wbudowanego Media Explorera. Jest to uzupełnieniem tego:

"Simply drag audio files (WAV, AIFF, MP3, OGG) or entire folders onto the grid — the application automatically detects whether each file is a sample or loop and assigns parameters like tempo, color, icon, and instrument group."

2. Sekcja Main Menu > View: Media Explorer powinien być na samym początku
3. Main Menu > Help: Project Notes powinien być na samym początku
4. Toolbar: Refresh MIDI Device - to usunąć (Zostało usunięte z toolbar'a, żeby zrobić miejsce dla Media Explorer'a)

5) Master Volume Widget: Usunąć zdanie "Located at the right end of the toolbar." - tu będzie grafika
6) File section z Save Meta - powinno być na końcu za Actions
7) Media Explorer: Tu w pierwszym wprowadzającym zdaniu: 'The Media Explorer is a built-in browser for your audio file library. Open it from the toolbar or via View → Media Explorer.' dodajmy, że Media Explorer został zaprojektowany do katalogowania, szybkiego odnajdywania i podglądu plików dźwiękowych na komputerze.
