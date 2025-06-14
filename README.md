# WhatsApp Chatbot

This project is a simple chatbot implementation for WhatsApp using the `whatsapp-web.js` library. The structure of the project follows clean code principles, ensuring that each directory has a specific purpose and that the code is organized and maintainable.

## Project Structure

```
whatsapp-chatbot
├── src
│   ├── config          # Configuration files
│   │   └── environment.ts
│   ├── core            # Core logic and types
│   │   ├── client.ts
│   │   └── types.ts
│   ├── handlers        # Message handling logic
│   │   └── messageHandler.ts
│   ├── services        # Business logic for the chatbot
│   │   └── botService.ts
│   ├── utils           # Utility functions
│   │   └── logger.ts
│   └── app.ts         # Entry point of the application
├── .env.example        # Environment variable template
├── .gitignore          # Git ignore file
├── package.json        # NPM configuration
├── tsconfig.json       # TypeScript configuration
└── README.md           # Project documentation
```

## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd whatsapp-chatbot
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   - Copy the `.env.example` file to `.env` and fill in the required values.

4. **Run the application:**
   ```bash
   npm start
   ```

## Usage

Once the application is running, it will connect to WhatsApp and start listening for incoming messages. You can customize the bot's responses by modifying the logic in `src/services/botService.ts` and `src/handlers/messageHandler.ts`.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any suggestions or improvements.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.