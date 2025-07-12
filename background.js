// O(1) Tab History Manager using Doubly Linked List + Hash Map
class TabHistoryManager {
  constructor(maxSize = 10) {
    this.maxSize = maxSize;
    this.size = 0;
    this.tabMap = new Map(); // tabId -> node
    
    // Dummy head and tail for doubly linked list
    this.head = { prev: null, next: null, tabId: null };
    this.tail = { prev: null, next: null, tabId: null };
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  // O(1) - Add or move tab to front (most recently used)
  addTab(tabId) {
    if (this.tabMap.has(tabId)) {
      // Move existing tab to front
      const node = this.tabMap.get(tabId);
      this.removeNode(node);
      this.addToFront(node);
    } else {
      // Add new tab
      const node = { tabId, prev: null, next: null };
      this.tabMap.set(tabId, node);
      this.addToFront(node);
      this.size++;
      
      // Remove oldest if exceeding max size
      if (this.size > this.maxSize) {
        const oldest = this.tail.prev;
        this.removeNode(oldest);
        this.tabMap.delete(oldest.tabId);
        this.size--;
      }
    }
  }

  // O(1) - Remove tab
  removeTab(tabId) {
    if (this.tabMap.has(tabId)) {
      const node = this.tabMap.get(tabId);
      this.removeNode(node);
      this.tabMap.delete(tabId);
      this.size--;
    }
  }

  // O(1) - Get second most recent tab (last used)
  getLastUsedTab() {
    // Skip current tab (first) and get second
    if (this.head.next && this.head.next.next && this.head.next.next !== this.tail) {
      return this.head.next.next.tabId;
    }
    return null;
  }

  // Helper methods
  addToFront(node) {
    node.prev = this.head;
    node.next = this.head.next;
    this.head.next.prev = node;
    this.head.next = node;
  }

  removeNode(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }

  // Get all tabs in order (for debugging)
  getAllTabs() {
    const tabs = [];
    let current = this.head.next;
    while (current !== this.tail) {
      tabs.push(current.tabId);
      current = current.next;
    }
    return tabs;
  }
}

// Global instance
const tabHistory = new TabHistoryManager(10);
let currentActiveTab = null;

// Initialize extension
chrome.runtime.onStartup.addListener(() => {
  initializeTabHistory();
});

chrome.runtime.onInstalled.addListener(() => {
  initializeTabHistory();
});

// Initialize tab history with current tabs
async function initializeTabHistory() {
  try {
    const tabs = await chrome.tabs.query({});
    const activeTabs = tabs.filter(tab => tab.active);
    
    if (activeTabs.length > 0) {
      currentActiveTab = activeTabs[0].id;
      tabHistory.addTab(currentActiveTab);
    }
  } catch (error) {
    console.error('Error initializing tab history:', error);
  }
}

// Track tab activation
chrome.tabs.onActivated.addListener((activeInfo) => {
  const tabId = activeInfo.tabId;
  currentActiveTab = tabId;
  tabHistory.addTab(tabId);
});

// Track tab removal
chrome.tabs.onRemoved.addListener((tabId) => {
  tabHistory.removeTab(tabId);
  if (currentActiveTab === tabId) {
    currentActiveTab = null;
  }
});

// Handle keyboard shortcut
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'switch-tab') {
    const lastTabId = tabHistory.getLastUsedTab();
    
    if (lastTabId) {
      try {
        // Check if tab still exists
        const tab = await chrome.tabs.get(lastTabId);
        if (tab) {
          await chrome.tabs.update(lastTabId, { active: true });
          await chrome.windows.update(tab.windowId, { focused: true });
        }
      } catch (error) {
        // Tab doesn't exist anymore, remove from history
        tabHistory.removeTab(lastTabId);
        console.log('Tab no longer exists, removed from history');
      }
    }
  }
});

// Optional: Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getTabHistory') {
    sendResponse({
      tabs: tabHistory.getAllTabs(),
      current: currentActiveTab,
      lastUsed: tabHistory.getLastUsedTab()
    });
  }
});

// Handle window focus changes
chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId !== chrome.windows.WINDOW_ID_NONE) {
    try {
      const tabs = await chrome.tabs.query({ active: true, windowId });
      if (tabs.length > 0) {
        currentActiveTab = tabs[0].id;
        tabHistory.addTab(currentActiveTab);
      }
    } catch (error) {
      console.error('Error handling window focus:', error);
    }
  }
});

// Keep service worker alive
chrome.runtime.onConnect.addListener((port) => {
  port.onDisconnect.addListener(() => {
    // Connection closed
  });
});
