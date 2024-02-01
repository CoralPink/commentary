# Linter

```admonish info title=""
パパは昔 Beatles だったの？{{footnote:
Lennon は、幼なじみの家で偶然 TV で流れていた 1968年公開の The Beatles のアニメーション映画 "Yellow Submarine" を観てきた息子 Sean に
「パパは昔 Beatles だったの？」と聞かれた。
}}
```

大変だ〜❗2024年が始まっているうぅぅ😭

それはもうなんだか、本当に色々ありました...。

しかしわたしも、ようやくバイオリズムってものを取り戻して💃 徐々に POWER が漲ってきました ⭐🕺

```admonish success title=""
One, two, three, four

Can I have a little more?

Five, six, seven, eight, nine, ten

I love you
```

船を出そう❗機運を起こせ❗❗

```admonish success title=""
A, B, C, D

Can I bring my friend to tea?
```

世界では紅茶に塩を入れたりですとか、緑茶に柚子や砂糖を入れたりですとか、
わーわーゆうとりますけども、わたしは "It's all right", "괜찮아" です🫖

ただ、"はちみつカモミール" のティーバッグを淹れてるわたくしなんかが首を突っ込んでも火傷するだけですので🤐

っていうか、柚子砂糖緑茶もティーバッグで売り出してほしいなー 🍵

...。🙂

って、tea のおはなし❗

```admonish note
すでにお気づきかとは思いますが、このサイトはクセがつよいんですわぁ❗🤣
```

## Install

次項からはじまるのは、`Luacheck`と`Biome`のおはなしです。

追加のインストールが手間だったり、そもそもその言語使ってないってことも当然あると思うので、
これらを実際にインストールするかどうかはおまかせします😺

```admonish success title=""
E, F, G, H, I, J

I love you
```

### Luacheck

```admonish info title="[Luacheck](https://github.com/lunarmodules/luacheck)"
Luacheck is a static analyzer and a linter for [Lua](https://www.lua.org).
Luacheck detects various issues such as usage of undefined global variables, unused variables and values,
accessing uninitialized variables, unreachable code and more.

LuacheckはLua用の静的アナライザであり、Linter です。
Luacheckは、未定義のグローバル変数の使用、未使用の変数や値、
初期化されていない変数へのアクセス、到達不能なコードなど、様々な問題を検出します。

Luacheck supports checking Lua files using syntax of Lua 5.1 - 5.4, and LuaJIT.
Luacheck itself is written in Lua and runs on all of mentioned Lua versions.

Luacheckは、Lua 5.1～5.4とLuaJITのシンタックスを使用したLuaファイルのチェックをサポートします。
Luacheck自身はLuaで書かれており、前述のすべてのLuaバージョンで動作します。
```

いつも通り`Lua`の`linter`である`Luacheck`を試しながら進めようと思ったんですが...。

![Luacheck](img/luacheck.webp)

実はわたし自身、今までこれを使ってこなかったので「えぇ...😨」ってなりました。

でも、これはだいじょーぶ。

`luarocks`のインストールは`brew`とか`apt`とかでお手軽にできるので、
あらかじめこれを行った上で再度`mason.nvim`から`Luacheck`をインストールすれば進めるはずです😌

![luarocks](img/luarocks.webp)

![Luacheck](img/luacheck-install.webp)

できました😆

`Luacheck`が対応している言語はもちろん`Lua`です☺️

![deprecated](img/deprecated.webp)

ちゃんと正しいコードなんだけど、`vim`が全部怒られるので「えぇ...😨」ってなります。

```admonish note
あとなんていうか、`Deprecated`になっている`nvim_buf_get_option`を自分が使っていることを把握していませんでした...。
```

ほんとはちゃんと`vim`変数と`nvim_buf_get_option`に触れなきゃいけないと思うんですが、
まずは17節を先に書き上げてしまいたいので、`Issues`に挙げとくってことで見逃してください...😅

```admonish error title=""
重ねてごめんなさいなんですが...。

初掲時に「`vim`は知らないのに`nvim_buf_get_option`が`Deprecated`なのは知ってる、とってもクセつよさんでした❗」

...とか書いちゃいましたが、これは`Luacheck`が出しているものではありませんでした😭
```

### Biome

```admonish info title="[Biome](https://biomejs.dev)"
One toolchain for your web project
Format, lint, and more in a fraction of a second.

Web開発のためのたった1つのツールチェーン
format、lint など一瞬で完了させます！
```

```admonish info title=""
**Biome** はWebプロジェクトのための高性能なツールチェーンであり、
プロジェクトの健全性を維持するための開発者ツールの提供を目的としています。

([README.ja.md](https://github.com/biomejs/biome/blob/main/packages/%40biomejs/biome/README.ja.md)より)
```

わたしも普段お世話になってる`Biome`です。

確認してないんだけど、こっちはインストールと動作に`npm`が必要なんじゃないかな❓

```admonish info title="[Expand Biome’s language support](https://biomejs.dev/blog/roadmap-2024/#expand-biomes-language-support)"
CSS is our next language of focus, and we are making good progress. HTML and Markdown will follow.
Follow our [up-to-date page](https://biomejs.dev/internals/language-support/) to keep up with the progress of our work.

CSSは次の重点言語であり、順調に進んでいます。HTMLとMarkdownはその後に続く予定です。
私たちの仕事の進捗状況を知るために、[最新のページ](https://biomejs.dev/internals/language-support/)をフォローしてください。
```

現時点 (2023/01/30) では`JSON`,`JavaScript`,`TypeScript`に対応していますが、
将来的には`CSS`,`HTML`,`Markdown`にも対応するんだって😆

![biome](img/biome.webp)

いつも通りインストールして`js`ファイルを開いてみたら...❓

![biome-hazard](img/biome-hazard.webp)

実際はこれでもちゃんと動くコードなんだけど、`Error`として報告してきます。

...。🙄

とってもクセ❗❗

このサイトでも特になんにも考えないで気軽に使い始めてたんですが、
最初はなんか未曾有のバイオハザード🧟‍♂️だったので「えぇ...😨」 ってなりました。

## Configuration file

ちょっとだけ補足しておくと、
`Luacheck`には`luacheckrc`、`biome`には`biome.json`みたいな、`Linter`のルールやマナーを調整する方法が用意されています。

たぶん他の`Linter`でもそうなってるんじゃないかな❓

ただ、そこまで詳しくもないわたくしなんかが首を突っ込んでも火傷するだけですので、このサイトでは扱いません🤐

(`Neovim`ともまた別のおはなしだし😅)

```admonish success title=""
Black, white, green, red

Can I take my friend to bed?

Pink, brown, yellow, orange and blue

I love you!
```

## All Together Now

ということで、`Linter`のおはなしでした😆

ここでは`lua`と`javascript`に限ってしまいましたが、
どの`Linter`を使う場合でも「似たようなもんだろー」と思ってもらえばだいじょうぶ❗

...たぶん😮

「えぇ...😨」ってなりました❓

そんな不安の退治法はひとつ。

Singing❗

```admonish info title=""
One!
```

```admonish info title=""
Two!
```

```admonish info title=""
Three!
```

```admonish info title=""
Four!!
```

```admonish success title=""
(Bom bom bom bompa bom!)

Sail the ship!
```

```admonish success title=""
(Bompa bom!)

Chop the tree!
```

```admonish success title=""
(Bompa bom!)

Skip the rope!
```

```admonish success title=""
(Bompa bom!)

Look at me!!
```

```admonish success title=""
All together now{{footnote: All Together Now (by [The Beatles](https://en.wikipedia.org/wiki/The_Beatles)):
McCartney は、観客に参加を求めるミュージック・ホールの伝統にインスパイアされたタイトル・フレーズを持つ、
子供向けの合唱曲だと説明している。
映画 "Yellow Submarine" のラストでは、この曲に合わせて各国語で "All Together Now" を意味する言葉が画面に現れる。
}}
!!
```

<div style="text-align: center; font-size: 110%; line-height: 0;">
<div style="margin-top: 4rem"></div>

All Together Now

<div style="margin-top: 4rem"></div>

TΩРА ОΛОI MAZI

<div style="margin-top: 4rem"></div>

Tutti insieme adesso

<div style="margin-top: 4rem"></div>

Nu allemaal samen

<div style="margin-top: 4rem"></div>

![all-together-now4](img/all-together-now1.webp)

<div style="margin-top: 4rem"></div>

Todos juntos ahora

<div style="margin-top: 4rem"></div>

![all-together-now4](img/all-together-now2.webp)

<div style="margin-top: 4rem"></div>

Kwa pamoja sasa

<div style="margin-top: 4rem"></div>

![all-together-now4](img/all-together-now3.webp)

<div style="margin-top: 4rem"></div>

Tous en choeur maintenant

<div style="margin-top: 4rem"></div>

![all-together-now4](img/all-together-now4.webp)

<div style="margin-top: 4rem"></div>

Allihopa tillammans nu

<div style="margin-top: 4rem"></div>

И ТЕПЕРЬ: ВСЕ ВМЕСТE

<div style="margin-top: 4rem"></div>

現在大家一齊唱

<div style="margin-top: 4rem"></div>

Und jetzt alle zusammen

<div style="margin-top: 4rem"></div>

それでは皆さん御一緒に

<div style="margin-top: 4rem"></div>
</div>

```admonish success
We are all together now!!{{footnote:
この曲のサブカレントについて、
"We are all together now" (僕たちは今 みんな一緒にいる) という二重の意味を持つと McCartney は述べている。
[Wikipedia](https://en.wikipedia.org/wiki/All_Together_Now_(Beatles_song))より
}}
```

```admonish warning title=""
じか〜い、じかい。

17.5.3話「えるえすぴーミーツミー」という おはなし。
```
