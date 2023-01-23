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
この程度なら "時速 88 マイル" も "1.21 ジゴワット"{{footnote:
[Back to the Future](https://ja.wikipedia.org/wiki/バック・トゥ・ザ・フューチャー) の世界ですね。
“gigawatt”（ギガワット）を誤って“jigowatt”（ジゴワット）と書いた脚本がそのまま採用されたんだって。 (どういう誤り方❓😑)
[wikipedia](https://ja.wikipedia.org/wiki/デロリアン_(タイムマシン)#cite_note-jigowatt-2)より。
}}も必要ないでしょう。

```admonish note
あ、でもブラウザの表示幅が 750px あるといいです。

これがあると`Nerd Fonts`
{{footnote: [ryanoasis/nerd-fonts](https://github.com/ryanoasis/nerd-fonts)から拝借してます。}}
に対応したフォントセットが使用されるように仕組んであるんです、実は❗

`lualine.nvim`に関するサンプルコードには`Nerd Fonts`がいつもより多めに入ってるので、
PCならブラウザのウィンドウを横に広げてみたり、タブレットなら横表示にしてみたり、よかったら試してみてね☺️

ちゃんと綺麗にコードが見られるよ😆
```

改めて明記するんですが、このサイトに記載されているカスタマイズは "完全に" わたしの好みで作ってあるし、
あくまでもそれらに対してコメントしていくってだけなので、「汲み取れるものがあったら組み込んでもらえれば〜」ぐらいの感じです。

...と、言うことで❗

いよいよ
[あのシーン](https://coralpink.github.io/commentary/neovim/plugin/lualine.html#to-be-continued)まで戻っていきます...。

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

~~~admonish note title=""
Hey, CaP..., you read me...?

(キャップ...、聞こえるか...?)
~~~

~~~admonish note title=""
...It's nvim Trainer. Can you hear me...?

(...nvimトレーナーだ。聞こえるか...?)
~~~

...❗

```admonish fail title=""
I'm back. ...I'm back from the future!!

(わたしは戻ってきたんだ。...未来から戻ってきたんだ!!)
```

~~~admonish note title=""
On your next.

(次を見てみろ。)
~~~

## options

ここからが本番です。頑張っていきましょう❗

まずはベースとなる設定を2つ。

### separators

~~~admonish info title=":h lualine"
```
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

```
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
```
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

|before|
|:---:|
|![lualine-options-before](img/lualine-options-before.webp)|
|after|
|![lualine-options-before](img/lualine-options-after.webp)|

`separators`を変えることによって、ステータスラインがやわらか〜な印象になりましたね。

また、`global statusline`によってウィンドウを分割してもステータスラインは常に一つだけが表示されるようになりました。
なんだか無理やり押し込まれたような窮屈な表示も解消されていて、とってもいい感じですね😆


## Sections

さて、`separators`項で出てきたこれ。

```
Here, left refers to the left-most sections (a, b, c), and right refers to the
right-most sections (x, y, z).
```

~~~admonish info title=":h lualine-usage-and-customization"
```
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
        symbols = { modified = ' _', readonly = ' ', newfile = '' },
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
|![fontbook1](img/fontbook1.webp)|![fontbook2](img/fontbook2.webp)|
```

![meow-meow](img/meow-meow.webp)

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

![lualine-sections](img/lualine-sections.webp)

うん、こんな感じですね😉

```admonish note
`lualine_c`には、もう少し先で登場する予定の`LSP`{{footnote:
[Language Server Protocol](https://microsoft.github.io/language-server-protocol/)の略。
Microsoftが開発したものがオープンスタンダードになっているそう。
その辺は[wikipedia](https://en.wikipedia.org/wiki/Language_Server_Protocol)で❗}}
関連の情報を表示したいと思ってます。

イメージとしては[トップページ](https://coralpink.github.io/commentary/index.html)のようになるので、
まだ見ぬ仲間の登場を楽しみにしておきましょう☺️
```

## To Be Concluded...

```admonish success title="Assemble"
`lualine.nvim`は...❗ なんと...❗

まだ続きます😮

やっぱりここはボリュームがありました...。
でも区切りとしてはとても自然だと思うので、やっぱり思い切ってもう一回だけ跨ぎます😆

次回、`lualine.nvim` PartⅢ  に続く。続くったら続く...🐈🐈🐈
```
