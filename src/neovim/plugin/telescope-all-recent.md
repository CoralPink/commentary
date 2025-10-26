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
Baby you can drive my car{{footnote:
Drive My Car (by [The Beatles](https://en.wikipedia.org/wiki/The_Beatles)):
「Drive My Car」は1965年10月13日に録音された。この日は The Beatles にとって、
初めて深夜を越えて行われたレコーディング・セッションでもあった。
McCartney は Harrison と密に協力しながら基本のリズム・トラックを作り上げた。
二人は Harrison の提案に基づき、ベースと低音ギターで似たようなリフを奏で合う形で演奏していたという。

この曲の物語は、ある女性が男性の語り手に向かって "自分はこれから有名な映画スターになる" と語り、
彼に "私の運転手にならない?" と持ちかける。
彼女はさらにこう付け加える―― "もしかしたら、あなたのことを愛するかもしれないわ。"
男性が "自分にも見込みはある" と反論すると、彼女は言い返す。
"ピーナッツみたいな稼ぎで満足してるのもいいけど、私ならもっといい思いをさせてあげられるわ。"
やがて彼がその提案を受け入れると、彼女はこう明かす――
"実は車なんて持ってないの。でも運転手は見つかった、それで十分よ。"
}}

Yes I’m gonna be a star

ねえ わたしの車を運転しなよ

そう わたしはスターになるの
```

```admonish fail title=""
Baby you can drive my car{{footnote:
"Drive my car" という表現は、古いブルースで "セックスの隠喩" として使われていた言い回しである。
この比喩は、自動車のオートマチック変速機が普及する以前の時代に広く使われていた。
[Wikipedia](https://en.wikipedia.org/wiki/Drive_My_Car_(song))より
}}

And maybe I love you

ねえ わたしと ぽかぽかしようよ

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

ローカルに sqlite3 がインストールされていることを確認します。
(mac の場合、すでにインストールされている可能性があります)
```

`Windows`や`Arch`・`Ubuntu`についてもオフィシャルに案内されているので大丈夫でしょう😉

~~~admonish note
ただ、このサイトもそうなんですが、`Fedora`系はどうしよう😱 ってなっちゃいますよね...。
色々試してみた感じ、これでいけてる...、はず。

```sh
sudo dnf install sqlite libsqlite3x-devel
```

![install-sqlite3](img/sqlite3.webp)
~~~

ちょっと怖いけど😣{{footnote:
([前ページから続く](telescope-config.html#to-ft-1))
もう一方は[Sith](https://en.wikipedia.org/wiki/Sith)。
怒り・恐怖・攻撃性を糧に "Dark side (暗黒面)" を操る者たちである。
Jedi が多数存在するのに対し、Sith は常に "師匠と弟子の二人" に限定されるのが原則とされる。

この物語は、共和国と帝国のあいだで繰り返される銀河規模の戦争を背景としている。
Jedi や Sith は [ライトセーバー](https://en.wikipedia.org/wiki/Lightsaber) と呼ばれる武器を使いこなす。
これはプラズマ状の刃を持ち、ほとんどあらゆる物質を切断し、エネルギー弾を弾くことができる。
それ以外の人々や兵士、無法者たちは、プラズマを動力とするブラスター銃を使う。

銀河の外縁部では、ハット・カルテルなどの犯罪組織が支配的であり、賞金稼ぎはギャングにも政府にも雇われる。
密輸や奴隷取引といった違法行為も盛んに行われている。

Star Wars シリーズは典型的な[スペースオペラ](https://en.wikipedia.org/wiki/Space_opera)として知られるが、
SFとファンタジーを融合した世界観によって、さまざまなジャンルの物語を語ることができる "普遍的な作品" となっている。
[Wikipedia](https://en.wikipedia.org/wiki/Star_Wars)より
}}

![galactic_empire](img/galactic_empire.webp)

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

当たり前のことを言うんですけど、たった一回`Error`を出しただけで、これを一般的に「失敗」とは言いません
{{footnote:ちょっともやもやするものですから❗🤣}}。 絶対に。
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

![stormtrooper](img/stormtrooper.webp)

## Check It Out

`telescope-all-recent`のインストールが完了すれば、最近開いた項目が上に来ているはずです。
これも毎度おなじみの`help_tags`で確認してみましょう。

適当に項目をいくつか開いてみてください。

![telescope-recent](img/telescope-recent.webp)

このスクリーンショットで伝わるのか少し不安ですが、間違いなく最近開いた項目が上に来てます❗

やったね😆

<div class="slider">
  <div class="media">
    ![STAR WARS](img/starwars.webp)
    ![PEACE!](img/peace.webp)
    ![George Lucas](img/lucas.webp)
    ![May the 4th be with you](img/may_the_4th_be_with_you.webp)
  </div>
</div>

## Wrap Up

外部ツールとの連携にもだいぶ慣れてきたでしょうし、割とすんなり動いたんじゃないでしょうか。

まあ当然、すんなり動くように作ってくれている @prochriさんがすごいんですけどね❗

最後にもう一度、`telesope.nvim`の紹介文を引用して幕引きです😌

```admonish success title="Assemble"
Gaze deeply into unknown regions using the power of the moon.

月の力を借りて、未知の領域を深く覗き込む。

<div id="mountain"></div>

<div style="color: #999999; font-size: 90%; text-align: center;" >
<div style="margin-top: 8rem">
他人の心をそっくり覗き込むなんて無理です

自分が辛くなるだけです
</div>
<div style="margin-top: 3rem">
でもそれが自分自身の心なら

努力次第で しっかりと覗き込むことはできるはずです
</div>
<div style="margin-top: 3rem">
結局のところ僕らがやらなくちゃならないことは

自分の心と上手に

正直に折り合いをつけていくことじゃないでしょうか
</div>
<div style="margin-top: 3rem">
本当に他人を見たいと思うなら

自分自身を深く

まっすぐ見つめるしかないんです
</div>
</div>

<div style="margin-top: 4rem"></div>
```

<div style="margin-top: 4rem"></div>

![darth_vader](img/darth_vader.webp)

<div style="color: #999999; font-size: 90%; text-align: center;" >
<div style="margin-top: 4rem; margin-bottom: 4rem">
We should have looked into each other more closely...

To my only father.
</div>
</div>

<script>
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const module = await import(`${document.getElementById('bookjs').dataset.pathtoroot}replace-dom.js`);
    module.replaceId([
      { id: 'mountain',
        src: { light:'img/mount-day.webp', dark: 'img/mount-night.webp'},
        alt: 'mt.fuji',
      },
    ]);
  } catch (e) { console.error(e); }

  try {
    await import(`${document.getElementById('bookjs').dataset.pathtoroot}slider.js`);
  } catch (e) { console.error(e); }
});
</script>
