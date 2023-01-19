# telescope.nvim -config-
### which_key

その状態で<kbd>Ctrl</kbd><kbd>h</kbd>とすると操作一覧が現れます。

![telescope-installation](img/telescope-which.png)

`telescope`の検索バーにいる時も`Insert Mode`・`Normal Mode`っていう概念は持ってて、
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

![telescope-installation](img/telescope-which-n.png)

## actions

`telescope`で`Normal Mode`いる❓とか思っちゃった人はこんなのもアリです。

~~~admonish example title="extensions/telescope.lua"
```lua
    mappings = {
      i = {
        ['<C-h>'] = 'which_key',
        ['<esc>'] = require('telescope.actions').close,
      },
    },
```
~~~

こうすると、`Normal Mode`に切り替わらずに`telescope`を抜けられます。

