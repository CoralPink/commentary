# vim.cmd

この節はまた`Neovim`の方に寄せていきたいので、ヘルプから始めます😉

~~~admonish info title=":h vim.cmd"
```txt
cmd({command})                    vim.cmd()
  Execute Vim script commands.

  Note that `vim.cmd` can be indexed with a command name to return a
  callable function to the command.

  Vim スクリプトのコマンドを実行する。
  コマンド名で `vim.cmd` をインデックス化すると、コマンドを呼び出すための関数を返すことに注意。

  Parameters:
    • {command} string|table Command(s) to execute. If a string, executes
                multiple lines of Vim script at once. In this case, it is
                an alias to |nvim_exec()|, where `output` is set to false.
                Thus it works identical to |:source|. If a table, executes
                a single command. In this case, it is an alias to
                |nvim_cmd()| where `opts` is empty.

                string|table 実行するコマンド。文字列の場合、Vim スクリプトの複数行を一度に実行する。
                この場合は |nvim_exec()| のエイリアスで、`output` は false に設定される。
                したがって、これは |:source| と同じように動作する。
                テーブルの場合、1つのコマンドを実行する。この場合は |nvim_cmd()| のエイリアスで、`opts` は空である。

  See also:
    |ex-cmd-index|
```
~~~

これはサンプルがとっても豊富ですね☺️

~~~admonish info title=":h vim.cmd"
```vim
vim.cmd('echo 42')
vim.cmd([[
 augroup My_group
   autocmd!
   autocmd FileType c setlocal cindent
 augroup END
]])

-- Ex command :echo "foo"
-- Note string literals need to be double quoted.
vim.cmd('echo "foo"')
vim.cmd { cmd = 'echo', args = { '"foo"' } }
vim.cmd.echo({ args = { '"foo"' } })
vim.cmd.echo('"foo"')

-- Ex command :write! myfile.txt
vim.cmd('write! myfile.txt')
vim.cmd { cmd = 'write', args = { "myfile.txt" }, bang = true }
vim.cmd.write { args = { "myfile.txt" }, bang = true }
vim.cmd.write { "myfile.txt", bang = true }

-- Ex command :colorscheme blue
vim.cmd('colorscheme blue')
vim.cmd.colorscheme('blue')
```
~~~

<div class="slider">
  <div class="media">
    ![kawaguchiko-mt-fuji-day](img/kawaguchiko-mt-fuji-day.avif)
    ![kawaguchiko-mt-fuji-night](img/kawaguchiko-mt-fuji-night.avif)
  </div>
</div>

## Try

これは単純に`:なんとか`をコードから実行できる関数です。

こんなのを😮

```vim
:colorscheme blue
```

こんなのに😉

```lua
vim.cmd('colorscheme blue')
```

当然、キーマップに組み込むこともできます。

~~~admonish example
```lua
vim.keymap.set('n', '<Leader>9', function() vim.cmd('colorscheme blue') end)
```
~~~

![blue](img/blue.avif)

めっちゃブルーになりました😺

![saiko](img/saiko.avif)

### (Drop by) colorscheme

せっかく`colorscheme`が出てきたので、少し寄り道していきます。

~~~admonish info title=":h colorscheme"
```txt
:colo[rscheme] {name}	      Load color scheme {name}.
  This searches 'runtimepath' for the file "colors/{name}.(vim|lua)".

  'runtimepath'を検索して、"colors/{name}.(vim|lua) "というファイルを探します。
```
~~~

`color scheme`ファイルは、`runtimepath`の中のどこかにいるらしいので探してみると...、いました😆

![colors](img/colors.avif)

```admonish note
`runtimepath`については`9.Lua Module`で❗
```

`blue.vim`以外にも色々入ってます。

...とはいえ、ネット上を探せばもっといいやついっぱいありますけどね❗

```admonish note
`color scheme` (もしくは`color theme`) はプラグインとして提供されているものも数多くあるので、このサイトでも取り上げます☺️
```

<div class="slider">
  <div class="media">
    ![iyashinosatonenba1](img/iyashinosatonenba1.avif)
    ![iyashinosatonenba2](img/iyashinosatonenba2.avif)
    ![iyashinosatonenba3](img/iyashinosatonenba3.avif)
    ![iyashinosatonenba4](img/iyashinosatonenba4.avif)
  </div>
</div>

## Lua Function

さらに寄り道しちゃいますが、色々総合していくと、こんな書き方ができます。

```lua
vim.keymap.set('n', '<Leader>9', function() vim.cmd.colo 'blue' end)
```

`colorscheme`は`colo`でもいいよーっていうのと、`vim.cmd.colo`みたいな書き方はヘルプにあったので、まあ良いじゃないですか❓

もう一個、なんで`vim.cmd.colorscheme 'blue'`が通るのかって言うと、
こっちは`lua`の仕様で、パラメータが`文字列が一つだけ`である場合は`()`を省略して良いことになってます😉

見た目がシンプルになるので、わたしは積極的に使っていきたいタイプです。
この先でも、しれっとこんな記述をしていくので、よろしくどうぞ😆

```admonish success
`vim.cmd`については、Vim scriptのコマンドをコードから呼び出せるよー❗っていうことが理解できればOKです。

ここまでくると、結構いろいろなことがコードから実行できるって分かるので、楽しくなってきますね😆
```

![hatake-no-kakashi](img/hatake-no-kakashi.avif)

```admonish success title=""
<div style="text-align: center">

VIM.CMD WILL RETURN

vim.cmd は帰ってくる
</div>
```
