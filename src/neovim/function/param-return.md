# Parameters / Return Values

この節では、もう少し`Function`を深掘りします。

ここで例示しているコードは実用性の無いものだけですが、できれば手元で動かしてみてください。

(そして、終わったら消しておいてください...😅)

![musicforest-foutain](img/musicforest-foutain.webp)

```admonish info title=""
A dream is a wish your heart makes{{footnote:
A Dream Is a Wish Your Heart Makes は[Walt Disney](https://en.wikipedia.org/wiki/Walt_Disney)film の
1950年の映画[Cinderella](https://en.wikipedia.org/wiki/Cinderella_(1950_film))のために
[Mack David](https://en.wikipedia.org/wiki/Mack_David),
[Al Hoffman](https://en.wikipedia.org/wiki/Al_Hoffman),
[Jerry Livingston](https://en.wikipedia.org/wiki/Jerry_Livingston)が作詞・作曲した曲である。

シンデレラは劇中で、友達の動物たちに "夢見ることをやめないように" と励ましている。これは物語全体を通して続くテーマでもある。
この曲は[Franz Liszt](https://en.wikipedia.org/wiki/Franz_Liszt)の
[Transcendental Étude No. 9](https://en.wikipedia.org/wiki/Transcendental_Étude_No._9_(Liszt))にインスパイアされており、
詞にあるテーマとしては 1940年の[Pinocchio](https://en.wikipedia.org/wiki/Pinocchio_(1940_film))の
[When You Wish Upon a Star](https://en.wikipedia.org/wiki/When_You_Wish_Upon_a_Star)で表現された感情を想起させる。

夢と願いを同一視するシンデレラの歌う詞が約束するように、
叶う "夢" と比喩的な意味で 眠りの中で見る "夢" という言葉を使っており、
When You Wish Upon A Star や、他の Disney 作品でも同じ約束をしている。

"When you're fast asleep" という文字通りの意味 ("眠りの中で見る夢") としては、
1959年の[Sleeping Beauty](https://en.wikipedia.org/wiki/Sleeping_Beauty_(1959_film))で歌われる
[Once Upon a Dream (Sleeping Beauty song)](https://en.wikipedia.org/wiki/Once_Upon_a_Dream_(Sleeping_Beauty_song))で再び登場する。
[Wikipedia](https://en.wikipedia.org/wiki/A_Dream_Is_a_Wish_Your_Heart_Makes)より
}}

夢ってね あなたの心が描く願いごとなんだよ
```

## Function

前節では`無名関数`を右辺に組み込んでいましたが、これはちゃんと名前のある`関数`を呼び出す形ですね😆

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
もちろん、別の場所から呼ばれない関数であれば``無名関数``を使えば良いので、
適宜使い分けていきましょう😉
```

```admonish info title=""
When you're fast asleep

In dreams, you will lose your heartaches

そっと眠りについたのなら

そこはもう夢の中、心の痛みなんてもうなくって
```

![musicforest-doll](img/musicforest-doll.webp)

## Parameter

さて、上の項でなんだか急に`keymap.set`がスッキリして見えるのは、この辺りの話が関わってきます😌

例えば、これはエラーになります。

~~~admonish error
```lua
function testparam(str)
  print(str)
end

vim.keymap.set('n', '<Leader>4', testparam('hello'))
```
~~~

パラメータを渡す場合は`function()` ~ `end`で囲ってあげないといけないんですね🤔

```lua
function testparam(str)
  print(str)
end

vim.keymap.set('n', '<Leader>4', function() testparam('hello') end)
```

```admonish info title=""
Whatever you wish for, you keep

その願いはそっと膨らんでいるんだよ
```

```admonish warning title=""
<video controls preload="none" width="1280" height="720" poster="img/musicforest-opera-thumbnail.webp">
  <source src="img/musicforest-opera.webm" type="video/webm">
  Your browser does not support the video/webm.
</video>
```

## Return Value

戻り値があるだけの`function`は平気みたいです。

```lua
function testret()
  print 'hello'
  return 'good bye'
end

vim.keymap.set('n', '<Leader>5', testret)
```

ただ、これだと戻り値を全く無視しているので無意味ですよね😮 ...じゃあってことで

```lua
vim.keymap.set('n', '<Leader>5', print(testret()))
```

とかしたくなるんですけど、これは`print()`に "パラメータを渡してる" のでエラーになるやつです😅

...結局、`function()`で囲うところに落ち着くわけです。

```lua
vim.keymap.set('n', '<Leader>5', function() print(testret()) end)
```

![musicforest](img/musicforest.webp)

```admonish info title=""
Have faith in your dreams and someday

Your rainbow will come smiling through

夢を信じていれば いつの日か

微笑みにも似た虹が 夢へと続く橋をかける
```

## Call

関数に`()`があったりなかったりするのはなんでなんだろうなーってなるんですけど、
要は`()`をつけちゃうと`function`型ではなくてこの`functionの戻り値`の型は何かなー❓って判断をしに行っちゃうんですね😮

今回は`vim.keymap.set()`を使用しているので、もう一回ヘルプを見返して欲しいんですけど、

~~~admonish info title=":h keymap.set"
```txt
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

```admonish info title=""
No matter how your heart is grieving

If you keep on believing

たとえ どんなに心が悲しみに染まっても

ずっと信じていれば
```

## A Dream Is a Wish Your Heart Makes

この辺りは言葉にしちゃうとややこしい感じがしないでもないんですけど、使っていればすぐに慣れると思います😆

実際、わたしは割と感覚で書いています...😅

```admonish info title=""
<video controls preload="none" width="1280" height="720" poster="img/musicforest-sandart-thumbnail.webp">
  <source src="img/musicforest-sandart.webm" type="video/webm">
  Your browser does not support the video/webm.
</video>

The dream that you wish will come true

あなたの願った夢は きっと叶う
```

```admonish success
<div style="text-align: center">

FUNCTION WILL RETURN

ファンクションは帰ってくる
</div>
```
