document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('.chat-button');
  
  buttons.forEach(button => {
    button.addEventListener('click', (event) => {
      const action = event.target.dataset.action;
      handleAction(action);
    });
  });

  const handleAction = (action) => {
    switch (action) {
      case 'sendMessage':
        sendMessage();
        break;
      case 'clearChat':
        clearChat();
        break;
      default:
        console.error('Acción no reconocida:', action);
    }
  };

  const sendMessage = () => {
    const messageInput = document.querySelector('#messageInput');
    const message = messageInput.value.trim();
    if (message) {
      const chatBox = document.querySelector('#chatBox');
      const newMessage = document.createElement('div');
      newMessage.classList.add('chat-message', 'user-message');
      newMessage.textContent = message;
      chatBox.appendChild(newMessage);
      messageInput.value = '';
    }
  };

  const clearChat = () => {
    const chatBox = document.querySelector('#chatBox');
    chatBox.innerHTML = '';
  };
});
