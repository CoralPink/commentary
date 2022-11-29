## scrolloff

さて、次はこんなのが飛び出してきました❗もはやルーティンですね😌

~~~admonish info title=":h scrolloff"
```
'scrolloff' 'so'
'scrolloff' 'so'    number	(default 0)
	                global or local to window |global-local|

	Minimal number of screen lines to keep above and below the cursor.
	This will make some context visible around where you are working.  If
	you set it to a very large value (999) the cursor line will always be
	in the middle of the window (except at the start or end of the file or
	when long lines wrap).

	カーソルの上下に表示する最小限のスクリーンライン数。
	これにより、作業している場所の周辺にあるコンテキストを表示することができる。もし
	非常に大きな値(999)を設定すると、カーソル行は常にウィンドウの中央に位置する。
    (ファイルの先頭または末尾、あるいは長い行が折り返される場合を除く)。
```
~~~

~~~admonish example title="options.lua"
```lua
vim.api.nvim_set_option('scrolloff', 4)
```
~~~

デフォルト値`0`の場合は、画面の上下端まで行かないと行スクロールしませんが、
`1`以上を指定すると指定行数分の余裕を持って手前でスクロールします。

下から数えて5行目の位置から`4`行目に移動しようとすると...、

![scrolloff1](img/scrolloff1.webp)

カーソル移動ではなく、本文が`行スクロール`する。

![scrolloff2](img/scrolloff2.webp)

文字で説明するとイメージが難しいんですが、`0`の状態と比べて動かしてみれば、すぐに意味はわかると思います😸

```admonish note
ヘルプには「グローバルもしくはローカルのウィンドウ」みたいな記述がありますが、この例ではグローバルに設定しています。
```

```admonish success
もし文法だったりパラメータが間違っていた場合は起動時にエラーが出るはずです。

エラーが出ていなければ多分OKなので、どんどんいきましょう😆
```
