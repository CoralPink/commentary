# Custom Event
さて、一通り片付いたかな〜って感じなので、ここは付録みたいなものです。

お付き合いいただける方は`custom.lua`とでもしてまたファイルを作成しましょう。

~~~admonish example title="custom.lua"
```lua
-- まだ何にもない。
```
~~~

ここにはキーバインドから呼び出す独自の動作を実装していくつもりなので、`keybinds.lua`から呼び出しましょう。
~~~admonish example title="keybinds.lua"
```lua
require 'custom'

-- ↓ ここまでで色々と記述したところ
local act = require('wezterm').action

return {
  -- キーバインド設定が並ぶ
}
```
~~~

再掲ですが、すでに`WezTerm`内で実装されている動作は一覧されています。
```admonish note title="[enum: KeyAssignment - Wez's Terminal Emulator](https://wezfurlong.org/wezterm/config/lua/keyassignment/index.html)"
A KeyAssignment represents a pre-defined function that can be applied to control the Window, Tab, Pane state typically when a key or mouse event is triggered.
```

基本的にはここから選んでどう使うか、みたいな話になってきます。

```admonish success
それでは次に進みましょう。
```
