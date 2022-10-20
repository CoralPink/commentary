# termguicolors

それでは前項でGETした`nvim_set_option()`を使ってカスタマイズを進めていきましょう😸

お名前からある程度は推測できちゃうんですが、最初なのでまあ、のほほん☺️ と。

~~~admonish info title=":h termguicolors"
```
'termguicolors' 'tgc' 'notermguicolors' 'notgc'

'termguicolors' 'tgc'	boolean (default off)
                        global

	Enables 24-bit RGB color in the |TUI|.

	|TUI|で24ビットRGBカラーを有効にする。
```
~~~

~~~admonish example title="options.lua"
```lua
vim.api.nvim_set_option('termguicolors', true)
```
~~~

「24ビットRGBカラーを有効にする`global`なオプション、`termguicolors`もしくは`tgc`[^1]は、`boolean`値(デフォルト`off`)だよ。」ってのがなんか伝わってきますね🤔

```admonish warning
すごい今さらなんですけど、ヘルプとかドキュメントとか、わたしが勝手に抜粋した上で載っけてるので、一回は手元で開いてみてください😌
```

...わたしも全ての意味を理解しているわけではないのでこの辺で切り上げちゃうんですが、
「24ビットRGBカラーを使いたいから`on`にしちゃえー❗」っていうのが上の設定です。

```admonish note
そのまま素直に`on`とか`off`って書いちゃうとエラーが出て悲しいので、`boolean`(`true`か`false`)で指定してください😉
```

~~~admonish tip
ヘルプの1行目にあるのはコマンドですね。

頭に`no`がついてるのとかはなんかすごい無効化されそうな趣ですが、これらは`set`コマンドから使うことができます。

```
# 無効化
:set notgc

# 有効化
:set tgc
```

一時的に設定を変えたくなった時などに便利です。
~~~

```admonish success
こんな感じです。簡単でしょ😆

しばらくはこんなのが続きます。
```

```admonish success title=""
タマムシ　にじいろ　ゆめの　いろ[^2]
```

[^1]:"東京ガールズコレクション"❓ってなる、ウケる〜🤣 ...そうでもないかぁ😮

[^2]:このページで7色使えてたら面白かったんですけど、1色足りませんでしたね...。
