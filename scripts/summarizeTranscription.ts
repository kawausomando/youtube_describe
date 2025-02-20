import fs from 'fs';
import OpenAI from 'openai';

// OpenAI の API キーを環境変数から設定
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function summarizeTranscription() {
  try {
    // transcription.txt の内容を読み込む
    const transcription = fs.readFileSync('tmp/transcription.txt', 'utf8');
    
    // OpenAI の ChatCompletion API を呼び出して日本語訳と要約を生成
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system', 
          content: '以下のまず全文日本語に翻訳し全文出力してください、その翻訳文を元に簡潔な要約も作成してください。回答では、「日本語訳」と「要約」を明確に分けて出力してください。「要約」は箇条書きしてください'
        },
        { role: 'user', content: transcription }
      ],
      temperature: 0.7
    });
    
    // 生成された日本語訳と要約を出力
    console.log('結果:', response.choices[0].message.content);
  } catch (err) {
    console.error('エラーが発生しました:', err);
  }
}

summarizeTranscription();