# Warming Up

まずはウォーミングアップです😉 少しずついきます。

## keymap

まずは`12. Key Binding`で触れた`keymap`から呼び出してみましょう。

~~~admonish info title=":h keymap.set"
```txt
set({mode}, {lhs}, {rhs}, {opts})                           vim.keymap.set()
    Parameters:
      • {rhs}   string|function Right-hand side |{rhs}| of the mapping. Can
                also be a Lua function.

                マッピングの右辺|{rhs}|。Luaの関数でも可。
```
~~~

ちょっと動かしてみたいだけ (あとで削除する前提) なのでどこでもいいんですが、まあ`keybinds.lua`で進めます。

ヘルプの中にあったコードそのままですが、入れてみてください。

~~~admonish example
```lua
vim.keymap.set('n', 'lhs', function() print("real lua function") end)
```
~~~

### source

いきなり少し寄り道します。

ここで初めて登場するんですが、`:source`というコマンドがありまして...🤔

~~~admonish info title=":h source"
```txt
            :so :source load-vim-script
:[range]so[urce] [file]	Runs |Ex| commands or Lua code (".lua" files) from
                             |Ex|コマンドまたは Lua コード (".lua" ファイル) を [file] から実行する。

      [file], or current buffer if no [file].
      [ファイル] を実行する。[ファイル] がない場合は、現在のバッファを実行する。
```
~~~

例えば、これまだ上のコードを入れてない状態なんですけど、一回`:map`を見てみます。

![source1](img/source1.webp)

で、コード追加してセーブするじゃないですか。

![source2](img/source2.webp)

で、

~~~admonish quote title="Command"
```lua
:so
```

または

```lua
:source
```
~~~

![source3](img/source3.webp)

そしたらもう一回`:map`を見てみます。

![source4](img/source4.webp)

あ、`lhs`いる😮

ヘルプが言っているところの「現在のバッファを実行する」がちゃんと動いてますね。
`keybinds.lua`のバッファで`:so`を実行しているので`keybinds.lua`が実行されてます😉

気をつけないといけないのは、これが "リフレッシュ" とか "再起動" ではなくて、あくまでも`実行`であることです。
あんまり自信が無いんですけど、`keymap`の変更についてはちゃんと反映されてるようです。

..."については"と言っているのは、ちょっと気にしておきたいことがあって...。
意味なく引っ張るようなんですが、`14.4 Call The Plugin`で改めて触れたいと思ってます😌

```admonish tip
ちなみに言うと、この辺りが恐らく`augroup`の`clear`の話だと思うんですが、どうでしょう❓
```

## 実行

本題に戻って、ノーマルモードで<kbd>l</kbd><kbd>h</kbd><kbd>s</kbd>と入力してみましょう。

![call-function1](img/call-function1.webp)

...動きましたね❗

```admonish warning
動くことが確認できたら、このコードはすぐ消しときましょう😅

じゃないと、ノーマルモードのカーソル移動 (<kbd>l</kbd>) が挙動不審になっちゃうので❗

(ぶっちゃけサンプルが不親切だと思う...🤫)
```

## Leader キーを使った Keymap

前項みたいなことがあるので、`13.Leader Key`で設定した`Leader`キーを積極的に使っていきましょう😆

```lua
vim.keymap.set('n', '<Leader>l', function() print('Leader key worked too.') end)
```

![call-function2](img/call-function2.webp)

これなら安心ですね❗

## Wrap Up

```admonish success
キー操作に機能(`function`)を割り当てて実行できましたね🤗

ではウォーミングアップも済んだので、`function`を掘り下げていきます。
```
