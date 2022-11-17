# wrap / colorcolumn

前回使われていたスクリーンショットの中に、こんなのが見切れていました。

~~~admonish example title="options.lua"
```lua
vim.api.nvim_win_set_option(0, 'wrap', false)
```
~~~

これは今までとは違うパターンで、デフォルトで有効にされているものを無効化してます。

なんか "かいパ"🙊 ...あ、いえ、なんでもないです😅

~~~admonish info title=":h wrap"
```
    					    'wrap' 'nowrap'

'wrap'                  boolean (default on)
                        local to window

	This option changes how text is displayed.  It doesn't change the text
	in the buffer, see 'textwidth' for that.

    このオプションは、テキストの表示方法を変更する。
    バッファ内のテキストは変更されないので、それについては 'textwidth' を参照すること。

	When on, lines longer than the width of the window will wrap and
	displaying continues on the next line.  When off lines will not wrap
	and only part of long lines will be displayed.  When the cursor is
	moved to a part that is not shown, the screen will scroll
	horizontally.

    on の場合、ウィンドウの幅より長い行は折り返され、次の行に表示される。
    off の場合、行は折り返されず、長い行の一部分のみが表示される。
    表示されていない部分にカーソルを移動すると、画面が水平方向にスクロールする。
```
~~~

ぶっちゃけこれが必要になるのって、そもそもテキストが変なんじゃないかと思うので、わたしは無効化しちゃってます🙈

~~~admonish note
無効にする場合は`sidescroll`などを変えると便利になるよ❗...と、
`wrap`のヘルプに書いてくれているので、参考にしてみると良いと思います😉

```
To make scrolling horizontally a bit more useful, try this:  
		:set sidescroll=5
		:set listchars+=precedes:<,extends:>
See 'sidescroll', 'listchars' and |wrap-off|.
```

...わたしは今気づいたので、また今度試してみます。
~~~

むしろ、変なファイルを作らないためのマナーに働きかけるものとして、`colorcolumn`を活用する方がいいと思います。

~~~admonish info title=":h colorcolumn"
```
						    *'colorcolumn'* *'cc'*

'colorcolumn' 'cc'          string (default "")
                            local to window

    'colorcolumn' is a comma-separated list of screen columns that are highlighted with
    ColorColumn |hl-ColorColumn|. Useful to align text.  Will make screen redrawing slower.

    'colorcolumn' はColorColumn |hl-ColorColumn| でハイライトされる画面列のカンマ区切りリストです。
    テキストを整列させるのに便利。ただ、画面の再描画が遅くなる。

    The screen column can be an absolute number, or a number preceded with '+' or '-',
    which is added to or subtracted from 'textwidth'. 

    スクリーンカラムは絶対値か、'+' または '-' で始まる数値で、'textwidth' に加算または減算される。
```
~~~

使い方としてはこんなんです。

```lua
vim.api.nvim_win_set_option(0, 'colorcolumn', '100')
```

~~~admonish warning
パラメータが`string`となっているところに注意🤫
~~~

こんな感じで100文字目の列を教えてくれます。

![colorcolumn.webp](img/colorcolumn.webp)

ただ、これはなんか、再描画遅くなるとも書いてあるし😅 そんなに出しとく必要ある〜❓とか思っちゃうので、
~~~admonish quote title="有効化(100文字目にハイライト)"
```
:set cc=100
```
~~~

~~~admonish quote title="無効化"
```
:set cc=
```
~~~

...っていう運用にしていくのもいいんじゃないかな〜、なんて思ってるんですが、どうでしょう❓

~~~admonish note
パラメータが`string`なのに、なんで
```
:set cc=100
```
...でいいんだよー⁉️ってなるじゃないですか❓わたしもなってます。

正直この辺りの理屈、よく分かってません...😓
~~~

```admonish success
`window option`の設定は、ひとまずここまでです🤗

わたしもまだ色々試している最中の`Neovim`トレーナーなので、
気まぐれに増やしたり減ったりしていくかもしれませんが、ゆる〜くお付き合いください☺️

ただ、ローカルオプションとしてはまだ`buffer`というものがおりまして...🐃🐃🐃

ぶっちゃけ自信が無いところなんですが...、まあ、その辺りも含めて、また次回😉
```

```admonish success title=""
いけ❗　いけるかぎり　どこまでも

せかいを　ひろげるのは　きみじしんさ
```
