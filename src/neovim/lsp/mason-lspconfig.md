# mason-lspconfig.nvim

<div style="margin-top: 2em"></div>

```admonish success title=""
This ain’t a song for the broken-hearted

心に傷を負った者のために これを歌うわけじゃない
```

<div style="margin-top: 2em"></div>

わかる人には既に色々見透かされているとは思ってますが、そんなものは気にせず、ど真ん中をぶっちぎります❗

`mason-lspconfig.nvim`のお通りだー❗

~~~admonish info title="[mason-lspconfig.nvim](https://github.com/williamboman/mason-lspconfig.nvim)"
`mason-lspconfig` bridges `mason.nvim` with the `lspconfig` plugin - making it easier to use both plugins together.

`mason-lspconfig` は `mason.nvim` と `lspconfig` プラグインを橋渡しし、両プラグインを一緒に使うことを容易にするものです。

```vim
:help mason-lspconfig.nvim
```
~~~

なんだかとってもややこしいですね😑

```admonish success title=""
No silent prayer for faith-departed

信じるものを失った者への 静かな祈りでもない
```

## Requirements

```admonish info title="[Requirements](https://github.com/mason-org/mason-lspconfig.nvim#requirements)"
> :h mason-lspconfig-requirements

* neovim >= 0.11.0
* mason.nvim >= 2.0.0
* nvim-lspconfig >= 2.0.0
```

`mason.nvim`は`neovim 0.10.x`にも対応していますが、
この`mason-lspconfig.nvim`は、さらにもう一歩先に進んでいます。

このページの初掲は`Apr 1, 2023`ですが、
ここで示すサンプルコードはこれに対応したものに書き換えているのですが...

まあ、なんか...、隔世の感があるぅぅぅ😼

## Install

これは`mason.nvim`とセットで入れておきましょう。

~~~admonish example title="extensions/mason.lua"
```diff
use {
  'williamboman/mason.nvim',
  config = function() require 'extensions.mason' end,
+ requires = {
+   'williamboman/mason-lspconfig.nvim',
+ }
}
```
~~~

`nvim-lspconfig`も呼び出す必要があるので、これもプラスで❗

```admonish success title=""
And I ain’t gonna be just a face in the crowd

You’re gonna hear my voice when I shout it out loud

そして 俺はただ群衆の中の ほんのひとつ なんてものにはならない

俺が声を上げれば お前はその声を聞くことになる
```

## Config

で、これに関するコンフィグも`mason.lua`にまとめちゃいます。

~~~admonish example title="extensions/mason.lua"
```diff
 require('mason').setup {
   ui = {
     check_outdated_packages_on_open = false,
     border = 'single',
   },
 }

+require('mason-lspconfig').setup()
```
~~~

これだけです❗マジです。

地味ながらとっても重要なやつです。

ドッジボールで言ったら[キルア](https://ja.wikipedia.org/wiki/ゾルディック家#キルア＝ゾルディック)です❗

```admonish success title=""
It’s my life!{{footnote: It's My Life (by [Bon Jovi](https://en.wikipedia.org/wiki/Bon_Jovi)):
2000年5月8日、7枚目のスタジオ・アルバム[Crush](https://en.wikipedia.org/wiki/Crush_(Bon_Jovi_album))のリードシングルとしてリリースされた。
作詞・作曲は[Jon Bon Jovi](https://en.wikipedia.org/wiki/Jon_Bon_Jovi),[Richie Sambora](https://en.wikipedia.org/wiki/Richie_Sambora),
[Max Martin](https://en.wikipedia.org/wiki/Max_Martin)が担当し、[Luke Ebbin](https://en.wikipedia.org/wiki/Luke_Ebbin)が共同プロデュースを務めた。
この曲は、オーストリア、[フランダース](https://en.wikipedia.org/wiki/Flanders)、イタリア、オランダ、ポルトガル、ルーマニア、スペイン、スイスで1位を記録し、
その他多くの国でもトップ10入りを果たしたほか、アメリカの[Billboard Hot 100](https://en.wikipedia.org/wiki/Billboard_Hot_100)では33位を記録した。
It's My Life は、Bon Jovi にとって 2000年代で最も成功したシングルであり、1980年代以来の最大のヒット曲である。
}}

it’s now or never

これは 俺の人生だ！

今やるしかない
```

ただこれ...、かけるオーラの比率をほんの少しでも間違えると途端にアウトなので、
だいぶ気をつけて使ってください...。

~~~admonish info title="mason-lspconfig.setup()"
```txt
                                                     mason-lspconfig.setup()
setup({config})
  Sets up mason with the provided {config} (see |mason-lspconfig-settings|).

  指定された {config} で mason を設定する (mason-lspconfig-settings を参照)。
```
~~~

例えば、それはもうめちゃくちゃ言語プロフェッショナルが扱う場合は`mason-lspconfig.nvim`自体を使用せず、
個別にやったほうがきっちりできるはずです。

...ただ、そうでもない場合、言語ごとに一個一個の設定をしていかなきゃならないってなると、
`mason-lspconfig.nvim`が提供してくれるお手軽さが損なわれてしまいます。

```admonish warning
推奨される方法はこれではなくて他にあるので、「使う場合は注意してね」ってことです😉
```

でも、それではあまりにも勿体ないので、
これを理解した上で使用する分にはいいんじゃないかな〜って思うことにします❗そうします😆

```admonish success title=""
But I ain’t gonna live forever

I just wanna live while I’m alive

俺だって 永遠に生きるわけじゃない

命のある限り 生きたいだけだ
```

## For the ones who stood their ground

ここまで来れば、ついに`LSP`でお話ができます❗がんばったね🤗

```admonish success title=""
(It’s my life) My heart is like an open highway

俺の心は どこまでも見通しの良いハイウェイのようだ
```

### LspInfo

試しに、適当な`lua`ファイルを開いて

```vim
:LspInfo
```

としてみましょう。

![lspinfo](img/lspinfo.avif)

うわっ❗めっちゃお話ししてくれそう🥰

```admonish tip
`:LspInfo`は`nvim-lspconfig`の機能です😉
```

```admonish success title=""
Like Frankie{{footnote:
同じ[New Jersey](https://en.wikipedia.org/wiki/New_Jersey)出身の[Frank Sinatra](https://en.wikipedia.org/wiki/Frank_Sinatra)に言及した詩が特徴の一つであり、
"My heart is like an open highway / Like Frankie said, I did it '[My Way](https://en.wikipedia.org/wiki/My_Way)'"というセリフでも知られている。

Jon Bon Jovi と Sambora は、このセリフを巡って意見が対立したようで、Bon Jovi は次のように回想している。

俺は[U-571](https://en.wikipedia.org/wiki/U-571_(film))の製作から帰ってきたばかりで、こう言ったんだ。
"Sinatra は16本の映画を作り、80歳までツアーをした。これは俺のロールモデルだ。"
すると Sambora は "そんな詞は書くなよ。君以外、誰も Sinatra のことを気にかけてはいないんだから。"
...それでもとにかくやってみたんだ。

2005年、[Paul Anka](https://en.wikipedia.org/wiki/Paul_Anka)がアルバム[Rock Swings](https://en.wikipedia.org/wiki/Rock_Swings)でこの曲をカバーした際、
2行目を "Frankie said he did it my way" と歌っている。これは、Anka 自身が My Way の英語歌詞を書いたためである。
}}said, I did it my way

フランキーが歌ったように 俺は俺の道を歩いて来た
```

### Signature Help

じゃあ、試しに`lua`ファイルに記述されている`require`にカーソルを持っていって、<kbd>Ctrl-k</kbd>としてみましょう。

```admonish note
`nvim-lspconfig.lua`にキーマッピングを設定しましたね😌 もしデフォルトから変更している場合は読み替えてください。
```

![Signature Help](img/signature_help.avif)

めっちゃ教えてくれる😆

### Diagnostics

なんか嬉しくなってきたので、次はコードにイタズラをしてみましょう。

![Work LS](img/work-ls.avif)

やーい怒られたぁ🤣

```admonish success title=""
I just wanna live while I’m alive

命のある限りは ただ生き抜きたいんだ
```

#### lualine

`Diagnositcs`に関連して、もう一個やっておきましょう。おもむろに`lualine.lua`を開いて、こんなのを入れてみましょう。

~~~admonish example title="extensions/lualine.lua"
```lua
sections = {

-- (中略)

  lualine_c = {
    {
      'diagnostics',
      sources = { 'nvim_diagnostic', 'nvim_lsp' },
      sections = { 'error', 'warn', 'info', 'hint' },
      symbols = { error = ' ', warn = ' ', info = ' ', hint = '' },
    },
  },

-- (中略)

}
```
~~~

ってやってから、またちょっかい出してみると...❓

![lualine-diagnostics](img/lualine-diagnostics.avif)

`lualine`上に`Error`や`Warning`の数が表示されるようになりましたね❗

## It's My Life

だいぶ歩いてきました。

これさえやっておけば、他の言語の`LSP`を追加したくなった時も "基本的には" `mason`を操作するだけで良くなります。

結構な達成感じゃないでしょうか☺️

しかし、この章の冒頭にある[ロードマップ](language-server-protocol.html#start)でも示されていましたが、
これはまだ 道半ば にすぎません❗

```admonish success
It’s my life

これが 俺の人生だ
```

<div style="color: #999999; font-size: 90%; text-align: center;">
<div style="margin-top: 12em">
This is for the ones who stood their ground

この歌は 信じて立ち向かった者達に捧げる
</div>

<div style="margin-top: 8em">
For Tommy and Gina{{footnote:
歌詞にある "For Tommy and Gina who never backed down" というセリフは、
1986年に Bon Jovi と Sambora が書いた[Livin' on a Prayer](https://en.wikipedia.org/wiki/Livin%27_on_a_Prayer)で登場した
[労働者階級](https://en.wikipedia.org/wiki/Working_class)のカップルを指している。
}} who never backed down

決して一歩も引かなかった トミーとジーナのために
</div>

<div style="margin-top: 8em">
Tomorrow’s gettin’ harder, make no mistake

明日はもっと厳しくなる、間違いない
</div>

<div style="margin-top: 4em">
Luck ain’t even lucky, gotta make your own breaks

運なんてものは 幸不幸ではなく、自分で拓かなきゃいけないことなんだ
</div>

<div style="margin-top: 8em">
It’s my life!

And it’s now or never

これは 俺の人生だ

今やるしかない
</div>

<div style="margin-top: 8em">
But I ain’t gonna live forever

俺だって 永遠に生きるわけじゃない
</div>

<div style="margin-top: 4em">
I just wanna live while I’m alive

命のある限り 生きたいだけだ
</div>

<div style="margin-top: 8em">
(It’s my life) My heart is like an open highway

俺の心は どこまでも見通しの良いハイウェイのようだ
</div>

<div style="margin-top: 4em">
Like Frankie said, I did it my way

フランキーが歌ったように 俺は俺の道を歩いて来た
</div>

<div style="margin-top: 8em">
I just wanna live while I’m alive

命のある限りは ただ生き抜きたい
</div>

<div style="margin-top: 8em">
'Cause it's my life{{footnote:
"It's My Life という曲がこれほど話題になるとは、誰も予想していなかった" と、Jon Bon Jovi は2007年に語った。
"俺たちを除いてね。俺たちはこれがヒット曲になると分かっていたんだ"。この曲は、多くのファンの心を掴むアンセムとなった。
Bon Jovi は、後に次のように述べている:
当時は、自分の人生やその時点での自分の置かれた状況について、かなり自己陶酔的に書いているだけだと思っていた。
"It's My Life" というフレーズが、10代の若者から年配の男性、整備士に至るまで、あらゆる人にとっての歌として受け止められるとは気づかなかった。
"これが俺の人生だ、そして俺はそれを自分の手で切り拓いていく" -- 誰もが時折、そんな気持ちになるものだ。

ベテラン評論家の[Robert Christgau](https://en.wikipedia.org/wiki/Robert_Christgau)は後に、
It's My Life を "安っぽいロックの傑作" であり、"凡人アンセム" であると称賛し、その歌詞は "善意に満ちた、凡人としての民主党員、Jon Bon Jovi そのもの" であると評した。
[Wikipedia](https://en.wikipedia.org/wiki/It%27s_My_Life_(Bon_Jovi_song))より
}}

これが 俺の人生だからだ
</div>

<div style="margin-top: 12em">
Better stand tall when they’re callin’ you out

挑まれたのなら 正面から立ち向かえ
</div>

<div style="margin-top: 4em">
Don’t bend, don’t break, baby, don’t back down

屈するな、自分を曲げるな、それから、一歩も引くなよ
</div>
</div>

<div style="margin-top: 8em"></div>
