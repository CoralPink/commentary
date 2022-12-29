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
これ、[3.2. Shell Prompt: Starship](https://coralpink.github.io/commentary/wezterm/shell.html#starship)からコピーしてきた文言です。
だって...、同じなんだもの...🥹

(こっちでは`Nerd Fonts`、あっちでは`Nerd Font`なので、ちょっと表記にブレがあるけど。)
```

`WezTerm`以外のターミナルを使用している場合は、そのターミナルで`Nerd Fonts`を使用するように設定する必要があります。

例えば`Firge`という`Nerd Fonts`を含んだフォントセットがあって、これも既に紹介済みです。

```admonish info title="[3.3. font: プログラミングフォント Firge (ファージ)](https://coralpink.github.io/commentary/wezterm/font.html#プログラミングフォント-firge-ファージ)"
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

```
https://github.com/kyazdani42/nvim-web-devicons
```

...に行こうとすると、

```
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
```
Plugins may specify dependencies via the `requires` key in their specification table.
This key can be a string or a list (table).

プラグインは、その仕様テーブルの `requires` キーで依存関係を指定することができます。このキーは文字列かリスト(テーブル)です。

If `ensure_dependencies` is true, the plugins specified in `requires` will be installed.

`ensure_dependencies` が true の場合、 `requires` で指定されたプラグインがインストールされます。
```
~~~

~~~admonish info title=":h packer-configuration"
```
ensure_dependencies = true, -- Should packer install plugin dependencies?

                               packer はプラグインの依存関係をインストールするべき？
```
~~~

`Neovim`パッケージは依存関係をデータとして持ち合わせていないことは
[15.1. Packer](https://coralpink.github.io/commentary/neovim/plugin/packer.html)で触れたんですが、
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

あまりにも話が進まない...❗手詰まり感がすごい...😰

ちょっともう...、本当に...、気が遠くなってしまって...。

~~~admonish quote title=""
CoralPink
{{footnote:
このサイトを書いてる ふしぎないきもの。(はじめまして☺️ )
なんかもう、`MARVEL`なのか`ポケットモンスター`なのかわからない世界に飛び込んでしまった。
}}
　のてには

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

~~~admonish quote title=""
Hey, CaP..., you read me...?

(キャップ...、聞こえるか...?)
~~~

~~~admonish quote title=""
...It's nvim Trainer. Can you hear me...? 

(...nvimトレーナー
{{footnote:
このサイトの
[10章](https://coralpink.github.io/commentary/neovim/options/options.html)・
[11章](https://coralpink.github.io/commentary/neovim/au/automatic-commands.html)の主人公。(はじめてしゃべった😮)
みらいのチャンピオン。
}}
だ。聞こえるか...?)
~~~

~~~admonish quote title=""
On your next.

(次を見てみろ。)
~~~

~~~admonish info title=":h showmode"
```
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

```admonish success title="Assemble"
![show-mode-false](img/show-mode-false.webp)

`lualine.nvim`のカスタマイズについては、仲間をふやして次の街で❗😉
```

```admonish success title=""
<div style="text-align: center">
  NVIM TRAINER IS BACK!!

  nvimトレーナーは帰ってきた!!
</div>
```
