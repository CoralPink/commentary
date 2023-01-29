# nvim-hlslens

前回、少し取り乱してしまったので、今回はのんびり小休止です。`nvim-hlslens`なんてどうでしょう❓

これでしたら簡単です。取り乱すなどあろうはずがありません。絶対に。{{footnote:
お笑いで言うところの "フリ" です。
}}

```admonish info title="[nvim-hlslens](https://github.com/kevinhwang91/nvim-hlslens)"
nvim-hlslens helps you better glance at matched information, seamlessly jump between matched instances.

nvim-hlslens は、マッチした情報をより見やすくし、マッチしたインスタンス間をシームレスにジャンプできるようにします。
```

```admonish abstract title="Requirements"
Neovim 0.61 or later

nvim-ufo (optional)
```

[nvim-ufo](https://github.com/kevinhwang91/nvim-ufo) が`optional`とされているのですが、わたしこれ使ったことないんですよね...。

`fold`関連の機能を強化する...のかな...❓

そもそも普段`fold`使ってないので、ちょっと今回はインストールせずにいきます😅

## Installation

ということで、いつも通り😉

~~~admonish example title="extensions.nvim-hlslens.lua"
```lua
require('hlslens').setup()

vim.keymap.set({'n', 'x'}, '<Leader>L', function()
  vim.schedule(function()
    if require('hlslens').exportLastSearchToQuickfix() then
      vim.cmd('cw')
    end
  end)
  return ':noh<CR>'
end, {expr = true})
```
~~~

[customize-configuration](https://github.com/kevinhwang91/nvim-hlslens#customize-configuration)からほぼそのまま持ってきました。

`setup()`については、このカスタム例の通りにすると、わたしの環境ではうまくいかない点があったのでデフォルトにしてます😣

~~~admonish example title="extensions.init.lua"
```lua
use {
  'kevinhwang91/nvim-hlslens',
  config = function() require 'extensions.nvim-hlslens' end,
}
```
~~~

はい。これだけです😆 じゃあ`:PackerSync`しましょ❗

```admonish note
もちろん、カスタマイズ項目はいくつかあります。
```

これで、適当に文字列検索してみてください。

![nvim-hlslens](img/nvim-hlslens.webp)

表示が少し豪華になりましたね❗

上のスクリーンショットの一番上を例に言えば、<kbd>5</kbd><kbd>N</kbd>ってすればここにジャンプできるよーって教えてくれます。

```admonish note
ジャンプ自体は`hlslens`が無くてもできるんですけどね😅
```

あと、`keymap()`を使用したカスタマイズを使うと、検索結果を`quickfix`にエクスポートできちゃいます。

例えば`/nvim`で検索をかけた後に<kbd>Leader</kbd><kbd>L</kbd>とするとこうなります。

![nvim-hlslens-quickfix](img/nvim-hlslens-quickfix.webp)

~~~admonish info title=":h quickfix"
```txt
Vim has a special mode to speedup the edit-compile-edit cycle.  This is
inspired by the quickfix option of the Manx's Aztec C compiler on the Amiga.
The idea is to save the error messages from the compiler in a file and use Vim
to jump to the errors one by one.  You can examine each problem and fix it,
without having to remember all the error messages.

Vimには、編集-コンパイル-編集のサイクルを高速化するための特別なモードがあります。
これは Amiga の Manx の Aztec C コンパイラの quickfix オプションにヒントを得たものです。
これは、コンパイラからのエラーメッセージをファイルに保存しておき、Vim を使って一つずつエラーにジャンプするというものです。
エラーメッセージをすべて覚えておかなくても、それぞれの問題を調べて修正することができます。

In Vim the quickfix commands are used more generally to find a list of
positions in files.  For example, |:vimgrep| finds pattern matches.  You can
use the positions in a script with the |getqflist()| function.  Thus you can
do a lot more than the edit/compile/fix cycle!

Vim では、quickfix コマンドはより一般的に、ファイル内の位置のリストを見つけるために使用されます。
例えば、|:vimgrep| はパターンマッチを見つけます。
この位置は |getqflist()| 関数を使ってスクリプトで使用することができます。
このように、編集/コンパイル/修正のサイクルよりも多くのことができるのです!
```
~~~

つまり、今現れたこのリストからの、選択からのジャンプができるってことですね❗

## I'm a little curious.

あー...うん、ちょっと気になりますね...。右下のやつ。

![nvim-hlslens2](img/nvim-hlslens2.webp)

なんだろ、同期してないって言うのかな...。

少し動かしてるうちに、例えば [5/6] と [6/6] の間にいるのに [3/6] って表示してたり...。

前回わたしを助けてくれた nvimトレーナーも、今回はお手上げのようです...。

...。

...❓

```admonish quote title=""
......　おや❗❓

かいパンやろうの　ようすが......❗
```

...っていうか居たの❓かいパンやろうが進化したくらいではもう取り乱しませんよ😮‍💨

```admonish quote title=""
おめでとう❗　かいパンやろうは

ブラックパンツァーに　しんかした
```

頷くブラックパンツァー。共に戦おうと言わんばかりに...❗

~~~admonish info title=":h shortmess"
```txt
  S  do not show search count message when searching,
     検索時に検索数を表示しない,

     e.g. "[1/5]"
```
~~~

~~~admonish example title="extensions/nvim-hlslens.lua"
```lua
-- (省略)
-- end, {expr = true})

-- そう、ここだ...。
vim.opt.shortmess:append 'S'
```
~~~

![nvim-hlslens3](img/nvim-hlslens3.webp)

ありがとう...❗ブラックパンツァー...❗❗

~~~admonish tip
これ、あんまり関係ないんですが...、なんかいつの間にか`nvim`起動時のイントロ出なくなってません❓

(面倒なので犯人探しとかはしないんですけど😑)

本来であれば、`shortmess`にこんなのがいるんです。

```txt
  I  don't give the intro message when starting Vim,
     Vimの起動時にイントロメッセージを表示しない,

	 see |:intro|.
```

...まあ、`:intro`ってすれば出てくるらしいのでたまには表示してあげてください。
~~~

## Help poor children in Uganda!

あ❗え❓ちょっと待って❗❓

ウガンダの子供達への支援メッセージってもう無くなってるの❗❓

|nvim|vim|
|:---:|:---:|
|![intro-nvim](img/intro-nvim.webp)|![intro-vim](img/intro-vim.webp)|

`vi`では出たけど😮

|vi|
|:---:|
|![intro-vi](img/intro-vi.webp)|

`nvim`でも[Lua Module](../lua-module.html#runtimepath)ページのスクリーンショットにはまだあったよ❓

え、なんで❓意味わかんないぃぃぃぃ❗❗最近消えたってこと❗❓

why!? Where are the children of Ugandaaaaaaa!!

...まあ、`:h iccf`は`nvim v0.8`でも出てきたけど😮

~~~admonish info title=":h iccf"
```txt
Vim is Charityware.
You can use and copy it as much as you like,
but you are encouraged to make a donation for needy children in Uganda.

Vimはチャリティーウェアです。
好きなだけ使ったりコピーしたりできますが、
ウガンダの貧しい子供たちのために寄付をすることが推奨されています。

Please see |kcc| below or visit the ICCF web site, available at these URLs:
下記の |kcc| をご覧いただくか、以下のURLからICCFのウェブサイトをご覧ください。

	https://iccf-holland.org/
	https://www.vim.org/iccf/
	https://www.iccf.nl/

You can also sponsor the development of Vim.
Vim sponsors can vote for features.  See |sponsor|.
The money goes to Uganda anyway.

また、Vim の開発を支援することもできます。
Vim のスポンサーは機能に対して投票することができます。|sponsor| を参照してください。
このお金はとにかくウガンダに行きます。
```
~~~

色々ありましたが、つまりこういうことです。

```admonish success title="Assemble"
Black Panther and Uganda Forever!!

(ブラックパンサーも ウガンダも 永遠に!!)
```
