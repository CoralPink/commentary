# Friendly Snippets

```admonish success title=""
She came in through the bathroom window{{footnote:
She Came In Through The Bathroom Window (by [The Beatles](https://en.wikipedia.org/wiki/The_Beatles)):
歌詞の内容は、McCartney の留守中にファンが自宅に忍び込むというエピソードが元になっている。
また、"So I quit the police department (だからぼくは警察署を辞めた)" というフレーズは、
1968年10月に後に McCartney の妻となる Linda Eastman と娘・Heather と共にタクシーで
John F.Kennedy 国際空港に向かっていたときに見た、
「ユージン・クイッツ、ニューヨーク警察署」と記された身分証明パネルから触発されたもの。
このフレーズについて McCartney は
「そこが無作為の素晴らしさ。もし僕があの男のタクシーに乗っていなかったら、この曲はずいぶんと違っていたと思う」と語っている。
本作のタイトルについて、John Lennon は「1968年5月にニューヨークを訪れた時に泊まっていたフラットで、
Paul がふと "She Came In Through The Bathroom Window (彼女は浴室の窓から入ってきた)"というフレーズを口にした。
つまりあのフレーズは何年も前からあるわけで、それをやっと仕上げたわけだ」と語っている。
[Wikipedia](https://en.wikipedia.org/wiki/She_Came_In_Through_the_Bathroom_Window)より
}}

彼女は浴室の窓から入ってきた
```

何者かがぬるっと入って来ましたが、そんな状況に反して`Friendly Snippets`は文字通りとっても friendly です❗

斬らないでください😶‍🌫️ 気楽にいきましょう❗

```admonish info title="[Friendly Snippets](https://github.com/rafamadriz/friendly-snippets)"
Snippets collection for a set of different programming languages.

様々なプログラミング言語のためのスニペット集です。

The only goal is to have one community driven repository for all kinds of snippets in all programming languages,
this way you can have it all in one place.

唯一の目標は、あらゆるプログラミング言語のあらゆる種類のスニペットを集めたコミュニティ主導のリポジトリを1つ持つことです、
そうすることで、一か所ですべてを手に入れることができるのです。
```

リポジトリを見てもわかる通り、`friendly-snippets`自体は`lua`のコードを持ってないんですね😮

もうほんとに純粋なスニペット集です😊

## Install

これ、実際は次の項で行う`paths`で認識させればいいだけなので、`packer`には更新管理だけを行ってもらいます😺

~~~admonish example title="extensions/init.lua"
```diff
  use {
    'hrsh7th/nvim-cmp',
    config = function() require 'extensions.nvim-cmp' end,
    requires = {
      'hrsh7th/cmp-nvim-lsp',
      {
        'L3MON4D3/LuaSnip',
        tag = "v1.*",
        run = 'make install_jsregexp',
        config = function() require 'extensions.luasnip' end,
-       requires = 'saadparwaiz1/cmp_luasnip',
+       requires = { 'saadparwaiz1/cmp_luasnip', 'rafamadriz/friendly-snippets' },
      },
    },
  }
```
~~~

```admonish success title=""
Protected by a silver spoon{{footnote:
「このフレーズは、彼女が裕福な家庭や特権階級に生まれたことを指しています。
一般的な意味では、"born with a silver spoon in one's mouth"というフレーズは、特権階級に生まれた人々を表現する際に使われることがあります。
歌詞では、彼女が窃盗や侵入の行為を行い、それが裕福な家庭や特権的な環境に反するものであることを描写しています。
"Protected by a silver spoon"というフレーズは、彼女が裕福な出自によって守られているという皮肉めいた意味合いを持っています。
ただし、歌詞の具体的な意図や背景は、曲の作者である`ポール・マッカートニーに尋ねることが必要`です。」[ChatGPT](https://chat.openai.com/)より

...。...はっ❗Bathroom windowからぬるっと入って尋ねればいいんだ🤣 ...んなアホな🙄}}

銀の匙に守られながら
```

## Setup

`packer`を使用して取得されたのであれば、当然`packer`の管理下に配置されます。

パスはちょっと複雑ですね😅

~~~admonish example title="extensions/luasnip.lua"
```lua
require('luasnip.loaders.from_vscode').lazy_load {
  paths = {
    vim.fn.stdpath('data') .. '/site/pack/packer/start/friendly-snippets',
    './snippets',
  },
}
```
~~~

```admonish tip
コード中にある`..`は`lua`の連結演算子です。
```

```admonish note
これも本当は`paths`を指定しなければもう勝手に見つけ出してくれるんですが、
既にパスを指定する形をとってしまっているので、"指定しない"方法と併用できないんですぅ😭
```

```admonish success title=""
Didn't anybody tell her?

Didn't anybody see?

誰も教えてあげなかったの？

誰も気づいてないの？
```

## Using

ここでは気分転換に`html`を開いてみました🐙

![friendly-snip](img/friendly-snip.webp)

ほら❗一目でわかるすっごいやつやん👺

```admonish success title=""
Sunday's on the phone to Monday

Tuesday's on the phone to me

日曜の事は月曜に電話する

火曜の事は僕にかかってくる
```

## Super-Tab

...と、いうことで`Super-Tab`を実践・活用できるコレクションが手に入りました❗

満を持して`LuaSnip`の`Keymaps`で説明を後回しにしていた`Super-Tab`に触れていきます🏄‍♀️

```admonish info title="[Keymaps](luasnip.html#keymaps)"
nvim-cmp's wiki also contains [an example](https://github.com/hrsh7th/nvim-cmp/wiki/Example-mappings#luasnip)
for setting up a super-tab-like mapping.

nvim-cmp の wiki には、super-tab のようなマッピングを設定する
[例](https://github.com/hrsh7th/nvim-cmp/wiki/Example-mappings#luasnip)も紹介されています。
```

じゃあ、また適当な`lua`ファイルを開いて、
今度は`for~`のスニペットを選んでみましょう。(スクリーンショットで言うと、4番目にいるやつです。)

![super-tab1](img/super-tab1.webp)

"i" の部分にカーソルが進みましたね。モードが`SELECT`となっているのもポイント❗

![super-tab2](img/super-tab2.webp)

`VISUAL`モードじゃないぞ😉❤️

![super-select](img/super-select.webp)

書き換え前の変数が "i" なのでややこしいんですが...、

![super-tab3](img/super-tab3.webp)

<kbd>i</kbd>を押さなくても、そのまま入力を開始すれば勝手に`INSERT`モードに切り替わります🐬

![super-insert](img/super-insert.webp)

書き換えたら`INSERT`モードのまま<kbd>Tab</kbd>をポチッとすると次に進みます。

![super-tab4](img/super-tab4.webp)

繰り返していくと...

![super-tab5](img/super-tab5.webp)
![super-tab6](img/super-tab6.webp)
![super-tab7](img/super-tab7.webp)

あ、なんか "中身も書けや" と言われているかのようですね😮

![super-tab8](img/super-tab8.webp)

書きました😆

![super-tab9](img/super-tab9.webp)

カ キ マ シ タ ァ❗❗

```admonish tip
<kbd>Shift-Tab</kbd>で逆に辿っていきます🏄 これは直感的ですね😉
```

こんなんで伝わったかな...👮‍♀️

```admonish note
「これが`Super-Tab`です❗」っていう説明がどこにあるのか分からなかったので、
多分これだろうぐらいで書いちゃってますが、もし違ってたらごめんなさい🥹
```

```admonish success title=""
And so I quit the police department

And got my self a steady job

だから僕は警察を辞めた

それで安定した仕事に就いたんだ
```

## She Came In Through The Bathroom Window

自分で育ててないわたしが言うのもあれですが、スニペットは`Neovim`に限らずどこでも使えます🦉

今回使用したのは`VS Code-like`のスニペットです。これ大事❗覚えといてね🤗

```admonish success
And though she tried her best to help me

She could steal, but she could not rob

僕を助けようと 彼女は頑張ってくれたけど

こっそり盗むことはできても、強引に奪うことはできないんだね
```
