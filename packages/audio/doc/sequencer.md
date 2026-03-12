1. DSL の名前（例：KMSL）
   • 目的
   • 想定する音楽スタイル（NES 風、ゲーム向け）
2. 基本構文
   • 音符の書き方
   • 長さの書き方
   • BPM の指定
   • トラックの書き方
   • ループやパターンの書き方（必要なら）
3. parsedScore の構造
   • measure / beat / note の階層
   • データ構造の例
4. compileScore の仕様
   • 拍 → ミリ秒への変換
   • events の構造
   • 例：parsedScore → events の変換例
5. Sequencer の役割
   • start / stop
   • rAF での進行管理
   • Synth への委譲
6. playScore の役割
   • parsedScore → events
   • events の消費
   • noteOn の呼び出し

特に：
• 音符の書き方（C4, c4, c?）
• 長さの書き方（4, 8, 16, . など）
• BPM の指定
• トラックの書き方
• ループ構文
• パターン構文
• 休符の表現
• オクターブ変更の書き方（> < など？）
