# telescope.nvim

前回でほぼ外観が出来上がったので、ここからは一気に機能を追加していきます😆

```admonish info title="[telescope.nvim](https://github.com/nvim-telescope/telescope.nvim)"
Gaze deeply into unknown regions using the power of the moon.

月の力を借りて、未知の領域を深く覗き込む。
```

とってもロマンチックな見出し🥰

```admonish info title=""
telescope.nvim is a highly extendable fuzzy finder over lists.
Built on the latest awesome features from neovim core.
Telescope is centered around modularity, allowing for easy customization.

telescope.nvim は、リスト上のファジーファインダーで、高度に拡張可能です。
neovim core の最新の素晴らしい機能に基づいて構築されています。
Telescope はモジュール性を重視しており、簡単にカスタマイズすることができます。

Community driven builtin pickers, sorters and previewers.

コミュニティによって開発された、ピッカー、ソーター、プレビュー機能を搭載しています。
```

2023年はうさぎ年です🐰 うさぎといえば月ですね🌝

今やらないでいつやるの❓`telescope.nvim`の登場です 🔭

```admonish note
"moon" はポルトガル語で`lua`です😉
```

## Getting Started

しばらくは文字ばっかり続いちゃいますが、頑張っていきましょう😆

```admonish info title="[Getting started](https://github.com/nvim-telescope/telescope.nvim#getting-started)"
Neovim (v0.7.0) or the latest neovim nightly commit is required for telescope.nvim to work.
```

最初のこれはもう問題ないですよね。

ここから先は、月の力を借りているとは言え、高度な拡張を謳っていることもあってインストールは少し複雑に感じられるかもしれません。

...とは言え、必要なのは有名なソフトウェアばかりなので、どんな環境に対しても簡単な導入方法が確立されています❗

まあだいじょぶ。できるよ🤗

### Required dependencies

```admonish info title="[Required dependencies](https://github.com/nvim-telescope/telescope.nvim#required-dependencies)"
nvim-lua/plenary.nvim is required.
```

`packer`の`required`に指定してあげれば良いので、ここもまだ見知った領域ですね❗

### Suggested dependencies

ここから未知の領域に入っていきます。覗いてみましょう...。

```admonish info title="[Suggested dependencies](https://github.com/nvim-telescope/telescope.nvim#suggested-dependencies)"
BurntSushi/ripgrep is required for live_grep and grep_string and is the first priority for find_files.

BurntSushi/ripgrep は live_grep と grep_string に必要で、find_files では最優先されます。
```

わたしも半分くらいは何言われてるのかわからないんで思考回路はショート寸前😵‍💫ですが、
`ripgrep`が必要だということは伝わってきました❗

```admonish info title=""
We also suggest you install one native telescope sorter to significantly improve sorting performance.
Take a look at either telescope-fzf-native.nvim or telescope-fzy-native.nvim.
For more information and a performance benchmark take a look at the Extensions wiki.

また、ソート性能を大幅に向上させるために、1つのネイティブな telescope sorter をインストールすることをお勧めします。
telescope-fzf-native.nvim か telescope-fzy-native.nvim のいずれかを見てみてください。
より詳細な情報とパフォーマンスベンチマークについては、Extensions wiki をご覧ください。
```

こちらは必須ではありませんが、せっかくお勧めされているし、何よりもなんか面白そうです☺️

"性能を大幅に向上"❓今すぐ 会いたいよ😆

#### ripgrep

まずは`ripgrep`から。

```admonish info title="[ripgrep (rg)](https://github.com/BurntSushi/ripgrep)"
ripgrep is a line-oriented search tool that recursively searches the current directory for a regex pattern.
ripgrep は行指向の検索ツールで、正規表現パターンに基づいてカレントディレクトリを再帰的に検索します。
```

`Rust`で開発されている`grep`{{footnote:
[grep](https://ja.wikipedia.org/wiki/Grep)は、
search `g`lobally in the file / each lines to which the `r`egular `e`xpression matches / `p`rint them
の頭文字から来てるんだって😮
}}ツールです。

```admonish info title="[installation](https://github.com/BurntSushi/ripgrep#installation)"
Archives of precompiled binaries for ripgrep are available for Windows, macOS and Linux.

ripgrep のコンパイル済みバイナリのアーカイブは、Windows、macOS、Linux 用に用意されています。
```

インストールに関しては手厚くフォローされているので、ほとんどの環境で楽勝でしょう❗

~~~admonish note
例えば`macOS`ならすっかりお馴染みの`Homebrew`でできます。

```sh
brew install ripgrep
```
~~~

#### telescope-fzf-native.nvim

わたし自身があんまりよく分かってない領域なので、無責任な紹介になってしまいますが、
ここでは`telescope-fzf-native.nvim`を選んで話を進めます。

```admonish info title="[telescope-fzf-native.nvim](https://github.com/nvim-telescope/telescope-fzf-native.nvim)"
fzf-native is a c port of fzf. It only covers the algorithm and implements few functions to support calculating the score.
This means that the fzf syntax is supported:

fzf-native は fzf の c 版です。これはアルゴリズムのみをカバーし、スコア計算をサポートするいくつかの関数を実装しています。
これは、fzf構文がサポートされていることを意味します。
```

これもまた`require`のミルフィーユになっていて、泣きたくなるような moonlight🌕

```admonish info title="[Installation](https://github.com/nvim-telescope/telescope-fzf-native.nvim#installation)"
To get fzf-native working, you need to build it with either cmake or make.
As of now, we do not ship binaries. Both install methods will be supported going forward.
```

まあでも、ここまで来れたのだからなんとかなるでしょ😉

`telescope-fzf-native.nvim`では、`CMake`を使う方法と、`Make`を使う方法が示されています。

```admonish note
このサイトでは`packer`への指示が簡単な`Make`を使っていきます。(コードはもうちょっと先で示します❗)
```

これにプラスして、`GCC`か`Clang`が必要なので、足りないものがあれば事前にインストールしておきましょう。

```admonish note
わたしが普段このサイトのスクリーンショットに使っている`Linux`の環境では、
`nvim-treesitter`のインストール時に`Clang`を導入してあったので、特に何もせずそのままいけました。

`macOS`も特に何も考えずにいけました。

`Windows`はいつも通り自信がありませんが、
もしかしたら`CMake`と`Microsoft C++ Build Tools on Windows`を使う方が、`MinGW`を必要としない分、簡単かもしれません。
```

### Optional dependencies

あともう少し...。がんばれ...❗

```admonish info title="[Optional dependencies](https://github.com/nvim-telescope/telescope.nvim#optional-dependencies)"
sharkdp/fd (finder)

nvim-treesitter/nvim-treesitter (finder/preview)

neovim LSP (picker)

devicons (icons)
```

`nvim-treesitter`と`devicons`については導入済みですね、だいぶ安心できました。
`neovim LSP`については、このサイトで扱うのはもう少し先の予定なので、ここは一旦スキップしましょ❓

ってことは...❓あとひとつ❗

#### fd

```admonish info title="[fd](https://github.com/sharkdp/fd)"
fd is a program to find entries in your filesystem.
It is a simple, fast and user-friendly alternative to find.
While it does not aim to support all of find's powerful functionality,
it provides sensible (opinionated) defaults for a majority of use cases.

fd は、ファイルシステム内のエントリを検索するプログラムです。
find に代わる、シンプルで高速かつユーザフレンドリなプログラムです。
find の強力な機能のすべてをサポートすることを目的としているわけではありませんが、
ほとんどのユースケースに対して、賢明な(意見のある)デフォルトを提供しています。
```

```admonish info title="[installation](https://github.com/sharkdp/fd#installation)"
On ***
```

これも`rigprep`と同じく、手厚くインストール方法が提供されているので大丈夫❗

```admonish tip
わたしが知っている範囲で言うと、

- `fd`: ファイル名検索
- `rg`: ファイル内をテキスト検索

なので、似ているようで役割は別々です。
```

## Installation & Configration

長い道のりでしたが、ようやくコンフィグを書くところまで来ました😆

~~~admonish example title="extensions/telescope.lua"
```lua
local telescope = require 'telescope'

telescope.setup {
  defaults = {
    mappings = {
      i = {
        ['<C-h>'] = 'which_key',
      },
    },
    winblend = 20,
  },
}
telescope.load_extension 'fzf'

local builtin = require 'telescope.builtin'

vim.keymap.set('n', '<leader>ff', builtin.find_files)
vim.keymap.set('n', '<leader>fg', builtin.live_grep)
vim.keymap.set('n', '<leader>fb', builtin.buffers)
vim.keymap.set('n', '<leader>fh', builtin.help_tags)
```
~~~

上の例は、オフィシャルに示されているコードから所々省略したコードになってます。

ここまで来れば、あとはもう`packer`に任せればできちゃいます😸

~~~admonish example title="extensions/init.lua"
```lua
use {
  'nvim-telescope/telescope.nvim',
  branch = '0.1.x',-- or... tag = '0.1.1'
  config = function() require 'extensions.telescope' end,
  requires = {
    'nvim-tree/nvim-web-devicons', 'nvim-lua/plenary.nvim',
    { 'nvim-telescope/telescope-fzf-native.nvim', run = 'make' },
  },
}
```
~~~

信じてないのね...😿

だったらね、こう叫んでみて❗ムーンプリズム・パワー、メイクアーップ🐱🌙

はっ❗🐰🙋

```admonish note
このサイトは色々パク...🙊

引用作品へのリスペクトや愛情の深さや再現度の高さやその他諸々なんか等に定評があります❗きっと❗
```

![telescope-installation](img/telescope-install.webp)

`telescope.nvim`、`telescope-fzf-native.nvim`、`plenary.nvim`の3つがインストールされていれば成功です❗

```admonish note
なんと❗`telescope.nvim`は、つい最近`0.1.1`がリリースされました👏 とってもタイムリー❗

[release: 0.1.1](https://github.com/nvim-telescope/telescope.nvim/commit/c1a2af0af69e80e14e6b226d3957a064cd080805)

ただ、今後この`tag`、`branch`がどういう扱いになるのか分からない(わたしが知らないだけ❓)ので、
今後の動向を気にかけておく必要はあるかも。
```

## CheckHealth

`telescope`さえインストールできれば、`health`チェックが使えます。

~~~admonish note
これは`nvim-treesitter`でも出てきた`Neovim`のコマンドですね。

[checkhealth](nvim-treesitter.html#checkhealth)が使えます。
~~~

まさかサボってたせいでエラーが出てるぅ❗な〜んてこと、あるはずはありませんが、一度確認のために動かしてみましょう😉

```
:che telescope
```

![telescope-che-err](img/telescope-che-err.webp)

...。😮

![telescope-che-require](img/telescope-require.webp)

![telescope-che](img/telescope-che-ok.webp)

ほら❗オールグリーン✨

```admonish tip
`fzf`を知っている人に向けて書くと、少なくともここに出てくる`fzf`は`telescope-fzf-native.nvim`の事なので、
本家の[fzf](https://github.com/junegunn/fzf)はあってもなくても平気みたいです😉

実際、上の環境ではインストールされていません。
```

## telescope.builtin

それでは試しにコンフィグに入れた<kbd>leader</kbd><kbd>f</kbd><kbd>f</kbd>を試してみましょう...。

![telescope-installation](img/telescope-ff.webp)

いい感じ〜☺️

ファイル名で検索して絞り込んだり、
<kbd>↑</kbd><kbd>↓</kbd>でカーソルを動かしたり、<kbd>return</kbd>でファイルを開いたりできます😌

## Wrap Up

やっぱりというか、当然というか...。これもインストールだけなのにすごいボリュームでしたね😅

しかし、月の力を借りて、未知の領域を深く覗き込むことが出来るようになりました❗

コンフィグについてはまだもう少し書いておきたい事があるのですが、ここで一旦休憩しましょ🌕🐇

```admonish success title="assemble"
幾千万の星から あなたを見つけられる

偶然もチャンスに換える 生き方が好きよ
```
