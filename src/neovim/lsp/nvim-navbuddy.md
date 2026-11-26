# nvim-navbuddy

<div style="margin-top: 2em"></div>

> 貧しい木こりの家に、ヘンゼルという兄とグレーテルという妹がいました。
>
> 食べ物がなくなり、継母は子どもたちを森に捨てようと父親を説得します。

<div style="margin-top: 2em"></div>

> ヘンゼルはその話を聞いて、夜のうちに外へ出て小石を拾い、翌朝、森へ連れて行かれるときに道に落としていきました。
>
> 森の中で両親が去ってしまいますが、小石をたどって自分たちだけで家に帰ることができました。

<div style="margin-top: 2em"></div>

> 継母はあきらめず、もう一度子どもたちを森へ置き去りにしました。
>
> ヘンゼルは、今度はパンくずを落として道しるべにしましたが、鳥たちに食べられてしまい、兄妹は迷子になります。

<div style="margin-top: 2em"></div>

"ヘンゼルとグレーテル" はグリム童話🧒👧 で、グリム童話はグリム兄弟👨👨 がまとめた童話集で...。

って、いきなりお話が迷子😿 ...あ、いつも通りでした😹

気を取り直して、[nvim-navic](http://localhost:8080/commentary/neovim/lsp/nvim-navic.html)で紹介されていたように、完全なパンくず{{footnote:
パンくずリスト（breadcrumb list）は、ウェブサイト内でのウェブページの位置を、
ツリー構造を持ったハイパーリンクの一覧として示すもの。パンくずナビ、トピックパス、フットパスとも言う。

英語では単に "breadcrumbs" または "breadcrumb navigation" というのが一般的である。

ウェブディレクトリのような大規模なウェブサイト内で、
利用者がサイト内での現在位置を見失わないようにし、ナビゲーションを助けるために使われる。

"パンくずリスト" という名前は、童話[ヘンゼルとグレーテル](https://en.wikipedia.org/wiki/Hansel_and_Gretel)で、
主人公が森で迷子にならないように通り道にパンくずを置いていった、というエピソードに由来する。
[Wikipedia](https://ja.wikipedia.org/wiki/パンくずリスト)より
}}
体験ができるようにしてみましょう❗

```admonish info title="[nvim-navbuddy](https://github.com/SmiteshP/nvim-navbuddy)"
A simple popup display that provides breadcrumbs like navigation feature
but in keyboard centric manner inspired by ranger file manager.

パンくずナビゲーション機能を提供するシンプルなポップアップ表示ですが、
rangerファイルマネージャに触発されたキーボード中心の方法で表示されます。
```

```admonish success title=""
Another red letter day

あぁ まったく 素晴らしい一日だ
```

## Requirements

もうお馴染みのルーティン😊

```admonish abstract title="[Requirements](https://github.com/SmiteshP/nvim-navbuddy#%EF%B8%8F-requirements)"
* Neovim >= 0.8.0
* [nvim-lspconfig](https://github.com/neovim/nvim-lspconfig)
* [nvim-navic](https://github.com/SmiteshP/nvim-navic)
* [nui.nvim](https://github.com/MunifTanjim/nui.nvim)
```

ここまで来ると「ああ、それね❗」ってなることが増えてきました😆

```admonish success title=""
So the pound has dropped

And the children are creating

ポンドの下落は底が見えないし

子どもたちは騒ぎを起こす
```

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

```admonish success title=""
The other half ran away

それであいつは逃げ出してしまったよ
```

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

```admonish success title=""
Taking all the cash

And leaving you with the lumber

預金は全部持ち去られ

面倒だけが君に残った
```

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

```admonish success title=""
Got a pain in the chest

胸が痛む
```

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

![nvim-navbuddy 1](img/nvim-navbuddy1.jxl)

`Telescope`と似ていますが、これは`nui.nvim`のウィンドウなので、(デフォルトでは) <kbd>h</kbd><kbd>j</kbd><kbd>k</kbd><kbd>l</kbd>でカーソルが動きます。

ちょっとこれだと例が面白くないので、
[15.11.1節](../plugin/nvim-tree-actions.html#actions)で作成した
`extensions/nvim-tree-actions.lua`で動かしてみるとこんな感じです😊

![nvim-navbuddy 2](img/nvim-navbuddy2.jxl)

このリストと連動してファイル上でも選択範囲が動いていますね。ほら面白い❗🤹

```admonish note
これってもしかして `nvim-navbuddy`は`ctags`がやっていたようなことを置き換えられるんじゃないかな❓😮
```

## No.168🔹対決⑪

<div style="color: #999999; font-size: 90%; text-align: center;">
<div style="margin-top: 4em">
Doctor's on strike

What you need is a rest

医者はストライキ中だ

今はゆっくり休んだほうがいい
</div>

<div style="margin-top: 4em">
It's not easy, love

まあ簡単には行かないよな
</div>
<div style="margin-top: 4em"></div>
</div>

```admonish tip title=""
あれだけのオーラだ...❗❗

正真正銘全てをしぼり尽くしたんだろう
```

<div style="color: #999999; font-size: 90%; text-align: center;">
<div style="margin-top: 4em">
But you got friends you can trust

でも 君には信頼できる友達がいる
</div>

<div style="margin-top: 4em">
Friends will be friends

友達はずっと友達
</div>

<div style="margin-top: 4em">
When you're in need of love

They give you care and attention

愛が必要なとき

君を想い 気遣ってくれる
</div>
<div style="margin-top: 4em"></div>
</div>

```admonish quote title=""
まだだね🩷
```

<div style="color: #999999; font-size: 90%; text-align: center;">
<div style="margin-top: 4em">
Friends will be friends{{footnote:
Friends Will Be Friends (by [Queen](https://en.wikipedia.org/wiki/Queen_(band))):
[Freddie Mercury](https://en.wikipedia.org/wiki/Freddie_Mercury)と[John Deacon](https://en.wikipedia.org/wiki/John_Deacon)によって作詞・作曲され、
1986年6月9日にアルバム[A Kind of Magic](https://en.wikipedia.org/wiki/A_Kind_of_Magic)のシングルとしてリリースされた。
イギリスでのリリースは、バンドにとって通算30枚目のシングルとなり、チャートでは最高14位を記録した。

この曲は[The Magic Tour](https://en.wikipedia.org/wiki/Magic_Tour_(Queen))でライブ演奏された。
1977年の[News of the World Tour](https://en.wikipedia.org/wiki/News_of_the_World_Tour)以来、
コンサート終盤の[We Will Rock You](https://en.wikipedia.org/wiki/We_Will_Rock_You)と[We Are the Champions](https://en.wikipedia.org/wiki/We_Are_the_Champions)の間に演奏された、
初めてにして唯一の曲であることは特筆すべき点である。
}}

友達はずっと友達
</div>

<div style="margin-top: 4em">
When you're through with life

And all hope is lost

もう 全てを出し尽くして

目の前が真っ暗になった時は
</div>

<div style="margin-top: 4em">
Hold out your hands

その手を伸ばせばいいんだ
</div>
<div style="margin-top: 4em"></div>
</div>

```admonish quote title=""
カンペキに勝つ♣️

だろ？Con🩷
```

<div style="color: #999999; font-size: 90%; text-align: center;">
<div style="margin-top: 4em">
'Cause friends will be friends

だって、友達はいつまでも友達だから
</div>

<div style="margin-top: 4em">
Right till the end{{footnote:
この曲の調はト長調 (G major) で、[Brian May](https://en.wikipedia.org/wiki/Brian_May)の旋律的なギター演奏スタイルが大きく取り入れられている。
ライブで初めて演奏されたのは The Magic Tour の2公演目、[Leiden](https://en.wikipedia.org/wiki/Leiden)での公演だった。

Queen は Leiden での最初の 2公演ではフルバージョンを演奏したが、6月14日の[Paris](https://en.wikipedia.org/wiki/Paris)公演からアレンジを短縮した。
この短縮版は[Live at Wembley '86](https://en.wikipedia.org/wiki/Live_at_Wembley_%2786)に収録されている。

ライブ演奏では、いずれのバージョンもヘ長調 (F major) で演奏され、原曲から全音下げて移調されていた。
}}

そう、いつまでも
</div>
<div style="margin-top: 4em"></div>
</div>

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

![nvim-navbuddy 3](img/nvim-navbuddy3.jxl)

だいぶ雰囲気が変わりました😉

```admonish success title=""
Now it's a beautiful day

今日はなんて素敵な日なんだろう
```

### window

`window`に関してはわたしの好みでカスタマイズしてあります。

パラメータを見れば何が変わるのかなんて、大体想像つきますよね❗
`size`と`position`ですもんね❗...説明は無くてもいいですよね😅

パーセンテージで指定するところがちょっとクセに見えるかも知れません。

```admonish success title=""
The postman delivered

A letter from your lover

郵便屋さんが届けてくれた

恋人からの手紙
```

### icons

これは`nvim-navic`にもあったやつですね😉

わたしは`VSCode like`なアイコンに変えてますが、当然しなくてもいいです。

お好みでどうぞ❗

```admonish success title=""
Only a phone call away

電話一本でつながれるはずなのに
```

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

```admonish success title=""
You try to track him down

But somebody stole his number

彼を探し出そうとしても

誰かに電話番号を奪われてしまった
```

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

![nvim-navbuddy&Comment](img/nvim-navbuddy-comment.jxl)

選択されている構文がまとめてコメントアウトできるんですね🌟

元に戻す場合も同じく<kbd>c</kbd>で出来ちゃいます😆

```admonish success title=""
As a matter of fact

実を言えば
```

```admonish success title=""
You're getting used to life

Without him in your way

彼のいない生活にも

だんだん慣れてきた
```

### Telescope.nvim

`Comment.nvim`の時と同様に、`nvim-navbuddy`から今度は<kbd>t</kbd>をぽちっ❗

![nvim-navbuddy&Telescope](img/nvim-navbuddy-telescope.jxl)

なんだかすごそう❗

もうここまで来ると、正直わたしは使いこなせていません🤯

~~~admonish tip
これもやっぱり`Telescope`のサイズを変えたくなるんですけど、
その場合は`nvim-navbuddy`の`setup`で、キーコンフィグを例えばこんなんとかするといいです🐱

```lua
local actions = require 'nvim-navbuddy.actions'

require('nvim-navbuddy').setup {

  -- (中略)

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

  -- (中略)

}
```
~~~

```admonish success title=""
It's so easy now

だいぶ楽になったよ
```

```admonish success title=""
'Cause you got friends you can trust

だって 信頼できる友達がいるから
```

## Similarly for other languages

今回は全て`lua`で話を進めてしまっていますが、これに限らず`LSP`さえ動いていれば割となんでもいけるクチです。

![markdown](img/nvim-navbuddy-markdown.jxl)

```admonish note
上のスクリーンショットは、`Markdown`に対して`marksman`が動いてます。これもやっぱり`mason`からインストールしてます😉
```

```admonish success title=""
Friends will be friends

友達はずっと友達
```

## Friends Will Be Friends

ちょこっとだけ触れるだけのつもりが、結構ガッツリ触れちゃいました😋

```admonish tip title=""
みんなの力があったからだよ。

全員(チーム) の勝利ってやつさ🩷{{footnote:
なんか知らない間にドッジボールが続いていましたが、こっちも完結❗
}}
```

さらっといいことも言います🤫

という事で、やっと書き終わりました。あーお腹すいたー...。

<div style="margin-top: 4em"></div>

> 森をさまよっていた二人は、パンやケーキ、砂糖でできた "お菓子の家" を見つけます。
>
> お腹が空いていたので、家の壁や屋根を食べていると、家の中からおばあさんが出てきて、二人を家に招き入れます。

<div style="margin-top: 2em"></div>

> 実はそのおばあさんは、子どもを食べる恐ろしい魔女でした。
>
> ヘンゼルを檻に閉じ込めて太らせ、グレーテルには料理や家事をさせます。
>
> 魔女は太ったヘンゼルを食べようとしていたのです。

<div style="margin-top: 2em"></div>

> 魔女はヘンゼルをかまどで焼こうとしますが、最後にはグレーテルまで食べようとします。
>
> グレーテルは魔女に「かまどの中をどうやって確かめるの？」と尋ね、魔女が自分でかまどを覗き込んだところを、後ろから押して中に閉じ込めます。
>
> こうして兄妹は魔女を倒し、ヘンゼルを救い出します。

<div style="margin-top: 2em"></div>

> 魔女の家から宝石を持ち帰った二人は、父親と再会します。
>
> 二人が森で恐ろしい目に遭っている間に、継母は亡くなっていました。
>
> 父親は子どもたちの帰還を心から喜び、家族は再び一緒に暮らすことになります。
>
> 宝石によって貧しさからも解放され、父親と子どもたちは幸せに暮らしました。

<div style="margin-top: 4em"></div>

```admonish success
めでた〜し、めでたし。...なのかぁ❓
```

<div style="color: #999999; font-size: 90%; text-align: center;">
<div style="margin-top: 8em">
It's so easy now

だいぶ気が楽になっただろ
</div>

<div style="margin-top: 4em">
Cause you got friends you can trust

君には信頼できる友達が もういるんだ
</div>

<div style="margin-top: 4em">
Friends will be friends

友達はずっと友達
</div>

<div style="margin-top: 4em">
When you're in need of love

They give you care and attention

愛が必要なとき

君を想い 気遣ってくれる
</div>

<div style="margin-top: 4em">
Friends will be friends

友達はいつまでも友達
</div>

<div style="margin-top: 4em">
When you're through with life

And all hope is lost

もう生きるのに疲れ果て

目の前が真っ暗になった時は
</div>

<div style="margin-top: 4em">
Hold out your hands

ただ手を伸ばせばいいんだ
</div>

<div style="margin-top: 4em">
'Cause friends will be friends

友達はいつまでも友達なんだから
</div>

<div style="margin-top: 4em">
Right till the end

そう、いつまでも
</div>

<div style="margin-top: 12em">
Friends will be friends

友達はずっと友達
</div>

<div style="margin-top: 4em">
When you're in need of love

They give you care and attention

愛が必要なとき

人を想い、心を配ってあげられる
</div>

<div style="margin-top: 4em">
Friends will be friends

友達はいつまでも友達
</div>

<div style="margin-top: 4em">
When you're through with life

And all hope is lost

もう生きるのに疲れ果て

目の前が真っ暗になっているのなら
</div>

<div style="margin-top: 4em">
Hold out your hand

あなたの手を差し伸べてあげて
</div>

<div style="margin-top: 4em">
'Cause right till the end

最後の最後まで
</div>

<div style="margin-top: 4em">
Friends will be friends, yeah{{footnote:
ミュージックビデオは DoRo が監督し、1986年5月に[Wembley](https://en.wikipedia.org/wiki/Wembley)の JVCスタジオで撮影された。
ファンクラブのメンバーを前に、バンドがこの曲を演奏する様子が映されている。
演奏中、Mercury は観客とハイタッチを交わす。曲の終わりにはマイクを切り、観客に歌をリードさせながら、彼らと一緒に歌う。
この演奏は、こうした演出から "Queen's Greatest Show Never Performed" という愛称で呼ばれた。
[Wikipedia](https://en.wikipedia.org/wiki/Friends_Will_Be_Friends)より
}}

いつまでも最高の友たちへ❗
</div>
</div>

<div style="margin-top: 4em"></div>
