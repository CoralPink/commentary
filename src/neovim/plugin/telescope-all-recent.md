# telescope-all-recent.nvim

...いえ、狙ってるわけじゃないんですけど、ほんと❗

月の満ち欠けに合わせないと書けないとかそういうわけじゃないんです、ほんと😅

...なんですが、たまたま、今日はまた新月でした 🌑
見上げれば、いつにも増して星が綺麗に輝いて見えるはずです✨

なんとか繋がりましたね✨ 今回は予告通り新星のおはなしです❗

```admonish info title="[telescope-all-recent](https://github.com/prochri/telescope-all-recent.nvim)"
(F)recency sorting for all Telescope pickers.

全ての Telescope picker に Frecency ソートを提供します。

Very hacky solution, overriding telescope internals to provide recency/frecency sorting for any picker.

telescope 内部をオーバーライドして、任意の picker に対して 再帰性/頻度ソート を提供する、非常にハックなソリューションです。
```

わたしがこれを知ったのは、`telescope.nvim`のリポジトリを色々覗いている中で、こんなのを見つけたからです。

```admonish info title="[Feature like telescope-all-recent should be default #2348](https://github.com/nvim-telescope/telescope.nvim/issues/2348)"
@otavioschwanck

Doom Emacs already brings something like that. VSCode too. Is super useful to have the recent picks at the top of any picker.

Doom Emacs は既にそのようなものをもたらしています。VSCodeも。ピッカーの一番上に最近のピックがあるのは超便利です。
```

"super useful"❗訳して「超便利」❗

それは...ねえ❓気になっちゃうよねー☺️

```admonish fail title=""
Baby you can drive my car

Yes I’m gonna be a star

ねえ わたしの車を運転しなよ

そう わたしはスターになるの
```

```admonish fail title=""
Baby you can drive my car

And maybe I love you

ねえ わたしと ぽかぽか{{footnote:
[Drive My Car](https://en.wikipedia.org/wiki/Drive_My_Car_(song)):
タイトルの「Drive My Car」は「性交」の意を持つ古いブルースの隠語で、McCartney も古いブルースの隠語として使用したことを明かしている。
}}しようよ

そしたら きみに恋しちゃうかも
```

Beep beep'm beep beep yeah! 💘

なんか少し強引ですが気にしな〜い😆

```admonish note
@otavioschwanckさん自身も、Telescopeを拡張するプラグインを公開しているようです。

[telescope-alternate](https://github.com/otavioschwanck/telescope-alternate.nvim)

正規表現かぁ...😮

とっても super usefull な匂いがしますね❗
```

## Requirements

```admonish abstract title="[Requirements](https://github.com/prochri/telescope-all-recent.nvim#requirements)"
- [telescope.nvim](https://github.com/nvim-telescope/telescope.nvim) (required)
- [sqlite.lua](https://github.com/kkharji/sqlite.lua) (required)

Timestamps and selected records are stored in an SQLite3 database for persistence and speed and accessed via sqlite.lua.

タイムスタンプと選択されたレコードは、永続性と高速性のために SQLite3 データベースに格納され、sqlite.lua を介してアクセスされます。
```

`telescope.nvim`はもうすっかり仲良くなったから良いとして、`sqlite.lua`という新しいおともだちがいますね☺️

### sqlite.lua

```admonish info title="[sqlite.lua](https://github.com/kkharji/sqlite.lua)"
SQLite/LuaJIT binding and a highly opinionated wrapper for storing, retrieving, caching, and persisting SQLite databases.
sqlite.lua present new possibilities for plugin development and while it's primarily created for neovim, it support all luajit environments.

SQLite/LuaJIT バインディングと、SQLite データベースの保存、取得、キャッシュ、永続化のための高度な機能を持つラッパーです。
SQLite.lua はプラグイン開発の新しい可能性を提供し、主に neovim のために作成されましたが、すべての luajit 環境をサポートしています。
```

`SQL`まで出てきた😆

#### SQLite3

`sqlite.lua`も、やっぱりプラグインだけでは完結してなくて、別途`SQLite`のインストールが必要になります。

```admonish info title="[Installation](https://github.com/kkharji/sqlite.lua#-installation)"
Ensure you have sqlite3 installed locally.
(if you are on mac it might be installed already)

ローカルにsqlite3がインストールされていることを確認します。
(macの場合、すでにインストールされている可能性があります)
```

`Windows`や`Arch`・`Ubuntu`についてもオフィシャルに案内されているので大丈夫でしょう😉

~~~admonish note
ただ、このサイトもそうなんですが、`Fedora`系はどうしよう😱 ってなっちゃいますよね...。
色々試してみた感じ、これでいけてる...、はず。

```sh
sudo dnf install sqlite libsqlite3x-devel
```

![install-sqlite3](img/sqlite3.webp)

"2007" っていう文字がちょっと怖いけど😣
~~~

## Installation

ここめっちゃ大事😉

```admonish info title="[Installation](https://github.com/prochri/telescope-all-recent.nvim#installation)"
Make sure to load this after telescope.

必ず telescope の後にロードしてください。

If you are creating keybindings to telescope via lua functions,
either load this plugin first and then bind the function,
or wrap the call in another function (see [#2](https://github.com/prochri/telescope-all-recent.nvim/issues/2)):

lua 関数で telescope のキーバインドを作成する場合は、
このプラグインを先にロードしてから関数をバインドするか、
別の関数で呼び出しをラップしてください ([#2](https://github.com/prochri/telescope-all-recent.nvim/issues/2) を参照)。
```

ちょっと悩むところではあるんですが、わたしは以下のようにしました。

~~~admonish example title="extensions/init.lua"
```diff
  use {
    'nvim-telescope/telescope.nvim',
    branch = '0.1.x',
    config = function() require 'extensions.telescope' end,
    requires = {
      'nvim-tree/nvim-web-devicons', 'nvim-lua/plenary.nvim',
      { 'nvim-telescope/telescope-fzf-native.nvim', run = 'make' },
+     {
+       'prochri/telescope-all-recent.nvim',
+       config = function() require('telescope-all-recent').setup {} end,
+       after = 'telescope.nvim',
+       requires = 'kkharji/sqlite.lua',
+     }
    },
  }
```
~~~

じゃあ、これでインストールしてみましょう。

![install-sqlite3](img/sqlite-nvim-ok.webp)

ちゃんといけましたね❗

```admonish note
以下のようなエラーが出る場合は`sqlite`をもう一度確認してみてください。

![install-sqlite3](img/sqlite-nvim-ng.webp)

当たり前のことを言うんですけど、たった一回`Error`を出しただけで、これを一般的に「失敗」とは言いません。
{{footnote:ちょっともやもやするものですから❗🤣}}絶対に。
```

### packer.use()
少しだけいつもと違って見えるところがあるので、ちょっとだけ`packer`のおはなしになります。

#### config

このサイトではこれまで、
プラグイン毎に設定ファイルを用意した上で`config`から固有のセットアップや設定を行うというお作法に習っていましたが、
今回は直接プラグインの`setup`を呼び出しています。

...ネストもだいぶ深いしね😅

```lua
config = function() require('telescope-all-recent').setup {} end,
```

もしカスタマイズが必要になったら、いつも通りファイルを分けた方が良いかなーって思ってます。

#### after

`after`は初登場ですね❗

```lua
after = 'telescope.nvim',
```

~~~admonish info title=":h packer.use()"
```txt
after = string or list,      -- Specifies plugins to load before this plugin.
                                このプラグインの前にロードするプラグインを指定します。
```
~~~

これを使うことで、上にあった「必ず`telescope`の後にロードしてください。」を`packer`のコード上で表現できます。

## Check It Out

`telescope-all-recent`のインストールが完了すれば、最近開いた項目が上に来ているはずです。
これも毎度おなじみの`help_tags`で確認してみましょう。

適当に項目をいくつか開いてみてください。

![telescope-recent](img/telescope-recent.webp)

このスクリーンショットで伝わるのか少し不安ですが、間違いなく最近開いた項目が上に来てます❗

やったね😆

## Wrap Up

外部ツールとの連携にもだいぶ慣れてきたでしょうし、割とすんなり動いたんじゃないでしょうか。

まあ当然、すんなり動くように作ってくれている @prochriさんがすごいんですけどね❗

最後にもう一度、`telesope.nvim`の紹介文を引用して幕引きです😌

```admonish success title="Assemble"
Gaze deeply into unknown regions using the power of the moon.

月の力を借りて、未知の領域を深く覗き込む。
```

<div style="color: #999999; font-size: 90%" >
<div style="text-align: center; margin-top: 80px">
他人の心をそっくり覗き込むなんて無理です

自分が辛くなるだけです
</div>
<div style="text-align: center; margin-top: 30px">
でもそれが自分自身の心なら

努力次第で しっかりと覗き込むことはできるはずです
</div>
<div style="text-align: center; margin-top: 30px">
結局のところ僕らがやらなくちゃならないことは

自分の心と上手に

正直に折り合いをつけていくことじゃないでしょうか
</div>
<div style="text-align: center; margin-top: 30px">
本当に他人を見たいと思うなら

自分自身を深く

まっすぐ見つめるしかないんです
</div>
<div style="text-align: center; margin-top: 50px; margin-bottom: 80px">
We should have looked into each other more closely...

To my only father.
</div>
</div>
