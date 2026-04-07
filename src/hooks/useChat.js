import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getChatResponseWithAnalysis } from '../services/llmApi';
import { saveEmotion } from '../services/dbService';
import { useAuth } from './useAuth';

const CHAT_STORAGE_KEY = '@sentara_chat_history';

export const useChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Load chat history when user changes
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!user?.uid) return;
      setIsInitializing(true);
      try {
        const storageKey = `${CHAT_STORAGE_KEY}_${user.uid}`;
        const storedMessages = await AsyncStorage.getItem(storageKey);
        if (storedMessages) {
          const parsed = JSON.parse(storedMessages);
          if (parsed && parsed.length > 0) {
            setMessages(parsed);
          }
        } else {
          setMessages([
            {
              id: '1',
              text: "Hello! I'm Sentara. Tell me how you're feeling, and I'll analyze the emotions behind your words.",
              sender: 'ai',
              timestamp: Date.now(),
            },
          ]);
        }
      } catch (error) {
        console.error('Failed to load chat history:', error);
      } finally {
        setIsInitializing(false);
      }
    };
    loadChatHistory();
  }, [user?.uid]);

  // Save chat history whenever messages change
  useEffect(() => {
    if (!isInitializing && messages.length > 0 && user?.uid) {
      const storageKey = `${CHAT_STORAGE_KEY}_${user.uid}`;
      AsyncStorage.setItem(storageKey, JSON.stringify(messages)).catch(err => {
        console.error('Failed to save chat history:', err);
      });
    }
  }, [messages, isInitializing, user?.uid]);

  const clearHistory = useCallback(async () => {
    if (!user?.uid) return;
    try {
      const storageKey = `${CHAT_STORAGE_KEY}_${user.uid}`;
      await AsyncStorage.removeItem(storageKey);
      setMessages([
        {
          id: '1',
          text: "Hello! I'm Sentara. Tell me how you're feeling, and I'll analyze the emotions behind your words.",
          sender: 'ai',
          timestamp: Date.now(),
        },
      ]);
    } catch (error) {
      console.error('Failed to clear chat history:', error);
    }
  }, [user?.uid]);

  const sendMessage = useCallback(async (inputText) => {
    if (!inputText.trim() || loading || isInitializing) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: Date.now(),
    };

    setMessages((prev) => {
      const updatedMessages = [...prev, userMessage];
      
      // Perform API calls outside the setState with the new array
      (async () => {
        setLoading(true);
        try {
          const { text: aiText, analysis } = await getChatResponseWithAnalysis(updatedMessages);

          if (user && user.uid) {
            await saveEmotion(user.uid, {
              emotion: analysis.emotion,
              intensity: analysis.intensity,
              trigger: analysis.trigger,
              suggestions: analysis.suggestions || [],
            });
          }

          const aiMessage = {
            id: (Date.now() + 1).toString(),
            text: aiText,
            sender: 'ai',
            analysis,
            timestamp: Date.now(),
          };
          
          setMessages((current) => [...current, aiMessage]);
        } catch (error) {
          console.error('Failed to process chat message:', error);
        } finally {
          setLoading(false);
        }
      })();
      
      return updatedMessages;
    });
  }, [user, loading, isInitializing]);

  return {
    messages,
    loading,
    isInitializing,
    sendMessage,
    clearHistory,
  };
};

export default useChat;