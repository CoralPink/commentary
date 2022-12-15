# Toggle Font

ここではわたしが使っている機能実装を紹介します。

環境によっては全く必要ないと思いますので、その場合はスキップしてください😅

## まず前提

わたしのディスプレイ環境なんですが、MacBook と 4K を行ったり来たりして使っています。

だからなんだって言われるとキツイんですが、一番わかりやすいところでフォントサイズの問題があって、画面のスケールが違いすぎて大きすぎたり小さすぎたりしてしまう...😢

![img-4k](img/img-4k.webp)

![img-mbp](img/img-mbp.webp)

```admonish note
意図伝わりますでしょうか...😅

むしろツールバーをみてもらった方がわかりやすいかもしれません。アイコンとかフォントとか、サイズというか、スケール全然違うでしょ❓
```

[DecreaseFontSize](https://wezfurlong.org/wezterm/config/lua/keyassignment/DecreaseFontSize.html)・
[IncreaseFontSize](https://wezfurlong.org/wezterm/config/lua/keyassignment/IncreaseFontSize.html)
を使ってサイズを上げ下げしてもいいんですが、ちょっとコレじゃない...😒

わたしはこれが結構ストレスになっていたので、 この問題を解消するのに有用なのが、次のフォント切り替え機能です😃

## フォントサイズ切り替え

この例では`toggle-font-size`というイベントを独自に作っています。

`WezTerm`では、フォントサイズに限らず、元の設定を直接書き換えるのではなく、オーバーライドすることで変化させます。

```admonish info title="[window:get_config_overrides()](https://wezfurlong.org/wezterm/config/lua/window/get_config_overrides.html)"
Returns a copy of the current set of configuration overrides that is in effect for the window.

ウィンドウに適用されている設定オーバーライドの現在のセットのコピーを返します。
```

~~~admonish example title="event.lua"
```lua
local wezterm = require 'wezterm'

wezterm.on('toggle-font-size', function(window, pane)
  local overrides = window:get_config_overrides() or {}
  overrides.font_size = not overrides.font_size and 10.0 or nil

  window:set_config_overrides(overrides)
end)
```
~~~

端的に言えば、以下の動作を交互に行っています。

- 素の状態であれば、`font_size`を`10.0`でオーバーライド。
- オーバーライドされているのであれば、`font_size`を`nil`としてオーバーライドを無効化 (素の状態に戻す)。

これでフォントサイズの切り替えが実現できます。

~~~admonish note
わたしは`wezterm.lua`の`font_size`を`14.0`にして、`14.0`と`10.0`を行ったり来たりできるように設定しています。
環境に合わせて調整してください。
~~~

独自イベントが呼び出されるようにするには`EmitEvent`を用います。

```admonish info title="[EmitEvent](https://wezfurlong.org/wezterm/config/lua/keyassignment/EmitEvent.html)"
This action causes the equivalent of wezterm.emit(name, window, pane) to be called in the context of the current pane.

このアクションは、現在のペインのコンテキストで wezterm.emit(name, window, pane) と同等のアクションが呼び出されるようにします。
```

わたしはキーバインド<kbd>Ctrl-f</kbd>をトリガーとして呼び出しています。

~~~admonish example title="keybinds.lua"
```lua
  { key = 'f', mods = 'CTRL', action = act.EmitEvent 'toggle-font-size' },
```
~~~

まあ、思いっきり手動なんですけどね😅 自動で出来たら面白いんですけどね。

```admonish note
あれ？dpi取得できるなら自動で出来るのかな。このサイト作りながら気づいてしまった...。

アウトプットはしてみるものですね❗次のページに書いちゃいます😆
```

|素の状態{{footnote:さらにフォントサイズを大きくして説明用に誇張しています。が、まだなんか中途半端でしたね...😿}}|切り替えた状態|
|:---:|:---:|
|![font-big](img/font-big.webp)|![font-small](img/font-small.webp)|

```admonish success
切り替えられましたね🤗

気持ちいい〜❗️
```
