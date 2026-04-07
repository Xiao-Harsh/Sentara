import axios from 'axios';
import Constants from 'expo-constants';

const LLM_API_URL = Constants.expoConfig?.extra?.llmApiUrl;
const LLM_API_KEY = Constants.expoConfig?.extra?.llmApiKey;

const llmClient = axios.create({
  baseURL: LLM_API_URL,
  headers: {
    'Authorization': `Bearer ${LLM_API_KEY}`,
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

/**
 * @deprecated Use getChatResponseWithAnalysis instead to prevent 429 errors.
 * Sends a deterministic prompt to analyze the emotional content of text.
 */
export const analyzeEmotion = async (messagesArray) => {
  if (!messagesArray || messagesArray.length === 0) return { emotion: 'Neutral', intensity: 'Low', trigger: 'Unknown' };

  try {
    const normalized = messagesArray.map(m => ({
      role: m.role || (m.sender === 'ai' ? 'assistant' : 'user'),
      content: m.content || m.text || ''
    }));
    const conversationText = normalized.map(m => `${m.role}: ${m.content}`).join('\n');
    const prompt = `
      You are a clinical psychiatrist analyzing a patient's emotional state from a conversation.
      Return ONLY a JSON object with this exact structure:
      {
        "emotion": "Happy | Angry | Sad | Neutral | Stress | Calm",
        "intensity": 1-10,
        "trigger": "A short description of what triggered this emotion",
        "suggestions": [
          { "title": "Short actionable title", "description": "1 sentence explanation exactly tailored to the user's role/vibe", "icon": "emoji icon" }
        ]
      }

      INTENSITY SCALE (1-10):
      - 1-2: Very Low — Barely any emotional charge. Casual chat.
      - 3-4: Low — Slight emotional tone. Mild feelings.
      - 5-6: Medium — Clear emotional state. Noticeable but manageable.
      - 7-8: High — Strong emotional state. User is clearly affected.
      - 9-10: Very High — Extreme distress, crisis-level, or overwhelming joy.

      CRITICAL: Most casual conversations should be 1-3. Only use 7-10 when the user explicitly expresses strong emotion. Do NOT inflate intensity.
      
      Conversation History:
      """
      ${conversationText}
      """
      
      Rules:
      1. No extra text or explanation. Valid JSON only.
      2. Provide exactly 3 highly specific, contextual suggestions.
      3. Be conservative with intensity — a user saying "not great" is Low or Medium, NOT High.
    `;

    const response = await llmClient.post('', {
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      response_format: { type: 'json_object' },
    });

    const rawContent = response.data.choices[0]?.message?.content;
    if (!rawContent) return { emotion: 'Neutral', intensity: 'Low', trigger: 'Unknown' };

    try {
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : rawContent.trim();
      const parsed = JSON.parse(jsonString);
      
      // Ensure intensity is a number
      if (typeof parsed.intensity === 'string') {
        const lower = parsed.intensity.toLowerCase();
        if (lower.includes('very low')) parsed.intensity = 2;
        else if (lower.includes('very high')) parsed.intensity = 9;
        else if (lower.includes('low')) parsed.intensity = 4;
        else if (lower.includes('high')) parsed.intensity = 8;
        else if (lower.includes('medium')) parsed.intensity = 5;
        else parsed.intensity = parseInt(parsed.intensity) || 5;
      }
      return parsed;
    } catch (parseError) {
      console.error('API JSON Parse Error:', parseError);
      return { emotion: 'Neutral', intensity: 'Low', trigger: 'Unknown' };
    }
  } catch (error) {
    console.error('API Error (analyzeEmotion):', error);
    return { emotion: 'Neutral', intensity: 'Low', trigger: 'Unknown' };
  }
};

/**
 * @deprecated Use getChatResponseWithAnalysis instead to prevent 429 errors.
 * Generates a clean, human-readable AI response.
 */
export const getChatResponse = async (messagesArray) => {
  if (!messagesArray || messagesArray.length === 0) return "I'm here to listen. How are you feeling?";

  try {
    const systemPrompt = {
      role: 'system',
      content: `You are Sentara, a warm, supportive, and highly capable AI psychologist and wellness companion. 
Your goal is to guide the user gently, offer practical advice, and listen with empathy.

Voice and Tone:
- Warm, polite, and deeply respectful at all times.
- Conversational but professional. Never be dismissive, edgy, or condescending.
- Keep responses concise (1-3 sentences max).
- NEVER use cliché AI therapist phrases like "It sounds like you're feeling...", "I'm hearing that...", or "I understand that...". Speak simply and directly.

Response Guidelines:
- Direct Help: If the user asks for advice or a solution, give them practical, actionable steps immediately. Do NOT answer a request for help with probing questions.
- Greetings: If the user says "Hi", respond with a warm, simple greeting like "Hi there! How is your day going?". Do not over-analyze greetings.
- Listening: If the user is venting, validate their feelings politely. Avoid repetitive clinical phrases.
- Corrections: If the user is upset with you, apologize sincerely and adjust your approach. Never argue.

Crucial Boundaries:
- Never patronize the user or assume they have a deep underlying issue if they make a simple statement.
- Do not over-analyze every simple message. Sometimes a casual remark is just a casual remark.`
    };

    const formattedMessages = messagesArray.map(msg => ({
      role: (msg.role === 'assistant' || msg.sender === 'ai') ? 'assistant' : 'user',
      content: msg.content || msg.text || ''
    }));

    const response = await llmClient.post('', {
      model: 'llama-3.1-8b-instant',
      messages: [systemPrompt, ...formattedMessages],
      temperature: 0.6,
    });

    return response.data.choices[0]?.message?.content || "I'm not sure how to respond, but I'm here for you.";
  } catch (error) {
    console.error('API Error (getChatResponse):', error);
    return "Sorry, I'm having trouble connecting. Let's try again in a moment.";
  }
};

export const transcribeAudio = async (audioUri) => {
  if (!audioUri) return "";
  try {
    const formData = new FormData();
    formData.append('file', {
      uri: audioUri,
      name: 'recording.m4a',
      type: 'audio/m4a'
    });
    formData.append('model', 'whisper-large-v3-turbo');

    const response = await axios.post('https://api.groq.com/openai/v1/audio/transcriptions', formData, {
      headers: {
        'Authorization': `Bearer ${LLM_API_KEY}`,
        'Content-Type': 'multipart/form-data',
      },
      timeout: 15000,
    });

    return response.data.text?.trim() || "";
  } catch (error) {
    console.error('API Error (transcribeAudio):', error?.response?.data || error.message);
    return "";
  }
};

/**
 * Combines chat response generation and emotion analysis into a single API call
 * to reduce the number of requests and prevent 429 Rate Limit errors.
 */
export const getChatResponseWithAnalysis = async (messagesArray) => {
  if (!messagesArray || messagesArray.length === 0) {
    return {
      text: "I'm here to listen. How are you feeling?",
      analysis: { emotion: 'Neutral', intensity: 'Low', trigger: 'Unknown', suggestions: [] }
    };
  }

  try {
    const formattedMessages = messagesArray
      .slice(-10)
      .map(msg => ({
        role: (msg.role === 'assistant' || msg.sender === 'ai') ? 'assistant' : 'user',
        content: msg.content || msg.text || ''
      }));

    // Extract conversation text for context in prompt
    const conversationText = formattedMessages.map(m => `${m.role}: ${m.content}`).join('\n');

    const combinedPrompt = `
      You are Sentara, a warm, supportive, and highly capable AI psychologist and wellness companion. 
      Your goal is to guide the user gently, offer practical advice, and listen with empathy.

      Voice and Tone:
      - Warm, polite, and deeply respectful at all times.
      - Conversational but professional. Never be dismissive, edgy, or condescending.
      - Keep responses concise (1-3 sentences max).
      - NEVER use cliché AI therapist phrases like "It sounds like you're feeling...", "I'm hearing that...", or "I understand that...". Speak simply and directly.

      Response Guidelines:
      - Direct Help: If the user asks for advice, give them practical, actionable steps immediately. Do NOT answer a request for help with probing questions.
      - Greetings: If the user says "Hi", respond with a warm, simple greeting like "Hi there! How is your day going?". Do not over-analyze greetings.
      - Listening: If the user is venting, validate their feelings politely. Avoid repetitive clinical phrases.
      - Corrections: If the user is upset with you, apologize sincerely and adjust. Never argue.

      Crucial Boundaries:
      - Never patronize the user or assume they have a deep underlying issue if they make a simple statement.
      - Do not over-analyze every simple message. Sometimes a casual remark is just a casual remark.
      
      Based on this conversation history:
      """
      ${conversationText}
      """
      
      Return ONLY a JSON object with this exact structure:
      {
        "response": "Your fluid, empathic clinical response following the guidelines above",
        "emotion": "Happy | Angry | Sad | Neutral | Stress | Calm",
        "intensity": 1-10,
        "trigger": "A short, precise description of what triggered this emotion",
        "suggestions": [
          { "title": "Short actionable title", "description": "1 sentence tailored to their root cause", "icon": "emoji icon" },
          { "title": "...", "description": "...", "icon": "..." },
          { "title": "...", "description": "...", "icon": "..." }
        ]
      }

      INTENSITY SCALE (1-10):
      - 1-2: Very Low — Barely any emotional charge. Casual chat.
      - 3-4: Low — Slight emotional tone. Mild feelings.
      - 5-6: Medium — Clear emotional state. Noticeable but manageable.
      - 7-8: High — Strong emotion. User is clearly affected.
      - 9-10: Very High — Extreme distress or overwhelming emotion. Crisis-level.

      Rules:
      1. Valid JSON only. Exactly 3 specific suggestions.
      2. No extra text outside the JSON.
      3. Be CONSERVATIVE with intensity. "I'm not feeling good" = 3 or 4, NOT 8.
    `;

    const model = 'llama-3.1-8b-instant';
    console.log('--- SENTARA DEBUG: Requesting model:', model);
    const response = await llmClient.post('', {
      model: model,
      messages: [{ role: 'user', content: combinedPrompt }],
      temperature: 0.6,
      response_format: { type: 'json_object' },
    });

    const rawContent = response.data.choices[0]?.message?.content;
    if (!rawContent) {
      throw new Error("Empty response from LLM");
    }

    try {
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : rawContent.trim();
      const parsedData = JSON.parse(jsonString);

      // Robust Intensity Normalization (String to Number if LLM fails format)
      let numericIntensity = 5;
      if (typeof parsedData.intensity === 'number') {
        numericIntensity = parsedData.intensity;
      } else if (typeof parsedData.intensity === 'string') {
        const lower = parsedData.intensity.toLowerCase().trim();
        if (lower.includes('very low')) numericIntensity = 2;
        else if (lower.includes('very high')) numericIntensity = 9;
        else if (lower.includes('low')) numericIntensity = 4;
        else if (lower.includes('high')) numericIntensity = 8;
        else if (lower.includes('medium')) numericIntensity = 5;
        else {
          const parsed = parseInt(lower, 10);
          numericIntensity = !isNaN(parsed) ? parsed : 5;
        }
      }

      return {
        text: parsedData.response || "I'm here for you.",
        analysis: {
          emotion: parsedData.emotion || 'Neutral',
          intensity: numericIntensity,
          trigger: parsedData.trigger || 'Unknown',
          suggestions: parsedData.suggestions || []
        }
      };
    } catch (parseError) {
      console.error('API JSON Parse Error in getChatResponseWithAnalysis:', parseError);
      return {
        text: "I'm not sure how to respond, but I'm here for you.",
        analysis: { emotion: 'Neutral', intensity: 'Low', trigger: 'Unknown', suggestions: [] }
      };
    }
  } catch (error) {
    console.error('API Error (getChatResponseWithAnalysis):', error.message);
    if (error.response && error.response.data) {
      console.error('Groq 429 Details:', JSON.stringify(error.response.data, null, 2));
    }
    return {
      text: "Sorry, I'm having trouble connecting right now. Let's try again in a moment.",
      analysis: { emotion: 'Neutral', intensity: 'Low', trigger: 'Unknown', suggestions: [] }
    };
  }
};

export const generateAssessmentReport = async (scores, freeText) => {
  try {
    const prompt = `
      You are an expert, empathetic clinical psychologist. Based on a user's recent wellness assessment, provide a 2 to 3 sentence description of their current mental state and personality at this moment. 
      Speak directly to the user (e.g., "You seem to be..."). Be warm, validating, and grounded. Do not use generic clichés.
      
      Here are their category scores (out of 100, where 100 is best) and a free-text thought they shared:
      Scores: ${JSON.stringify(scores)}
      User's current thought: "${freeText || 'None shared'}"
      
      Return ONLY a JSON object with this exact structure:
      {
        "report": "Your 2-3 sentence description here"
      }
    `;

    const model = 'llama-3.1-8b-instant';
    const response = await llmClient.post('', {
      model: model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.6,
      response_format: { type: 'json_object' },
    });

    const rawContent = response.data.choices[0]?.message?.content;
    if (!rawContent) return null;

    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : rawContent.trim();
    const parsedData = JSON.parse(jsonString);
    
    return parsedData.report || null;
  } catch (error) {
    console.error('API Error (generateAssessmentReport):', error.message);
    return null; // fallback to generic logic if fail
  }
};

export default {
  analyzeEmotion,
  getChatResponse,
  getChatResponseWithAnalysis,
  transcribeAudio,
  generateAssessmentReport,
};