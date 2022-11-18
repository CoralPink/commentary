# Parameters / Return Values

この節では、もう少し`Function`を深掘りします。

ここで例示しているコードは実用性の無いものだけですが、できれば手元で動かしてみてください。

(そして、終わったら消しておいてください...😅)

## 通常の function を呼び出す

前節では無名関数を右辺に組み込んでいましたが、これはちゃんと名前のある関数を呼び出す形ですね😆

```lua
function testfunc()
  print('i am test function')
end

-- (考えるのが面倒で 3 にしてますが...) キーはなんでも構いません。
vim.keymap.set('n', '<Leader>3', testfunc)
```

![call-function3](img/call-function3.webp)

いい感じ〜❗

```admonish note
もちろん、処理内容が短い場合や、別の場所から呼ばれない関数であれば、無名関数を使えば良いので、
適宜使い分けていきましょう😉
```

## パラメータを渡す

さて、上の項でなんだか急に`keymap.set`がスッキリして見えるのは、この辺りの話が関わってきます。

例えば、これはエラーになります。

~~~admonish error
```lua
function testparam(str)
  print(str)
end

vim.keymap.set('n', '<Leader>4', testparam('hello'))
```
~~~

パラメータを渡す場合は`function()` ~ `end`で囲ってあげないといけないんですね。

```lua
function testparam(str)
  print(str)
end

vim.keymap.set('n', '<Leader>4', function() testparam('hello') end)
```

## 戻り値がある場合

戻り値があるだけの`function`は平気みたいです。

```lua
function testret()
  print 'hello'
  return 'good bye'
end

vim.keymap.set('n', '<Leader>5', testret)
```

ただ、これだと戻り値を全く無視しているので無意味ですよね。...じゃあってことで

```lua
vim.keymap.set('n', '<Leader>5', print(testret()))
```

とかしたくなるんですけど、これは`print()`に "パラメータを渡してる" のでエラーになるやつです😅

...結局、`function()`で囲うところに落ち着くわけです。

```lua
vim.keymap.set('n', '<Leader>5', function() print(testret()) end)
```

## function 呼び出し

関数に`()`があったりなかったりするのはなんでなんだろうなーってなるんですけど、
要は`()`をつけちゃうと`function`型ではなくてこの`functionの戻り値`の型は何かなー❓って判断をしに行っちゃうんですね😮

今回は`vim.keymap.set()`を使用しているので、これをもう一回見返して欲しいんですけど、

~~~admonish info title=":h keymap.set"
```
  • {rhs}   string|function
```
~~~

これ、一回動かしてみればわかると思うんですが...、

~~~admonish error
```lua
-- "通常の function を呼び出す" 項で作った testfunc() を呼び出す
vim.keymap.set('n', '<Leader>6', testfunc())
```
~~~

![call-function4](img/call-function4.webp)

`rhs: expected string|function, got nil`って言われちゃいます😩

`testfunc()`は戻り値が無いので`nil`ですね😰...ごもっとも過ぎて、ぐうの音も出ないやつ。

```admonish note
付け加えて言うと、`testfunc()`自体はちゃんと動作してるので、ここから返した後にエラーが起きたってことですよね。
```

それに対して、こんなのとかはちゃんと動きます。

```lua
-- string を返す
function testcall1()
  return ':'
end

-- function を返す
function testcall2()
  return testfunc
end

vim.keymap.set('n', '<Leader>7', testcall1())
vim.keymap.set('n', '<Leader>8', testcall2())
```

`keymap.set`の`{rhs}`が`testcall1()`は`string`、`testcall2()`は`function`で戻ってくるのでOKです❗

ちゃんと`<leader>7`でコマンドモードに入ったり、`<Leader>8`でお返事されたりしますよね☺️

```admonish note
これだけだと実用性ゼロなコードにしか見えないんですけど、例えば「状態によって実行する処理を変える」とかやりたい時に使えそうですね。
```

```admonish success
この辺りは言葉にしちゃうとややこしい感じがしないでもないんですけど、使っていればすぐに慣れると思います😆

実際、わたしは割と感覚で書いています...😅
```

```admonish success title=""
<div style="text-align: center">
  FUNCTION WILL RETURN

  ファンクションは帰ってくる
</div>
```
