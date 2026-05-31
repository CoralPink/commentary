# LuaSnip

前回は`LSP`を使用した補完が動いて大満足でしたね😊

今回はこれに加えて、スニペットによる鮮やかな華🌻 を添えていきましょう😽

`LuaSnip`の登場です❗

```admonish info title="[LuaSnip](https://github.com/L3MON4D3/LuaSnip)"
[Features](https://github.com/L3MON4D3/LuaSnip#features)

Parse LSP-Style Snippets either directly in lua, as a vscode package or a snipmate snippet collection.

LSP-Styleスニペットをluaで直接解析、vscodeパッケージ、snipmateスニペットコレクションとして解析します。

Expand LSP-Snippets with nvim-compe (or its' successor, nvim-cmp (requires cmp_luasnip))

nvim-compe (または後継の nvim-cmp (cmp_luasnip)) を使って LSP-Snippets を拡張します。
```

`Wikipedia`によれば、

```admonish info title="[スニペット](https://ja.wikipedia.org/wiki/スニペット)"
スニペット(英語: snippet)とは、「断片」という意味で、
再利用可能なソースコード、マシンコード、またはテキストの小さな領域を表すプログラミング用語である。
通常、これらはより大きなプログラミングモジュールに組み込むために正式に定義された操作ユニットである。
スニペット管理は、一部のテキストエディタ、ソースコードエディタ、統合開発環境、および関連ソフトウェアの機能である。
これにより、ユーザーは日常の編集操作中に繰り返し入力する必要がなくなる。
```

...とのことです。

ぶっちゃけ「なんのこっちゃ」ですが、実際に動かして見てみれば至ってシンプルです 🐈

何よりも "繰り返し入力する必要がなくなる" という文言には魅力があります🤩

~~~admonish success title=""
Mean Mr. Mustard{{footnote:
Mean Mr. Mustard (by [The Beatles](https://en.wikipedia.org/wiki/The_Beatles)):
本作は1968年頃に The Beatles のメンバーがインド・ऋषिकेश (リシケーシュ) で、
महर्षि महेश योगी (Maharishi Mahesh Yogi) のもとで瞑想修行を行っていた時期に書かれた楽曲で、
内容は Mustard というホームレスの男の日常を綴ったものとなっている。
歌詞のインスピレーションについて、Lennon は
「どこかでしみったれた男の新聞記事を読んだ。そいつは5ポンド札を鼻の中ではなく、別のどこかに隠していた」と語っている。
[Wikipedia](https://en.wikipedia.org/wiki/Mean_Mr._Mustard)より
}}
sleeps in the park

Shaves in the dark trying to save paper

おケチなマスタードさん 公園でおねむだよ

暗がりでヒゲ剃り お金の節約
~~~

## Requirements

```admonish abstract title="[Requirements](https://github.com/L3MON4D3/LuaSnip#requirements)"
Neovim >= 0.5 (extmarks) `jsregexp` for lsp-snippet-transformations

(see [here](https://github.com/L3MON4D3/LuaSnip/blob/master/DOC.md#transformations) for some tips on installing it).

導入のコツは[こちら](https://github.com/L3MON4D3/LuaSnip/blob/master/DOC.md#transformations)をご覧ください。
```

`jsregexp`のインストールは環境によっては少し難しいです。

この後の項でも触れますが、わたしはどうしてもうまくいきませんでした😭

### jsregexp

`jsregexp`については以下の通りです。

~~~admonish info title="[jsregexp](https://github.com/kmarius/jsregexp)"
Provides ECMAScript regular expressions for Lua 5.1, 5.2, 5.3, 5.4 and LuaJit.
Uses `libregexp` from Fabrice Bellard's [QuickJS](https://bellard.org/quickjs/).

Lua 5.1, 5.2, 5.3, 5.4 および LuaJit 用の ECMAScript 正規表現を提供します。
Fabrice Bellard 氏の [QuickJS](https://bellard.org/quickjs/) にある`libregexp`を使用しています。
~~~

これは`telescope.nvim`の時と同じように、`packer`から`make`を使用してインストールできます😉

## Install

と、いうことで一旦ここまでをインストールしてみましょう。

`nvim-cmp`の`requires`に追加してしまって差し支えないでしょう😌

~~~admonish example title="extensions/init.lua"
```diff
  use {
    'hrsh7th/nvim-cmp',
    config = function() require 'extensions.nvim-cmp' end,
    requires = {
      'hrsh7th/cmp-nvim-lsp',
+     {
+       'L3MON4D3/LuaSnip',
+       tag = "v1.*",
+       run = 'make install_jsregexp',
+     }
    },
  }
```
~~~

```admonish tip
`tag`はあってもなくても平気ですが、オフィシャルに「入れてね」と案内されています。
これはもう素直に入れておくべきですね❗

...わたしは入れずに使わせてもらってる "ひねくれ者" なんですけど😲
```

じゃあいつも通り、`PackerSync`や`PackerInstall`を行なってみましょう...。

うまくいったかな❓

### ( In case of installation failure )

これもなんか決まり文句みたいになってるんですが、わたしの経験上`macOS`では問題になったことがありません。

...ですが、このサイトで使用している`Fedora`系の環境では`jsregexp`のインストールがうまくいきませんでした...😫
(ちょっと頑張ってはみたんですが😅)

![luasnip-error](img/luasnip-error.avif)

ただ幸いにも、これは`optional`という位置付けなので必須ではありません。

```admonish info title="[Transformations](https://github.com/L3MON4D3/LuaSnip/blob/master/DOC.md#transformations)"
If `jsregexp` is not available, transformations are replaced by a simple copy.

`jsregexp`が利用できない場合、変換は単純なコピーで置き換えられます。
```

なので、ひとまず安心してください😺

ただ、これだと`packer`でアップデートを動かす度に`make`が走ってしまうので、`run`だけ外しておきましょう。

~~~admonish example title="extensions/init.lua"
```diff
  use {
    'hrsh7th/nvim-cmp',
    config = function() require 'extensions.nvim-cmp' end,
    requires = {
      'hrsh7th/cmp-nvim-lsp',
      {
       'L3MON4D3/LuaSnip',
        tag = "v1.*",
-       run = 'make install_jsregexp',
      }
    },
  }
```
~~~

まあなんか、そんなこともあるよね〜❗ってことで😆

## Add Snippets

スニペットのフォーマットにはいくつかあるみたいで、`LuaSnip`は以下のフォーマットに対応しています。

~~~admonish info title="[Add Snippets](https://github.com/L3MON4D3/LuaSnip#add-snippets)"
Check out [the doc](https://github.com/L3MON4D3/LuaSnip/blob/master/DOC.md#loaders) for a general explanation of the
loaders and their benefits.

ローダーとその利点の一般的な説明については、
[ドキュメント](https://github.com/L3MON4D3/LuaSnip/blob/master/DOC.md#loaders)をチェックしてください。

The following list serves only as a short overview.

以下のリストは、簡単な概要としてのみ役立ちます。
~~~

~~~admonish info title=""
**VS Code-like**:

To use existing VS Code style snippets from a plugin
(eg. [rafamadriz/friendly-snippets](https://github.com/rafamadriz/friendly-snippets)) simply install the plugin and then add

(例えば [rafamadriz/friendly-snippets](https://github.com/rafamadriz/friendly-snippets)) から
既存のVS Codeスタイルのスニペットを使用するには、プラグインをインストールし、次のように追加します。

```lua
require("luasnip.loaders.from_vscode").lazy_load()
```
~~~

~~~admonish info title=""
**SnipMate-like**:

Very similar to VS Code packages; install a plugin that provides snippets and call the `load`-function:

VS Codeのパッケージと非常に似ており、スニペットを提供するプラグインをインストールし、load-functionを呼び出します：

```lua
require("luasnip.loaders.from_snipmate").lazy_load()
```
~~~

~~~admonish info title=""
**Lua**:

Add the snippets by calling `require("luasnip").add_snippets(filetype, snippets)`.
An example for this can be found [here](https://github.com/L3MON4D3/LuaSnip/blob/master/Examples/snippets.lua#L190).
This can also be done much cleaner, with all the benefits that come with using a loader,
by using the [loader for lua](https://github.com/L3MON4D3/LuaSnip/blob/master/DOC.md#lua)

`require("luasnip").add_snippets(filetype, snippets)`でスニペットを追加します。
この例は[ここ]((https://github.com/L3MON4D3/LuaSnip/blob/master/Examples/snippets.lua#L190).)で見ることができます。
また、ローダーを使うことで得られる利点はそのままに、
[lua用のローダー](https://github.com/L3MON4D3/LuaSnip/blob/master/DOC.md#lua)を使うことで、より簡単に行うことができます。
~~~

わたしとしては`VS Code-like`の説明の中に出てきている`Friendly Snippets`がおすすめなので、
これを使用できる状態を目標として進めていきます😉

## Config

いつものように`luasnip.lua`を作りましょう😺

~~~admonish example title="extensions/luasnip.lua"
```lua
require('luasnip.loaders.from_vscode').lazy_load()
```
~~~

そしてこれも、いつものように組み込みましょう😆

~~~admonish example title="extensions/init.lua"
```diff
  {
    'L3MON4D3/LuaSnip',
    tag = "v1.*",
    run = 'make install_jsregexp',
+   config = function() require 'extensions.luasnip' end,
  }

```
~~~

```admonish success title=""
Keeps a ten-bob note up his nose

Such a mean old man

10シリングを鼻の穴に隠してる

なんてケチな爺さんだ
```

## Keymaps

~~~admonish info title="[Keymaps](https://github.com/L3MON4D3/LuaSnip#keymaps)"
nvim-cmp's wiki also contains [an example](https://github.com/hrsh7th/nvim-cmp/wiki/Example-mappings#luasnip)
for setting up a super-tab-like mapping.

nvim-cmp の wiki には、super-tab のようなマッピングを設定する
[例](https://github.com/hrsh7th/nvim-cmp/wiki/Example-mappings#luasnip)も紹介されています。
~~~

...と、いうことなので、これを`nvim-cmp.lua`の`mapping`に入れちゃいましょう😉

~~~admonish example title="extensions/nvim-cmp.lua"
```lua
local cmp = require 'cmp'
local luasnip = require 'luasnip'

local map = cmp.mapping

local has_words_before = function()
  local line, col = unpack(vim.api.nvim_win_get_cursor(0))
  return col ~= 0 and vim.api.nvim_buf_get_lines(0, line - 1, line, true)[1]:sub(col, col):match '%s' == nil
end

cmp.setup {
  mapping = map.preset.insert {

    -- (中略)

    ['<Tab>'] = map(function(fallback)
      if cmp.visible() then
        cmp.select_next_item()
        -- You could replace the expand_or_jumpable() calls with expand_or_locally_jumpable()
        -- they way you will only jump inside the snippet region
      elseif luasnip.expand_or_jumpable() then
        luasnip.expand_or_jump()
      elseif has_words_before() then
        cmp.complete()
      else
        fallback()
      end
    end, { 'i', 's' }),

    ['<S-Tab>'] = map(function(fallback)
      if cmp.visible() then
        cmp.select_prev_item()
      elseif luasnip.jumpable(-1) then
        luasnip.jump(-1)
      else
        fallback()
      end
    end, { 'i', 's' }),
  },

  -- (中略)

}
```
~~~

`super-tab`については実際に動作を見た方が感覚が掴めると思うので、
この先の [16.7.2. Friendly Snippets](friendly_snippets.html) で簡単に補足します😉

```admonish success title=""
His sister Pam works in a shop

She never stops, she's a go-getter

妹のパムはショップで働いてるよ

彼女は決して立ち止まらない、頑張り屋さんなんだ
```

## Mean Mr. Mustard

結構色々組み込んできたんですが、まだ何も変化はありません。(なかなかハードですね...😅)

でもまあ、元気出していきましょう😆

```admonish success
Takes him out to look at the Queen{{footnote:
これはもちろん[Elizabeth II](https://en.wikipedia.org/wiki/Elizabeth_II) (エリザベス2世)のことですね。時代は変わる...。
}}

Only place that he's ever been

女王を見るために彼を連れ出すんだ

彼が今まで行ったことのある唯一の場所だよ
```
