# Config file
すっかりいつも通りですが、まずは設定ファイルを置くところから始めましょう。

```admonish info title="[Load user config](https://neovim.io/doc/user/starting.html#config)"
A file containing initialization commands is generically called a "vimrc" or config file.
It can be either Vimscript ("init.vim") or Lua ("init.lua"), but not both. 

初期化コマンドを含むファイルは一般に "vimrc" または config ファイルと呼ばれます。
Vimscript ("init.vim")またはLua ("init.lua")のどちらかになりますが、両方は使えません。
```

なんということでしょう❗`Vimscript`または`Lua`のどちらかを選ばなければなりません😩

...なんつって。白々しかったですよね〜😉

このサイトでは、`WezTerm`でも散々扱ってきた`Lua`を選択します。
(というか、わたしは`VimScript`扱えません。)

わたし自身は `Neovim` → `WezTerm` という順番で`Lua`に触れてきましたが、難易度的には`Neovim`の方が高いと思ってます。

うん、このまま登っていきましょう。

```admonish note
`Neovim`は`Vimscript`を扱えますが、後継の`Vim9 script`はサポートしないことが表明されているようです。

もしこれを扱いたい場合は [Vim](https://www.vim.org) を使う必要があります。

詳しく調べたわけではありませんが、これから始めるなら`Neovim + Lua`か`Vim + Vim9 script`の2択じゃないでしょうか？
```

```admonish warning
あと、これは結構強調しておきたいんですが、

「`Vimscript`ではああでしたが、`lua`ではこうでして❗」みたいな "移行" を目的とした書き方はできません。
```

## init.lua
なんだか前置きが長くなりました...。

冒頭のドキュメントで設定ファイルは以下の場所だよ😄と示されています。(`macOS`は`Unix`と同じ場所です。)

|OS|configファイル|
|:---|:---|
|Unix|~/.config/nvim/init.vim	(or init.lua)|
|Windows|~/AppData/Local/nvim/init.vim	(or init.lua)|
|$XDG_CONFIG_HOME|$XDG_CONFIG_HOME/nvim/init.vim (or init.lua)|

```admonish note
`$XDG_CONFIG_HOME`はちょっと影響範囲が広いので、このサイトでは扱いません。
```

では作っていきましょう😄
`Windows`の場合は`~/AppData/Local/nvim`に読み替えてください。

~~~admonish quote title="ディレクトリを作る"
```sh
mkdir -p ~/.config/nvim
```
~~~

~~~admonish quote title="init.luaを作る"
```sh
# 先にディレクトリを移動しておく
cd ~/.config/nvim

nvim init.lua
```
~~~

```admonish success
しれっと`nvim`を起動してますが大丈夫ですよね。中身はまたこれから作っていきます😉
```
