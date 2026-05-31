# 🌃 gitsigns.nvim

今回は`gitsigns.nvim`です。

人によっては`git`を全く使っていないかもしれませんが、これをきっかけに挑戦してみると楽しいと思います。

```admonish info title="[gitsigns.nvim](https://github.com/lewis6991/gitsigns.nvim)"
Deep buffer integration for Git

Git のための深甚なる buffer 統合
```

だよねー。もう Christmas🎄 だもんねー😆 華やかな "装飾" を施していきましょう❗

```admonish success title=""
I may not always love you

僕が 君をいつまでも愛してるとは限らない
```

## 📋 Requirements

```admonish abstract title=""
Neovim >= 0.9.0
```

```admonish tip
If your version of Neovim is too old, then you can use a past [release](https://github.com/lewis6991/gitsigns.nvim/releases).

使用している Neovim のバージョンが古すぎる場合は、過去のリリースを使用することができます。
```

```admonish warning
If you are running a development version of Neovim (aka `master`), then breakage may occur if your build is behind latest.

Neovimの開発版 (別名master) を使っている場合、ビルドが最新版より遅れていると、バグが発生する可能性があります。
```

```admonish abstract title=""
Newish version of git. Older versions may not work with some features.

gitの新しいバージョン。古いバージョンでは機能によっては動作しないことがあります。
```

まあ、ざっくり要約すると、
`Neovim`も`git`も "`stable release`をあえて外している😑" とかしてなければ気にしなくて平気です。

大抵の場合、そのまま進んで問題ないはずです。

```admonish success title=""
But long as there are stars above you

You never need to doubt it

でも 君の上に星が輝く限り

疑う必要はないんだ
```

```admonish success title=""
I’ll make you so sure about it

この想いを 君に伝えてみせるよ
```

## 🛠️ Installation & Usage

もう意地でも聖夜🌃に間に合わせます。`gitsigns`に負けないくらい超高速でいきましょう😆

```admonish info title="[🛠️ Installation & Usage](https://github.com/lewis6991/gitsigns.nvim#%EF%B8%8F-installation--usage)"
Install using your package manager of choice. No setup required.

Optional configuration can be passed to the setup function. Here is an example with most of the default settings:
お好きなパッケージマネージャーを使ってインストールしてください。セットアップは不要です。

オプションの設定をセットアップ関数に渡すことができます。以下はデフォルト設定の例です：
```

今回は色々カスタマイズしていきたいので、
まずはここに示されているデフォルトセッティングを入れておくことにしましょう。

これをもとに、あとでカスタマイズしていきます。

~~~admonish example title="extensions/gitsigns.lua"
```lua
require('gitsigns').setup {
  signs = {
    add          = { text = '┃' },
    change       = { text = '┃' },
    delete       = { text = '_' },
    topdelete    = { text = '‾' },
    changedelete = { text = '~' },
    untracked    = { text = '┆' },
  },
  signs_staged = {
    add          = { text = '┃' },
    change       = { text = '┃' },
    delete       = { text = '_' },
    topdelete    = { text = '‾' },
    changedelete = { text = '~' },
    untracked    = { text = '┆' },
  },
  signs_staged_enable = true,
  signcolumn = true,  -- Toggle with `:Gitsigns toggle_signs`
  numhl      = false, -- Toggle with `:Gitsigns toggle_numhl`
  linehl     = false, -- Toggle with `:Gitsigns toggle_linehl`
  word_diff  = false, -- Toggle with `:Gitsigns toggle_word_diff`
  watch_gitdir = {
    follow_files = true
  },
  auto_attach = true,
  attach_to_untracked = false,
  current_line_blame = false, -- Toggle with `:Gitsigns toggle_current_line_blame`
  current_line_blame_opts = {
    virt_text = true,
    virt_text_pos = 'eol', -- 'eol' | 'overlay' | 'right_align'
    delay = 1000,
    ignore_whitespace = false,
    virt_text_priority = 100,
    use_focus = true,
  },
  current_line_blame_formatter = '<author>, <author_time:%R> - <summary>',
  sign_priority = 6,
  update_debounce = 100,
  status_formatter = nil, -- Use default
  max_file_length = 40000, -- Disable if file is longer than this (in lines)
  preview_config = {
    -- Options passed to nvim_open_win
    style = 'minimal',
    relative = 'cursor',
    row = 0,
    col = 1
  },
}
```
~~~

~~~admonish example title="extensions/init.lua"
```lua
use {
  'lewis6991/gitsigns.nvim',
  config = function() require 'extensions.gitsigns' end,
}
```
~~~

ってことで、もうすっかりお馴染みの`:PackerSync`😆

![gitsigns-install](img/gitsigns-install.avif)

```admonish note
フライングで登場していた[signcolumn](../options/signcolumn.html)
からここまでに2ヶ月かかりました...。

まあなんか、やってやったぜってな感じはあります☺️
```

もし`git`の管理下に居たのなら、もうこの時点で`sigincolumn`に装飾🎄がされてますね❗yeah!! 🍾

```admonish success title=""
God only knows{{footnote: God Only Knows (by [The Beach Boys](https://en.wikipedia.org/wiki/The_Beach_Boys)):
1966年のアルバム[Pet Sounds](https://en.wikipedia.org/wiki/Pet_Sounds)に収録されている曲。
[Brian Wilson](https://en.wikipedia.org/wiki/Brian_Wilson)と[Tony Asher](https://en.wikipedia.org/wiki/Tony_Asher)によって書かれたこの曲は、
[バロック](https://en.wikipedia.org/wiki/Baroque_pop)スタイルのラブソングで、そのハーモニーの革新性と複雑さ、珍しい楽器編成、
歌詞と音楽の両面における典型的なポピュラー音楽の慣習の破壊によって際立っている。
この曲は、史上最も偉大な曲のひとつであり、The Beach Boys の最高傑作であると賞賛されている。

この曲の洗練された音楽性は、3つの対位法的なヴォーカルパートと弱い調性中心 (EキーとAキーの間で競い合う) によって示されている。
歌詞は、恋人のいない人生は神によってのみ理解できると主張する語り手の視点から表現されている。
Wilson はこの曲のきっかけを、Asher が[Stella by Starlight](https://en.wikipedia.org/wiki/Stella_by_Starlight)のような
スタンダード・ナンバーに親しんでいたことに求めていた。
}}
what I’d be without you

君がいてくれなかったら 僕がどうなっていたか

それは 神様だけが知っている
```

### 🎹 Keymaps

カスタマイズに入る前に、キーマップも入れておきましょう。

キーマップはデフォルトでは有効になっていないようなので、これも もうそのまま貼り付けちゃいます❗

```admonish info title="[🎹 Keymaps](https://github.com/lewis6991/gitsigns.nvim#-keymaps)"
Gitsigns provides an on_attach callback which can be used to setup buffer mappings.

Gitsigns は on_attach コールバックを提供し、buffer マッピングの設定に使用することができます。
```

~~~admonish example title="extensions/gitsigns.lua"
```lua
-- require('gitsigns').setup {

-- 📋 以下のコードを setup の中にペーストします。

  on_attach = function(bufnr)
    local gitsigns = require('gitsigns')

    local function map(mode, l, r, opts)
      opts = opts or {}
      opts.buffer = bufnr
      vim.keymap.set(mode, l, r, opts)
    end

    -- Navigation
    map('n', ']c', function()
      if vim.wo.diff then
        vim.cmd.normal({']c', bang = true})
      else
        gitsigns.nav_hunk('next')
      end
    end)

    map('n', '[c', function()
      if vim.wo.diff then
        vim.cmd.normal({'[c', bang = true})
      else
        gitsigns.nav_hunk('prev')
      end
    end)

    -- Actions
    map('n', '<leader>hs', gitsigns.stage_hunk)
    map('n', '<leader>hr', gitsigns.reset_hunk)

    map('v', '<leader>hs', function()
      gitsigns.stage_hunk({ vim.fn.line('.'), vim.fn.line('v') })
    end)

    map('v', '<leader>hr', function()
      gitsigns.reset_hunk({ vim.fn.line('.'), vim.fn.line('v') })
    end)

    map('n', '<leader>hS', gitsigns.stage_buffer)
    map('n', '<leader>hR', gitsigns.reset_buffer)
    map('n', '<leader>hp', gitsigns.preview_hunk)
    map('n', '<leader>hi', gitsigns.preview_hunk_inline)

    map('n', '<leader>hb', function()
      gitsigns.blame_line({ full = true })
    end)

    map('n', '<leader>hd', gitsigns.diffthis)

    map('n', '<leader>hD', function()
      gitsigns.diffthis('~')
    end)

    map('n', '<leader>hQ', function() gitsigns.setqflist('all') end)
    map('n', '<leader>hq', gitsigns.setqflist)

    -- Toggles
    map('n', '<leader>tb', gitsigns.toggle_current_line_blame)
    map('n', '<leader>tw', gitsigns.toggle_word_diff)

    -- Text object
    map({'o', 'x'}, 'ih', gitsigns.select_hunk)
  end
}
```
~~~

もう結構`lua`にも見慣れてきたんじゃないでしょうか❓

「`on_attach`と言われても...」、という感じには多少なるものの、`map()`が`vim.keymap.set()`に繋いでくれてるのは、まあなんか分かりますよね😉

パラメータもほぼそのままなので、カスタマイズをしたい場合は`map()`を追加・変更していけば良さそうです。

使用できる機能は以下で説明されています。

~~~admonish info title=":h gitsigns-functions"
```txt
Note functions with the {async} attribute are run asynchronously and accept
an optional {callback} argument.

{async} 属性を持つ関数は非同期に実行され、オプションの {callback} 引数を受け付けることに注意してください。
```
~~~

キーマップにはあらかじめ機能が割り当てられていて、「こんな色々できるんだぁ☺️」とサプライズ満載なので、ぜひ色々試してみてください。

`preview_hunk`とかちょっとした時に便利😉

![preview_hunk](img/preview_hunk.avif)

## 🥌 Customize

手始めに、装飾を少しアレンジしてみます。

もちろん、このままがいい❗って場合はスキップしちゃって構いません。デフォルトでも全然イケてるプラグインです😆

```admonish success title=""
If you should ever leave me

君が 僕を見限るようなことがあるかもしれない
```

### 🖊️ signs / signs_staged

ここでは表示する`text`を変えてみました。

~~~admonish example title="extensions/gitsigns.lua"
```lua
signs = {
  add = { text = ' ▎' },
  change = { text = ' ▎' },
  delete = { text = ' ' },
  topdelete = { text = ' ' },
  changedelete = { text = '~' },
  untracked = { text = '▎ ' },
},
signs_staged = {
  add = { text = ' ▎' },
  change = { text = ' ▎' },
  delete = { text = ' ' },
  topdelete = { text = ' ' },
  changedelete = { text = '~' },
  untracked = { text = '▎ ' },
},
```
~~~

|||
|:---:|:---:|
|**before**|![signs-default](img/signs-before.avif)|
|**after**|![signs-costom](img/signs-after.avif)|

### 🏂 word_diff

~~~admonish example title="extensions/gitsigns.lua"
```lua
word_diff = true,
```
~~~

~~~admonish info title=":h gitsigns-config-word_diff"
```txt
word_diff                                          gitsigns-config-word_diff
      Type: `boolean`, Default: `false`

      Highlight intra-line word differences in the buffer.
      バッファ内の行内の単語の相違をハイライトします。

      Requires `config.diff_opts.internal = true` .

      Uses the highlights:
        • For word diff in previews:
          • `GitSignsAddInline`
          • `GitSignsChangeInline`
          • `GitSignsDeleteInline`
        • For word diff in buffer:
          • `GitSignsAddLnInline`
          • `GitSignsChangeLnInline`
          • `GitSignsDeleteLnInline`
        • For word diff in virtual lines (e.g. show_deleted):
          • `GitSignsAddVirtLnInline`
          • `GitSignsChangeVirtLnInline`
          • `GitSignsDeleteVirtLnInline`
```
~~~

`word_diff`を有効にすると、単語単位で差分が検出されます。

![custom_highlights_before_before](img/custom_highlights_before.avif)

...ちょっと派手すぎません❗❓

何十人も集まるようなパーティーであれば、このぐらい盛り上がってくれれば、それはもう大変に開き甲斐のあるパーティーです🥳

でも、普段使いで❓これを❗❓いや〜...、それはなにかこう、特別な勇気が必要になってくるような...。

```admonish note
「それは`git`の運用が下手なんだ」と言われればそうなんですけどね😿
```

なので、もうちょっと抑えたいなーと思うんですけど...🤔

そういえば`:h gitsigns-config-word_diff`の中で、これに関して使用している`highlights`が示されてますよね。

`highlights`といえば心強い味方が既にいました❗`onenord.nvim`です😆

`extensions/onenord.lua`を引っ張り出してきて、以下を追記してみましょう。

~~~admonish example title="extensions/onenord.lua"
```lua
custom_highlights = {
  MatchParen = { fg = colors.none, bg = colors.none, style = 'bold,underline' },

  -- ここに追記する
  GitSignsAddLnInline = { fg = colors.none, bg = colors.none, style = 'underline' },
  GitSignsChangeLnInline = { fg = colors.none, bg = colors.none, style = 'underline' },
  GitSignsDeleteLnInline = { fg = colors.purple, bg = colors.none, style = 'bold,underline' },
},
```
~~~

![custom_highlights_before_after](img/custom_highlights_after.avif)

ありがとう...❗onenord...❗

### 🧊 attach_to_untracked

~~~admonish example title="extensions/gitsigns.lua"
```lua
attach_to_untracked = false,
```
~~~

これは、わたしが今の今まで気づいていなかったんですが...。

~~~admonish info title=":h gitsigns-config-attach_to_untracked"
```txt
attach_to_untracked                      *gitsigns-config-attach_to_untracked*
      Type: `boolean`, Default: `true`

      Attach to untracked files.
      未追跡のファイルにアタッチする。
```
~~~

ちゃんとアタッチを無効にするオプションありました😮

[signcolumn](../options/signcolumn.html)でこれを知らなくて、
`number`オプションを"クセつよ"呼ばわりしてたんですが、わたしが無知なだけでした...。

ほんとごめんなさい😭

### 🦌 current_line_blame_formatter

~~~admonish example title="extensions/gitsigns.lua"
```lua
current_line_blame_formatter = '<summary> (<author_time:%Y/%m>)',
```
~~~

わたし自身はそんなにうまく活用できてないんですが、これはちょっと面白いやつです。

~~~admonish info title=":h gitsigns-config-current_line_blame_formatter"
```txt
current_line_blame_formatter    gitsigns-config-current_line_blame_formatter
      Type: `string|function`, Default: `' <author>, <author_time> - <summary>'`

      String or function used to format the virtual text of
      |gitsigns-config-current_line_blame|.

      仮想テキストをフォーマットするために使用される文字列または関数。

      When a string, accepts the following format specifiers:
      文字列の場合、以下のフォーマット指定子を受け付けます。
```
~~~

フォーマット指定子については量が多いので手元で確認してもらうとして、
デフォルトで`current_line_blame`を有効化するかどうかは、以下のパラメータです。

~~~admonish info title=":h gitsigns-config-current_line_blame"
```txt
current_line_blame                        gitsigns-config-current_line_blame
      Type: `boolean`, Default: `false`

      Adds an unobtrusive and customisable blame annotation at the end of
      the current line.

      現在の行の末尾に、目立たずカスタマイズ可能な注釈を追加します。

      The highlight group used for the text is `GitSignsCurrentLineBlame`.
```
~~~

デフォルトでは有効になっていないのですが、キーマップをそのまま持ってきているなら以下のコードが入っているはずです。

```lua
map('n', '<leader>tb', gs.toggle_current_line_blame)
```

<kbd>leader</kbd><kbd>t</kbd><kbd>b</kbd>としてみましょう。

変更箇所に持っていくとあら不思議😮

|||
|:---:|:---:|
|**before**|![current_line_blame_before](img/current_line_blame_before.avif)|
|**after**|![current_line_blame_after](img/current_line_blame_after.avif)|

`summary`が表示されました😆

これだとちょっと見にくいな〜と思ったら、また`onenord.lua`に`GitSignsCurrentLineBlame`を追加して好きなように変えられます。

```admonish note
`gitsigns`を`GitSign`とか言っちゃっててかわいいですね❗❗...はい、ごめんなさい🥹
```

## 🔗 Plugin Integrations

`gitsign.nvim`と連携するプラグインとして、以下が挙げられています。

```admonish info title="[vim-fugitive](https://github.com/tpope/vim-fugitive)"
When viewing revisions of a file (via `:0Gclog` for example),
Gitsigns will attach to the fugitive buffer with the base set to the commit immediately before the commit of that revision.
This means the signs placed in the buffer reflect the changes introduced by that revision of the file.

ファイルのリビジョンを（たとえば `:0Gclog` 経由で）表示する場合、Gitsigns はそのリビジョンのコミット直前のコミットをベースとして、fugitive バッファーにアタッチします。
つまり、バッファに配置された標識は、そのファイルのそのリビジョンで導入された変更を反映しています。
```

```admonish info title="[trouble.nvim](https://github.com/folke/trouble.nvim)"
If installed and enabled (via `config.trouble`; defaults to true if installed),
`:Gitsigns setqflist` or `:Gitsigns setloclist` will open Trouble instead of Neovim's built-in quickfix or location list windows.

インストールされて有効になっている場合 (`config.trouble` 経由; インストールされている場合のデフォルトは true)、
`:Gitsigns setqflist` または `:Gitsigns setloclist` は
Neovim 組み込みのクイックフィックスまたはロケーションリストウィンドウの代わりに Trouble を開きます。
```

このサイトに限った話で言うと、`vim-fugitive`は (わたしが使ったことないので) 取り上げていなくて、
`trouble.nvim`は[16.11章](../lsp/trouble.html) で取り上げています。...ここからだと、だいぶ先ですが😅

言うまでもなく、そんなの全然気にしないで、必要ならどんどんインストールしていきましょう❗

```admonish success title=""
Though life would still go on, believe me{{footnote:
God Only Knows を自殺願望を助長する曲と解釈する論者もいるが、そのような解釈は作曲者が意図したものではない。
}}

The world could show nothing to me

So what good would living do me?

きっとその世界では もう何も見せてはくれないんだ

そんなところで生きることに 何の意味がある？

それでも命を続けていく限り、信じてほしい
```

## 🎁 Wrap Up

賑やかな装飾を施せましたね❗サンタさんも大喜びです🎅

冒頭でも少し書いてるんですが、やっぱり`git`を使い出すと世界が広がるし、色々知れて楽しいと思います。

"`git`触ったことない❗"って人でも、このプラグインをきっかけに使い始めるのは全然アリです❗

下手しても失敗しても、未来で笑い飛ばせばいいんです❗❗...はい、ごめんなさい🥹

```admonish success title="Assemble"
God only knows what I’d be without you{{footnote:
この曲の高度な和声構造は、
[Delibes](https://en.wikipedia.org/wiki/Léo_Delibes), [Bach](https://en.wikipedia.org/wiki/Johann_Sebastian_Bach),
[Stravinsky](https://en.wikipedia.org/wiki/Igor_Stravinsky)といったクラシック作曲家の作品と比較されることがある。
[Wikipedia](https://en.wikipedia.org/wiki/God_Only_Knows)より
}}

君がいてくれなかったら 僕がどうなっていたか

それは 神様だけが知っている
```
