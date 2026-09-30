# nvim-lspconfig

```admonish success title=""
And now, the end is near{{footnote:
[Paul Anka](https://en.wikipedia.org/wiki/Paul_Anka)は、南フランスで休暇を過ごしていたときに、フランス語の原曲を耳にした。
彼は Paris へ飛び、曲の権利について交渉した。 Anka は、名目上は正式な対価として1ドルを支払うことで、楽曲の翻案、録音、出版に関する権利を取得した。
(Anka や彼の指定した人物が新たに制作・発表するどのバージョンについても、3人の作曲者が原曲に対して持つロイヤリティの取り分はそのまま維持する、という条件が付いていた。)

その後しばらくして、 Anka は Florida で [Frank Sinatra](https://en.wikipedia.org/wiki/Frank_Sinatra) と "マフィアの連中を2、3人" 交えた夕食を共にした。
その席で Sinatra はこう言った。"俺はもう仕事を辞める。うんざりしたよ。もうここから出ていくんだ。"

New York に戻った Anka は、Sinatra のために原曲を書き直した。メロディーの構成もわずかに変更し、歌詞のテーマは大きく変えた。
"午前1時、古い IBM の電動タイプライターの前に座って、 "もし Frank がこれを書くとしたら、何を言うだろう? と考えた。
そして、比喩的に言えば、'And now the end is near' から書き始めたんだ。"
}}

And so I face the final curtain

そして今 終わりが近づいている

そして私は 最後の幕に臨む
```

さて、まずは`LSP`活用の基盤を築きましょう❗`nvim-lspconfig`の登場です😆

```admonish info title="[nvim-lspconfig](https://github.com/neovim/nvim-lspconfig)"
Configs for the Nvim LSP client (:help lsp).

Nvim LSP クライアント (:help lsp) のコンフィグです。
```

<youtube-video data-id="LWIh3nG0SdE"></youtube-video>

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

```admonish success title=""
My friend, I'll say it clear

I'll state my case, of which I'm certain

友よ、率直に話すよ

私が確かだと思えることを、聞いてほしい
```

## Install

```admonish info title="[Install](https://github.com/neovim/nvim-lspconfig#install)"
Requires neovim version 0.8 above.

neovim version 0.8 以上が必要です。

Install nvim-lspconfig like any other Vim plugin, e.g. with packer.nvim:

nvim-lspconfig は他の Vim プラグインと同様に、例えば packer.nvim でインストールしてください
```

なんかもう何を言ってるのか全然分かる😑

```admonish success title=""
I've lived a life that's full

I traveled each and every highway

私は 満ち足りた人生を送ってきた

あらゆる道を旅してきたんだ
```

![nagashima3](img/nagashima3.avif)

## Configuration

```admonish info title="[Suggested configuration](https://github.com/neovim/nvim-lspconfig#suggested-configuration)"
nvim-lspconfig does not set keybindings or enable completion by default.
The following example configuration provides suggested keymaps for the most commonly used language server functions,
and manually triggered completion with omnifunc (\<c-x\>\<c-o\>).

nvim-lspconfig はデフォルトでキーバインドを設定したり、補完を有効にしたりしません。
次の設定例では、最もよく使われる言語サーバ機能のキーマップを提案し、
omnifunc (\<c-x\>\<c-o\>) による補完を手動でトリガしています。
```

オフィシャルには、おっそろしく迅速に`pyright`、`tsserver`、`rust_analyzer`のセットアップがされていますが、
大胆にも、このサイトではこれらをスキップして、もっと汎用的な方法をとります❗

```admonish tip
それぞれ、`Python`、`TypeScript`、`Rust`の Language Server です。
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
And more, much more than this

そしてそれ以上に、もっと ずっと多くのこと
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

![lspconfig](img/lspconfig.avif)

ここはこれだけです。もう簡単でしょう❓

```admonish success title=""
I did it my way

自らのやり方で 選んできたんだ
```

## My Way

繰り返しになりますが、これだけではまだ何もできません。

大丈夫です、基盤なんで。どっしり構えましょう😤

...ん❓😑

え、ちょっと待って。

nvimトレーナーは "ｎｖｉｍチャンピオン" なの⁉️ いつの間に⁉️

わたしが遊んでたりサボってたり Shazaaaaaaam!!🦸 とか叫んでたり、
Amazon のセールに合わせて自分へのご褒美を送ってあげたり受け取ったり、
さくらさくら〜🌸 とか舞い踊って酔い潰れていた間にも

nvimトレーナーは努力を続けていたってこと⁉️

> しんじれば
>
> チャンピオンも　ゆめ　じゃない❗

...。😮

<media-slider>
  <video width="1280" height="720" data-poster="img/mm-bon-odori-thumbnail.avif">
    <source src="img/mm-bon-odori.webm" type="video/webm">
  </video>
  <video width="1280" height="720" data-poster="img/anpanman-thumbnail.avif">
    <source src="img/anpanman.webm" type="video/webm">
  </video>
</media-slider>

…いや、宴こしらえてもろうてるやないか👵

<div style="margin-top: 2em"></div>

```admonish success
でんどう　いり　おめでとう❗
```

<div style="color: #999999; font-size: 90%; text-align: center;">
<div style="margin-top: 8em">
Regrets, I've had a few

But then again, too few to mention

後悔、まあ いくつかある

とはいえ、数え上げるほどでもない
</div>

<div style="margin-top: 4em">
I did what I had to do

And saw it through without exemption

私は すべきことをしたし

何一つとして 逃げずに最後までやり通したんだ
</div>

<div style="margin-top: 4em">
I planned each charted course

Each careful step along the byway

自分の進む道を 一つ一つ 描き

脇道を進む時も 一歩一歩 慎重に踏み出した
</div>

<div style="margin-top: 4em">
And more, much more than this

そしてそれ以上に、もっと ずっと多くのことを
</div>

<div style="margin-top: 4em">
I did it my way

自ら選び 旅してきたんだ
</div>

<div style="margin-top: 8em">
Yes, there were times, I'm sure you knew

When I bit off more than I could chew

そう、君も知っているように

自分の手に負えないほどのものに 手を出した時があった
</div>

<div style="margin-top: 4em">
But through it all, when there was doubt

I ate it up and spit it out{{footnote:
"いろいろな雑誌を読んでいて、何もかもが 'my this' だの 'my that' だのと言っていることに気付いた。
あの頃は 'me generation' の真っ只中で、 Frank は、俺がそれを言わせるのにぴったりの人物だった。
俺なら絶対に使わないような言葉も使ったよ。'I ate it up and spit it out' なんてね。でも、それが Frank の話し方だったんだ。
[Rat Pack](https://en.wikipedia.org/wiki/Rat_Pack)の連中とスチームルームにいることもあったけど、彼らはマフィアみたいな話し方をするのが好きだったよ。
実際には、自分の影にさえ怯えていたような連中なのにね。"
}}

だがそんな状況に在っても 迷った時には

貪り喰って、吐き出した
</div>

<div style="margin-top: 4em">
I faced it all, and I stood tall

向き合い、そして立ち向かい
</div>

<div style="margin-top: 4em">
And did it my way{{footnote:
Anka は午前5時に曲を書き終えた。
"ネバダにいる Frank に電話したんだ。彼は[Caesars Palace](https://en.wikipedia.org/wiki/Caesars_Palace)にいた。
それで、'君のために、本当に特別なものができた' と言った。" Anka はさらにこう語っている。
"俺のレコード会社がこの曲のことを知ったとき、俺が自分のために取っておかなかったことに本気で腹を立てていた。俺は言ったよ。
'俺は書くことはできる。でも、俺はこれを歌う人間じゃない。これは Frank のための曲だ。他の誰でもない'って。"
1968年12月30日、Sinatra はこの曲を一発録りでレコーディングした。
バンドにはセッション・ドラマーの[Buddy Saltzman](https://en.wikipedia.org/wiki/Buddy_Saltzman)も参加していた。
My Way は1969年初頭に、同名アルバム及びシングルとしてリリースされた。
}}

そうして 私は旅を進めてきたんだ
</div>

<div style="margin-top: 8em">
I've loved, I've laughed and cried

I've had my fill, my share of losing

愛してきた、笑ってきた、涙だって流した

十分に味わった、 負けることだってあった
</div>

<div style="margin-top: 4em">
And now, as tears subside

I find it all so amusing

しかし 涙はもう引いた

今となっては、全てがただ可笑しく想えるんだ
</div>

<div style="margin-top: 4em">
To think I did all that

And may I say, not in a shy way

思えば 私はそんな全てを経験してきた

遠慮なく言わせてもらうなら...
</div>

<div style="margin-top: 4em">
Oh, no, oh, no, not me

いや 違う 違ったな そんなのは私らしくない
</div>

<div style="margin-top: 4em">
I did it my way{{footnote:
アメリカでは[Billboard Hot 100](https://en.wikipedia.org/wiki/Billboard_Hot_100)で27位、
[Easy Listening](https://en.wikipedia.org/wiki/Adult_Contemporary_(chart))チャートで2位を記録した。
イギリスではさらに長くチャートに残り、1969年4月から 1971年9月まで、通算 75週間にわたってトップ40入りを果たした。
これは現在に至るまで破られていない記録である。
トップ75 にはさらに 47週間ランクインしたが、最初のチャート登場時に記録した 5位を上回ることはなかった。

[Billboard](https://en.wikipedia.org/wiki/Billboard_(magazine))は、"力強く、
豊かで商業的な[Don Costa](https://en.wikipedia.org/wiki/Don_Costa)のアレンジとプロデュースが、
Sinatra の最高傑作のひとつとも言える歌唱をさらに引き立てている" と評した。
[Cash Box](https://en.wikipedia.org/wiki/Cash_Box)も、"力強い楽曲に、見事に心を動かすパフォーマンスが加わっている。
この曲はティーンから大人まで幅広いリスナーを持つ番組のプログラマーたちから、きっと絶賛されるだろう" と評した。

この曲は Sinatra の代表曲となったが、娘の[Tina](https://en.wikipedia.org/wiki/Tina_Sinatra)によれば、本人は次第にこの曲を嫌うようになったという。
"彼はあの曲が好きじゃなかった。あの曲が付きまとって、靴から取れない泥みたいになっていたのよ。"
"彼はいつも、あの曲は自分を大きく見せるための、自己満足的なものだと思っていた。"
2000年、Sinatraが 1969年に[Reprise Records](https://en.wikipedia.org/wiki/Reprise_Records)から発表した My Way は、
[Grammy殿堂入り](https://en.wikipedia.org/wiki/Grammy_Hall_of_Fame)を果たした。
}}

自ら進み 歩んできたんだ
</div>

<div style="margin-top: 8em">
For what is a man, what has he got?

人とは何か 何を得るというのか?
</div>

<div style="margin-top: 4em">
If not himself, then he has naught

自分を持たないのであれば 何者でもない
</div>

<div style="margin-top: 4em">
To say the things he truly feels

And not the words of one who kneels

平伏す者が発する言葉ではなく

自分の本心を率直に伝えることだ
</div>

<div style="margin-top: 4em">
The record shows I took the blows

幾多の苦難は 私の道に刻まれている
</div>

<div style="margin-top: 4em">
And did it my way

私が歩んできた道
</div>

<div style="margin-top: 4em">
Yes, it was my way{{footnote:
My Way (by [Frank Sinatra](https://en.wikipedia.org/wiki/Frank_Sinatra)):
Jacques Revaux が作曲し、Gilles Thibaut と Claude François が作詞した。

Claude François が 1967年に初演したフランス歌曲[Comme d'habitude](https://fr.wikipedia.org/wiki/Comme_d%27habitude)の音楽に乗せて
Frank Sinatra が 1969年に広めた曲である。

英語の歌詞はフランス語の原曲をアレンジしたものであり、[Paul Anka](https://en.wikipedia.org/wiki/Paul_Anka)が書いた。

原曲では "愛が冷めていく関係の中での日常" を歌っているが、
本作は曲中の語り手が、自分の死・生涯の終わりが近付く中で、人生で起こったすべての苦難に対し
"他人に流されることなく、自信を持って人生を歩んできたことに "誇り" を持っている" と伝える内容であり、
[Édith Piaf](https://fr.wikipedia.org/wiki/Édith_Piaf)の
[Non, je ne regrette rien](https://fr.wikipedia.org/wiki/Non,_je_ne_regrette_rien)に近い感情表現となっている。

Sinatra の他にも、[Elvis Presley](https://en.wikipedia.org/wiki/Elvis_Presley)、
[Sid Vicious](https://en.wikipedia.org/wiki/Sid_Vicious)など、さまざまなパフォーマーによって歌われた。
この曲は、自分自身を毅然と持ち、人生を悔いなく生きることの大切さを象徴するものとして多くの人々に共感を与え、
2026年6月、[CBS News](https://en.wikipedia.org/wiki/CBS_News)は、過去250年間に生まれたアメリカの必聴曲250曲の一つに My Way を選出した。
[Wikipedia](https://en.wikipedia.org/wiki/My_Way)より
}}

これこそ 私の人生…
</div>
</div>

<div style="margin-top: 8em"></div>
