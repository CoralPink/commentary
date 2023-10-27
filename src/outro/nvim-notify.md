# nvim-notify

前回は暑いとか言ってた気がしますが、なんか急に寒くなってきました🥶

もう2023年もだいぶ後半だもんねー。

まだ時々暑いけどねー😆

...。🙂

今だ❗`nvim-notify`❗❗

```admonish info title="[nvim-notify](https://github.com/rcarriga/nvim-notify)"
A fancy, configurable, notification manager for NeoVim

NeoVim のための、設定可能でファンシーな通知マネージャ
```

```admonish info title=""
Credit to [sunjon](https://github.com/sunjon) for
[the design](https://neovim.discourse.group/t/wip-animated-notifications-plugin/448) that inspired the appearance of this plugin.

このプラグインの外観を[デザイン]((https://neovim.discourse.group/t/wip-animated-notifications-plugin/448))した
[sunjon](https://github.com/sunjon) の功績は大きい。
```

細かいことはいいんです😉

## Installation

もう簡単だとは思うんですが、それでも順番に辿っていきましょう😇

### Prerequisites

```admonish info title="[Prerequisites](https://github.com/rcarriga/nvim-notify/blob/master/README.md#prerequisites)"
Make sure to use a font which supported glyphs (icons), font can be found [here](https://github.com/ryanoasis/nerd-fonts).

必ずグリフ（アイコン）をサポートしているフォントを使用してください。フォントはこちらで見つけることができます。
```

フォントはもう何度も出てきているので大丈夫でしょ❓

~~~admonish info title=""
24-bit colour is required, which can be enabled by adding this to your init.lua

24ビットカラーが必要です。init.luaに以下を追加することで有効にできます。

```lua
vim.opt.termguicolors = true
```
~~~

24ビットカラーについては、このサイトでも
[termguicolors](https://coralpink.github.io/commentary/neovim/options/termguicolors.html) ページで取り上げてます。

...いるんですが、このサイトで取り上げた`vim.api.nvim_set_option`は、もうだいぶ以前から`deprecated`とされています。

~~~admonish info title=":h deprecated"
```txt
Nvim                                                            deprecated

The items listed below are deprecated: they will be removed in the future.
They should not be used in new scripts, and old scripts should be updated.

以下の項目は非推奨であり、将来削除される予定です。
新しいスクリプトでは使用せず、古いスクリプトは更新してください。
```

```txt
- nvim_set_option()        Use nvim_set_option_value() instead.
```
~~~

なんだかこれまでよりも冗長に見えているので、いまいち自信が無いんですが...😅

`nvim_set_option_value()`を使用する場合は

```lua
vim.api.nvim_set_option_value('termguicolors', true, { scope = 'global' })
```

みたいな❓

~~~admonish tip
`nvim_set_option()`に限らず、"nvim_なんちゃら_set_option" については`nvim_set_option_value`に統一されるそうです。

```txt
- nvim_buf_set_option()    Use nvim_set_option_value() instead.
- nvim_win_set_option()    Use nvim_set_option_value() instead.
```

`Nvim 0.11.0`とかになるとわからないけど、次の`Nvim 0.10.0`でも削除されていないので、まだしばらくはだいじょーぶ😙

...たぶん🥹

> とは言ってもやっぱり流れには乗っていかなきゃね❗
>
> `nvim_set_option_value`については次回取り上げることにします😉
~~~

```admonish info title=""
Then you can install nvim-notify with the package manager of your choice.

その後、お好みのパッケージ・マネージャーで nvim-notify をインストールしてください。
```

念のため`lazy.nvim`でのインストールを補足しますが、特に難しいこともありませんね😇

~~~admonish example title="extensions/init.lua"
**lazy:**

```lua
{
  'rcarriga/nvim-notify',
},
```
~~~

## Usage

簡単だ❗

~~~admonish info title="[Usage](https://github.com/rcarriga/nvim-notify#usage)"
Simply call the module with a message!

メッセージを添えてモジュールを呼び出すだけだ！

```lua
require("notify")("My super important message")
```
~~~

~~~admonish info title=""
Other plugins can use the notification windows by setting it as your default notify function

デフォルトの通知機能として設定することで、他のプラグインも通知ウィンドウを使用することができます。
~~~

ということで、通知はすべて`nvim-notify`にお願いしよう❗😆

~~~admonish example title="extensions/nvim-notify"
```lua
local notify = require 'notify'

notify.setup()

vim.notify = notify
```
~~~

```admonish warning
オフィシャルでは特に書かれていないんだけど、
わたしの環境では `setup()`を呼ばないと上手く動かないところがありました。

入れておいた方が安全かも。
```

~~~admonish example title="extensions/init.lua"
```diff
 {
   'rcarriga/nvim-notify',
+  config = function() require 'extensions.nvim-notify' end,
 },
```
~~~

そしたらもう呼び出すだけだ❗

前回の使い回しだけど、こんなのとか❗

![lazy-checker](img/lazy-checker.webp)

通知で遊んでみたりとか❗

![nvim-notify](img/nvim-notify.webp)

しれっと[こんなの](../neovim/lsp/copilot.html#cleared-for-takeoff-good-day)も仕込まれていたりとか😮

![takeoff](img/takeoff.webp)

これだけ動いていれば、確認はもう充分すぎるでしょう☺️

## Viewing History

時々、「あの時に出ていた通知、なんだったんだ...😣」ってなこともあるかと思いますが、
このコードを追加しておけばだいじょーぶ😉

```admonish info title="[Viewing History](https://github.com/rcarriga/nvim-notify#viewing-history)"
If you have [telescope.nvim](https://github.com/nvim-telescope/telescope.nvim)
installed then you can use the `notify` extension to search the history:

[telescope.nvim](https://github.com/nvim-telescope/telescope.nvim) がインストールされていれば、
`notify`拡張機能を使って履歴を検索することができます：
```

~~~admonish example title="extensions/nvim-notify.lua"
```lua
local telescope = require('telescope')
telescope.load_extension 'notify'

vim.keymap.set('n', '<leader>fn', function()
  telescope.extensions.notify.notify()
end)
```
~~~

あ、もちろん`<leader>fn`は好きに変えてもらえばおっけーです😸

![nvim-notify-history](img/nvim-notify-history.webp)

ほらねー。

# Now and Then

ということで、`nvim-notify`はこれで完了です❗

正直、ちょっと端折りすぎてるかなーっていう感じは否めませんが、基本的にはこれで大丈夫なはずです。
あとは手元で色々試してみて❗

...だって、今日はこれだけじゃないもんね❓😉

```admonish success title=""
時々{{footnote:
Now and Then (by [The Beatles](https://en.wikipedia.org/wiki/The_Beatles)):
"Now and Then "は John Lennon の曲で、元々は1979年頃にピアノ/ヴォーカルのソロ・デモとしてレコーディングされた。
The Beatles の他のメンバーが後にオーバーダブを施した後、
この曲はバンドのファースト・シングル "Love Me Do"（1962年）のニュー・ミックスと対になったダブルAサイド・シングルとして、
2023年11月2日に単独でリリースされる予定だ❗🎉
このリリースは、コンピレーション "1962-1966(The Red Album)" と "1967-1970(The Blue Album)" の再リリースと共に行われ、
後者には "Now and Then" も収録される。[Wikipedia](https://en.wikipedia.org/wiki/Now_and_Then_(Beatles_song))より
}}不思議に思う。
```

このニュースを取り上げないわけないもんね❗😆

```admonish tip title="NME MUSIC NEWS"
[The Beatles announce release of “final” song ‘Now And Then’ and expanded ‘Red’ and ‘Blue’ albums](https://www.nme.com/en_au/news/music/the-beatles-final-ai-song-now-and-then-blue-red-album-reissues-trailer-documentary-3523081)

The Beatles "最後の" 楽曲 'Now And Then' と 'Red', 'Blue' のアルバムリリースを発表

“There it was, John’s voice, crystal clear,” said McCartney.

"John の声、透き通っていたよ" と McCartney。
```

```admonish tip title=""
“It’s quite emotional. And we all play on it, it’s a genuine Beatles recording.
In 2023 to still be working on Beatles music, and about to release a new song the public haven’t heard, I think it’s an exciting thing.”

"とてもエモーショナルだ。僕たち全員が参加している、正真正銘の Beatles のレコーディングなんだ。
2023年、まだ Beatles の音楽に取り組んでいて、まだ人々が聴いたことのない新曲をリリースしようとしている。"
```

```admonish success title=""
そう、本当に不思議なんだ。

現実は自分の手で作るものだし、常に選択できることは分かっている。

しかし、運命は一体どの程度まで決まっているものなんだろう？
```

```admonish tip title=""
Starr agreed: “It was the closest we’ll ever come to having him back in the room so it was very emotional for all of us.
It was like John was there, you know. It’s far out.”

Starr も同意している。

"彼が部屋に戻ってくるというのは、これまでで一番身近なことだった。
まるで John がそこにいるようだった。遥か彼方だ。"
```

```admonish success title=""
人生には分かれ道がつきものなんだろうか？

2つの道はどちらも前もって運命が決まっているんだろうか？
```

わたしが生まれた時にはもう遥か彼方だったけど、John はわたしの心を救ってくれた人。

「本当にありがとう❗」届くといいな🤗

```admonish success title=""
どっちへ行こうかと悩むとき、道は数限りなくある。

その中から1つを選ぶんだけど、それが時々、ものすごく奇妙だったりする...。
```

```admonish success
インタビューの締めとしては、なかなかいいね。
```
