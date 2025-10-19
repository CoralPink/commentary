# fidget.nvim

大変だ〜❗夏休みが終わってしまうぅぅ😭

前回の "Abbey Road, London" から「あっ❗」てな間に 1ヶ月半くらい経っているので、「そらそやわー。」てな感じですね😅

そんなこんなな中、"高円寺道路, 東京" に行ってみたら 💃 阿波おどってて POWER 漲ってました⭐ 🕺
{{footnote:
阿波踊り (あわおどり) は、阿波国 (現・徳島県) を発祥とする盆踊り。
[三味線](https://ja.wikipedia.org/wiki/三味線)、[太鼓](https://ja.wikipedia.org/wiki/太鼓)、
[鉦鼓](https://ja.wikipedia.org/wiki/鉦鼓)、[篠笛](https://ja.wikipedia.org/wiki/篠笛)などの
2拍子の伴奏にのって連 (れん) と呼ばれる踊り手の集団が踊り歩く。

現在は、阿波国以外にも伝播し、東京都など他の地域でも大規模に開催されるようになっている
([各地の阿波踊り](https://ja.wikipedia.org/wiki/阿波踊り#各地の阿波踊り)を参照)。
[Wikipedia](https://ja.wikipedia.org/wiki/阿波踊り)より
}}
{{footnote:
東京高円寺阿波おどり (とうきょうこうえんじあわおどり) は、東京都杉並区高円寺において毎年 8月下旬に開催される阿波踊り。
[徳島市阿波おどり](https://ja.wikipedia.org/wiki/徳島市阿波おどり)に次ぐ大会規模で、東京周辺では最大である。
JR高円寺駅前から東京メトロ新高円寺駅にかけての商店街および高南通りを舞台に開催される。
開催年を経るごとに知名度が上がり、現在では阿波踊りの本場である徳島県からも集団参加が見られるなど、
晩夏の風物詩として定着し、[浅草サンバカーニバル](https://ja.wikipedia.org/wiki/浅草サンバカーニバル)と共に
東京の代表的な夏祭りの1つとなっている。
[Wikipedia](https://ja.wikipedia.org/wiki/東京高円寺阿波おどり)より
}}

<div class="slider">
  <div class="media">
    ![koenji-2023-1](img/awa-koenji-2023-1.webp)
    ![koenji-2023-2](img/awa-koenji-2023-2.webp)
    ![koenji-2023-3](img/awa-koenji-2023-3.webp)
  </div>
</div>

```admonish success title=""
一かけ 二かけ 三かけて

四 (し) かけた踊りは止められぬ
```

```admonish note
すでにお気づきかとは思いますが、このサイトは "なんでもあり" なんですわぁ❗🤣
```

ロードマップは一旦置いといて、`fidget.nvim`からリスタートを切りましょう😉

```admonish info title="[fidget.nvim](https://github.com/j-hui/fidget.nvim)"
Standalone UI for nvim-lsp progress. Eye candy for the impatient.

nvim-lspの進捗を確認するためのスタンドアロンUIです。せっかちな人のための目の保養に。
```

## 一 : Why?

```admonish info title="[Why?](https://github.com/j-hui/fidget.nvim#why)"
The goals of this plugin are:

- to provide a UI for nvim-lsp's [progress](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#progress) handler.
- to be easy to configure
- to stay out of the way of other plugins (in particular status lines)

このプラグインの目標は、以下の通りです：

- nvim-lsp の[プログレス](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#progress))ハンドラのUIを提供すること。
- 簡単に設定できるようにする
- 他のプラグイン（特にステータスライン）の邪魔にならないようにする。

The language server protocol (LSP) defines an
[endpoint](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#progress) for
servers to report their progress while performing work.
This endpoint is supported by Neovim's builtin LSP client, but only a handful
of plugins (that I'm aware of) make use of this feature.
Those that do typically report progress in the status line, where space is at
a premium and the layout is not well-suited to display the progress of
concurrent tasks coming from multiple LSP servers.
This approach also made status line configuration more complicated.

言語サーバープロトコル（LSP）は、サーバーが作業中に進捗状況を報告するための
[エンドポイント](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#progress)を定義しています。
このエンドポイントはNeovimの内蔵LSPクライアントでサポートされていますが、
この機能を利用するプラグインは（私が知る限りでは）ほんの一握りです。
そのようなプラグインは通常、ステータス・ラインに進捗状況を表示しますが、スペースが限られているため、
複数のLSPサーバーから同時に送られてくるタスクの進捗状況を表示するには、レイアウトが適していません。
また、この方法はステータスラインの設定をより複雑にしていました。

I wanted be able to see the progress reported by LSP servers without involving the status line.
Who doesn't love a little bit of eye candy?

私は、ステータスラインを介さずにLSPサーバーから報告される進捗を確認できるようにしたかったのです。
ちょっと目を惹くものが嫌いな人はいないでしょう?
```

セットアップはお手軽なのに見た目が超面白いのでおすすめです❗

ただ、"この機能を利用するプラグインは（私が知る限りでは）ほんの一握りです。"とあるように、
人によっては普段使用する`LSP`では`fidget.nvim`の能力を発揮できない可能性もあります。

```admonish note
わたしが普段使っているもので言うと、
`typescript-language-server`や`rust_analyzer`は対応しているようです😉
```

```admonish tip
(唐突な登場ですが) `null-ls.nvim`{{footnote: [null-ls.nvim](https://github.com/jose-elias-alvarez/null-ls.nvim)は
2023年の夏休みの間に開発終了([IMPORTANT: Archiving null-ls](https://github.com/jose-elias-alvarez/null-ls.nvim/issues/1621))
になっちゃったみたい。Thank you for your hard work❗}}
/ `none-ls.nvim`{{footnote:
...そして null-ls.nvim の後継として生まれた[none-ls.nvim](https://github.com/nvimtools/none-ls.nvim)は、
[17.4章](../../outro/none-ls.html)で登場します。}}
と併用すると、`Formatter`の進捗も可視化してくれるのが便利なんですよね〜😽
```

## 二 : Requirements

```admonish abstract title="[Requirements](https://github.com/j-hui/fidget.nvim#requirements)"
- Neovim v0.7.0+
- [nvim-lsp](https://github.com/neovim/nvim-lspconfig)
- An LSP server that implements LSP's [progress](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#progress) endpoint

Having a working nvim-lsp setup is not technically necessary to _setup_ the
plugin, but it won't do anything without a source of progress notifications.
For an up-to-date list of LSP servers this plugin is known to work with, see
[this pinned issue](https://github.com/j-hui/fidget.nvim/issues/17).

nvim-lsp が動作していることは、技術的にはプラグインをセットアップするのに必要ではありませんが、
進行状況を通知するソースがなければ何もすることができません。
このプラグインが動作することが確認されているLSPサーバーの最新リストについては、
[このピン留めされた問題](https://github.com/j-hui/fidget.nvim/issues/17)を参照してください。
```

この辺はもう大丈夫でしょう❗

## 三 : Config

そんで、この辺ももう大丈夫でしょう❓

~~~admonish example title="extensions/fidget.lua"
```lua
require('fidget').setup {
  progress = {
    display = {
      progress_icon = { pattern = 'meter', period = 1 },
    },
  },
}
```
~~~

### 四 : Options

全てのカスタマイズ項目は以下で説明されています。

```admonish info title="[Options](https://github.com/j-hui/fidget.nvim/blob/main/doc/fidget.md#options)"
The following table shows the default options for this plugin:
```

やっとさー💃 やっとやっとー🕺

<div class="slider">
  <div class="media">
    <video preload="none" width="1280" height="720" data-poster="img/awa-nihonbashi-thumbnail.webp">
      <source src="img/awa-nihonbashi.webm" type="video/webm">
      Your browser does not support the video/webm.
    </video>
    <video preload="none" width="1280" height="720" data-poster="img/awa-ogikubo-thumbnail.webp">
      <source src="img/awa-ogikubo.webm" type="video/webm">
      Your browser does not support the video/webm.
    </video>
    <video preload="none" width="1280" height="720" data-poster="img/awa-kichijoji-thumbnail.webp">
      <source src="img/awa-kichijoji.webm" type="video/webm">
      Your browser does not support the video/webm.
    </video>
  </div>
</div>

ようけやっとるでないで❗

#### 五 : Spinners

ようけありますが、わたしは`progress_icon`だけ変えてます😆

```admonish info title="[Spinners](https://github.com/j-hui/fidget.nvim/blob/main/doc/fidget.md#spinners)"
See <lua/fidget/spinners.lua> of this plugin's source code to see how each animation is defined.

各アニメーションがどのように定義されているかは、このプラグインのソースコードの <lua/fidget/spinners.lua> を参照してください。
```

お好みで選びましょう❗

わたしは`meter`がお気に入りです☺️

```admonish warning title=""
![starry-starry-awaodorry](img/starry-starry-awaodorry.webp)

もはや避けて通る方が難しい⭐
```

## 六 : Setup

いつも通りでOKです❗

~~~admonish example title="extensions/init.lua"
```lua
  use {
    'j-hui/fidget.nvim',
    config = function() require 'extensions.fidget' end,
    requires = 'neovim/nvim-lspconfig',
  }
```
~~~

## 七 : Try!

例えば`typescript-language-server`が動く環境で`js`ファイルを開けば...、

![fidget1](img/fidget1.webp)

ここにパワーが溜まってきただろう❗❗

![fidget2](img/fidget2.webp)

## 八 : やっぱり踊りは止められぬ

<div class="slider">
  <div class="media">
    <video preload="none" width="1280" height="720" data-poster="img/awa-tenguren-thumbnail.webp">
      <source src="img/awa-tenguren.webm" type="video/webm">
      Your browser does not support the video/webm.
    </video>
    <video preload="none" width="1280" height="720" data-poster="img/awa-tenshouren-thumbnail.webp">
      <source src="img/awa-tenshouren.webm" type="video/webm">
      Your browser does not support the video/webm.
    </video>
  </div>
</div>

```admonish success
五かけ 六かけ 七かけて

八 (や) っぱり踊りは止められぬ
```

<script type="module">
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await import(`${document.getElementById('bookjs').dataset.pathtoroot}slider.js`);
  } catch (e) { console.error(e); }
});
</script>
