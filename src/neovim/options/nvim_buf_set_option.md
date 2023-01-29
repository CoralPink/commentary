# nvim_buf_set_option

```admonish quote title=""
bufferリ　ゾーンに　ようこそ❗
```

```admonish quote title=""
この　ひろい　bufferリで

いろんな　モンスター　とりほうだいの

ゲームが　たった　５００円❗
```

```admonish quote title=""
さっそく　やりますか❓
```

...なんだかいつもと違うパターンで始まりましたが、まあ...「はい😮」

```admonish quote title=""
それでは・・・❗
５００円　いただきまーす❗
```

```admonish quote title=""
ここでは　bufferリ　せんようの
APIを　つかいます❗

・・・　これです❗
```

~~~admonish info title=":h nvim_buf_set_option"
```txt
nvim_buf_set_option({buffer}, {name}, {value})          *nvim_buf_set_option()*
    Sets a buffer option value. Passing `nil` as value deletes the option
    (only works if there's a global fallback)

    buffer のオプション値を設定する。value として `nil` を渡すと、そのオプションが削除される。
    (グローバルフォールバックがある場合のみ動作する)

    Parameters:
      • {buffer}  Buffer handle, or 0 for current buffer
                  バッファハンドル、またはカレントバッファの場合は0。

      • {name}    Option name
                  オプション名

      • {value}   Option value
                  新しいオプションの値
```
~~~

`buffer`専用ではありますが、やはりこの`API`も、
これまでに捕まえてきた`set_option`系と同じ、頼れるモンスターです☺️

```admonish quote title=""
のこり　じかんが　なくなるか❗

APIが　なくなったら

メガホンで　しらせます❗
```

```admonish success
では......❗　ぐっど　らっく❗
```
