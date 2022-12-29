# packer.nvim

では早速ですが、まずはプラグイン/パッケージマネージャーからいきます。

マネージャーだったりお作法だったりは色々あるんですが、わたしは`packer.nvim`を愛用しています😆

```admonish info title="[packer.nvim](https://github.com/wbthomason/packer.nvim)"
use-package inspired plugin/package management for Neovim.

use-packageにインスパイアされたNeovimのプラグイン/パッケージマネージャー。
```

```admonish info title=""
Packer is built on native packages. You may wish to read :h packages before continuing

Packerはネイティブパッケージの上に構築されています。先に進む前に :h packages を読んでおくとよいでしょう。
```

```admonish abstract title="Requirements"
- You need to be running Neovim v0.5.0+; `packer` makes use of extmarks and other newly-added Neovim features.
- Your version of Neovim must be compiled with LuaJIT support; `packer` relies on this to detect whether you are running Windows or a Unix-like OS (for path separators)
- If you are on Windows 10, you need developer mode enabled in order to use local plugins (creating symbolic links requires admin privileges on Windows
  - credit to @TimUntersberger for this note)
```

`Neovim v0.5.0`以降と`LuaJIT`については、ここまで来て今更問題にはならないと思われますが、
`Windows 10`で動かす場合には別途操作が必要になるみたいです。(自信がないので触れられない...😰)

```admonish note
あと、(ここには書いてないけど) 当然のように`git`を使用するので、まだの人は前節へ。
```

例えば、同じように「パッケージマネージャー」と呼ばれる`Homebrew`や`apt`、`dnf`なんかだと、
`install あれ`と唱えるだけで、動作に必要な`依存関係`と照らし合わせて、不足しているソフトやライブラリまでも自動でインストールしてくれますが、
`Neovim`プラグインはそういった`依存関係`をデータとしては持ち合わせていないので、作者の説明を見て自分で把握しないといけないんですね。

なので、どのプラグインであっても`Requirements`は必ず確認するようにしてください。重要だぞ😉❤️

「とにかく動かしてみたいから、細かい話はあとだー❗」ってなっちゃうわたしが言うのも変ですが、まあ焦らず進めましょう☺️

## Download

それでは、ターミナルから手動で`git`を使い、`packer.nvim`を所定のディレクトリ(`packpath`のいずれか)に配置します。

~~~admonish note
`packpath`については、ちょっと自信ないんですが、

```
:echo &packpath
```

...と、することで確認できました。

![packpath](img/packpath.webp)
~~~

"Quickstart" にあるように、順を追ってやっていきましょう。

~~~admonish quote title="Git Clone"
Unix, Linux Installation

```sh
git clone --depth 1 https://github.com/wbthomason/packer.nvim ~/.local/share/nvim/site/pack/packer/start/packer.nvim
```

Windows Powershell Installation

```sh
git clone https://github.com/wbthomason/packer.nvim "$env:LOCALAPPDATA\nvim-data\site\pack\packer\start\packer.nvim"
```
~~~

わたしの環境では "/home/utm-user/.local/share/nvim/site" が`packpath`に含まれていたので、例示されているパスのままで進めていますが、
環境によってはこのパスが含まれていないかもしれません。

~~~admonish note
(仮想環境ではあるんですが)`Ubuntu Server for ARM`では`apt`からインストールできる`Neovim`のバージョンが異様に低かったので
`flatpak`を使ったら、「なにこれマルチバース❓」って言うぐらいマッドネスな`packpath`でした。もはや "panicpath" です🤣

...ただ、話がわかっていればこんなの適合させるぐらい簡単ですよね〜😉 `packpath`を確認の上で合わせてあげてください。

![flatpak](img/flatpak.webp)

```sh
# あくまで一例です。
git clone --depth 1 https://github.com/wbthomason/packer.nvim ~/.var/app/io.neovim.nvim/data/nvim/site/pack/packer/start/packer.nvim
```

っていうか、これだとそもそも設定ファイルの場所も違うんですね...。
~~~

## 設定ファイル

ここからはわたしのやり方を並べていくんですが、まずは設定ファイルを新しく作りましょう。

`lua`ディレクトリに新しく`extensions`ディレクトリを作成します。

~~~admonish quote title="extensionsディレクトリを作る"
```sh
mkdir extensions
```
~~~

```admonish note
ディレクトリ名はやっぱり何でも良くて、それこそ`plugin`とかしてもいいんですが、何ならこの後すぐにややこしくなるので`extensions`としました。
```

で、その中に`init.lua`を作っちゃいましょう。

~~~admonish example title="extensions/init.lua"
```lua
require('packer').startup(function()
  use 'wbthomason/packer.nvim'
end)
```
~~~

この時点でのディレクトリ構成はこんな感じですね。

![first-tree](img/first-tree.webp)

それじゃあ`nvim`直下の`init.lua`から呼び出してあげましょう。(今作ったやつではなく、前からいるやつです。)

`options`とか`keybinds`を呼び出しているところに並べてあげてください😄

~~~admonish example title="../init.lua"
```lua
require 'extensions'
```
~~~

## 起動

ここまでを行った状態で`nvim`を起動すると...❓何も起きませんね😮

ちなみに、今の状態で

~~~admonish quote title="runtimepathを確認"
```lua
:lua print(vim.inspect(vim.api.nvim_list_runtime_paths()))
```
~~~
ってやってみると、

![runtimepath](img/runtimepath.webp)

...なんか前より増えてますよね。...って❗しれっと`packer.nvim`いるし⁉️

~~~admonish info title=":h packages"
```
On startup after processing your |config|, Nvim scans all directories in

'packpath' for plugins in "pack/*/start/*", then loads the plugins.

Nvim は起動時に |config| を処理した後、'packpath' にある全てのディレクトリをスキャンして
"pack/*/start/*" にあるプラグインを探し、プラグインを読み込ませます。

To allow for calling into package functionality while parsing your |vimrc|,
|:colorscheme| and |autoload| will both automatically search under 'packpath'
as well in addition to 'runtimepath'.  See the documentation for each for
details.

|vimrc| を解析している間にパッケージの機能を呼び出せるように、
|:colorscheme| と |autoload| は自動的に 'runtimepath' だけでなく 'packpath' の下も検索する。
詳しくはそれぞれのドキュメントを参照のこと。
```
~~~

入ってるならじゃあ...ってことで、コマンドモードで<kbd>p</kbd><kbd>Tab</kbd>とぽちぽち入力してみましょう。すると...❓

![packer-cmd](img/packer-cmd.webp)

見た目はちょっと Poison☠️ ですが、何やら`Packer`を名乗るコマンドが候補に上がってきましたね❗確かにインストールできてそうな気配です😆

せっかくなので、`PackerCompile`を選んで実行してみましょう...❗

...。

何も起きませ...いや、ちょっと待って❗
なんだか`nvim/plugin`ディレクトリと、その中に`packer_compiled.lua`が生成されています😮

![packer-tree](img/packer-tree.webp)

このファイルは`packer.nvim`が管理してくれるので触らなくていい (というか、`触ってはいけない`) のですが、ちょっとだけ中を見てみましょう。

![packer-compiled](img/packer_compiled.webp)

わたしがそこまで意味を分かっているわけではないので、ふわっとだけ触れますが、

```lua
_G.packer_plugins = {
  ["packer.nvim"] = {
    loaded = true,
    path = "/home/utm-user/.local/share/nvim/site/pack/packer/start/packer.nvim",
    url = "https://github.com/wbthomason/packer.nvim"
  },
```

なんかこんなのがいますよね。

この`packer_plugins`の中に、`use {}`で指定したプラグインが`:PackerCompile`によって、どんどん追加されていきます。

そう❗要するに便利ってことです😆

## Command

`packer.nvim`はプラグインのアップデートなども含めてマネージメントしてくれます☺️

### PackerCompile
```
You must run this or `PackerSync` whenever you make changes to your plugin configuration regenerate compiled loader file

プラグインの設定を変更したときは、必ずこのコマンドか`PackerSync`を実行しなければなりません。
コンパイル済みのローダーファイルを再生成します。
```

### PackerClean
```
Remove any disabled or unused plugins
無効または未使用のプラグインを削除します。
```

### PackerInstall
```
Clean, then install missing plugins
無効になっているプラグインを削除し、インストールします。
```

### PackerUpdate
```
Clean, then update and install plugins
supports the `--preview` flag as an optional first argument to preview updates

クリーンアップの後、プラグインをアップデートしてインストールします。
アップデートをプレビューするためのオプションの第一引数として `--preview` フラグをサポートします。
```

### PackerSync
```
Perform `PackerUpdate` and then `PackerCompile`
supports the `--preview` flag as an optional first argument to preview updates

`PackerUpdate`と`PackerCompile`を実行します。
アップデートをプレビューするためのオプションの第一引数として `--preview` フラグをサポートします。
```

```admonish note
基本的には、何か変更があったら`:PackerSync`を使えば、インストール、アップデート、コンパイルまで全て行ってくれます😉
![packer_update](img/packer-sync.webp)
```

### PackerStatus
```
Show list of installed plugins
インストールされているプラグインのリストを表示します。
```

### PackerLoad
```
Loads opt plugin immediately
optプラグインをすぐにロードする
```

## Help 

`Neovim`プラグインの場合は、作者が書いてくれている`readme`を見れば、もうこれだけで済んでしまうことも多いんですが、
(大抵は)`Neovim`の`Help`にもプラグイン固有の説明が追加されます。

~~~admonish quote
```
:h packer.nvim
```
~~~

![packer-help](img/packer-help.webp)

## Floating Window

これは完全に見た目だけのお話なんですが、こんなのがあります。

```admonish info title="[Using a floating window](https://github.com/wbthomason/packer.nvim#using-a-floating-window)"
You can configure Packer to use a floating window for command outputs by passing a utility function to packer's config:

Packer の config にユーティリティ関数を渡すことで、コマンド出力にフローティングウィンドウを使用するように設定することができます。
```

少しコードを変えてしまうんですが、`extensions/init.lua`を以下のようにしてみましょう。

~~~admonish example title="extensions/init.lua"
```lua
require('packer').startup { function() -- '(' から '{' に変わってます
  use 'wbthomason/packer.nvim'
end,
config = {
  display = {
    open_fn = function()
      return require('packer.util').float { border = 'single' }
    end,
  }
}} -- 文法的に当たり前ではあるんですが、ここも ')' から '}' に変わってます
```
~~~

~~~admonish note
上の例はちょっと変則的なインデントになっちゃってますが、きっちりやるならこうです。お好みで😉

```lua
require('packer').startup {
  function()
    use 'wbthomason/packer.nvim'
  end,
  config = {
    display = {
      open_fn = function()
        return require('packer.util').float { border = 'single' }
      end,
    }
  }
}
```
~~~

![float-window1](img/float-window1.webp)

なんていうか...、やっぱ Poison☠️❓

この毒はカラーテーマを入れちゃえば自然と抜けるんで、
わたしとしては「少しの間だけ気にしないで...」と言ってしまいたいところではあるんですが、
「どうしても耐えられない〜❗」っていう場合は、一個飛ばして`15.3. onenord.nvim`を先にやってもらうと、すぐにいい感じになります。

![float-window2](img/float-window2.webp)

## Wrap up

`pakcer.nvim`には便利な機能や設定がまだまだあるのですが、
ここで説明だけしてもイメージが掴みにくいと思うので、使用する場面で、その都度注釈を入れていく形にしようと思ってます。

~~~admonish success
`packer.nvim`はこの後も出ずっぱりになるので、親しみを込めて今後は単に`packer`と呼びます🤗
~~~
