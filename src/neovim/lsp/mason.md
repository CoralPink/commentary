# mason.nvim

<div style="margin-top: 2em"></div>

> Once upon a time, not so long ago
>
> むかしむかし、と言ってもそう遠くない

<div style="margin-top: 2em"></div>

さて、前回は`nvim-lspconfig`のセットアップを行いました。
`Protocol`は既に扱えるようになっているのですが、まだこの言葉で会話のできる相手がいません...😱

うぅ...欲しい...お友達欲しい...😭 彼氏彼女欲しい...🥹

...。

そうだ💡`mason.nvim`に登場してもらいましょう❗

~~~admonish info title="[mason.nvim](https://github.com/williamboman/mason.nvim)"
Portable package manager for Neovim that runs everywhere Neovim runs.
Easily install and manage LSP servers, DAP servers, linters, and formatters.

Neovimが動作する場所ならどこでも動作する、Neovim のポータブルパッケージマネージャです。
LSPサーバー、DAPサーバー、リンター、フォーマッターを簡単にインストール、管理することができます。

```vim
:help mason.nvim
```
~~~

言語関連機能に特化した "パッケージマネージャ" です。

これさえあれば、お友達だろうと彼氏彼女だろうと、もう作り放題です❗

```admonish note title=""
Tommy used to work on the docks

Union’s been on strike, he’s down on his luck

トミーは埠頭で働いていた

労働組合のストライキで、彼はツキに見放された
```

```admonish note title=""
It's tough

So tough

辛かった

とても辛かった
```

## Introduction

いつも通り順番に読み進めて行きます。

```admonish info title="[Introduction](https://github.com/williamboman/mason.nvim#introduction)"
Packages are installed in Neovim's `:h stdpath` by default. Executables are
linked to a single `bin/` directory, which `mason.nvim` will add to the
Neovim's PATH during setup, allowing easy access for the builtin
shell/terminal as well as other 3rd party plugins.

パッケージは、デフォルトでNeovimの `:h stdpath` にインストールされます。
実行可能ファイルは `bin/` ディレクトリにリンクされ、セットアップ時に `mason.nvim` が Neovim の PATH に追加するので、
内蔵のシェル/ターミナルやその他のサードパーティプラグインに簡単にアクセスできるようになります。

For a list of all available packages, see PACKAGES.md.

利用可能なすべてのパッケージの一覧は、PACKAGES.mdを参照してください。
```

こう言われてるんで、`stdpath`のヘルプと`PACKAGES.md`も見てみましょう。

~~~admonish info title=":h stdpath"
```txt
stdpath({what})					stdpath() E6100
  Returns |standard-path| locations of various default files and
  directories.

  様々なデフォルトのファイルやディレクトリの標準的なパス位置を返す.

  {what}       Type    Description
  cache        String  Cache directory: arbitrary temporary
                       storage for plugins, etc.
  config       String  User configuration directory. |init.vim|
                       is stored here.
  config_dirs  List    Other configuration directories.
  data         String  User data directory.
  data_dirs    List    Other data directories.
  log          String  Logs directory (for use by plugins too).
  run          String  Run directory: temporary, local storage
                       for sockets, named pipes, etc.
  state        String  Session state directory: storage for file
                       drafts, swap, undo, |shada|.

  Example:
    :echo stdpath("config")
```
~~~

```admonish info title="[PACKAGES.md](https://github.com/williamboman/mason.nvim/blob/main/PACKAGES.md)"
Mason Package Index
```

まあ、言ってることはわかりますよね。わかるんですけど...。

少しフライングしちゃうんですが、わたしの環境では、インストールしたパッケージは`~/.local/share/nvim/mason`に配置されていきます。

![mason-install-path](img/mason-install-path.avif)

```admonish question
普段使っている`macOS`でも同じなんですけど...、`stdpath`にある？これ😑
```

```admonish fail title=""
Gina works the diner all day

Workin' for her man, she brings home her pay

ジーナは一日中食堂で働いている

彼のために働いて、稼いだ給料を家に持ち帰る
```

```admonish fail title=""
For love

Mm, for love

愛のために

そう、愛のために
```

## Requirements

```admonish abstract title="[Requirements](https://github.com/williamboman/mason.nvim#requirements)"
> [`:h mason-requirements`][help-mason-requirements]

mason.nvim relaxes the minimum requirements by attempting multiple different utilities
(for example, wget, curl, and Invoke-WebRequest are all perfect substitutes).
The minimum recommended requirements are:

mason.nvimは、複数の異なるユーティリティを試すことで、最小要件を緩和しています。
(例えば、wget、curl、Invoke-WebRequestはすべて完璧な代用品です）。
最低限推奨される要件は以下の通りです：

- neovim `>= 0.10.0`
- For Unix systems:
    - `git(1)`
    - `curl(1)` or `GNU wget(1)`
    - `unzip(1)`
    - GNU tar (`tar(1)` or `gtar(1)` depending on platform)
    - `gzip(1)`
-   For Windows systems:
    - pwsh or powershell
    - git
    - GNU tar
    - One of the following:
        - [7zip][7zip]
        - [peazip][peazip]
        - [archiver][archiver]
        - [winzip][winzip]
        - [WinRAR][winrar]

Note that `mason.nvim` will regularly shell out to external package managers, such as `cargo` and `npm`. Depending on
your personal usage, some of these will also need to be installed. Refer to `:checkhealth mason` for a full list.

mason.nvim は定期的に cargo や npm などの外部パッケージマネージャにシェルアウトすることに留意してください。
使い方によっては、これらのパッケージもインストールする必要があります。全リストは :checkhealth mason を参照してください。

[7zip]: https://www.7-zip.org/
[archiver]: https://github.com/mholt/archiver
[peazip]: https://peazip.github.io/
[winzip]: https://www.winzip.com/
[winrar]: https://www.win-rar.com/
```

これもやっぱり`checkhealth`を確認しておきましょう。

~~~admonish quote
```vim
:che mason
```

![checkhealth](img/mason-che.avif)
~~~

よほどの言語プロフェッショナルでもない限り、たくさんの`WARNING`が出てきちゃうと思いますが、
使っていない言語環境が入っていないのは「そりゃそうだー」としかならないので、気にしなくていいやつです😉

ここでは、「全リストを見ておきたい」ってだけなので❗

`git`は`mason.nvim`が動いている時点で大丈夫だと思いますが、`curl`、`tar`あたりが`OK`になっていればひとまずは大丈夫...な、はず。

このあたりが欠けている場合であっても、`brew`だったり、`apt`・`dnf`を使えばすぐにインストールできるはずです。

```admonish warning
ごめんなさい、毎度のことながら`Windows`はわたしがわかってないので触れられません... 😿
```

~~~admonish note
例えば「`JavaScript`やりたいから`typescript-language-server`ほしいなー😆」ってなったとするじゃないですか。

![mason-failed](img/mason-tsls.avif)

`mason.nvim`は`typescript-language-server`のインストールに`npm`を使用するんですね。

でも、もし`npm`がまだインストールされていない状態でそれをやろうとしても、

![mason-failed](img/mason-failed.avif)

```txt
spawn: npm failed with exit code - and signal -. npm is not executable
```

って言われちゃいます。まあ、わかってる人からすればこれも「そりゃそうだー」ではあるんですが、

「`npm`ってなんやねん❗」とか
「`node.js`をやろーゆーとんちゃうねん❗」とか
「ていうか`TypeScript`...❓Jav...、あれえー⁉️😱」ってなっちゃうかもしれません。

この辺りはある程度の経験値が必要になって来ると思うので、
躓いちゃったら周りの人に聞いてみましょう😉
~~~

```admonish fail title=""
She says, “We’ve gotta hold on to what we’ve got”

彼女は言う "私達は今あるものに しがみつくしかないの"
```

```admonish fail title=""
It doesn’t make a difference if we make it or not

上手くいっても いかなくても 違いなんてそんなにないよ
```

```admonish fail title=""
We’ve got each other and that’s a lot for love

We’ll give it a shot

二人一緒なんだもの、それだけで十分じゃない

とにかくやってみましょう
```

## Setup

これもすごい簡単です。
わたしの場合はささやかな変更だけしていますが、しなくても全然平気です。

~~~admonish example title="extensions/mason.lua"
```lua
require('mason').setup {
  ui = {
    check_outdated_packages_on_open = false,
    border = 'single',
  },
}
```
~~~

~~~admonish tip
特に設定を変更しない場合も、以下の一文は必要になります。

```lua
require('mason').setup()
```
~~~

簡単に書くと、以下のようなものです。

### check_outdated_packages_on_open

`false`にしておくと、`mason`のウィンドウを開いた時に新しいバージョンを自動で確認しなくなります。

### border

UI ウィンドウに使用するボーダーを指定します。
`nvim_open_win()` と同じボーダー値を使用することができます。

なので、`single`にしておくと、`packer`と統一感が出ていいかも〜😆

## Install

そしたら、`packer`でのインストールもシンプル😉

~~~admonish example title="extensions/init.lua"
```lua
use {
  'williamboman/mason.nvim',
  config = function() require 'extensions.mason' end,
}
```
~~~

```admonish fail title=""
Woah, we’re halfway there

Woah-oh, livin’ on a prayer{{footnote:
Jon Bon Jovi はこの曲のオリジナル・レコーディングを気に入っていなかった。
(これは[100,000,000 Bon Jovi Fans Can't Be Wrong](https://en.wikipedia.org/wiki/100,000,000_Bon_Jovi_Fans_Can't_Be_Wrong) のシークレットトラックとして見つけることができる。)
しかし Sambora は、この曲が良いものであるとメンバーを説得し、新しいベースライン、異なるドラムフィル、トークボックスを使用してこの曲を作り直し、
[Slippery When Wet](https://en.wikipedia.org/wiki/Slippery_When_Wet)に収録した。
}}

私達はまだ道半ば

縋ってでも 生きていくの
```

## Mason Window

ここまで出来れば、いつも通り`:PackerSync`とかした後に

```vim
:Mason
```

ってするだけですね😆

![mason-window](img/mason-window.avif)

このウィンドウでの操作は、デフォルトで以下のようになっています。

```lua
keymaps = {
  -- Keymap to expand a package
  toggle_package_expand = "<CR>",
  -- Keymap to install the package under the current cursor position
  install_package = "i",
  -- Keymap to reinstall/update the package under the current cursor position
  update_package = "u",
  -- Keymap to check for new version for the package under the current cursor position
  check_package_version = "c",
  -- Keymap to update all installed packages
  update_all_packages = "U",
  -- Keymap to check which installed packages are outdated
  check_outdated_packages = "C",
  -- Keymap to uninstall a package
  uninstall_package = "X",
  -- Keymap to cancel a package installation
  cancel_installation = "<C-c>",
  -- Keymap to apply language filter
  apply_language_filter = "<C-f>",
},
```

要はこうですね😌

|key|description|
|:---:|:---|
|<kbd>return</kbd>|カーソル位置のパッケージ情報を開く|
|<kbd>i</kbd>|カーソル位置のパッケージをインストールする|
|<kbd>u</kbd>|カーソル位置のパッケージを再インストール/アップデートする|
|<kbd>c</kbd>|カーソル位置のパッケージの新バージョンをチェックする。|
|<kbd>U</kbd>|インストールされているすべてのパッケージの更新|
|<kbd>C</kbd>|インストールされているパッケージのうち、どのパッケージが古くなっているかを確認する|
|<kbd>X</kbd>|カーソル位置のパッケージをアンインストールする|
|<kbd>Ctrl-C</kbd>|パッケージのインストールをキャンセルする|
|<kbd>Ctrl-f</kbd>|適用言語フィルタ|

基本的には<kbd>i</kbd>でインストールしたものを<kbd>C</kbd><kbd>U</kbd>で更新管理するっていう使い方でいいと思います。

## Install the Server Protocol

お待たせしました。初めてのお友達作りです。

初めてのお友達はやっぱり`lua`の Language Server❗キミに決めた😆

やり方は色々あると思うんですが、わたしはとりあえず検索からジャンプしちゃいます。

```vim
/lua
```

![install-1](img/install-ls1.avif)

一応、情報を確認しておきましょう。`lua-language-server`にカーソルが合ってるのを確認して<kbd>return</kbd>❗

![install-2](img/install-ls2.avif)

対応する`languages`は`lua`で、`categories`は`LSP`ですね❗

これはぜひお友達になりたいと思うので、<kbd>i</kbd>をぽちっとな。

一番上に戻ってみると...❓

![install-3](img/install-ls3.avif)

`Installed`のリストに`lua-language-server`が加わりました❗もうお友達❗❗

つかまえたお友達は図鑑に登録されます。

なので、`→`にカーソルを合わせて<kbd>return</kbd>でさらに詳しい情報が見られます。

![install-4](img/install-ls4.avif)

## Livin' on a Prayer

これでようやく会話のできるお友達をゲットだぜ❗😆

...と思いきや、まだ何も話してくれません。

ちょっと捕まえ方が強引だったかな...🫨 それとも照れ屋さんなのかな❓😮

```admonish success
どうやら心を開いてもらって会話をするためには、もう1ステップ必要みたいですね。

ってことで、次回に続く... 🦖
```

```admonish fail title=""
Take my hand, we’ll make it, I swear

Woah-oh, livin’ on a prayer{{footnote:
Livin' on a Prayer (by [Bon Jovi](https://en.wikipedia.org/wiki/Bon_Jovi)):
Bon Jovi が 3枚目のスタジオ・アルバム[Slippery When Wet](https://en.wikipedia.org/wiki/Slippery_When_Wet)に収録した楽曲。

[Jon Bon Jovi](https://en.wikipedia.org/wiki/Jon_Bon_Jovi),
[Richie Sambora](https://en.wikipedia.org/wiki/Richie_Sambora),
[Desmond Child](https://en.wikipedia.org/wiki/Desmond_Child)
によって作曲されたこのシングルは、1986年後半にリリースされ、ロックおよびポップのラジオ局で高い人気を博し、そのミュージックビデオは[MTV](https://en.wikipedia.org/wiki/MTV)で頻繁にオンエアされた。
これにより、バンドにとって Billboard [Mainstream Rock](https://en.wikipedia.org/wiki/Mainstream_Rock_(chart))チャートで初の1位を獲得した楽曲となり、
[Billboard Hot 100](https://en.wikipedia.org/wiki/Billboard_Hot_100)では2曲連続の1位ヒットを記録した。

Bon Jovi は、1994年のベストアルバム[Cross Road](https://en.wikipedia.org/wiki/Cross_Road_(album))で、別バージョンである "Prayer 94" をリリースした。

Bon Jovi の代表曲と見なされている Livin' on a Prayer は、リリースから数十年経った今でも、
ファン投票によるランキングで首位を獲得し、世界中で再チャートインを果たしている。

2013年、この曲は300万回以上のデジタルダウンロードを記録し、トリプル・プラチナ認定を受けた。
それ以来、世界中で1,300万枚以上を売り上げ、史上最も売れたシングルの一つとなっている。
[Wikipedia](https://en.wikipedia.org/wiki/Livin%27_on_a_Prayer)より
}}

私の手を握ってよ 絶対にできる 約束するよ

祈りに縋ってでも 生きていくの
```

<youtube-video data-id="_b4fzT3ut2w"></youtube-video>

<div style="color: #999999; font-size: 90%; text-align: center;">
<div style="margin-top: 8em">
Tommy's got his six-string in hock

now he's holdin' in, when he used to make it talk

トミーは 6弦ギターを質に入れてしまった

それは彼にとって掛け替えのないものだったのに...
</div>

<div style="margin-top: 4em">
So tough

Ooh, it's tough

辛かった

とても辛かった
</div>

<div style="margin-top: 8em">
Gina dreams of runnin' away

わたしはこんな現実から逃げ出したくなってしまう
</div>

<div style="margin-top: 4em">
When she cries in the night, Tommy whispers

夜、泣いていたら 彼は優しく寄り添った
</div>

<div style="margin-top: 8em">
"Baby, it's okay

"ジーナ、俺は平気だ
</div>

<div style="margin-top: 4em">
Someday"

いつの日か..."
</div>

<div style="margin-top: 8em">
We've gotta hold on to what we've got

俺達は 今あるものに しがみつくしかない
</div>

<div style="margin-top: 4em">
It doesn't make a difference if we make it or not

上手くいっても いかなくても そんなことはどうでもいいんだ
</div>

<div style="margin-top: 4em">
We've got each other and that's a lot for love

We'll give it a shot

二人一緒なんだから それで十分さ

とにかくやってみよう
</div>

<div style="margin-top: 8em">
Woah, we’re halfway there

Woah-oh, livin’ on a prayer

俺達はもう半ばまで来れたんだ

縋ってでも 生き続けよう
</div>

<div style="margin-top: 8em">
Take my hand, we’ll make it, I swear

Woah-oh, livin’ on a prayer

手を握ってほしい 絶対に乗り越えられる 誓ってやるさ

祈りに縋ってでも 生き続けよう
</div>

<div style="margin-top: 12em">
livin’ on a prayer{{footnote:
2001年9月11日の同時多発テロ事件では、[World Trade Center](https://en.wikipedia.org/wiki/World_Trade_Center_(1973–2001))で働く人々や緊急対応要員に何百人もの死傷者が出た。
彼らの出身地である[New Jersey](https://en.wikipedia.org/wiki/New_Jersey)は[New York](https://en.wikipedia.org/wiki/New_York_City)に次いで大きな被害を受けたが、
バンドは New York のためにこの曲をアコースティックに演奏し歌った。
}}
</div>

<div style="margin-top: 12em">
Ooh, we gotta hold on, ready or not

You live for the fight when that's all that you've got

しがみつくんだ、なんの準備もしていなくても

それしか残っていないのなら 信じて立ち向かうんだ
</div>
</div>

<div style="margin-top: 8em"></div>
