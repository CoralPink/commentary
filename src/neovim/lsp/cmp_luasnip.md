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
タイトルの "polythene" は、ポリエチレンの (主にイギリスでの) 別称。

1980年、Lennon は Polythene Pam についてこう語っている:「ジャージーのとある女性と、イギリスの
"[Allen Ginsberg](https://en.wikipedia.org/wiki/Allen_Ginsberg)に対する答えのような男" とのちょっとした出来事を思い出していたんだ。
ツアー中に彼に会って、彼のアパートに連れて行かれたんだけど、僕は女連れで、向こうにも僕に会わせたいという女がいた。
彼は彼女が "polythene の服を着ている" と言った。」
}}

She's so good-looking but she looks like a man

まあ、ポリエチレンを纏ったパムを見てみなよ

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

  sources = cmp.config.sources {
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

軍用ブーツとキルトを着けた彼女を見てみなよ{{footnote:
「これは僕の模造だ。彼女はジャックブーツもキルトも履いていなかった。
ポリ袋の中の変態的なセックス。とにかく曲のネタが欲しかったんだ。」

彼はまた、この曲のインスピレーションを
"ジャックブーツとキルトを身にまとった神話的な[Liverpool](https://en.wikipedia.org/wiki/Liverpool) の清掃員" と表現した。
}}

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

![snip-dir](img/snip-dir.avif)
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

|||
|:---:|:---:|
|**Step1.**|![snip-example1](img/snip-example1.avif)|
|**Step2.**|![snip-example2](img/snip-example2.avif)|

「これが`snippet`かぁ〜。」っていうのが伝わるといいな🥹 ...伝わったかな❓

```admonish note
今回は`prefix`に`test`と設定しているため、入力された "t" から`test`を候補に挙げてくれるんですね😆
```

## Polythene Pam

ということで、ようやくスニペットが動きました。

もし今までに手塩にかけて育ててきたスニペットがいれば、それはもう即戦力❗

```admonish success title=""
She's the kind of a girl that makes "The News of the World"

Yes, you could say she was attactively built

彼女は "The News of the World" に載るような子だよ

そうさ、彼女は魅力的だと言っていい{{footnote:
この曲は、非常に強い Liverpool 訛りの[Scouse](https://en.wikipedia.org/wiki/Scouse)で歌われている。

Harrison は、テレビシリーズ "The Beatles Anthology" のインタビューで、
「僕がこの曲を気に入ったのは、すごく Liverpool っぽかったからだ。
コミカルでありながら、シリアスなところもある曲を書く人間はいなかった。
この曲はとても上出来なロックンロール・ナンバーだったけど、明らかにジョークなのに、誰も笑わず、
誰もピンときていないと、もどかしくなってくることもある」と語っている。
[Wikipedia](https://en.wikipedia.org/wiki/Polythene_Pam)より
}}
```

わたし自身はと言えば、自分のスニペットはほぼ育ててないんですよねー😅

同じように「育ててないよー」ってな人も (おそらく) いると思うので、
前回ぬるっと出ていた`Friendly snippets`に話が続いていくわけです😉

```admonish success
Gonna come out now Ha-ha-ha

今に出てくるよ ははは

<div class="slider">
  <div class="media">
    <video preload="none" width="1280" height="720" poster="img/nya-shougi-ondo-thumbnail.avif" loading="lazy">
      <source src="img/nya-shougi-ondo.webm" type="video/webm">
    </video>
    <video preload="none" width="1280" height="720" poster="img/tokyo-yakei-1a-thumbnail.avif" loading="lazy">
      <source src="img/tokyo-yakei-1a.webm" type="video/webm">
    </video>
    <video preload="none" width="1280" height="720" poster="img/tokyo-yakei-1b-thumbnail.avif" loading="lazy">
      <source src="img/tokyo-yakei-1b.webm" type="video/webm">
    </video>
  </div>
</div>

Wow look out! it's-

おい見ろ！あれは-

<div class="slider">
  <div class="media">
    <video preload="none" width="1280" height="720" poster="img/saitama-tokyo-thumbnail.avif" loading="lazy">
      <source src="img/saitama-tokyo.webm" type="video/webm">
    </video>
    <video preload="none" width="1280" height="720" poster="img/tokyo-yakei-2a-thumbnail.avif" loading="lazy">
      <source src="img/tokyo-yakei-2a.webm" type="video/webm">
    </video>
    <video preload="none" width="1280" height="720" poster="img/tokyo-yakei-2b-thumbnail.avif" loading="lazy">
      <source src="img/tokyo-yakei-2b.webm" type="video/webm">
    </video>
  </div>
</div>
```
