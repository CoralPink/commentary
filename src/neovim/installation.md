# インストール

この節では Neovim を扱っていきます。

これもやっぱり`Homebrew`や、ホームページ上で提供されている実行ファイルをダウンロードする方法があります。

[Installing](https://github.com/neovim/neovim/wiki/Installing-Neovim)


~~~admonish info
ちなみに私は`Homebrew`から development version を使用しています。

```sh
brew install --HEAD neovim
```

`Wezterm`もそうでしたが、Neovim もそれ以上に活発なプロジェクトなので楽しいです。
この場合も、更新は`upgrade`で行えます。

```sh
brew upgrade --HEAD neovim
```

ここに書いてある設定は全て development version で動かしているので、

もしかしたら特定のバージョン(stableも含めて)だとうまく動かないこともあるかもしれません。
そうなった場合は問題の特定をするよりもスパッと飛ばしましょう。
~~~

```admonish success
では、次から設定を行っていきます。[^a]
```

[^a]:と言いたいところですが、ここからは不定期更新で書いていきます。まだ出来てなかったらごめんなさい。
