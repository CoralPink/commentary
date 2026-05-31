# 💤 lazy.nvim

```admonish success title=""
When I wake up early in the morning

Lift my head, I’m still yawning

朝早く目が覚めると

頭を上げても、あくびが止まらない
```

もう9月の下旬なんですが、気温が思っているほど下がりません...🥵

まあそれでも、8月に比べたら多少は涼しくなってきたので、ぐっすり眠れるようになってきました😴🙏

これなら`💤 lazy.nvim`へのお引越しも捗ります❗

```admonish info title="[💤 lazy.nvim](https://github.com/folke/lazy.nvim)"
lazy.nvim is a modern plugin manager for Neovim.

lazy.nvim は Neovim のモダンなプラグインマネージャーです。
```

始めてしまえば難しいことは何一つありません😉

ただ、それなりに物量はあるので、この節では`lazy.nvim`の **セットアップ** までを😌

そして次の節で、`packer.nvim`から`lazy.nvim`への **移行** という二本立てでお送りします😪

## ✨ Features

新しいベッドは、とっても大きくて気持ちよさそうです🤗

```admonish info title="[✨ Features](https://github.com/folke/lazy.nvim#-features)"
- 📦 Manage all your Neovim plugins with a powerful UI
- 🚀 Fast startup times thanks to automatic caching and bytecode compilation of Lua modules
- 💾 Partial clones instead of shallow clones
- 🔌 Automatic lazy-loading of Lua modules and lazy-loading on events, commands, filetypes, and key mappings
- ⏳ Automatically install missing plugins before starting up Neovim, allowing you to start using it right away
- 💪 Async execution for improved performance
- 🛠️ No need to manually compile plugins
- 🧪 Correct sequencing of dependencies
- 📁 Configurable in multiple files
- 📚 Generates helptags of the headings in `README.md` files for plugins that don't have vimdocs
- 💻 Dev options and patterns for using local plugins
- 📊 Profiling tools to optimize performance
- 🔒 Lockfile `lazy-lock.json` to keep track of installed plugins
- 🔎 Automatically check for updates
- 📋 Commit, branch, tag, version, and full [Semver](https://devhints.io/semver) support
- 📈 Statusline component to see the number of pending updates
- 🎨 Automatically lazy-loads colorschemes
```

```admonish note title=""
- 📦 強力なUIですべてのNeovimプラグインを管理
- 🚀 Luaモジュールの自動キャッシュとバイトコードコンパイルによる高速起動
- 💾 浅いクローンではなく部分的なクローン
- 🔌 Lua モジュールの自動遅延ロード、イベント、コマンド、ファイルタイプ、キーマッピングの遅延ロード
- ⏳ Neovim を起動する前に、不足しているプラグインを自動イン ストールし、すぐに使い始めることが可能
- 💪 非同期実行によるパフォーマンスの向上
- 🛠️ 手動でプラグインをコンパイルする必要なし
- 🧪 依存関係の正しい順序付け
- 📁 複数のファイルで設定可能
- 📚 vimdocs を持たないプラグインのために `README.md` ファイルの見出しの helptag を生成する
- 💻 ローカルプラグインを使用するための Dev オプションとパターン
- 📊 パフォーマンスを最適化するためのプロファイリングツール
- 🔒 インストールされたプラグインを追跡する`lazy-lock.json`ファイル
- 🔎 アップデートの自動チェック
- 📋 コミット、ブランチ、タグ、バージョン、完全な [Semver](https://devhints.io/semver) のサポート
- 📈 Statusline コンポーネントで保留中のアップデートの数を表示
- 🎨 自動的に colorschemes を遅延ロードする
```

おまけにふわふわ〜☁️

```admonish success title=""
When I’m in the middle of a dream

Stay in bed, float up stream

夢の中にいるとき

ベッドに寝たまま、流れに身を任せる
```

## ⚡️ Requirements

こんなのはもう些細な要求ですね。

```admonish abstract title="[⚡️ Requirements](https://github.com/folke/lazy.nvim#%EF%B8%8F-requirements)"
- Neovim >= 0.8.0 (needs to be built with LuaJIT)
- Git >= 2.19.0 (for partial clones support)
- a Nerd Font (optional)
```

## ♻️ Evacuate the packer.nvim

`lazy.nvim`のインストールの前に、まずは`packer.nvim`を退避しておきましょう❗

```admonish note
次の項から順番に進めていきますが、インストールするプラグインのリストは次の節で使うので、早まって削除はしないで🥺
```

### 📋 extensions/init.lua

`extensions`ディレクトリにいる`init.lua`を、`packer.lua`とでも名前を変えてあげるのがいいんじゃないかと思います。

~~~admonish quote title="extensions"
```sh
mv init.lua packer.lua
```
~~~

そのまま`extensions`ディレクトリに置いておいてもいいし、どこか他のディレクトリに逃がしてあげてもいいです。

あとは、このままでは次回の`nvim`起動時に「`init.lua`が無いぞー❗」って怒られてしまうので、
新しくからっぽの`init.lua`を作成しておきましょう😉

~~~admonish quote title="extensions"
```sh
touch init.lua
```
~~~

~~~admonish note
これが無いと、`~/.config/nvim/init.lua`の

```lua
require('extensions')
```

...が、怒ってしまうわけですね。
~~~

これでだいじょうぶ😆

### 📃 packer_compiled.lua

そこから上のディレクトリ、`~/.config/nvim`にある`plugin/packer_compiled.lua`についても、
削除しておきましょう。

```admonish note
こっちは`extensions/packer.lua`があれば、すぐに復元できるので支障は無いはずです。
```

`plugin`ディレクトリの中身が`packer_compiled.lua`のみであれば、ディレクトリごと削除しちゃって構いません😉

~~~admonish quote
```sh
rm -rf plugin
```

![rm-packer_compiled](img/rm-packer_compiled.avif)
~~~

~~~admonish warning
もし他にファイルが存在しているようなら気をつけて❗

この場合は`packer_compiled.lua`だけを狙い撃ちしましょう。

```sh
rm plugin/packer_compiled.lua
```
~~~

### 📎 packer

さらにもう一箇所❗

```sh
cd ~/.local/share/nvim
```

これはもしかしたら環境によって変わるかもしれません。
あらかじめ`nvim`からディレクトリを確認しておきましょう。

~~~admonish quote
```vim
:echo stdpath("data")
```
~~~

```admonish warning
もし`flatpak`使ってたりするとこんな path になるので❗

![stdpath](img/stdpath.avif)
```

で、このディレクトリを覗いてみると`site/pack/packer`ディレクトリが存在するはずなので、
これも削除してしまって大丈夫です。

```admonish tip
このディレクトリには`packer.nvim`本体も存在するので、
削除後、再び`packer.nvim`を再度使用したい場合は、`git clone`からやり直す必要があります。

慎重を期すのであれば、ディレクトリ名を変えるだけでも良いです。

![packer-temp](img/packer-temp.avif)
```

まあ、こんなとこでしょう。

```admonish success title=""
Please, don’t wake me, no, don’t shake me

Leave me where I am, I’m only sleeping{{footnote:
I'm Only Sleeping (by [The Beatles](https://en.wikipedia.org/wiki/The_Beatles)):
Lennon が書いた「I'm Only Sleeping」の歌詞の最初の草稿は、1966年の手紙の裏に書かれており、
歌詞に時折読み込まれる薬物による陶酔感よりも、むしろベッドにいることの喜びについて書いていたことがうかがえる。
ツアー中でない間、Lennon は通常、睡眠、読書、執筆、テレビ鑑賞に時間を費やしており、しばしばドラッグの影響下にあった。
1966年3月4日に発行された Evening Standard 紙の記事で、
Lennon の友人である Maureen Cleav は「彼はほとんどいつまでも眠ることができ、おそらくイギリスで最も怠け者だ」と書いている。
}}

お願い、起こさないで、いや、揺すらないで

僕のことは放っておいて、眠っているだけなんだ
```

それでは次項から`lazy.nvim`をセットアップしていきましょう😆

## 📦 Installation

`packer.nvim`の時にはあらかじめ`git clone`で配置しておくように案内されていましたが、
`lazy.nvim`は以下のコードを入れておいてくれれば勝手にインストールしとくよ〜、と案内されています。

~~~admonish info title="[📦 Installation](https://github.com/folke/lazy.nvim#-installation)"
You can add the following Lua code to your init.lua to bootstrap lazy.nvim:

以下の Lua コードを init.lua に追加して、lazy.nvim を起動することができます：
~~~

早速、さっき`touch`で作ったからっぽの`init.lua`に入れてあげましょう❗

~~~admonish example title="extensions/init.lua"
```lua
local lazypath = vim.fn.stdpath("data") .. "/lazy/lazy.nvim"
if not vim.loop.fs_stat(lazypath) then
  vim.fn.system({
    "git",
    "clone",
    "--filter=blob:none",
    "https://github.com/folke/lazy.nvim.git",
    "--branch=stable", -- latest stable release
    lazypath,
  })
end
vim.opt.rtp:prepend(lazypath)
```
~~~

~~~admonish example title="extensions/init.lua"
一緒にこれも❗一番後ろに❗

```lua
require("lazy").setup()
```
~~~

そしたら`nvim` を一度終了して再度起動してみましょう😆

これだけでもう、コマンドから`Lazy`を呼び出せるはずです❗

![lazy-openn](img/lazy-open.avif)

~~~admonish quote
```vim
:Lazy
```
~~~

まあ🤭 Poison☠️ 🩷

```admonish success title=""
Everybody seems to think I’m lazy

みんな僕のことを怠け者だと思ってる
```

![lazy-first](img/lazy-first.avif)

初心に帰れる、やさしい毒🤤

```admonish success title=""
I don’t mind, I think they’re crazy

気にしないさ、彼らこそ狂ってる
```

### 👩‍⚕️ checkhealth
```admonish info
ℹ️ It is recommended to run :checkhealth lazy after installation.

インストール後、:checkhealth lazyを実行することを推奨します。
```

...とのことなのでやっておきましょう。`:che`でも同じです😋

~~~admonish quote
```vim
:che lazy
```
~~~

![lazy-checkhealth](img/lazy-checkhealth.avif)

はい、オールグリーン😉

## 🔌 Plugin Spec

で、`lazy.nvim`も色々と設定があるわけなんですが、数が多いので参照だけ示します。

```admonish info title="[🔌 Plugin Spec](https://github.com/folke/lazy.nvim#-plugin-spec)"

|Property|Type|Description|
|:---:|:---:|:---:|
|...|...|...|
```

これまで`packer`で使っていたものをどうやって移行するかについては、
[📦 Migration Guide](https://github.com/folke/lazy.nvim#-migration-guide) が用意されています❗

冒頭でも触れましたが、**移行**は次の節で触れることにして、まずは基盤を作っていく流れにします😴

```admonish success title=""
Running everywhere at such a speed

Till they find there’s no need

こんなスピードでどこまでも走る

必要ないとわかるまで
```

## ⚙️ Configuration

```admonish info title="[⚙️ Configuration](https://github.com/folke/lazy.nvim#%EF%B8%8F-configuration)"
lazy.nvim comes with the following defaults:

lazy.nvim のデフォルトは以下の通りです：
```

わたしもまだ使い始めて日が浅いので、深く見つめたわけではありません。

ただ、なんか一個すごい興味惹かれるやつありますね🤩

### 📊 performance

こういうの大好き❗

~~~admonish info title="defaults"
```lua
{
  performance = {
    cache = {
      enabled = true,
    },
    reset_packpath = true, -- reset the package path to improve startup time
    rtp = {
      reset = true, -- reset the runtime path to $VIMRUNTIME and your config directory
      ---@type string[]
      paths = {}, -- add any custom paths here that you want to includes in the rtp
      ---@type string[] list any plugins you want to disable here
      disabled_plugins = {
        -- "gzip",
        -- "matchit",
        -- "matchparen",
        -- "netrwPlugin",
        -- "tarPlugin",
        -- "tohtml",
        -- "tutor",
        -- "zipPlugin",
      },
    },
  },
}
```
~~~

#### 🔸 rtp

やあん🥱

```admonish success title=""
Keeping an eye on the world going by my window
{{footnote: 2つ目のブリッジの前のブレイクでは、あくびの音が聞こえ、その前に Lennon が McCartney に "Yawn, Paul." と言った。
}}

Taking my time

窓の外を行き交う世界を見続ける

時間をかけて
```

##### 🔹disabled_plugins

```admonish info
list any plugins you want to disable here

無効にしたいプラグインをここに列挙する
```

コメントアウトされているものをいくつか外してみましょう❗

~~~admonish example title="extensions/init.lua"
```lua
local opts = {
  performance = {
    rtp = {
      disabled_plugins = {
        'gzip',
        'matchit',
        --'matchparen',
        --'netrwPlugin',
        'tarPlugin',
        'tohtml',
        'tutor',
        'zipPlugin',
      },
    },
  },
}
```
~~~

わたしは以下の2つをコメントアウトのままにしています。

```admonish note
`disabled`をコメントアウトしたままにするので、`enabled`のままにするってことですね。

...説明がややこしいですね😮
```

###### ◽matchparen

人によっては不要だと思うかもしれませんが、わたしはこれ好きなんですよね〜😆

[custom_highlights](../neovim/plugin/onenord.html#custom_highlights) でカスタマイズしているぐらいなので❗

###### ◽netrwPlugin

これは「`nvim-tree`を使う場合は無効化しといてね」でお馴染みの [netrw](../neovim/plugin/nvim-tree.html#netrw) です😉

もうすでに無効化するコードが入っているので、ここでは必要はないかな〜っていう考え方です。

まあ、どっちで無効化してもへーきなんじゃないかな⁉️

## 🧪 vim.loader

もう一個だけやっておきましょう🐱

少し古いニュースを引っ張り出しますが😅

~~~admonish info title="news-0.9"
• Added a new experimental `vim.loader` that byte-compiles and caches Lua files.
  To enable the new loader, add the following at the top of your `init.lua`

  Luaファイルをバイトコンパイルしてキャッシュする新しい実験的な`vim.loader`を追加。
  この新しいローダーを有効にするには、`init.lua`の先頭に以下を追加します。

```lua
vim.loader.enable()
```
~~~

これはもう素直に、トップのトップに追加しておきましょう😌

~~~admonish example title="~/.config/nvim/init.lua"
```lua
vim.loader.enable()
```
~~~

~~~admonish info title=":h vim.loader.enable()"
```txt
vim.loader.enable()                                      vim.loader.enable()
  Enables the experimental Lua module loader:
  実験的な Lua モジュールローダーを有効にする:

  • overrides loadfile
    loadfile を上書きします。

  • adds the Lua loader using the byte-compilation cache
    バイトコンパイルキャッシュを使用する Lua ローダーを追加します。

  • adds the libs loader
    libs ローダーを追加します。

  • removes the default Nvim loader
    デフォルトの Nvim ローダーを削除
```
~~~

```admonish tip
もし "実験的な機能" は嫌だーってなるのであれば、これはスキップしても問題ない😗 ...とは思うんですが...。

[feat(lua): add vim.loader #22668](https://github.com/neovim/neovim/pull/22668)

これをうっすら見た感じ、入れておくと`lazy.nvim`と`Neovim`との親和性が上がりそうな気はします🫶
```

```admonish success title=""
Please, don't spoil my day, I'm miles away

And after all, I'm only sleeping

お願い、一日を台無しにしないで、僕はぼんやりしてる

やっぱり、僕は眠っているだけなんだ
```

## 😴 Waiting for a sleepy feeling

これだけやれば、ぐっすり眠る準備はバッチリでしょう😉

次回は`Migration Guide`に従って`packer`からの完全移行を目指します❗

```admonish success
Lying there and staring at the ceiling

Waiting for a sleepy feeling{{footnote:
この曲は、プロデューサーの George Martin との5時間に及ぶ深夜のレコーディング・セッションで、
George Harrison が弾いた逆回転のギター・デュエットという当時としてはユニークなサウンドを特徴としている。
Harrison は、テープを逆回転させることで夢のようなムードに合うように、このパートを完成させた。
エンジニアの Geoff Emerick は、この綿密な作業を「延々と続く」と表現した。
「ヘッドホンを締め付け、眉間にしわを寄せて集中する George の姿が今でも目に浮かぶ」。
[Wikipedia](https://en.wikipedia.org/wiki/I%27m_Only_Sleeping#Covers)より
}}

横たわり天井を見つめる

眠気を待つんだ
```
