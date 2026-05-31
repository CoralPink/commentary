# 🚦 Trouble

いよいよラスト、本章のロードマップを踏破します。

満を持しての登場は`Trouble`です❗

```admonish info title="[Trouble](https://github.com/folke/trouble.nvim)"
A pretty list for showing diagnostics, references, telescope results,
quickfix and location lists to help you solve all the trouble your code is causing.

診断、リファレンス、Telescope の結果を表示するための綺麗なリスト、
quickfix と location lists で、コードが引き起こす全ての問題を解決するのに役立ちます。
```

```admonish success title=""
When I find myself in times of trouble

Mother Mary comes to me

僕がトラブルに巻き込まれている時

目の前におかあさんがいて
```

```admonish success title=""
Speaking words of wisdom

Let it be{{footnote: Let It Be (by [The Beatles](https://en.wikipedia.org/wiki/The_Beatles)):
McCartney は、1968年の The Beatles ("the White Album") のセッションにまつわる緊迫した時期に、
母親の夢を見たことがきっかけで "Let It Be" のアイデアを思いついたと語っている。
(Mary Patricia McCartney は、彼が14歳の時に癌で亡くなっている。)
「母と再会できて嬉しかった。その夢を見ることができて、とても恵まれていると思った。それで "Let It Be" を書いたんだ」。

この曲は 1970年3月6日、McCartney が The Beatles 脱退を表明する前の最後のシングルとなった。

[George Martin](https://en.wikipedia.org/wiki/George_Martin)がプロデュースしたシングル版では、
柔らかなギター・ソロと控えめなオーケストラでミックスされているのに対し、
[Phil Spector](https://en.wikipedia.org/wiki/Phil_Spector)がプロデュースしたアルバム版では、
ハードなギター・ソロと強調されたオーケストラでミックスされている。
McCartney は Spector のプロデュース手法 (特にオーケストラやコーラスの大規模な追加) を好ましく思っておらず、
これらの装飾を排除し、よりシンプルでオリジナルの意図に近い形に戻すことを目指して制作したアルバム
[Let It Be... Naked](https://en.wikipedia.org/wiki/Let_It_Be..._Naked)を 2003年にリリースした。
}}

言葉をかけてくれたんだ

なるようになるよ
```

## ⚡️ Requirements

```admonish abstract title="[⚡️ Requirements](https://github.com/folke/trouble.nvim#%EF%B8%8F-requirements)"
- Neovim >= 0.9.2
- Neovim >= 0.10.0 **OR** the `markdown` and `markdown_inline` [nvim-treesitter](https://github.com/nvim-treesitter/nvim-treesitter) parsers
- Properly configured Neovim LSP client
- [nvim-web-devicons](https://github.com/nvim-tree/nvim-web-devicons) is optional to enable file icons
- a theme with properly configured highlight groups for Neovim Diagnostics
- a [patched font](https://www.nerdfonts.com/) for the default severity and fold icons
```

このページの初掲は "Sep 7, 2023" なんですが、"Sep 29, 2024" の今でも、
当初からこのサイトを進んできてくれた人が気にかける必要のあるものは特にありません😉

`Neovim`も`v0.10.1`まで進んでるしね😸

そのまま行きましょう❗

## 📦 Installation

```admonish info title="[📦 Installation](https://github.com/folke/trouble.nvim#-installation)"
Install the plugin with your preferred package manager:

お好みのパッケージマネージャでプラグインをインストールしてください：
```

お言葉に甘えて、いつも通り`packer`で突き進みます...が❗

~~~admonish example title="extensions/init.lua"
```lua
use {
  'folke/trouble.nvim',
  requires = 'nvim-tree/nvim-web-devicons',
}
```
~~~

が...、ですよ❓

### 🔹 NOTICE: (packer.nvim)

例によって話が逸れるんですが、`packer.nvim`からこんなアナウンスが出てしまいましたね...😅

```admonish warning title="[NOTICE:](https://github.com/wbthomason/packer.nvim)"
This repository is currently unmaintained.
For the time being (as of August, 2023), it is recommended to use one of the following plugin managers instead:

このリポジトリは現在メンテナンスされていません。
当分の間（2023年8月現在）、代わりに以下のプラグインマネージャのいずれかを使用することを推奨します：

- [lazy.nvim](https://github.com/folke/lazy.nvim): Most stable and maintained plugin manager for Nvim.

Nvim 用の最も安定したプラグインマネージャ。

- [pckr.nvim](https://github.com/lewis6991/pckr.nvim): Spiritual successor of packer.nvim. Functional but not as stable as lazy.nvim.

packer.nvim の精神的後継。機能的だが lazy.nvim ほど安定していない。
```

このサイトで`packer.nvim`のページを書いてた時にも、既にそんな空気は漂ってましたが、...ねえ❓🥲

前回触れた`null-ls`もそうですが、なんか過渡期にでも入ってるんでしょうか🙂

```admonish success title=""
And when the borken-hearted people

Living in the world agree

傷ついてしまった人だって

受け入れてくれる世界に生きればいい
```

"For the time being" をどう受け取っていいのか、ちょっと悩みますが、
こうなってしまった以上は`packer.nvim`から`lazy.nvim`への移行を、次回簡単に取り上げます🫡

## ⚙️ Configuration

~~~admonish info title="[⚙️ Configuration](https://github.com/folke/trouble.nvim#%EF%B8%8F-configuration)"
Setup

Trouble comes with the following defaults:
~~~

ということで、これもたくさんの設定項目がある訳なんですが、わたしはほぼデフォルトで使っています😅

変えてるのは一つだけです😊

~~~admonish example title="extensions/trouble.lua"
```lua
local trouble = require 'trouble'

trouble.setup {
  open_no_results = true,
}
```
~~~

~~~admonish example title="extensions/init.lua"
```diff
use {
  'folke/trouble.nvim',
+ config = function() require 'extensions.trouble' end,
  requires = 'nvim-tree/nvim-web-devicons',
}
```
~~~

```admonish success title=""
There will be an answer

Let it be

答えは必ずあるんだから

なるようになるよ
```

### 🔹 open_no_results

~~~admonish info title=":h trouble.nvim-trouble-configuration"
```txt
show a warning when there are no results

結果がない場合に`Trouble`ウィンドウを開く
```
~~~

特にトラブってない健全な状態で、

```vim
:Trouble diagnostics toggle
```

...とかすると、`Trouble`を開かないというのがデフォルト設定(`false`)ですが、
これを`true`に設定しておくとトラブってる具合に関係なく`Trouble`が開くようになります。

## 🚀 Usage

そしたらキーマップも入れておきましょう❗

このサイトでは、1年間放置していたものを現状に合うように (無理矢理) 書き換えている状態なので、
オフィシャル設定のまんま...とはいかなくなっているのでちょっと不安ですけどね...。

```admonish note
ぶっちゃけ、[lazy.nvim](../../outro/lazy.html) に先に進んでもらって、
移行後にオフィシャル設定に従う方が良いです😅
```

~~~admonish info title="[🚀 Usage](https://github.com/folke/trouble.nvim#-usage)"
Commands
~~~

~~~admonish example title="extensions/trouble.lua"
```lua
vim.keymap.set('n', '<leader>xx', '<cmd>Trouble diagnostics toggle<cr>')
vim.keymap.set('n', '<leader>xX', '<cmd>Trouble diagnostics toggle filter.buf=0<cr>')
vim.keymap.set('n', '<leader>cs', '<cmd>Trouble symbols toggle focus=false<cr>')
vim.keymap.set('n', '<leader>cl', '<cmd>Trouble lsp toggle focus=false win.position=right<cr>')
vim.keymap.set('n', '<leader>xL', '<cmd>Trouble loclist toggle<cr>')
vim.keymap.set('n', '<leader>xQ', '<cmd>Trouble qflist toggle<cr>')
```
~~~

どっかトラブってたらごめんなさい😨

## 🎨 Colors

```admonish info title="[🎨 Colors](https://github.com/folke/trouble.nvim#-colors)"
The table below shows all the highlight groups defined for Trouble.

以下の表は、Trouble に対して定義されたすべてのハイライト・グループを示している。
```

`Trouble`は有名なプラグインなので、これはカラーテーマが既に対応してくれていることも多いです🌈

```admonish note
このサイトではもうすっかりおなじみの`onenord`も、まるで当然のように対応してくれています😉
```

```admonish success title=""
And when the night is cloudy

There is still a light that shines on me

たとえ夜が曇っていたとしても

それでも僕を照らす光はある
```

```admonish success title=""
Shine until tomorrow

let it be

明日まで輝き続ける

なるようになるよ
```

## 🔸 Try

そしたらやっぱりいつも通りインストールを終えて、`trouble.lua`を開いた状態で<kbd>leader</kbd><kbd>x</kbd><kbd>x</kbd>としてみましょう。

![trouble1](img/trouble1.avif)

うん...。なんか別に意図してないんだけど、いい感じにトラブってましたね😅

見てお分かりの通り、ワークスペースにあるコードに対しては、ファイルを開いていない状態でも教えてくれます😉

...そして現実を突きつけてくれます⭐

上のスクリーンショットでは`Warning`しかありませんが、`Error`や`Hint`なんかも、もれなく突きつけてきます👹

![trouble1](img/trouble2.avif)

...天使なのか悪魔なのかわかりません😇

`Trouble`のウィンドウに移動するためには`vim`のウィンドウ操作でいけます。

(下に表示されているのであれば) <kbd>Ctrl</kbd><kbd>w</kbd>からの<kbd>j</kbd>ですね。

~~~admonish tip
もし、`Trouble`を開くと同時にこのウィンドウに移動したいのであれば`focus`オプションを使用すると良いです😉

```diff
 trouble.setup {
+  focus = true,
   open_no_results = true,
 }
```
~~~

```admonish success title=""
Whisper words of wisdom

Let it be

知恵の言葉をささやく

なるようになるよ
```

### 🔹 Appearance

`Trouble`がデフォルトで使用するアイコンは以下です。

![trouble1](img/trouble3.avif)

これでもいいんだけど、わたしはこの機会に新しくこんなんしてみました😮

~~~admonish example title="~/.config/nvim/lua/appearance.lua"
完全新規のファイルです😆

```lua
local signs = { Error = '', Warn = '', Info = '', Hint = '󰌶' }

for type, icon in pairs(signs) do
  local hl = "DiagnosticSign" .. type
  vim.fn.sign_define(hl, { text = icon, texthl = hl, numhl = hl })
end
```
~~~

~~~admonish example title="~/.config/nvim/init.lua"
```diff
 require 'options'
 require 'keybinds'
+require 'appearance'
 require 'extensions'
```
~~~

もちろんお好みで❗

```admonish tip
![trouble1](img/trouble4.avif)

`signcolumn`(スクリーンショット左上) のアイコンにも、これが使用されます😉
```

#### ▪️ diagnostic-highlights

~~~admonish info title=":h diagnostic-highlights"
```txt
HIGHLIGHTS                            diagnostic-highlights

All highlights defined for diagnostics begin with `Diagnostic` followed by
the type of highlight (e.g., `Sign`, `Underline`, etc.) and the severity (e.g.
`Error`, `Warn`, etc.)

診断用に定義されたハイライトはすべて `Diagnostic` で始まり、
その後にハイライトの種類（例：`Sign`、`Underline` など）と
重要度（例：`Error`、`Warn` など）が続きます。

By default, highlights for signs, floating windows, and virtual text are linked to the
corresponding default highlight. Underline highlights are not linked and use their
own default highlight groups.

デフォルトでは、サイン、フローティングウィンドウ、仮想テキストのハイライトは
対応するデフォルトのハイライトにリンクされます。
アンダーラインのハイライトはリンクされずデフォルトのハイライトグループを使用します。
```
~~~

#### ▪️ sign_define()

~~~admonish info title=":h sign_define()"
sign_define({name} [, {dict}])				sign_define()
sign_define({list})
  Define a new sign named {name} or modify the attributes of an
  existing sign.  This is similar to the |:sign-define| command.

  {name}という新しい符号を定義するか、既存の符号の属性を変更する。 これは |:sign-define| コマンドに似ています。

  Prefix {name} with a unique text to avoid name collisions.
  There is no {group} like with placing signs.

  名前の衝突を避けるため、{name}の前にユニークなテキストを付けます。
  配置記号のような {group} はありません。

  The {name} can be a String or a Number.  The optional {dict}
  argument specifies the sign attributes.  The following values
  are supported:

  {name}には文字列または数値を指定します。
  オプションの {dict} 引数は符号属性を指定します。

  以下の値がサポートされています：

```txt
icon    full path to the bitmap file for the sign.
linehl  highlight group used for the whole line the sign is placed in.
numhl   highlight group used for the line number where the sign is placed.
text	text that is displayed when there is no icon or the GUI is not being used.
texthl	highlight group used for the text item
culhl   highlight group used for the text item when the cursor is on the same line
        as the sign and 'cursorline' is enabled.
```
  If the sign named {name} already exists, then the attributes
  of the sign are updated.

  {name}という符号が既に存在する場合、その符号の属性が更新されます。

  The one argument {list} can be used to define a list of signs.
  Each list item is a dictionary with the above items in {dict}
  and a "name" item for the sign name.

  引数 {list} は、符号のリストを定義するために使用できます。
  各リスト項目は、{dict}の上記の項目と、符号名の「name」項目を持つ辞書です。

  Returns 0 on success and -1 on failure.  When the one argument
  {list} is used, then returns a List of values one for each
  defined sign.

  成功すると0を、失敗すると-1を返します。
  引数{list}が1つの場合、定義された各符号に対して1つの値のリストを返します。
~~~

~~~admonish warning title="Deprecated"
![deprecated-warn](img/deprecated-warn.avif)

なんかうっかり "見つけてしまった" のか、もしくは "見つかってしまった" と言うべきなのか、
`sign_define()`は`Nvim 0.12`で削除されてしまうみたい...😿

![deprecated-che](img/deprecated-che.avif)

ほなしゃーないなぁってことで、`Nvim 0.12`が来る前に書き換えておきましょう。

```lua
local sev = vim.diagnostic.severity
local symbols = { [sev.ERROR] = '', [sev.WARN] = '', [sev.INFO] = '', [sev.HINT] = '󰌶' }

vim.diagnostic.config {
  signs = {
    text = symbols,
  },
}
```

![deprecated-che](img/deprecated-ok.avif)

わたしの`lua`パワーでは、このコードは難易度が高すぎるんだけど、これで OK だそうです😅
~~~

## 🎼 It will be all right, just let it be.

そんなこんなで`Trouble`でした。これで当初の[ロードマップ](../lsp/language-server-protocol.html)を踏破したことになります❗

「ほんと、がんばったんだねー🤗」

この章も堂々の完結です😆

少し前の項でもちょっと触れましたが、タイミングというか巡り合わせが良いので、次回は`💤lazy.nvim`を取り上げます。

```admonish note
`lazy.nvim`は`Trouble`と同じく @folke さんのプロジェクトです😄

とても綺麗に繋がりますね✨
```

一気にお引越しを済ませちゃいましょう🚚

「踏破したのに、ぜんっぜん終われへんやんけ...😑」と思われているかもしれませんが...、

次が最終章です❗

```admonish success
It will be all right, just let it be.
{{footnote:
後のインタビューで McCartney はその夢について、
母親から "It will be all right, just let it be." と言われたと語っている。
[Wikipedia](https://en.wikipedia.org/wiki/Let_It_Be_(Beatles_song))より
}}

きっと大丈夫、そのままでいいんだよ。
```
