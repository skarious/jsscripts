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
    chatButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
        </svg>
        Enviar
    `;

    // Crear el botón de finalizar chat
    const endChatButton = document.createElement('button');
    endChatButton.className = 'n8n-chat-end-button';
    endChatButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
        Finalizar
    `;

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

    // Función para minimizar/maximizar el chat
    const toggleButton = chatHeader.querySelector('#n8n-chat-toggle');
    toggleButton.addEventListener('click', () => {
        chatContainer.classList.toggle('minimized');
        toggleButton.textContent = chatContainer.classList.contains('minimized') ? '+' : '−';
    });

    // Función para enviar mensajes
    const sendMessage = async () => {
        const message = chatInput.value.trim();
        if (message) {
            addMessage('user', message);
            chatInput.value = '';

            // Mostrar indicador de "escribiendo"
            showTypingIndicator();

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

                // Ocultar indicador de "escribiendo"
                hideTypingIndicator();

                // Manejar diferentes formatos de respuesta
                let botMessage = data.response || data.message || data.text || "Lo siento, no entendí la respuesta.";
                addMessage('bot', botMessage); // Mostrar la respuesta en el chat
            } catch (error) {
                console.error('Error al enviar el mensaje:', error);
                hideTypingIndicator();
                addMessage('bot', 'Lo siento, hubo un error al procesar tu mensaje.');
            }
        }
    };

    // Enviar mensaje al hacer clic en el botón
    chatButton.addEventListener('click', sendMessage);

    // Enviar mensaje al presionar Enter
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
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

        // Convertir Markdown a HTML si el mensaje es del bot
        if (sender === 'bot') {
            messageContent.innerHTML = marked.parse(text); // Usar marked para renderizar Markdown
        } else {
            messageContent.textContent = text; // Mostrar texto plano para el usuario
        }

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

    // Función para mostrar el indicador de "escribiendo"
    function showTypingIndicator() {
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'n8n-chat-typing-indicator';
        typingIndicator.innerHTML = `
            <span></span>
            <span></span>
            <span></span>
        `;
        chatBody.appendChild(typingIndicator);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    // Función para ocultar el indicador de "escribiendo"
    function hideTypingIndicator() {
        const typingIndicator = chatBody.querySelector('.n8n-chat-typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    // Función para generar un sessionId único
    function generateSessionId() {
        return 'session-' + Math.random().toString(36).substr(2, 9);
    }
}
