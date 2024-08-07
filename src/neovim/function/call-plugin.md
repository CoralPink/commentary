# Call The Plugin

この章もこれで最後です☺️ もうちょっとだけがんばれ❗

## require

少し手順が増えますが、`lesson`ディレクトリを作って、その中に`init.lua`を配置してください。

こんな感じで😉

![make-dir](img/make-dir.webp)

うん😄 そうしたら`lesson/init.lua`にコードを入れておきます。

~~~admonish example title="lesson/init.lua"
```lua
local M = {}

function M.myprint()
  print("You did it! It's working!!")
end

return M
```
~~~

```admonish note
`local M`とかなんやねんっていう疑問は、プラグインを作る側になったら知ることでしょう❗きっと☺️
```

で、これを呼び出したいんですが、結局また`keybinds.lua`を使ってしまいます。

~~~admonish example title="keybinds.lua"
```lua
local lesson = require 'lesson'

vim.keymap.set('n', '<Leader>9', lesson.myprint)
```
~~~

じゃあ、ぽちぽちっと<kbd>Leader</kbd><kbd>9</kbd>で呼んでみましょう...。動くかなぁ〜❓

![call-function5](img/call-function5.webp)

動いたぁ〜❗😆

~~~admonish tip
`local`変数を使わずに以下のように書くこともできます。

```lua
vim.keymap.set('n', '<Leader>9', require('lesson').myprint)
```
~~~

`keymap.set`からプラグインが持っている機能を呼び出すのは、よく見られる使い方です。

## :source と require()

`:source`について、`14.1 Warming Up`で触れたんですが、一個気にしたいことがあって、それが`require`です。

`require`には二度目以降の呼び出しはキャッシュを読みにいくっていう賢いとしか言いようがない仕様があるんですけど、
例えば`require`の先をどんなに更新していようとも、`:so`だと更新前のキャッシュを実行するだけになるみたいなんですね。

```admonish info title="[The require Function](https://www.lua.org/pil/8.1.html)"
require controls whether a file has already been run to avoid duplicating the work.

requireは、ファイルが既に実行されているかどうかを制御し、作業の重複を防ぐ。
```

例えば、`Neovim`を終了させずに下の変更を反映させる方法が見つからない...。

```admonish question
上の項でやった`myprint`の文言を変えて...。

![try-reload1](img/try-reload1.webp)

どこで`:so`しても文言に全く変化がない...。

![try-reload2](img/try-reload2.webp)

```

なので、なんか思った通りいかないー❗ってなっても慌てないで😉

```admonish note
わたしはこの辺りが全く掴めないので、いつも再起動しまくってます😆

...。😢
```

`require`のキャッシュを読み直してるだけっていう可能性を疑ったり、`Neovim`を起動し直して試すっていうことも選択のうちに入れておいて下さい😉

## nvim_create_user_command

もう一個だけやっておきたいのは、独自コマンドからプラグインを使うパターンです。

今度は`nvim`ディレクトリまで上がって、`plugin/lesson`ディレクトリを作成してください。

~~~admonish quote title="Command"
```sh
mkdir -p plugin/lesson
```
~~~

![make-dir2](img/make-dir2.webp)

~~~admonish tip
今回のように、2階層以上のディレクトリを作成したい場合、本来は「親ディレクトリから順に作っていかなければエラー」となりますが、

```sh
# -p を使わないと2手かかる
mkdir plugin
mkdir plugin/lesson
```

`-p`オプションを使用することで、このような手間を回避して一気に作成できます。
~~~

これもあんまり深くは潜らず、さらっとだけやります。

~~~admonish info title=":h nvim_create_user_command"
```txt
nvim_create_user_command({name}, {command}, {*opts})
  Create a new user command |user-commands|

  {name} is the name of the new command. The name must begin with an
  uppercase letter.

  {command} is the replacement text or Lua function to execute.

  新しいユーザーコマンドを作成する |user-commands| 。

  {name} は新しいコマンドの名前。名前は大文字で始まる必要がある。
  {command}は、実行する置換テキストまたはLua関数。
```
~~~

それでは、`nvim/plugin/lesson/init.lua`にコードを書きます。

~~~admonish example title="nvim/plugin/lesson/init.lua"
```lua
vim.api.nvim_create_user_command('Order', function()
  if vim.fn.input('Coffee or beer? > ') == 'beer' then
    vim.cmd.echo '"\nCheers!!"'
  end
end, {})
```
~~~

~~~ admonish note
コードは`:h input`の`Example`から持ってきて、`lua`で動くように書き換えました。

```txt
input({opts})
  The result is a String, which is whatever the user typed on
  the command-line.

  結果は String で、ユーザーがコマンドラインで入力したもの。

  Example:
    :if input "Coffee or beer? " == "beer"
    :  echo " Cheers!"
    :endif
```
~~~

`plugin`ディレクトリに置いた`lua`ファイルは`require`などをしなくても自動で読み込まれます。

```admonish note
これもやっぱり`9. Lua Module`で触れてました。`Runtime files`項です😉
```

じゃあ、実際にオーダーしてみましょう。コマンドから`:Order`と入れてみてください。

```vim
:Order
```

Coffee☕ もいいけど、今日はもう終わりだし beer🍺 でいいよね😆

![beer](img/beer.webp)

乾杯❗🍻

![cheers](img/cheers.webp)

```admonish note
飲み終わったら`plugin`ディレクトリは消しておきましょう。`lesson`ディレクトリとrequire、keymapも忘れずに...。
```

## Wrap Up

本当はもっと`:h packages`で説明されているような、本格的なものを作れたら良かったんだけど、
わたしがその領域にまで達していないので、かなりチープな付け焼き刃になってしまっているんですが、雰囲気くらいは伝わったでしょうか...❓😅

お互い、頑張りましょう🤗

```admonish success
次の章で、ついに...⁉️
```

```admonish success title=""
<div style="text-align: center">
  PLUG-IN WILL RETURN

  プラグインは帰ってくる
</div>
```
