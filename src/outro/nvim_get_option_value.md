# 🦥 nvim_get_option_value

このサイトでは以前、`nvim_buf_get_option`を使用したコードを提示していたのですが、これは既に`deprecated`です。

なので必然的に`nvim_get_option_value`へお乗り換えです 🚅

...まあ、そうは言っても終盤に来て説明されるまでもない事ですので、すぐ終わっちゃいます😆

~~~admonish info title=":h nvim_get_option_value"
```txt
nvim_get_option_value({name}, {opts})                *nvim_get_option_value()*
  Gets the value of an option. The behavior of this function matches that of
  |:set|: the local value of an option is returned if it exists; otherwise,
  the global value is returned. Local values always correspond to the
  current buffer or window, unless "buf" or "win" is set in {opts}.

  option の値を取得する。
  この関数の動作は |:set| と同じです。
  オプションが存在する場合はローカル値が返され、存在しない場合はグローバル値が返されます。
  ローカル値は、{opts} で "buf" または "win" が設定されていない限り、常に現在のバッファまたはウィンドウに対応します。

  Parameters: ~
    • {name}  Option name
    • {opts}  Optional parameters
              • scope: One of "global" or "local". Analogous to |:setglobal|
                and |:setlocal|, respectively.
              • win: |window-ID|. Used for getting window local options.
              • buf: Buffer number. Used for getting buffer local options.
                Implies {scope} is "local".
              • filetype: |filetype|. Used to get the default option for a
                specific filetype. Cannot be used with any other option.
                Note: this will trigger |ftplugin| and all |FileType|
                autocommands for the corresponding filetype.

  Return: ~
    Option value
```
~~~

そういえば、先日(と言っても結構前なんだけど) 新宿に降りて、西口側に行ったんです。

あの辺ってなんか絶賛再開発中🏗️ でガチャガチャしてるんですよね〜。
それを横目に階段で地上に上がろうとしたんですが...。

封鎖されている...❗ほぼ全て😑

```admonish success title=""
How does it feel to be one of the beautiful people?

Now that you know who you are

崇高な人達の輪に加われた気分はどう?

君は自分が何者かを知ったんだ
```

```admonish success title=""
What do you want to be?

And have you traveled very far?

それでどうしたいの?

君は届かない所に旅したつもり？
```

ここでふと思うわけです。

まあ🤭 Prison 👮‍♀️🩷

```admonish success title=""
Far as the eye can see

せいぜい ここから目の届く範囲だろ
```

## ⚾ Try

簡単ではあるんですけど、やっぱ確信は欲しいので「試しに動かしてみよー。」って思うわけです。

なので、こんなコードを カ キ マ シ タ ァ❗❗

~~~admonish example title="options.lua"
```lua
vim.api.nvim_create_user_command('Example', function()
  local input = vim.fn.input('Option name? > ')
  local param = vim.api.nvim_get_option_value(input, {});

  vim.notify(input .. ": " .. tostring(param))
end, {})
```
~~~

多分こんな感じでしょう❓

早速試してみましょう❗

~~~admonish quote
```vim
:Example
```
~~~

...ってしたら、なんか実在する適当なオプションを入力してあげてください😉

![nvim_get_option_value](img/nvim_get_option_value.webp)

はい、いけました😆

```admonish success title=""
How does it feel to be one of the beautiful people?

How often have you been there?

崇高な人達の輪に加わるってどんな気分?

もう頻繁に行ってるの?
```

```admonish warning title=""
Often enough to know

知れるには十分な頻度でね
```

```admonish success title=""
What did you see when you were there?

そこでは何が見えるんだい?
```

```admonish warning title=""
Nothing that doesn't show

見えないものなんて ないんだよ
```

## 🤖 copilot-cmp

これでもう自信を持って扱えますね❗あとは簡単😊

このサイトで言うと、
[copilot-cmp](../neovim/lsp/copilot-cmp.html#admonition-extensionsnvim-cmp-actionslua)で示した
`extensions/nvim-cmp-actions.lua`で使ってるはずです。

~~~admonish example title="extensions/nvim-cmp-actions.lua"
```diff
local function has_copilot()
+  if vim.api.nvim_get_option_value('buftype', {}) == 'prompt' then
-  if vim.api.nvim_buf_get_option(0, 'buftype') == 'prompt' then
     return false
   end
   local line, col = unpack(vim.api.nvim_win_get_cursor(0))
   return col ~= 0 and vim.api.nvim_buf_get_text(0, line - 1, 0, line - 1, col, {})[1]:match '^%s*$' == nil
end
```
~~~

まあ、こんなもんでしょ😇

```admonish note
ぶっちゃけ、わたしは今`GitHub Copilot`のサービスを切っているので動作確認が取れていません...😿

なので、変に鵜呑みにしないでください...。
```

内容なんて、もうほぼ無いよう🤣

```admonish success title=""
Baby, you're a rich man{{footnote:
Baby, You're a Rich Man (by [The Beatles](https://en.wikipedia.org/wiki/The_Beatles)):
Lennon の未完成曲 "One of the Beautiful People" に McCartney がコーラスをつけたのが始まりであり、
1980年のインタビューで、Lennon は "2つの別々の曲を無理矢理 1つの曲にした" と語っている。

1967年当時、イギリスのアンダーグラウンドの中心人物だった作家の Barry Miles によると、
Lennon は California の[Hippie](https://en.wikipedia.org/wiki/Hippie)現象に関する新聞記事からこの曲のインスピレーションを得たという。
Lennon はオーボエのセッティングでシンセサイザーの前身である[Clavioline](https://en.wikipedia.org/wiki/Clavioline)を演奏し、
インドの[Shehnai](https://en.wikipedia.org/wiki/Shehnai)を思わせる音を作り出した。
}}

Baby, you're a rich man

ベイビー! よお リッチマン!!

ベイビー! よお リッチマン!!
```

```admonish success title=""
Baby, you're a rich man too{{footnote:
Lennon は "この曲の意味は「誰もが金持ちだ」ということである" と主張し、
Harrison は "物質的な心配とは関係なく、すべての個人は自分自身の中で裕福である" というメッセージだと語っている。
[Wikipedia](https://en.wikipedia.org/wiki/Baby,_You%27re_a_Rich_Man)より
}}

ベイビー! よお 君もリッチマンだ!!
```

```admonish success title=""
You keep all your money in a big brown bag inside a zoo

君は全てのカネを 動物園のデカい茶封筒に詰め込んでるんだ!
```

<video controls preload="none" width="1280" height="720" poster="img/tama-zoo-thumbnail.webp">
  <source src="img/tama-zoo.webm" type="video/webm">
  Your browser does not support the video/webm.
</video>


```admonish success title=""
What a thing to do

何を企んでるんだ!
```

## 🎺 Baby, You’re a Rich Man

```admonish success title=""
How does it feel to be one of the beautiful people?

崇高な人達の輪に加われた気分はどう?
```

```admonish warning title=""
Happy to be that way

幸せに思うよ
```

なんていうかさあ...。

最近色々思うこともあるんだけど、他人の言葉を使って抗うのはわたしの弱さです。

自分でもびっくりするぐらい好き勝手やってるけど、どうか大目に見てください...😭

このサイトも、ようやく Endgame なんで❗

...理由になってねぇな🙄

```admonish warning title=""
Now that you've found another key

さて、またひとつ鍵を見つけたよ
```

```admonish success
What are you going to play?

今度は何を奏でてくれるんだい？
```

### 🦸‍♀️ WILL RETURN

```admonish note title=""
What the hell is this?

これは一体どういうことだ？
```

```admonish danger title=""
friday what are they firing at?

friday、奴らは何を撃っている？
```

```admonish quote title=""
Something just entered the upper atmosphere

現在 何かが上層大気圏に突入しています
```
