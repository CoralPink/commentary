# mason-lspconfig.nvim

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
This ain't song for the broken-hearted

心に傷を負った者のために これを歌うわけじゃない
```

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

## Config

で、これに関するコンフィグも`mason.lua`にまとめちゃいます。

~~~admonish example title="extensions/mason.lua"
```lua
require('mason').setup {
  ui = {
    check_outdated_packages_on_open = false,
    border = 'single',
  },
}

-- ここに追記
require('mason-lspconfig').setup {
  function(server_name)
    vim.lsp.enable(server_name);
  end,
}
```
~~~

これだけです❗マジです。地味ながらとっても重要なやつです。

ドッジボールで言ったらキルア{{footnote: HUNTER X HUNTER です}}です❗

```admonish success title=""
It's my life!
{{footnote: It's My Life (by [Bon Jovi](https://en.wikipedia.org/wiki/Bon_Jovi)):
2000年5月23日、7枚目のアルバム Crush からのリード・シングル。
Jon Bon Jovi, Richie Sambora, Max Martin が作曲し、Luke Ebbin が共同プロデュースした。
この曲は、Bon Jovi の 1980年代以降のヒット・シングルの中で最もよく知られ、若いファン層を新たに獲得することとなった。
}}

これが俺の人生だ！
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
My heart is like an open highway

Like Frankie{{footnote:
同じ New Jersey 出身の[Frank Sinatra](https://en.wikipedia.org/wiki/Frank_Sinatra)に言及した詩が特徴の一つであり、
"My heart is like an open highway / Like Frankie said / I did it 'My Way'"というセリフでも知られている。

Jon Bon Jovi と Sambora は、このセリフを巡って意見が対立したようで、Bon Jobi は次のように回想している。

俺は[U-571](https://en.wikipedia.org/wiki/U-571_(film))の製作から帰ってきたばかりで、こう言ったんだ。
"Sinatra は16本の映画を作り、80歳までツアーをした。これは俺のロールモデルだ。"
すると Sambora は "そんな詞は書くなよ。君以外、誰も Frank Sinatra のことなんて気にしていないんだから。"
それでもとにかく書いてみたんだ。
}}said

I did it my way

俺の心は まるで見通しの良いハイウェイだ

フランキーが歌ったように

俺は 俺の道を行くんだ
```

## For the ones who stood their ground

ここまで来れば、ついに`LSP`でお話ができます❗がんばったね🤗

```admonish success title=""
This is for the ones who stood their ground

For Tommy and Gina{{footnote:
2番の歌詞にある「決して一歩も引かなかった トミーとジーナのために」というセリフは、
1986年に Bon Jovi と Sambora が書いた "Livin' on a Prayer" で登場した労働者階級のカップルを指している。
[Wikipedia](https://en.wikipedia.org/wiki/It%27s_My_Life_(Bon_Jovi_song))より}}
who never backed down

この歌は 信じて立ち向かった者達に捧げる

決して一歩も引かなかった トミーとジーナのために
```

### LspInfo

試しに、適当な`lua`ファイルを開いて

```vim
:LspInfo
```

としてみましょう。

![lspinfo](img/lspinfo.webp)

うわっ❗めっちゃお話ししてくれそう🥰

```admonish tip
`:LspInfo`は`nvim-lspconfig`の機能です😉
```

### Signature Help

じゃあ、試しに`lua`ファイルに記述されている`require`にカーソルを持っていって、<kbd>Ctrl-k</kbd>としてみましょう。

```admonish note
`nvim-lspconfig.lua`にキーマッピングを設定しましたね😌 もしデフォルトから変更している場合は読み替えてください。
```

![Signature Help](img/signature_help.webp)

めっちゃ教えてくれる😆

### Diagnostics

なんか嬉しくなってきたので、次はコードにイタズラをしてみましょう。

![Work LS](img/work-ls.webp)

やーい怒られたぁ🤣

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

![lualine-diagnostics](img/lualine-diagnostics.webp)

`lualine`上に`Error`や`Warning`の数が表示されるようになりましたね❗

## It's My Life

だいぶ歩いてきました。

これさえやっておけば、他の言語の`LSP`を追加したくなった時も "基本的には" `mason`を操作するだけで良くなります。

結構な達成感じゃないでしょうか☺️

しかし、この章の冒頭にある[ロードマップ](language-server-protocol.html#start)でも示されていましたが、
これはまだ序章にすぎません❗

```admonish success
Better stand tall when they're calling you out

Don't bend, don't break, baby, don't back down

呼ばれたら立ち向かえ

自分を曲げるな、挫けるな、それから、一歩も引くなよ
```

```admonish success title=""
I just wanna live while I'm alive

It's my life!

今 この瞬間を生きていたい

これが俺の人生だ！
```
