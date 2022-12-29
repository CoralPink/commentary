# onenord.nvim

わたしの一番のお気に入りカラーテーマは`onenord.nvim`です😆

```admonish info title = "[onenord.nvim](https://github.com/rmehri01/onenord.nvim)"
Onenord is a Neovim theme written in Lua that combines the Nord and Atom One Dark color palettes.
More specifically, it seeks to add more vibrance to the Nord theme and provide a great programming experience by leveraging Treesitter!

Onenordは、NordとAtom One Darkのカラーパレットを組み合わせた、Luaで書かれたNeovimのテーマです。
具体的には、Treesitterを活用することで、Nordのテーマに活気を与え、素晴らしいプログラミング体験を提供することを目的としています!
```

生きていたのか。`Atom`の意志は...👁️

```admonish abstract title="Requirements"
Neovim >= 0.8.0
```

`Treesitter`を活用するため、`onenord.nvim`の要求もこれに合わせられているようですね。

```admonish note
これはちょっと前のお話ですが、`nvim-treesitter`で大規模な変更が施されたことによる甚大な影響を受けて、`highlight`が壊滅したことがありました。

[feat!: remove obsolete TS* highlight groups](https://github.com/nvim-treesitter/nvim-treesitter/commit/42ab95d5e11f247c6f0c8f5181b02e816caa4a4f)

なんだか世界が色褪せてしまいましたが、`onenord`は3日で救いに来てくれました🤗 My HERO❗

[fix!: highlight groups for neovim 0.8 #50](https://github.com/rmehri01/onenord.nvim/commit/98c64654375bc087e96bca08fd194066d778717c)
```

## install

じゃあ、チャチャっと❗

~~~admonish example title="extensions/onenord.lua"
```lua
local colors = require('onenord.colors').load()

require('onenord').setup {
  styles = {
    comments = 'NONE',
    strings = 'NONE',
    keywords = 'bold',
    functions = 'bold',
    variables = 'NONE',
    diagnostics = 'underline',
  },

  disable = {
    background = true,
  },

  custom_highlights = {
    MatchParen = { fg = colors.none, bg = colors.none, style = 'bold,underline' },
  },
  custom_colors = {
    mypink = '#FFB2CC',
  },
}
```
~~~

これももうテンプレートですね😉 他の`use`ブロックと同列に並べてあげてください。

~~~admonish example title="extensions/init.lua"
```lua
  use {
    'rmehri01/onenord.nvim',
    config = function() require 'extensions.onenord' end,
  }
```
~~~

## config

ある程度は変数名とコメントだけで推測できると思うんですが、上の例で使ってないものも含めてフワ〜っと触れます😆
見た感じ、`disable.background`を`true`にしている場合は効果が無いものもありそうです。

~~~admonish info title="[Configuration](https://github.com/rmehri01/onenord.nvim#configuration)"
The configuration of different options is done through a setup function which will handle setting the colors, so there's no need to set colorscheme yourself!

さまざまなオプションの設定は、色の設定を行う setup 関数によって行われるので、自分で colorscheme を設定する必要はありません!
~~~

### theme
```
"dark" or "light". Alternatively, remove the option and set vim.o.background instead

`dark`または`light`。もしくは、このオプションを削除して`vim.o.background`を設定します。
```

`:h background`を見ると、`defalut "dark"`とあったので、`light`テーマを使う場合には変更が必要かもしれません。
(ごめんなさい、確認してない...😅)

### borders
```
Split window borders

ウィンドウの境界にボーダーを表示します。
```

|true|false|
|:---:|:---:|
|![enable](img/borders-true.webp)|![disable](img/borders-false.webp)|

### fade_nc
```
Fade non-current windows, making them more distinguishable

現在のウィンドウ以外をフェードさせ、区別しやすくする。
```

|true|false|
|:---:|:---:|
|![enable](img/fade_nc-true.webp)|![disable](img/fade_nc-false.webp)|

### styles
```
Style that is applied to various groups: see `highlight-args` for options

様々なグループに適用されるスタイル: オプションは `:h highlight-args` を参照してください。
```

```lua
-- 以下はデフォルト値です。
styles = {
  comments = "NONE",
  strings = "NONE",
  keywords = "NONE",
  functions = "NONE",
  variables = "NONE",
  diagnostics = "underline",
},
```

|bold|NONE|
|:---:|:---:|
|![bold](img/style-bold.webp)|![disable](img/style-none.webp)|

```admonish note
例えば、`comments`を`italic`にするのもオシャレなんですが、カーソルがそのままなので個人的には使いにくいかなー、なんて😅
![italic](img/italic.webp)
```

### disable

#### background
```
Disable setting the background color

背景色の設定を無効にします。
```

これを`true`として無効化すると、ターミナルの背景色やアルファチャンネル値がそのまま反映されます。

|true|false|
|:---:|:---:|
|![enable](img/background-true.webp)|![disable](img/background-false.webp)|

#### cursorline
```
Disable the cursorline

カーソルラインを無効にします。
```

#### eob_lines
```
Hide the end-of-buffer lines

バッファ終端行を隠します。
```

...これちょっと何かわからなかった...😿

### inverse
```
Inverse highlight for different groups

グループごとにハイライトを反転させます。
```

### custom_highlights
```
Overwrite default highlight groups

デフォルトのハイライトグループを上書きします。
```

|customize|none|
|:---:|:---:|
|![enable](img/custom_highlight.webp)|![disable](img/custom_highlight-none.webp)|

ちょっと見えにくいかな...。上の例では`}`です。

### custom_colors
```
Overwrite default colors

デフォルトの色を上書きします。
```

```admonish note
説明にはありませんが、実はオリジナルの色を新しく定義することもできちゃいます。
```

## Wrap up

ここまでやっただけでも見違えるような変身っぷりですね❗

![onenord](img/onenord.webp)

```admonish note
前のページとの比較ではさらに変化がわかりやすいです😉

|default|nvim-treesitter|
|:---:|:---:|
|![color1](img/color1.webp)|![color2](img/color2.webp)|

|onenord.nvim|
|:---:|
|![color3](img/color3.webp)|
```

```admonish success
なんだか、ようやくひと段落って感じがします☺️

わたしも頑張ったぞ、ニッポン❗トーナメントを駆け上がった景色は綺麗だろうなぁ...⚽🏆
```
