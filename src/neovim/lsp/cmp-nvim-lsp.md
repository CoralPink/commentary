# cmp-nvim-lsp

今回は、いよいよコード補完を実現させます🤗

```admonish info title="[cmp-nvim-lsp](https://github.com/hrsh7th/cmp-nvim-lsp)"
nvim-cmp source for neovim's built-in language server client.

nvim-cmp neovimの組み込み言語サーバークライアント用ソース。
```

それはもう「ちょうど夜が明けて、やがて窓から日が差してくるみたいに」。

```admonish success title=""
Here comes the sun king
{{footnote: Sun King (by [The Beatles](https://en.wikipedia.org/wiki/The_Beatles)):
タイトルの "Sun King" とは、"Louis XIV (ルイ14世)" の別称である。
曲名は当初 "Here Comes the Sun King" となっていたが、"Here Comes The Sun" と混同することから現在の曲名になった。
楽曲について、Lennon は「あったのは曲半分だけで、ずっと仕上げられないままだった。
あれは仕上げなくても、曲に片が付けられる手の一つだったというわけ。でもメドレーに入ると雰囲気を変えたくなってきて、
"Here comes the sun king" の出番になった。かまわないだろう？
彼がやってくると、誰もが幸せになって "cuando para mucho" だのなんだの (イタリア語やポルトガル語の単語を適当に並べたもの) が始まるんだ」と語っている。
[Wikipedia](https://ja.wikipedia.org/wiki/サン・キング)より
}}

太陽王がやってきた
```

## Capabilities

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

最も重要なのは、"サーバに送信する機能をオーバーライドする必要がある" というところでしょうか。
次項からやっていきましょう。

## Setup / Install

オフィシャルに示されているコードと順番が逆になってしまいますが、先に`Capabilities`からやっていきます。

### Capabilities

本来は使用する言語サーバーの`setup`ごとに`capabilities`をオーバーライドする必要がありますが、
このサイトでは`mason-lspconfig`でまとめて行う方法をとってきました☀️

なので、これもまとめて簡単にやっちゃいましょう😎

`mason.lua`を開いてこんなんしとけばOKです🧚‍♀️🧚

~~~admonish example title="extensions/mason.lua"
```diff
require('mason-lspconfig').setup_handlers {
  function(server_name)
-   require('lspconfig')[server_name].setup {}
+   require('lspconfig')[server_name].setup {
+     capabilities = require('cmp_nvim_lsp').default_capabilities(),
+   }
  end,
}
```
~~~

一網打尽ですね🏝️

併せて`packer`に「`mason-lspconfig`の設定に`cmp-nvim-lsp`を使用するよ❗」、と教えておいてあげるとさらに安心🐶

~~~admonish example title="extensions/init.lua"
```diff
  use {
    'williamboman/mason.nvim',
    config = function() require 'extensions.mason' end,
    requires = {
      'williamboman/mason-lspconfig.nvim', 'neovim/nvim-lspconfig',
+     'hrsh7th/cmp-nvim-lsp',
    }
  }
```
~~~

これだけやっておけば、あとは`mason-lspconfig`が全ての言語サーバーに適用してくれるはずです。

### Plugin Install

で、その流れのまま`nvim-cmp`の`requires`にも`cmp-nvim-lsp`を入れてあげましょう😉

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

んでもってさらに、 「補完ソースは`cmp-nvim-lsp`を通して取得するんだよ🦜 」と、`nvim-cmp`に宣言しておきましょう😆

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

![cmp-nvim-lsp 1](img/cmp-nvim-lsp1.webp)

補完候補が出ましたね🤗

操作について、わたしが分かる範囲だけ簡単に書くと、
デフォルトでは<kbd>Ctrl-n</kbd>または<kbd>↓</kbd>で下に、
<kbd>Ctrl-p</kbd>または<kbd>↑</kbd>で上に、メニュー内でカーソルが移動します。

![cmp-nvim-lsp 2](img/cmp-nvim-lsp2.webp)

`Function`の項目にカーソルを合わせれば`Document`も表示してくれるはずです🤓

あ、あとはもちろん`mapping`に設定した操作も可能です❗

```admonish success title=""
Everybody is laughing

みんな嬉しそう
```

### ( If it does not work well... )

```admonish warning
補完候補が上手く出てこない場合は`lua`ファイルを開いた状態で`:LspInfo`を確認してみてください。

![lsp-info](img/lspinfo.webp)

`Client`に`lua_ls`が認識されている状態であれば、`nvim-cmp`と`cmp-nvim-lsp`が上手く連携できていないだけだと思われます😉

...もし`lua_ls`が認識されていなければ、それは "履 い て な い" んです、PAAAANTS!! 🤷‍♀️

急いで`nvim-lspconfig` / `mason.nvim` / `mason-lspconfig.nvim`まで戻って "履 い て" 来てください 👉🩲👈
```

## I'll take you all.
この時点でも相当な満足感でしょう⁉️

これだけでも機能としては十分に感じられますが、こんなもんじゃ収まりません マジで😆

メドレーはまだまだ続く... 🎶

```admonish success
Everybody is happy

みんな幸せ
```
