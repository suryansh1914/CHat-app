# 🔐 Offline Chat App

A fully functional offline messaging application built with pure HTML, CSS, and JavaScript.

## Features

- **No Internet Required**: Works completely offline using browser's localStorage
- **User Authentication**: Simple username-based login system
- **Contact Management**: Add contacts by exchanging unique codes
- **Real-time Messaging**: Send and receive messages with timestamps
- **Responsive Design**: Works on desktop and mobile devices
- **Data Persistence**: All data saved locally in browser storage
- **Beautiful UI**: Modern gradient design with smooth animations

## How to Use

### Method 1: Direct File Opening
1. Open `public/index.html` in any modern web browser
2. Enter your username and click "Start Chatting"
3. Click "+ Add Contact" to generate your unique code
4. Share your code with a friend (or use two browsers to test)
5. Exchange codes to add each other as contacts
6. Start chatting!

### Method 2: Using a Local Server
```bash
# Using Python 3
cd public
python3 -m http.server 8000

# Using Node.js (if http-server is installed)
npx http-server public -p 8000
```

Then open `http://localhost:8000` in your browser.

## Testing the App

To test the contact feature:
1. Open the app in two different browser windows/tabs
2. Login with different usernames in each window
3. In first window: Generate your code and copy it
4. In second window: Paste the code and add contact
5. Repeat for the other direction
6. Now you can chat between both windows!

## Technical Details

- **Storage**: Uses localStorage for persistent data
- **No Dependencies**: Pure vanilla JavaScript, no frameworks
- **Security**: Input sanitization to prevent XSS attacks
- **Code Sharing**: Base64 encoded user information for contact exchange

## File Structure

```
/workspace
├── public/
│   ├── index.html    # Main HTML file
│   ├── style.css     # Styling and animations
│   └── app.js        # Application logic
├── README.md         # This file
└── ...
```

## Browser Compatibility

Works on all modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

## Limitations

- Data is stored locally per browser/device
- Contacts must be added manually via code exchange
- No server-side backup (clearing browser data removes chats)

## Future Enhancements

Potential improvements for production use:
- WebRTC for true peer-to-peer messaging
- QR code generation for easier contact sharing
- Message encryption for privacy
- Export/import chat history
- Group chat support

## License

MIT License - See LICENSE file for details