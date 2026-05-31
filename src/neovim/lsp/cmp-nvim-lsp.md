# cmp-nvim-lsp

今回は、いよいよコード補完を実現させます🤗

```admonish info title="[cmp-nvim-lsp](https://github.com/hrsh7th/cmp-nvim-lsp)"
nvim-cmp source for neovim's built-in language server client.

nvim-cmp neovimの組み込み言語サーバークライアント用ソース。
```

```admonish success title=""
Here comes the sun king{{footnote:
Sun King (by [The Beatles](https://en.wikipedia.org/wiki/The_Beatles)):
タイトルの "Sun King" とは、"Louis XIV (ルイ14世)" の別称である。
曲名は当初 "Here Comes the Sun King" となっていたが、"Here Comes The Sun" と混同することから現在の曲名になった。
楽曲について、Lennon は「あったのは曲半分だけで、ずっと仕上げられないままだった。
あれは仕上げなくても、曲に片が付けられる手の一つだったというわけ。でもメドレーに入ると雰囲気を変えたくなってきて、
"Here comes the sun king" の出番になった。かまわないだろう？
彼がやってくると、誰もが幸せになって "cuando para mucho" だのなんだの (イタリア語やポルトガル語の単語を適当に並べたもの) が始まるんだ」と語っている。
[Wikipedia](https://en.wikipedia.org/wiki/Sun_King_(song))より
}}

太陽王がやってきた
```

## Setup / Install

まずは`nvim-cmp`の`requires`に`cmp-nvim-lsp`を入れてあげましょう😉

~~~admonish example title="extensions/init.lua"
```diff
  use {
    'hrsh7th/nvim-cmp',
    config = function() require 'extensions.nvim-cmp' end,
+   requires = {
+     'hrsh7th/cmp-nvim-lsp',
+   }
  }
```
~~~

### Sources

前回作成した`nvim-cmp.lua`を開いて、「補完ソースは`cmp-nvim-lsp`を通して取得するんだよ🦜 」と`nvim-cmp`に宣言しておきましょう😆

~~~admonish example title="extensions/nvim-cmp.lua"
```diff
cmp.setup {
  mapping = map.preset.insert {

    -- (中略)

  },

+ sources = cmp.config.sources {
+   { name = 'nvim_lsp' },
+ },
}
```
~~~

### Capabilities

`cmp-nvim-lsp`のセットアップにおいて最も重要なのは、
"サーバに送信する機能をオーバーライドする必要がある" というところでしょうか。

```admonish info title="[Capabilities](https://github.com/hrsh7th/cmp-nvim-lsp#capabilities)"
Language servers provide different completion results depending on the capabilities of the client.
Neovim's default omnifunc has basic support for serving completion candidates.

言語サーバーは、クライアントの能力に応じて、異なる補完結果を提供します。
Neovimのデフォルトのomnifuncは、補完候補を提供するための基本的なサポートを備えています。

nvim-cmp supports more types of completion candidates,
so users must override the capabilities sent to the server such that it can provide these candidates during a completion request.
These capabilities are provided via the helper function require('cmp_nvim_lsp').default_capabilities

nvim-cmpはより多くの種類の補完候補をサポートしているため、補完要求時にこれらの候補を提供できるように、
ユーザーがサーバーに送信する機能をオーバーライドする必要があります。
この機能は、ヘルパー関数 require('cmp_nvim_lsp').default_capabilities を使用して提供されます。

As these candidates are sent on each request, adding these capabilities will break the built-in omnifunc support for neovim's language server client.
nvim-cmp provides manually triggered completion that can replace omnifunc. See :help cmp-faq for more details.

これらの候補はリクエストごとに送信されるため、この機能を追加すると、neovim の言語サーバークライアントの組み込みの omnifunc サポートは切断されます。
nvim-cmp は、omnifunc に代わる手動トリガーによる補完機能を提供します。詳しくは :help cmp-faq を参照してください。
```

本来は使用する言語サーバーの`setup`ごとに`capabilities`をオーバーライドする必要がありますが、
これもまとめて簡単に (ざっくりと) やっちゃいましょう😎

`cmp.setup`の最後にでも、こんな感じで追記します。

~~~admonish example title="extensions/nvim-cmp.lua"
```diff
cmp.setup {

  ...

+ vim.lsp.config('*', {
+   capabilities = require('cmp_nvim_lsp').default_capabilities()
+ })
}
```
~~~

一網打尽ですね🏝️

```admonish warning
vim.lsp.config() は、`Neovim 0.11` で導入された新しい LSP 設定インターフェースです。
```

### Re Config

もう一個だけ。

以前、`nvim-lspconfig.lua`の中に、こんなコードを入れていると思います。

~~~admonish example title="extensions/nvim-lspconfig.lua"
```lua
  -- Enable completion triggered by <c-x><c-o>
  vim.bo[ev.buf].omnifunc = 'v:lua.vim.lsp.omnifunc'
```
~~~

`Capabilities`の説明で示されているように、
「`omnifunc`サポートが切断される」とのことなので、上記のコードを外しておいてもいいでしょう😉

```admonish question
「結局`omnifunc`ってなんやったん❓」ってなるんですけど、わたしもよく知らないんですよねー😅
```

## Completion

ってことで、`lua`ファイルを開いて、なんか適当に入力してみましょう。

```admonish note
このサイトでは、今後も基本的には`lua_ls`を使用して進みます。
```

![cmp-nvim-lsp 1](img/cmp-nvim-lsp1.avif)

補完候補が出ましたね🤗

操作について、わたしが分かる範囲だけ簡単に書くと、
デフォルトでは<kbd>Ctrl-n</kbd>または<kbd>↓</kbd>で下に、
<kbd>Ctrl-p</kbd>または<kbd>↑</kbd>で上に、メニュー内でカーソルが移動します。

![cmp-nvim-lsp 2](img/cmp-nvim-lsp2.avif)

`Function`の項目にカーソルを合わせれば`Document`も表示してくれるはずです🤓

あ、あとはもちろん`mapping`に設定した操作も可能です❗

```admonish success title=""
Everybody is laughing

みんな嬉しそう
```

### ( If it does not work well... )

```admonish warning
補完候補が上手く出てこない場合は`lua`ファイルを開いた状態で`:LspInfo`を確認してみてください。

![lsp-info](img/lspinfo.avif)

`Client`に`lua_ls`が認識されている状態であれば、`nvim-cmp`と`cmp-nvim-lsp`が上手く連携できていないだけだと思われます😉

...もし`lua_ls`が認識されていなければ、それは "履 い て な い" んです、PAAAANTS!! 🤷‍♀️

急いで`nvim-lspconfig` / `mason.nvim` / `mason-lspconfig.nvim`まで戻って "履 い て" 来てください 👉🩲👈
```

## Sun King

この時点でも相当な満足感でしょう⁉️

これだけでも機能としては十分に感じられますが、こんなもんじゃ収まりません マジで😆

メドレーはまだまだ続く... 🎶

```admonish success title=""
Everybody is happy

みんな幸せ
```

![sun-king1](img/sun-king1.avif)

![sun-king2](img/sun-king2.avif)

```admonish success
Here comes the sun king

太陽王がやってきた
```
