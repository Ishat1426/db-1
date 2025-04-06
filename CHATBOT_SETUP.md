# Chatbot Integration Setup Guide

This guide provides instructions for setting up the FitGenie chatbot in Diet Buddy using Google's Gemini API.

## Prerequisites

- Diet Buddy application up and running
- Google Gemini API key ([Get one here](https://makersuite.google.com/))
- Node.js and npm installed

## Installation Steps

### 1. Backend Setup

1. Install the required dependencies:
   ```bash
   cd DietBuddy/backend
   npm install @google/generative-ai
   ```

2. Configure your environment variables:
   ```bash
   # Open your .env file
   nano .env
   
   # Add the following line:
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. Restart your backend server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup

The frontend components should already be integrated with the Diet Buddy application. No additional frontend setup is required.

## Testing the Chatbot

1. Open your Diet Buddy application in a browser
2. You should see a chat icon in the bottom-right corner of the screen
3. Click on the icon to open the chatbot interface
4. Type a fitness or nutrition-related question and press enter
5. Verify that you receive a response from the chatbot

## Troubleshooting

If you encounter issues with the chatbot integration, check the following:

1. **Chatbot not responding**:
   - Verify your Gemini API key is correct
   - Check the backend console for any errors
   - Ensure you have an active internet connection

2. **CORS issues**:
   - Verify the backend CORS configuration is correctly set up
   - Check that the frontend is making requests to the correct API endpoint

3. **Rate limiting**:
   - Gemini API may have rate limits. Check if you've exceeded your quota

## Customization

To customize the chatbot:

1. **Modify the prompt**:
   - Edit the prompt in `controllers/chatbotController.js` to change how the AI responds
   - Adjust the tone, style, or response format

2. **UI Changes**:
   - Modify the `components/Chatbot.jsx` file to change the appearance or behavior

3. **Chatbot name and branding**:
   - Change the name "FitGenie" in the UI and prompts to match your branding

## Support

If you need further assistance, please contact the development team or raise an issue in the project repository. 