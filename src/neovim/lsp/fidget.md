# fidget.nvim

大変だ〜❗夏休みが終わってしまうぅぅ😭

前回の "Abbey Road, London" から「あっ❗」てな間に 1ヶ月半くらい経っているので、「そらそやわー。」てな感じですね😅

そんなこんなな中、"高円寺道路, 東京" に行ってみたら 💃 阿波おど{{footnote:
阿波踊り（あわおどり）は、阿波国（現・徳島県）を発祥とする盆踊り。
高知のよさこい祭りと愛媛の新居浜太鼓祭りと並ぶ四国三大祭りであり、日本三大盆踊りの一つとしても知られる。
[Wikipedia](https://en.wikipedia.org/wiki/Awa_Dance_Festival)より
}}ってて POWER 漲ってました⭐ 🕺

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
(唐突な登場ですが) `null-ls.nvim`{{footnote: [null-ls.nvim](https://github.com/jose-elias-alvarez/null-ls.nvim):
残念ながら、この夏休みの間に開発終了([IMPORTANT: Archiving null-ls](https://github.com/jose-elias-alvarez/null-ls.nvim/issues/1621))
になっちゃったみたい...。Thank you for your hard work❗}}
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
    <video controls preload="none" width="1280" height="720" poster="img/awa-nihonbashi-thumbnail.webp">
      <source src="img/awa-nihonbashi.webm" type="video/webm">
      Your browser does not support the video/webm.
    </video>
    <video controls preload="none" width="1280" height="720" poster="img/awa-ogikubo-thumbnail.webp">
      <source src="img/awa-ogikubo.webm" type="video/webm">
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
    <video controls preload="none" width="1280" height="720" poster="img/awa-tenguren-thumbnail.webp">
      <source src="img/awa-tenguren.webm" type="video/webm">
      Your browser does not support the video/webm.
    </video>
    <video controls preload="none" width="1280" height="720" poster="img/awa-tenshouren-thumbnail.webp">
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
