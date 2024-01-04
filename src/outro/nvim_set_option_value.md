# nvim_set_option_value

`一粒万倍日` が連続4日で続いてて、今日が4日目らしいですね🥳

"万倍" の4乗で "京倍" ですって。

そういえば最近、新しく"京" 🗼を見下ろせる麻布台ヒルズって場所を知ったんだよねー。

![tokyo-tower](img/tokyo-tower.webp)

```admonish success title=""
I say high, you say low

You say why and I say I don't know

僕は「高い」、きみは「低い」

きみは「なんで」そしたら僕は「わからない」
```

わたしのような庶民でも、運転士付きの日比谷線 🚋🚋 で麻布に乗り付けて、
スカイロビーに (`タダで`) 上れるんざます。セレブ❗

そのまま日比谷線の運転士に頼んで
銀座のチャンスセンター (「宝くじが当たる💴」で有名💴なんでしょ❓) まで行ってもいいんですけどね😌

ここでふと思うわけです。

「ただ販売本数が多いってだけで、"当たりやすい"とは違うんじゃないの😮❓」ってね❗

"一粒万倍日" って、別にお金 💴 増やす日ってわけじゃないし、
「宝くじを買えば当たる日」ってこともないぞ❤️

ただ、"買わないと当たらない"ぞ🫶🏻 ナイスフォロー❗

...よし。今日も絶好調🤣

~~~admonish info title=":h nvim_set_option_value()"
```txt
nvim_set_option_value({name}, {value}, {*opts})
    Sets the value of an option. The behavior of this function matches that of
    :set: for global-local options, both the global and local value are set
    unless otherwise specified with {scope}.

    オプションの値を設定する。この関数の動作は、
    グローバルローカルオプションの場合 {scope} で特に指定しない限り、
    グローバル値とローカル値の両方が設定される。

    Note the options {win} and {buf} cannot be used together.

    オプション {win} と {buf} は一緒に使えないことに注意。

    Parameters: ~
      • {name}   Option name
      • {value}  New option value
      • {opts}   Optional parameters
                 • scope: One of "global" or "local". Analogous to
                   :setglobal and :setlocal, respectively.
                 • win: window-ID. Used for setting window local option.
                 • buf: Buffer number. Used for setting buffer local option.
```
~~~

少し間が空いてしまいましたが、今日は "nvim_なんちゃら_set_option" から`nvim_set_option_value`への更新をしましょう。

~~~admonish info title=":h deprecated"
```txt
Nvim                                                            deprecated

The items listed below are deprecated: they will be removed in the future.
They should not be used in new scripts, and old scripts should be updated.

以下の項目は非推奨であり、将来削除される予定です。
新しいスクリプトでは使用せず、古いスクリプトは更新してください。
```

```txt
- nvim_set_option()        Use nvim_set_option_value() instead.
- nvim_buf_set_option()    Use nvim_set_option_value() instead.
- nvim_win_set_option()    Use nvim_set_option_value() instead.
```
~~~

非推奨になっている項目は他にも挙げられていますが、このサイトでは上記3つを取り上げます。

`packer.nvim`→`lazy.nvim`のような「一回荷物を全部外に運び出して〜」みたいなことは一切なくて、
「ちょっとカーペットでも変えるか〜」程度の作業です。

## Previously

「そもそも何がきっかけでやってるんだっけ❓」って前のページを見てみると...😮

```lua
vim.api.nvim_set_option_value('termguicolors', true, { scope = 'global' })
```

そうだそうだ。`termguicolors`がきっかけでした。

...でしたが、これ見ました？

```admonish info title="[feat(defaults): enable 'termguicolors' by default when supported by terminal #26407](https://github.com/neovim/neovim/pull/26407)"
Enable `'termguicolors'` automatically when Nvim can detect that truecolor is supported by the host terminal.

Nvim がホスト端末で truecolor がサポートされていることを検出した場合、自動的に`'termguicolors'`を有効にする。

'termguicolors' is correctly set on:
- iTerm2
- Ghostty
- Wezterm
- Kitty
- Alacritty
- tmux
```

```admonish note
`Wezterm`もいるので、なんだかとっても微笑ましいですね☺️
```

```admonish success title=""
You say goodbye and I say hello

(Hello, goodbye, hello, goodbye{{footnote:
Hello, Goodbye (by [The Beatles](https://en.wikipedia.org/wiki/The_Beatles)):
Lennon-McCartney とクレジットされているが、この曲は Paul McCartney の単独作詞によるものである。
作曲は、McCartney と The Beatles のマネージャー Brian Epstein のアシスタントであった
Alistair Taylor との間で行われた言葉の連想の練習によって生まれた。

Taylor の回想によると、
彼は London の St John's Wood にある McCartney の自宅を訪れ、The Beatles の曲作りの方法を尋ねた。
すると McCartney は Taylor をダイニング・ルームに連れて行き、ふたりでハーモニウムの前に座った。
McCartney は楽器を弾き始め、Taylor に、たまたま歌った言葉の反対を言うように頼んだ。
白と黒、イエスとノー、ストップとゴー、ハローとグッドバイ -
「この曲のことはまったく覚えていない。Paul が本当にその曲のメロディを作りながら進めていたのか、
それともすでに彼の頭の中を流れていたのか、不思議だ」。

1990年代に彼の公式伝記作者である Barry Miles に語ったところによると、
McCartney は、この歌詞は彼の星座である双子座を反映して、二元性をテーマにしていると語っている。
「相対する事柄について書いたもので、Gimignano の影響かな。曲にするのは簡単だった」
「いつだって僕は前向きな方面に立ってる。それは今でも変わらないよ」
[Wikipedia](https://en.wikipedia.org/wiki/Hello,_Goodbye) より
}}...)

きみは「さよなら」 ぼくは「こんにちは」
```

使用する環境にもよるかもしれませんが、
わたしがなんか急にマジセレブになるよりも早く、`stable release`でもこれが不要となる日が来るのでしょう。

自分の環境でこれが自動で有効になるかどうかを確認するのは簡単です☺️

手元の設定から`termguicolors`を一回消してから`nvim`を起動してみましょう。
まだ未対応であれば`nvim-notify`が起動直後に警告してくれます。

![term-guicolors-notify](img/term-guicolors-notify.webp)

逆に何も言われないのであれば、`termguicolors`はもう書かなくても平気だとわかっちゃうわけです😋

```admonish note
将来的な機能なので、少なくとも現時点 (2023/12/08) の`stable release`では実装されていません。

また、`nvim-notify`がインストールされていることを前提としています。
```

これもまた、妙に奇跡的な噛み合いでしたね😁

## Options

やっぱり自信はないんですが...。

```admonish info title="[fix(api): nvim_set_option_value for global-local options](https://github.com/neovim/neovim/commit/d23465534a8ba5dac1758ffebdc7746138ee5210)"
global-local window options need to be handled specially. When `win` is
given but `scope` is not, then we want to set the local version of the
option but not the global one, therefore we need to force
`scope='local'`.

グローバルローカルウィンドウオプションは特別に扱う必要がある。
`win`は与えられるが、`scope`は与えられない場合、
ローカルバージョンのオプションを設定したいが、グローバルバージョンのオプションは設定したくないので、
`scope='local'`を強制する必要がある。
```

`v0.9.4`以降とそれ以前でも動作が違うらしいので、このサイトでは`v0.9.4`で実際に動かしてみたものを載せます。

```admonish success title=""
I don't know why you say goodbye, I say hello

きみは「さよなら」と言うけど なんでだい

ぼくは「こんにちは」なのに
```

### Global

前回はこんなのを例示していたんですが...、

```lua
vim.api.nvim_set_option_value('termguicolors', true, { scope = 'global' })
```

改めて試してみたら、`global`指定は必要なさそうでした😲

```lua
vim.api.nvim_set_option_value('termguicolors', true, {})
```

じゃあ、こうでいいのかな❓

~~~admonish example title="options.lua"
```lua
vim.api.nvim_set_option_value('termguicolors', true, {}) -- いる？いらない？
vim.api.nvim_set_option_value('scrolloff', 4, {})

vim.api.nvim_set_option_value('ignorecase', true, {})
vim.api.nvim_set_option_value('smartcase', true, {})
vim.api.nvim_set_option_value('inccommand', 'split', {})

vim.api.nvim_set_option_value('clipboard', 'unnamedplus', {})
```
~~~

あと、`lualine.lua`にもポツンと書いたかも。

~~~admonish example title="extensions/lualine.lua"
```lua
vim.api.nvim_set_option_value('showmode', false, {})
```
~~~

まあ、こんなとこでしょう。

```admonish success title=""
Why why why why why why do you say goodbye?

Goodbye, bye bye bye bye...

なぜ？ なぜ さよならを言うの？

さよなら、バイバイ...
```

### Window

わたしの解釈が正しいのか、いまいち判然としないんだけど、
これまで`{window}`を`0`で指定していたものは、もう特に明示しなくても良さそうです😉

だって、これと...

```lua
nvim_set_option_value('number', true, {})        -- local window option
```

これが等価だって言ってるんだもん。

```lua
nvim_set_option_value('number', true, {win=0})   -- unchanged from before
```

じゃあ、結果的に`global`と同じ感じで書いちゃっていいよね🐶

~~~admonish example title="options.lua"
```lua
vim.api.nvim_set_option_value('number', true, {})
vim.api.nvim_set_option_value('cursorline', true, {})
vim.api.nvim_set_option_value('signcolumn', 'yes:1', {})
vim.api.nvim_set_option_value('winblend', 20, {})

vim.api.nvim_set_option_value('wrap', false, {})
```
~~~

### Buffer

これなぁ😫

~~~admonish example title="options.lua"
```lua
-- local to buffer options:
vim.api.nvim_create_autocmd({ 'BufEnter', 'BufWinEnter' }, {
  pattern = '*',
  group = vim.api.nvim_create_augroup('buffer_set_options', {}),

  callback = function()
    vim.api.nvim_set_option_value('expandtab', true, { buf = 0 })
    vim.api.nvim_set_option_value('tabstop', 2, { buf = 0 })
    vim.api.nvim_set_option_value('shiftwidth', 0, { buf = 0 })
  end
})
```
~~~

...みたいに書き直せば良さそうです。

ただ...。

~~~admonish info title=":h nvim_set_option_value()"
```txt
Sets the value of an option. The behavior of this function matches that of
|:set|: for global-local options, both the global and local value are set
unless otherwise specified with {scope}.

オプションの値を設定する。この関数の動作は、
グローバルローカルオプションの場合 {scope} で特に指定しない限り、
グローバル値とローカル値の両方が設定される。
```
~~~

```admonish info title="[fix(api): nvim_set_option_value for global-local options](https://github.com/neovim/neovim/commit/d23465534a8ba5dac1758ffebdc7746138ee5210)"
Only the global-local option with a `win` provided gets forced to local scope.

`win`を指定した global-local オプションだけがローカルスコープに強制される。
```

ってことなので、逆に言えば`buf`は指定しなければ`global`にも設定されそう...❓

じゃあ、これも`global`と同じ感じで書いちゃっていいよね。

~~~admonish example title="option.lua"
```lua
vim.api.nvim_set_option_value('expandtab', true, {})
vim.api.nvim_set_option_value('tabstop', 2, {})
vim.api.nvim_set_option_value('shiftwidth', 0, {})
```
~~~

もはや`autocmd`もいらなくない⁉️

実際これでちゃんと動いてそうに見える🙂

```admonish question
あってるよね...❓間違ってるかもしれない...。
```

```admonish success title=""
(I say yes) (but I may mean no)

(I can stay) ('Till it's time to go)

(ぼくはイエス) (でもノーかもしれない)

(ここにいるよ) (帰る時まで)
```

## Wrapping a function

ここでふと思うわけです。

「結果、全部同じパターンになったんじゃないの⁉️😳」ってね❗

例えばこんなのを追加しておくと、`opts`の`{}`を省略して記述できます😆

~~~admonish tip
```lua
local function nvim_set_option_value(name, value, opts)
  vim.api.nvim_set_option_value(name, value, opts or {})
end
```

```diff
- vim.api.nvim_set_option_value('termguicolors', true, {})
+ nvim_set_option_value('termguicolors', true)
```
~~~

(わたし自身は使ってないので、これ以上は言及しないんですが)

この書き方だと同じファイル内でしか使えないので、
ちゃんとこの手段をとろうと思うのであれば、もう一手間加える必要があります🤔

## Hela, heba helloa

そこまで念入りに確認したわけではないので、多少の不安は残りますが、
この種さえ蒔いておけば、なんか急に`nvim_set_option`が削除されたとしても慌てることはないでしょう😉

2023年の12月では、さらに19,20日でまた一粒万倍日が並ぶみたいなので、
その頃にはまた新しい収穫があるかもしれません。

それを糧に、モチベーション上げていきましょ❗

```admonish success
Hela, heba helloa, cha cha cha

Hela, heba helloa, woo!

Hela, heba helloa, hela!
```
