import fs from 'fs';
import OpenAI from 'openai';

// OpenAI の API キーを環境変数から取得
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function askQuestion() {
  try {
    // 動画の文字起こし内容を読み込む
    const transcript = fs.readFileSync('tmp/transcription.txt', 'utf8');

    // コマンドライン引数から質問を取得する
    const args = process.argv.slice(2);
    if (args.length === 0) {
      console.error('質問を引数として指定してください。');
      process.exit(1);
    }
    const question = args.join(' ');

    // プロンプト作成: 文字起こし内容に基づいて質問に回答するよう指示する
    const prompt = `
以下は動画の文字起こし内容です：
${transcript}

この内容に基づいて、以下の質問に日本語で回答してください：
${question}
`;

    // ChatCompletion API を使って回答を生成
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'あなたは動画の文字起こしを元に、ユーザーの質問に回答するAIアシスタントです。'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7
    });

    // 生成された回答を出力
    console.log('回答:', response.choices[0].message.content);
  } catch (err) {
    console.error('エラーが発生しました:', err);
  }
}

askQuestion(); 