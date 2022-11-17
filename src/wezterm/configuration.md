# Configuration

特に難しいことを考えずに ホームフォルダに `.wezterm.lua` を置いても良いのですが、
後々ファイルを複数配置していきたくなるので、`$HOME/.config/wezterm`というディレクトリを作って、
そこに `wezterm.lua` を置くほうがおすすめです😊

以下のようにしてみましょう。

~~~admonish example title="$HOME/.config/wezterm/wezterm.lua"
```lua
return {

}
```
~~~

```admonish success
最初はこんなものですね。できたら次のページへ進みましょう❗
```

もし手順が必要なら下で解説していきます😄

## 手順

以下のコマンドを順に実行してください。

~~~admonish quote title="ディレクトリを作る"
```sh
mkdir -p ~/.config/wezterm
```
~~~

~~~admonish quote title="テキストを編集する(以下の例では`vim`を使用)"
```sh
vim ~/.config/wezterm/wezterm.lua
```
~~~

~~~admonish note title="GUI のエディタを使う場合"
GUI のエディタを使用したい場合は以下で出来ます。

ファイルを作る:
```sh
touch ~/.config/wezterm/wezterm.lua
```

ファイルを開く:
```
open ~/.config/wezterm/wezterm.lua
```

これで`lua`ファイルに関連付けられたアプリケーションが起動するはずです。

もし、こんなのが出てきたら

![no-app.webp](img/no-app.webp)

`アプリケーションを選択...`から普段使っているエディタを選びましょう。

`Xcode`や`Visual Studio Code`などでもいけるはずです。
![select-app.webp](img/select-app.webp)
~~~

```admonish success
できましたね❗ それでは次のページへ進みましょう😊
```
