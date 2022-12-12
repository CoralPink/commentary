# nvim-treesitter

```admonish info title="[nvim-treesitter](https://github.com/nvim-treesitter/nvim-treesitter)"
The goal of nvim-treesitter is both to provide a simple and easy way to use the
interface for tree-sitter in Neovim and to provide some basic functionality such as
highlighting based on it:

nvim-treesitter の目的は、Neovim で tree-sitter のインターフェースをシンプルかつ簡単に使う方法を提供することと、
それを元にハイライトなどの基本的な機能を提供することの両方です。
```

```admonish abstract title="[Requirements](https://github.com/nvim-treesitter/nvim-treesitter#requirements)"
Neovim 0.8.0 or later built with tree-sitter 0.20.3+ (latest nightly recommended)

tar and curl in your path (or alternatively git)

A C compiler in your path and libstdc++ installed [(Windows users please read this!)](https://github.com/nvim-treesitter/nvim-treesitter/wiki/Windows-support).
```

## Requirements

ここは一個ずつ確認していきます。

### Neovim 0.8.0 or later

まずは`Neovim 0.8.0` 以降が必須とされていることに注意が必要です。

2022-11-30 時点で、`stable release`はもう一つ進んで`0.8.1`となっていますが、念の為確かめておきましょう。

### git (tar,curl)

これは`packer.nvim`を導入する前に、既に`git`をインストールしているはずなので大丈夫😉

気になる場合は`tar`と`curl`も確認しておきましょう。

### C compiler

わたしの経験で言えば`macOS`では問題になったことがありません。最低限`Command Line Tools`が入っていれば大丈夫なはずです。
(例えば`Homebrew`のインストール時に自動で導入されます。)

`Windows`の場合はやっぱり[別途案内](https://github.com/nvim-treesitter/nvim-treesitter/wiki/Windows-support)
がされているので、そちらを参照頂ければ...。

`Linux`の場合、もしかしたら別途インストールが必要かもしれないので手っ取り早く解決方法だけ載っけちゃうんですが、
`gcc-c++`、もしくは`clang`をインストールするのが良さそうです。

|gcc-c++|clang|
|:---:|:---:|
|![gcc_cpp](img/gcc-cpp.webp)|![gcc_cpp](img/clang.webp)|

```admonish note
Readmeにも明記されているように`libstd++`も必要になるはずなので、`gcc`だとうまくいきませんでした😮
```

## Install

前項の確認さえ済めば、あとは`packer`にお願いするだけで「あっ❗」と言う間に終わります😆

`extensions/init.lua`に以下を追記しましょう。

~~~admonish example title="extensions/init.lua"
```lua
require('packer').startup { function()
  use 'wbthomason/packer.nvim'

  -- 前節で入れたpackerと同列に並べる
  use 'nvim-treesitter/nvim-treesitter'
end,
-- (以下略)
```
~~~

で、`:PackerSync`を実行しましょう❗

![installed](img/installed.webp)

簡単ですね😉 すっごい見にくいけど❗

~~~admonish note
`nvim-treesitter`の説明では、`:TSUpdate`を併せて行うように説明されているのですが、これはあくまで`vim-plug`を使用している場合の例です。

`packer.nvim`では`run`オプションで同じことができそうなんですが、これを使用すると初回だけエラーが起きてしまうので、わたしは外しています。

![ErrorTSUpdate](img/error-tsupdate.webp)

インストール自体は`100%`で`done.`ってなってるし、2回目以降は何事もなかったかのように`:TSUpdate`まで完走できるんですけどね。すっごい見にくいけど❗

初回だけ外すか、もしくは気にしないかするのであれば超便利です。

```lua
  use {
    'nvim-treesitter/nvim-treesitter',
    run = ':TSUpdate',
  }
```
~~~

## Config

インストールが終わったら、次にやることはコンフィグですね😆

`Neovim`プラグインの場合、`Readme`である程度デフォルト設定が示されていて、
それを基に「変える？変えない？」を決めるみたいな、割とアバウトな方法にどうしてもなってくる...んじゃないかなぁと思ってるんですがどうでしょう❓
(違ってたらごめんなさい😅)

とりあえずは新しくファイルを作っていきます。

これもやっぱり名前は何でも良いんですが、パッケージ名と揃えて`nvim-treesitter.lua`としています☺️

~~~admonish example title="extensions/nvim-treesitter.lua"
```lua
require('nvim-treesitter.configs').setup {
  ensure_installed = { 'lua' },
  sync_install = true,
  auto_install = true,

  highlight = {
    enable = true,
  },

  incremental_selection = {
    enable = true,
    keymaps = {
      init_selection = 'gnn',
      node_incremental = 'grn',
      scope_incremental = 'grc',
      node_decremental = 'grm',
    },
  },

  indent = {
    enable = true,
  },
}
```
~~~

そして、これを`packer`の管理下に置いて使います。先ほど書いた`nvim-treesitter`の読み込み部分を少し書き換えます。

~~~admonish example title="extensions/init.lua"
```lua
require('packer').startup { function()
  use 'wbthomason/packer.nvim'

  -- こんな感じで。
  use {
    'nvim-treesitter/nvim-treesitter',
    config = function() require 'extensions.nvim-treesitter' end,
  }
end,
-- (以下略)
```
~~~

~~~admonish info title=":h packer.use()"
```
config = string or function, -- Specifies code to run after this plugin is loaded.
                                このプラグインがロードされた後に実行するコードを指定します。
```
~~~

再起動もしくは`:so`でこの状態を反映させてから`PackerSync`もしくは`PackerCompile`を実行しましょう。

すると、`nvim-treesitter`が動いて、最終的にこんなのが出てきました。

![lua-installed](img/lua-installed.webp)

これで、`lua`ファイルが今までよりも賢く色付けされてるはずです。どうでしょう❓

```admonish note
`ensure_installed`で指定した言語パーサのインストールが行われるはずなので、それによっては少し表示が変わります。
```

```admonish warning
もしここでエラーが起きるようであれば、もう一度`C compiler`を確認してみてください😣
```

|default|nvim-treesitter|
|:---:|:---:|
|![color1](img/color1.webp)|![color2](img/color2.webp)|

```admonish note
これは例が面白くないのであれなんですが、オフィシャルイメージを見るとこんなに変わってます❗

[nvim-treesitter/wiki/Gallery](https://github.com/nvim-treesitter/nvim-treesitter/wiki/Gallery)

...あっちでも`lua`は変化がわかりにいんですけどね😅
```

## Commands

`nvim-treesitter`を入れることで使えるコマンドについては、ヘルプだけ示します。

~~~admonish info title=":h nvim-treesitter-commands"
```
COMMANDS
```
~~~

ちなみに、わたしはほぼ`:TSUpdate`しか使ってません❗ sitter って言うぐらいなので、特に操作しなくてもしっかりお世話してくれます👶


## Modules

上の例で使用しているモジュール設定について少しだけ触れておきます。

~~~admonish info title="[Modules](https://github.com/nvim-treesitter/nvim-treesitter#modules)"
```
By default, everything is disabled.

デフォルトでは、すべて無効になっています。
```
~~~

### ensure_installed
```
A list of parser names, or "all"

パーサ名のリスト、または "all"を指定する。
```

上の例では`lua`だけ入れてます。使用頻度の高い言語を入れておくと良いです。

面倒なら`all`でも良いんですが、`auto_install`があるので、"オフライン環境で動かす"とかでなければ、そちらを活用する方が良いんじゃないかなーって思ってます。

対応言語は以下の通りです。

```admonish info title="[Supported languages](https://github.com/nvim-treesitter/nvim-treesitter#supported-languages)"
List of languages for which a parser can be installed through :TSInstall

`:TSInstall`でパーサをインストールできる言語のリストです。
```

### sync_install
```
Install parsers synchronously. (only applied to `ensure_installed`)

パーサを同期的にインストールする。 (`ensure_installed` にのみ適用される)
```

「同期的インストール」...、つまりアップデートですね😉

```admonish note
`ensure_installed`に入れていないパーサについては、コマンドから`:TSUpdate`で行うことができます。
```

### auto_install
```
Automatically install missing parsers when entering buffer.

バッファに入ったときに足りないパーサを自動的にインストールします。
```

```admonish note
手動でインストールしたい場合はコマンドから`:TSInstall {言語}`を行いましょう。
```

### highlight
```
`false` will disable the whole extension

false` を指定すると、拡張機能全体を無効にすることができます。
```

と、いうことなので、

```lua
highlight = {
  enable = false
}
```
...なんてしちゃえば拡張機能全体を無効にします。いや、せっかく入れたので`true`にしましょ❓

ちなみに`disable`オプションを使うと、特定の言語だけ選んで除外できます。

```lua
highlight = {
  enable = true,
  disable = { "c", "rust" },
},
```

### incremental_selection

これについては、適当にコードを開いて`keymap`に設定した操作をしてみればなんとな〜く察せると思います。

ざっくり言うと、以下の説明にある範囲選択が一回で出来ます。

~~~admonish info title=":h nvim-treesitter-incremental-selection-mod"
Incremental selection based on the named nodes from the grammar.

文法からの名前付きノードに基づくインクリメンタルな選択。

```
- keymaps:
  - init_selection: in normal mode, start incremental selection.
                    ノーマルモードで、インクリメンタルな選択を開始します。

  - node_incremental: in visual mode, increment to the upper named parent.
                    ビジュアルモードで、上の名前の親にインクリメントします。

  - scope_incremental: in visual mode, increment to the upper scope (as defined in `locals.scm`).
                    ビジュアルモードで、上のスコープにインクリメントされます。
                    (`locals.scm` で定義されている) 上位のスコープにインクリメントします。

  - node_decremental: in visual mode, decrement to the previous named node.
                    ビジュアルモードで、前の名前のノードまでデクリメントします。
```
~~~

### indent

実験的な機能らしいですが、インデントが賢くなる...んです⁉️ あんまり威力を実感することはないんですが、わたしはなんとなく使ってます😅

これも`highlight`と同じく、言語を選んで除外できます。

~~~admonish info title=":h nvim-treesitter-indntation-mod"
```
Indentation based on treesitter for the |=| operator.

|=| 演算子の treesitter に基づくインデント。

NOTE: this is an experimental feature.
      これは実験的な機能です。

Query files: `indents.scm`.
Supported options:
- enable: `true` or `false`.
- disable: list of languages.
```
~~~

## CheckHealth

これは`nvim-treesitter`に限らない`Neovim`の機能になりますが、`health`チェックというものがあります😉

~~~admonish info title=":h health"
```
health.vim is a minimal framework to help users troubleshoot configuration and
any other environment conditions that a plugin might care about. 

health.vim は、プラグイン設定やその他の環境条件の
トラブルシューティングを支援するための最小限のフレームワークである。

Plugin authors are encouraged to write new healthchecks. |health-dev|

プラグインの作者は新しいヘルスチェックを書くことが推奨されている。
```
~~~

コマンドは`:h health-commands`にある通りです。試しに動かしてみましょう。

```
:che
```
 または

```
:checkhealth
```

![checkhealth](img/checkhealth.webp)

結果が表示されましたね☺️

診断内容はプラグインに依りますが、`nvim-treesitter`の場合は、依存ソフトウェアの確認と、OS情報・インストールされたパーサの表示を行ってくれます。

~~~admonish note
これもヘルプそのままですが、指定したプラグインだけを診断することも可能です。
```
:che nvim-treesitter
```

とすると、`nvim-treesitter`のヘルスチェックのみを行えます。
~~~

```admonish tip
冒頭の説明では`環境条件`と表されていますが、`packer`の節で少し触れた`依存関係`と (大体は) 同じ意味でしょう。
プラグインによっては、今回のようにヘルスチェックを提供してくれているので、困った時はこれも参考にすると良いです😉
```

## まとめ

```admonish success
さて、ここまで来たら次にやることはもう決まってますね😉 カラーテーマです❗

次回でついに瞳に優しく、そう❗生まれ変わるのです😆
```
