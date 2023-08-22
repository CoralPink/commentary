# cmp_luasnip

前回の`LuaSnip`から引き続き、頑張っていきましょう❗

```admonish info title="[cmp_luasnip](https://github.com/saadparwaiz1/cmp_luasnip)"
luasnip completion source for nvim-cmp

nvim-cmp の luasnip 補完ソース。
```

今回はスニペットを実際に動かすところまで行きます😆

```admonish success title=""
Well, you should see Polythene Pam {{footnote:
Polythene Pam (by [The Beatles](https://en.wikipedia.org/wiki/The_Beatles)):
タイトルの "Polythene" は、ポリエチレンの (主にイギリスでの) 別称。
Lennon は、本作をきつめの Liverpool 訛りで歌っている。
本作のモチーフについて、Lennon は「とある女性と僕たちを最初にマスコミに露出してくれた、
イギリス版の Irwin Allen Ginsberg ともいえる男との思い出。
1963年8月のツアー中に会ったんだけど、僕は女連れで、向こうにも僕に会わせたいという女がいた。
その女はポリエチレンを身に纏っていると聞いていたけど、本当にそうだった。
長靴やキルトは着けてない。あれは僕の捏造だ。ポリ袋の中の変態的なセックス。
とにかく曲のネタが欲しかったんだ」と語っている。
George Harisson は、テレビシリーズ『The Beatles Anthology』のインタビューで、
「僕がこの曲を気に入ったのは、すごく Liverpool っぽかったからだ。
コミカルでありながら、シリアスなところもある曲を書く人間はいなかった。
この曲はとても上出来なロックンロール・ナンバーだったけど、明らかにジョークなのに、誰も笑わず、
誰もピンときていないと、もどかしくなってくることもある」と語っている。
[Wikipedia](https://ja.wikipedia.org/wiki/ポリシーン・パン)より
}}

She's so good-looking but she looks like a man

まあ、ポリエチレンを纏ったパンを見てみなよ

彼女にとても似合っているが、なんだか見た目は男みたい
```

## Install

まあ、これはいつも通りです。

~~~admonish example title="extensions/init.lua"
```diff
  use {
    'hrsh7th/nvim-cmp',
    config = function() require 'extensions.nvim-cmp' end,
    requires = {
      'hrsh7th/cmp-nvim-lsp',
      {
        'L3MON4D3/LuaSnip',
        tag = "v1.*",
        run = 'make install_jsregexp',
        config = function() require 'extensions.luasnip' end,
+       requires = 'saadparwaiz1/cmp_luasnip',
      },
    },
  }
```
~~~

## Setup

じゃあ、これもまた`nvim-cmp.lua`を開いて、組み込んでいきましょう。

~~~admonish example title="extensions/nvim-cmp.lua"
```diff
local cmp = require 'cmp'
local luasnip = require 'luasnip'

local map = cmp.mapping

cmp.setup {

  -- (中略)

  sources = {
    { name = 'nvim_lsp' },
+   { name = 'luasnip' },
  },

+  snippet = {
+    expand = function(args)
+      luasnip.lsp_expand(args.body)
+    end,
+  },
}
```
~~~

```admonish success title=""
Get a dose of her in jackboots and kilt

She's killer-diller when she's dressed to the hilt

軍用ブーツとキルトを着けた彼女を見てみなよ

思いっきり着飾った彼女は とびっきり素晴らしい
```

## Snippets

これはもう`LuaSnip`や`Neovim`に限った話ではないので、すっごい適当に流します❗

「そういう感じね〜」ぐらいで汲んでください😉

```admonish note
ここに載せるディレクトリ構成はあくまでわたし自身が一番都合の良いものになっています。

最終的には[paths](#paths)で指定してあげればいいので、好きな場所に作っちゃえばOKです🤗
```

### Create a Directory

まず、いつも使っている`lua`ディレクトリと同列に`snippets`というディレクトリを作りましょう。

```sh
mkdir snippets
```

で、その中で以下2つの`json`ファイルを作成してください。

#### package.json

~~~admonish example title="~/.config/nvim/snippets/package.json"
```json
{
  "categories": ["Snippets"],
  "name": "my-snippets",
  "contributes": {
    "snippets": [
      {
        "language": [
          "all"
        ],
        "path": "all.json"
      }
    ]
  }
}
```
~~~

今回はサンプルなので`language`には`all`を指定していますが、
例えば`lua`・`markdown`など、言語ごとに細かく指定することもできます😉

#### Snippets Json File

続いて、言語に対して使用するスニペットを定義していきます❗

~~~admonish example title="~/.config/nvim/snippets/all.json"
```json
{
  "example": {
    "prefix": "test",
    "body": ["hello snippets!!"],
    "description": "example snippets"
  }
}
```
~~~

```admonish note
ここまでで、ファイル配置はこんな感じになります。

![snip-dir](img/snip-dir.webp)
```

### paths

そしたら、`luasnip`に「ぼくのスニペット、ここおいとくねー」...と、教えてあげましょう🦮

~~~admonish info title=":h luasnip-loaders-vs-code"
This collection can be loaded with any of

以下のいずれかを搭載することができます。

```lua
  -- don't pass any arguments, luasnip will find the collection because it is
  -- (probably) in rtp.
  -- 引数を渡さない場合、luasnipはrtpにあるコレクションを見つけるでしょう（おそらく）.
  require("luasnip.loaders.from_vscode").lazy_load()

  -- specify the full path...
  -- フルパスを指定する...
  require("luasnip.loaders.from_vscode").lazy_load({paths = "~/.config/nvim/my_snippets"})

  -- or relative to the directory of $MYVIMRC
  -- または $MYVIMRC のディレクトリからの相対パス
  require("luasnip.loaders.from_vscode").load({paths = "./my_snippets"})

```
~~~

本当は`paths`を指定しなければ勝手に探してくれるんですが、
わたしは`package.json`を`rtp`直下に置きたくなかったので、パスを指定する形をとってます😅

```admonish note
突然`rtp`とか言い出しちゃったんですけど、これは`r`un`t`ime `p`ath の略でしょう (おそらく)。

単純に`rtp`でweb検索すると`Real-time Transport Protocol`が出てくるんですが、これは関係無いはず🧐
```

~~~admonish example title="~/.config/nvim/snippets/all.json"
```lua
require('luasnip.loaders.from_vscode').lazy_load {
  paths = {
    './snippets',
  },
}
```
~~~

```admonish tip
`paths`には`package.json`のいるパスを教えてあげてください😉
```

そしたらなんか適当に`nvim`を起動して、`Insert`モードからおもむろに "t" を入力してみましょう。

|Step 1.|Step 2.|
|:---:|:---:|
|![snip-example1](img/snip-example1.webp)|![snip-example2](img/snip-example2.webp)|

「これが`snippet`かぁ〜。」っていうのが伝わるといいな🥹 ...伝わったかな❓

```admonish note
今回は`prefix`に`test`と設定しているため、入力された "t" から`test`を候補に挙げてくれるんですね😆
```

## I'll take you all.

ということで、ようやくスニペットが動きました。

もし今までに手塩にかけて育ててきたスニペットがいれば、それはもう即戦力❗

```admonish success title=""
She's the kind of a girl that makes "The News of the World"

Yes, you could say she was attactively built

彼女は "The News of the World" に載るような子だよ

そうさ、彼女は魅力的だと言っていい
```

わたし自身はと言えば、自分のスニペットはほぼ育ててないんですよねー😅

同じように「育ててないよー」ってな人も (おそらく) いると思うので、
前回ぬるっと出ていた`Friendly snippets`に話が続いていくわけです😉

```admonish success
Gonna come out now Ha-ha-ha

Wow look out! it's-

今に出てくるよ ははは😆

おい見ろ！ あれは-
```
