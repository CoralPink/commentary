# Warming Up

まずはウォーミングアップです😉 少しずついきます。

![chureito](img/chureito.webp)

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

### :source

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

```admonish danger title=""
![raccoon-kills](img/raccoon-kills.webp)

...いや、ばばあ腰抜けてもうてるやないか👵
```

## Try

本題に戻って、ノーマルモードで<kbd>l</kbd><kbd>h</kbd><kbd>s</kbd>と入力してみましょう。

![call-function1](img/call-function1.webp)

...動きましたね❗

```admonish warning
動くことが確認できたら、このコードはすぐ消しときましょう😅

じゃないと、ノーマルモードのカーソル移動 (<kbd>l</kbd>) が挙動不審になっちゃうので❗

(ぶっちゃけサンプルが不親切だと思う...🤫)
```

```admonish danger title=""
ここはかちかち山だから、かちかち鳥が鳴いている 🐦

![kachikachi](img/kachikachi.webp)
```

## Wrap Up

前項みたいなことがあるので、`13.Leader Key`で設定した`Leader`キーを積極的に使っていきましょう😆

```lua
vim.keymap.set('n', '<Leader>l', function() print('Leader key worked too.') end)
```

![call-function2](img/call-function2.webp)

これなら安心ですね❗

```admonish danger title=""
よくもばば...おばあさんを汁にしてじじ...おじいさんに食わせてくれたな❗

![rabbit-vengeance](img/rabbit-vengeance.webp)

トウガラシ入りの味噌を喰らえ❗❗{{footnote:
タヌキのやけどが治ると、最後にウサギはタヌキの食い意地を利用して漁に誘い出した。ウサギは木の船と一回り大きな泥の船を用意し、思っていた通り欲張りなタヌキが「たくさん魚が乗せられる」と泥の船を選ぶと、自身は木の船に乗った。沖へ出たところでウサギは「木の船すいすい、泥船ぶくぶく」と船端を叩きながら歌い、「この歌を歌えば魚がたくさん寄ってくる」とタヌキを騙す。タヌキが教わったとおりに歌いながら船端を思いっきり叩いた途端、泥の船はくずれて沈みだし、タヌキはウサギに助けを求めるが、逆にウサギに「婆様の仇だ、思い知れ!!」と艪で沈められ、海に溺れてタヌキは死に、ウサギは見事に媼の仇を討ったのだった。
[Wikipedia](https://ja.wikipedia.org/wiki/かちかち山)より
}}
```

```admonish success
キー操作に機能(`function`)を割り当てて実行できましたね🤗

ではウォーミングアップも済んだので、`function`を掘り下げていきます。
```
