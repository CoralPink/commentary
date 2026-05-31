# 💝 Migration from packer.nvim to 💤 lazy.nvim

```admonish fail title=""
Won't you come out tonight?

今夜、一緒に行かない？
```

今夜はハーベストムーン🌕 です。

月にお願いしましょう😊

「なんでも良いからなんか良い感じに実れぇ〜❗❗」

...と、いうわけで`lazy.nvim`を本格的にセットアップします😆

## 📦 Migration Guide

`lazy.nvim`には、`packer.nvim`からの移行ガイドがちゃんと用意されています。

```admonish info title="[📦 Migration Guide](https://github.com/folke/lazy.nvim#-migration-guide)"
packer.nvim

- setup ➡️ init
- requires ➡️ dependencies
- as ➡️ name
- opt ➡️ lazy
- run ➡️ build
- lock ➡️ pin
- disable=true ➡️ enabled = false
- tag='*' ➡️ version="*"
- after ℹ️ not needed for most use-cases. Use dependencies otherwise.
- wants ℹ️ not needed for most use-cases. Use dependencies otherwise.
- config don't support string type, use fun(LazyPlugin) instead.
- module is auto-loaded. No need to specify
- keys spec is different
- rtp can be accomplished with:
```

```admonish info title=""
With packer `wants`, `requires` and `after` can be used to manage dependencies.
With lazy, this isn't needed for most of the Lua dependencies.
They can be installed just like normal plugins (even with `lazy=true`) and will be loaded when other plugins need them.

packer `wants` では、`require` と `after` を使って依存関係を管理できます。
lazy を使えば、Lua の依存関係のほとんどは必要ありません。
これらは通常のプラグインと同じように（`lazy=true`でも）インストールすることができ、
他のプラグインがそれらを必要とするときにロードされます。
```

```admonish info title=""
The `dependencies` key can be used to group those required plugins with the one that requires them.
The plugins which are added as `dependencies` will always be lazy-loaded and loaded when the plugin is loaded.

`dependencies`キーは、それらのプラグインを必要とするプラグインをグループ化するために使用できます。
`dependencies`として追加されたプラグインは常に遅延ロードされ、プラグインがロードされた時にロードされます。
```

あら不思議😯

これに従っていくだけでチャチャっと片付いていきます❗

```admonish fail title=""
When the time is right

Oh, will you fight that feeling in your heart?

その時が来たら

ああ、君はハートの中のその気持ちと戦うことができる？
```

### 🔸 setup ➡️ init

これまでの`packer`の設定に見慣れていると、
いきなりちょっと捻くれたことしてるように見えるかもしれないんですが、わたしはこんな書き方にしてます。

~~~admonish example title="extensions/init.lua"
新しく`plugins`という **local変数** を置きます。中身はまだ、からっぽでへーきです😉

前節で退避させたプラグインのリストは、全部ここに入れていきます😌

```lua
local plugins = {

}
```

んで、ここは前回の [17.1 lazy.nvim - Configuration](./lazy.html#-configuration) で書いたコードがあって...、

```lua
local opts = {
  -- ...
}
```

あとは、[17.1 lazy.nvim - Installation](./lazy.html#-installation) のコードです。

```lua
local lazypath = vim.fn.stdpath('data') .. '/lazy/lazy.nvim'
if not vim.loop.fs_stat(lazypath) then
  vim.fn.system({
    'git',
    'clone',
    '--filter=blob:none',
    'https://github.com/folke/lazy.nvim.git',
    '--branch=stable',
    lazypath,
  })
end
vim.opt.rtp:prepend(lazypath)

require("lazy").setup()
```
~~~

```admonish note
この記述で言えば、`setup()`さえ一番下にいれば他のコードの順番は特に問題にならないはずです。
```

~~~admonish example title="extensions/init.lua"
そしたら、一番下にある`setup`を書き換えます。

```diff
- require("lazy").setup()
+ require('lazy').setup(plugins, opts)
```
~~~

![lazy-init](img/lazy-init.avif)

### 🥁 Evacuate the packer.nvim

ここまでで問題が無いようであれば、退避しておいた`packer.lua`からプラグインのリストを
**local変数** `plugins`の中に「どかっ❗」と持ってきましょう。

いよいよお引越しっぽくなってきました😆

```admonish note
当然このままでは動かないので、一旦コメントアウトしてから少しずつ進めるのもいいと思います。
```

### 🔹 use ➡️ (empty)

基本的には、先頭にあった`use {`を`{`に、`}`を`},`にするだけで全体の8割ぐらいは片付くでしょう。

```diff
- use {
+ {
     'nvim-treesitter/nvim-treesitter',
     config = function() require 'extensions.nvim-treesitter' end,
- }
+ },
```

~~~admonish tip
大雑把ではあるものの、以下の置換構文を用いると楽です。

```vim
:%s/use {/{
```

`Visual Mode`で plugins の中を**範囲選択**してから...

```vim
:s/}/},
```

![char-replace](img/char-replace.avif)

> `'<,'>`とかいう呪文は`:`を入力すれば勝手に詠唱されているはずです❗

で、そうすると上にもある通り、`},,`っていう変なところができちゃうので...

```vim
:%s/},,/},
```

とか、すれば良いはず❗...と思ったんだけど、
わたしが実際にこれでやってみたらこんなとこもありました。

お手数ですが直してください...。

```diff
- config = function() require('telescope-all-recent').setup {}, end,
+ config = function() require('telescope-all-recent').setup {} end,
```

...もしかしたら一手で綺麗に置換できる方法もあるかもしれないんだけどね😅
~~~

`config`プロパティしか使っていないプラグインは、もうこれだけでオッケー❗

### 🔹 requires ➡️ dependencies

これも簡単ですね。頭を使わなくても置換だけで終わります😆

```diff
  {
    'williamboman/mason.nvim',
    config = function() require 'extensions.mason' end,
-   requires = {
+   dependencies = {
      'williamboman/mason-lspconfig.nvim', 'neovim/nvim-lspconfig', 'hrsh7th/cmp-nvim-lsp',
    }
  }
```

### 🔹 run ➡️ build

置換❗以下略❗

```diff
{
  'nvim-telescope/telescope-fzf-native.nvim',
- run = 'make'
+ build = 'make'
},
```

### 🔹 after ℹ️ not needed

```admonish info title=""
not needed for most use-cases.
Use dependencies otherwise.

ほとんどのユースケースでは必要ありません。
そうでない場合は dependencies を使用してください。
```

もしかしたら必要ないかもしれませんが、
[telescope-all-recent.nvim](../neovim/plugin/telescope-all-recent.html#installation)にはこれに関して但し書きがあったので、
`dependencies`に入れた上で`after`を消しておくのが良い...かも❓

```diff
  {
    'prochri/telescope-all-recent.nvim',
    config = function() require('telescope-all-recent').setup {} end,
-   after = 'telescope.nvim',
    dependencies = {
+     'nvim-telescope/telescope.nvim',
      'kkharji/sqlite.lua',
    },
  }
```

それと、こっちはもっと聡明な書き方があるのかもしれませんが...。

```diff
+ {
+   'zbirenbaum/copilot.lua',
+   cmd = 'Takeoff',
+   config = function() require 'extensions.copilot' end,
+ },
  {
    'zbirenbaum/copilot-cmp',
-   after = { 'copilot.lua' }
+   cmd = 'Takeoff',
    config = function() require('copilot_cmp').setup() end,
  },
```

こうしておけば`after`を使わなくても`Takeoff`コマンドを契機に両方読み込まれます...よね❓

### 🪭 Remove Packer Command

`PackerLoad`コマンドは`packer.nvim`の機能なのでもう使えなくなっちゃいましたが、
前項の変更をしておけば、これは消すだけで大丈夫です😉

~~~admonish example title="extensions/copilot.lua"
```diff
  vim.api.nvim_create_user_command('Takeoff', function()
-   vim.cmd.PackerLoad 'copilot.lua'
    vim.notify 'Cleared for Takeoff!'
  end, {})
```
~~~

### 🥾 Remove the Hierarchy

`packer`では通用していた「多層構造になっている書き方」は通用しないみたいなので、同列に並べておきましょう。

```diff
  {
    'hrsh7th/nvim-cmp',
    config = function() require 'extensions.nvim-cmp' end,
    requires = {
      'hrsh7th/cmp-nvim-lsp', 'onsails/lspkind-nvim',
      'hrsh7th/cmp-cmdline', 'hrsh7th/cmp-path', 'hrsh7th/cmp-buffer',
-     {
-       'L3MON4D3/LuaSnip',
-       run = 'make install_jsregexp',
-       config = function() require 'extensions.luasnip' end,
-       requires = {
-         'saadparwaiz1/cmp_luasnip',
-         {'rafamadriz/friendly-snippets', opt = true },
-       }
-     },
-     {
-       'zbirenbaum/copilot-cmp',
-       after = { 'copilot.lua' },
-       config = function() require('copilot_cmp').setup() end,
-     }
    }
  }
+ {
+   'L3MON4D3/LuaSnip',
+   build = 'make install_jsregexp',
+   config = function() require 'extensions.luasnip' end,
+   dependencies = {
+     'saadparwaiz1/cmp_luasnip', 'rafamadriz/friendly-snippets',
+   }
+ },
+ {
+   'zbirenbaum/copilot-cmp',
+   after = { 'copilot.lua' },
+   config = function() require('copilot_cmp').setup() end,
+ },
```

```admonish note
`telescope`も同じように多層になってる気がする❗確認してみて❗
```

...というか、これは`packer`が器用すぎますよね〜。今さらなんですけど😅

### 🧙🏽‍♂️ paths (Friendly Snippets)

あと、`friendly-snippets.nvim`を管理下に置いている場合は、当然`path`も変わります。

追っかけましょう。

~~~admonish example title="extensions/luasnip.lua"
```diff
  require('luasnip.loaders.from_vscode').lazy_load {
    paths = {
-     vim.fn.stdpath 'data' .. '/site/pack/packer/start/friendly-snippets',
+     vim.fn.stdpath 'data' .. '/lazy/friendly-snippets',
      './snippets',
    },
  }
```
~~~

## 🌈 ColorScheme

```admonish example title="[🌈 Colorschemes](https://github.com/folke/lazy.nvim#-colorschemes)"
Colorscheme plugins can be configured with `lazy=true`.
The plugin will automagically load when doing `colorscheme foobar`.

Colorscheme プラグインは`lazy=true`で設定できます。
プラグインは`colorscheme foobar`を実行するときに自動的にロードされます。


> **NOTE:** since **start** plugins can possibly change existing highlight groups,
> it's important to make sure that your main **colorscheme** is loaded first.
> To ensure this you can use the `priority=1000` field. **_(see the examples)_**
>
> プラグインを**起動**すると、既存のハイライトグループが変更される可能性があります、
> メインの**colorscheme**が最初にロードされるようにすることが重要です。
> これを確実にするには、`priority=1000`フィールドを使用します。**_(例を参照してください)_**
```

仰せの通りに❗

~~~admonish example title="extensions/init.lua"
```lua
  {
    'rmehri01/onenord.nvim',
    lazy = true,
    priority = 1000,
    config = function() require 'extensions.onenord' end,
  },
```
~~~

```admonish note
なんでかはよく分かんないんだけど、
`onenord.nvim`を`dependencies`に入れてると、エラーになっちゃいます😨

外しときましょう❗
```

## 🚀 Usage

ここまでの間に、もう`lazy`が起動時に自発的にインストールを始めてくれていたかもしれないんですが、
これでようやく全てのプラグインが元通りに動くようになったはずです❗

![lazy-install](img/lazy-install.avif)

```admonish info title="[🚀 Usage](https://github.com/folke/lazy.nvim#-usage)"
Plugins are managed with the `:Lazy` command. Open the help with `<?>` to see all the key mappings.

プラグインは`:Lazy`コマンドで管理します。help を`<?>`で開くと、すべてのキーマッピングを見ることができます。

You can press `<CR>` on a plugin to show its details.
Most properties can be hovered with `<K>` to open links, help files, readmes, git commits and git issues.

プラグイン上で `<CR>` を押すとその詳細が表示されます。
ほとんどのプロパティは`<K>`でカーソルを合わせるとリンク、ヘルプファイル、readme、git commits、git issues を開くことができます。

Lazy can automatically check for updates in the background. This feature can be enabled with config.checker.enabled = true.
```

例えば、わたしは`packer.nvim`で`:PackerSync`を多用していたんですが、`lazy.nvim`の場合は

```vim
:Lazy sync
```

...ってして、同じ感じで使えてます😊

### 🛀🏽 statusline

これもなんか、組み込んでおくと楽しいかも😆

```admonish info title=""
**lazy.nvim** provides a statusline component that you can use to show the number of pending updates.

**lazy.nvim** は、保留中の更新の数を表示するために使用できるstatuslineコンポーネントを提供します。

Make sure to enable `config.checker.enabled = true` to make this work.

`config.checker.enabled=true`を有効にしてください。
```

~~~admonish example title="extensions/init.lua"
```lua
local opts = {
  checker = {
    enabled = true,
  },

  -- ...
}
```
~~~

で、`lualine.lua`に組み込みましょう。

もちろん、`statusline`でも`tabline`でも、`a`だろうと`x`だろうと好きな場所に入れちゃいましょう❗

~~~admonish example title="extensions/lualine.lua"
```lua
require("lualine").setup {
  sections = {
    lualine_x = {
      {
        require("lazy.status").updates,
        cond = require("lazy.status").has_updates,
        color = { fg = "#ff9e64" },
      },
    },
  },
}
```
~~~

```admonish note
わたしは`tabline`に入れてますが、その場合はこんな感じで出てきます😄

![lazy-checker](img/lazy-checker.avif)

このスクリーンショットではうっかり [nvim-notify](https://github.com/rcarriga/nvim-notify) を使ってるんですが、
改めて見たらこれ、なんかすっごい綺麗じゃない...❓

うっとりしちゃった😊 次回はこれやろうかな...。

...あれ❓なんか全然おわんねぇな🙄
```

```admonish fail title=""
Don't you know that inside

There's a love you can't hide

君は知らないの？

隠しきれない愛があること
```

## 🔒 Lockfile lazy-lock.json

`lockfile`は`git`などでバージョン管理を行っている場合や、
複数のマシンでプラグインのバージョンを完全に同じにしたい場合に重宝する機能です。

これは`lazy.nvim`が更新してくれるので、わたしたちが中身に触る必要はありません😉

```admonish info title="[🔒 Lockfile lazy-lock.json](https://github.com/folke/lazy.nvim#-lockfile-lazy-lockjson)"
After every **update**, the local lockfile is updated with the installed revisions.

It is recommended to have this file under version control.

**update**のたびに、ローカルの lockfile はインストールされたリビジョンで更新されます。

このファイルはバージョン管理下に置くことをお勧めします。
```

```admonish info title=""
If you use your Neovim config on multiple machines, using the lockfile,
you can ensure that the same version of every plugin is installed.

複数のマシンで Neovim の設定を使用する場合、lockfile を使用することで、
すべてのプラグインが同じバージョンでインストールされるようになります。
```

```admonish info title=""
If you are on another machine, you can do `:Lazy restore`,
to update all your plugins to the version from the lockfile.

別のマシンにいる場合は、`:Lazy restore`を実行することで、
すべてのプラグインを lockfile のバージョンに更新することができます。
```

これは`nvim`ディレクトリに置かれるみたいですね🤔

![lazy-lock](img/lazy-lock.avif)

## ⚡ Performance

だいぶ長くなってしまいました...😅

最後にこれだけ試して終わりましょう。

```admonish info title="[⚡ Performance](https://github.com/folke/lazy.nvim#-performance)"
Great care has been taken to make the startup code (`lazy.core`) as efficient as possible.
During startup, all Lua files used before `VimEnter` or `BufReadPre` are byte-compiled and cached,
similar to what [impatient.nvim](https://github.com/lewis6991/impatient.nvim) does.

起動コード(`lazy.core`)を可能な限り効率的にするために細心の注意が払われています。
起動中、`VimEnter`や`BufReadPre`の前に使用される全ての Lua ファイルはバイトコンパイルされ、
[impatient.nvim](https://github.com/lewis6991/impatient.nvim) と同様にキャッシュされます。

My config for example loads in about `11ms` with `93` plugins. I do a lot of lazy-loading though :)

例えば私の設定は約`11ms`で`93`のプラグインがロードされます。私は遅延ロードを多用していますが😃
```

```admonish info title=""
**lazy.nvim** comes with an advanced profiler `:Lazy profile` to help you improve performance.
The profiling view shows you why and how long it took to load your plugins.

**lazy.nvim** には高度なプロファイラ`:Lazy profile`がついていて、パフォーマンスを向上させるのに役立ちます。
プロファイリングビューはプラグインのロードにかかった時間とその理由を表示します。
```

![lazy-profile](img/lazy-profile.avif)

~~~admonish quote
```vim
:Lazy profile
```
~~~

例えばわたしの設定は約`94ms`で`33`のプラグインがロードされます。

...。🙂

いえ❗お引越し直後なんて大抵散らかってるもんですから⁉️

なんかもう伸びしろと可能性しかないでしょう🤣

```admonish note
でも、このままでも`packer`より起動がワンテンポ早くなった気がしません❓...しますね⁉️

するする❗ぜったいするわ❗❗
```

あとはここから一個一個、丁寧にチューニングしていけばもっと早くなるはずです❗

...ってことで、あとは任せたよ😆

```admonish fail title=""
So why do you fight that feeling in your heart?

それなのに、なぜハートの中でその気持ちと戦うの？
```

## 💣 Lazy Dynamite

```admonish fail title=""
Oh, lazy dynamite
{{footnote: Lazy Dynamite(by [Paul McCartney and Wings](https://en.wikipedia.org/wiki/Paul_McCartney_and_Wings))
The Beatles 解散後の Paul McCartney が、妻 Linda や Denny Laine らと共に結成したバンド、Wings の2作目のアルバムは
Hold Me Tight、Lazy Dynamite、Hands of Love、Power Cut の11分のメドレーで終わる。
The Beatles が Abbey Road のB面でとった、未完成の短い楽曲をつなげてメドレー形式にする手法を McCartney は1970年代以降も好んで使った。
[Wikipedia](https://en.wikipedia.org/wiki/Red_Rose_Speedway)より
}}

ああ、怠惰なダイナマイト
```

`lazy`はとってもダイナマイトでしたね...😵‍💫

もう達成感がハンパないです😽

ちゃんと乗り越えたんだもの。えらいぞ❗

```admonish success
ほらね、ちゃんと実るんだよ🤗
```
