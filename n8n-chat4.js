// n8n-chat.js
export function createChat(config) {
    const { webhookUrl, title = "Chat de Soporte", welcomeMessage = "¡Hola! ¿En qué puedo ayudarte?" } = config;

    // Generar un sessionId único para el usuario
    const sessionId = generateSessionId();

    // Cargar el historial del chat desde localStorage
    let chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];

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

    // Crear el botón de finalizar chat
    const endChatButton = document.createElement('button');
    endChatButton.className = 'n8n-chat-end-button';
    endChatButton.textContent = 'Finalizar chat';

    // Añadir elementos al pie del chat
    chatFooter.appendChild(chatInput);
    chatFooter.appendChild(chatButton);
    chatFooter.appendChild(endChatButton);

    // Añadir elementos al contenedor del chat
    chatContainer.appendChild(chatHeader);
    chatContainer.appendChild(chatBody);
    chatContainer.appendChild(chatFooter);

    // Añadir el chat al cuerpo del documento
    document.body.appendChild(chatContainer);

    // Mostrar el historial del chat al cargar la página
    chatHistory.forEach(msg => addMessage(msg.sender, msg.text));

    // Mostrar mensaje de bienvenida si no hay historial
    if (chatHistory.length === 0) {
        addMessage('bot', welcomeMessage);
    }

    // Temporizador para borrar el historial por inactividad
    let inactivityTimer;

    const resetInactivityTimer = () => {
        // Reiniciar el temporizador
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
            // Borrar el historial del chat de localStorage
            localStorage.removeItem('chatHistory');
            // Limpiar el cuerpo del chat
            chatBody.innerHTML = '';
            // Mostrar un mensaje de despedida
            addMessage('bot', 'La conversación ha finalizado por inactividad.');
        }, 30 * 60 * 1000); // 30 minutos de inactividad
    };

    // Iniciar el temporizador al cargar la página
    resetInactivityTimer();

    // Reiniciar el temporizador con la interacción del usuario
    chatInput.addEventListener('input', resetInactivityTimer);
    chatButton.addEventListener('click', resetInactivityTimer);

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

                // Manejar diferentes formatos de respuesta
                let botMessage = data.response || data.message || data.text || "Lo siento, no entendí la respuesta.";
                addMessage('bot', botMessage); // Mostrar la respuesta en el chat
            } catch (error) {
                console.error('Error al enviar el mensaje:', error);
                addMessage('bot', 'Lo siento, hubo un error al procesar tu mensaje.');
            }
        }
    });

    // Función para finalizar el chat
    endChatButton.addEventListener('click', () => {
        // Borrar el historial del chat de localStorage
        localStorage.removeItem('chatHistory');
        // Limpiar el cuerpo del chat
        chatBody.innerHTML = '';
        // Mostrar un mensaje de despedida
        addMessage('bot', 'Gracias por usar nuestro chat. ¡Hasta luego!');
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

        // Guardar el mensaje en el historial
        chatHistory.push({ sender, text });
        localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    }

    // Función para generar un sessionId único
    function generateSessionId() {
        return 'session-' + Math.random().toString(36).substr(2, 9);
    }
}
