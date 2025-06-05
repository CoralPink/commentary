# nvim-treesitter

今回は `nvim-treesitter`を使ってみましょう😆

これさえ使いこなせれば、様々な言語のプログラムコードだったり、
時には`markdown`の編集など、様々な場面で役立ってくれるはずです❗

```admonish info title="[nvim-treesitter](https://github.com/nvim-treesitter/nvim-treesitter/tree/main)"
The `nvim-treesitter` plugin provides

`nvim-treesitter`プラグインは以下を提供します。

1. functions for installing, updating, and removing [**tree-sitter parsers**](https://github.com/nvim-treesitter/nvim-treesitter/blob/main/SUPPORTED_LANGUAGES.md);
2. a collection of **queries** for enabling tree-sitter features built into Neovim for these languages;
3. a staging ground for [treesitter-based features](https://github.com/nvim-treesitter/nvim-treesitter/tree/main) considered for upstreaming to Neovim.

For details on these and how to help improving them, see [CONTRIBUTING.md](https://github.com/nvim-treesitter/nvim-treesitter/blob/main/CONTRIBUTING.md).

1. [**tree-sitter parsers**](SUPPORTED_LANGUAGES.md) のインストール、更新、削除機能;
2. Neovim に組み込まれた tree-sitter 機能をこれらの言語で有効にするための **クエリ** 集。
3. Neovim へのアップストリームが検討されている [treesitter-based features](https://github.com/nvim-treesitter/nvim-treesitter/tree/main)のステージング・グラウンド。

これらの詳細と改良の支援方法については、[CONTRIBUTING.md](https://github.com/nvim-treesitter/nvim-treesitter/blob/main/CONTRIBUTING.md)を参照してください。
```

```admonish danger title="CAUTION"
This is a full, incompatible, rewrite.
If you can't or don't want to update, check out the
[`master` branch](https://github.com/nvim-treesitter/nvim-treesitter/blob/master/README.md)
(which is locked but will remain available for backward compatibility).

これは互換性のない完全な書き換えです。
アップデートができない、またはしたくない場合は、masterブランチをチェックしてください
(ロックされていますが、後方互換性のために引き続き利用可能です)。
```

このページの初掲は **Dec 4, 2022** ですが、
巡り巡って **Jun 5, 2025** 時点の状況に合わせて内容を書き換えています。

ところどころ、スクリーンショットが古いままになってたりはしますが、気にしないでください❗

## Requirements

一個ずつ確認していきましょう。

```admonish info title="[Requirements](https://github.com/nvim-treesitter/nvim-treesitter#requirements)"
- Neovim 0.11.0 or later (nightly)
- `tar` and `curl` in your path
- [`tree-sitter`](https://github.com/tree-sitter/tree-sitter) CLI (0.25.0 or later)
- a C compiler in your path (see <https://docs.rs/cc/latest/cc/#compile-time-requirements>)
- `Node` (23.0.0 or later) for some parsers (see the [list of supported languages](https://github.com/nvim-treesitter/nvim-treesitter/blob/main/SUPPORTED_LANGUAGES.md))
```

```admonish abstract title="IMPORTANT"
The **support policy** for Neovim is

1. the _latest_ [stable release](https://github.com/neovim/neovim/releases/tag/stable);
2. the _latest_ [nightly prerelease](https://github.com/neovim/neovim/releases/tag/nightly).

Other versions may work but are neither tested nor considered for fixes.
In general, compatibility with Nvim 0.X is removed after the release of Nvim 0.(X+1).1.

他のバージョンでも動作する可能性はありますが、テストも修正も考慮されていません。
一般的に、Nvim 0.X との互換性は Nvim 0.(X+1).1 のリリース後に削除されます。
```

### Neovim 0.11.0 or later (nightly)

まずは`Neovim 0.11.0` 以降が必須とされていることに注意が必要です。

```admonish warning
これも既に示されていることですが、
Neovim 0.10.X 以下の使用を続ける理由がある場合は`master`ブランチを使用しましょう。(更新自体は止まってます❗)
```

### tar,curl

自分の環境で`tar`,`curl`を使用できるかを確認するには`which`コマンドを使ってみると良いです 😉

```sh
which tar
```

```sh
which curl
```

なんかそれっぽいパスが表示されていれば、きっと OK でしょう😆

私の環境で言えば、`tar` は最初から入っていたし、
`curl` は `brew install` で簡単にインストールできました。

![which-tar-curl](img/which-tar-curl.webp)

### tree-sitter CLI (0.25.0 or later)

これも`which`コマンドで確認できます。

```sh
which tree-sitter
```

`Homebrew`でインストールしている場合は `Required`として、一緒にインストールされているはずです。

![which-tar-curl](img/which-tree-sitter.webp)

### C compiler

わたしの経験で言えば`macOS`では問題になったことがありません。最低限`Command Line Tools`が入っていれば大丈夫なはずです。
(例えば`Homebrew`のインストール時に自動で導入されます。)

`Windows`の場合はやっぱり[別途案内](https://github.com/nvim-treesitter/nvim-treesitter/wiki/Windows-support)
がされているので、そちらを参照頂ければ...。

`Linux`の場合、もしかしたら別途インストールが必要かもしれないので手っ取り早く解決方法だけ載っけちゃうんですが、
`gcc-c++`、もしくは`clang`をインストールするのが良さそうです。

|||
|:---:|:---:|
|**gcc-c++**|![gcc_cpp](img/gcc-cpp.webp)|
|**clang**|![gcc_cpp](img/clang.webp)|

```admonish note
Readmeにも明記されているように`libstdc++`も必要になるはずなので、`gcc`だとうまくいきませんでした😮
```

### Node (23.0.0 or later) for some parsers

書いてあることそのままですが、"一部の" パーサーでは `Node v23` 以降を必要とします。

2025/06/05 時点では `LTS`バージョンが v22.16.0 らしいので、
場合に依っては なんか妙にハードルが高く感じられるかもしれません。

例えば[Node.js®をダウンロードする](https://nodejs.org/ja/download/)
に最初に示されている通りに進んでしまうとうまく行かない (かもしれない) ...😰

`current`バージョンは `v24` まで進んでいるので、単純に「`brew`や`apt` を使った方が簡単だぞ❗」というのは簡単なんだけど...、
はっきり言って、私はここで責任を負わされたくありません 😤

「**もし必要になったら** 乗り越えて❗」ぐらいで見逃してください...🥹

```admonish note
よくわかんねー ってなっちゃう場合、ここはスキップして進みましょう 🐈
```

## Install

前項の確認さえ済めば、あとは`packer`にお願いするだけで「あっ❗」と言う間に終わります😆

`extensions/init.lua`に以下を追記しましょう。

~~~admonish example title="extensions/init.lua"
```lua
require('packer').startup { function()
  use 'wbthomason/packer.nvim'

  -- 前節で入れたpackerと同列に並べる
  use {
    'nvim-treesitter/nvim-treesitter',
    branch = 'main',
    run = ':TSUpdate',
  }

end,

-- (以下略)

```
~~~

~~~admonish warning
もし Neovim 0.11.0 より古いバージョンで使用するのであれば、branch を'master' に変えておいてね❗

```diff
-    branch = 'main',
+    branch = 'master',
```
~~~

そしたら `:PackerSync` を実行しましょう❗

![installed](img/installed.webp)

簡単ですね😉 **すっごい古いスクリーンショットだから** 見にくいけど❗

```admonish note
オフィシャルに示されているのは[lazy.nvim](https://github.com/folke/lazy.nvim)を使用した設定方法なのですが、
このサイトでは[17章](../../outro/lazy.html)までは`packer`を使用したサンプルコードを示しています。

(これも書き直した方がいいとは思ってるんだけど...😅)
```

## Config

`Neovim`プラグインの場合、`Readme`である程度デフォルト設定が示されていて、
それを基に「変える？変えない？」を決めるみたいな、
割とアバウトな方法にどうしてもなってくる...んじゃないかなぁと思ってるんですがどうでしょう❓

今回はもうデフォルト設定のままでいくので、何もする必要がありません❗

```txt
setup({opts})                                          *nvim-treesitter.setup()*

    Configure installation options. Needs to be specified before any
    installation operation.

    インストールオプションの設定。
    インストール操作の前に指定する必要があります。

    Note: You only need to call `setup` if you want to set non-default
    options!

    注意: `setup` を呼び出す必要があるのは、デフォルト以外のオプションを設定する場合だけです！

    Parameters: ~
    • {opts}  `(table?)` Optional parameters:
              • {install_dir} (`string?`, default `stdpath('data')/site/`)
                directory to install parsers and queries to. Note: will be
                prepended to |runtimepath|.
```

再起動もしくは`:so`でこの状態を反映させてから`PackerSync`もしくは`PackerCompile`を実行しましょう。

すると、`nvim-treesitter`が動いて、最終的にこんなのが出てきました。

![lua-installed](img/lua-installed.webp)

これで、`lua`ファイルが今までよりも賢く色付けされてるはずです。どうでしょう❓

```admonish warning
もしここでエラーが起きるようであれば、もう一度`C compiler`を確認してみてください😣
```

|||
|:---:|:---:|
|**default**|![color1](img/color1.webp)|
|**nvim-treesitter**|![color2](img/color2.webp)|

```admonish note
これだと例が **すっごい古い** し面白くないんですが、オフィシャルイメージを見るとこんなに変わってます❗

[nvim-treesitter/wiki/Gallery](https://github.com/nvim-treesitter/nvim-treesitter/wiki/Gallery)

...あっちでも`lua`は変化がわかりにいんですけどね😅
```

## Commands

まず前提として、以下があります。

~~~admonish info title=":h treesitter-parsers"
```
PARSER FILES                                              *treesitter-parsers*

Parsers are the heart of treesitter. They are libraries that treesitter will
search for in the `parser` runtime directory.

Nvim includes these parsers:

パーサはtreesitterの心臓部です。これらは treesitter が `parser` ランタイムディレクトリで検索するライブラリです。
Nvimはこれらのパーサーを含んでいます：

- C
- Lua
- Markdown
- Vimscript
- Vimdoc
- Treesitter query files |ft-query-plugin|

You can install more parsers manually, or with a plugin like
https://github.com/nvim-treesitter/nvim-treesitter .

手動でさらにパーサーをインストールすることもでき、
https://github.com/nvim-treesitter/nvim-treesitter のようなプラグインを使うこともできます。
```
~~~

で、手動でパーサーをインストールするために使うコマンドが以下に示されています。

~~~admonish info title=":h nvim-treesitter-commands"
```txt
COMMANDS                                              *nvim-treesitter-commands*
```
~~~

これらのコマンドを使って好きなパーサーを管理できるわけですね 😉

次項から、さらっとした使い方だけ示します。

### TSInstall

~~~admonish info title=":h TSInstall"
```txt
:TSInstall {language}                                               *:TSInstall*

Install one or more treesitter parsers. {language} can be one or multiple
parsers or tiers (`stable`, `unstable`, or `all` (not recommended)). This is a
no-op of the parser(s) are already installed. Installation is performed
asynchronously. Use *:TSInstall!* to force installation even if a parser is
already installed.

1つ以上の treeitter パーサーをインストールします。
{language} には1つまたは複数のパーサーまたは階層 (`stable`、`unstable`、`all`(推奨しない)) を指定できます。
パーサがすでにインストールされている場合は、このオプションは無効です。
インストールは非同期に実行されます。
パーサーが既にインストールされている場合でも、強制的にインストールするには *:TSInstall!* を使用します。
```
~~~

`language` の部分は
[https://github.com/nvim-treesitter/nvim-treesitter/blob/main/SUPPORTED_LANGUAGES.md](https://github.com/nvim-treesitter/nvim-treesitter/blob/main/SUPPORTED_LANGUAGES.md)
に示されているものから選んで指定します。

例えば `rust`パーサーをインストールしたいなー😆 ってなったら以下のコマンドを使用します。

```vim
:TSInstall rust
```

### TSInstallFromGrammar

~~~admonish info title=":h TSInstallFromGrammar"
```txt
:TSInstallFromGrammar {language}                         *:TSInstallFromGrammar*

Like |:TSInstall| but also regenerates the `parser.c` from the original
grammar. Useful for languages where the provided `parser.c` is outdated (e.g.,
uses a no longer supported ABI).

|:TSInstall| と似ているが、`parser.c` を元の文法から再生成する。
提供された `parser.c` が古くなっている言語 (例えば、サポートされなくなった ABI を使用している場合など) に便利です。
```
~~~

あまり使う機会はないと思いますが、使い方は同じですね。

```vim
:TSInstallFromGrammar rust
```

### TSUpdate

~~~admonish info title=":h TSUpdate"
```txt
:TSUpdate [{language}]                                              *:TSUpdate*

Update parsers to the `revision` specified in the manifest if this is newer
than the installed version. If {language} is specified, update the
corresponding parser or tier; otherwise update all installed parsers. This is
a no-op if all (specified) parsers are up to date.

Note: It is recommended to add this command as a build step in your plugin
manager.

マニフェストで指定された `revision` がインストールされているバージョンより新しい場合、パーサを更新します。
{language} が指定されている場合は、対応するパーサまたは階層を更新します。
そうでない場合は、インストールされているすべてのパーサを更新します。
指定された全てのパーサが最新である場合、これは省略されます。

Note: このコマンドをプラグインマネージャのビルドステップとして追加することを推奨します。
```
~~~

インストールされているパーサをアップデートしたいならこれ❗

```vim
:TSUpdate
```

### TSUninstall

~~~admonish info title=":h TSUninstall"
```txt
:TSUninstall {language}                                           *:TSUninstall*

Deletes the parser for one or more {language}, or all parsers with `all`.

1つ以上の {language} のパーサを削除するか、`all` で全てのパーサを削除します。
```
~~~

インストールされているパーサを削除したいならこれ❗

```vim
:TSUninstall rust
```

### TSLog

~~~admonish info title=":h TSLog"
```txt
:TSLog                                                                  *:TSLog*

Shows all messages from previous install, update, or uninstall operations.

以前のインストール、アップデート、アンインストール操作のすべてのメッセージを表示します。
```
~~~

`nvim-treesitter`で行った操作のログを確認したいならこれ❗

```vim
:TSLog
```

## CheckHealth

これは`nvim-treesitter`に限らない`Neovim`の機能になりますが、`health`チェックというものがあります😉

~~~admonish info title=":h health"
```txt
health.vim is a minimal framework to help users troubleshoot configuration and
any other environment conditions that a plugin might care about.

health.vim は、プラグイン設定やその他の環境条件の
トラブルシューティングを支援するための最小限のフレームワークである。

Plugin authors are encouraged to write new healthchecks. |health-dev|

プラグインの作者は新しいヘルスチェックを書くことが推奨されている。
```
~~~

コマンドは`:h health-commands`にある通りです。試しに動かしてみましょう。

```vim
:che
```
 または

```vim
:checkhealth
```

![checkhealth](img/checkhealth.webp)

結果が表示されましたね☺️

これは **すっごい古いスクリーンショット** だけど❗

診断内容はプラグインに依りますが、
`nvim-treesitter`の場合は、依存ソフトウェアの確認と、OS情報・インストールされたパーサの表示を行ってくれます。

~~~admonish note
これもヘルプそのままですが、指定したプラグインだけを診断することも可能です。

```vim
:che nvim-treesitter
```

とすると、`nvim-treesitter`のヘルスチェックのみを行えます。
~~~

```admonish tip
冒頭の説明では`環境条件`と表されていますが、`packer`の節で少し触れた`依存関係`と (大体は) 同じ意味でしょう。
プラグインによっては、今回のようにヘルスチェックを提供してくれているので、困った時はこれも参考にすると良いです😉
```

## Wrap Up

というわけで `nvim-treesitter `でした。

さて、ここまで来たら次にやることはもう決まってますね😉 カラーテーマです❗

```admonish success
次回でついに瞳に優しく、そう❗生まれ変わるのです😆
```
