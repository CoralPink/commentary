# for Nvim 0.10

突然ですがニュースです。

ニュースとは言うものの最新ではないです❗最先端からは遅れてます😅

~~~admonish info title="news"
```txt
Notable changes in Nvim 0.10 from 0.9                                    *news*

For changes in Nvim 0.9, see |news-0.9|.

                                       Type |gO| to see the table of contents.
```
~~~

## Added Features

これちょっと面白いやつ。

~~~admonish info title=":h news-added"
```txt
ADDED FEATURES                                                     *news-added*

The following new APIs or features were added.

以下の新しいAPIや機能が追加されました。

• vim.iter() provides a generic iterator interface for tables and Lua
iterators luaref-in.

テーブルとLuaのための汎用イテレータインターフェースを提供する
```
~~~

### vim.iter()

書いてあることそのままなんですが、`Nvim 0.10`からはこんな書き方ができるようになります。

```admonish note
次項より使用しているサンプルコードは
[15.11.1 Actions](../plugin/nvim-tree-actions.html) 節で作成したものです。
```

```admonish warning
[Nvim development (prerelease) build](https://github.com/neovim/neovim/releases/nightly)
など、`v0.10.0`以降で有効です。

🔺 2023/04/30現在の`Stable Release`は`v0.9.0`です。
```

#### createTreeActions

~~~admonish quote title="Nvim 0.9"
```lua
local function createTreeActions()
  for _, cmd in pairs(command) do
    table.insert(menuCommand, { name = cmd[3], handler = cmd[2] })
  end
end
```
~~~

~~~admonish example title="Nvim 0.10"
```lua
local function createTreeActions()
  vim.iter(command):map(function(x)
    table.insert(menuCommand, { handler = x[2], name = x[3] })
  end)
end
```
~~~

誰もが「なんやこいつ😮」と思っていた`_`がいなくなりました。

#### on_attach

~~~admonish quote title="Nvim 0.9"
```lua
function M.on_attach(bufnr)
  local opts = function(desc)
    return { desc = 'nvim-tree: ' .. desc, buffer = bufnr, nowait = true }
  end

  for _, cmd in pairs(command) do
    if (string.len(cmd[1]) > 0) then
      vim.keymap.set('n', cmd[1], cmd[2], opts(cmd[3]))
    end
  end
end
```
~~~

~~~admonish example title="Nvim 0.10"
```lua
function M.on_attach(bufnr)
  local opts = function(desc)
    return { desc = 'nvim-tree: ' .. desc, buffer = bufnr, nowait = true }
  end

  vim
    .iter(command)
    :filter(function(x)
      return string.len(x[1]) > 0
    end)
    :map(function(x)
      vim.keymap.set('n', x[1], x[2], opts(x[3]))
    end)
end
```
~~~

上の例は`Stylua`に素直に従っているのですが、
わたしはこの改行位置に、若干のクセを感じざるを得ません❗

まあ、そこはお好みで😉

## Wrap Up

効率面とか速度面で見た場合に優位性があるのかどうかは、
ぶっちゃけよく知らないんですが...。

```admonish success title="Assemble"
でも、なんかエレガント🩷👗
```
