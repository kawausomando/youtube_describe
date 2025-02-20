#!/usr/bin/env tsx

import youtubeDl from 'youtube-dl-exec';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

async function main() {
  const url = process.argv[2];
  if (!url) {
    console.error('URLを指定してください');
    process.exit(1);
  }

  console.log('YouTubeから音声をダウンロードしています...');
  
  // tmpフォルダのパス生成し、存在しなければ作成
  const tmpDir = path.join(__dirname, 'tmp');
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }
  
  // 保存先のファイルパスを設定
  const audioFile = path.join(tmpDir, 'audio.mp3');
  const transcriptionFile = path.join(tmpDir, 'transcription.txt');

  // 両ファイルとも上書き保存するため、既存の場合は削除
  if (fs.existsSync(audioFile)) {
    fs.unlinkSync(audioFile);
  }
  if (fs.existsSync(transcriptionFile)) {
    fs.unlinkSync(transcriptionFile);
  }
  
  try {
    // youtube-dlを使用して音声をダウンロード
    await youtubeDl(url, {
      extractAudio: true,
      audioFormat: 'mp3',
      output: audioFile
    });

    console.log('音声のダウンロードが完了しました');

    // Whisperで文字起こしし、結果をテキストファイルに保存
    const pythonProcess = spawn('python', ['whisper_transcribe.py', audioFile]);

    // 書き込みモード"w"でファイルを作成（既存の場合は上書き）
    const transcriptionStream = fs.createWriteStream(transcriptionFile, { flags: 'w' });

    // 標準出力を直接テキストファイルへパイプ
    pythonProcess.stdout.pipe(transcriptionStream);

    pythonProcess.stderr.on('data', (data) => {
      console.error(data.toString());
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error('文字起こしに失敗しました');
        process.exit(1);
      } else {
        console.log(`文字起こし完了。結果は ${transcriptionFile} に保存されました`);
      }
    });

  } catch (error) {
    console.error('エラーが発生しました:', error);
    process.exit(1);
  }
}

main();
