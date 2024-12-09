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

![lualine-install](img/lualine-install.webp)

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

![lualine-default](img/lualine-default.webp)

「カスタマイズは必要ない」と言う言葉の通り、もうこれで完成としてもいいんですが...、例えばこれ、左下。

二重に表示されてて絶対気になるやつ...😣

![showmode](img/showmode.webp)

...でも、これだけじゃない。

この先は、これまでとは違ってかなりプラグインを連携して使っていきたいので、
今まで通りに一個ずつ進めていこうとすると膨大な作業量に圧倒されてしまって...。

このページだって、半分くらいは`lualine`以外への言及になっちゃってますよね。

「やることが多すぎる。それは間違いない。」{{footnote: たまたま Elon Musk も同じようなこと言ってた。}}

```admonish warning title=""
Everybody had a hard year{{footnote: I've Got a Feeling (by [The Beatles](https://en.wikipedia.org/wiki/The_Beatles)):
それぞれ別に制作されていた
McCartney の "I've Got a Feeling" と Lennon の "Everybody Had a Hard Year" の2曲を組み合わせて完成した楽曲であり、
1969年1月30日、[rooftop concert](https://en.wikipedia.org/wiki/The_Beatles%27_rooftop_concert) で収録された。
[Wikipedia](https://en.wikipedia.org/wiki/I%27ve_Got_a_Feeling)より
}}

みんな大変な年だった
```

ちょっともう...、本当に...、気が遠くなってしまって...。

~~~admonish quote title=""
CoralPink{{footnote:
このサイトを書いてる ふしぎないきもの。(はじめまして☺️ )
なんかもう、[Marvel](https://en.wikipedia.org/wiki/Marvel_Comics) なのか
[ポケットモンスター](https://ja.wikipedia.org/wiki/ポケットモンスター)なのか
[Shōgun](https://en.wikipedia.org/wiki/Shōgun_(2024_TV_series)) なのか、
日本橋なのか横須賀なのか、諸国往来な世界に飛び込んでしまった。
}}　のてには

たたかえる　ちからが　ない❗
~~~

~~~admonish quote title=""
...　...　...　...
~~~

~~~admonish quote title=""
CoralPink は

めのまえが　まっくらに　なっ・・・
~~~

...❓

~~~admonish question title=""
Hey, CaP..., you read me...?

キャップ...、聞こえるか...?
~~~

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

...❗

```admonish warning title=""
Everybody had a good time

みんな嬉しい瞬間があった
```

~~~admonish question title=""
On your radar.{{footnote:
アメリカメディアや業界関係者の間では、
SHOGUN は派手なハリウッド・キャンペーンも展開していなかったため、「レーダー外」の存在だったと言われている。

2024年9月15日に Los Angeles で授賞式が行われた[76th Primetime Emmy Awards](https://en.wikipedia.org/wiki/76th_Primetime_Emmy_Awards)では
作品賞や主演男優賞など、25の部門にノミネートされ業界を驚かせた。
作品賞に非英語圏のシリーズがノミネートされたのは 2022年の[오징어 게임](https://ko.wikipedia.org/wiki/오징어_게임)に次いで2作目である。

Emmy Awards では過去最多11人の日本人がノミネートされ、
本作品に出演した[真田広之](https://ja.wikipedia.org/wiki/真田広之)や
[浅野忠信](https://ja.wikipedia.org/wiki/浅野忠信)などもノミネートされた。
日本人が俳優部門にノミネートされるのは
59th Primetime Emmy Awards(2007年) の[マシ・オカ](https://ja.wikipedia.org/wiki/マシ・オカ)以来、17年ぶりとなった。

2024年9月8日、Emmy Awards の授賞式に先駆けて、技術系や美術系などの一部部門が発表され、撮影賞や視覚効果賞などで受賞。
この時点でこれまでテレビ番組の単一シーズンとしては最多の受賞記録となっていた
[Game of Thrones](https://en.wikipedia.org/wiki/Game_of_Thrones) の12冠を上回る14冠を獲得した。

2024年9月15日、Emmy Awards の授賞式が行われ、
[Frederick E. O. Toye](https://en.wikipedia.org/wiki/Frederick_E._O._Toye)が監督賞、
[アンナ・サワイ](https://ja.wikipedia.org/wiki/アンナ・サワイ)が主演女優賞、真田が主演男優賞、本作品が作品賞をそれぞれ受賞した。
日本人が俳優賞の主要部門で、非英語作品が作品賞で受賞したのは初めてである。
Emmy Awards では同賞創設以来過去最多となる合計18冠を獲得。
真田は "これまで時代劇を継承して支えてきてくださった全ての方々、そして監督や、諸先生方に心より御礼申し上げます。
あなた方から受け継いだ情熱と夢は海を渡り、国境を越えました。Thank you so much!!" と日本語でスピーチした。
[Wikipedia](https://ja.wikipedia.org/wiki/SHOGUN_将軍)より
}}

君の視界にいるよ。

<video controls preload="none" width="1280" height="720" poster="img/nihonbashi-parade-thumbnail.webp">
  <source src="img/nihonbashi-parade.webm" type="video/webm">
  Your browser does not support the video/webm.
</video>
~~~

```admonish warning title=""
Everybody had a wet dream

みんな熱い夢を見た
```

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

![show-mode-false](img/show-mode-false.webp)

`lualine.nvim`のカスタマイズについては、仲間をふやして次の街で❗😉

```admonish warning title=""
Everybody saw the sunshine

みんな陽の光を浴びた
```

```admonish success title="Assemble"
<div style="text-align: center">
  NVIM TRAINER IS BACK!!

  nvimトレーナーは帰ってきた!!
</div>
```
