# Shell Prompt

`WezTerm`の設定からは少し逸れますが、先にシェルプロンプトのカスタマイズをやってしまいましょう。

## Starship
技術系サイトを見ていると、こぞって紹介されている感のある`StarShip`です。

まあ、これは紹介したくなりますよね〜。導入が簡単なのに綺麗だし🥴

```admonish info title="[StarShip Cross-Shell Prompt](https://starship.rs/)"
The minimal, blazing-fast, and infinitely customizable prompt for any shell!

あらゆるシェルのための、最小限の、高速な、そして無限にカスタマイズ可能なプロンプト!
```
ページ内の Get Started からインストール方法が確認できます。

覗いてみると

```txt
Prerequisites
- A Nerd Font installed and enabled in your terminal.

前提条件
- Nerd Fontがインストールされ、ターミナルで有効になっていること。
```

と書いてありますね。

本来なら「なんかめんどくさそうだな〜」となるところですが...、

なんと❗️`WezTerm`は`Nerd Font`を持っていて、しかも既に有効になっています❗️

```admonish info title="[wezterm.nerdfonts](https://wezfurlong.org/wezterm/config/lua/wezterm/nerdfonts.html)"
WezTerm includes Nerd Font Symbols Font as a default font fallback which means that these
special symbols are available even without requiring you to use a patched font.

WezTerm は Nerd Font Symbols Font をデフォルトのフォントのフォールバックとして含んでいます。
つまり、パッチを当てたフォントを使わなくてもこれらの特殊記号を利用することができます。
```

...とのことなので安心してください。入ってますよ☺️

とは言いつつ、わたしは別のフォントを使っているので`3.3 Font`で紹介したいな〜と思ってます。

## インストール

これは`Starship`の説明通りにやっていけば大丈夫ですね。

### Step 1.
ターミナルから
~~~admonish quote title="Command"
```sh
curl -sS https://starship.rs/install.sh | sh
```
~~~

と、やってもいいのですが、わたしは`Homebrew`でやっちゃいます。

~~~admonish quote title="Command"
```sh
brew install starship
```
~~~

いきなり説明通りから外れましたね！どんまい✨

### Step 2.
`zsh`を使っている場合は`~/.zshrc`に以下を追記するだけです。

~~~admonish example title=".zshrc"
```sh
`eval "$(starship init zsh)"`
```
~~~

```admonish note
もし無かったら自分で作っちゃっていいやつです。
```

```admonish warning
繰り返しますが「追記」です。先に記述されているものがあった場合、そのまま前か後ろに追記してください。
```

### Step 3.
コンフィグファイルについては、また別の機会に。

`WezTerm`を一旦終了して再度起動しましょう。

![starship](img/starship.webp)

`3.1 Window`で設定したカラースキームが適用されているのを確認できましたね。

```admonish success
月も綺麗ですね💕 (`wezterm`ディレクトリに行くと手っ取り早く見られます。)

それでは`WezTerm`のお話に戻りましょう。
```
