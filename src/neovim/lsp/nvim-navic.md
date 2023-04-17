# nvim-navic

今回はのほほんと`nvim-navic`を導入してみましょう。

```admonish info title="[nvim-navic](https://github.com/SmiteshP/nvim-navic)"
A simple statusline/winbar component that uses LSP to show your current code context.

Named after the Indian satellite navigation system.

LSP を使用して現在のコードコンテキストを表示するシンプルなステータスライン/ウィンバーコンポーネントです。

インドの衛星ナビゲーションシステムにちなんで名付けられました。
```

これも`LSP`を利用して動作するプラグインです。

日本で衛星の話はまだだいぶお耳が痛いですが、インドの`NavIC`
{{footnote:
当初、インド地域航法衛星システム(Indian Regional Navigation Satellite System/IRNSS)と呼称されていたが、
2016年4月にモディ首相によって名称変更が行われ，「NavIC」（Navigation Indian Constellation）と呼ばれることになった。
[Wikipedia](https://ja.wikipedia.org/wiki/インド地域航法衛星システム)より
}}
はしっかり地球を飛び立った衛星です。

```admonish success title=""
Before the rising sun, we fly

朝日が昇る前に、私たちは飛び立つ
```

## Setup

`nvim-navic`の導入は、それはもうとても恐ろしく簡単です。インド人もびっくり❗

...まあ、そもそも SmiteshP さんはインドの人なんだけど😮

~~~admonish example title="extensions/nvim-navic.lua"
```lua
require('nvim-navic').setup {
  lsp = {
    auto_attach = true,
  },
  highlight = true,
}
```
~~~

ご覧の通り、最低限これだけで飛べちゃいます。ニホン人もびっくり❗

### lsp

```admonish info title="[Setup](https://github.com/SmiteshP/nvim-navic#%EF%B8%8F-setup)"
For nvim-navic to work, it needs attach to the lsp server.

nvim-navicが動作するためには、lspサーバにアタッチする必要があります。

You can pass the nvim-navic's `attach` function as `on_attach` while setting up the lsp server.

lspサーバーのセットアップ時に、nvim-navicの`attach`関数を`on_attach`として渡すことができます。
```

とのことなんですが、これはもはや過去のものとなっています...❗次項へ跨ぎます🐈

#### auto_attach

```admonish info title="[Setup](https://github.com/SmiteshP/nvim-navic#%EF%B8%8F-setup)"
You can skip this step if you have enabled `auto_attach` option during setup.

セットアップ時に`auto_attach`オプションを有効にしている場合は、この手順を省略することができます。
```

`auto_attach`の登場によって、
`on_attach`すらも、言語ごとに`documentSymbolProvider`に対応してますかー❓なんていう確認すらも
自分で書く必要がありません😊 のほほん。

これ以上に "auto" なものがかつて他に存在したでしょうか⁉️

### highlight

`highlight`については、`onenord.nvim`が対応してくれているので自分でコードを書く必要が全くありません😆

```admonish note
使用しているカラーテーマが`nvim-navic`の`highlight`に対応していない場合でも
[Customise](https://github.com/SmiteshP/nvim-navic#-customise) の "Example highlight definitions" で案内されているように、
自分で色をつけることができちゃいます😉
```

なんだかもう至れり尽くせりです🐹 のほほん。

~~~admonish example title="extensions/init.lua"
```lua
use {
  'SmiteshP/nvim-navic',
  config = function() require 'extensions.nvim-navic' end,
  requires = 'neovim/nvim-lspconfig',
}
```
~~~

## Usage

```admonish info title="[Usage](https://github.com/SmiteshP/nvim-navic#-usage)"
nvim-navic does not alter your statusline or winbar on its own.
Instead, you are provided with these two functions and its left up to you how you want to incorporate this into your setup.

nvim-navicは、それ自体でステータスラインやwinbarを変更することはありません。
その代わり、この2つの機能が提供され、これをどのようにセットアップに取り入れるかはあなたに任されています。
```

~~~admonish info title=":h navic.is_available (bufnr)"
```txt
Returns boolean value indicating whether nvim-navic is able to provide
output for current buffer.

nvim-navic が提供可能かどうかを示すブール値を返します。
現在のバッファに対する出力。

'bufnr' is optional argument. If bufnr is not provied, current open
buffer is used.

bufnr' はオプションの引数である。bufnrが提供されない場合，現在のオープンな
バッファが使用されます。
```
~~~

~~~admonish info title="navic.get_location (opts, bufnr)"
```txt
Returns a pretty string that shows code context and can be used directly
in statusline or winbar.

opts table can be passed to override any of |nvim-navic|'s options.
Follows same table format as *navic-setup*|'s opts table. You can pass
|bufnr| value to determine which buffer is used to get code context. If
not provided, the current buffer will be used.

コードコンテキストを示す整理された文字列を返し、statusline や winbar で直接使用することができます。
opts テーブルは nvim-navic のオプションのいずれかを上書きするために渡すことができます。

navic-setup の opts テーブルと同じテーブル形式に従います。
bufnr 値を渡すと、コードコンテキストを取得するためにどのバッファを使用するかを決定することができます。
省略した場合は、現在のバッファが使用されます。
```
~~~

ネイティブに表示する方法なども示されていますが、わたしはやっぱり`lualine`を選んでいきます。

```admonish note
このサイトでは扱っていませんが、`feline`, `galaxyline`に表示する方法も示されています。
```

```admonish success title=""
So many roads to choose

たくさんの道があるように たくさんの選択がある
```

### lualine

ということでやっていくんですが、これもやっぱり簡単です。のほほん。

`lualine_c`に、`diagnostics`と並べて表示しましょう。

~~~admonish example title="extensions/lualine.lua"
```diff
    lualine_c = {
      {
        'diagnostics',
        sources = { 'nvim_diagnostic', 'nvim_lsp' },
        sections = { 'error', 'warn', 'info', 'hint' },
        symbols = { error = ' ', warn = ' ', info = ' ', hint = ' ' },
      },
+     { function() return navic.get_location() end, cond = function() return navic.is_available() end },
    },
```
~~~

必須ではありませんが、`packer`にも`lualine.nvim`が`nvim-navic`を使用していることを教えておいてあげましょう。

~~~admonish example title="extensions/init.lua"
```diff
use {
  'nvim-lualine/lualine.nvim',
  config = function() require 'extensions.lualine' end,
  after = 'onenord.nvim',
  requires = {
    'rmehri01/onenord.nvim', 'nvim-tree/nvim-web-devicons',
-   'neovim/nvim-lspconfig', 'lewis6991/gitsigns.nvim',
+   'neovim/nvim-lspconfig', 'lewis6991/gitsigns.nvim', 'SmiteshP/nvim-navic',
  },
}

```
~~~

そしたらほらね、ニホン人もびっくり❗

![nvim-navic](img/nvim-navic.webp)

```admonish success title=""
We’ll start out walking and learn to run

And yes, we’ve just begun
{{footnote: We've Only Just Begun (by [The Carpenters](https://en.wikipedia.org/wiki/The_Carpenters))
元々は、カリフォルニア州のクロッカー・ナショナル銀行のCMソングとして制作され、
タイトルのとおり「2人はまだ始まったばかり（We've Only Just Begun）」と結婚によって新しい人生を踏み出すことについて歌われている。
この曲は、アレンジャーとしての Richard の能力と、ボーカルとしての Karen の能力が最も発揮されているということで、
リチャードは「Carpenters の代表曲を挙げるなら『We've Only Just Begun』だな」と語っている。
[Wikipedia](https://ja.wikipedia.org/wiki/愛のプレリュード)より
}}

歩くことから始めましょう そのあと走ることを学びましょう

そう わたしたちはまだ始まったばかり
```

## Customise

これで終わっても全然いいんですけどね。もうちょっとのほほんとして行ってもバチは当たらないでしょ❓

その他にもいくつかカスタマイズできるところがあるので、わたしが使用しているものだけ載せていきます😄

### icons

オフィシャルに示されているものをそのまま持ってきちゃいますが、
これを入れると`VSCode like`なアイコンになります。

~~~admonish example title="extensions/nvim-navic.lua"
```lua
--require('nvim-navic').setup {

  icons = {
    File = ' ',
    Module = ' ',
    Namespace = ' ',
    Package = ' ',
    Class = ' ',
    Method = ' ',
    Property = ' ',
    Field = ' ',
    Constructor = ' ',
    Enum = ' ',
    Interface = ' ',
    Function = ' ',
    Variable = ' ',
    Constant = ' ',
    String = ' ',
    Number = ' ',
    Boolean = ' ',
    Array = ' ',
    Object = ' ',
    Key = ' ',
    Null = ' ',
    EnumMember = ' ',
    Struct = ' ',
    Event = ' ',
    Operator = ' ',
    TypeParameter = ' ',
  },

--}
```
~~~

```admonish note
これもやっぱり`Nerd Fonts`なので、このサイトでは横幅 680px あればブラウザ上でも確認できます。

PCならブラウザのウィンドウを横に広げてみたり、タブレットなら横表示にしてみてね☺️
```

VSCode like:
![nvim-navic-vscode_like](img/nvim-navic-vscode_like.webp)

Original:
![nvim-navic-original](img/nvim-navic-original.webp)

...。😮

ちょっと例がびみょーですが、全体的にアイコンが大きく見えるし、Booleanのアイコンは確かに変わってますね。ね❗

### depth_limit

あと、上限の鬼対策でこれも入れておくと安心です。

~~~admonish example title="extensions/nvim-navic.lua"
```lua
--require('nvim-navic').setup {

  depth_limit = 9,

--}
```
~~~

強いんだか弱いんだか分かりませんが、こうしておけば上限の百とか千とか、変なのが来ても安心です。

### Line Count

```admonish info title="[Setup](https://github.com/SmiteshP/nvim-navic#%EF%B8%8F-setup)"
NOTE: You can set `vim.b.navic_lazy_update_context = true`
for specific buffers, where you want the the updates to not occur on every `CursorMoved` event.
It should help if you are facing performance issues in large files. Read the docs for example usage of this variable.

注：特定のバッファで、`CursorMoved`イベントごとに更新を行わないようにしたい場合は、
`vim.b.navic_lazy_update_context = true`を設定することができます。
大きなファイルでパフォーマンスの問題に直面したときに役立つはずです。
この変数の使用例については、ドキュメントをお読みください。
```

~~~admonish info title=":h vim.b.navic_lazy_update_context"
Set it to true to update context only on CursorHold event.

Trueに設定すると、CursorHoldイベント時にのみコンテキストを更新します。以下のような場合に有効です。

Could be usefull if you are facing performance issues on large files. Example usage

大容量のファイルでパフォーマンスの問題に直面している場合。

```lua
vim.api.nvim_create_autocmd("BufEnter", {
  callback = function()
    if vim.api.nvim_buf_line_count(0) > 10000 then
      vim.b.navic_lazy_update_context = true
    end
  end,
})
```
~~~

サンプルだと`group`がありませんが、のほほんと入れとくのもありだと思います😄

```diff
  vim.api.nvim_create_autocmd("BufEnter", {
+   group = vim.api.nvim_create_augroup('nvim-navic', {}),
    callback = function()
      if vim.api.nvim_buf_line_count(0) > 10000 then
        vim.b.navic_lazy_update_context = true
      end
    end,
  })
```

## I'll take you all.

のほほんとできましたね😊

ちゃんと`LSP`をしっかり動かせるようになったことの賜物です。
「胸を張っていい❗❗{{footnote: ドッジボールはまだ続いている...❗}}」

```admonish success
Sharing horizons that are new to us

Watching the signs along the way

わたしたちにとって新たな地平線へ一緒に

道中の標識にも目を向けて
```

```admonish success title=""
Talkin’ it over, just the two of us

Workin’ together day to day, together

二人だけで語り合って

一緒に日々を生きていきましょう、 一緒に...
```

ところで、`nvim-navic`のトップにこんな一文がありましたね。

```admonish info title="nvim-navic"
You might also be interested in [nvim-navbuddy](https://github.com/SmiteshP/nvim-navbuddy).

Paired with nvim-navic, it will give you complete breadcrumbs experience like in an IDE!

[nvim-navbuddy](https://github.com/SmiteshP/nvim-navbuddy)に興味をお持ちの方もいらっしゃるかもしれません。

nvim-navicと組み合わせることで、IDEのような完全なパンくず体験ができるようになります！
```

`nvim-navbuddy`の存在はつい最近知ったので、
この章のロードマップには無かったし、わたし自身が超使いこなせているってこともないんですが...😟

なんか面白かったので、このサイトでもちょこっとだけ触れたいと思います😆

そんなこんなで次回に続く... 🪼
