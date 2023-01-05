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

これはもう本当に簡単です。{{footnote:
初掲出時には「`onenord.nvim`を使って色を設定するといいよ！」なんて書いちゃいましたが、
改めて確認してみたら全く必要ありませんでした...。
何も設定しなくても`onenord.nvim`の力は発揮されています❗これホントごめんなさい😿
}}

~~~admonish example title="extensions/nvim-scrollbar.lua"
```lua
require('scrollbar').setup()

require('scrollbar.handlers.search').setup()
require("scrollbar.handlers.gitsigns").setup()
```
~~~

```admonish note
もし細かく設定したい場合は
[config](https://github.com/petertriho/nvim-scrollbar#config) にある Defaults を参照すると良いです。
```

このコードでは、

```lua
require('scrollbar.handlers.search').setup() -- これは nvim-hlslens
```

```lua
require("scrollbar.handlers.gitsigns").setup()
```

...で、それぞれのプラグインを必要とします。`pakcer`にも教えといてあげましょう🫶

~~~admonish example title="extensions/init.lua"
```lua
  use {
    'petertriho/nvim-scrollbar',
    config = function() require 'extensions.nvim-scrollbar' end,
    requires = {
      'kevinhwang91/nvim-hlslens', 'lewis6991/gitsigns.nvim',
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

## Wrap up

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
