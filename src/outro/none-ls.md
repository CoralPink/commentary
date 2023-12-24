# none-ls.nvim

`null-ls.nvim`が撤退しちゃったら、
このサイトで`linter`/`formatter`を扱う機会もなくなっちゃったなー😑 っていう心残りがあったんですが...。

```admonish info title="[none-ls.nvim](https://github.com/nvimtools/none-ls.nvim)"
`null-ls.nvim` Reloaded, maintained by the community.

Only the repo name is changed for compatibility concerns. All the API and future changes will keep in place as-is.

`null-ls.nvim` リローデッド、コミュニティによってメンテナンスされます。

互換性を考慮し、リポジトリ名のみを変更。すべてのAPIと将来の変更はそのまま維持されます。
```

生きていたのか。`null-ls`の意志は...👁️

```admonish quote title=""
Let me take you down

'Cause I’m going to Strawberry Fields

きみを連れて行くよ

ぼくも Strawberry Fields に行くところなんだ
```

リポジトリは`nvimtools/none-ls`に移りましたが、パッケージ名は`null-ls`のままで進むそうです🤗

```admonish warning
このサイトの方針上、引用はそのまま載っけちゃうので、
(だってなんか "めんど"🙊 ...あ、いえ、なんでもないです😅)

`null-ls`って書いてあったり`none-ls`って書いてあったりで「わちゃわちゃ」しますが、
少なくともこのサイトでは (少し語弊があるかもしれませんが) 同じものとして扱います。
```

これさえやってしまえば、心残りなんてあろうはずがありません😉

## vim.lsp.buf.format

いきなり話が飛ぶようなんですが、`nvim-lspconfig`の設定の中にこんなのがありませんか❓

~~~admonish example title="extensions/nvim-lspconfig.lua"
```lua
vim.keymap.set('n', '<space>f', function()
  vim.lsp.buf.format { async = true }
end, opts)
```
~~~

なんだかとってもフォーマットしてくれそうな雰囲気が漂ってますね。

しかも`async`だなんて、これってセレブ感隠しきれてるんざます⁉️

いや、隠す気がないと言うべきか。

このサイトでは特に触れてこなかった (というよりは、わたしもそんなに詳しくはないので「これなかった」) んですが、
`Language Server`が`Formatter`機能を持っていれば、これは既に動かせる状態になってます😲

```admonish tip
例えば`lua-language-server`は [Features](https://github.com/LuaLS/lua-language-server#features) でも示されているように
`Code formatting`機能を含んでいます。

以下のようなぐっちゃぐちゃなコードがあったとしても...。

![lua-fmt-before](img/lua-fmt-before.webp)

<kbd>Space</kbd><kbd>f</kbd> ってやってみると...。

![lua-fmt-after](img/lua-fmt-after.webp)

こんな具合に正してくれます。
```

使用している`Language Server`が`Formatter`の機能を持っていなかったり、
もっと特化した`Formatter`や`Linter`を使いたい場合に`none-ls`は輝きます⭐

```admonish quote title=""
Nothing is real

And nothing to get hung about

現実には何もない

だからこだわる必要もない
```

## (Migration)

もし、これまで`null-ls.nvim`を使っていた場合は、リポジトリのパスを変えるだけでもマジでそのまま動きます😉

```admonish info title="[Migration](https://github.com/nvimtools/none-ls.nvim#migration)"
Replace jose-elias-alvarez/null-ls.nvim with nvimtools/none-ls.nvim in your choice of package manager.

That's it.

お好みのパッケージマネージャーで、jose-elias-alvarez/null-ls.nvimをnvimtools/none-ls.nvimに置き換えてください。

これで完了です。
```

「初めまして」な人は次の項へ ❗

## Setup

```admonish info title="[Setup](https://github.com/nvimtools/none-ls.nvim#setup)"
Install null-ls using your favorite package manager. The plugin depends on
[plenary.nvim](https://github.com/nvim-lua/plenary.nvim), which you are
(probably) already using.

お好みのパッケージ・マネージャを使って null-ls をインストールします。プラグインは plenary.nvim に依存します、
(おそらく) すでに使っていることだろう。
```

(おそらく) すでに使っていることだろうし、いつものようにこんな感じだろう❓

~~~admonish example title="extensions/init.lua"
```lua
{
  'nvimtools/none-ls.nvim',
  dependencies = 'nvim-lua/plenary.nvim',
}
```
~~~

```admonish quote title=""
Living is easy with eyes closed

Misunderstanding all you see

目を閉じれば 生きるのは簡単だ

誤解だよ 全てが目に映るなんてのは
```

このサイトでは、`none-ls`に対してカスタマイズは行わないんですが、`setup()`は必要になります。

`packer.nvim`では

```lua
config = function() require('none-ls').setup() end,
```

...とかやってたんですが、`lazy.nvim`を使用しているのであれば、
`config = true`とするだけで`setup()`が呼ばれるそうです。

~~~admonish example title="extensions/init.lua"
```diff
{
  'nvimtools/none-ls.nvim',
  dependencies = 'nvim-lua/plenary.nvim',
+ config = true,
}
```
~~~

怠けられるところは積極的に怠けてっていいと思います😪

```admonish quote title=""
It’s getting hard to be someone

But it all works out

何者かになるのは難しくなってきた

でも 全てうまくいくよ
```

```admonish quote title=""
It doesn’t matter much to me

ぼくにはどうでもいい
```

## Config

もうすっかりお馴染みのセリフですが、キーマップはお好みで😸

~~~admonish tip
ついでに、タイムアウトを設けておくと安心感が増します。

```diff
vim.keymap.set('n', '<localleader>ff', function()
  vim.lsp.buf.format {
+   timeout_ms = 200,
    async = true,
  }
end)
```

> 「どの程度の大きさのファイルを扱うのか」だったり、
> マシンスペック、使用する`Formatter`のパフォーマンス、その他諸々なんか等と相談して調整してね❗

~~~

```admonish quote title=""
No one I think is in my tree

I mean it must be high or low

ぼくの樹には誰もいない

きっと 高すぎるか 低すぎるんだ
```

```admonish quote title=""
That is you can’t, you know, tune in

But it’s all right

That is, I think, it’s not too bad

それじゃあ、気が合うわけないよね

でも それはそれでいいんだ

それが悪いってことはないさ
```

## Setup

```admonish info title="[Setup](https://github.com/nvimtools/none-ls.nvim#setup)"
To get started, you must set up null-ls and register at least one source.
See BUILTINS for a list of available built-in sources and CONFIG for information about setting up and configuring null-ls.

開始するには、null-ls をセットアップし、少なくとも 1 つのソースを登録する必要があります。
利用可能な組み込みソースの一覧については [BUILTINS](https://github.com/nvimtools/none-ls.nvim/blob/main/doc/BUILTINS.md) を、
null-ls の設定と構成については [CONFIG](https://github.com/nvimtools/none-ls.nvim/blob/main/doc/CONFIG.md) を参照してください。
```

上にもあるように、`BUILTINS`と`CONFIG`を参考にして一個一個自分で書いていくのが正攻法です。

ソースのインストールも「自分でやってください」が基本です。

```admonish quote title=""
Always, no, sometimes think it’s me

But you know I know when it’s a dream

これがぼくだと思う いつも、いや、ときどき

でも分かるんだ これが夢であることは
```

なので「あっちこっち色々インストールしてこなきゃいけない❓🙄それはめんどくさい😮‍💨」な〜んて考えてしまうかもしれません。

が❗❗

安心してください。入ってますよ❗

そこをきっちりサポートしてくれる、とにかく明るい`mason.nvim`が既に入ってますよー❗

```admonish quote title=""
I think, er, no, I mean, er, yes

But it’s all wrong

That is I think I disagree

思うにこれは、NO じゃなくて YES なんだ

しかし すべて間違っている

ぼくは同意できない
```

そしてさらに、`mason.nvim`には心強い仲間がいるのです🤩

その名も`mason-null-ls.nvim`❗

つまり、もうちょっとだけ続く❗

続くったら続く... 🐅 🦍 🐘 🦒

...あれ❓なんか全然おわんねぇな🙄

## Strawberry Fields Forever

意地でも聖夜🌃には間に合わせます{{footnote: とは書いてはみたものの、間に合わなくても堪忍して...。}}。
`none-ls`に負けないくらい超スムーズにいきましょう😆

```admonish quote title="Success"
Strawberry Fields Forever {{footnote: Strawberry Fields Forever (by [The Beatles](https://en.wikipedia.org/wiki/The_Beatles)):
作詞は John Lennon、作曲は Lennon-McCartney。The Bealtes のこれまでのシングルとは一線を画し、
現代のポップ・リスナーにとって斬新なリスニング体験となった。
この曲は、Liverpool にある救世軍の児童養護施設、Strawberry Field の庭で遊んだ Lennon の幼少期の思い出に基づいて書かれている。

John の出生時、父は商船の乗組員として航海中で不在。
母も他の男性と同棲していたため、John は母親の長姉である "Mimi おばさん" に育てられる。

John の子供時代の楽しみのひとつは、毎年夏に家の近くの Calderstones Park で開かれるガーデンパーティで、
そこでは救世軍のブラスバンドが演奏していた。

後に Mimi は親戚に、「子どもは欲しくなかったが、John はずっと欲しかった」と打ち明けた。

Lennon は 1966年9月から10月にかけて、Richard Lester の映画 "How I Won the War" の撮影中、
Spain の Almería でこの曲を書き始めた。The Beatles は、"more popular than Jesus" (キリストよりも人気がある) という論争や、
Pilipinas の Imelda Marcos 大統領夫人を不用意にこき下ろした反動で暴徒の標的になるなど、
最も困難な時期を経て、ツアーを引退したばかりだった。

時を経て、New York City の Central Park の一角には Lennon を偲び、この曲にちなんだ区画が造られた。
[Wikipedia](https://en.wikipedia.org/wiki/Strawberry_Fields_Forever) より
}}

Strawberry Fields は永遠なんだ
```

~~~admonish success title=""
Hurry up, Mimi – we're going to be late.
{{footnote:
「その場所には、いつも John を魅了する何かがあった。彼は窓からそれを見ることができた。
彼はよく救世軍のバンドがガーデンパーティで演奏しているのを聴いていて、『Mimi、はやく行こうよ。遅れてしまうよ』と私を引っ張っていった」。
}}

Mimi、はやく行こうよ。遅れてしまうよ。
~~~
