/**
 * Chat Widget Script
 * This script creates a modern chat widget with markdown support, localStorage memory management, and session handling.
 */

// Initialize the chat widget
function createChatWidget({ webhookUrl }) {
  const chatContainer = document.createElement('div');
  chatContainer.id = 'chat-widget';
  chatContainer.style.position = 'fixed';
  chatContainer.style.bottom = '20px';
  chatContainer.style.right = '20px';
  chatContainer.style.width = '400px';
  chatContainer.style.height = '600px';
  chatContainer.style.border = '1px solid #ccc';
  chatContainer.style.borderRadius = '10px';
  chatContainer.style.overflow = 'hidden';
  chatContainer.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
  chatContainer.style.backgroundColor = '#fff';
  chatContainer.style.display = 'flex';
  chatContainer.style.flexDirection = 'column';

  // Header
  const header = document.createElement('div');
  header.style.backgroundColor = '#4a90e2';
  header.style.color = '#fff';
  header.style.padding = '10px';
  header.style.textAlign = 'center';
  header.style.fontSize = '18px';
  header.style.fontWeight = 'bold';
  header.textContent = 'Chat Widget';
  chatContainer.appendChild(header);

  // Messages container
  const messagesContainer = document.createElement('div');
  messagesContainer.style.flex = '1';
  messagesContainer.style.overflowY = 'auto';
  messagesContainer.style.padding = '10px';
  chatContainer.appendChild(messagesContainer);

  // Input area
  const inputContainer = document.createElement('div');
  inputContainer.style.display = 'flex';
  inputContainer.style.padding = '10px';
  inputContainer.style.borderTop = '1px solid #ccc';

  const input = document.createElement('textarea');
  input.style.flex = '1';
  input.style.border = '1px solid #ccc';
  input.style.borderRadius = '5px';
  input.style.padding = '10px';
  input.style.resize = 'none';
  input.style.height = '50px';
  input.placeholder = 'Type your message...';
  inputContainer.appendChild(input);

  const sendButton = document.createElement('button');
  sendButton.textContent = 'Send';
  sendButton.style.marginLeft = '10px';
  sendButton.style.padding = '10px 20px';
  sendButton.style.border = 'none';
  sendButton.style.borderRadius = '5px';
  sendButton.style.backgroundColor = '#4a90e2';
  sendButton.style.color = '#fff';
  sendButton.style.cursor = 'pointer';
  inputContainer.appendChild(sendButton);

  chatContainer.appendChild(inputContainer);

  // Append chat widget to body
  document.body.appendChild(chatContainer);

  // Load previous session
  const sessionId = localStorage.getItem('chatSessionId') || generateSessionId();
  localStorage.setItem('chatSessionId', sessionId);

  const loadPreviousSession = async () => {
    const response = await fetch(`${webhookUrl}?action=loadPreviousSession&sessionId=${sessionId}`);
    const data = await response.json();
    data.messages.forEach((message) => {
      addMessage(message.text, message.sender);
    });
  };

  const addMessage = (text, sender) => {
    const message = document.createElement('div');
    message.style.marginBottom = '10px';
    message.style.padding = '10px';
    message.style.borderRadius = '5px';
    message.style.backgroundColor = sender === 'user' ? '#4a90e2' : '#f1f1f1';
    message.style.color = sender === 'user' ? '#fff' : '#000';
    message.textContent = text;
    messagesContainer.appendChild(message);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  };

  const sendMessage = async () => {
    const text = input.value.trim();
    if (!text) return;

    addMessage(text, 'user');
    input.value = '';

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'sendMessage', sessionId, text }),
    });
    const data = await response.json();
    addMessage(data.text, 'bot');
  };

  sendButton.addEventListener('click', sendMessage);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Clear session
  const clearSession = () => {
    localStorage.removeItem('chatSessionId');
    messagesContainer.innerHTML = '';
  };

  // Load previous session on initialization
  loadPreviousSession();

  return { clearSession };
}

// Generate a unique session ID
function generateSessionId() {
  return `session-${Math.random().toString(36).substr(2, 9)}`;
}

// Initialize the chat widget
createChatWidget({
  webhookUrl: 'https://n8n.innovasoftpro.dev/webhook/9e27f125-ae02-4982-98da-039e0111b057/chat',
});
