# vim.treesitter

```admonish danger
`nvim-treesitter`が使えているのであれば、このページにある手順は必要ないのでスキップしてしまって構いません❗
```

もしも`nvim-treesitter`が使用できなくなった場合...、
つまりこの先の説明で言うところの`plugins`が失われてしまった世界のおはなしです😢

~~~admonish info title=":h treesitter"
```txt
Treesitter integration                                 *treesitter*

Nvim integrates the `tree-sitter` library for incremental parsing of buffers:

Nvim は、バッファの増分解析のために`tree-sitter`ライブラリを統合しています：

https://tree-sitter.github.io/tree-sitter/

WARNING: Treesitter support is still experimental and subject to frequent
changes. This documentation may also not fully reflect the latest changes.

警告：Treesitter のサポートは依然として実験段階にあり、頻繁に変更される可能性があります。
また、このドキュメントには最新の変更が完全に反映されていない場合があります。
```
~~~

前のページで "destruction" などとイジってしまった{{footnote:
2026年時点で実在する
[真珠湾攻撃](https://ja.wikipedia.org/wiki/真珠湾攻撃)みたいな選挙を仕掛ける "れぇわ の武器商人" や、
[Attack on Pearl Harbor](https://en.wikipedia.org/wiki/Attack_on_Pearl_Harbor)みたいな戦争を仕掛ける "ぱわぁ による ぴぃす推進者"
の方を向いて言ってたつもりなんだけど...、ごめんなさい。
}}わたしがこれをやるのも、なかなかに狂っているのだけれど...😓

```admonish warning
このページの内容は`macOS`上の`Neovim 0.12.1`で動作を確認しています。
```

## Parsers

~~~admonish info title=":h treesitter-parsers"
```txt
PARSER FILES                                              treesitter-parsers*

Parsers are searched for as `parser/{lang}.*` in any 'runtimepath' directory.
If multiple parsers for the same language are found, the first one is used.

パーサーは、任意の 'runtimepath' ディレクトリ内で `parser/{lang}.*` の形式で検索されます。
同じ言語のパーサーが複数見つかった場合、最初のものが使用されます。

(NOTE: This typically implies the priority "user config > plugins > bundled".)

(注：これは通常、「ユーザー設定 > プラグイン > バンドル」という優先順位を意味します。)
```
~~~

この説明にあるように、`parser/{lang}.*`形式でファイルを配置していくために、
まずは`.config/nvim`配下に`parsers`ディレクトリを作成しておきましょう。

~~~admonish quote title="mkdir"
```sh
mkdir parsers
```
~~~

## Queries

~~~admonish info title=":h treesitter-query"
```txt
TREESITTER QUERIES                                          treesitter-query*

Treesitter queries are a way to extract information about a parsed |TSTree|,
e.g., for the purpose of highlighting. Briefly, a `query` consists of one or
more patterns. A `pattern` is defined over node types in the syntax tree. A
`match` corresponds to specific elements of the syntax tree which match a
pattern. Patterns may optionally define captures and predicates. A `capture`
allows you to associate names with a specific node in a pattern. A `predicate`
adds arbitrary metadata and conditional data to a match.

Treesitter のクエリは、解析済みの |TSTree| に関する情報を抽出するための手段であり、
例えばハイライト表示などの目的で使用されます。簡単に言えば、`query` は1つ以上の
パターンで構成されます。`pattern` は、構文木のノード型に対して定義されます。
`match` は、パターンに一致する構文木の特定の要素に対応します。
パターンには、オプションでキャプチャや述語を定義できます。
`capture` を使用すると、パターン内の特定のノードに名前を関連付けることができます。
`predicate` は、マッチに任意のメタデータや条件付きデータを追加します。

Queries are written in a lisp-like language documented in
https://tree-sitter.github.io/tree-sitter/using-parsers/queries/1-syntax.html
Note: The predicates listed there differ from those Nvim supports. See
|treesitter-predicates| for a complete list of predicates supported by Nvim.

クエリは、Lisp に似た言語で記述され、その詳細は
https://tree-sitter.github.io/tree-sitter/using-parsers/queries/1-syntax.html
注：そこに記載されている述語は、Nvim がサポートするものと異なります。Nvimがサポートする述語の完全なリストについては、
|treesitter-predicates| を参照してください。

Nvim looks for queries as `*.scm` files in a `queries` directory under
`runtimepath`, where each file contains queries for a specific language and
purpose, e.g., `queries/lua/highlights.scm` for highlighting Lua files.
By default, the first query on `runtimepath` is used (which usually implies
that user config takes precedence over plugins, which take precedence over
queries bundled with Nvim). If a query should extend other queries instead
of replacing them, use |treesitter-query-modeline-extends|.

Nvim は、`runtimepath` 配下の `queries` ディレクトリ内に `*.scm` ファイルとしてクエリを検索します。
各ファイルには特定の言語や目的に対応したクエリが含まれており、
例えば、Luaファイルのハイライト用には `queries/lua/highlights.scm` が使用されます。
デフォルトでは、`runtimepath` にある最初のクエリが使用されます
(これは通常、ユーザー設定がプラグインより優先され、プラグインが Nvim に同梱されているクエリより優先されることを意味します)。
クエリを置き換えるのではなく、他のクエリを拡張したい場合は、|treesitter-query-modeline-extends| を使用してください。

The Lua interface is described at |lua-treesitter-query|.

Lua インターフェースについては、|lua-treesitter-query| で説明されています。
```
~~~

なんだか色々書いてありますが、とりあえず

```txt
Nvim looks for queries as `*.scm` files in a `queries` directory under `runtimepath`
```

...ってことなので、これもまた`.config/nvim`配下に`queries`ディレクトリを作成しておきましょう。

~~~admonish quote title="mkdir"
```sh
mkdir queries
```
~~~

## treesitter-cli

もう一個だけ...。

このあと行うビルド作業には`treesitter-cli`が必要になるのでインストールしましょう。

`MacOS`であれば毎度お馴染み`Homebrew`を使えば簡単ですね。

~~~admonish quote title="install"
```sh
brew install tree-sitter-cli
```

> これは`treesitter`とはまた別のパッケージです。
~~~

## tree-sitter-rust

ここでは、`Rust`を例に進めます。

```admonish note
`lua`を例にとっても全然いいんだけど、これは既に`Neovim`に同梱されているので 🌛
```

なんかもう`nvim-treesitter`に依存しちゃってることを隠す気もありませんが、
[SUPPORTED_LANGUAGES](https://github.com/nvim-treesitter/nvim-treesitter/blob/4916d6592ede8c07973490d9322f187e07dfefac/SUPPORTED_LANGUAGES.md)
から`Rust`を探してみると、[tree-sitter-rust](https://github.com/tree-sitter/tree-sitter-rust)の URL が示されていますね。

これを`git`で取得しましょう。(一時的な作業をするだけなので適当な場所で良いです。)

~~~admonish quote title="Git Clone"
```sh
git clone depth --1 https://github.com/tree-sitter/tree-sitter-rust
```

そしたら中に入って...

```sh
cd tree-sitter-rust
```
~~~

ここからやることは 2つです😉

### build

前項でインストールした`tree-sitter-cli`を使ってビルドします。

~~~admonish quote title="Build"
```sh
tree-sitter build
```
~~~

うまくいけば`rust.dylib`が出来上がるはずです。

そしたら、これを`.config/nvim/parser`にコピーしましょう❗

```txt
Parsers are searched for as `parser/{lang}.*` in any 'runtimepath' directory.
```

ヘルプにある条件を満たせましたね🐶

### scm

`tree-sitter-rust`には`queries`ディレクトリが存在しているので、
この中にある`highlights.scm`,`injections.scm`,`tags.scm`を`.config/nvim/queries`に`rust`ディレクトリを作ってコピーしましょう。

```txt
Nvim looks for queries as `*.scm` files in a `queries` directory under `runtimepath`
```

こっちもヘルプの通りになりましたね🐱

## Confirm

ここまでで、ファイルツリーの全体像はこんな感じになるはずです。

~~~admonish info
```diff
 nvim
 ├── init.lua
 ├── lua
 │   ├── ...
 │   ...
+├── parser
+│   └── rust.dylib
+├── queries
+│   ├── rust
+│   │   ├── highlights.scm
+│   │   ├── injections.scm
+│   │   └── tags.scm
 ... ...
```
~~~

## CheckHealth

それでは`nvim`を起動して`checkhealth`を動かしてみましょう。

~~~admonish quote title="Check Health"
```vim
:che treesitter
```
~~~

そしたら、多分こんな感じの診断が出てくるでしょう❓

![health-treesitter](../../tmp/health-treesitter.webp)

`nvim`が同梱している`parsers`,`queries`と混じって、今回手動で追加した`rust`が確認できていれば成功です❗

## Wrap Up

今回例として挙げた`rust`では、とっても素直に出来るんですが、
`build`をするには`grammar.js`なのか、`parser.c`なのか、はたまた`grammar.json`なのかを必要とするらしいんですね。

(エラーメッセージでは "`grammar.json`が無い❗" って言われますが、詳しいことは知らない😅)

![tree-sitter-typescript](../../tmp/tree-sitter-typescript.webp)

例えば`Typescript`([tree-sitter-typescript](https://github.com/tree-sitter/tree-sitter-typescript))なんかだと、
トップに`grammar.js`は存在しなくて、`typescript`と`tsx`っていうディレクトリの中にそれぞれの`grammar.js`が存在しているので、
そこに移動して`build`するとうまくいきます。

仕様と言うのか、もしくは規格と言うのか、はたまたお作法なのか、
雰囲気は実におおらかなものらしいので、なんかたまに小さな差異があって面倒くさいです🥺

```admonish success
`nvim-treesitter`が使えないと、こんなにも面倒な作業を自分で全部やらないといけないってことですね❗
```

## 𝒬𝓊𝑒𝑒𝓃𝒾𝑒 𝓔𝔂𝑒 🖊️

<div style="color: #999999; font-size: 90%; text-align: center;">
<div style="margin-top: 8em">
There were rules you never told me

僕に教えてくれないルールがあった
</div>

<div style="margin-top: 4em">
Never came up with a plan

何ひとつ計画も示さなかった
</div>

<div style="margin-top: 4em">
All the stories that you sold me

君が売りつけてきた物語も全て
</div>

<div style="margin-top: 4em">
Didn't help me understand

何ひとつ 僕を理解へは導かなかった
</div>

<div style="margin-top: 6em">
But I had to get it worked out

それでも解決しなければならなかった
</div>

<div style="margin-top: 4em">
Had nobody who could help

誰も助けてはくれなかった
</div>

<div style="margin-top: 4em">
So then in the end it turned out

それで結局分かったんだ
</div>

<div style="margin-top: 4em">
That I had to do it by myself

自分でやるしかないってことが
</div>

<div style="margin-top: 8em">
Life's a game of rag to riches

人生は 貧乏から金持ちへのゲーム
</div>

<div style="margin-top: 4em">
Dogs and bitches hunt for fame

名声に群がる 野良犬やビッチども
</div>

<div style="margin-top: 4em">
Different goods, you know which way to turn

選べる品なんて腐るほどある, もう分かってるだろ
</div>

<div style="margin-top: 6em">
Make a day on the snitches

密告で食ってる連中さ
</div>

<div style="margin-top: 4em">
Wicked witches fan the flame

邪悪な魔女たちが 炎を煽る
</div>

<div style="margin-top: 4em">
Careful what you touch in case you burn

触れるものには注意しろ 丸焦げになるかもな
</div>

<div style="margin-top: 12em">
Queenie eye{{footnote:
Queenie Eye (by [Paul McCartney](https://en.wikipedia.org/wiki/Paul_McCartney)):
プロデューサーの[Paul Eqworth](https://en.wikipedia.org/wiki/Paul_Epworth)と共に作詞作曲した楽曲である。
2013年にリリースされた McCartney のソロアルバム[New](https://en.wikipedia.org/wiki/New_(album))からの 2枚目のシングルである。

McCartney は、この曲のタイトルとサビの歌詞は、彼が幼い頃に遊んでいた
[Queenie, Queenie, who's got the ball?](https://en.wikipedia.org/wiki/Queenie,_Queenie,_who%27s_got_the_ball%3F)
という子供向けの遊びに由来すると説明している("Queenie"は "Queenie Eye" や "Queenio" とも呼ばれていた)。
彼は、その遊びで覚えている掛け声をそのまま曲に取り入れたという。

2014年の[56th Annual Grammy Awards](https://en.wikipedia.org/wiki/56th_Annual_Grammy_Awards)でのパフォーマンスでは、
Beatle の仲間である[Ringo Starr](https://en.wikipedia.org/wiki/Ringo_Starr)がドラムを担当した。

この曲のミュージックビデオは、McCartney の娘 Mary の夫である Simon Aboud が監督を務めた。俳優の
[Johnny Depp](https://en.wikipedia.org/wiki/Johnny_Depp),[Jeremy Irons](https://en.wikipedia.org/wiki/Jeremy_Irons),
[Chris Pine](https://en.wikipedia.org/wiki/Chris_Pine),[Jude Law](https://en.wikipedia.org/wiki/Jude_Law)をはじめ、
プロデューサーの[Giles Martin](https://en.wikipedia.org/wiki/Giles_Martin), モデルの[Kate Moss](https://en.wikipedia.org/wiki/Kate_Moss)など、
数多くの著名人がこの曲に合わせて踊る姿が映し出されている。[Wikipedia](https://en.wikipedia.org/wiki/Queenie_Eye)より
}}, queenie eye, who's got the ball?

Queenie eye, queenie eye, ボールを持ってるのはだあれ？
</div>

<div style="margin-top: 4em">
I haven't got it, it isn't in my pocket

ぼくじゃないよ, ポケットにも入ってない
</div>

<div style="margin-top: 4em">
O-U-T spells out

O・U・T と綴ったなら
</div>

<div style="margin-top: 4em">
That's out

ほらアウト
</div>

<div style="margin-top: 6em">
Without a shadow of a doubt

疑う余地もないよ
</div>

<div style="margin-top: 4em">
'Cause you've been putting it about

だって 君はあっちこっち言いふらしてきたんだから
</div>

<div style="margin-top: 4em">
Hear the people shout

聞こえるだろ 民衆の叫び
</div>

<div style="margin-top: 4em">
Hear the people shout

聞けよ 人々の叫び
</div>

<div style="margin-top: 12em">
Play the game, taking chances

ゲームに挑み, チャンスを掴め
</div>

<div style="margin-top: 4em">
Every dance is much the same

どんなダンスも 大体同じ
</div>

<div style="margin-top: 4em">
Doesn't matter which event you choose

どの催しを選ぼうが構わない
</div>

<div style="margin-top: 6em">
Never blame circumstances

状況のせいにしてはいけない
</div>

<div style="margin-top: 4em">
With romances seldom came

ロマンスなんて滅多に訪れない
</div>

<div style="margin-top: 4em">
Never pick a fight you're gonna lose

負けることがわかっている喧嘩は 絶対にするな
</div>

<div style="margin-top: 24em"></div>

<div style="margin-top: 8em">
It'a long way to the finish

完結までは まだ遠い道のり
</div>

<div style="margin-top: 4em">
When you've never been before

行ったことがないなら尚更だ
</div>

<div style="margin-top: 4em">
I was nervous, but I did it

緊張はしたけど, やり遂げた
</div>

<div style="margin-top: 4em">
Now I'm going back for more

ここからまた獲りにいくぞ{{footnote:
McCartney と Depp は連絡先を交換するほどの仲であり、Depp の主演する映画
[Pirates of the Caribbean: Dead Men Tell No Tales](https://en.wikipedia.org/wiki/Pirates_of_the_Caribbean:_Dead_Men_Tell_No_Tales)に
[Jack Sparrow](https://en.wikipedia.org/wiki/Jack_Sparrow)の叔父 "Uncle Jack" として McCartney が出演した。
このキャラクターの名前は、MaCartney 自身の叔父である John "Jack" McCartney にちなんで付けられたものである。

短時間ではあるが、[Maggie May](https://en.wikipedia.org/wiki/Maggie_May_%28folk_song%29?utm_source=chatgpt.com)や
骸骨ジョークを用いて、ぼそっと [Barbossa](https://en.wikipedia.org/wiki/Hector_Barbossa) を示唆していて内容がなんか濃い気がしなくもない。

Jack Sparrow のモデルは[Keith Richards](https://en.wikipedia.org/wiki/Keith_Richards)であり、彼もまた
Jack の父[Captain Teague](https://en.wikipedia.org/wiki/List_of_Pirates_of_the_Caribbean_characters#Captain_Teague)としてシリーズに出演している。
}}
</div>

<div style="margin-top: 16em">
That's out

ほらアウト
</div>

<div style="margin-top: 8em">
Hear the people shout

聞こえるだろ 民衆の叫び
</div>

<div style="margin-top: 24em"></div>

<div style="margin-top: 4em">
Hear the people shout

聞こえるだろ 民衆の叫び
</div>

<div style="margin-top: 4em">
Hear the people shout

聞けよ 人々の叫び
</div>

<div style="margin-top: 4em">
Hear the people shout...

聞こえてるだろ...
</div>

<div style="margin-top: 8em"></div>

</div>
