# Leader Key

前章でキーマップをやったので、この章では`Leader`キーを設定しておきましょう。

## nvim_set_var

突然ですが、ここでニューヒーローをお迎えします❗その名も`nvim_set_var`❗😆

~~~admonish info title=":h nvim_set_var"
```txt
nvim_set_var({name}, {value})       nvim_set_var()
  Sets a global (g:) variable.

  グローバル(g:)変数を設定する。

  Parameters:
    • {name}   Variable name
    • {value}  Variable value
```
~~~

すごくシンプル❗かぁっくいー❤️

章のタイトルを飾れるだけの力があるのに、なんか無理やりの登場となってしまいました😅

...ただ、この後も出番はかなり限られてくると思われます。

能力の高さゆえ、守備範囲が広大すぎて地球だけに居られない Captain Marvel
{{footnote:
Captain Marvel は Marvel Comics が発行するアメリカン・コミックに登場する複数のスーパーヒーローの名前である。
これらのバージョンのほとんどは、マーベル・ユニバースとして知られるマーベルの主要な共有宇宙に存在する。
現在のキャラクターは Carol Danvers である。
体内に取り込んだ “ライトスピード・エンジン” のコアエネルギーによるスーパーパワーを得た直後、
Kree の記憶改竄を受けて彼らに利用されるも、記憶を取り戻して反旗を翻し、銀河の各地で戦うヒーローとなる。
[Captain_Marvel_(Marvel_Comics)](https://en.wikipedia.org/wiki/Captain_Marvel_(Marvel_Comics))
}}みたいですね❗

~~~admonish tip
これは10章に入れるかどうか悩んだところですが、

```lua
vim.api.nvim_set_var('loaded_python3_provider', 0)
```

...というような使い方もできます。

(ここでは中身に触れないんですが) これから環境構築するぞー❗って時にやる設定ではないなー🤔と思ったので登場しません。

一通り構築が終わったら改めて登場する予定です。たぶん🙄

...ん⁉️ やっぱり、Endgame だろうがなんだろうが遅れてやってくる Captain Marvel みたいですね❗
~~~

```admonish note
これ、本題と全然関係ないけど、へぇ〜😮ってなるやつ。

John Lennon が "The Continuing Story Of Bungalow Bill - The Beatles (White Album)" の歌詞に入れてたり、
Disney+ の "The Beatles: Get Back" の中で発言してたりする「Captain Marvel」って、Shazam{{footnote:
Shazam や the Captain としても知られる Captain Marvel は、アメリカン・コミックに登場するスーパーヒーローで、
当初は Fawcett Comics から出版され、現在は DC Comics から出版されている。
Shazam は Billy Batson の分身であり、魔法の言葉 "SHAZAM!"
(6人の "不滅の長老 "の頭文字 `S`olomon, `H`ercules, `A`tlas, `Z`eus, `A`chilles, `M`ercury) を口にすることで、
超人的な力、スピード、飛行能力などを持つコスチュームを着た大人に変身する。
[Captain Marvel (DC Comics)](https://en.wikipedia.org/wiki/Captain_Marvel_(DC_Comics))
}}のことらしいよ😉

> ※ このサイトは Brie Larson のイメージだけで進んでます。
```

## mapleader

~~~admonish info title=":h mapleader"
```txt
                  <Leader> mapleader
To define a mapping which uses the "g:mapleader" variable, the special string
"<Leader>" can be used.  It is replaced with the string value of
"g:mapleader".  If "g:mapleader" is not set or empty, a backslash is used
instead.

変数 "g:mapleader "を使用するマッピングを定義すると、"<Leader>"という特殊な文字列を使用することができる。
これは "g:mapleader "の文字列値と置き換えられる。

g:mapleader "が設定されていない場合や空の場合は、代わりにバックスラッシュが使われる。
```
~~~

Vim scriptの書き方だと思われますが、`g:`というのが`global`で、`mapleader`が変数名ですね 🤔

これはなんかもう`nvim_set_var`が強すぎるので楽勝です❤️

~~~admonish example title="keybinds.lua"
```lua
vim.api.nvim_set_var('mapleader', '\\')
```
~~~

```admonish note
例がややこしくなってしまいましたが、
1文字目の`\`は`エスケープシーケンス`として入っているものなので、`\`(2文字目) だけが設定されます。
```

上の例はデフォルトと同じ<kbd>\\</kbd>になっていますが、ここを好きなキーに変えることができます。

```admonish tip
`WezTerm`は<kbd>Ctrl</kbd>キーと同時押しするキーを指定していましたが、`Neovim`は単独で使用するキーを指定します。
```

### Example

`WezTerm`の時にも挙げましたが、メジャーなのは以下に示すこの辺でしょうか😌

配列は勿論、形状とかも含めて、使用するキーボードに依るので一概には言えないんですが、
「変えた方がいいよー」って人もいるし、「別に変えてないよー」って人もいます。

つまり自由ってことです❗

#### Space

```lua
vim.api.nvim_set_var('mapleader', ' ')
```

スペースを指定しています。。
`:map`ではないからっていう理屈だと思うんだけど`<Space>`と指定してもうまくいかなかったはず。

#### , (comma)

```lua
vim.api.nvim_set_var('mapleader', ',')
```

メジャーなんだけど、<kbd>,</kbd>は`Neovim`がデフォルトで機能を割り当てていることに注意❗

```admonish note
わたしにも<kbd>,</kbd>で使用していた時代がありましたが、自然と<kbd>\\</kbd>に戻りました。

US 配列を使っている場合だと、ゆーて<kbd>Return</kbd>キーのちょっと上ってだけですからね😉
```

#### Two Characters

```lua
vim.api.nvim_set_var('mapleader', 'map')
```

2文字以上を入れても平気みたいなので、何か可能性があるような、いや無いような...🤔

### echo

`leader`キーの確認はコマンドからできます。

```vim
:echo mapleader
```

![leader](img/leader.webp)

設定前に実行するとエラーが出てしまいますが、特に害はありません。

## maplocalleader

`Neovim`には`Local Leader`というものもあります。

~~~admonish example title="keybinds.lua"
```txt
                    <LocalLeader> maplocalleader

<LocalLeader> is just like <Leader>, except that it uses "maplocalleader"
instead of "mapleader".  <LocalLeader> is to be used for mappings which are
local to a buffer.

 <LocalLeader> は <Leader> と同じであるが、"mapleader" の代わりに "maplocalleader" を使用する点が異なる。
 <LocalLeader> は、バッファにローカルに存在するマッピングに使用される。

In a global plugin <Leader> should be used and in a filetype plugin
<LocalLeader>.  "mapleader" and "maplocalleader" can be equal.  Although, if
you make them different, there is a smaller chance of mappings from global
plugins to clash with mappings for filetype plugins.  For example, you could
keep "mapleader" at the default backslash, and set "maplocalleader" to an
underscore.

global プラグインでは <Leader> を、filetype プラグインでは <LocalLeader> を使用する。
"mapleader" と "maplocalleade " は同じでも構わないが、
別にしておけばグローバルプラグインのマッピングとファイルタイププラグインのマッピングが衝突する可能性が低くなる。

例えば、"mapleader "をデフォルトのバックスラッシュのままにして、"maplocalleader "をアンダースコアに設定する。
```
~~~

### Example

こっちはなんか<kbd>_</kbd>がメジャーらしい...🤔

~~~admonish example title="keybinds.lua"
```lua
vim.api.nvim_set_var('maplocalleader', '_')
```
~~~

もちろん`mapleader`と同じように、好きなキーを割り当てられます。

プラグインを使い出すと爆発的に機能が増えるので、`mapleader`とは別のキーを設定しておくのが良いと思います。
(単純に考えて、ショートカットの組み合わせが 2 倍に増えるので。)

ただ、あくまでも必須ではないです。`mapleader`と違って、こちらはデフォルトでも設定されていません。

### echo

これもやっぱりコマンドから確認ができます。

```vim
:echo maplocalleader
```

これも設定前に実行するとエラーが出てしまいますが、やっぱり害はありません。

## Wrap Up

```admonish success
リーダーキーはこんなもんかな☺️

あともうひとつだけ章を挟んだら、いよいよプラグインが登場します。
これもやっぱり「もう嫌❗🙀」ってなるぐらい`Leader`キーに触れられます。

ドキドキ...❗
```

<video controls preload="none" width="1280" height="720" poster="img/kyobashi2025-kanda2024-mix-thumbnail.webp">
  <source src="img/kyobashi2025-kanda2024-mix.webm" type="video/webm">
  Your browser does not support the video/webm.
</video>

```admonish success title=""
<div style="text-align: center">

  LEADER KEY AND CAPTAIN MARVEL WILL RETURN

  リーダーキーとキャプテン・マーベルは帰ってくる
</div>
```
