import axios from 'axios';

// API
const OPENAI_API_KEY = "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";
interface TranslationResponse {
  javaCode: string;
  explanation?: string;
}

export async function translateToJava(cobolCode: string, userStory: string): Promise<TranslationResponse> {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-4", 
        messages: [
          {
            role: "system",
            content: "You are an expert COBOL to Java translator. Respond only with the translated Java code, no explanations or markdown."
          },
          {
            role: "user",
            content: `
Translate this COBOL code to modern Java:

COBOL Code:
${cobolCode}

Context:
${userStory}

Requirements:
1. Use modern Java best practices
2. Include proper class structure and main method
3. Maintain the same functionality
4. Use clear naming conventions`
          }
        ],
        temperature: 0.3,
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const javaCode = response.data.choices[0].message.content.trim();
    return { javaCode };

  } catch (error: any) {
    console.error('Translation error:', error.response?.data || error.message);
    throw new Error('Failed to translate code. Please try again.');
  }
}