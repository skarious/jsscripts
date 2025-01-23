// n8n-chat.js
export function createChat(config) {
    const { webhookUrl, title = "Chat de Soporte", welcomeMessage = "¡Hola! ¿En qué puedo ayudarte?" } = config;

    // Generar un sessionId único para el usuario
    const sessionId = generateSessionId();

    // Crear el contenedor del chat
    const chatContainer = document.createElement('div');
    chatContainer.className = 'n8n-chat-container';

    // Crear el encabezado del chat
    const chatHeader = document.createElement('div');
    chatHeader.className = 'n8n-chat-header';
    chatHeader.innerHTML = `
        <span>${title}</span>
        <button id="n8n-chat-toggle">−</button>
    `;

    // Crear el cuerpo del chat
    const chatBody = document.createElement('div');
    chatBody.className = 'n8n-chat-body';

    // Crear el pie del chat
    const chatFooter = document.createElement('div');
    chatFooter.className = 'n8n-chat-footer';

    // Crear el input del chat
    const chatInput = document.createElement('input');
    chatInput.className = 'n8n-chat-input';
    chatInput.placeholder = 'Escribe un mensaje...';

    // Crear el botón de enviar
    const chatButton = document.createElement('button');
    chatButton.className = 'n8n-chat-button';
    chatButton.textContent = 'Enviar';

    // Añadir elementos al pie del chat
    chatFooter.appendChild(chatInput);
    chatFooter.appendChild(chatButton);

    // Añadir elementos al contenedor del chat
    chatContainer.appendChild(chatHeader);
    chatContainer.appendChild(chatBody);
    chatContainer.appendChild(chatFooter);

    // Añadir el chat al cuerpo del documento
    document.body.appendChild(chatContainer);

    // Mostrar mensaje de bienvenida
    addMessage('bot', welcomeMessage);

    // Función para minimizar/maximizar el chat
    const toggleButton = chatHeader.querySelector('#n8n-chat-toggle');
    toggleButton.addEventListener('click', () => {
        chatContainer.classList.toggle('minimized');
        toggleButton.textContent = chatContainer.classList.contains('minimized') ? '+' : '−';
    });

    // Función para enviar mensajes
    chatButton.addEventListener('click', async () => {
        const message = chatInput.value.trim();
        if (message) {
            addMessage('user', message);
            chatInput.value = '';

            try {
                // Enviar el mensaje junto con el sessionId
                const response = await fetch(webhookUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ message, sessionId }), // Incluir sessionId
                });

                // Verificar si la respuesta es válida
                if (!response.ok) {
                    throw new Error(`Error: ${response.status} - ${response.statusText}`);
                }

                // Procesar la respuesta JSON
                const data = await response.json();
                if (data.response) {
                    addMessage('bot', data.response); // Mostrar la respuesta en el chat
                } else {
                    throw new Error("La respuesta no contiene un mensaje válido.");
                }
            } catch (error) {
                console.error('Error al enviar el mensaje:', error);
                addMessage('bot', 'Lo siento, hubo un error al procesar tu mensaje.');
            }
        }
    });

    // Función para añadir mensajes al chat
    function addMessage(sender, text) {
        const messageElement = document.createElement('div');
        messageElement.className = `n8n-chat-message ${sender}`;

        const messageContent = document.createElement('div');
        messageContent.className = 'n8n-chat-message-content';
        messageContent.textContent = text;

        const messageTime = document.createElement('div');
        messageTime.className = 'n8n-chat-message-time';
        messageTime.textContent = new Date().toLocaleTimeString();

        messageElement.appendChild(messageContent);
        messageElement.appendChild(messageTime);
        chatBody.appendChild(messageElement);

        // Scroll al final del chat
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    // Función para generar un sessionId único
    function generateSessionId() {
        return 'session-' + Math.random().toString(36).substr(2, 9);
    }
}
