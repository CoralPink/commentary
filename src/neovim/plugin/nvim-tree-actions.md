# nvim-tree.lua \- Actions

さてさて、`nvim-tree.lua`の続きです。

```admonish quote title=""
Why do birds suddenly appear

Every time you are near?

なぜ鳥たちは 空からそっと舞い降りてくるのでしょう？

あなたがそばに来るたびに
```

## Change the Settings

それでは前回のセッティングから拡張していくための準備をします。

まずは、もうすっかりお馴染みの`telescope.nvim`を使うことを`packer`に伝えておきましょう。

~~~admonish example title="extensions/init.lua"
```diff
  use {
    'nvim-tree/nvim-tree.lua',
    config = function() require 'extensions.nvim-tree' end,
-   requires = 'nvim-tree/nvim-web-devicons',
+   requires = { 'nvim-tree/nvim-web-devicons', 'nvim-telescope/telescope.nvim'},
  }
```
~~~

```admonish note
しれっと流しましたが、ここでも`telescope.nvim`が登場します❗
```

次項ですぐコードを載せますが、ちょっと大きいので別ファイルにしたいと思います。
無いものを`require`してエラーを出すのも面白くないので、読み込み先をあらかじめ用意しておきましょう。

ファイル名は`nvim-tree-actions.lua`としました。

~~~admonish example title="extensions/nvim-tree-actions.lua"
```lua
local M = {}

function M.on_attach(bufnr)
  -- とりあえずからっぽ〜
end

return M
```
~~~

これを`nvim-tree.lua`の`on_attach`に充てます。

~~~admonish example title="extensions/nvim-tree.lua"
```diff
-  on_attach = 'default'
+  on_attach = require('extensions.nvim-tree-actions').on_attach,
```
~~~

この状態で`NvimTree`を開いてみて、エラーが出ないことを確認したら、次へ進みましょう❗

![nvim-tree-no-error](img/nvim-tree-no-error.webp)

```admonish quote title=""
Just like me, they long to be

Close to you{{footnote: (They Long to Be) Close to You (by [The Carpenters](https://en.wikipedia.org/wiki/The_Carpenters)):
[Burt Bacharach](https://en.wikipedia.org/wiki/Burt_Bacharach)と[Hal David](https://en.wikipedia.org/wiki/Hal_David)によって書かれた曲で、
初期のバージョンの一部は Cathy Steeves によって書かれた。

Bacharach と David は、この曲を[Herb Alpert](https://en.wikipedia.org/wiki/Herb_Alpert)に提供したが、
Alpert はこの曲を録音したものの、その仕上がりに満足できずリリースしなかった。

その後、1969年に[Ticket to Ride](https://en.wikipedia.org/wiki/Ticket_to_Ride_(song)#The_Carpenters)で 初めてチャート入りした Carpenters のことを知った Alpert は
彼らにこの曲を録音するよう持ちかけた。
Richard Carpenter は、しぶしぶアレンジを考えたが、あまり乗り気ではなかった。

彼はこれを自然消滅する話だろうと思っていたが、
"Herb が本当に彼らにこの曲を歌ってほしがっている" という噂が Richard と Karen に伝わった。
Ticket to Ride がチャート入りしたとは言え、成績自体はそこまで芳しくなく、
レーベル内での立場が不安定だったことを考えた Ricahrd は、再びこの曲に取り組むことを決めた。

そして完成したこの曲は 1970年8月12日に全米レコード協会 (RIAA) によりゴールドに認定され、
1971年の[グラミー賞](https://en.wikipedia.org/wiki/Grammy_Awards)では
最優秀コンテンポラリー・パフォーマンス賞 (デュオ、グループ、コーラス)を受賞した。
[Wikipedia](https://en.wikipedia.org/wiki/(They_Long_to_Be)_Close_to_You)より
}}

私と同じ 彼らも願っているのでしょう

あなたのすぐそばにいたいんだよね
```

## Actions

で、早速`nvim-tree-actions.lua`をこんなんします。

もう先に全部載せちゃいますが、あとで補足します。

~~~admonish example title="extensions/nvim-tree-actions.lua"
```lua
local menuCommand = {}

local function actionsMenu(nd)
  local default_options = {
    results_title = 'NvimTree',
    finder = require('telescope.finders').new_table {
      results = menuCommand,
      entry_maker = function(menu_item)
        return {
          value = menu_item,
          ordinal = menu_item.name,
          display = menu_item.name,
        }
      end,
    },
    sorter = require('telescope.sorters').get_generic_fuzzy_sorter(),
    attach_mappings = function(prompt_buffer_number)
      local actions = require 'telescope.actions'

      -- On item select
      actions.select_default:replace(function()
        -- Closing the picker
        actions.close(prompt_buffer_number)
        -- Executing the callback
        require('telescope.actions.state').get_selected_entry().value.handler(nd)
      end)
      return true
    end,
  }

  -- Opening the menu
  require('telescope.pickers')
    .new({ prompt_title = 'Command', layout_config = { width = 0.3, height = 0.5 } }, default_options)
    :find()
end

local api = require 'nvim-tree.api'
local tree, fs, node = api.tree, api.fs, api.node

local command = {
  { '',      tree.change_root_to_node,       'CD' },
  { '',      node.open.replace_tree_buffer,  'Open: In Place' },
  { '',      node.show_info_popup,           'Info' },
  { '',      fs.rename_sub,                  'Rename: Omit Filename' },
  { '',      node.open.tab,                  'Open: New Tab' },
  { '',      node.open.vertical,             'Open: Vertical Split' },
  { '',      node.open.horizontal,           'Open: Horizontal Split' },
  { '<BS>',  node.navigate.parent_close,     'Close Directory' },
  { '<CR>',  node.open.edit,                 'Open' },
  { '<Tab>', node.open.preview,              'Open Preview' },
  { '>',     node.navigate.sibling.next,     'Next Sibling' },
  { '<',     node.navigate.sibling.prev,     'Previous Sibling' },
  { '.',     node.run.cmd,                   'Run Command' },
  { '-',     tree.change_root_to_parent,     'Up' },
  { '',      fs.create,                      'Create' },
  { '',      api.marks.bulk.move,            'Move Bookmarked' },
  { 'B',     tree.toggle_no_buffer_filter,   'Toggle No Buffer' },
  { '',      fs.copy.node,                   'Copy' },
  { 'C',     tree.toggle_git_clean_filter,   'Toggle Git Clean' },
  { '[c',    node.navigate.git.prev,         'Prev Git' },
  { ']c',    node.navigate.git.next,         'Next Git' },
  { '',      fs.remove,                      'Delete' },
  { '',      fs.trash,                       'Trash' },
  { 'E',     tree.expand_all,                'Expand All' },
  { '',      fs.rename_basename,             'Rename: Basename' },
  { ']e',    node.navigate.diagnostics.next, 'Next Diagnostic' },
  { '[e',    node.navigate.diagnostics.prev, 'Prev Diagnostic' },
  { 'F',     api.live_filter.clear,          'Clean Filter' },
  { 'f',     api.live_filter.start,          'Filter' },
  { 'g?',    tree.toggle_help,               'Help' },
  { 'gy',    fs.copy.absolute_path,          'Copy Absolute Path' },
  { 'H',     tree.toggle_hidden_filter,      'Toggle Dotfiles' },
  { 'I',     tree.toggle_gitignore_filter,   'Toggle Git Ignore' },
  { 'J',     node.navigate.sibling.last,     'Last Sibling' },
  { 'K',     node.navigate.sibling.first,    'First Sibling' },
  { 'm',     api.marks.toggle,               'Toggle Bookmark' },
  { 'o',     node.open.edit,                 'Open' },
  { 'O',     node.open.no_window_picker,     'Open: No Window Picker' },
  { '',      fs.paste,                       'Paste' },
  { 'P',     node.navigate.parent,           'Parent Directory' },
  { 'q',     tree.close,                     'Close' },
  { 'r',     fs.rename,                      'Rename' },
  { 'R',     tree.reload,                    'Refresh' },
  { 's',     node.run.system,                'Run System' },
  { 'S',     tree.search_node,               'Search' },
  { 'U',     tree.toggle_custom_filter,      'Toggle Hidden' },
  { 'W',     tree.collapse_all,              'Collapse' },
  { '',      fs.cut,                         'Cut' },
  { 'y',     fs.copy.filename,               'Copy Name' },
  { 'Y',     fs.copy.relative_path,          'Copy Relative Path' },

--{ '<2-LeftMouse>',  node.open.edit,        'Open' },

  { '<Space>', actionsMenu,                  'Command' },
}

local function createTreeActions()
  for _, cmd in pairs(command) do
    table.insert(menuCommand, { name = cmd[3], handler = cmd[2] })
  end
end

createTreeActions()

local M = {}

function M.on_attach(bufnr)
  local opts = function(desc)
    return { desc = 'nvim-tree: ' .. desc, buffer = bufnr, nowait = true }
  end

  for _, cmd in pairs(command) do
    if (string.len(cmd[1]) > 0) then
      vim.keymap.set('n', cmd[1], cmd[2], opts(cmd[3]))
    end
  end
end

return M
```
~~~

```admonish note
`on_attach`を`require`してるだけなのに、`on_attach`から直接呼ばれてないコードも動くのは不思議に見えるかもしれませんが、
今日のところはひとまずこれで...。
```

```admonish quote title=""
Why do stars fall down from the sky

Every time you walk by?

なぜ星たちは 夜空からそっとこぼれてくるのでしょう？

あなたが通り過ぎるたびに
```

### keymap

キーマップを定義しているのは

```lua
local command
```

です。

コマンドに使用できる`API`は以下を参照。

~~~admonish info title=":h nvim-tree-api"
```txt
Nvim-tree's public API can be used to access features.

Nvim-treeの公開APIを使用して、機能にアクセスすることができます。

This module exposes stable functionalities, it is advised to use this in order
to avoid breaking configurations due to internal breaking changes.

このモジュールは、安定した機能を公開するものです。
を使用することで、内部のブレークチェンジによる構成のブレークを回避することができます。

The api is separated in multiple modules, which can be accessed with
`api.<module>.<function>`

apiは複数のモジュールに分かれており、アクセスするには
`api.<module>.<function>` とする。
```
~~~

`Filter`を例にとってみると

|[1]|[2]|[3]|
|:---|:---|:---|
|'f'|api.live_filter.start|'Filter'|

となってます。

```admonish note
うっかりしがちですが、`lua`のインデックスは`[0]`ではなく`[1]`から始まります。
```

それを`M.on_attach`の中で取得してループをぐるぐるして`vim.keymap.set`に順番に入れてます。

オリジナリティーを発揮しているのは、キー定義(インデックス 1)が空っぽだったらスキップするっていう程度でしょうか。

```lua
function M.on_attach(bufnr)
  local opts = function(desc)
    return { desc = 'nvim-tree: ' .. desc, buffer = bufnr, nowait = true }
  end

  for _, cmd in pairs(command) do
    if (string.len(cmd[1]) > 0) then
      vim.keymap.set('n', cmd[1], cmd[2], opts(cmd[3]))
    end
  end
end
```

`opts`のあたりは`nvim-tree.lua`がオフィシャルに示しているコードほぼそのままです。

```admonish info title="[Migrating To on_attach](https://github.com/nvim-tree/nvim-tree.lua/wiki/Migrating-To-on_attach)"
This function runs when the nvim-tree buffer is created.

この関数は、nvim-treeバッファが作成されるときに実行されます。
```

まずはベーシックなキーマッピングを確認してみましょう。
全部確認するのは大変なので、「1個動けば 2個も 100個も一緒でしょ❓😮」の理屈で行きます。

`Filter`を動かしてみましょう。`NvimTree`にフォーカスしている状態で <kbd>f</kbd> をぽちっと😆

![nvim-tree-filter](img/nvim-tree-filter.webp)

"FILTER" の入力欄が現れましたね。ちゃんと動いてます😉

はい、じゃあ次❗どんどん行かないとまた長くなっちゃうんで❗

```admonish quote title=""
Just like me, they long to be

Close to you

私と同じ 彼らも願っているのでしょう

あなたのすぐそばにいたいんだよね
```

### Recipes

最初の方にある`actionsMenu`については、`nvim-tree.lua`の`wiki`で公開されているコードを好き勝手やらせてもらってます😅

```admonish info title="[Creating an actions menu using Telescope](https://github.com/nvim-tree/nvim-tree.lua/wiki/Recipes#creating-an-actions-menu-using-telescope)"
@Tolomeo

It is possible to use Telescope as a menu, listing custom items and executing a callback on item selection.

Telescopeをメニューとして使用してカスタムアイテムをリストアップし、アイテム選択時にコールバックを実行することが可能です。
```

わたしが下手に説明するよりはコードを読み解いてもらった方が良いのですが、

大まかには`command`の内容を利用して別で`menuCommand`を作って...

```lua
local menuCommand = {}

local function createTreeActions()
  for _, cmd in pairs(command) do
    table.insert(menuCommand, { name = cmd[3], handler = cmd[2] })
  end
end

createTreeActions()
```

<kbd>Space</kbd> が押されると`actionsMenu`を呼び出して...

```lua
{ '<Space>', actionsMenu,                  'Command' },
```

`telescope.finders`に対して`menuCommand`テーブルを作成・表示するんですね。

```lua
local function actionsMenu(nd)
  local default_options = {
    results_title = 'NvimTree',
    finder = require('telescope.finders').new_table {
      results = menuCommand,

      -- (以下略)
```

じゃあ、これも前節と同じ要領で <kbd>Space</kbd> をぽちっと😆

こんなん出ました❗

![nvim-tree-menu-action](img/nvim-tree-menu-action.webp)

もう`telescope`の操作説明は不要ですね。項目を選べばちゃんと登録された内容が実行されます☺️

```admonish quote title=""
On the day that you were born, the angels got together

And decided to create a dream come true

あなたの生まれる日

天使たちは集まって ひとつの夢を贈ろうと決めた
```

```admonish quote title=""
So they sprinkled moon dust in your hair of gold

And starlight in your eyes of blue

金の髪に月のきらめき

青い瞳は星の光
```

### Mouse Using

最後にもう一個だけ。`local command`の中にこんなのがいましたね。

```lua
{ '<2-LeftMouse>',  node.open.edit,        'Open' },
```

わたしはコメントアウトしちゃってるんですが、
これを有効にするとダブルクリック (とか、ダブルタップとか) でファイルを開くことができます。

~~~admonish info title=":h double-click"
```txt
Double, triple and quadruple clicks are supported when the GUI is active, for
Win32 and for an xterm.  For selecting text, extra clicks extend the
selection:

GUIがアクティブなときに、ダブルクリック、トリプルクリック、クアドラプルクリックがサポートされています。
Win32とxterm用です。 テキストを選択する場合、更にクリックすることで選択範囲を広げることができます。

	click      select ~
	double     word or % match      <2-LeftMouse>
	triple     line                 <3-LeftMouse>
	quadruple  rectangular block	<4-LeftMouse>
```
~~~

```admonish note
クアドラプル ⭐ クリック 🤩
```

もしこの辺りを追及していくのであれば、以下を足掛かりにしていくと良いかもしれません。

~~~admonish info title=":h mouse-using"
```txt
Using the mouse                                         mouse-using

                                    mouse-mode-table mouse-overview
```
~~~

```admonish quote title=""
That is why all the girls in town

Follow you all around

だから街じゅうの女の子たちは

みんな あなたに夢中なんだよ
```

## (They Long to Be) Close to You

```admonish quote title=""
Just like me, they long to be

Close to you

私と同じ 彼女たちも願っているのでしょう

あなたのすぐそばにいたいんだもの
```

<video controls preload="none" width="1280" height="720" data-poster="img/ueno-park-thumbnail.webp">
  <source src="img/ueno-park.webm" type="video/webm">
  Your browser does not support the video/webm.
</video>

```admonish success title="Assemble"
次回からは、いよいよ`LSP`を取り上げていきます...❗

桜が満開になった頃にまたお会いしましょう🌸 よい春を🤗
```
