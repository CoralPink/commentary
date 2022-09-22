# Format

次はウィンドウタイトルとタブを飾り付けていこうかなーと思うのですが、
まずは`format.lua`とでもして、またファイルを作成しましょう。

~~~admonish example title="format.lua"
```lua
local wezterm = require 'wezterm'
```
~~~

で、これを`wezterm.lua`から呼び出します。

~~~admonish example title="wezterm.lua"
```lua
require 'format'

-- ↓ ここまでで色々と記述してきたところ
return {
  -- 〜
}
```
~~~

```admonish warning
記述する位置は`return`節の外です。
```

```admonish success
こんなのもう楽勝ですね。次に進みましょう。
```
