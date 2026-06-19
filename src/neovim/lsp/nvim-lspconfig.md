# nvim-lspconfig

```admonish info title="[nvim-lspconfig](https://github.com/neovim/nvim-lspconfig)"
Configs for the Nvim LSP client (:help lsp).

Nvim LSP クライアント (:help lsp) のコンフィグです。
```

さて、まずは`LSP`活用の基盤を築きましょう❗`nvim-lspconfig`の登場です😆

```admonish success title=""
And now, the end is near

And so I face the final curtain

そして今、終わりが近づいている

そして私は 最後の幕に臨む
```

## LSP

~~~admonish info title=":h lsp"
```txt
LSP client/framework                                     lsp LSP

Nvim supports the Language Server Protocol (LSP), which means it acts as
a client to LSP servers and includes a Lua framework `vim.lsp` for building
enhanced LSP tools.

Nvim は Language Server Protocol (LSP) をサポートしており、
LSP サーバーのクライアントとして動作し、
拡張 LSP ツールを構築するための Lua フレームワーク `vim.lsp` を含んでいます。

  https://microsoft.github.io/language-server-protocol/

LSP facilitates features like go-to-definition, find-references, hover,
completion, rename, format, refactor, etc., using semantic whole-project
analysis (unlike ctags).

LSPは、(ctags とは異なり) 意味論的なプロジェクト全体の分析を用いて、
go-to-definition、find-references、hover、completion、rename、format、refactor、
などの機能を容易にします。
```
~~~

本来ならここにある内容を自分で行っていく必要があるんですが、
「`setup`を呼んでくれるだけでいいよー」ってしてくれるのが、この`nvim-lspconfig`です。

```admonish info title="[Configurations](https://github.com/neovim/nvim-lspconfig/blob/master/doc/server_configurations.md)"
LSP configs provided by nvim-lspconfig are listed below.

nvim-lspconfigが提供するLSPコンフィグを以下に示します。
```

```admonish note
細かいカスタマイズをしたい場合は、デフォルト設定を選択的にオーバーライドして使うこともできます。
```

要するに便利ってことです❗❗

## Install

```admonish info title="[Install](https://github.com/neovim/nvim-lspconfig#install)"
Requires neovim version 0.8 above.

neovim version 0.8 以上が必要です。

Install nvim-lspconfig like any other Vim plugin, e.g. with packer.nvim:

nvim-lspconfig は他の Vim プラグインと同様に、例えば packer.nvim でインストールしてください
```

なんかもう何を言ってるのか全然分かる😑

```admonish success title=""
Regrets, I've had a few

But then again, too few to mention

後悔、まあ いくつかある

とはいえ、言及するには少なすぎる
```

## Configuration

```admonish info title="[Suggested configuration](https://github.com/neovim/nvim-lspconfig#suggested-configuration)"
nvim-lspconfig does not set keybindings or enable completion by default.
The following example configuration provides suggested keymaps for the most commonly used language server functions,
and manually triggered completion with omnifunc (\<c-x\>\<c-o\>).

nvim-lspconfig はデフォルトでキーバインドを設定したり、補完を有効にしたりしません。
次の設定例では、最もよく使われる言語サーバ機能のキーマップを提案し、
omnifunc (\<c-x\>\<c-o\>) による補完を手動でトリガしています。
```

オフィシャルには、おっそろしく迅速に`pyright`、`tsserver`、`rust_analyzer`{{footnote:
それぞれ、`Python`、`TypeScript`、`Rust`の Language Server です。
}}
のセットアップがされていますが、大胆にも、このサイトではこれらをスキップして、もっと汎用的な方法をとります❗

```admonish success title=""
I did what I had to do

And saw it through without exemption

私はすべきことをしたし

例外なく それをやり通したんだ
```

と、いうことで、ここではキーマップの設定だけしちゃいましょう😌

~~~admonish example title="extensions/nvim-lspconfig.lua"
```lua
-- Global mappings.
-- See `:help vim.diagnostic.*` for documentation on any of the below functions
vim.keymap.set('n', '<space>e', vim.diagnostic.open_float)
vim.keymap.set('n', '[d', function() vim.diagnostic.jump({ count = 1}) end)
vim.keymap.set('n', ']d', function() vim.diagnostic.jump({ count = -1}) end)
vim.keymap.set('n', '<space>q', vim.diagnostic.setloclist)

-- Use LspAttach autocommand to only map the following keys
-- after the language server attaches to the current buffer
vim.api.nvim_create_autocmd('LspAttach', {
  group = vim.api.nvim_create_augroup('UserLspConfig', {}),
  callback = function(ev)
    -- Enable completion triggered by <c-x><c-o>
    vim.bo[ev.buf].omnifunc = 'v:lua.vim.lsp.omnifunc'

    -- Buffer local mappings.
    -- See `:help vim.lsp.*` for documentation on any of the below functions
    local opts = { buffer = ev.buf }

    vim.keymap.set('n', 'gD', vim.lsp.buf.declaration, opts)
    vim.keymap.set('n', 'gd', vim.lsp.buf.definition, opts)
    vim.keymap.set('n', 'K', vim.lsp.buf.hover, opts)
    vim.keymap.set('n', 'gi', vim.lsp.buf.implementation, opts)
    vim.keymap.set('n', '<C-k>', vim.lsp.buf.signature_help, opts)
    vim.keymap.set('n', '<space>wa', vim.lsp.buf.add_workspace_folder, opts)
    vim.keymap.set('n', '<space>wr', vim.lsp.buf.remove_workspace_folder, opts)
    vim.keymap.set('n', '<space>wl', function()
      print(vim.inspect(vim.lsp.buf.list_workspace_folders()))
    end, opts)
    vim.keymap.set('n', '<space>D', vim.lsp.buf.type_definition, opts)
    vim.keymap.set('n', '<space>rn', vim.lsp.buf.rename, opts)
    vim.keymap.set('n', '<space>ca', vim.lsp.buf.code_action, opts)
    vim.keymap.set('n', 'gr', vim.lsp.buf.references, opts)
    vim.keymap.set('n', '<space>f', function()
      vim.lsp.buf.format { async = true }
    end, opts)
  end,
})
```
~~~

ほんとにキーマップの設定だけなので、サンプルそのままでしたね😅

それだけ面倒な設定をうまく包み込んでくれてるってことです。

~~~admonish note
っていうだけなのもつまんないので、ちょっとだけ...。

わたしは以下のキーマップだけ外して使ってます。

```lua
vim.keymap.set('n', 'gd', vim.lsp.buf.definition, opts)
```

これ、元の動作の方が使いやすいと思うのはわたしだけなのかな...。
~~~

ただ、まだお話し相手がいない状態なので、何にもできないんですけどね😅

あとこれ、いつもの❗

~~~admonish example title="extensions/init.lua"
```lua
use {
  'neovim/nvim-lspconfig',
  config = function() require 'extensions.nvim-lspconfig' end,
}
```
~~~

```admonish success title=""
I traveled each and every highway

私はあらゆる道を旅してきた
```

![nagashima3](img/nagashima3.avif)

```admonish success title=""
And more, much more than this

I did it my way{{footnote:
My Way (by [Frank Sinatra](https://en.wikipedia.org/wiki/Frank_Sinatra)):
Jacques Revaux が作曲し、Gilles Thibaut と Claude François が作詞した。

Claude François が 1967年に初演したフランス歌曲[Comme d'habitude](https://fr.wikipedia.org/wiki/Comme_d%27habitude)の音楽に乗せて
Frank Sinatra が 1969年に広めた曲である。

英語の歌詞はフランス語の原曲をアレンジしたものであり、[Paul Anka](https://en.wikipedia.org/wiki/Paul_Anka)が書いた。

原曲では "愛が冷めていく関係の中での日常" を歌っているが、
本作は曲中の語り手が、自分の死・生涯の終わりが近付く中で、人生で起こったすべての苦難に対し
「他人に流されることなく、自信を持って我が道を歩んできたことに "誇り" を持っている」という内容であり、
[Édith Piaf](https://fr.wikipedia.org/wiki/Édith_Piaf)の
[Non, je ne regrette rien](https://fr.wikipedia.org/wiki/Non,_je_ne_regrette_rien)に近い感情表現となっている。

Sinatra の他にも、[Elvis Presley](https://en.wikipedia.org/wiki/Elvis_Presley)、
[Sid Vicious](https://en.wikipedia.org/wiki/Sid_Vicious)など、さまざまなパフォーマーによって歌われた。

この曲は、自分自身を毅然と持ち、人生を悔いなく生きることの大切さを象徴するものとして多くの人々に共感を与えた。
[Wikipedia](https://en.wikipedia.org/wiki/My_Way)より
}}

だがもっと、それ以上にもっと大切なのは

私が私の意思で切り拓いてきた道だった
```

### LspAttach

`LspAttach`ってなんやねんってなりますが、これはもうそのままヘルプにあります。

~~~admonish info title=":h LspAttach"
```txt
                                                                   LspAttach
After an LSP client attaches to a buffer.

LSPクライアントがバッファにアタッチした後 (に発生するイベント)。
```
~~~

久しぶりに現れた`Automatic Command`は、[11章](../au/automatic-commands.html) に出てきたお話です。

```admonish info title="[nvim_create_autocmd](../au/nvim_create_autocmd.html)"
いつだっておじさんは熱くアドバイスしてくれます☺️
```

```admonish info title="[nvim_create_augroup](../au/nvim_create_augroup.html)"
うん。まず何よりもはっきりさせておきたいのは、auというのはautocmdの先頭2文字からきているようですね。
```

ここはもう "nvimトレーナー{{footnote:
このサイトの[10章](../options/options.html)・[11章](../au/automatic-commands.html)の主人公。
現チャンピオン❗
}}" に任せておけば安心ですね。

```admonish success title=""
I've loved, I've laughed and cried

I've had my fill; my share of losing

愛してきた、笑ってきた、涙だって流した

十分に味わった; 負けることだってあった
```

```admonish success title=""
And now, as tears subside

I find it all so amusing

しかし 涙はもう引いた

今となっては、全てがただ可笑しく思えるんだ
```

## My Way

ここはこれだけです。もう簡単でしょう❓

![lspconfig](img/lspconfig.avif)

繰り返しになりますが、これだけではまだ何もできません。

大丈夫です、基盤なんで。どっしり構えましょう😤

...ん❓😑

え、ちょっと待って。

nvimトレーナーは "ｎｖｉｍチャンピオン" なの⁉️ いつの間に⁉️

わたしが遊んでたりサボってたり Shazaaaaaaam!!🦸 とか叫んでたり、
Amazon のセールに合わせて自分へのご褒美を送ってあげたり受け取ったり、
さくらさくら〜🌸 とか舞い踊って酔い潰れていた間にも

nvimトレーナーは努力を続けていたってこと⁉️

```admonish success title=""
Yes, it was my way{{footnote:
もちろん、nvimトレーナーは目の前が真っ暗になることはあっても死ぬことはないです😉
}}

そう、私が歩んできた道
```
...。😮

> しんじれば
>
> チャンピオンも　ゆめ　じゃない❗

こうなったらお祝いだー❗❗🥳

<div class="slider">
  <div class="media">
    <video preload="none" width="1280" height="720" poster="img/mm-bon-odori-thumbnail.avif" loading="lazy">
      <source src="img/mm-bon-odori.webm" type="video/webm">
    </video>
    <video preload="none" width="1280" height="720" poster="img/anpanman-thumbnail.avif" loading="lazy">
      <source src="img/anpanman.webm" type="video/webm">
    </video>
  </div>
</div>

宴もたけなわではございますが、

とりあえ〜ずぅ ここぉ まあ でぇ〜〜〜え ってかぁ⁉️{{footnote: ポケモン音頭 (by ガルーラ小林):
1998年2月10日に[とりかえっこプリーズ](https://ja.wikipedia.org/wiki/とりかえっこプリーズ)のカップリング曲として
ピカチュウレコードからリリースされた。
}}

```admonish danger title=""
ライバル{{footnote: ライバル! (by [松本梨香](https://ja.wikipedia.org/wiki/松本梨香)):
1999年3月25日にピカチュウレコードからリリースされた。自身が声優として主演を務めるテレビアニメ
[ポケットモンスター](https://ja.wikipedia.org/wiki/ポケットモンスター_(1997-2002年のアニメ))の2代目オープニングテーマに起用された。
アニメのタイアップを手掛けるのは[めざせポケモンマスター](https://ja.wikipedia.org/wiki/めざせポケモンマスター)以来となった。
[Wikipedia](https://ja.wikipedia.org/wiki/ライバル!)より
}}どうし おかしいね

"まだまだ育てが 足りないぜ！"

それでも ホラ
```

```admonish danger title=""
選んだ道が 同じ道だから

"負けないぞ！"って いいながら

おなじ夢を 語り合う
```

```admonish success
でんどう　いり　おめでとう❗
```
