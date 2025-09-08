# AWS Deepgram Voice Agent Workshop

This workshop demonstrates how to build an AI voice agent using Deepgram's Voice Agent API integrated with AWS Bedrock for large language model (LLM) capabilities. The demo showcases two implementations: a client-side only version and a version with server-side function calling capabilities.

## Architecture Overview

- **Voice Processing**: Deepgram's Voice Agent API handles speech-to-text, text-to-speech, and real-time conversation flow
- **AI Intelligence**: AWS Bedrock provides the LLM capabilities (Claude, Nova models)
- **Function Calling**: Demonstrates how to extend the voice agent with custom functions for meeting scheduling
- **Real-time Communication**: WebSocket connection for seamless voice interaction

## Resources
- [Deepgram Voice Agent Documention](https://developers.deepgram.com/docs/voice-agent)

## Prerequisites

### 1. Deepgram API Access
- Sign up for a [Deepgram account](https://console.deepgram.com/signup)
- Select API Keys tab in Console
- Create a new API key and copy it for later use

### 2. AWS Account Setup
- Ensure you have an AWS account with **Amazon Bedrock access**
- Create an IAM user with appropriate Bedrock permissions
- Generate Access Key ID and Secret Access Key for programmatic access
- Note the AWS region you want to use (e.g., `us-east-2`)

### 3. AWS Bedrock Model Access
Request access to the following models in the AWS Bedrock console:
- **Claude Sonnet 4**: `us.anthropic.claude-sonnet-4-20250514-v1:0`
- **Nova Lite**: `us.amazon.nova-lite-v1:0`
- **Nova Pro**: `us.amazon.nova-pro-v1:0`

> ⚠️ **Note**: Model access requests may take some time to be approved. Plan accordingly.

### 4. Development Tools
- Node.js (for server-side demo)
- A local web server (we'll use `http-server`)
- ngrok (for server-side demo only)

## Initial Setup

### 1. Clone the Repository
```bash
git clone https://github.com/lawrence-deepgram/aws-deepgram-voice-agent-workshop-2025.git
cd aws-deepgram-voice-agent-workshop-2025
```

### 2. Configure API Keys

> ⚠️ **Security Warning**: Never commit API keys to version control. Consider using environment variables or a `.env` file for production applications.

#### Configure Deepgram API Key
Edit `client/js/main.js` at **line 42**:
```javascript
let ws = new WebSocket("wss://agent.deepgram.com/v1/agent/converse", ["token", "<your-deepgram-api-key-here>"]);
```

#### Configure AWS Credentials
Edit `client/js/config.js` at **lines 42-43**:
```javascript
access_key_id: "<your-access-key-id>",
secret_access_key: "<your-secret-access-key>"
```

## Part 1: Client-Side Demo

This demonstrates the basic voice agent functionality with client-side function calling.

### Setup
1. Install a local web server:
```bash
npm install -g http-server
```

2. Navigate to the client directory:
```bash
cd client/
```

3. Start the web server:
```bash
http-server -c-1
```

4. Open your browser and navigate to `http://localhost:8080`

### Usage
- Select your preferred AI model (Claude Sonnet 4, Nova Lite, or Nova Pro)
- Choose a voice (Thalia or Apollo)
- Click "Start Conversation"
- Try asking questions about health insurance or request to schedule a meeting
- The meeting scheduling function runs entirely on the client-side

### Sample Questions
- "Can you schedule a meeting for September 30th 2025 at 10am?"
- "What is the overall deductible for an individual and for a family?"
- "Are there services covered before meeting the deductible?"
- "What is the out-of-pocket limit for this plan?"

## Part 2: Server-Side Demo (Optional)

This extends the demo with server-side function calling, showing how to integrate external services and APIs.

### Prerequisites
- An [ngrok](https://ngrok.com/) account for creating a public tunnel to your local server
- All configurations from Part 1 completed

### Server Setup

1. Navigate to the server directory:
```bash
cd server/
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```
The server will run on `http://localhost:3000`

4. In a new terminal, create an ngrok tunnel:
```bash
ngrok http 3000
// or
ngrok http --url=<static_domain> 3000
```
Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

### Client Configuration Updates

1. **Update service endpoint** in `client/js/config.js` at **line 9**:
```javascript
const BASE_URL = '<your-ngrok-endpoint-here>';
```

2. **Enable server-side service** in `client/index.html` by uncommenting **line 11**:
```html
<script src="./js/service.js"></script>
```

3. **Switch to server-side function calling** in `client/js/config.js`:
   - Comment out the `add_meeting_client_side` function (lines 96-111)
   - Ensure the `add_meeting` function is uncommented (lines 112-131)
   - What's the difference between the 2?

4. **Update main.js** at **lines 348-349**:
```javascript
// state.callID = "123";
state.callID = await service.getCallID();
```

### Testing Server-Side Demo
1. Restart your client web server (`http-server -c-1` in the `client/` directory)
2. Open your browser to `http://localhost:8080`
3. Try scheduling a meeting - it will now be processed server-side
4. Check the server terminal logs to see the function calls being processed

## Project Structure

```
aws-deepgram-voice-agent-workshop-2025/
├── client/                 # Frontend application
│   ├── css/
│   │   └── styles.css     # Styling
│   ├── js/
│   │   ├── animation.js   # Visual animations
│   │   ├── audio.js       # Audio handling
│   │   ├── config.js      # Configuration & AWS credentials
│   │   ├── main.js        # Main application logic
│   │   └── service.js     # Server communication
│   └── index.html         # Main HTML file
└── server/                # Backend application (optional)
    ├── index.js           # Express server with meeting API
    ├── package.json       # Node.js dependencies
    └── package-lock.json
```

## Configuration Details

### Voice Agent Configuration
The voice agent is configured with:
- **Speech-to-Text**: Deepgram Nova-3 model
- **Text-to-Speech**: Deepgram Aura-2 voices (Thalia, Apollo)
- **LLM**: AWS Bedrock (Claude Sonnet 4, Nova Lite, or Nova Pro)
- **Custom Prompt**: Specialized for health insurance questions

### Function Calling
The demo includes a meeting scheduling function that demonstrates:
- Client-side vs server-side function execution
- Parameter handling and validation
- Response formatting and UI updates

## Troubleshooting

### Common Issues

1. **WebSocket Connection Fails**
   - Verify your Deepgram API key is correct
   - Check browser console for specific error messages

2. **AWS Bedrock Access Denied**
   - Ensure your AWS credentials have Bedrock permissions
   - Verify the selected model is approved in your AWS account
   - Check the AWS region matches your Bedrock setup

3. **Server-Side Demo Not Working**
   - Confirm ngrok tunnel is active and URL is updated
   - Check server console logs for errors
   - Verify all code changes in Part 2 setup are completed

4. **No Audio Playback**
   - Grant microphone permissions when prompted
   - Check browser audio settings
   - Try refreshing the page

### Debug Tips
- Open browser Developer Tools to view console logs
- Check the Network tab for WebSocket connection status
- Monitor server terminal output for function call processing

## Next Steps

This workshop provides a foundation for building production voice agents. Consider extending it with:
- Can you create client-side and server-side functions for deleting the appointments?
- Can you update the Speak model (TTS) of the Voice Agent? Or can you update the prompt so that it starts off generic and slowly becomes more specific over the course of a conversation?
- Can you trigger the Voice Agent to say a specific phrase? 
