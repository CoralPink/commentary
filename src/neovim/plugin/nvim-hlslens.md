# nvim-hlslens

今回はのんびり小休止です。`nvim-hlslens`なんてどうでしょう❓

これであれば前回のように、取り乱すなどあろうはずがありません。

```admonish info title="[nvim-hlslens](https://github.com/kevinhwang91/nvim-hlslens)"
nvim-hlslens helps you better glance at matched information, seamlessly jump between matched instances.

nvim-hlslens は、マッチした情報をより見やすくし、マッチしたインスタンス間をシームレスにジャンプできるようにします。
```

```admonish abstract title="Requirements"
Neovim 0.61 or later

nvim-ufo (optional)
```

[nvim-ufo](https://github.com/kevinhwang91/nvim-ufo) が`optional`とされているのですが、これ使ったことないんですよね...。

`fold`関連の機能を強化する...のかな...❓

そもそもわたし自身が普段`fold`使ってないので、このサイトでは使用しないで進みます😅

<div class="slider">
  <div class="media">
    ![asakusa-samba-carnival-2024-1](img/asakusa-samba-carnival-2024-1.avif)
    ![asakusa-samba-carnival-2024-2](img/asakusa-samba-carnival-2024-2.avif)
    ![asakusa-samba-carnival-2024-3](img/asakusa-samba-carnival-2024-3.avif)
    ![asakusa-samba-carnival-2024-4](img/asakusa-samba-carnival-2024-4.avif)
    ![asakusa-samba-carnival-2024-5](img/asakusa-samba-carnival-2024-5.avif)
    ![asakusa-samba-carnival-2024-6](img/asakusa-samba-carnival-2024-6.avif)
  </div>
</div>

踊りながらいきましょう❗{{footnote:
浅草サンバ・カーニバル・コンテストは、東京都台東区浅草で行われるサンバ・パレードのコンテスト。
毎年8月最終土曜日の一日限りの開催だが、約50万人の人出があり、
ブラジル以外の国で最大級、そして北半球最大のサンバカーニバルへと発展した。
[Wikipedia](https://ja.wikipedia.org/wiki/浅草サンバカーニバル)より
}}

ブラジルのみなさん🕺 南半球のみなさん💃 聴こえますかー❗

突拍子もなく載っけますが、深い意味などあろうはずがありません😇

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

![nvim-hlslens](img/nvim-hlslens.avif)

表示が少し豪華になりましたね❗

上のスクリーンショットの一番上を例に言えば、<kbd>5</kbd><kbd>N</kbd>ってすればここにジャンプできるよーって教えてくれます。

```admonish note
ジャンプ自体は`hlslens`が無くてもできるんですけどね😅
```

あと、`keymap()`を使用したカスタマイズを使うと、検索結果を`quickfix`にエクスポートできちゃいます。

例えば`/nvim`で検索をかけた後に<kbd>Leader</kbd><kbd>L</kbd>とするとこうなります。

![nvim-hlslens-quickfix](img/nvim-hlslens-quickfix.avif)

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

![nvim-hlslens2](img/nvim-hlslens2.avif)

なんだろ、同期してないって言うのかな...。

少し動かしてるうちに、例えば [5/6] と [6/6] の間にいるのに [3/6] って表示してたり...。

前回わたしを助けてくれた nvimトレーナーも、今回はお手上げのようです...。

...。

...❓

```admonish quote title=""
......　おや❗❓

かいパンやろうの　ようすが......❗
```

```admonish danger title=""
![asakusa-mucle](img/asakusa-muscle.avif)

筋肉の集団面接💪 今まで一番チカラをいれた部位はどこですかッ⁉️
```

```admonish quote title=""
おめでとう❗　かいパンやろうは

ブラックパンツァーに　しんかした
```

~~~admonish info title=":h shortmess"
```txt
  S  do not show search count message when searching,
     検索時に検索数を表示しない,

     e.g. "[1/5]"
```
~~~

~~~admonish example title="extensions/nvim-hlslens.lua"
```diff
 vim.keymap.set({'n', 'x'}, '<Leader>L', function()
   vim.schedule(function()
     if require('hlslens').exportLastSearchToQuickfix() then
       vim.cmd('cw')
     end
   end)
   return ':noh<CR>'
 end, {expr = true})

+vim.opt.shortmess:append 'S'
```
~~~

頷くブラックパンツァー。共に戦おうと言わんばかりに...❗

![nvim-hlslens3](img/nvim-hlslens3.avif)

そこまで絞るには眠れない夜もあったろう...❗ありがとう、ブラックパンツァー...❗❗

<div class="slider">
  <div class="media">
    <video width="1280" height="720" data-poster="img/jimori-samba-ongakutai-2024-thumbnail.avif">
      <source src="img/jimori-samba-ongakutai-2024.webm" type="video/webm">
    </video>
    <video width="1280" height="720" data-poster="img/gres-barbaros-2025-thumbnail.avif">
      <source src="img/gres-barbaros-2025.webm" type="video/webm">
    </video>
  </div>
</div>

## Help poor children in Uganda!

すごい今さらだし、無理やりなんですが...。

~~~admonish info title=":h Kuwasha"
Vim is Charityware.

You can use and copy it as much as you like, but you are encouraged to make a donation for needy children in Uganda.

Please see |kcc| below or visit the Kuwasha web site, available at the following URL:

Vim はチャリティーウェアです。

自由に使用・複製できますが、ウガンダの恵まれない子供たちへの寄付を行うよう推奨されています。
{{footnote: [Bram Moolenaar](https://en.wikipedia.org/wiki/Bram_Moolenaar)氏の慈善団体である
[ICCF オランダ](https://en.wikipedia.org/wiki/ICCF_Holland)は、
Kibaale 児童センターを通じて長年ウガンダの子供たちの教育を支援してきました。
2023 年に Bram 氏が逝去した後、ICCF オランダは全ての活動をカナダの姉妹慈善団体[Kuwasha](https://www.kuwasha.net)に移管し、
2025 年末に解散しました。

Vim ユーザーからの寄付は引き続き歓迎され、直接ウガンダへ送られます。
この活動を継続的に支援するには、寄付を Kuwasha へお送りください。 :help iccf より
}}
詳細は下記 |kcc| を参照するか、以下の URL で Kuwasha ウェブサイトをご覧ください:

[https://www.kuwasha.net](https://www.kuwasha.net)

You can also sponsor the development of Vim. Vim sponsors can vote for features.
See |sponsor|. The money goes to Uganda anyway.

Vim の開発を支援することも可能です。Vim スポンサーは機能の投票権を得られます。
詳細は |sponsor| を参照してください。いずれにせよ、お金はウガンダに送られます。
~~~

> :h bram
>
> Nvim is a fork of the Vim ("Vi IMproved") text editor, which was originally developed by Bram Moolenaar.
> Searching his name within the source code of Nvim will reveal just how much of his work still remains in Nvim.
>
> On August 3, 2023, he passed away at the age of 62.
> If Vim or Nvim have been of use to you in your life, please read |Uganda| and consider honoring his memory however you may see fit.
>
> Nvim は、Bram Moolenaar によって開発されたテキストエディタ Vim ("Vi IMproved") のフォークです。
> Nvim のソースコード内で彼の名前を検索すると、彼の仕事がどれほど Nvim に残っているかがわかります。
>
> 2023年8月3日、彼は 62歳で逝去しました。Vim や Nvim があなたの人生に役立ったなら、
> |Uganda| をお読みいただき、ご自身にふさわしい方法で彼の記憶を偲んでください。
>
> Obituary Articles: [https://github.com/vim/vim/discussions/12742](https://github.com/vim/vim/discussions/12742)
>
> Say Farewell: [https://github.com/vim/vim/discussions/12737](https://github.com/vim/vim/discussions/12737)

```admonish success title="Assemble"
Bram and Uganda Forever!!
```
