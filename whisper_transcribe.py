#!/usr/bin/env python
import sys
import whisper

def main():
    if len(sys.argv) < 2:
        print("Usage: python whisper_transcribe.py <audio_file>")
        sys.exit(1)
    
    audio_file = sys.argv[1]
    
    # モデルのロード。必要に応じて "base" 以外のサイズも選べる
    model = whisper.load_model("base")
    
    # 文字起こし実行
    result = model.transcribe(audio_file)
    
    # 文字起こし結果を標準出力に出す
    print(result["text"])

if __name__ == "__main__":
    main()
