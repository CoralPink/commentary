# nvim-scrollbar

聖夜🌃 は間近です。その前にスクロールバーを追加してみます🎄

```admonish info title="[nvim-scrollbar](https://github.com/petertriho/nvim-scrollbar)"
Extensible floating scrollbars for Neovim

Neovim 用の拡張可能なフローティングスクロールバー
```

```admonish info title=""
`nvim-scrollbar` shows one floating scrollbar for each source window. Each split window gets its own thumb.
The scrollbar has typed mark lanes, optional screen-line positions that follow wraps and folds, and mouse navigation.
An optional floating minimap shows a compressed view of the buffer, with a viewport tint, a cursor accent, provider marks, and mouse navigation.

`nvim-scrollbar` は、ソースウィンドウごとに 1 つのフローティングスクロールバーを表示します。
分割された各ウィンドウには、それぞれ独自のスクロールバーのつまみが用意されています。
このスクロールバーには、タイプ別マークレーン、改行や折り畳みに追従するオプションの画面行位置、およびマウスによるナビゲーション機能が備わっています。
オプションのフローティングミニマップは、バッファの圧縮表示を表示し、ビューポートの色付け、カーソルの強調表示、プロバイダーマーク、およびマウスによるナビゲーション機能を備えています。
```

```admonish abstract title="Requirements"
- Neovim 0.11 or newer
- For mouse interaction, the Neovim `mouse` option must enable the modes that
  you want, for example `set mouse=a`. The plugin never changes `mouse`.
- Optional integrations:
  [gitsigns.nvim](https://github.com/lewis6991/gitsigns.nvim),
  [mini.diff](https://github.com/nvim-mini/mini.diff),
  [vim-signify](https://github.com/mhinz/vim-signify),
  [vgit.nvim](https://github.com/tanvirtin/vgit.nvim),
  [ALE](https://github.com/dense-analysis/ale), and
  [coc.nvim](https://github.com/neoclide/coc.nvim)
```

このサイトでは[gitsigns.nvim](./gitsigns.html)と連携するところまでを目標として進みます😉

ちなみに、このページの初掲は 2022年のクリスマスイブなんですが、2026年の`v2`に合わせて改定しています。

> On 2026-11-16, v2 replaces v1 on the `main` branch.
> v2 changes the `setup()` options, removes the `scrollbar.handlers` modules, and needs Neovim 0.11 or newer.
> To keep v1, pin the `v1` branch or the `v1.0.0` tag. See [#121](https://github.com/petertriho/nvim-scrollbar/issues/121).
>
> 2026年11月16日、`main`ブランチにおいてv2がv1に置き換わります。
> v2では、`setup()`のオプションが変更され、`scrollbar.handlers`モジュールが削除されており、Neovim 0.11以降が必要です。
> v1を維持するには、`v1`ブランチまたは`v1.0.0`タグを固定してください。#121を参照してください。

パッケージマネージャーに関しては`packer`のままになってますが...😣

## Installation

これはとりあえず Quick Start で示されているコードを入れてみましょう。

~~~admonish example title="extensions/nvim-scrollbar.lua"
```lua
require("scrollbar").setup({
  providers = {
      search = { incsearch = true },
      marks = { numbers = true },
  },
  scrollbar = {
      preset = "zed",
      autohide = true,
  },
})
```
~~~

```admonish quote title=""
If I could reach the stars

Pull one down for you

もし 星に手が届くなら

きみにひとつ とってあげる
```

```admonish quote title=""
Shine it on my heart

So you could see the truth

それで僕の心を照らしてほしい

そしたらちゃんと見えるから
```

### gitsing.nvim (Optional)

`gitsigns.nvim`を使用したい場合は`providers`でこれを使うことを教えてあげましょう。

~~~admonish example title="extensions/nvim-scrollbar.lua"
```diff
require("scrollbar").setup({
  providers = {
      search = { incsearch = true },
      marks = { numbers = true },
+     gitsigns = true,
  },
  scrollbar = {
      preset = "zed",
      autohide = true,
  },
})
```
~~~

...で、さらに`packer`にも教えといてあげると親切だと思います。🫶

~~~admonish example title="extensions/init.lua"
```lua
  use {
    'petertriho/nvim-scrollbar',
    config = function() require 'extensions.nvim-scrollbar' end,
    requires = {
      'lewis6991/gitsigns.nvim',
    },
  }
```
~~~

これでバッチリです😆

```admonish quote title=""
That this love I have inside

Is everything it seems

僕の内にあるこの愛がすべてだよ

ほらね 見かけによらないだろ
```

![scrollbar-gitsign](img/scrollbar-gitsigns.jxl)

`autohide`が`true`になっているので、`nvim`を開いた直後では何も変化がないように見えますが、
何か操作をすれば右端にスクロールバーが現れるはずです。

```admonish quote title=""
But for now I find

It's only in my dreams

でも今のところ

これはただ 夢の中に過ぎない
```

## Configuration

もし細かく設定したい場合は[Configuration](https://github.com/petertriho/nvim-scrollbar/blob/refactor/v2/docs/configuration.md)にある
Defaults を参照すると良いです。

Quick Start を無視して挙げるんですが、まあ例えばこんなんとか❓

~~~admonish abstract title="Example"
```lua
require('scrollbar').setup({
  scrollbar = {
    window = {
      border = 'rounded',
    },
  },
  providers = {
    diagnostic = { minimap = false },
    gitsigns = true,
    search = { incsearch = true, minimap = false },
  },
})
```
~~~

![scrollbar-v2](img/scrollbar-v2.jxl)

`v2`に切り替えてから、そこまで使い込んでいるわけではありませんが、わたしはひとまずこれに落ち着いてます。

### Minimap

特筆すべきところとしては、`v2`では`Minimap`が追加されました。

~~~admonish info title="minimap"
```lua
require("scrollbar").setup({

  -- ...

  minimap = {
    enabled = true,
  },
})
```
~~~

`nvim-scrollbar`に限らず、わたしは minimap の良さがいまいち分かってない人間なので使ってないんですけどね😅

## Wrap Up

うまくいきましたね😄

なんかもうクリスマス気分で 2024年の video を差し込んじゃいます。

```admonish success title=""
<video width="1280" height="720" data-poster="img/tokyo-midtown-thumbnail.jxl">
  <source src="img/tokyo-midtown.webm" type="video/webm">
</video>
```

2年なんてびっくりするぐらい "あっ❗" という間でした。
(まあ、正確にはまだ 11月なんですが...😅)

スクロールバーと関係があるのかって言われたら "ねぇな🙄" としかなりません。

...でもまあ、そんなこんなありましたということで❗

```admonish success title="Assemble"
A very merry Christmas❗🍾 {{footnote:
[Happy Xmas (War Is Over)](https://en.wikipedia.org/wiki/Happy_Xmas_(War_Is_Over)):
by [John & Yoko / Plastic Ono Band](https://en.wikipedia.org/wiki/Plastic_Ono_Band)
with the [Harlem](https://en.wikipedia.org/wiki/Harlem) Community Choir
}}
```

```admonish success title=""
<div style="text-align: center; font-weight: bold" translate="no">
<div style="font-size: 800%; line-height: 0;">

WAR

IS

OVER!
</div>
<div style="font-size: 150%; font-weight: bold">
IF YOU WANT IT
</div>
</div>
```

```admonish success title=""
<div style="text-align: center; font-size: 120%">
戦争は終わる　あなたがそう望むなら
</div>
```

```admonish quote title=""
And I can change the world{{footnote:
[Change The World](https://en.wikipedia.org/wiki/Change_the_World):
この曲は、名も知らぬ女性に愛を伝えたいという願望を表現している。
最も有名なのは [Eric Clapton](https://en.wikipedia.org/wiki/Eric_Clapton) のバージョンだが、
これよりも先に[Wynonna Judd](https://en.wikipedia.org/wiki/Wynonna_Judd) がアルバム収録曲としてリリースしている。

2013年、Clapton は Mojo 誌のインタビューで、
楽曲制作者の一人である[Tommy Sims](https://en.wikipedia.org/wiki/Tommy_Sims)が作成したデモテープを聴いたとき、
"なんだか[Paul McCartney](https://en.wikipedia.org/wiki/Paul_McCartney) が演奏しているように感じられた" と語っている。
[Wikipedia](https://en.wikipedia.org/wiki/Change_the_World)より
}}

ぼくは 世界を変えられる
```

```admonish quote title=""
I will be the sunlight in your universe

You would think my love was really something good

きみの世界を差す陽になるよ

気に入ってもらえたら とても嬉しいな
```

```admonish quote title=""
Baby if I could change the world{{footnote:
曲中の語り手は、自分の人生に劇的な変化が起こらない限り、この愛が報われることはないだろうと恐れている。
}}

もし世界を変えられるなら きみに...
```

<div style="margin-top: 2em"></div>

なんかまた気まぐれで 2026年まで Let it Go しちゃいます。{{footnote:
このシチュエーションよくわか...いや、怒られるよ🤫
}}

<youtube-video data-id="k2_HsERDNZM"></youtube-video>

2年なんて、ぼーっとしてたらあっという間にスクロールしていきます🙄

<div style="margin-top: 2em"></div>
