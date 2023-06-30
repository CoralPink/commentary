# copilot-cmp

前回は`copilot.lua`のおかげで、無事に`GitHub Copilot`から飛び立ったわけなんですが、
目的地である`nvim-cmp`は、まだ受け入れ態勢が整っていません。

...急いで滑走路と管制塔を建設しましょう❗まじで👷‍♀️

```admonish info title="[copilot-cmp](https://github.com/zbirenbaum/copilot-cmp)"
This repository transforms [https://github.com/zbirenbaum/copilot.lua](https://github.com/zbirenbaum/copilot.lua) into a cmp source.

このリポジトリは、[https://github.com/zbirenbaum/copilot.lua](https://github.com/zbirenbaum/copilot.lua) を cmp のソースに変換します。

Copilot suggestions will automatically be loaded into your cmp menu as snippets and display
their full contents when a copilot suggestion is hovered.

Copilot のサジェストは自動的にスニペットとして cmp メニューに読み込まれ、
copilot のサジェストにカーソルを合わせるとその全内容が表示されます。
```

`copilot-cmp`を導入することで、`Copilot`の提案を`nvim-cmp`で扱うことができるようになります😆

```admonish success title=""
Boy, you’re gonna carry that weight
{{footnote:
Carry That Weight (by [The Beatles](https://en.wikipedia.org/wiki/The_Beatles)):
Paul McCartney によって書かれ、Lennon-McCartney によってクレジットされたこの曲は、
アルバムのクライマックスである Side-two メドレーの7曲目、最後尾に位置する曲である。
The Beatles の曲では珍しく、4人全員がコーラスでユニゾン・ヴォーカルをとっている。
この曲の前に "Golden Slumbers" があり、"The End" へと続いていく。
}}

Carry that weight a long time

あーあ、 きみはその重荷を背負うんだ

その重みを ずっと背負うことになるんだよ
```

## Setup

~~~admonish info title="[Setup](https://github.com/zbirenbaum/copilot-cmp#setup)"
If you already have copilot.lua installed, you can install this plugin with packer as you would any other with the following code:

すでにcopilot.luaがインストールされている場合、以下のコードで他のプラグインと同様にpackerでインストールすることができます：

```lua
use {
  "zbirenbaum/copilot-cmp",
  after = { "copilot.lua" },
  config = function ()
    require("copilot_cmp").setup()
  end
}
```
~~~

`copilot_cmp`単体では特にコンフィグも無いので`packer`からこのまま`setup()`しちゃっていいと思います。

### Install

で、これをどこに入れようかちょっと考えちゃいますが、わたしは`cmp`一味に迎え入れることにしました😆

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
        run = 'make install_jsregexp',
        config = function() require 'extensions.luasnip' end,
        requires = { 'saadparwaiz1/cmp_luasnip', 'rafamadriz/friendly-snippets' },
      },
+     {
+       'zbirenbaum/copilot-cmp',
+       after = { 'copilot.lua' },
+       config = function() require('copilot_cmp').setup() end,
+     }
    },
  }
```
~~~

```admonish success title=""
I never give you my pillow{{footnote:
中間のブリッジは、金管楽器、エレキギター、ヴォーカルで、"You Never Give Me Your Money" の冒頭を再現しているが、歌詞は異なっている。
}}

僕は きみに枕を渡さない

I only send you my invitations

きみには ただ僕からの招待状を送るだけ
```

## packer.nvim

ここでまた`packer`を少しだけ補足します。

### after

`after`は以下のような説明がされています。

~~~admonish info title="packer.use()"
```lua
  after = string or list, -- Specifies plugins to load before this plugin.
                          -- このプラグインの前にロードするプラグインを指定します。
```
~~~

この場合は`copilot.lua`がロード後、続いて`copilot-cmp`がロードされます。

```admonish tip
これも勝手に`Optional Load`の扱いにしてくれるので、プラグインは`Packer`管理下の`opt`ディレクトリに配置されます。
```

#### PackerStatus

`PackerStatus`を覗いてみるとわかるんですが、
`copilot.lua`がロードされていない場合は`copilot-cmp`もロードされません。

~~~admonish quote
```vim
:PackerStatus
```
~~~

~~~admonish info title="PackerStatus"
`PackerStatus`については、
かろうじて[Quickstart](https://github.com/wbthomason/packer.nvim#quickstart)に記載があります。

```txt
-- Show list of installed plugins
-- インストールされているプラグインのリストを表示する

:PackerStatus
```
~~~

![packer-not-loaded](img/packer-not-loaded.webp)

少し見えにくいかもしれませんが、`(not loaded)`と表示されていますね😉

逆に、`copilot.lua`がロードされると、`copilot-cmp`もロードされます。

~~~admonish quote
```vim
:PackerLoad copilot.lua
```
~~~

ってしてからもう一回確認してみましょう。

![packer-loaded](img/packer-loaded.webp)

`(not loaded)`の表示が消えました😆

```admonish tip
何が言いたいかって言うと、要は前回作った`Takeoff`コマンドを使って、まとめてロードできちゃうってことです❗
```

## Config

それではコンフィグを組み込んでいきましょう。

### suggestion / panel

```admonish info title="[Setup](https://github.com/zbirenbaum/copilot-cmp#setup)"
It is recommended to disable copilot.lua's suggestion and panel modules,
as they can interfere with completions properly appearing in copilot-cmp.

copilot.luaのsuggestionモジュールとpanelモジュールは、
copilot-cmpで適切に表示される補完を妨害することがあるので、無効にすることをお勧めします。

To do so, simply place the following in your copilot.lua config:

そのためには、copilot.luaの設定に以下を記述してください：
```

はい、入れましょう😉

~~~admonish example title="extensions/copilot.lua"
```diff
  require('copilot').setup {
+   suggestion = { enabled = false },
+   panel = { enabled = false },

    copilot_node_command = 'node',
  }
```
~~~

### nvim-cmp

そしたら`nvim-cmp`側の調整も行いましょう😆

#### Tab Completion Configuration (Highly Recommended)

一個ほんとに自信のない項目があって、それがこれなんすわぁ😫

```admonish info title="[Tab Completion Configuration (Highly Recommended)](https://github.com/zbirenbaum/copilot-cmp#tab-completion-configuration-highly-recommended)"
Unlike other completion sources, copilot can use other lines above or below an empty line to provide a completion.
This can cause problematic for individuals that select menu entries with TAB.

他の補完ソースとは異なり、copilot は空行の上または下にある他の行を使用して補完を提供することができます。
このため、TAB を使用してメニュー項目を選択する場合に問題が発生することがあります。

This behavior is configurable via cmp's config and the following code will make it so that the menu still appears normally,
but tab will fallback to indenting unless a non-whitespace character has actually been typed.

この動作は、cmp の config で設定できます。以下のコードでは、メニューは通常どおり表示されますが、
空白以外の文字が実際に入力されない限り、タブはインデントにフォールバックされます。
```

えっ...、ええっ...、なんですのん...❓

とりあえずこれ、`Super-Tab`の処理が既にいることもあって複雑なので、ファイルを分けて書いてみます。

~~~admonish example title="extensions/nvim-cmp-actions.lua"
```lua

local cmp = require 'cmp'
local luasnip = require 'luasnip'

local function has_words_before()
  local line, col = unpack(vim.api.nvim_win_get_cursor(0))
  return col ~= 0 and vim.api.nvim_buf_get_lines(0, line - 1, line, true)[1]:sub(col, col):match '%s' == nil
end

local function has_copilot()
  if vim.api.nvim_buf_get_option(0, 'buftype') == 'prompt' then
    return false
  end
  local line, col = unpack(vim.api.nvim_win_get_cursor(0))
  return col ~= 0 and vim.api.nvim_buf_get_text(0, line - 1, 0, line - 1, col, {})[1]:match '^%s*$' == nil
end

local M = {}

M.tab = function(fallback)
  if cmp.visible() then
    cmp.select_next_item(has_copilot() and { behavior = cmp.SelectBehavior.Select } or {})
    return
  end

  if luasnip.expand_or_jumpable() then
    luasnip.expand_or_jump()
    return
  end

  if has_words_before() then
    cmp.complete()
    return
  end

  fallback()
end

M.shift_tab = function(fallback)
  if cmp.visible() then
    cmp.select_prev_item()
    return
  end

  if luasnip.jumpable(-1) then
    luasnip.jump(-1)
    return
  end

  fallback()
end

return M
```
~~~

~~~admonish example title="extensions/nvim-cmp.lua"
```lua
local cmp = require 'cmp'
local act = require 'extensions.nvim-cmp-actions'

local map = cmp.mapping

cmp.setup {
  mapping = map.preset.insert {
    ['<C-d>'] = map.scroll_docs(-4),
    ['<C-f>'] = map.scroll_docs(4),
    ['<C-Space>'] = map.complete(),
    ['<C-e>'] = map.abort(),
    ['<CR>'] = map.confirm { select = false },

    ['<Tab>'] = map(act.tab, { 'i', 's' }),
    ['<S-Tab>'] = map(act.shift_tab, { 'i', 's' }),
  },

  -- (以下略)

}
```
~~~

無理やりねじ込んではみたものの、
そもそも何が問題なのかをわたしがよくわかっていないので、まじで自信がありません。

"入力"がどうとかの話をしているので`Insert`モードの話だとは思うんだけど...。

ま、まあおかしかったら直しておいてください😅

#### sources

`nvim-cmp`の`sources`に新人を紹介してあげましょう。はい、なかよし😆

~~~admonish example title="extensions/init.lua"
```diff
  sources = {
    { name = 'nvim_lsp' },
    { name = 'luasnip' },
+   { name = 'copilot' },
  },
```
~~~

これで`Neovim`の空に`GitHub Copilot` 🛫 `copilot.lua` 🗺️ `copilot-cmp` 🛬 `nvim-cmp`という航路が完成しました❗

## Cleared to land.

まもなく着陸体制...😦

~~~admonish note
```vim
:Takeoff
```

してからね❗
~~~

![copilot-cmp](img/copilot-cmp.webp)

Nice Landing❗😭

中身が的確かどうかは別として、ちゃんと`Copilot`からの提案が挙げられています😉

```admonish success title=""
And in the middle of the celebrations

そして祝いの真っ只中に

I break down

僕は泣き崩れる
```

### Uses cmp

前項を見て、「ノットエレガント💢」と思う人もいるでしょう。

`Copilot`の威力を真に感じられるのは、例えば以下のような方法です👩‍✈️

まずは適当に`lua`ファイルを作って、`:Takeoff`したあと、以下のようにコメントを入力してみましょう。

```txt
-- 受け取った文字列に、数字があったら全てを合計した値を返す.
```

ってやっただけで...、

![copilot-cmp1](img/copilot-cmp1.webp)

エレガント❗

![copilot-cmp2](img/copilot-cmp2.webp)

ベリーエレガント❗❗

![copilot-cmp3](img/copilot-cmp3.webp)

エルルルルェ ガンンンンンンンヌャスッ❗❗❗💨

![copilot-cmp4](img/copilot-cmp4.webp)
![copilot-cmp5](img/copilot-cmp5.webp)

なんかもうエレガントっていうか、怖いこの人たち...。

![copilot-cmp6](img/copilot-cmp6.webp)

```admonish info title=""
“It's kind of scary but exciting, because it's the future”

"一種の怖さはあるけどわくわくするね、なぜってこれが未来だから"
```

```admonish warning
ところでねえ、コパイロットくん❗

これ「数字がなかったら`nil`返す」って言っときながら`0`返ってるよね😑

...だからね、こうしてみたらどうかな😆

![copilot-cmp7](img/copilot-cmp7.webp)

合計が`0`っていうケースも忘れないで😉

えっ❗マイナス値⁉️ ...それは忘れよう。
```

```admonish note
環境が一時的に変わってますが気にしないでください。

リストがアイコンになっている点は、また後日...😅
```

あくまでもわたしの環境でやったらこうなりました〜というもので、同じ手順で同じコードが提案されるかどうかはわかりません😅

「全体の流れとしてこんな感じだよー」ぐらいで、よろしくどうぞ❗

## Spot in. Good night!

`Copilot`の実力は、なんだか測りきれない感もありますが、堪能はできましたね🤗

間違った提案はしてくるけど、それはこっちが気づいてあげればいいだけなので、温かく見守ってあげましょう😽

(逆に言うと、細かい誤りに自分で気付けないと...🙀)

```admonish success
Boy, you’re gonna carry that weight

Carry that weight a long time
{{footnote:
McCartney は、「この曲は The Beatles の経営難と当時の Apple の雰囲気について歌っている」と述べた。
Lennon は、「Paul が僕たち全員について歌っていた」と語っている。
[Wikipedia](https://en.wikipedia.org/wiki/Carry_That_Weight)より
}}

あーあ、 きみはその重荷を背負うんだ

その重みを ずっと背負うことになるんだよ
```
