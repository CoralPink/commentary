# LuaSnip

前回、`LSP`を使用した補完が動いて大満足でしたが、
今回はさらに、スニペットによる鮮やかな華を添えていきましょう。`LuaSnip`の登場です❗

```admonish info title="[LuaSnip](https://github.com/L3MON4D3/LuaSnip)"
[Features](https://github.com/L3MON4D3/LuaSnip#features)

Parse LSP-Style Snippets either directly in lua, as a vscode package or a snipmate snippet collection.

LSP-Styleスニペットをluaで直接解析、vscodeパッケージ、snipmateスニペットコレクションとして解析します。

Expand LSP-Snippets with nvim-compe (or its' successor, nvim-cmp (requires cmp_luasnip))

nvim-compe (または後継の nvim-cmp (cmp_luasnip)) を使って LSP-Snippets を拡張する。
```

[Wikipedia](https://en.wikipedia.org/wiki/Snippet_(programming))によれば、
プログラミングの実践において「スニペット」とは、
狭義にはエディタプログラムによって文字通りファイルに含まれるソースコードの一部を指し、
コピーアンドペーストプログラミングの一形態である。

...とのことです。

今のところ「なんのこっちゃ」ですが、動かして見てみれば至ってシンプルです 🐈

~~~admonish success title=""
Mean Mister Mustard{{footnote:
Mean Mister Mustard (by [The Beatles](https://en.wikipedia.org/wiki/The_Beatles)):
本作は1968年頃に The Beatles のメンバーがインド・ऋषिकेश (リシケーシュ) で、
महर्षि महेश य ोगी (マハリシ・マヘーシュ・ヨーギー) のもとで瞑想修行を行っていた時期に書かれた楽曲で、
内容は Mustard というホームレスの男の日常を綴ったものとなっている。
歌詞のインスピレーションについて、Lennon は
「どこかでしみったれた男の新聞記事を読んだ。そいつは5ポンド札を鼻の中ではなく、別のどこかに隠していた」と語っている。
[Wikipedia](https://ja.wikipedia.org/wiki/ミーン・ミスター・マスタード)より
}}
sleeps in the park

Shaves in the dark trying to save paper

おケチなマスタードさん 公園でおねむだよ

暗がりでヒゲ剃り お金の節約
~~~

## Requirements

```admonish info title="[Requirements](https://github.com/L3MON4D3/LuaSnip#requirements)"
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
`tag`はあってもなくても平気ですが、オフィシャルに「入れとけ」と案内されています。
入れといた方が安心ですね❗

...わたしは入れずに使わせてもらってるんですけど😲
```

じゃあいつも通り、`PackerSync`や`PackerInstall`を行なってみましょう...。

うまくいったかな❓

### ( In case of installation failure )

これもなんか決まり文句みたいになってるんですけど、わたしの経験上`macOS`では問題になったことがありません。

...ですが、このサイトで使用している`Fedora`系の環境では`jsregexp`のインストールがうまくいきませんでした...😫
(ちょっと頑張ってはみたんですが😅)

![luasnip-error](img/luasnip-error.webp)

幸いにも、これは`optional`という位置付けなので必須ではありません。

```admonish info title="[Transformations](https://github.com/L3MON4D3/LuaSnip/blob/master/DOC.md#transformations)"
If `jsregexp` is not available, transformations are replaced by a simple copy.

`jsregexp`が利用できない場合、変換は単純なコピーで置き換えられます。
```

なので、ひとまずは安心してください😺

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

なんだか順番というか、話の構成が難しくて てんやわんや してるんですが...、

~~~admonish info title="[Add Snippets](https://github.com/L3MON4D3/LuaSnip#add-snippets)"
Check out [the doc](https://github.com/L3MON4D3/LuaSnip/blob/master/DOC.md#loaders) for a general explanation of the
loaders and their benefits.

ローダーとその利点の一般的な説明については、
[ドキュメント](https://github.com/L3MON4D3/LuaSnip/blob/master/DOC.md#loaders)をチェックしてください。

The following list serves only as a short overview.

以下のリストは、簡単な概要としてのみ役立ちます。

- **VS Code-like**: To use existing VS Code style snippets from a plugin
(eg. [rafamadriz/friendly-snippets](https://github.com/rafamadriz/friendly-snippets)) simply install the plugin and then add

- プラグイン (例えば [rafamadriz/friendly-snippets](https://github.com/rafamadriz/friendly-snippets)) から
既存のVS Codeスタイルのスニペットを使用するには、プラグインをインストールし、次のように追加します。

```lua
require("luasnip.loaders.from_vscode").lazy_load()
```
~~~

最終的には今出てきた`Friendly Snippets`を使用できる状態を目標として進めます❗

`luasnip.lua`を作りましょう。

~~~admonish example title="extensions/luasnip.lua"
```lua
require('luasnip.loaders.from_vscode').lazy_load()
```
~~~

そして組み込みましょう。

~~~admonish example title="extensions/init.lua"
```diff
  {
    'L3MON4D3/LuaSnip',
    run = 'make install_jsregexp',
+   config = function() require 'extensions.luasnip' end,
    requires = { 'saadparwaiz1/cmp_luasnip', 'rafamadriz/friendly-snippets' },
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

ということなので、これを`nvim-cmp.lua`の`mapping`にそのまま入れちゃいましょう。

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

    ['<Tab>'] = cmp.mapping(function(fallback)
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

    ['<S-Tab>'] = cmp.mapping(function(fallback)
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
[16.6.2.2. Friendly Snippets](friendly_snippets.html)で簡単に補足します😉

```admonish success title=""
His sister Pam works in a shop

She never stops, she's a go-getter

妹のパンはショップで働いてるよ

彼女は決して立ち止まらない、頑張り屋さんなんだ
```

## I'll take you all.

結構色々組み込んできたんですが、まだ何も変化はありません。(びっくり❗❗)

でもまあ、元気出していきましょう😆

```admonish success
Takes him out to look at the Queen

Only place that he's ever been

女王を見るために彼を連れ出すんだ

彼が今まで行ったことのある唯一の場所だよ
```
