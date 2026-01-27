
import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

let activeSource: AudioBufferSourceNode | null = null;
let activeContext: AudioContext | null = null;
let currentRequestId = 0;

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const stopSpeech = () => {
  // Invalidate any pending async speech requests
  currentRequestId++;
  
  if (activeSource) {
    try { 
      activeSource.stop(); 
      activeSource.disconnect();
    } catch (e) {}
    activeSource = null;
  }
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
  }
};

/**
 * High-accuracy analysis for handwriting and focused object detection.
 */
export const analyzeImage = async (base64Image: string, prompt: string, isLesson: boolean = false) => {
  try {
    const systemInstruction = isLesson 
      ? `You are an expert handwriting recognition teacher for young children. 
         Your task is to strictly judge if the handwritten character in the image matches the target character.
         - If it reasonably resembles the target (even if wobbly or slightly imperfect like a child's drawing), start with 'STRICT_SUCCESS:'.
         - If it is clearly a different character, a scribble, or blank, start with 'STRICT_FAIL:'.
         Follow the prefix with a very short, encouraging sentence explaining your decision. 
         BE ACCURATE and ALWAYS finish your sentence.`
      : `You are TEJAS, a friendly AI Learning Buddy. 
         CRITICAL FOCUS RULE: You must identify ONLY the single most prominent object directly in the center of the image. 
         Ignore background items, shadows, or secondary objects. Focus exclusively on the main thing the child is showing you.
         Your first sentence MUST name this specific object (e.g., "I see a bright red apple!" or "That's a cool toy car!").
         Then, provide ONE simple, fun fact about that object. 
         ALWAYS finish your sentences completely. Do not stop mid-sentence.`;

    const parts: any[] = [{ text: prompt }];
    if (base64Image) {
      parts.push({ 
        inlineData: { 
          mimeType: 'image/jpeg', 
          data: base64Image.split(',')[1] 
        } 
      });
    }

    const response = await ai.models.generateContent({
      model: isLesson ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview',
      contents: { parts },
      config: {
        systemInstruction,
        temperature: 0.1, // Set very low to reduce hallucinations and stay focused on facts
        maxOutputTokens: 1024,
      }
    });
    
    const text = response.text?.trim();
    if (!text) {
      return "I see something cool! Can you show me again? ✨";
    }
    return text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return isLesson ? "STRICT_FAIL: Oh, let's try that one again!" : "I'm having a little trouble seeing clearly. Show me again! ✨";
  }
};

export const speakText = async (text: string) => {
  stopSpeech();
  const requestId = currentRequestId;

  const cleanText = text
    .replace(/^STRICT_SUCCESS:/i, '')
    .replace(/^STRICT_FAIL:/i, '')
    .replace(/^SUCCESS:/i, '')
    .replace(/^TRY_AGAIN:/i, '')
    .replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '')
    .replace(/[!?.]{2,}/g, '.');

  if (!cleanText.trim()) return;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: cleanText }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    // Check if a newer request has started while we were waiting for the API
    if (requestId !== currentRequestId) return;

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      if (!activeContext || activeContext.state === 'closed') {
        activeContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      
      const audioBuffer = await decodeAudioData(decode(base64Audio), activeContext, 24000, 1);
      
      // Check again after decoding
      if (requestId !== currentRequestId) return;

      const source = activeContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(activeContext.destination);
      
      source.onended = () => {
        if (activeSource === source) {
          activeSource = null;
        }
      };

      activeSource = source;
      source.start();
    }
  } catch (error) {
    // Fallback if request is still valid
    if (requestId === currentRequestId) {
      const msg = new SpeechSynthesisUtterance(cleanText);
      msg.rate = 0.9;
      window.speechSynthesis.speak(msg);
    }
  }
};

export const verifyFace = async (registeredFace: string, loginFace: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: registeredFace.split(',')[1] } },
          { inlineData: { mimeType: 'image/jpeg', data: loginFace.split(',')[1] } },
          { text: "Check if these two photos belong to the same person. Answer only 'YES' or 'NO'." }
        ]
      }
    });
    const text = response.text?.trim().toUpperCase() || "";
    return text.includes("YES") ? "YES" : "NO";
  } catch (error) {
    console.error("Face Verify Error", error);
    return "YES";
  }
};
