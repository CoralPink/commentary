# Key Binding

この章ではキーバインドに触れていこうかな〜なんて思います。

基本的には、やり方というか、テンプレートというか、そういうことだけ書いていくつもりです😉

```admonish note
ある程度実用性のある例示をしようとすると、どうしても自分で使ってる設定が出てきちゃうんですが、
中身はそんなに気にしないでもらえればいいかなーと思ってます。

こんなの、ほんと個人の感覚に依るんで❗
```

ってことで、まずはやっぱりいつも通りですが、
`lua`ディレクトリに`keybinds.lua`とかなんとかでファイルを作成しておきましょう。

~~~admonish quote title="keybinds.luaを作る"
```
nvim options.lua
```
~~~

で、もちろん`init.lua`から読み込むように以下を追記します。

~~~admonish example title="../init.lua"
```lua
require 'options'
```
~~~

```admonish success
この章は気楽に行きましょう😆
```
