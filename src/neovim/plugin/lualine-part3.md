# lualine.nvim Part Ⅲ

2023年に帰る前に、`lualine.nvim`に関してもう一個だけやっておきたいことがあって、それが`TabLine`なんですね。

...ややこしいですけど😮

```admonish note title=""
I gave you explicit instructions not to come here, but to go directly back to 2023.

ここには来ないで、そのまま2023年に戻れと明確な指示をしたはずだ。
```

...されてないですけど😅

```admonish note title=""
But it's good to see you.

だが また会えて嬉しい。
```

...❗😭

## TabLine

Cinema Part もそこそこに、早速いっちゃいましょう。

~~~admonish example title="extension/lualine.lua"
```lua
local colors = require('onenord.colors').load()

local switch_color = {
  active = { fg = colors.active, bg = colors.mypink },
  inactive = { fg = colors.active, bg = colors.light_gray },
}

require('lualine').setup {
--[[
  options = {
    ...
  },

  sections = {
    ...
  },
]]

  -- sections と同列に追記する
  tabline = {
    lualine_a = {
      {
        'buffers',
        buffers_color = switch_color,
        symbols = { modified = '_', alternate_file = ' ', directory = ' ' },
      },
    },
    lualine_b = {},
    lualine_c = {},
    lualine_x = {
      'diff'
    },
    lualine_y = {
      'branch'
    },
    lualine_z = {
      { 'tabs', tabs_color = switch_color },
    },
  },
}
```
~~~

```admonish note
`switch_color`の中で、colors.mypinkというものがあるんですが、これは`onenord.nvim`の`custom_colors`に定義したオリジナルカラーです。

[onenord.nvim - Install & Config](onenord.html#install--config)

ご自身のお好きな色を入れてもらえればオッケーです。
```

で、これを反映させると、画面の上部に`Tabline`が表示されます。

![lualine-tabline](img/lualine-tabline.webp)

カスタマイズの内容は、前回の`sections`と全く同じフォーマットなので、イメージできますよね😉
それぞれのセクションで使用するコンポーネントの指定と、あとはアイコン・カラーなんかを変えてます。

`lualine_x`の`diff`と`lualine_y`の`branch`については、ひと手間加えるともっと良いものが出来上がるので、次の項で😆

```admonish note
これらはカスタマイズ前のデフォルトでも使われていました。

![lualine-default](img/show-mode-false.webp)

...が❗前回しれっと外してました😅 ここで晴れての復活です❗
```

## Using external source

前回出てきた`:h lualine-Available-components`も併せて思い出してほしいんですが、
`lualine.nvim`単体でも`git`の`branch`と`diff`の表示に対応しているんですね。

しかし、ここで登場するのが`gitsigns.nvim`です❗

`git`の扱いに関して彼の右に出るものはいません😆

### for git-diff

~~~admonish info title="[Using external source for diff](https://github.com/nvim-lualine/lualine.nvim/wiki/Component-snippets#using-external-source-for-diff)"
If you have other plugins installed that keep track of info. lualine can reuse that info.

もし他にトラッキングを管理しているプラグインをインストールしているのなら、lualineはその情報を再利用することができます。

And you don't need to have two separate plugins doing the same thing.

なので、2つそれぞれのプラグインで同じことをする必要はありません。

```lua
local function diff_source()
  local gitsigns = vim.b.gitsigns_status_dict
  if gitsigns then
    return {
      added = gitsigns.added,
      modified = gitsigns.changed,
      removed = gitsigns.removed
    }
  end
end
```
~~~

```admonish note
`diff_source()`は`setup {}`の外に追記してください😉
```

~~~admonish example title="extensions/lualine.nvim"
```lua
    lualine_x = {
      { 'diff', symbols = { added = ' ', modified = ' ', removed = ' ' }, source = diff_source },
    },
```
~~~


```admonish note
`symbols`はわたしが勝手に入れてます。
```

### for git-branch
~~~admonish info title="[Using external source for branch](https://github.com/nvim-lualine/lualine.nvim/wiki/Component-snippets#using-external-source-for-branch)"
If you have other plugins installed that keep track of branch info. lualine can reuse that info.

もし他にブランチ情報を持っているプラグインをインストールしているのなら、lualine はその情報を再利用することができます。
~~~

~~~admonish example title="extensions/lualine.nvim"
```lua
    lualine_y = {
      { 'b:gitsigns_head', icon = { '', color = { fg = colors.orange } }, color = { fg = colors.fg } },
    },
```
~~~

```admonish note
これもやっぱり`icon`と`color`はわたしが勝手に入れてます。
```

### Wrap Up

「わざわざ自分で計算しなくても、`gitsigns.nvim`に教えてもらえばいいよねー❗」っていうのが、
`lualine.nvim`の [wiki](https://github.com/nvim-lualine/lualine.nvim/wiki) にある tips でした😆

![lualine Part3](img/lualine-part3-complete.webp)

内部の処理的にも、きっと綺麗になっているはずです☺️

## WinBar

わたしはまだちょっと用途を見出せていないというか、`Tabline`だけで満足しちゃってるので使ってないんですが、
`Winbar`というものがあって、これもやっぱり`lualine.nvim`を使って設定できます。

```admonish info title="[Winbar](https://github.com/nvim-lualine/lualine.nvim#winbar)"
From neovim-0.8 you can customize your winbar with lualine. Winbar configuration is similar to statusline.

neovim-0.8 から lualine で winbar をカスタマイズすることができるようになりました。Winbar の設定は statusline に似ています。
```

## The End

ああ、これで心置きなく2023年に戻れそうです。

戻ったら`packer`やみんなにも教えてあげよう☺️

~~~admonish example title="extensions/init.lua"
```lua
use {
  'nvim-lualine/lualine.nvim',
  config = function() require 'extensions.lualine' end,
  requires = {
    'nvim-tree/nvim-web-devicons', 'rmehri01/onenord.nvim', 'lewis6991/gitsigns.nvim',
  },
}
```
~~~

```admonish success title="Assemble"
これ、"敢えて"❗ 引用するよ❓
```

```admonish success title=""
It means your future hasn’t been written yet.

きみの未来はまだ白紙なんだよ。
```

```admonish success title=""
No one’s has. Your future is whatever you make it.

他の誰でもない。きみの未来はきみが描くんだ。
```

```admonish success title=""
So make it a good one!!

だからこそ良いものにしよう!!
```
