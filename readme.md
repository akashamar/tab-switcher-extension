# Chrome Extension - Quick Tab Switcher

## Installation Instructions

1. **Create Extension Files**
   - Create a new folder called `tab-switcher-extension`
   - Create the following files in this folder:
     - `manifest.json` (use the first code block)
     - `background.js` (use the second code block)
     - `content.js` (use the third code block)

2. **Load Extension in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `tab-switcher-extension` folder

3. **Set Up Keyboard Shortcut**
   - Go to `chrome://extensions/shortcuts`
   - Find "Quick Tab Switcher"
   - Set the shortcut to `Alt+Q` (or customize as needed)

## Usage

- Press `Alt+Q` (Option+Q on Mac) to switch to the last used tab
- The extension remembers the last 10 tabs you've used
- Works across all windows

## How It Works

### O(1) Time Complexity Architecture

The extension uses a **doubly-linked list combined with a hash map** for optimal performance:

- **Hash Map**: `tabId → node` for O(1) lookup
- **Doubly-Linked List**: Maintains order of recently used tabs
- **Operations**:
  - **Insert/Update**: O(1) - Add new tab or move existing to front
  - **Delete**: O(1) - Remove tab when closed
  - **Switch**: O(1) - Get second most recent tab

### Data Structure Details

```
Most Recent → [Tab A] ↔ [Tab B] ↔ [Tab C] ↔ ... ↔ [Tab J] ← Least Recent
                ↑                    ↑
            Current Tab          Last Used Tab
```

- Current active tab is always at the front
- Alt+Q switches to the second node (last used)
- When switching, the accessed tab moves to front
- Automatically removes tabs that are closed
- Maintains maximum of 10 tabs in history

## Features

- **Fast Switching**: O(1) time complexity for all operations
- **Memory Efficient**: Fixed size history (configurable)
- **Cross-Window**: Works across multiple Chrome windows
- **Auto-Cleanup**: Removes closed tabs from history
- **Persistent**: Maintains history across browser sessions

## Troubleshooting

- If shortcut doesn't work, check `chrome://extensions/shortcuts`
- Make sure the extension is enabled in `chrome://extensions/`
- The extension needs permission to access tabs

## Customization

You can modify the `maxSize` parameter in `background.js` to store more or fewer tabs:

```javascript
const tabHistory = new TabHistoryManager(20); // Store 20 tabs instead of 10
```
