# cursorline

さて、続いて飛び出してきました、

~~~admonish info title=":h cursorline"
```txt
'cursorline' 'cul'  boolean (default off)
                    local to window

Highlight the text line of the cursor with CursorLine |hl-CursorLine|.
Useful to easily spot the cursor.  Will make screen redrawing slower.
When Visual mode is active the highlighting isn't used to make it
easier to see the selected text.

CursorLine |hl-CursorLine| でカーソルのあるテキスト行を強調表示する。
カーソルを簡単に見つけるのに便利です。 ただし、画面の再描画が遅くなる。
ビジュアルモードがアクティブなときは、選択テキストを見やすくするためにハイライトは使用されない。
```
~~~

~~~admonish example title="options.lua"
```lua
vim.api.nvim_win_set_option(0, 'cursorline', true)
```
~~~

これは動かしてみれば一目瞭然ですね😉

|||
|:---:|:---:|
|**before**|![cursorline1](img/cursorline-before.webp)
|**after**|![cursorline2](img/cursorline-after.webp)

しっかりと"カーソルのあるテキスト行を強調表示"してますね❗

```admonish note
少し気になるのは、「画面の再描画が遅くなります」という注意書きがされていることでしょうか...。

わざわざ書かれているぐらいなので、想像以上に重い処理なのかもしれない...😱

ご自身の環境と相談の上で、使うかどうかを決めて頂ければ😺
```

```admonish success
とはいえ、設定自体はこれだけですね。簡単😆
```
