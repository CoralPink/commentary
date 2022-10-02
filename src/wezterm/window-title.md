# Window Title
`format.lua`に、以下のコードを追記していきましょう。[^code]

~~~admonish example title="format.lua"
```lua
local wezterm = require 'wezterm'

local function BaseName(s)
  return string.gsub(s, '(.*[/\\])(.*)', '%2')
end

wezterm.on('format-window-title', function(tab)
  return BaseName(tab.active_pane.foreground_process_name)
end)
```
~~~

この節のポイントは`wezterm.on(event_name, callback)`です。

```admonish info title="[on - Wez's Terminal Emulator](https://wezfurlong.org/wezterm/config/lua/wezterm/on.html)"
wezterm.on causes your specified callback to be called when event_name is emitted. Events can be emitted by wezterm itself, or through code/configuration that you specify.

wezterm.on は、event_name が発生したときに指定したコールバックを呼び出します。イベントは wezterm 自身によって、またはあなたが指定したコード/設定によって発行されます。
```

この例で言うと、`format-window-title`という名前のイベントが発生したら、ここで定義した functtion が呼ばれるという動作をします。

```admonish info title="[format-window-title - Wez's Terminal Emulator](https://wezfurlong.org/wezterm/config/lua/window-events/format-window-title.html)"
The format-window-title event is emitted when the text for the window title needs to be recomputed.

`format-window-title`イベントはウィンドウタイトルのテキストを再計算する必要がある場合に発行されます。
```

再計算と言うよりは再描画というニュアンスに近いでしょうか。

要するにこのイベントが発生した際にウィンドウタイトルとして表示するテキストを指定します。抜粋すると以下の部分ですね。

```lua
function(tab)
  return BaseName(tab.active_pane.foreground_process_name)
end
```

無名関数というやつです。
これが`BaseName`関数にプロセス名を渡して、正規表現で加工された文字列を返しています。

わたしが正規表現の理解に乏しいので説明できませんが、この例では純粋に実行アプリケーション名だけを取り出しています...よね？

before:
![window-title-before](img/window-title-before.png)

after:
![window-title-after](img/window-title-after.png)

すみません、これ (↑) タイトルバーです...。 

```admonish success
スッキリしましたね、スッキリしすぎたかもしれません。

まあ、これも各自お好みで調整してもらえればOKです。
```
[^code]: なんか偉そうでした。wez さんのサンプル、丸パクリです...。
