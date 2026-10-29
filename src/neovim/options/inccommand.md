# inccommand

検索の次は置換ですよね〜😆

~~~admonish info title=":h inccommand"
```txt
'inccommand' 'icm' string	(default "nosplit")
                   global

Possible values:
  nosplit	Shows the effects of a command incrementally in the buffer.
          コマンドの効果をバッファにインクリメンタルに表示する。

  split	  Like "nosplit", but also shows partial off-screen results in a preview window.
          "nosplit" に加えて、画面外の結果を部分的にプレビューウィンドウに表示する。
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

これ Karen が歌ったら面白いんじゃない？😆 ってなるのはなんかもう必然の Richard なので、
 "She" 👩を "He" 👨に変えます。
{{footnote:
[The Carpenters](http://www.richardandkarencarpenter.com/SN_TicketToRide.htm) の
デビュー曲は[Ticket to Ride](https://en.wikipedia.org/wiki/Ticket_to_Ride_(song))のアレンジでした。これが1969年のお話。

[Karen Carpenter](https://en.wikipedia.org/wiki/Karen_Carpenter) の歌声について
[John Lennon](https://en.wikipedia.org/wiki/John_Lennon)は、レストランで Karen とすれ違った際、
立ち止まって “I wanna tell you, love, you’ve got a fabulous voice. (きみは本当に素晴らしい声の持ち主だね)” と言ってくれたという。
(by [BBC documentary](https://subsaga.com/bbc/documentaries/music/2007/only-yesterday-the-carpenters-story.html))

[Paul McCartney](https://en.wikipedia.org/wiki/Paul_McCartney)は、
“the best female voice in the world: melodic, tuneful and distinctive. (世界一の女性の歌声だ。メロディーが美しく、音程がよく、個性がある)”
と発言していることが Record Collector 誌の[Richard Carpenter](https://en.wikipedia.org/wiki/Richard_Carpenter)へのインタビュー等で
[紹介](https://recordcollectormag.com/articles/richard-carpenter)されており、Richard も McCartney の評価に "同感だ" と答え、Karen の声を高く評価している。
}}

置換操作は`:%s/{検索値}/{置換値}`とすると実行できます。

```vim
:%s/She/He
```

```admonish note
改めて確認してわたしも初めて知ったんですが😅

`%s`はファイル全体を示しているそうです。`s`とするとカーソル行に絞ってできるとか。へぇ〜😮
```

画面下にプレビューウィンドウが出るようになりました。

![replace1](img/replace1.jxl)

ちょっとこれだとあんまり威力を感じられないんですが、画面に収まってない部分もプレビューできるのが強みです。

![replace2](img/replace2.jxl)

~~~admonish tip
下のようになってたとして、(だいぶ強引ですが) 大文字を含まない "she"でやった場合にあれれー❓ってなるの気付きます？

![replace3](img/replace3.jxl)

そうです。3行目に "she"は2つあるのに、1つ取りこぼししちゃってます😱

実はこのやり方だと同じ行の中では最初にヒットしたところしか反応しません。

こういう場合は、

```vim
:%s/she/he/g
```

...と、`g`オプションを追加してあげると期待通りの結果が得られます。

![replace4](img/replace4.jxl)

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
