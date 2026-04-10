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
  - **Master Volume** — overall volume control.
  - **Latency Compensation** — checkbox, used in VST mode for better clip synchronization and latency reduction.
  - **Use Relative Paths** — stores file paths relative to the project location, allowing the project folder to be moved or shared with others.
  - **Strict Mode** — enforces that loops of a given group are placed on the corresponding track in the Arranger.
  - **Clear Cache** — clears cached audio files generated when applying DSP filters. The current cache size is displayed next to the button.
- **Turn off All Sounds** — immediately silences all playing clips.
- **Refresh MIDI Grid Device** — refreshes the state and colors on the connected MIDI controller (e.g., Launchpad).

### 5.3 View

- **Box Editor** — opens the right-side panel for editing individual clip settings. Clicking a box on the grid in this mode opens its parameters for editing.
- **Page Editor** — enables rearranging boxes and performing batch modifications (tempo, color, volume, icon, etc.).
- **Timeline Editor** — opens the Arranger for composing songs from available clips.
- **Zoom In / Zoom Out** — adjusts the application size to accommodate different screen resolutions and user preferences.
- **Light Mode / Dark Mode** — switches the application color theme.

### 5.4 Help

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
- **All Sounds Off** — panic button; mutes all playing sounds. Icon: crossed-out speaker.
- **Refresh MIDI Device** — refreshes the MIDI controller display (e.g., Launchpad). Icon: square containing 9 smaller squares with a counter-clockwise curved arrow in the bottom-right corner.
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
4. **Pitch** — pitch shift (−12 to +12 semitones), without changing duration.
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

#### Playback Differences

The Play/Stop button works the same way, except that when a loop is previewed during song playback, it synchronizes with the song rather than playing from the beginning.

#### Additional Loop-Specific Properties

- **Group No** — instrument group number (1–8).
- **Duration [bars]** — dropdown selector for the loop length in musical bars.
- **Original Tempo** — text field showing the original tempo of the audio clip (e.g., 110). An **Auto** button (metronome icon) next to the field uses detection algorithms to determine the tempo automatically. Multiple clicks may yield different results as different algorithms are applied.
- **Loop** — checkbox. When enabled, the loop repeats after finishing. When disabled, playback stops after one cycle.

The DSP section and Box ID display are identical to the Sample Editor.

---

## 9. Page Editor

The Page Editor is activated from the main menu (View → Page Editor) or the toolbar (Edit Page button). It opens a right-side panel for organizing boxes on the grid and performing batch operations.

### Interaction

- **Left mouse button** — select and drag individual boxes on the grid.
- **Right mouse button** — select multiple boxes. Selected boxes can then be moved together via drag and drop.

### Panel Sections

The Page Editor panel contains three sections:

#### 1. Edit

- **Edit** — opens a dialog to modify parameters of selected boxes: icon, color, output number, pan, volume, group number, duration, original tempo, loop mode, choke samples, enable velocity, stop on note off. Available options depend on the type of selected clips.
- **Copy / Paste / Cut / Delete** — standard clipboard operations for selected boxes.

#### 2. Convert

- **Sample** — converts selected loops to samples.
- **Loop** — converts selected samples to loops.
- **Tempo** — converts the tempo of selected loops to the project tempo. **(Pro)**

#### 3. Actions

- **Deselect** — deselects all boxes.
- **Undo / Redo** — undo or redo the last action.

---

## 10. Arranger (Timeline Editor)

The Arranger provides a timeline-based composition view for arranging clips into a complete song. Unlike most DAWs, the timeline in MX GRID uses a **vertical layout** — tracks run as columns (left to right) and time flows downward (rows represent bars).

### 10.1 Toolbar

- **Drag Clips from Grid** — enabled by default when the Arranger opens. Allows dragging boxes from the Media Grid onto the timeline via drag and drop. Dragging a clip back to the grid removes it from the timeline. While dragging, the target track is highlighted. Icon: hand with pointing finger and a right arrow.
- **Copy / Paste / Cut / Delete / Undo / Redo** — standard editing buttons.
- **Song Length Widget** — sets the total song length in musical bars (minimum: 16 bars). Includes a text field for manual input and +/− buttons. If reducing the length would cut off existing content, an "Apply" button appears with a confirmation dialog warning that part of the arrangement will be deleted.

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

### 10.5 Working with Samples on the Timeline

- Samples can only be placed on the 4 sample tracks (columns 10–13).
- Samples can be freely moved within the sample tracks.
- **Right-click** a sample on the timeline for additional options:
  - **Velocity** — set the sample's playback volume.
  - **Time Shift** — set the exact trigger time within the bar.

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

## 12. Arranger Transport Control

When the Arranger is visible, its own toolbar (located at the top of the Arranger panel, separate from the main application toolbar) includes a **Transport Control** widget with the following elements (left to right):

- **Play** button — starts playback of the arrangement. While the song is playing, the button changes to **Pause**, allowing the user to pause and resume playback.
- **Stop** button — stops playback and resets the playhead position.
- **Position display** — shows the current playback position in musical bars.
- **Toggle Looping** button — when enabled, the song automatically restarts from the beginning after reaching the end.

---

## Updates

### Media Explorer

Została dodana funkcjonalność: "Media Explorer" i trzeba dla niej utworzyć osobną sekcję oraz dodać do "4. Application Interface (GUI) Overview".

Media Explorer uruchamiamy za pomocą ikonki komputera z lupą (trzecia ikona od lewej) lub z menu głównego wybierają opcję "View -> Media Explorer".

Okno Media Explorera pokazuje się po prawej stronie od okna głównego (podobnie jak w przypadku innych okien jak box editor, page editor lub Arranger).

Media Explorer składa się z czterech podstawowych części:

1. Toolbar
2. Folders Tree panel
3. Media files list
4. Transport control

5. Toolbar

W toolbarze mamy dostępne 4 przyski:

- Add media folder - dodanie folderu z mediami
- Remove selected folder - usunięcie wybranego folderu
- Stop parsing - zatrzymanie procesu analizy plików medialnych w zaznaczonym folderze.
- Auto preview one-shot on hover - odgrywanie sampli przy przesuwaniu myszką nad ikoną bez konieczności kliknięcia na przycisk play.

2. Folders tree panel

Jest to panel typu collapsible i możemy ukrywać lub rozwijać jego zawartość za pomocą ikonki chevron po prawej stronie nagłówka panelu.

W nagłówku znajduje się również nazwa zaznaczonego katalogu, także nawet gdy zwiniemy całe drzewko katalogów, widzimy, który katalog
jest zaznaczony.

Do okna możemy dodawać dowolną liczbę katalogów z plikami medialnymi. Dodanie katalogu rozpoczyna proces skanowania jego zawartości.
Podczas skanowania tworzona jest baza danych plików zawierająca informacje o danym pliku. Każdy plik jest również poddawany analizie
i zapisywana jest informacja o tym czy dany plik jest w kategorii loop czy signe-shot sample. Przydzielana jest rownież ikonka, kolor
BPM dla loops, Key, kategoria instrumentu oraz tworzona jest graficzna miniatura dla danego pliku. Umożliwia to szybkie przeszukiwanie
plików oraz ich sprawne importowanie do projektu. Proces skanowania może być długi i możemy go w każdej chwili zatrzymać klikając na
przycisk 'Stop parsing' w toolbarze.

Możemy również wyświetlać i zaznaczać podkatalogi w danym katalogu. Na zamej górze panelu pokazuje nam wirtualny katalog "All Folders".
Po kliknięciu na niego mamy możliwość przeglądania wszystkich dodanych przez nas katalogów.

Jeśli otworzymy okno Media Explorer'a i zaznaczymy jakiś katalog program dokonuje szybkiego skanowania zawartości folderu w celu ustalenia
czy jakieś pliki nie uległy zmianie.

W drzewku katalogów po prawej stronie w nawiasach pokazuje nam się liczba znalezionych plików medialnych.

Zawartość danego katalou możemy importować do projektu za pomocą drag-and-drop, przesuwając go do grida. Podczas przenoszenia katalogu
zobaczymy pierwszą ikonkę pliku z folderu oraz liczbę plików, która jest importowana.

3. Files panel

Files panel, podobnie jak w przypadku folders, jest panelem typu collapsible. W nagłówku możemy zobaczyć liczbę wyświetlanych plików
pole filtra tekstowego "Search...", który umożliwia nam wyszukiwanie po nazwie pliku oraz rodzaju instrumentu. Mamy również przycisk
pokazujący więcej opcji filtrowania: BPM min, BPM max, Key, loop checkbox, one-shot checkbox. Jeśli mamy zaznaczony jakiś filtr
obok pola wyszukiwania pokazuje nam się informacja na temat liczby aktywnych filtrów i opcja umożliwiająca wyszyszczenie ich "Clear Filters"

W oknie plików pokazuje nam się lista plików multimedialnych. Z lewej strony jest przycisk play/stop umożliwiający odtwarzanie pliku.
Następnie mamy przydzieloną ikonkę oraz waveform pliku. Następnie ikonę przedstawiającą loop lub one-shot sample, BPM,
key, długość w sekundach i nazwę pliku.

Waveform obrazujący plik dźwiękowy jest kolorowy i odzwierciedla dominującą częstotliwość w danym momencie. Dla niskich tonów mamy fiolet
a dla wysokich cyan.

Klikając na przycisk start/stop możemy włączać/wyłączać podgląd dźwięku. Pokazuje nam się wtedy również pasek transport na dole panelu.
Jeśli włączymy odtwarzania projektu i klikniemy na odtwarzanie loop'a, będzie on przekonwertowany do aktualnego tempa oraz
zsynchronizowany z odtwarzanym utworem. Zatem po kliknięciu na Play przycisk miga czekając na początek następnego bara a potem zaczyna grać.
Jeśli nie jest włączone odtwarzanie projektu loop'y odgrywane są natychmiast w oryginalnym tempie.

Jeśli w Toolbarze mamy zaznaczoną opcję 'Auto preview one-shots on hover' nie musimy klikać na start poszczególnych plików. Wystarczy,
że ustawimy kursor myszki nad ikoną pliku a usłyszymy jego podgląd. Opcja ta umożliwia szybki podgląd jedynie one-shot samples. Dla loops
opcja została celowo wyłączona ze względu na konieczność konwersji i synchronizacji w momencie, gdy utwór jest odtwarzany, co może powodować
nadmierne obciążenie procesora.

Z panelu Files możemy umieszczać pliki medialne w projekcie za pomocą drag-and-drop. Możemy używać również kombinacji klawiszy Ctrl+Click lub
Shift+Click do zaznaczania i przenoszenia wielu plików jednocześnie. Możemy również użyć kombinacji klawiszy Shift + A, żeby zaznaczyć
wszystkie pliki w danym folderze.

Jeśli przesuwamy myszką nad plikiem medialnym, po prawej stronie, pokaże nam się ikona info (i). Po kliknięciu na nią wyświetli nam się okno
ze szczegółami pliku dźwiękowego takimi jak: pełna ścieżka, rozmiar pliku, typ, bpm, key oraz długość w sekundach.

4. Transport Control

Jeśli włączymy odtwarzanie pliku medialnego, na dole pod listą plików pojawi nam się Transport Control.

Składa się z przycisku start/stop, kolorowego waveform, nazwy pliku oraz pokrętła volume control.

Przy pomocy pokrętłą możemy ustawić głośność odtwarzanego sampla. Transport Control jest również przydatny w sytuacji gdy włączymy odtwarzanie
jakiegoś dźwięku i przesuniemy całą listę. Możemy wtedy taki dźwięk bez problemu wyłączyć.

Gdy dźwięk jest odtwarzamy możemy również kliknąć na waveform przesuwając kursor odtwarzania do danego miejsca (nie działa w trybie
synchronicznego odtwarzania loop'a).

### Box Editor

W Box Editor -> DSP Effects 'Pitch — pitch shift (−12 to +12 semitones), without changing duration' słowo 'duration' zamienić na 'tempo'.

### Project Notes

W menu Help została dodana opcja 'Project Notes'. Umożliwia ona dodanie i edycję komentarzy do projektu.

### Save Meta

Do Loop Box Editor i Page box editor została dodana w toolbarze ikonka 'Save metadata to audio file'. Umożliwia ona zapisanie bezpośrednio
do pliku wszystkich informacji np: nazwa, ikona, kolor, bpm, group no, key i instrument. Można zatem zapisać własne ustawienia i nie
polegać na parserze dostarczonym przez program. Jeśli zapiszemy te dane bezpośrednio w pliku, dane te będą w użyte w przypadku
importowania danego pliku w przyszłości do projektu. W Page Editorze również został dodany przycisk 'Save Meta' w sekcji 'File'. Umożliwia
on zapis meta danych wszystkich zaznaczonych plików.

### Toolbar i All sounds off

Z toolbar'a została usunięta ikonka 'Panic button' (turn off all sounds) tak, żeby zrobić miejsce na ikonkę Media Explorer. W menu głównym w sekcji edit możemy
nadal wybrać opcję 'Turn off all sounds'.

### Master Volume

Na końcu toolbar'a sekcji głównej aplikacji dodano widget 'Master Volume'. Master volume zostało usunięte z okna opcji. Możemy tu ustawić
głośność odtwarzania całego projektu tak. Po prawej stronie od pokrętłą znajdują się wskaźniki głośności dla każdego z kanałów oraz
wskaźniki przesterowania. Jeśli dźwięk w dowolnym momencie będzie przesterowany wskaźniki zapalą się na czerwono. Umożliwi to nam
ustawienie odpowiedniej głośności projektu. Kliknięcie na wskaźnik przesterowania spowoduje jego wygaszenie.

### Page Editor

W Page Editorze została dodana opcja zaznaczania Shift + Click. Możemy zatem zaznaczyć pierwszy box, następnie przytrzymując Shift kliknąć na kolejny box, a wtedy wszystkie boxy pomiędzy pierwszym a drugim box'em zostaną zaznaczone.

### Timeline

W timeline została opcja zaznaczania wielu elementów używając kombinacji klawiszy Shift + Click (zaznaczenie wszystkiego pomiędzy zaznaczonymi elementami) lub Ctrl + Click (dodanie do zaznaczenia poszczególnych elementów.)

### Project Settings Window

- Usunięto pokrętło master volume (dodano odpowiedni widget do toolbara)
- Usunięto 'Strict Mode'
- Dodano 'Auto-Convert Tempo'
- Dodano przycisk 'Clear Media DB'

**Auto-Convert Tempo** - Jeśli ta opcja jest zaznaczona, wszystkie importowane loop'y zostaną automatycznie przekonwertowane do aktualnego tempa.

**Clear Media DB** - Wszystkie dane z media explorera przechowywane są w bazie danych. Umożliwia to szybkie wyświetlanie plików oraz ich import.
Obok przycisku znajduje się informacja na temat ilości zajmowanego miejsca przez bazę plików medialnych - podobnie jak w przypadku cache.
