# nvim-scrollbar

聖夜🌃 は間近です。その前にスクロールバーを追加してみます🎄

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

...で、それぞれのプラグインを必要とします。`packer`にも教えといてあげましょう🫶

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

```admonish quote title=""
That this love I have inside

Is everything it seems

僕の内にあるこの愛がすべてだよ

ほらね 見かけによらないだろ
```

|gitsigns|
|:---:|
|![scrollbar-gitsign](img/scrollbar-gitsigns.avif)|

|nvim-hlslens|
|:---:|
|![scrollbar-hlslens](img/scrollbar-hlslens.avif)|

スクリーンショットでは少しわかりにくいかも知れませんが、検索文字列の行もスクロールバー上で表示がされてます😆

```admonish quote title=""
But for now I find

It's only in my dreams

でも今のところ

これはただ 夢の中に過ぎない
```

## Wrap Up

このページは 2022年のクリスマスイブに書かれたものなんですが、
なんか急に気まぐれで 2年後のムービーを差し込んじゃいます。

```admonish success title=""
<video preload="metadata" width="1280" height="720" poster="img/tokyo-midtown-thumbnail.avif">
  <source src="img/tokyo-midtown.webm" type="video/webm">
</video>
```

2年なんてびっくりするぐらい 「あっ❗」  という間でした。
(まあ、正確にはまだ 11月なんですが...😅)

スクロールバーと関係があるのかって言われたら 「ねぇな🙄」 としかなりません。

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
