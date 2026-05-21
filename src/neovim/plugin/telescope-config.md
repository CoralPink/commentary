# telescope.nvim \- Config

前回は、ほぼ新月の時期に`telescope.nvim`をメイクアップ 🌙

気づけばもうすっかり Snow Moon (満月) です🌕 ムーンプリズム・パワーがハンパないです❗

...な〜んてオープニングに時間をかけていると朝になってしまうので、早速いきましょう❗

## Previous...

ページを跨いだのでもう一回載っけときます。

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

これが`telescope`の基本形ですね。

で、いつも通りこれだけでいってもいいんですが...、

ちょ〜っち寄り道して、先にわたしのおすすめ設定を紹介しちゃいます😆

## help_tags ✨My recommendation✨

こんなのを入れてみてください。

~~~admonish example title="extensions/telescope.lua"
```lua
local themes = require 'telescope.themes'

-- ...

vim.keymap.set('n', '<leader>h', function()
  builtin.help_tags(themes.get_ivy())
end)
```
~~~

そしたら、<kbd>leader</kbd><kbd>h</kbd>としてみましょう。

![telescope-help_tags](img/telescope-help_tags.webp)

一目で分かるすっごいやつ...❗{{footnote:
Star Warsは、[George Lucas](https://en.wikipedia.org/wiki/George_Lucas)によって創作された
アメリカの壮大なスペースオペラ・メディア・フランチャイズであり、
[1977年の同名映画](https://en.wikipedia.org/wiki/Star_Wars_(film))を起点として、
瞬く間に世界的なポップカルチャー現象となった。

Star Wars シリーズは、"a long time ago in a galaxy far, far away" という舞台設定のもと、
複数の架空の時代にわたって展開されるキャラクターたちの冒険を描いている。
そこでは人間と多種多様な (多くは人型の) エイリアン種族が共存しており、
個人の補助や戦闘のために設計された[Droid](https://en.wikipedia.org/wiki/Droid_(Star_Wars))たちも日常的に存在する。

Star Wars で描かれる宇宙は現実の宇宙と概ね似ているが、物理法則がより緩やかで、より想像力豊かな物語が可能となっている。
その最たる例が "フォース ([The Force](https://en.wikipedia.org/wiki/The_Force))" と呼ばれる神秘的な力である。
これは初作の中で "あらゆる生命によって生み出され、銀河を結びつけるエネルギー" と説明されており、
一種の汎神論的な神のようにも描かれている。

フォースに強く感応する者は、訓練と瞑想によって超常的な力 (念動力、予知、テレパシー、エネルギー操作など) を使うことができる。
"フォースによって不可能はない" とも信じられており、この力を操る者たちには、相反する二つの騎士団が存在する。

一方は[Jedi](https://en.wikipedia.org/wiki/Jedi)。
銀河共和国の平和を守る調停者として "Light Side (光明面)" のフォースを用い、執着を離れ、調和を重んじる。

[Wikipedia](https://en.wikipedia.org/wiki/Star_Wars)より
([次ページへ続く](telescope-all-recent.html#ft-3))
}}
![yoda](img/yoda.webp)

~~~admonish info title=":h help_tags"
```txt
builtin.help_tags({opts})                   telescope.builtin.help_tags()
  Lists available help tags and opens a new window with the relevant help info on `<cr>`

  利用可能なヘルプタグをリストアップし、`<cr>`で新しいウィンドウにヘルプ情報を表示します。

  Parameters:
      {opts} (table)  options to pass to the picker

  Options:
      {lang}     (string)   specify language (default: vim.o.helplang)
      {fallback} (boolean)  fallback to en if language isn't installed
                            (default: true)
```
~~~

文字列で絞り込んで...🧐

![telescope-help_tags](img/telescope-help_tags2.webp)

<kbd>return</kbd>で開く。

![telescope-help_tags](img/telescope-help_tags3.webp)

デフォルトであってもおかしくない...っていうか、なんでないの⁉️ ってぐらいの機能が実現してます🤗

`themes`についてはまた後で触れます。おたのしみはとっときましょ😉

## setup

それじゃあ、ここからはいつも通りでいきましょう🐰

### defaults

このサイトでは、`defaults`オプションのみを扱います。

#### mappings

~~~admonish info title=":h telescope.mappings"
`telescope.mappings` is used to configure the keybindings within a telescope
picker. These key binds are only local to the picker window and will be cleared
once you exit the picker.

`telescope.mappings` はテレスコープピッカー内のキーバインドを設定するために使用されます。
これらのキーバインドはピッカー ウィンドウ内でのみ有効で、ピッカーを終了するとクリアされます。

We provide multiple configuration options to make it easy for you to adjust
telescope's default key bindings and create your own custom key binds.

複数の設定オプションが用意されており、telescope のデフォルトのキーバインドを調整したり、
独自のキーバインドを作成したりすることが簡単にできます。

To see many of the builtin actions that you can use as values for this table,
see `telescope.actions`

このテーブルの値として使用できるビルトインアクションの多くは、 `telescope.actions` を参照してください。
~~~

```admonish tip
このサイトでは、今後も`help`への参照を`:h`表記で統一しますが、もはや`telescope.help_tags`を使うほうが便利ですね😤

積極的に使っていきましょう❗
```

こっちも「もはや」って感じですが、`i`は`Insert Mode`、`n`は`Normal Mode`です。
それぞれにキーマッピングを設定できます。

##### Insert Mode

`telescope`の検索バーにいる時も`Insert Mode`・`Normal Mode`っていう概念は持っていて、
`telescope`を開いた段階では`Insert Mode`になっています。

<kbd>Esc</kbd>をすれば`Normal Mode`に切り替わりますが、「え😮 `Normal Mode`要る❓」とか思っちゃう場合はこんなのもアリです。

~~~admonish example title="extensions/telescope.lua"
```lua
    mappings = {
      i = {
--      ['<C-h>'] = 'which_key',
        ['<esc>'] = require('telescope.actions').close,
      },
    },
```
~~~

こうしておくと<kbd>Esc</kbd>で`telescope`からそのまま抜けます☺️

```admonish note
<kbd>Ctrl-[</kbd>派の人も`<esc>`を指定しておけばOKです。
```

###### which_key

`telescope`ウィンドウを開いた状態で<kbd>Ctrl-h</kbd>とすると操作一覧が現れます。

~~~admonish info title="telescope.actions.which_key()"
```txt
actions.which_key({prompt_bufnr})
    Display the keymaps of registered actions similar to which-key.nvim.

    which-key.nvimと同様に、登録されたアクションのキーマップを表示します。
```
~~~

![telescope-installation](img/telescope-which.webp)

以下のようにコードを加えると`Normal Mode`でも操作一覧を出すことができるんですね。

~~~admonish example title="extensions/telescope.lua"
```lua
    mappings = {
      i = {
        ['<C-h>'] = 'which_key',
      },
      n = {
        ['<C-h>'] = 'which_key',
      }
    },
```
~~~

![telescope-installation](img/telescope-which-n.webp)

なんていうか、すっごい行き届いてますよね☺️

#### winblend

「これが`telescope`の基本形ですね〜」とか言っておきながら、`winblend`はわたしが勝手に入れてるやつでした🐱

~~~admonish info title=":h winblend"
```txt
'winblend' 'winbl'                          number	(default 0)
                                            local to window

Enables pseudo-transparency for a floating window. Valid values are in
the range of 0 for fully opaque window (disabled) to 100 for fully
transparent background. Values between 0-30 are typically most useful.

フローティングウィンドウの擬似透過を有効にする。
有効な値は、完全に不透明なウィンドウ（無効）のための 0 から完全に透明な背景のための 100 の範囲である。
一般的に 0-30 の間の値が最も有用。

UI-dependent. Works best with RGB colors. 'termguicolors'

これは UI に依存する。`termguicolors`が有効である場合に最も機能する。
```
~~~

`winblend`は`Neovim`の`window`オプションです。

~~~admonish tip
...なので、とにかくスケスケが好きなら、`options.lua`あたりにこんなんするのも良いと思います。

```lua
vim.api.nvim_win_set_option(0, 'winblend', 20)
```

![winblend](img/winblend.webp)

ほらね。`telescope`に限らず`packer`なんかも、もれなくスケスケです☺️ えへへ。
~~~

## load_extension

~~~admonish info title=":h telescope.load_extension()"
```txt
telescope.load_extension({name})
  Load an extension.
  拡張機能を読み込む。

  - Notes:
    - Loading triggers ext setup via the config passed in `telescope.setup`
      ロードすると、`telescope.setup` で渡された設定により、拡張機能のセットアップが行われます。

  Parameters:
      {name} (string)  Name of the extension
```
~~~

このサイトでは`telescope-fzf-native.nvim`のロードに使用しています😌

```admonish info title="[telescope-fzf-native.nvim](https://github.com/nvim-telescope/telescope-fzf-native.nvim)"
fzf-native is a c port of fzf. It only covers the algorithm and implements few functions to support calculating the score.
This means that the fzf syntax is supported:

fzf-native は fzf の c 版です。これはアルゴリズムのみをカバーし、スコア計算をサポートするいくつかの関数を実装しています。
これは、fzf構文がサポートされていることを意味します。
```

もしカスタマイズが必要であれば
[Telescope Setup and Configuration](https://github.com/nvim-telescope/telescope-fzf-native.nvim#installation)
で方法が示されています。

![C-3PO](img/C-3PO.webp)

## builtin

これはもう`telescope.nvim`がオフィシャルに機能を一覧してくれているので、これだけ示します。

~~~admonish info title="[Pickers](https://github.com/nvim-telescope/telescope.nvim#pickers)"
Built-in functions. Ready to be bound to any key you like.
~~~

これを見るだけでもかなり多機能なのがわかります...。😮

わたしがさらっと確認した限りで言うと、

- [Vim Pickers](https://github.com/nvim-telescope/telescope.nvim#neovim-lsp-pickers): `builtin.tags`は`ctags`を使っている人向け
- [Neovim LSP Pickers](https://github.com/nvim-telescope/telescope.nvim#neovim-lsp-pickers): `LSP`が動いている前提

```admonish note
多分なんですが、`ctags`はこのサイトでは扱いません。

わたしもインストールはしてあるけど、「乗りこなせていない」というのが正直なところ😅
```

この辺り以外は、もうここまでの内容だけでも全部動くんじゃないかな🤔

一応使う方法だけ書いておくと、キーマップに登録するのが一番簡単です。例えば、

|Functions|Description|
|:---:|:---:|
|builtin.find_files|Lists files in your current working directory, respects .gitignore|

...ってなってるのを、

```lua
vim.keymap.set('n', '<leader>ff', builtin.find_files)
```

...ってしていくだけですね。全部このフォーマットでいけるはずです❗

```admonish note
もちろん、キーバインドは他のと被らないようにね😉
```

![R2-D2_BB-8](img/R2-D2_BB-8.webp)

## themes

...ってことで、ようやく`themes`に辿り着きました☺️

これはさっきの`help_tags`のコードです。

```lua
local themes = require 'telescope.themes'

vim.keymap.set('n', '<leader>h', function()
  builtin.help_tags(themes.get_ivy())
end)
```

~~~admonish info title="[Themes](https://github.com/nvim-telescope/telescope.nvim#themes)"
Common groups of settings can be set up to allow for themes.
We have some built in themes but are looking for more cool options.

共通の設定グループを設定することで、テーマを設定することができます。
我々はいくつかのビルトインテーマを持っていますが、よりクールなオプションを探しています。
~~~

これはもうイメージで見たほうが早いと思うので、`help_tags`をそれぞれの`themes`で呼んでみます。

<div class="slider">
  <div class="media">
    ![telescope-theme-none](img/telescope-theme-none.webp)
    ![telescope-theme-dropdown](img/telescope-theme-dropdown.webp)
    ![telescope-theme-cursor](img/telescope-theme-cursor.webp)
    ![telescope-theme-ivy](img/telescope-help_tags.webp)
  </div>
</div>

|1|2|3|4|
|:---:|:---:|:---:|:---:|
|(none)|get_dropdown|get_cursor|get_ivy|

もう言葉なんて要りませんね❗

![chewbacca](img/chewbacca.webp)

## Recipes

このサイトで紹介した内容も含めて、
お役立ち Tips はもう既に`telescope.nvim`の`wiki`にたくさんまとまっているので、試してみると面白いです😆

```admonish info title="[Configuration Recipes](https://github.com/nvim-telescope/telescope.nvim/wiki/Configuration-Recipes)"
A place for the community to share configurations and custom pickers that dont fit into core or an extension

コアやエクステンションにない設定やカスタムピッカーをコミュニティで共有する場です。
```

## Wrap Up

このサイトに書いてあることなんて、ほんと表面だけです。
`telescope.nvim`は、ほんとにもう目が回る😵‍💫 ぐらい多機能なんで❗

...で、なんですけど😮

わたしもつい最近知った便利な`tip`があるので、次回はそんな新星のおはなしです✨

```admonish info title=""
Fly me to the moon

And let me play among the stars

ねえ わたしを月までいかせて

あの星たちに囲まれて 遊んでみたいの
```

```admonish info title=""
Let me see what spring is like

On jupiter and mars

ねえ 木星と火星の春って

どんなものなんだろう 見てみたいの
```

```admonish success title="Assemble"
さぁ〜て、この次も❗サービス、サービスぅ💕
```
