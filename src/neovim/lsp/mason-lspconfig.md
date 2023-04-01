# mason-lspconfig.nvim

わかる人には、もう色々見透かされているとは思ってますが、そんなものは気にせずにど真ん中をぶっちぎります❗

`mason-lspconfig.nvim`のお通りだー❗

~~~admonish info title="[mason-lspconfig.nvim](https://github.com/williamboman/mason-lspconfig.nvim)"
`mason-lspconfig` bridges `mason.nvim` with the `lspconfig` plugin - making it easier to use both plugins together.

`mason-lspconfig` は `mason.nvim` と `lspconfig` プラグインを橋渡しし、両プラグインを一緒に使うことを容易にするものです。

```vim
:help mason-lspconfig.nvim
```
~~~

なんだかとってもややこしいですね😑

```admonish success title=""
This ain't song for the broken-hearted

心に傷を負った者のために これを歌うわけじゃない
```

## Install

これは`mason.nvim`とセットで入れておきましょう。

~~~admonish example title="extensions/mason.lua"
```diff
use {
  'williamboman/mason.nvim',
  config = function() require 'extensions.mason' end,
+ requires = {
+   'williamboman/mason-lspconfig.nvim', 'neovim/nvim-lspconfig',
+ }
}
```
~~~

`nvim-lspconfig`も呼び出す必要があるので、これもプラスで❗

## Config

で、これに関するコンフィグも`mason.lua`にまとめちゃいます。

~~~admonish example title="extensions/mason.lua"
```lua
require('mason').setup {
  ui = {
    check_outdated_packages_on_open = false,
    border = 'single',
  },
}

-- ここに追記
require('mason-lspconfig').setup_handlers {
  function (server_name)
    require("lspconfig")[server_name].setup {}
  end,
}
```
~~~

これだけです❗マジです。地味ながらとっても重要なやつです。

ドッジボールで言ったらキルア{{footnote: HUNTER X HUNTER です}}です❗

ただこれ...、かけるオーラの比率をほんの少しでも間違えると途端にアウトなので、
だいぶ気をつけて使ってください...。

~~~admonish info title="mason-lspconfig.setup_handlers()"
```
                                            mason-lspconfig.setup_handlers()
setup_handlers({handlers})
  Advanced feature
    This is an advanced, opt-in, feature that requires some careful
    reading of the documentation.

    これは、高度なオプトインの機能であり、いくつかの慎重さが必要です。
    ドキュメントを注意深く読む必要があります。

    The recommended method to set up servers with lspconfig is to do so by
    following their guides, see lspconfig-quickstart.

    lspconfigでサーバをセットアップするには、
    lspconfig-quickstartを参照して、そのガイドに従って行うことが推奨されます。

  Registers the provided {handlers}, to be called by mason when an installed
  server supported by lspconfig is ready to be set up.

  lspconfig がサポートするインストール済みサーバーのセットアップが完了したときに mason から呼び出される {handlers} を登録する。

  When this function is called, all servers that are currently installed
  will be considered ready to be set up. When a new server is installed
  during a session, it will be considered ready to be set up when
  installation succeeds.

  この関数が呼び出されると、現在インストールされているすべてのサーバーがセットアップ可能な状態にあるとみなされる。
  セッション中に新しいサーバーがインストールされた場合、インストールに成功した時点でセットアップの準備ができたとみなされます。

  {handlers} is a table where the keys are the name of an lspconfig server,
  and the values are the function to be called when that server is ready to
  be set up (i.e. is installed).

  {handlers}は、キーがlspconfigサーバーの名前で、
  値がそのサーバーがセットアップの準備ができた（すなわちインストールされた）ときに呼び出される関数であるテーブルです。
```
~~~

推奨される方法はこれではなくて他にあるので、「使う場合は注意してね」ってことです。

例えばめちゃくちゃ言語マニアが扱う場合は、`setup_handlers()`は使用せずに、個別にやったほうがきっちりできるはずです。

...ただ、わたしのような凡人が一個一個設定していかなきゃいけないってなると、
`mason.nvim`が提供してくれるお手軽さが損なわれてしまうのはあまりにも勿体ないと思うので、
これを理解した上で使用する分にはいいんじゃないかな〜って思うことにします、そうします❗

```admonish success title=""
It's my life!

これが俺の人生だ！
```

```admonish success title=""
My heart is like an open highway

Like Frankie said

I did it my way

俺の心は まるで見通しの良い高速道路だ

フランキーが歌ったように

俺は 俺の道を歩むんだ
```

## For the ones who stood their ground

ここまで来れば、ついに`LSP`とお話ができます❗がんばったね🤗

```admonish success title=""
This is for the ones who stood their ground

For Tommy and Gina who never backed down

これは 信じて立ち向かった者達のための歌だ

決して一歩も引かない トミーとジーナのために
```

### LspInfo

試しに、適当な`lua`ファイルを開いて

```vim
:LspInfo
```

としてみましょう。

![lspinfo](img/lspinfo.webp)

うわっ❗めっちゃお話ししてくれそう🥰

```admonish tip
`:LspInfo`は`nvim-lspconfig`の機能です😉
```

### Signature Help

じゃあ、試しに`lua`ファイルに記述されている`require`にカーソルを持っていって、<kbd>Ctrl-k</kbd>としてみましょう。

```admonish note
`nvim-lspconfig.lua`にキーマッピングを設定しましたね😌 もしデフォルトから変更している場合は読み替えてください。
```

![Signature Help](img/signature_help.webp)

めっちゃ教えてくれる😆

### Diagnostics

なんか嬉しくなってきたので、次はコードにイタズラをしてみましょう。

![Work LS](img/work-ls.webp)

やーい怒られたぁ🤣

#### lualine

`Diagnositcs`に関連して、もう一個やっておきましょう。おもむろに`lualine.lua`を開いて、こんなのを入れてみましょう。

~~~admonish example title="extensions/lualine.lua"
```lua
sections = {

-- (中略)

  lualine_c = {
    {
      'diagnostics',
      sources = { 'nvim_diagnostic', 'nvim_lsp' },
      sections = { 'error', 'warn', 'info', 'hint' },
      symbols = { error = ' ', warn = ' ', info = ' ', hint = ' ' },
    },
  },

-- (中略)

}
```
~~~

ってやってから、またちょっかい出してみると...❓

![lualine-diagnostics](img/lualine-diagnostics.webp)

`lualine`上に`Error`と`Warning`の数が表示されるようになりましたね❗

## I'll take you all.

だいぶ歩いてきました。

これさえやっておけば、他の言語の`LSP`を追加したくなった時も "基本的には" `mason`を操作するだけで良くなります。

結構な達成感じゃないでしょうか☺️

しかし、この章の冒頭にある綿密な[ロードマップ](language-server-protocol.html#start)でも示されていましたが、これはまだ序盤です。

```admonish note
やるのかい やらないのかい

どっっちなんっっだいっ❗❗{{footnote: なかやまきんに君です}}
```

やってやりましょう😆

"世界一のワガママ" の実現を目指して❗

```admonish success
Better stand tall when they're calling you out

Don't bend, don't break, baby, don't back down

呼ばれたら立ち向かえ

自分を曲げるな、挫けるな、それから、一歩も引くなよ
```

```admonish success title=""
I just wanna live while I'm alive

It's my life!

今 この瞬間を生きていたい

これが俺の人生だ！
{{footnote: It's My Life (by [Bon Jovi](https://en.wikipedia.org/wiki/Bon_Jovi)):
2番の歌詞にある「決して一歩も引かない トミーとジーナのために」というセリフは、
1986年のヒット曲 "Livin' on a Prayer" で初めて登場した架空のカップルを指している。
また、同じ New Jersey 州の Frank Sinatra に言及した詩が特徴。
Bon Jovi は次のように回想している。
「Sinatra は16本の映画を作り、80歳までツアーをした。これは俺のロールモデルだ 」と言ったら、
「そんな詞は書くなよ。君以外、誰も Sinatra のことなんて気にしていないんだから」と Sambora に言われた。
それでもとにかく書いてみたんだ。[Wikipedia](https://en.wikipedia.org/wiki/It%27s_My_Life_(Bon_Jovi_song))より
}}
```
