// Offline Chat Application - Pure JavaScript Implementation
// Uses WebRTC for peer-to-peer communication and localStorage for data persistence

class OfflineChatApp {
    constructor() {
        this.currentUser = null;
        this.contacts = [];
        this.messages = {};
        this.activeChat = null;
        this.peerConnection = null;
        this.dataChannel = null;
        this.myPeerCode = null;
        
        // Initialize the app
        this.init();
    }

    init() {
        this.loadFromStorage();
        this.setupEventListeners();
        this.checkLoginStatus();
    }

    // Storage Management
    loadFromStorage() {
        const savedUser = localStorage.getItem('offlineChat_user');
        const savedContacts = localStorage.getItem('offlineChat_contacts');
        const savedMessages = localStorage.getItem('offlineChat_messages');

        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
        }

        if (savedContacts) {
            this.contacts = JSON.parse(savedContacts);
        }

        if (savedMessages) {
            this.messages = JSON.parse(savedMessages);
        }
    }

    saveToStorage() {
        if (this.currentUser) {
            localStorage.setItem('offlineChat_user', JSON.stringify(this.currentUser));
        }
        localStorage.setItem('offlineChat_contacts', JSON.stringify(this.contacts));
        localStorage.setItem('offlineChat_messages', JSON.stringify(this.messages));
    }

    clearStorage() {
        localStorage.removeItem('offlineChat_user');
        localStorage.removeItem('offlineChat_contacts');
        localStorage.removeItem('offlineChat_messages');
    }

    // Event Listeners Setup
    setupEventListeners() {
        // Login
        document.getElementById('login-btn').addEventListener('click', () => this.login());
        document.getElementById('username-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.login();
        });

        // Logout
        document.getElementById('logout-btn').addEventListener('click', () => this.logout());

        // Add Contact
        document.getElementById('add-contact-btn').addEventListener('click', () => this.showAddContactModal());
        document.getElementById('generate-code-btn').addEventListener('click', () => this.generatePeerCode());
        document.getElementById('add-contact-submit').addEventListener('click', () => this.addContact());
        document.getElementById('close-modal-btn').addEventListener('click', () => this.hideAddContactModal());

        // Send Message
        document.getElementById('send-btn').addEventListener('click', () => this.sendMessage());
        document.getElementById('message-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        // Close modal on outside click
        document.getElementById('add-contact-modal').addEventListener('click', (e) => {
            if (e.target.id === 'add-contact-modal') {
                this.hideAddContactModal();
            }
        });
    }

    // Authentication
    checkLoginStatus() {
        if (this.currentUser) {
            this.showChatScreen();
        } else {
            this.showLoginScreen();
        }
    }

    login() {
        const usernameInput = document.getElementById('username-input');
        const username = usernameInput.value.trim();

        if (!username) {
            alert('Please enter a username');
            return;
        }

        this.currentUser = {
            id: this.generateUserId(),
            username: username,
            loginTime: new Date().toISOString()
        };

        this.saveToStorage();
        this.showChatScreen();
        this.renderContacts();
    }

    logout() {
        if (confirm('Are you sure you want to logout?')) {
            this.currentUser = null;
            this.activeChat = null;
            this.clearStorage();
            this.showLoginScreen();
            document.getElementById('username-input').value = '';
        }
    }

    generateUserId() {
        return 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }

    // Screen Management
    showLoginScreen() {
        document.getElementById('login-screen').classList.add('active');
        document.getElementById('chat-screen').classList.remove('active');
    }

    showChatScreen() {
        document.getElementById('login-screen').classList.remove('active');
        document.getElementById('chat-screen').classList.add('active');
        document.getElementById('current-user').textContent = this.currentUser.username;
    }

    // Contact Management
    showAddContactModal() {
        document.getElementById('add-contact-modal').classList.add('active');
        document.getElementById('contact-code-input').value = '';
        document.getElementById('my-qr-code').textContent = 'Click "Generate My Code" to get your sharing code';
    }

    hideAddContactModal() {
        document.getElementById('add-contact-modal').classList.remove('active');
    }

    generatePeerCode() {
        // Generate a unique code that represents this user
        const codeData = {
            userId: this.currentUser.id,
            username: this.currentUser.username,
            timestamp: Date.now()
        };
        
        // Encode to base64 for easy sharing
        this.myPeerCode = btoa(JSON.stringify(codeData));
        document.getElementById('my-qr-code').textContent = this.myPeerCode;
        
        // Also copy to clipboard
        navigator.clipboard.writeText(this.myPeerCode).then(() => {
            alert('Code copied to clipboard! Share this with your friend.');
        }).catch(() => {
            alert('Code generated. Please copy it manually.');
        });
    }

    addContact() {
        const codeInput = document.getElementById('contact-code-input');
        const code = codeInput.value.trim();

        if (!code) {
            alert('Please enter a contact code');
            return;
        }

        try {
            // Decode the contact's code
            const decodedData = JSON.parse(atob(code));
            
            if (!decodedData.userId || !decodedData.username) {
                throw new Error('Invalid code format');
            }

            // Check if contact already exists
            if (this.contacts.some(c => c.id === decodedData.userId)) {
                alert('This contact is already in your list');
                return;
            }

            // Check if trying to add self
            if (decodedData.userId === this.currentUser.id) {
                alert('You cannot add yourself as a contact');
                return;
            }

            // Add the contact
            const newContact = {
                id: decodedData.userId,
                username: decodedData.username,
                addedAt: new Date().toISOString(),
                status: 'offline' // Default status for offline mode
            };

            this.contacts.push(newContact);
            this.saveToStorage();
            this.renderContacts();
            
            // Initialize messages array for this contact
            if (!this.messages[newContact.id]) {
                this.messages[newContact.id] = [];
            }

            alert(`Contact "${decodedData.username}" added successfully!`);
            this.hideAddContactModal();

        } catch (error) {
            alert('Invalid contact code. Please check and try again.');
            console.error('Error adding contact:', error);
        }
    }

    renderContacts() {
        const contactsList = document.getElementById('contacts-list');
        contactsList.innerHTML = '';

        if (this.contacts.length === 0) {
            contactsList.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">No contacts yet. Add someone to start chatting!</p>';
            return;
        }

        this.contacts.forEach(contact => {
            const contactEl = document.createElement('div');
            contactEl.className = 'contact-item';
            if (this.activeChat && this.activeChat.id === contact.id) {
                contactEl.classList.add('active');
            }
            
            contactEl.innerHTML = `
                <div class="contact-name">${this.escapeHtml(contact.username)}</div>
                <div class="contact-status">${contact.status}</div>
            `;
            
            contactEl.addEventListener('click', () => this.selectContact(contact));
            contactsList.appendChild(contactEl);
        });
    }

    selectContact(contact) {
        this.activeChat = contact;
        document.getElementById('active-chat-name').textContent = contact.username;
        document.getElementById('message-input').disabled = false;
        document.getElementById('send-btn').disabled = false;
        
        this.renderContacts(); // Update active state
        this.renderMessages();
    }

    // Message Management
    sendMessage() {
        const messageInput = document.getElementById('message-input');
        const messageText = messageInput.value.trim();

        if (!messageText || !this.activeChat) {
            return;
        }

        const message = {
            id: this.generateMessageId(),
            senderId: this.currentUser.id,
            receiverId: this.activeChat.id,
            content: messageText,
            timestamp: new Date().toISOString(),
            status: 'sent'
        };

        // Save message
        if (!this.messages[this.activeChat.id]) {
            this.messages[this.activeChat.id] = [];
        }
        this.messages[this.activeChat.id].push(message);
        this.saveToStorage();

        // Render message
        this.renderMessages();
        messageInput.value = '';

        // In a real P2P scenario, we would send via WebRTC here
        // For offline demo, we simulate receiving a response after delay
        this.simulateResponse(message);
    }

    simulateResponse(sentMessage) {
        // Simulate a response after 1-3 seconds for demo purposes
        const responses = [
            "Got it!",
            "Thanks for the message",
            "Okay",
            "Interesting!",
            "Let me think about that",
            "Sure thing!",
            "👍",
            "Nice!"
        ];
        
        setTimeout(() => {
            const responseMessage = {
                id: this.generateMessageId(),
                senderId: this.activeChat.id,
                receiverId: this.currentUser.id,
                content: responses[Math.floor(Math.random() * responses.length)],
                timestamp: new Date().toISOString(),
                status: 'received'
            };

            this.messages[this.activeChat.id].push(responseMessage);
            this.saveToStorage();
            this.renderMessages();
        }, 1000 + Math.random() * 2000);
    }

    generateMessageId() {
        return 'msg_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }

    renderMessages() {
        const messagesContainer = document.getElementById('messages-container');
        messagesContainer.innerHTML = '';

        if (!this.activeChat) {
            messagesContainer.innerHTML = '<p style="color: #999; text-align: center; padding: 40px;">Select a contact to start chatting</p>';
            return;
        }

        const chatMessages = this.messages[this.activeChat.id] || [];

        if (chatMessages.length === 0) {
            messagesContainer.innerHTML = '<p style="color: #999; text-align: center; padding: 40px;">No messages yet. Start the conversation!</p>';
            return;
        }

        chatMessages.forEach(msg => {
            const messageEl = document.createElement('div');
            const isSent = msg.senderId === this.currentUser.id;
            messageEl.className = `message ${isSent ? 'sent' : 'received'}`;
            
            const time = new Date(msg.timestamp).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
            });

            messageEl.innerHTML = `
                <div class="message-bubble">${this.escapeHtml(msg.content)}</div>
                <div class="message-time">${time}</div>
            `;
            
            messagesContainer.appendChild(messageEl);
        });

        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Utility Functions
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Peer-to-Peer Connection (WebRTC placeholder)
    // In a full implementation, this would handle actual P2P connections
    async initializePeerConnection() {
        // This is a placeholder for WebRTC implementation
        // For offline demo, we use localStorage simulation
        console.log('Peer connection initialized (simulation mode)');
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.chatApp = new OfflineChatApp();
});
