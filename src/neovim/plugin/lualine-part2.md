# lualine.nvim Part Ⅱ

```admonish success title=""
<div style="font-size: 500%; text-align: right;">
🌅
</div>
<div style="text-align: center;">
<div style="font-size: 280%;">
A Happy New Year!!
</div>

<div style="margin: 30px auto;">
2023年もぬるっとはじまりました。

今年もよろしくね🤗
</div>
</div>
```

このまま未来に突き進んでいくのも良いんですが、ちょっと心残りがありました。

もちろん`lualine.nvim`です。

2023年早々、いきなり過去に戻ってしまいますが、`lualine.nvim`のカスタマイズから初めます❗

...まあ、たった数週間なんですけどね😮
この程度なら "時速 88 マイル" も "1.21 ジゴワット"
<sup class="ft-reference"><button id="to-ft-1" data-href="#ft-1">1</button></sup>
も必要ないでしょう。

```admonish note
改めて明記するんですが、このサイトに記載されているカスタマイズは "完全に" わたしの好みで作ってあるし、
あくまでもそれらに対してコメントしていくってだけなので、「汲み取れるものがあったら組み込んでもらえれば〜」ぐらいの感じです。
```

...と、言うことで❗

いよいよ
[あのシーン](lualine.html#to-be-continued)まで戻っていきます...。

~~~admonish tip title=""
いよいよ　これから

きみの　ものがたりの　つづきだ❗
~~~

~~~admonish tip title=""
ゆめと　ぼうけんと❗

ｎｅｏｖｉｍの　せかいへ❗
~~~

~~~admonish tip title=""
レッツ　ゴー❗
~~~

~~~admonish quote title=""
...　...　...　...
~~~

~~~admonish question title=""
Hey, CaP..., you read me...?

(キャップ...、聞こえるか...?)
~~~

~~~admonish question title=""
...It's nvim Trainer. Can you hear me...?

(...nvimトレーナーだ。聞こえるか...?)
~~~

...❗

```admonish quote title=""
I'm back. ...I'm back from the future!!

(わたしは戻ってきたんだ。...未来から戻ってきたんだ!!)
```

~~~admonish question title=""
On your radar.

君の視界にいるよ。
~~~

## options

ここからが本番です。頑張っていきましょう❗

まずはベースとなる設定を2つ。

### separators

~~~admonish info title=":h lualine"
```txt
SEPARATORS

lualine defines two kinds of separators:

lualine は2種類のセパレータを定義しています。

- `section_separators`   - separators between sections
                           セクション間のセパレータ。

- `component_separators` - separators between the different components in sections
                           セクション内の異なるコンポーネントを区切るセパレータ
```

```lua
  options = {
    section_separators = { left = '', right = '' },
    component_separators = { left = '', right = '' }
  }
```

```txt
Here, left refers to the left-most sections (a, b, c), and right refers to the
right-most sections (x, y, z).

ここで、left は左端のセクション(a, b, c)を、right は右端のセクション(x, y, z)を意味します。
```
~~~

まあ細かいことは後にしましょう。これはもう例示されている通りにやっちゃいます😆

```admonish note
ちなみにデフォルト値は `` とか、 `` とか なので、こっちの方が好きな場合はスキップしちゃってください。
```

~~~admonish example title="extensions/lualine.lua"
```lua
require('lualine').setup {
  options = {
    section_separators = { left = '', right = '' },
    component_separators = { left = '', right = '' },
  },
}
```
~~~

### globalstatus

~~~admonish info title=":h lualine"
```txt
globalstatus = false,       -- enable global statusline (have a single statusline
                            -- at bottom of neovim instead of one for  every window).
                            -- This feature is only available in neovim 0.7 and higher.

                            グローバルステータスラインを有効にする
                            (各ウィンドウに1つではなく、neovim の下部に1つのステータスラインを表示する)。
                            この機能は、neovim 0.7以降で利用可能です。
```
~~~

これはデフォルトで無効になっているので有効化しましょう。
`options`の中に追記してください。

~~~admonish example title="extensions/lualine.lua"
```lua
--options = {
    globalstatus = true,
--},
```
~~~

## Check: options

ここまでで以下のように見た目の変化があるはずです。

|||
|:---:|:---:|
|**before**|![lualine-options-before](img/lualine-options-before.avif)|
|**after**|![lualine-options-before](img/lualine-options-after.avif)|

`separators`を変えることによって、ステータスラインがやわらか〜な印象になりましたね。

また、`global statusline`によってウィンドウを分割してもステータスラインは常に一つだけが表示されるようになりました。
なんだか無理やり押し込まれたような窮屈な表示も解消されていて、とってもいい感じですね😆


## Sections

さて、`separators`項で出てきたこれ。

```txt
Here, left refers to the left-most sections (a, b, c), and right refers to the
right-most sections (x, y, z).
```

~~~admonish info title=":h lualine-usage-and-customization"
```txt
Lualine has sections as shown below.
Lualineには以下のようなセクションがあります。

    +-------------------------------------------------+
    | A | B | C                             X | Y | Z |
    +-------------------------------------------------+

Each sections holds its components e.g. Vim’s current mode.
各セクションは、例えば Vim の現在のモードのような構成要素を保持します。
```
~~~

わかりやすいですね😉
この6つのセクションが`section_separator`で区分けされます。

ひとつのセクションの中に2つ以上の機能を入れて表示することもできます。
この場合は`component_separators`で更に区分けされます。

## statusline

じゃあ、とりあえずやってみましょう。わたしはこんなんしてます😉

~~~admonish example title="extensions/lualine.lua"
```lua
-- onenord.nvim のカラーパレットを取得する
local colors = require('onenord.colors').load()

require('lualine').setup {
--options = {
--  (省略...)
--},

  -- options と同列に並べてください。
  sections = {
    lualine_a = {
      'mode',
    },
    lualine_b = {
      {
        'filename',
        newfile_status = true,
        path = 1,
        shorting_target = 24,
        symbols = { modified = '_󰷥', readonly = ' ', newfile = '󰄛' },
      },
    },
    lualine_c = {},

    lualine_x = {
      'encoding',
    },
    lualine_y = {
      { 'filetype', color = { fg = colors.fg } },
    },

    lualine_z = {
      { 'fileformat', icons_enabled = true, separator = { left = '', right = '' } },
    },
  },
}
```
~~~

```admonish tip
「その鍵とか猫とかどっから拾ってくんねん❗」って思われるかもしれないんですが、わたしの場合は`Font Book`から。

もうなんとな〜くで拾ってきちゃいます😺

|||
|:---:|:---:|
|![fontbook1](img/fontbook1.avif)|![fontbook2](img/fontbook2.avif)|
```

![meow-meow](img/meow-meow.avif)

あらかわいい🥰

## Components

なんとなく察しがつくかと思いますが、`lualine_a`がセクション`A`に対応しています。
`B`, `C` と `X`, `Y`, `Z` も同様です。

で、それぞれのセクションの最初にある文字列が機能(コンポーネント)を指定しています。

基本機能の一覧は次の通り。

```admonish info title=":h lualine-Available-components"
- `branch` (git branch)
- `buffers` (shows currently available buffers)
- `diagnostics` (diagnostics count from your preferred source)
- `diff` (git diff status)
- `encoding` (file encoding)
- `fileformat` (file format)
- `filename`
- `filesize`
- `filetype`
- `hostname`
- `location` (location in file in line:column format)
- `mode` (vim mode)
- `progress` (%progress in file)
- `searchcount` (number of search matches when hlsearch is active)
- `tabs` (shows currently available tabs)
- `windows` (shows currently available windows)
```

以下については、それぞれ詳細が示されています。

```admonish info title=":h lualine-***-component-options"
- `filename` :h lualine-filename-component-options
- `filetype` :h lualine-filetype-component-options
- `fileformat` :h lualine-fileformat-component-options
```

`lualine_y`の`colors`とか、`lualine_z`の`separator`とかは、それこそわたしの趣味です。
もうほんとに見た目だけ❗

![lualine-sections](img/lualine-sections.avif)

うん、こんな感じですね😉

```admonish note
`lualine_c`には、もう少し先で登場する予定の`LSP`
<sup class="ft-reference"><button id="to-ft-2" data-href="#ft-2">2</button></sup>
関連の情報を表示したいと思ってます。

イメージとしては[トップページ](../../index.html)のようになるので、
まだ見ぬ仲間の登場を楽しみにしておきましょう☺️
```

## To Be Concluded...

`lualine.nvim`は...❗ なんと...❗

まだ続きます😮

やっぱりここはボリュームがありました...。
でも区切りとしてはとても自然だと思うので、やっぱり思い切ってもう一回だけ跨ぎます😆

次回、`lualine.nvim` PartⅢ  に続く。続くったら続く...🐈🐈🐈

```admonish warn title=""
Is your name CoralPink?

君の名前は CoralPink?
```

```admonish quote title=""
Yeah.

ええ。
```

```admonish warn title=""
I've got something for you.

A letter.

君に渡したいものがあるんだ。

手紙だ。
```

```admonish quote title=""
A letter for me?

That’s impossible...

わたしに手紙?

そんなことあり得ない...。
```

```admonish success title="TO BE CONCLUDED ...>"
![letter](img/letter.avif)
```

<aside class="ft-definition" role="doc-footnote" id="ft-1">
<p><sup><a href="#to-ft-1">1:</a></sup><a href="https://en.wikipedia.org/wiki/Back_to_the_Future" target="_blank" rel="noopener">Back to the Future</a> の世界ですね。
“gigawatt”（ギガワット）を誤って“jigowatt”（ジゴワット）と書いた脚本がそのまま採用されたんだって。 (どういう誤り方❓😑)
<a href="https://en.wikipedia.org/wiki/DeLorean_time_machine" target="_blank" rel="noopener">wikipedia</a>より。</p>
</aside>
<aside class="ft-definition" role="doc-footnote" id="ft-2">
<p><sup><a href="#to-ft-2">2:</a></sup><a href="https://microsoft.github.io/language-server-protocol/" target="_blank" rel="noopener">Language Server Protocol</a>の略。
Microsoftが開発したものがオープンスタンダードになっているそう。
その辺は<a href="https://en.wikipedia.org/wiki/Language_Server_Protocol" target="_blank" rel="noopener">wikipedia</a>で❗</p>
</aside>

<nav id="nav-wrapper" aria-label="Page navigation">
  <a rel="prev" href="neovim/plugin/nvim-scrollbar.html" class="chapters" id="prev" aria-label="Previous chapter: nvim-scrollbar">
    <div class="icon-prev fa-icon"></div>
    nvim-scrollbar
  </a>
  <a rel="next" href="neovim/plugin/lualine-part3.html" class="chapters" id="next" aria-label="Next chapter: lualine.nvim Part Ⅲ">
    lualine.nvim Part Ⅲ
    <div class="icon-next fa-icon"></div>
  </a>
</nav>

<div style="margin-top: 110em"></div>

```admonish warn title=""
You all right!? Need any help?

大丈夫なのか!? 助けが要るんじゃないか?
```

```admonish quote title=""
There's only one man who can help me!!

わたしを助け出してくれるのは ただ一人だ!!
```

<div style="color: #999999; font-size: 90%; text-align: center;">
<div style="margin-top: 8em">
He's a real nowhere man

彼は 何者にもなれない人
</div>

<div style="margin-top: 2em">
Sitting in his nowhere land

何処でも無い場所に蹲り
</div>

<div style="margin-top: 2em">
Making all his nowhere plans for nobody

誰も居ないのに 何処にも行き着かない計画を立てる
</div>

<div style="margin-top: 6em">
Doesn't have a point of view

狭い視野しか持たないし
</div>

<div style="margin-top: 2em">
Knows not where he's going to

何処へ向かうのか判らない
</div>

<div style="margin-top: 3em">
Isn't he a bit like you and me?

なんだか少し ぼくたちに似てないか？
</div>

<div style="margin-top: 6em">
Nowhere man, please listen

何者にもなれない人、聞いて欲しい
</div>

<div style="margin-top: 2em">
You don't know what you're missing

きみは見逃しているものを 知っていない
</div>

<div style="margin-top: 2em">
Nowhere man, the world is at your command

それでも、世界は君の意のままだ
</div>

<div style="margin-top: 6em">
He's as blind as he can be

彼は見えていない
</div>

<div style="margin-top: 2em">
Just sees what he wants to see

見たいものしか 見えないんだ
</div>

<div style="margin-top: 2em">
Nowhere man, can you see me at all?

なあ、きみにぼくは見えているんだろうか？
</div>

<div style="margin-top: 6em">
Nowhere man, don't worry

何者にもなれない人、心配は要らないよ
</div>

<div style="margin-top: 2em">
Take your time, don't hurry

ゆっくり行こう、急ぐことはないんだ
</div>

<div style="margin-top: 2em">
Leave it all till somebody else lends you a hand

誰かが手を差し伸べてくれるまで、全部放っておけばいい

</div>

<div style="margin-top: 6em">
Doesn't have a point of view

狭い視野しか持たないし
</div>

<div style="margin-top: 2em">
Knows not where he's going to

何処へ向かうのか判らない
</div>

<div style="margin-top: 3em">
Isn't he a bit like you and me?

なんだか少し ぼくたちに似てないか？
</div>

<div style="margin-top: 6em">
Nowhere man, please listen

何者にもなれない人、聞いて欲しい
</div>

<div style="margin-top: 2em">
You don't know what you're missing

きみは見逃しているものを 知っていない
</div>

<div style="margin-top: 2em">
Nowhere man, the world is at your command

それでも、世界は君の意のままだ
</div>

<div style="margin-top: 6em">
He's a real nowhere man

彼は 何者にもなれない人
</div>

<div style="margin-top: 2em">
Sitting in his nowhere land

何処でも無い場所に蹲り
</div>

<div style="margin-top: 2em">
Making all his nowhere plans for nobody

誰も居ないのに 何処にも行き着かない計画を立てる
</div>

<div style="margin-top: 6em">
Making all his nowhere plans for nobody

誰も居ないのに 何処にも行き着かない計画を立てる
</div>

<div style="margin-top: 6em">
Making all his nowhere plans for nobody

誰も居ないのに 何処にも行き着かない計画を立てるんだ
</div>
</div>

<div style="margin-top: 8em"></div>

<div class="ft-definition">
<p>

Nowhere Man (by [The Bealtes](https://en.wikipedia.org/wiki/The_Beatles")):
1965年10月の 21,22日に録音された "Nowhere Man" は、人生に方向性を持たず、真の世界観を持たない男を描いている。
The Beatles の楽曲で初めてロマンスや愛に全く関係のない曲となっており、Lennon の哲学的な傾向を持つ作詞作曲が行われた顕著な例である。

Lennon, McCartney, Harrison が三声のハーモニーで歌っており、リードギターソロは Harrison と Lennon がユニゾンで演奏した。
二人はこの曲で同一仕様の "ソニックブルー" の[Fender Stratocasters](https://en.wikipedia.org/wiki/Fender_Stratocaster)を使用している。

The Beatles の[1966年アメリカツアー](https://en.wikipedia.org/wiki/The_Beatles%27_1966_US_tour)、および同年の
[ドイツ・日本・フィリピンツアー](https://en.wikipedia.org/wiki/The_Beatles%27_1966_tour_of_Germany,_Japan_and_the_Philippines)
でも演奏された。

この曲は 1968年の映画[Yellow Submarine](https://en.wikipedia.org/wiki/Yellow_Submarine_(film))にも登場し、
The Beatles が "nowhere land" で出会ったキャラクター、
[Jeremy Hillary Boob](https://en.wikipedia.org/wiki/Jeremy_Hillary_Boob)について歌っている。

</p>
</div>

<div class="ft-definition">
<p>

Lennon は 1980年[Playboy](https://en.wikipedia.org/wiki/Playboy)誌のインタビューでこう振り返っている:
あの朝、意味のある良い曲を書こうと 5時間もかけていたんだが、ついに諦めて横になった。
そしたら "Norhere Man" が来た。歌詞もメロディも、全部が横になっている間に浮かんだんだ。

</p>
</div>

<div class="ft-definition">
<p>

McCartney はこの曲についてこう語っている:
夜遊び明けの John が、夜明けを迎える瞬間に書いたんだ。
あの頃の彼は少し... 自分がどこへ向かっているのか迷っていたんだと思う。

</p>
</div>
<div class="ft-definition">
<p>

[Record World](https://en.wikipedia.org/wiki/Record_World)誌は、
米国シングル盤のレビューで、この曲を "自分らしくあろうとする勇気を持てない男の物語を描いた、味わい深い歌" と評した。
[Wikipedia](https://en.wikipedia.org/wiki/Nowhere_Man_(song))より
</p>
</div>
