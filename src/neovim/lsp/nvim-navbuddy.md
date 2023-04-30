# nvim-navbuddy

`nvim-navic`で紹介されているように、完全なパンくず{{footnote:
パンくずリスト（breadcrumb list）は、ウェブサイト内でのウェブページの位置を、
ツリー構造を持ったハイパーリンクの一覧として示すもの。パンくずナビ、トピックパス、フットパスとも言う。

英語では単に“breadcrumbs”または“breadcrumb navigation”というのが一般的である。

ウェブディレクトリのような大規模なウェブサイト内で、
利用者がサイト内での現在位置を見失わないようにし、ナビゲーションを助けるために使われる。

「パンくずリスト」という名前は、
童話『ヘンゼルとグレーテル』で、主人公が森で迷子にならないように通り道にパンくずを置いていった、というエピソードに由来する。
[Wikipedia](https://ja.wikipedia.org/wiki/パンくずリスト)より
}}
体験ができるようにしてみましょう❗

"ヘンゼルとグレーテル" はグリム童話🧒👧 で、グリム童話はグリム兄弟👨👨 がまとめた童話集で...。

```admonish info title="[nvim-navbuddy](https://github.com/SmiteshP/nvim-navbuddy)"
A simple popup display that provides breadcrumbs like navigation feature
but in keyboard centric manner inspired by ranger file manager.

パンくずナビゲーション機能を提供するシンプルなポップアップ表示ですが、
rangerファイルマネージャに触発されたキーボード中心の方法で表示されます。
```

って、お話が迷子😿 ...あ、いつも通りでした😹

```admonish success title=""
Another red letter day

So the pound has dropped and the children are creating

また祝日だ

たとえポンドが下落しようとも 子どもたちは創作している
```

## Requirements

もうお馴染みのルーティン😊

```admonish info title="[Requirements](https://github.com/SmiteshP/nvim-navbuddy#%EF%B8%8F-requirements)"
* Neovim >= 0.8.0
* [nvim-lspconfig](https://github.com/neovim/nvim-lspconfig)
* [nvim-navic](https://github.com/SmiteshP/nvim-navic)
* [nui.nvim](https://github.com/MunifTanjim/nui.nvim)
```

ここまで来ると「ああ、それね❗」ってなることが増えてきました😆

### nvim-lspconfig

まずはこれですね。これが無いと始まりません 🐇

```admonish example title="[16.1 nvim-lspconfig](nvim-lspconfig.html)"
さて、まずはLSP活用の基盤を築きましょう❗nvim-lspconfigの登場です😆
```

```admonish note
`nvim-lspconfig`と併せて、使用する言語に対応した`LSP`がちゃんと動いている環境が必要です。

このサイトでは16.1節から16.3節までの内容です。これを見てもらえると、一通りは動くようになっているはずです。
```

### nvim-navic

んでもってこれですね。これも無いと始まらないそうです 🐇🐇

```admonish example title="[16.4 nvim-navic](nvim-navic.html)"
今回はのほほんとnvim-navicを導入してみましょう。
```

### nui.nvim

そしてもう一つ、`nui.nvim`❗このサイトでは初登場です 🐇🐇🐇

```admonish info title="[nui.nvim](https://github.com/MunifTanjim/nui.nvim)"
UI Component Library for Neovim.

Neovim 用 UI コンポーネントライブラリ。
```

今回は完全にコンポーネントとしての役割に徹してもらうので、
`nui.nvim`に対して自分で直接働きかける必要はありません。インストールするだけでOKです❗

## Setup

これもやっぱり、動かすだけならすごく簡単😉

~~~admonish example title="extensions/nvim-navbuddy.lua"
```lua
require('nvim-navbuddy').setup {
  lsp = {
    auto_attach = true,
  },
}
```
~~~

### lsp

お察しの通り、これは`nvim-navic`と全く同じです😉

#### auto_attach

```admonish info title="[Setup](https://github.com/SmiteshP/nvim-navbuddy#%EF%B8%8F-setup)"
nvim-navbuddy needs to be attached to lsp servers of the buffer to work.

nvim-navbuddy はバッファの lsp サーバにアタッチされていないと動作しません。

You can pass the navbuddy's attach function as on_attach while setting up the lsp server.
You can skip this step if you have enabled auto_attach option in setup function.

lsp サーバーのセットアップ時に on_attach として navbuddy の attach 関数を渡すことができます。
セットアップ機能で auto_attach オプションを有効にしている場合は、この手順を省略することができます。
```

え😮 こっちも省略しちゃっていいんですか❓やったね😋

## Installation

もはや迷子になる方が難しい❗

~~~admonish example title="extensions/init.lua"
```lua
  use {
    "SmiteshP/nvim-navbuddy",
    config = function() require 'extensions.nvim-navbuddy' end,
    requires = {
      'neovim/nvim-lspconfig', 'SmiteshP/nvim-navic', 'MunifTanjim/nui.nvim',
    },
  }
```
~~~

はい、できた😆

## Usage

~~~admonish info title="[Usage](https://github.com/SmiteshP/nvim-navbuddy#-usage)"
Navbuddy command can be used to open navbuddy.

Navbuddy コマンドは、navbuddy を開くために使用することができます。

```vim
:Navbuddy
```

And alternatively lua function open can also be used to open navbuddy.

また、navbuddy を開くには、lua の open 関数を使用することもできます。

```lua
:lua require("nvim-navbuddy").open()
```
~~~

~~~admonish tip
「言われなくてもわかっとるわー❗」てな事だとは思うんですが、これだとちょっと大変なので

```lua
vim.api.nvim_create_user_command('Nb', function()
  vim.cmd.Navbuddy()
end, {})
```

とか、

```lua
vim.keymap.set('n', '<leader>nb', vim.cmd.Navbuddy)
```

...とか、しておくといいかもしれません。
~~~

それでは、インストールを済ませてから呼び出してみましょう😉

![nvim-navbuddy 1](img/nvim-navbuddy1.webp)

`Telescope`と似ていますが、これは`nui.nvim`のウィンドウなので、(デフォルトでは) <kbd>h</kbd><kbd>j</kbd><kbd>k</kbd><kbd>l</kbd>でカーソルが動きます。

ちょっとこれだと例が面白くないので、
[15.11.1節](../plugin/nvim-tree-actions.html#actions)で作成した
`extensions/nvim-tree-actions.lua`で動かしてみるとこんな感じです😊

![nvim-navbuddy 2](img/nvim-navbuddy2.webp)

このリストと連動してファイル上でも選択範囲が動いていますね。ほら面白い❗🤹

```admonish note
これってわたしの感想ですけど (違ってたらごめんなさいとしか言えませんが)、
`nvim-navbuddy`は`ctags`がやっていたようなことを置き換えられるんじゃないかな❓😮
```

## No.168🔹対決⑪

```admonish quote title=""
あれだけのオーラだ...❗❗

正真正銘全てをしぼり尽くしたんだろう
```

```admonish success title=""
When you’re through with life

And all hope is lost

きみが全てを尽くして

目の前が真っ暗になったとしても
```

```admonish tip title=""
まだだね🩷
```

```admonish success title=""
It’s so easy now

Cause you got friends you can trust

安心して

きみには信頼できる仲間がいる
```

```admonish tip title=""
カンペキに勝つ♣️

だろ？Con🩷
```

```admonish success title=""
Hold out your hand

‘Cause right till the end

貴方の手を差し伸べてあげて

最後の最後まで
```

## To Complete Victory

例えば、`setup`をこんなふうに変えてみましょう。

~~~admonish example title="extensions/nvim-navbuddy.lua"
```lua
require('nvim-navbuddy').setup {
  window = {
    size = { height = '40%', width = '100%' },
    position = { row = '96%', col = '50%' },
  },

  icons = {
    File = ' ',
    Module = ' ',
    Namespace = ' ',
    Package = ' ',
    Class = ' ',
    Method = ' ',
    Property = ' ',
    Field = ' ',
    Constructor = ' ',
    Enum = ' ',
    Interface = ' ',
    Function = ' ',
    Variable = ' ',
    Constant = ' ',
    String = ' ',
    Number = ' ',
    Boolean = ' ',
    Array = ' ',
    Object = ' ',
    Key = ' ',
    Null = ' ',
    EnumMember = ' ',
    Struct = ' ',
    Event = ' ',
    Operator = ' ',
    TypeParameter = ' ',
  },

  lsp = {
    auto_attach = true,
  },
}
```
~~~

ってやってみると...

![nvim-navbuddy 3](img/nvim-navbuddy3.webp)

だいぶ雰囲気が変わりました😉

### window

`window`に関してはわたしの好みでカスタマイズしてあります。

パラメータを見れば何が変わるのかなんて、大体想像つきますよね❗
`size`と`position`ですもんね❗...説明は無くてもいいですよね😅

パーセンテージで指定するところがちょっとクセに見えるかも知れません。

### icon

これは`nvim-navic`にもあったやつですね😉

わたしは`VSCode like`なアイコンに変えてますが、当然しなくてもいいです。

お好みでどうぞ❗

## Optional Features

まだ終わらない...❗

~~~admonish example title="extensions/init.lua"
```diff
  use {
    "SmiteshP/nvim-navbuddy",
    config = function() require 'extensions.nvim-navbuddy' end,
    requires = {
      'neovim/nvim-lspconfig', 'SmiteshP/nvim-navic', 'MunifTanjim/nui.nvim',
+     'numToStr/Comment.nvim', 'nvim-telescope/telescope.nvim',
    },
  }
```
~~~

### Comment.nvim

```admonish info title="[// Comment.nvim](https://github.com/numToStr/Comment.nvim)"
⚡Smart and Powerful commenting plugin for neovim ⚡

⚡neovimのスマートでパワフルなコメントプラグイン ⚡
```

`Comment.nvim`も初登場です❗ですが今回はインストールするだけでOKです。

`nvim-navbuddy`から使用するだけであれば`setup`も必要ありません😉

```admonish tip
とはいえ、本来は`nvim-navbuddy`を介さずに単体で動作するプラグインです。

今後このサイトで別途取り上げるかは未定ですが、ぜひ活用してみて❗
```

これを使うと何ができるかっていうと、例えば適当なところで<kbd>c</kbd>をぽちっとすると...😮

![nvim-navbuddy&Comment](img/nvim-navbuddy-comment.webp)

選択されている構文がまとめてコメントアウトできるんですね🌟

元に戻す場合も同じく<kbd>c</kbd>で出来ちゃいます😆

### Telescope.nvim

`Comment.nvim`の時と同様に、`nvim-navbuddy`から今度は<kbd>t</kbd>をぽちっ❗

![nvim-navbuddy&Telescope](img/nvim-navbuddy-telescope.webp)

なんだかすごそう❗

もうここまで来ると、正直わたしは使いこなせていません🤯

~~~admonish tip
これもやっぱり`Telescope`のサイズを変えたくなるんですけど、
その場合は`nvim-navbuddy`の`setup`で、キーコンフィグを例えばこんなんとかするといいです🐱

```lua
local actions = require 'nvim-navbuddy.actions'

--require('nvim-navbuddy').setup {

  mappings = {
    ['t'] = actions.telescope {
      layout_config = {
        height = 0.40,
        width = 0.90,
        prompt_position = 'top',
        preview_width = 0.70,
      },
      layout_strategy = 'horizontal',
    },
  },

--}
```
~~~

## Similarly for other languages

今回は全て`lua`で話を進めてしまっていますが、これに限らず`LSP`さえ動いていれば割となんでもいけるクチです。

![markdown](img/nvim-navbuddy-markdown.webp)

```admonish note
上のスクリーンショットは、`Markdown`に対して`marksman`が動いてます。これもやっぱり`mason`からインストールしてます😉

行こうみんなで「marksman」🎶{{footnote: よしいくぞうってなるやつ🤣}}
```

## I'll take you all.

ちょこっとだけ触れるだけのつもりが、結構ガッツリ触れちゃいました😋

```admonish tip title=""
みんなの力があったからだよ。

全員(チーム) の勝利ってやつさ🩷
{{footnote: なんか知らない間にドッジボールが続いていましたが、こっちも完結❗}}
```

さらっといいことも言います🤫

という事で、やっと書き終わりました。あーお腹すいたー...。

お台場青海地区P区画{{footnote: ん⁉️ "地区P" とは言わないんれすね❗(これ言いたかっただけ😆)}}で"肉フェス"やってるんだって...、喰いたい🍖

って、お話が迷子😿 ...あ、いつも通りでした😹

```admonish success title=""
Friends will be friends
{{footnote: Friends Will Be Friends (by [Queen](https://en.wikipedia.org/wiki/Queen_(band))):
Freddie Mercury と John Deacon が作曲し、1986年6月9日にアルバム『A Kind of Magic』のシングルとしてリリースされた。
[Wikipedia](https://en.wikipedia.org/wiki/Friends_Will_Be_Friends)より。

絶対不変と思われていたQueenのライブセットリスト (Roger の "Radio Ga Ga"、Brian の "We Will Rock You" と Freddie の"We Are the Champions") に、
最後にして John の "Friends Will Be Friends" が加わった❗っていうエピソードすき。
}}

友達は いつまでも友達
```

```admonish success
今日も頑張ったね、おつかれさま❗

それでは楽しいゴールデンウィークを🤗
```
