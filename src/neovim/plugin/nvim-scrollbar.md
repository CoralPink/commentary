# nvim-scrollbar

聖夜🌃は間近です。その前にスクロールバーを追加してみます🎄

```admonish info title="[nvim-scrollbar](https://github.com/petertriho/nvim-scrollbar)"
Extensible Neovim Scrollbar

拡張可能なNeovimスクロールバー
```

```admonish abstract title="Requirements"
Neovim >= 0.5.1

nvim-hlslens (optional)

gitsigns.nvim (optional)
```

`nvim-hlslens`も`gitsigns.nvim`も、とっても見覚えあるやつですね😉

両方とも`optional`ということですが、これはぜひ積極的に取り入れていきましょう❗

```admonish note
というか、最初から取り入れるつもりで進めてたんですけどね😸
```

## Installation

ちょっと一手間加えて、ここでも`onenord.nvim`の力を借ります。

~~~admonish example title="extensions/nvim-scrollbar.lua"
```lua
local colors = require('onenord.colors').load()

require('scrollbar').setup {
  handle = {
    color = colors.bg_highlight,
  },
  marks = {
    Search = { color = colors.Search },
    Error = { color = colors.error },
    Warn = { color = colors.warning },
    Info = { color = colors.info },
    Hint = { color = colors.hint },
    Misc = { color = colors.purple },
  },
}

require('scrollbar.handlers.search').setup()
require("scrollbar.handlers.gitsigns").setup()
```
~~~

このコードでは、

- local colors = require('onenord.colors').load()
- require('scrollbar.handlers.search').setup() ※これは`nvim-hlslens`
- require("scrollbar.handlers.gitsigns").setup()

で、それぞれのプラグインを必要とします。`pakcer`にも教えといてあげましょう🫶

~~~admonish example title="extensions/init.lua"
```lua
  use {
    'petertriho/nvim-scrollbar',
    config = function() require 'extensions.nvim-scrollbar' end,
    requires = {
      'rmehri01/onenord.nvim', 'kevinhwang91/nvim-hlslens', 'lewis6991/gitsigns.nvim',
    },
  }
```
~~~

右側にスクロールバーが現れましたね❗`nvim-hlslens`、`gitsigns`との連携もバッチリです😆


|gitsigns|
|:---:|
|![scrollbar-gitsign](img/scrollbar-gitsigns.webp)|

|nvim-hlslens|
|:---:|
|![scrollbar-hlslens](img/scrollbar-hlslens.webp)|

スクリーンショットでは少しわかりにくいかも知れませんが、検索文字列の行もスクロールバー上で表示がされてます😆

## Conclude

びっくりするぐらい高速でしたね😵‍💫

ただ、わたしもちょっと急いで書いたので、また落ち着いたら取りこぼした部分を追記なり修正なりしていきます。

と、いうことで...❗

```admonish success title="Assemble"
A very merry Christmas❗🍾
```

```admonish success title=""
<div style="text-align: center">
<div style="font-size: 300%; line-height: 0;">

WAR

IS

OVER!
</div>
<div style="font-size: 90%; font-weight: bold" >
IF YOU WANT IT
</div>

(戦争は終わる　あなたがそう望むなら)
</div>
```
