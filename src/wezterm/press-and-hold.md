# Press and Hold (for macOS)

このページにある内容は`Wezterm`というよりは`macOS`のお話です。

その他の OS を使用している場合はスキップして[次のページ](./format.md)へ🐈

```admonish info
さらに言えば、`macOS 27 (Golden Gate)`以降に限ります。たぶん。
```

## Popup

例えば<kbd>k</kbd>を押しっぱなしにするとこんなポップアップが出てきます。

![popup](img/pressandhold-popup.jxl)

人によっては "そんな操作する❓" と思うかもしれません。

例えば、このサイトでもう少しすると出てくる`Neovim`とかを操作するとき、
カーソル移動時にキーを押しっぱなしにすることがあるんじゃないかと思います。(...熟練するとしないかもしれません😲)

その時にポップアップがなんか邪魔だなーとなってしまう前に、対策をします。

```admonish info title="[Option to turn off press-and-hold popup in macOS 27?](https://github.com/wezterm/wezterm/discussions/8183)"
After upgrading to macOS 27, pressing and holding certain keys triggers the macOS character popup window:
```

...まあ、平たく言えば、この Discussion で示されている内容をパクってきましたってだけですね🤣

```admonish tip
上の会話の中で触れられていますが、Japanese, Chinese, Korean… など、IMEを普段使いする言語圏の人の場合、

`config.use_ime`に関しては`false`にしないほうが良いと思います。

> もちろん、"`Wezterm`上では`IME`なんて使わないよ❓" っていう場合は別です。
```

### まず確認

ということで、このポップを使わない人は、まずはこんなコマンドを打ってみましょう。

~~~admonish quote title="Command"
```sh
defaults read com.github.wez.wezterm ApplePressAndHoldEnabled
```
~~~

初めてなら たぶんエラーが出てきます。

![defaults read (check)](img/pressandhold-check.jxl)

そんなもんです。気にしないで😉

### 設定する

それを踏まえて、次のコマンド (`write`) が本番です❗

~~~admonish quote title="Command"
```sh
defaults write com.github.wez.wezterm ApplePressAndHoldEnabled -bool false
```
~~~

初めてだろうと何度目だろうと たぶん何も出てきません。

![defaults write](img/pressandhold-write.jxl)

そんなもんです。気にしないで😉

### 再起動

そしたら、一度`Wezterm`を完全に終了してから再度起動しましょう。

### もう一度確認

起動したら、もう一度最初のコマンドを打ってみましょう。

~~~admonish quote title="Command"
```sh
defaults read com.github.wez.wezterm ApplePressAndHoldEnabled
```
~~~

`0`が出てくれば成功です❗😆

![defaults read](img/pressandhold-read.jxl)

```admonish info
この状態であれば<kbd>k</kbd>を押しっぱなしにしてみてもポップアップが出てこなくなっているはずです。
```

### 元に戻す場合

ちなみに元に戻したい場合は以下のコマンドで`delete`します。

~~~admonish quote title="Command"
```sh
defaults delete com.github.wez.wezterm ApplePressAndHoldEnabled
```
~~~

そんなもんです。安心です😉

## Wrap Up

これで完了です❗やったね❗

```admonish success
今やってもあまり恩恵が感じられないかもしれませんが、そんなもんです😅
```
