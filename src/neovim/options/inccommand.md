# inccommand

検索の次は置換ですよね〜😆

~~~admonish info title=":h inccommand"
```
'inccommand' 'icm'

'inccommand' 'icm'	    string	(default "nosplit")
			                global

	Possible values:
		nosplit	Shows the effects of a command incrementally in the
			buffer.
		split	Like "nosplit", but also shows partial off-screen
			results in a preview window.

    受け取る値
        nosplit コマンドの効果をバッファにインクリメンタルに表示する。
        split   "nosplit" に加えて、画面外の結果を部分的にプレビューウィンドウに表示する。
```
~~~

~~~admonish example title="options.lua"
```lua
vim.api.nvim_set_option('inccommand', 'split')
```
~~~

じゃあ、また動かしてみましょう。

```admonish abstract title="文章例"
She's got a ticket to ride, but she don’t care.
```

これ Karen が歌ったら面白いんじゃない？😆 ってなるのはなんかもう必然の Richard ですので、
`She`👩を`He`👨に変えます。[^1]

置換操作は`:%s/{検索値}/{置換値}`とすると実行できます。

```
:%s/She/He
```

```admonish note
改めて確認してわたしも初めて知ったんですが😅

`%s`はファイル全体を示しているそうです。`s`とするとカーソル行に絞ってできるとか。へぇ〜😮
```

画面下にプレビューウィンドウが出るようになりました。

![replace1.webp](img/replace1.webp)

ちょっとこれだとあんまり威力を感じられないんですが、画面に収まってない部分もプレビューできるのが強みです。

![replace2.webp](img/replace2.webp)

~~~admonish tip
下のようになってたとして、(だいぶ強引ですが) 大文字を含まない`she`でやった場合にあれれー❓ってなるの気付きます？

![replace3.webp](img/replace3.webp)

そうです。3行目に`she`は2つあるのに、1つ取りこぼししちゃってます😱

実はこのやり方だと同じ行の中では最初にヒットしたところしか反応しません。

こういう場合は、
```
:%s/she/he/g
```
...と、`g`オプションを追加してあげると期待通りの結果が得られます。

![replace4.webp](img/replace4.webp)

割とあるシチュエーションだと思うので、覚えておくと役に立ちます😉
~~~

```admonish question
本当は、あと`but`を`and`に変えるらしいです。通例なんだって。...なんで❓😮
```

```admonish success
なんだか本題を忘れそうになりますが...。

プレビューウィンドウを表示する❗がこの項の目的でした😅

まあ気楽にいきましょう😸
```

[^1]:[The Carpenters](http://www.richardandkarencarpenter.com/SN_TicketToRide.htm) の
デビュー曲は[Ticket to Ride](https://en.wikipedia.org/wiki/Ticket_to_Ride_(song))のアレンジでした。これが1969年のお話。
Richard が`vi`とかで歌詞置換してたらウケる〜🤣 とか思って見たら[vi](https://ja.wikipedia.org/wiki/Vi)ですら初版が1976年...。
`Neovim`どころか`Vim`どころか、`vi`ですら意外と新しい😲 ...そうでもないかぁ😮
