# lualine.nvim

今回はステータスラインを変えてみます😉

```admonish info title="[lualine.nvim](https://github.com/nvim-lualine/lualine.nvim)"
A blazing fast and easy to configure Neovim statusline written in Lua.

Lua で書かれた、高速で設定しやすい Neovim ステータスラインです。

lualine is a statusline plugin written for neovim . It's primarily written in lua .
It's goal is to provide a easy to customize and fast statusline.
The idea is we will try our best to provide sane defaults also a way to overwrite that default .
Best kind of customize is the one where you have the power to customize but not the need.

lualine は neovim 用に書かれたステータスライン・プラグインです。主に lua で書かれています。
その目的は、カスタマイズが容易で高速なステータスラインを提供することです。
私たちはデフォルト設定を上書きする方法も提供するために最善を尽くします。
最高のカスタマイズとは、カスタマイズできるパワーを持ちつつも、必要とされないものです。
```

```admonish abstruct title="Requirements"
neovim >= 0.5

nvim-web-devicons | Only if you want filetype icons.
```

## Requirements

`neovim 0.5 以上`はもう大丈夫ですよね😌 `nvim-web-devicons`について、少し補足します。

### Nvim-web-devicons

```admonish info title="[Nvim-web-devicons](https://github.com/nvim-tree/nvim-web-devicons)"
A `lua` fork of [vim-devicons](https://github.com/ryanoasis/vim-devicons). This plugin provides the same icons as well as colors for each icon.

vim-devicons の lua フォークです。このプラグインは、同じアイコンを提供するだけでなく、各アイコンの色も提供します。
```

```admonish abstruct title="Requirements"
[A patched font](https://www.nerdfonts.com/)
```

これはもう`Requirements`のミルフィーユですね、そだねー。

もぐもぐしながら整理してみましょう😋

つまり、`lualine.nvim`で (ファイルタイプアイコンを使いたかったら) `nvim-web-devicons`が必要で、
`nvim-web-devicons`には`patched font (Nerd Fonts)`が必要ってことですね❗...🤔❓

`nvim-web-devicons`のインストール自体は`packer`に任せちゃえばいいので、またあとで❗

#### A patched font(NerdFonts)

本来なら「なんかめんどくさそうだな〜」となるところですが...、

なんと❗️`WezTerm`は`Nerd Font`を持っていて、しかも既に有効になっています❗️

```admonish note
これ、[3.2. Shell Prompt: Starship](../../wezterm/shell.html#starship)からコピーしてきた文言です。
だって...、同じなんだもの...🥹

(こっちでは`Nerd Fonts`、あっちでは`Nerd Font`なので、ちょっと表記にブレがあるけど。)
```

`WezTerm`以外のターミナルを使用している場合は、そのターミナルで`Nerd Fonts`を使用するように設定する必要があります。

例えば`Firge`という`Nerd Fonts`を含んだフォントセットがあって、これも既に紹介済みです。

```admonish info title="[3.3. font: プログラミングフォント Firge (ファージ)](../../wezterm/font.html#プログラミングフォント-firge-ファージ)"
例として、わたしが普段お世話になっているフォントを紹介します。
```

```admonish note
`WezTerm`と`WezTerm以外`で分けるのもだいぶ暴論ですね😅
```

## wiki

冒頭の紹介文は`lualine.nvim` の wiki にあるものです。他にも色々と書いてくれているので、覗いてみると良いです😉

```admonish info title="[wiki](https://github.com/nvim-lualine/lualine.nvim/wiki)"
Welcome to the lualine.nvim wiki!
```

## install

これ、やっぱパラメータが多いので手順を踏んでいきましょう。

`lualine.nvim`がオフィシャルに示しているコードからは少し外れますが、以下のようにしてみてください。

~~~admonish example title="extensions/lualine.lua"
[Default configuration](https://github.com/nvim-lualine/lualine.nvim#default-configuration)で動かします。

```lua
require('lualine').setup {}
```
~~~

~~~admonish example title="extensions/init.lua"
```lua
  use {
    'nvim-lualine/lualine.nvim',
    config = function() require 'extensions.lualine' end,
    requires = { 'nvim-tree/nvim-web-devicons' },
  }
```
~~~

~~~admonish note
オフィシャルには

```lua
requires = { 'kyazdani42/nvim-web-devicons' },
```

として説明されているのですが、

```txt
https://github.com/kyazdani42/nvim-web-devicons
```

...に行こうとすると、

```txt
https://github.com/nvim-tree/nvim-web-devicons
```

...に飛ばされますよね。

なので、`packer`への指定も、最初からこちらの URL を使用してます。

~~~

```admonish tip
「今更だけど、なんで`https://github.com/`は無くてもいいの❓」については、
`:h packer-configuration`の中で説明されている`default_url_format`が効いてるからです😆
```

`opt`についてはまた今度にしましょ❓ 満を持して🦁 また改めて登場してもらうことにします❗

ってことで、いつも通り`:PackerSync`しちゃいましょう😉

![lualine-install](img/lualine-install.avif)

`lualine.nvim`と一緒に`nvim-web-devicons`もインストールされましたね❗

~~~admonish info title=":h packer-plugin-dependencies"
```txt
Plugins may specify dependencies via the `requires` key in their specification table.
This key can be a string or a list (table).

プラグインは、その仕様テーブルの `requires` キーで依存関係を指定することができます。このキーは文字列かリスト(テーブル)です。

If `ensure_dependencies` is true, the plugins specified in `requires` will be installed.

`ensure_dependencies` が true の場合、 `requires` で指定されたプラグインがインストールされます。
```
~~~

~~~admonish info title=":h packer-configuration"
```txt
ensure_dependencies = true, -- Should packer install plugin dependencies?

                               packer はプラグインの依存関係をインストールするべき？
```
~~~

`Neovim`パッケージは依存関係をデータとして持ち合わせていないことは
[15.1. Packer](packer.html)で触れたんですが、
「これ`requires`(必要なもの) なんだよねー🤔」と教えてあげると、
`packer`は「ん❓そうなんれすね❓😆」と言って、一切疑わずにインストールしてくれます。

```admonish note
ウソ🤪はつかないであげてください。`信頼関係`で成り立っています❗
```

## To Be Continued...

"Best kind of customize is the one where you have the power to customize but not the need."

(最高のカスタマイズとは、カスタマイズできるパワーを持ちつつも、必要とされないものです。)

![lualine-default](img/lualine-default.avif)

「カスタマイズは必要ない」と言う言葉の通り、もうこれで完成としてもいいんですが...、例えばこれ、左下。

二重に表示されてて絶対気になるやつ...😣

![showmode](img/showmode.avif)

...でも、これだけじゃない。

この先は、これまでとは違ってかなりプラグインを連携して使っていきたいので、
今まで通りに一個ずつ進めていこうとすると膨大な作業量に圧倒されてしまって...。

このページだって、半分くらいは`lualine`以外への言及になっちゃってますよね。

「やることが多すぎる。それは間違いない。」{{footnote:
たまたま Elon Musk も同じようなこと言ってた。
}}

```admonish warning title=""
Everybody had a hard year{{footnote:
I've Got a Feeling (by [The Beatles](https://en.wikipedia.org/wiki/The_Beatles)):
それぞれ別に制作されていた
McCartney の "I've Got a Feeling" と Lennon の "Everybody Had a Hard Year" の2曲を組み合わせて完成した楽曲であり、
1969年1月30日、[rooftop concert](https://en.wikipedia.org/wiki/The_Beatles%27_rooftop_concert) で収録された。
[Wikipedia](https://en.wikipedia.org/wiki/I%27ve_Got_a_Feeling)より
}}

みんな大変な年だった
```

ちょっともう...、本当に...、気が遠くなってしまって...。

<div style="margin-top: 4em"></div>

~~~admonish quote title=""
CoralPink{{footnote:
このサイトを書いてる ふしぎないきもの。(はじめまして☺️ )
}} のてには

たたかえる　ちからが　ない❗
~~~

~~~admonish quote title=""
...　...　...　...
~~~

<div style="color: #999999; font-size: 80%; text-align: center;">

<div style="margin-top: 8em">
Scandal{{footnote:
Scandal (by [Queen](https://en.wikipedia.org/wiki/Queen_(band))):
1989年のアルバム[The Miracle](https://en.wikipedia.org/wiki/The_Miracle_(album))から4枚目のシングルとしてリリースされ、イギリスのシングルチャートでは最高25位を記録した。
アメリカでもシングルとして発売されたが、チャート入りは果たさなかった。

"Scandal" は[Brian May](https://en.wikipedia.org/wiki/Brian_May)が作曲した楽曲だが、アルバム収録曲のクレジット方針により Queen 名義となっている。
この曲は 1980年代後半に May と[Freddie Mercury](https://en.wikipedia.org/wiki/Freddie_Mercury)がマスコミから受けた、望まない過剰な注目について歌っている。
そこには、May の最初の妻 Chrissie Mullen との離婚、女優[Anita Dobson](https://en.wikipedia.org/wiki/Anita_Dobson)との交際、
そして Mercury の健康状態をめぐって高まっていたマスコミの憶測など
(体重の減少や、やつれたような外見の変化は、彼が深刻な病気を患っているのではないかという憶測を煽る一因となった。) が含まれていた。
}}
</div>

<div style="margin-top: 4em">
Now you've left me

All the world's gonna know

君は 僕を置いて行った

これで 世界中が知ることになるだろう{{footnote:
Mercury は 1987年4月に[AIDS](https://en.wikipedia.org/wiki/HIV/AIDS)と診断されていたが、自身の病状を公表したのは 1991年11月に亡くなる前日だった。
}}
</div>

<div style="margin-top: 4em">
Hey, scandal
</div>

<div style="margin-top: 4em">
They're gonna turn our lives

Into a freak show

このスキャンダルで

僕らの人生は 奴らに見世物にされてしまう
</div>

<div style="margin-top: 4em">
They'll see the heartache

They'll see the love break

奴らは 苦痛を目にしたいんだろう

砕ける愛を目にしたいんだろう
</div>

<div style="margin-top: 4em">
They'll hear me pleading

すがる声を聞きたいんだろう
</div>

<div style="margin-top: 4em">
We'll say

僕らは言ってる
</div>
</div>

<div style="margin-top: 4em"></div>

<div style="font-size: 90%; text-align: center;">
for God sakes

いい加減にしろ
</div>

<div style="color: #999999; font-size: 80%; text-align: center;">
<div style="margin-top: 4em">
Over and over and over again

何度も！何度も！何度も！
</div>

<div style="margin-top: 8em">
Scandal
</div>

<div style="margin-top: 4em">
Now you've left me

There's no healing the wounds

君は 僕を置いて行ってしまった

その傷は決して癒えない
</div>

<div style="margin-top: 4em">
Hey, scandal

And all the world

Can make us out to be fools

このスキャンダルで

世間は僕らを 愚か者扱いするのだろう
</div>

<div style="margin-top: 4em">
Here come the bad news

Open the flood gates

さあ 悪い知らせが押し寄せてくる

堰を切ったように 有る事無い事流される
</div>

<div style="margin-top: 4em">
They'll leave us bleeding,

奴らは 僕らを血まみれにしたまま 置き去りにしていく
</div>

<div style="margin-top: 4em">
we say,

僕らは叫ぶ
</div>
</div>

<div style="margin-top: 4em"></div>

<div style="font-size: 90%; text-align: center;">
“You cheapskates!”

"さもしい{{footnote:
さもしい: 品性がない / 卑しい / 欲深い / 目先の利益に執着する、など。
}}
奴らめ！"
</div>

<div style="color: #999999; font-size: 80%; text-align: center;">
<div style="margin-top: 4em">
Over and over and over again

何度でも！何度でも！何度でも！
</div>

<div style="margin-top: 8em">
So let them know when they stare

It's just a private affair

ギトギト見てくる連中に 言っておく

これは 僕らのプライベートだ
</div>

<div style="margin-top: 4em">
They'll have us hung in the air

奴らは僕らを 晒し上げて嘲笑う
</div>

<div style="margin-top: 4em">
And tell me what do they care

僕らのことを気にかけているとでも？ 答えろよ
</div>

<div style="margin-top: 8em">
It's only a life to be

Twisted and broken

もうちっぽけな灯火だ

好き勝手に 捻じ曲げ 打ち砕かれる
</div>

<div style="margin-top: 8em">
They'll see the heartache

They'll see our love break, yeah

奴らは 苦痛を目にしたいんだろう

愛が砕けるのを目にしたいんだろう、なあ
</div>

<div style="margin-top: 4em">
They'll hear me pleading

すがる声を聞きたいんだろう
</div>

<div style="margin-top: 4em">
I’ll say

僕は言うんだ
</div>
</div>

<div style="margin-top: 4em"></div>
<div style="font-size: 90%; text-align: center;">
for God sakes

もうウンザリだ
</div>

<div style="color: #999999; font-size: 80%; text-align: center;">
<div style="margin-top: 4em">
Over and over and over and over again, yeah{{footnote:
発売当時、ヨーロッパ全域で発行されていた音楽誌[Music & Media](https://en.wikipedia.org/wiki/Music_&_Media)は、
Scandal を "キャッチーなビートとドラマチックな盛り上がりを持つミディアムテンポの楽曲" と評した。

[Music Week](https://en.wikipedia.org/wiki/Music_Week)の Selina Webb は、"ここに驚きはない" としながらも、
Mercury の "turbo-whine" は絶好調であり、バンドの演奏も "オーケストラのような迫力を少しも失っていない" と評した。

[Smash Hits](https://en.wikipedia.org/wiki/Smash_Hits)の William Shaw は、この曲を"素晴らしい作品"と評し、
"ドンドンと響くシンセ" と "Brian May らしい軽快なギターフレーズ" が特徴の "素晴らしい曲" と称賛した。
一方で彼は、歌詞については、マスコミが下世話なネタを求めるあまり嘘をでっち上げる傾向を "正当に痛烈に批判している" と認めつつも、
テーマがあまりにも "ごもっとも" であるために、優れた Queen のシングルを傑作たらしめる、あの "いつもの過剰さ" が欠けている、と付け加えた。
}}

何時も！ 何時も！ 何時も何時も！
</div>
</div>

<div style="color: #999999; font-size: 80%; text-align: center;">
<div style="margin-top: 8em">
Yes, you're breaking my heart again

また、私の心を傷つけているのよね
</div>

<div style="margin-top: 4em">
Yes, you're breaking my heart again

そう、また僕の心を傷つけている
</div>

<div style="margin-top: 8em">
Today: the headlines

Tomorrow, hard times

今日のヘッドライン

明日は厳しい状況
</div>

<div style="margin-top: 4em">
And no-one ever really knows

The truth from the lies

誰一人として

虚実の中から 真実を見極められるわけがない
</div>

<div style="margin-top: 4em">
And in the end, the story

Deeper must hide{{footnote:
[Number One](https://en.wikipedia.org/wiki/Number_One_(magazine))誌で
ゲストレビュアーを務めた[Double Trouble](https://en.wikipedia.org/wiki/Double_Trouble_(dance_music_producers))の
[Rebel MC](https://en.wikipedia.org/wiki/Rebel_MC)と Michael Menson は、この曲をシングル向きというより "アルバム曲" だと感じ、
おそらくシングルとして出すためにアルバムから "急いで引っ張り出された" 曲なのではないかと評した。
彼らはチャートでの成績についても、"[Titanic](https://en.wikipedia.org/wiki/Titanic)のように浮上したかと思えば、そのまま沈んでいくだろう" と結論づけた。

[Kerrang!](https://en.wikipedia.org/wiki/Kerrang!)の Phil Wilding はさらに辛辣で、この曲を "前代未聞のクソ曲で、これ以上語る価値すらない" と評した。
[Record Mirror](https://en.wikipedia.org/wiki/Record_Mirror) の Muff Fitzgerald も否定的で、"酷い" と評した。

[Wikipedia](https://en.wikipedia.org/wiki/Scandal_(song))より
}}

そんな状況では、

事実なんて 闇の中に沈められてしまう
</div>

<div style="margin-top: 4em">
Deeper and deeper and deeper inside!

深い、深い、深い暗闇へ！
</div>
</div>

<div style="margin-top: 8em"></div>

~~~admonish quote title=""
CoralPink は

めのまえが　まっくらに　なった
~~~

<div style="margin-top: 8em"></div>

~~~admonish question title=""
Hey, CaP..., you read me...?

キャップ...、聞こえるか...?
~~~

<div style="margin-top: 4em"></div>

```admonish warning title=""
Everybody had a wet dream

みんな熱い夢を見た
```

<div style="margin-top: 4em"></div>

~~~admonish question title=""
...It's nvim Trainer. Can you hear me...?

...nvimトレーナー
{{footnote:
このサイトの
[10章](../options/options.html)・
[11章](../au/automatic-commands.html)の主人公。(はじめてしゃべった😮)
みらいのチャンピオン。
}}
だ。聞こえるか...?
~~~

<div style="margin-top: 4em"></div>

```admonish warning title=""
Everybody had a good time

みんな嬉しい瞬間があった
```

<div style="margin-top: 4em"></div>

~~~admonish question title=""
On your left.

左から失礼。
~~~

<div style="margin-top: 4em"></div>

~~~admonish info title=":h showmode"
```txt
'showmode' 'smd'    boolean (default: on)
                    global

	If in Insert, Replace or Visual mode put a message on the last line.
	The |hl-ModeMsg| highlight group determines the highlighting.
	The option has no effect when 'cmdheight' is zero.

    挿入、置換、ビジュアルモードの場合、最終行にメッセージを表示する。
    ハイライトは |hl-ModeMsg| highlight グループによって決定される。
    'cmdheight' が 0 の場合、このオプションは何の効果もない。
```
~~~

~~~admonish example title="extensions/lualine.lua"
```lua
require('lualine').setup {}

-- ここに追記してみろ。
vim.api.nvim_set_option('showmode', false)
```
~~~

![show-mode-false](img/show-mode-false.avif)

<div style="margin-top: 4em"></div>

`lualine.nvim`のカスタマイズについては、仲間をふやして次の街で❗😉

```admonish warning title=""
Everybody saw the sunshine

みんな陽の光を浴びた
```

<div style="margin-top: 4em"></div>

```admonish success title="Assemble"
<div style="text-align: center">
  NVIM TRAINER IS BACK!!

  nvimトレーナーは帰ってきた!!
</div>
```
