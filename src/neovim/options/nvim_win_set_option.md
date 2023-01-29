# nvim_win_set_option

```admonish quote title=""
あ❗　やせいの

`nvim_win_set_option`が　とびだしてきた❗
```

また来ましたね、このパターン😆

~~~admonish info title=":h nvim_win_set_option"
```txt
nvim_win_set_option({window}, {name}, {value})          *nvim_win_set_option()*
    Sets a window option value. Passing `nil` as value deletes the option
    (only works if there's a global fallback)

    window のオプション値を設定する。value として `nil` を渡すと、そのオプションが削除される。
    (グローバルフォールバックがある場合のみ動作する)

    Parameters:
      • {window}  Window handle, or 0 for current window
      • {name}    Option name
      • {value}   Option value

      • {window}  ウィンドウのハンドル、またはカレントウィンドウの場合は0
      • {name}    オプション名
      • {value}   新しいオプションの値
```
~~~

`nvim_win_set_option`は`window option`の値を設定できるタイプのモンスターみたいですね🤔

本質的な説明ではありませんが、`Window handle`を`0`としておけば`nvim_set_option`と同じ感覚で使えます。

(逆に、これ以上の説明はわたしのレベルでは出来ない、と言うのが正直なところです😓)

"windowすいどう" は波の穏やかな海ですが、`nvim_win_set_option`さえいれば "かいパンやろう"🙈とかそんなの関係なく進むことができそうです。

...なんで "かいパンやろう" を避けるのかって❓いや、それは...🙊

```admonish success
やったー❗

`nvim_win_set_option`を　つかまえたぞ❗
```
