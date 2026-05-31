# Window Decorations

なんか、こんなものがあるらしい...🤔

```admonish info title="[window_decorations](https://wezfurlong.org/wezterm/config/lua/config/window_decorations.html)"
Configures whether the window has a title bar and/or resizable border.

ウィンドウにタイトルバーとリサイズ可能なボーダーを設けるかどうかを設定する。
```

パラメータは、このように示されていますね。

|flag|description|
|:---|:---|
"NONE" | disables titlebar and border (borderless mode)<br>タイトルバーとボーダーを無効にします（ボーダーレスモード）。
"TITLE" |disable the resizable border and enable only the title bar<br>サイズ変更可能なボーダーを無効にし、タイトルバーのみを有効にします。
"RESIZE" | disable the title bar but enable the resizable border<br>タイトルバーを無効にし、サイズ変更可能なボーダーを有効にします。
"TITLE \| RESIZE" | Enable titlebar and border. This is the default.<br>タイトルバーとボーダーを使用可能にします。これはデフォルトです。

タイトルバーを無効にするのはなんか面白そう。

~~~admonish example title="wezterm.lua"
```lua
window_decorations = 'RESIZE',
```
~~~

![decorations](img/decorations.avif)

...いいね❗🤩


あー、でも、わたしたまにマウス操作で最小化ボタン使いたくなることあんだよねー、ちょっと辛い😅

今回はごめんなさいかなー。

...。

...。

なんて言うわけないじゃん⁉️😝

## Configuring Mouse Assignments

```admonish info title="[Mouse Binding](https://wezfurlong.org/wezterm/config/mouse.html#configuring-mouse-assignments)"
You can define mouse actions using the mouse_bindings configuration section:

マウスアクションは、mouse_bindings設定セクションを使用して定義することができます:
```

またちょっとファイルを分けましょう。`mousebinds.lua`みたいな。

もうこのまま中身まで書いちゃいます😸

~~~admonish example title="mousebinds.lua"
```lua
local act = require('wezterm').action

return {
  mouse_bindings = {
    {
      event = { Down = { streak = 1, button = 'Left' } },
      mods = 'NONE',
      action = act.EmitEvent 'show-title-bar',
    },
  },
}
```
~~~

カスタムイベントは`event.lua`の方にまとめます。

~~~admonish example title="event.lua"
```lua
wezterm.on('show-title-bar', function(window, pane)
  local overrides = window:get_config_overrides() or {}

  overrides.window_decorations = 'TITLE | RESIZE'
  window:set_config_overrides(overrides)
end)
```
~~~

いつも通り、`wezterm.lua`から読み込みます。`keybinds`と同じ流れ😌

~~~admonish example title="wezterm.lua"
```lua
  mouse_bindings = require('mousebinds').mouse_bindings,
```
~~~

これで一回動かしてみましょう。ウィンドウをクリックすると...、

![decorations2](img/decorations2.avif)

タイトルバーが現れました。やったね😆

~~~admonish tip
例えば`Neovim`みたいな、マウス操作に対応しているアプリケーションを動かしてる時だと、
そちらに操作を奪われてしまうようで、タイトルバーは現れません。

`Neovim`であれば、以下のようにすればマウス操作を無効化できるので、この状態ならバッチリです👍

```lua
vim.api.nvim_set_option('mouse', '')
```

ただ、マウス操作で手軽に文章を拾いたいことがあるので、わたしは入れてません🥳
~~~

でもこれだけだと、出したら出しっぱなしでなんか締まりませんね😮

やっぱり今回はごめんなさいかなー。

...。

...。

なんて言うわけないじゃん⁉️😝

## ここでも window-focus-changed

~~~admonish example title="event.lua"
```lua
function DisableWindowDecorations(window, interval)
  if interval then
    wezterm.sleep_ms(interval)
  end

  local overrides = window:get_config_overrides() or {}
  overrides.window_decorations = nil
  window:set_config_overrides(overrides)
end

wezterm.on('window-focus-changed', function(window, pane)
  if window:is_focused() then
    return
  end

  DisableWindowDecorations(window)
end)
```
~~~

はい。ウィンドウのフォーカスを外すと引っ込むようにしてみました。

あ、前のページでも挙げてましたが、`wezterm.on`は同じイベントがいくつ被っても平気です😉

こんなんなんぼあってもええですからね。

```admonish info title="[wezterm.on(event_name, callback)](https://wezfurlong.org/wezterm/config/lua/wezterm/on.html)"
wezterm.on can register multiple callbacks for the same event; internally an ordered list of callbacks is maintained for each event.
When the event is emitted, each of the registered callbacks is called in the order that they were registered.

wezterm.on は、同じイベントに対して複数のコールバックを登録することができます; 内部的には、各イベントに対してコールバックの順序付きリストが維持されます。
イベントが発信されると、登録された各コールバックは、登録された順に呼び出されます。
```

え❓😮 `DisableWindowDecorations`にある`interval`は何かって❓

かなわんなあ。最初に記述した`show-title-bar`イベントに少しだけ手を加えましょ😄

~~~admonish example title="event.lua"
```lua
-- これを追加して...、
local TITLE_BAR_DISPLAY_TIME = 3000

wezterm.on('show-title-bar', function(window, pane)
  local overrides = window:get_config_overrides() or {}

  overrides.window_decorations = 'TITLE | RESIZE'
  window:set_config_overrides(overrides)

  -- これも追加する
  DisableWindowDecorations(window, TITLE_BAR_DISPLAY_TIME)
end)
```
~~~

これで`TITLE_BAR_DISPLAY_TIME`時間経過後、勝手に消えるようになってるはずです。どうでしょう😆

え❓😮 `DisableWindowDecorations`にある`sleep_ms()`は何かって❓

かなわんなあ。ちょっと不自然な気がするけど、これしか無かってん...😿

```admonish info title="[wezterm.sleep_ms(milliseconds)](https://wezfurlong.org/wezterm/config/lua/wezterm/sleep_ms.html)"

wezterm.sleep_ms suspends execution of the script for the specified number of milliseconds.
After that time period has elapsed, the script continues running at the next statement.

wezterm.sleep_ms は、指定されたミリ秒の間、スクリプトの実行を一時停止します。
その時間が経過した後、スクリプトは次の文で実行を継続する。
```

他になんかもっとええのあったら教えてな〜☺️


```admonish note
うちな〜、`Raycast`{{footnote:
[https://www.raycast.com](https://www.raycast.com)
}}の`WindowManagement`使てんねんけど、よーこんな感じできっちりウィンドウ詰めるやろ〜❓

![deco-custom1](img/deco-custom1.avif)

タイトルバー出すやろ〜❓

![deco-custom2](img/deco-custom2.avif)

そんでな〜、引っ込んだらこんなんなんねん。

![deco-custom3](img/deco-custom3.avif)

なんでやねん🫱
```

```admonish note title=""
...あれ❓上の問題、出たり出なかったりする...。なにが違うねんな〜❗
```

```admonish success
なんか色々ありましたが、実際動かしてみたらこれ、すごい面白くないですか⁉️😆
```
