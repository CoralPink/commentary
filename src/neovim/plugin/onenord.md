# onenord.nvim

わたしの一番のお気に入りカラーテーマは`onenord.nvim`です😆

```admonish info title = "[onenord.nvim](https://github.com/rmehri01/onenord.nvim)"
Onenord is a Neovim theme written in Lua that combines the Nord and Atom One Dark color palettes.
More specifically, it seeks to add more vibrance to the Nord theme and provide a great programming experience by leveraging Treesitter!

Onenordは、NordとAtom One Darkのカラーパレットを組み合わせた、Luaで書かれたNeovimのテーマです。
具体的には、Treesitterを活用することで、Nordのテーマに活気を与え、素晴らしいプログラミング体験を提供することを目的としています!
```

生きていたのか。`Atom`の意志は...👁️

```admonish abstract title="Requirements"
Neovim >= 0.8.0
```

`Treesitter`を活用するため、`onenord.nvim`の要求もこれに合わせられているようですね。

## Install & Config

じゃあ、チャチャっと❗

~~~admonish example title="extensions/onenord.lua"
```lua
local colors = require('onenord.colors').load()

require('onenord').setup {
  styles = {
    comments = 'NONE',
    strings = 'NONE',
    keywords = 'bold',
    functions = 'bold',
    variables = 'NONE',
    diagnostics = 'underline',
  },

  disable = {
    background = true,
  },

  custom_highlights = {
    MatchParen = { fg = colors.none, bg = colors.none, style = 'bold,underline' },
  },
  custom_colors = {
    mypink = '#FFB2CC',
  },
}
```
~~~

これももうテンプレートですね😉 他の`use`ブロックと同列に並べてあげてください。

~~~admonish example title="extensions/init.lua"
```lua
  use {
    'rmehri01/onenord.nvim',
    config = function() require 'extensions.onenord' end,
  }
```
~~~

## Config Description

ある程度は変数名とコメントだけで推測できると思うんですが、上の例で使ってないものも含めてフワ〜っと触れます😆
見た感じ、`disable.background`を`true`にしている場合は効果が無いものもありそうです。

~~~admonish info title="[Configuration](https://github.com/rmehri01/onenord.nvim#configuration)"
The configuration of different options is done through a setup function which will handle setting the colors, so there's no need to set colorscheme yourself!

さまざまなオプションの設定は、色の設定を行う setup 関数によって行われるので、自分で colorscheme を設定する必要はありません!
~~~

### theme

```txt
"dark" or "light". Alternatively, remove the option and set vim.o.background instead

`dark`または`light`。もしくは、このオプションを削除して`vim.o.background`を設定します。
```

`:h background`を見ると、`defalut "dark"`とあったので、`light`テーマを使う場合には変更が必要かもしれません。
(ごめんなさい、確認してない...😅)

### borders

```txt
Split window borders

ウィンドウの境界にボーダーを表示します。
```

|||
|:---:|:---:|
|**true**|![enable](img/borders-true.webp)|
|**false**|![disable](img/borders-false.webp)|

### fade_nc

```txt
Fade non-current windows, making them more distinguishable

現在のウィンドウ以外をフェードさせ、区別しやすくする。
```

|||
|:---:|:---:|
|**true**|![enable](img/fade_nc-true.webp)|
|**false**|![disable](img/fade_nc-false.webp)|

### styles

```txt
Style that is applied to various groups: see `highlight-args` for options

様々なグループに適用されるスタイル: オプションは `:h highlight-args` を参照してください。
```

```lua
-- 以下はデフォルト値です。
styles = {
  comments = "NONE",
  strings = "NONE",
  keywords = "NONE",
  functions = "NONE",
  variables = "NONE",
  diagnostics = "underline",
},
```

|||
|:---:|:---:|
|**bold**|![bold](img/style-bold.webp)|
|**NONE**|![none](img/style-none.webp)|

```admonish note
例えば、`comments`を`italic`にするのもオシャレなんですが、カーソルがそのままなので個人的には使いにくいかなー、なんて😅
![italic](img/italic.webp)
```

### disable

このセクションにあるものはデフォルトで有効となっていて、`true`とすると無効化されます 😉

#### background

```txt
Disable setting the background color

背景色の設定を無効にします。
```

これを無効化すると、ターミナルの背景色やアルファチャンネル値がそのまま反映されます。

|||
|:---:|:---:|
|**true**|![enable](img/background-true.webp)|
|**false**|![disable](img/background-false.webp)|

#### cursorline

```txt
Disable the cursorline

カーソルラインを無効にします。
```

#### eob_lines

```txt
Hide the end-of-buffer lines

バッファ終端行を隠します。
```

...これちょっと何かわからなかった...😿

### inverse

```txt
Inverse highlight for different groups

グループごとにハイライトを反転させます。
```

### custom_highlights

```txt
Overwrite default highlight groups

デフォルトのハイライトグループを上書きします。
```

|||
|:---:|:---:|
|**customize**|![Customize](img/custom_highlight.webp)|
|**none**|![Non customized](img/custom_highlight-none.webp)|

ちょっと見えにくいかな...。上の例では`}`です。

### custom_colors

```txt
Overwrite default colors

デフォルトの色を上書きします。
```

説明にはありませんが、実はオリジナルの色を新しく定義することもできちゃいます😆

## Miracle Gift Parade (Part2) 💝

そんなこんなでやってきましたが、ここまでやっただけでも...

![onenord](img/onenord.webp)

見違えるような変身っぷり❗

```admonish note
今となってはもう昔ばなしですが、
`nvim-treesitter`で大規模な変更が施されたことによる影響を受けて、`highlight`が壊滅したことがありました。

[feat!: remove obsolete TS* highlight groups](https://github.com/nvim-treesitter/nvim-treesitter/commit/42ab95d5e11f247c6f0c8f5181b02e816caa4a4f)

なんだか世界が色褪せてしまいましたが、`onenord`は3日で救いに来てくれました🤗 My HERO❗

[fix!: highlight groups for neovim 0.8 #50](https://github.com/rmehri01/onenord.nvim/commit/98c64654375bc087e96bca08fd194066d778717c)
```

<video controls preload="none" width="1280" height="720" data-poster="img/miracle-gift-parade-part2.webp">
  <source src="img/miracle-gift-parade-part2.webm" type="video/webm">
  Your browser does not support the video/webm.
</video>

```admonish success
ようやくひと段落って感じですね。とっても綺麗な景色☺️
```

## Imagine 🕊️

<div style="color: #999999; font-size: 90%; text-align: center;">
<div style="margin-top: 4em">
Imagine there’s no heaven

想像してみて 天国なんて存在しないんだ
</div>

<div style="margin-top: 2em">
It’s easy if you try

やってみれば簡単だ
</div>

<div style="margin-top: 4em">
No hell below us

俯いても地獄はないし
</div>

<div style="margin-top: 2em">
Above us only sky

見上げれば空だけだ
</div>

<div style="margin-top: 4em">
Imagine all the people

みんな今日を生きている
</div>

<div style="margin-top: 2em">
Living for today, I

そっと考えてみるよ、僕も
</div>

<div style="margin-top: 7em">
Imagine there’s no countries

想像してみて 国とか線なんて関係ないんだ
</div>

<div style="margin-top: 2em">
It isn’t hard to do

難しいことじゃない
</div>

<div style="margin-top: 4em">
Nothing to kill or die for

殺すこともないし 死ぬこともない
</div>

<div style="margin-top: 2em">
And no religion too

宗教だってないんだ
</div>

<div style="margin-top: 4em">
Imagine all the people

みんな平和に暮らしている
</div>

<div style="margin-top: 2em">
Living life in peace, you

そっと想ってみてよ、君も
</div>

<div style="margin-top: 7em">
You may say I’m a dreamer

君は夢を見過ぎだと言うかもしれない
</div>

<div style="margin-top: 2em">
But I’m not the only one

けれど僕は独りじゃないはずだ
</div>

<div style="margin-top: 4em">
I hope someday you’ll join us

いつの日か 君も仲間になろう
</div>

<div style="margin-top: 2em">
And the world will be as one

そして 世界はひとつになるんだ
</div>

<div style="margin-top: 7em">
Imagine no possessions

想像してみて 所有することに意味なんてないんだ
</div>

<div style="margin-top: 2em">
I wonder if you can

君にできるかな
</div>

<div style="margin-top: 4em">
No need for greed or hunger

欲張らなくていいし 飢えることもない
</div>

<div style="margin-top: 2em">
A brotherhood of man

僕らはみんな兄弟だから
</div>

<div style="margin-top: 4em">
Imagine all the people

世界は共に分かち合える
</div>

<div style="margin-top: 2em">
Sharing all the world, you

そっと信じてみてよ、君たちも
</div>
</div>

<div style="margin-top: 6em"></div>

<aside class="ft-definition" role="doc-footnote">
<p>Imagine(by <a href="https://en.wikipedia.org/wiki/John_Lennon" target="_blank" rel="noopener">John Lennon</a>・<a href="https://en.wikipedia.org/wiki/Yoko_Ono" target="_blank" rel="noopener">Yoko Ono</a>):
John Lennon が1971年に発表した同名のアルバムに収録された曲。
彼のソロ・キャリアで最も売れたシングル曲であり、歌詞はオノ・ヨーコが1964年に出版した著書 "グレープフルーツ" からいくつかの詩を引用し、
リスナーに "物質主義のない、国境も国も宗教もない、平和な世界" を想像するよう促している。
Lennon が亡くなる直前、この曲の歌詞と内容の多くは妻のオノ・ヨーコによるものだと語っており、2017年、彼女は共作のクレジットを受け取った。
Imagine は発表以来、常に広く賞賛されてきたが、
地政学的な国境、組織化された宗教、経済階級といった現代の社会秩序を完全に排除した上に成り立つ
"統一と平等" を求めた歌詞が原因で論争も巻き起こした。
<a href="https://en.wikipedia.org/wiki/Broadcast_Music,_Inc." target="_blank" rel="noopener">BMI</a> は Imagine を 20世紀で最も演奏された 100曲のひとつに選んだ。
1999年には<a href="https://en.wikipedia.org/wiki/Recording_Industry_Association_of_America" target="_blank" rel="noopener">RIAA</a>が選ぶ
365の<a href="https://en.wikipedia.org/wiki/Songs_of_the_Century" target="_blank" rel="noopener">Songs of the Century</a>の30位にランクされ、<a href="https://en.wikipedia.org/wiki/Grammy_Hall_of_Fame" target="_blank" rel="noopener">Grammy賞</a>の殿堂入りを果たし、
<a href="https://en.wikipedia.org/wiki/Rock_and_Roll_Hall_of_Fame" target="_blank" rel="noopener">RRHOF</a>の
<a href="https://en.wikipedia.org/wiki/Rock_and_Roll_Hall_of_Fame#The_Songs_That_Shaped_Rock_and_Roll" target="_blank" rel="noopener">500 Songs that Shaped Rock and Roll</a>に選出された。
<a href="https://en.wikipedia.org/wiki/British_Hit_Singles_%26_Albums" target="_blank" rel="noopener">Guinness World Records British Hit Singles Book</a>が
2002年にイギリスで行った調査では、この曲が歴代2位に選ばれ、<a href="https://en.wikipedia.org/wiki/Rolling_Stone" target="_blank" rel="noopener">Rolling Stone</a>が2004年に発表した
<a href="https://en.wikipedia.org/wiki/Rolling_Stone%27s_500_Greatest_Songs_of_All_Time" target="_blank" rel="noopener">史上最も偉大な500曲</a>では3位にランクされた。
(2021年の改訂版では19位に変更された。)
<p>2005年以降、年越しの<a href="https://en.wikipedia.org/wiki/Times_Square_Ball" target="_blank" rel="noopener">Times Square Ball</a>のドロップ直前に Imagine が流されるのが通例になっている。
2023年には<a href="https://en.wikipedia.org/wiki/Library_of_Congress" target="_blank" rel="noopener">Library of Congress</a>(アメリカ議会図書館) によって、
この曲が "文化的・歴史的・または芸術的に重要である" と認められ、<a href="https://en.wikipedia.org/wiki/National_Recording_Registry" target="_blank" rel="noopener">National Recording Registry</a> に選定された。</p>
</aside>

<aside class="ft-definition" role="doc-footnote">
<p>Lennon は 「Imagine という曲は、"宗教も、国も、政治もない世界を想像してごらん" と歌っていて、
ある意味では共産党宣言そのものなんだ。もっとも、僕は特に共産主義者ってわけじゃないし、どんな運動にも属していないけどね。
この世界には、本当の意味での共産主義国家なんて存在してないってことを理解しておくべきだよ。」と語っている。</p>
</aside>

<aside class="ft-definition" role="doc-footnote">
<p>Ono は 「これは John の信念そのもの。つまり "私たちは一つの国、一つの世界、一つの人類なんだ" っていう想いね。」と語っている。</p>
</aside>

<aside class="ft-definition" role="doc-footnote">
<p>Rolling Stone 誌はこの曲の歌詞をこう評している: 22行の、優雅で率直な信念の言葉。
──それは、目的を共有した世界が、自らを修復し、変えていく力を持つという <strong>希望の詩</strong> だ。
<a href="https://en.wikipedia.org/wiki/Imagine_(song)" target="_blank" rel="noopener">Wikipedia</a>より</p>
</aside>

<div style="margin-top: 4em"></div>

![letter](img/letter2.webp)

<div style="color: #999999; font-size: 90%; text-align: center;">
<div style="margin-top: 8em">
You may say I’m a dreamer

僕は夢を見過ぎだと言われるかもしれない
</div>

<div style="margin-top: 2em">
But I’m not the only one

けれど僕は独りじゃないんだ
</div>

<div style="margin-top: 4em">
I hope someday you’ll join us

君も仲間になってくれるだろ
</div>

<div style="margin-top: 2em">
And the world will live as one

ほら 世界はひとつになった
</div>

<div style="margin-top: 8em"></div>
</div>
