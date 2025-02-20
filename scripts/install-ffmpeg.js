const { execSync } = require('child_process');
const os = require('os');

function installFFmpeg() {
  // ffmpegがインストール済みかチェック
  try {
    execSync('ffmpeg -version', { stdio: 'ignore' });
    console.log('FFmpegはすでにインストールされています。');
    process.exit(0);
  } catch (error) {
    // ffmpegが存在しないため、引き続きインストール処理を続行
  }
  
  const platform = os.platform();
  try {
    console.log('FFmpegをインストールしています...');
    
    switch (platform) {
      case 'darwin': // macOS
        execSync('brew install ffmpeg');
        break;
      case 'linux':
        execSync('sudo apt-get update && sudo apt-get install -y ffmpeg');
        break;
      case 'win32': // Windows
        execSync('winget install ffmpeg');
        break;
      default:
        throw new Error(`未対応のプラットフォームです: ${platform}`);
    }
    
    console.log('FFmpegのインストールが完了しました！');
  } catch (error) {
    console.error('FFmpegのインストールに失敗しました:', error.message);
    console.log('\nFFmpegを手動でインストールしてください:');
    console.log('- macOS: brew install ffmpeg');
    console.log('- Linux: sudo apt-get install ffmpeg');
    console.log('- Windows: https://ffmpeg.org/download.html からダウンロード');
    process.exit(1);
  }
}

installFFmpeg(); 