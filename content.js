// Content script for additional keyboard handling
// This provides backup keyboard handling if needed

let isProcessing = false;

// Listen for keyboard events
document.addEventListener('keydown', async (event) => {
  // Check for Alt+Q (Option+Q on Mac)
  if (event.altKey && event.key.toLowerCase() === 'q' && !isProcessing) {
    event.preventDefault();
    isProcessing = true;
    
    try {
      // Send message to background script
      await chrome.runtime.sendMessage({ action: 'switchTab' });
    } catch (error) {
      console.error('Error sending switch tab message:', error);
    }
    
    // Reset processing flag after a short delay
    setTimeout(() => {
      isProcessing = false;
    }, 100);
  }
});

// Optional: Add visual feedback
function showSwitchFeedback() {
  const feedback = document.createElement('div');
  feedback.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #333;
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 12px;
    z-index: 10000;
    font-family: Arial, sans-serif;
  `;
  feedback.textContent = 'Switching tab...';
  document.body.appendChild(feedback);
  
  setTimeout(() => {
    if (feedback.parentNode) {
      feedback.parentNode.removeChild(feedback);
    }
  }, 1000);
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'tabSwitched') {
    showSwitchFeedback();
    sendResponse({ success: true });
  }
});

// Keep connection alive
const port = chrome.runtime.connect({ name: 'content-script' });
port.onDisconnect.addListener(() => {
  // Reconnect if needed
  setTimeout(() => {
    const newPort = chrome.runtime.connect({ name: 'content-script' });
  }, 1000);
});
