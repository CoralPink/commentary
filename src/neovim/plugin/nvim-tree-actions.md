# nvim-tree.lua \- Actions

```admonish quote title=""
And when I awoke I was alone

This bird had flown

目が覚めたら 僕は一人だった

小鳥は飛び去っていたんだ
```

```admonish tip title=""
「本当に何もしてないの？」とレイコさんは僕に訊いた。

「してませんよ」

「つまんないわねえ」とレイコさんはつまらなそうに言った。

「そうですね」と僕はコーヒーをすすりながら言った。
```

さてさて、`nvim-tree.lua`の下巻です。

```admonish tip title=""
「昨日はどこまで話したっけ？」とレイコさんが言った。

「嵐の夜に岩つばめの巣をとりに険しい崖をのぼっていくところまでですね。」と僕は言った。
```

```admonish tip title=""
「あなたって真剣な顔して冗談言うからおかしいわねえ」とレイコさんは呆れたように言った。
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

次節ですぐコードを載せますが、ちょっと大きいので別ファイルにしたいと思います。
無いものを`require`してエラーを出すのも面白くないので、読み込み先をあらかじめ用意しておきましょう。

~~~admonish example title="extensions/nvim-tree-actions.lua"
```lua
local M = {}

function M.on_attach(bufnr)
  -- とりあえず空っぽ〜
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
  require('telescope.pickers').new({ prompt_title = 'Command', layout_config = { width = 0.3, height = 0.5 } }, default_options):find()
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

オリジナリティーを発揮してるところは、キー定義(インデックス 1)が空っぽだったら無視するというところぐらいでしょうか。

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

`Filter`を動かしてみましょう。`NvimTree`にフォーカスしている状態で`f`キーをぽちっと。😆

![nvim-tree-filter](img/nvim-tree-filter.webp)

"FILTER" の入力欄が現れましたね。ちゃんと動いてます😉

じゃあ、次❗どんどん行かないとまた長くなっちゃうんで❗

### Recipes

これは`nvim-tree.lua`の`wiki`で公開されているコードを好き勝手やらせてもらってます😅

```admonish info title="[Creating an actions menu using Telescope](https://github.com/nvim-tree/nvim-tree.lua/wiki/Recipes#creating-an-actions-menu-using-telescope)"
@Tolomeo

It is possible to use Telescope as a menu, listing custom items and executing a callback on item selection.
Telescopeをメニューとして使用し、カスタムアイテムをリストアップし、アイテム選択時にコールバックを実行することが可能です。
```

コードは複雑なのでわたしが下手に説明するよりはコードを読み解いてもらった方が良いのですが、

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

`Space`キーが押されると`actionsMenu`を呼び出して...

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

前節と同じ要領で`NvimTree`にフォーカスしている状態で`Space`キーをぽちっと。😆

こんなん出ました❗

![nvim-tree-menu-action](img/nvim-tree-menu-action.webp)

操作は`telescope`と同じなので分かりますよね。項目を選べばちゃんと登録された内容が実行されます☺️


### Mouse Using

最後にもう一個だけ。`local command`の中にこんなのがいましたね。

```lua
--{ '<2-LeftMouse>',  node.open.edit,        'Open' },
```

わたしはコメントアウトしちゃってるんですが、
これを有効にするとダブルクリック (とか、ダブルタップとか) でファイルを開くことができます。

~~~admonish info title=":h double-click"
```
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
```
Using the mouse                                         mouse-using

                                    mouse-mode-table mouse-overview
```
~~~

## ( ...The End ? )

```admonish quote title=""
So I lit a fire

Isn’t it good Norwegian wood?

だから僕は燃やしてやったんだ

「綺麗だろ？ノルウェーの家具が燃えている」{{footnote:
Paul McCartney は曲の最後の節についてコメントをしている。
「僕らの考えでは、あの男は何らかの復讐をしなければならなかった。
"暖を取るために火をつけた" という意味でもよかったし、"彼女の家の装飾は素晴らしかった" で終わっても良かった。
でもそうじゃなくて、復讐のためにクソみたいな場所を燃やして、それをそのままにして楽器屋に行ったってことなんだ」
[en.wikipedia.org](https://en.wikipedia.org/wiki/Norwegian_Wood_(This_Bird_Has_Flown))より
}}
```

いや〜...、それで締めると BAD END みたいになっちゃうんで...😿

## The End !!
```admonish tip title=""
スチュワーデスがやってきて、僕の隣りに腰を下ろし、もう大丈夫かと訊ねた。

「大丈夫です、ありがとう。ちょっと哀しくなっただけだから。
(It's all right now, thank you. I only felt lonely, you know.)」

と僕は言って微笑んだ。
```

```admonish tip title=""
「Well, I feel same way, same thing, one in a while. I know what you mean.
(そういうこと私にもときどきありますよ。よくわかります)」

彼女はそう言って首を振り、席から立ち上がってとても素敵な笑顔を僕に向けてくれた。
```

```admonish tip title=""
「I hope you'll have a nice trip. Auf Wiedersehen! (よい御旅行を。さようなら)」

「Auf Wiedersehen!」と僕も言った。
```

```admonish success title="Assemble"
綺麗でしょ❓"ノルウェイの森"。

次回からは、いよいよ`LSP`を取り上げていきます...❗

桜が満開になった頃にまたお会いしましょう🌸 {{footnote: とは書いてはみたものの、間に合わなくても堪忍して...。}}

良い春を🌸 Auf Wiedersehen! 🤗
```
