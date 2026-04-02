# nvim_create_autocmd

いつだっておじさんは熱くアドバイスしてくれます☺️

~~~admonish info title=":h nvim_create_autocmd"
```txt
nvim_create_autocmd({event}, {*opts}) nvim_create_autocmd()
                                      Create an |autocommand|

  The API allows for two (mutually exclusive) types of actions to be
  executed when the autocommand triggers: a callback function (Lua or
  Vim script), or a command (like regular autocommands).

  このAPIでは、オートコマンドのトリガー時に実行されるアクションとして、
  コールバック関数（LuaまたはVim script）、
  またはコマンド（通常のオートコマンドと同様）の
  2種類（相互に排他的）を指定することができる。
```

```lua
  -- Example using callback:

  local myluafun = function() print("This buffer enters") end

  vim.api.nvim_create_autocmd({"BufEnter", "BufWinEnter"}, {
    pattern = {"*.c", "*.h"},
    callback = myluafun,
  })
```
~~~

ヘルプではもっと色々なサンプル付きで説明されていますが、今回はここで切り上げます😅

![コダック](img/koduck.webp)

## autocmd

現時点で`autocmd`がどのように登録されているのかは、以下のコマンドを実行してみると確認できます。

~~~admonish quote
```vim
:au
```

または

```vim
:autocmd
```
~~~

![aucmd-before](img/aucmd-before.webp)

こんな感じに出てきたでしょうか。

```admonish note
スクリーンショットの環境が突然変わったことは気にしないでください😺
```

ここに、自分で作った`autocmd`を追加して「全てのバッファに対して`tab`関連の設定をするぞ❗」というのが
この節の趣旨であり、これこそが[10.3.1](../options/tab.md)項の問題を解決する方法です。

準備はよろしいでしょうか❓

![ピカチュウ](img/pikachu.webp)

...OK❓

それでは、例によって一つずつ確認していきます。

### event

まずは`event`なんですが、`autocmd-events`がこれでしょう🤔

~~~admonish info title=":h autocmd-events"
```txt
5. Events           autocmd-events E215 E216

You can specify a comma-separated list of event names.
No white space can be used in this list.
The command applies to all the events in the list.

イベント名のリストをカンマ区切りで指定することができる。
このリストには空白を使用できない。
コマンドは、リスト内のすべてのイベントに適用される。
```
~~~

で、上の例で使用されていた`BufEnter`と`BufWinEnter`だけ抜粋すると以下です。

~~~admonish info title=":h BufEnter"
```txt
After entering a buffer.  Useful for setting
options for a file type.  Also executed when
starting to edit a buffer.

バッファに入った後。
ファイルタイプに応じたオプションを設定するのに便利。
また、バッファの編集を開始するときにも実行される。
```
~~~

~~~admonish info title=":h BufWinEnter"
```txt
After a buffer is displayed in a window.  This
may be when the buffer is loaded (after
processing modelines) or when a hidden buffer
is displayed (and is no longer hidden).

バッファがウィンドウに表示された後。
これは、バッファが読み込まれたとき (モデリング処理後) か、
非表示のバッファが表示されたとき(そして非表示でなくなったとき) かもしれない。

Not triggered for |:split| without arguments,
since the buffer does not change, or :split
with a file already open in a window.
Triggered for ":split" with the name of the
current buffer, since it reloads that buffer.

引数なしの |:split| や、
すでにウィンドウで開いているファイルとの :split では、
バッファは変更されないためトリガーされない。
現在のバッファの名前を指定した ":split" では、
バッファを再読み込みするためトリガーが発生する。
```
~~~

### pattern

次は`pattern`です。これは`file-pattern`として説明されています😌

~~~admonish info title=":h file-pattern"
```txt
The pattern is interpreted like mostly used in file names:
このパターンは、ファイル名によく使われるものと同じように解釈される。

  *         matches any sequence of characters;
            Unusual: includes path separators

  ?         matches any single character
  \?        matches a '?'
  .         matches a '.'
  ~         matches a '~'
  ,         separates patterns
  \,        matches a ','
  { }       like \( \) in a |pattern|
  ,         inside { }: like \| in a |pattern|
  \}        literal }
  \{        literal {
  \\\{n,m\} like \{n,m} in a |pattern|
  \         special meaning like in a |pattern|
  [ch]      matches 'c' or 'h'
  [^ch]     match any character but 'c' and 'h'
```
~~~

### callback

最後に`callback`ですが、これは`nvim_create_autocmd`の中に記述が見つかります。

~~~admonish info title=":h nvim_create_autocmd"
```txt
Lua function which is called when this autocommand is triggered.
Cannot be used with {command}.

このオートコマンドが起動した際に呼び出されるLua関数。
{コマンド}とは併用できない。
```
~~~

## Try!

これらを踏まえて、改めて今回やりたいことを明確にすると、

- `event`: バッファに入った際に
- `pattern`: 全てのファイル(パターン)に対して
- `callback`: `nvim_buf_set_option`を通して`tab`関連の設定をする

...に、なります。

`event`については、ヘルプ内で例示を行ってくれているので、そのまま採用します。(助かったぁ😆)

あとはもう、`pattern`は簡単だし、`callback`は既に書いたコードを持ってくれば良いだけですね😉

~~~admonish example title="options.lua"
```lua
vim.api.nvim_create_autocmd({ 'BufEnter', 'BufWinEnter' }, {
  pattern = '*',
  callback = function()
    -- 10.3.1 節で書いたコードをここに移動する
    vim.api.nvim_buf_set_option(0, 'tabstop', 2)
    vim.api.nvim_buf_set_option(0, 'shiftwidth', 0)
    vim.api.nvim_buf_set_option(0, 'expandtab', true)
  end,
})
```
~~~

```admonish note
`BufWinEnter`が必要になるのかが判然としませんが...、どうなんだろう😅
```

~~~admonish tip
`pattern`のデフォルトは`'*'`らしいので、実は省略できちゃいます😉
~~~

それでは、`nvim`を再起動して、もう一度`:au`を実行してみましょう...。

![aucmd-after](img/aucmd-after.webp)

`options.lua`に書いたイベントが登録されていることが確認できましたね❗

編集画面に戻って適当にタブ入力をしてみてください。タブ幅の設定は反映されていますか❓

...されてますよね⁉️

## Wrap Up

ここまで来れば、とりあえずは期待する動作が得られているはずです😆

...、あ、えっと、"とりあえず" と言っているのには理由があって...。

<video preload="none" width="1280" height="720" data-poster="img/pokemon-card-thumbnail.webp">
  <source src="img/pokemon-card.webm" type="video/webm">
  Your browser does not support the video/webm.
</video>

なんだか長くなってきたので、もう一回だけ続く...❗🙀

```admonish success
疲れたらちゃんと休憩とってね ☕
```
