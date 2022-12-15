# Key Binding
ここはちょっと難しいというか、どこまで`WezTerm`をメインに持ってくるのかみたいなところがあります。

例えば`tmux`。

`WezTerm`自体が`tmux`と同等かそれ以上の機能を持っているので、
`WezTerm`に対して`tmux`と同じキーバインドを与えてしまえば、これは不要になるわけです。
{{footnote:実際わたしも、`WezTerm`を使う前は`iTerm2`の上で`tmux`を動かしていました😄}}

...と言っても、わたしがローカルでしか使っていないから大丈夫なだけで、ネットワークを介して使う場合は困る事もあるかもしれませんし、
実際にデフォルトでは徹底的に他のソフトウェアとの衝突を避けています。

```admonish info title="[Default Shortcut / Key Binding Assignments](https://wezfurlong.org/wezterm/config/default-keys.html)"
The default key assignments are shown in the table.

デフォルトのキー割り当ては、表のとおりです。
```

## 現在のキーバインド確認

まずは現在のキーバインドがどうなっているのかを確認します。

```admonish info title="[show-keys](https://wezfurlong.org/wezterm/cli/show-keys.html#wezterm-show-keys)"
Prints the complete set of key assignments based on your config file.

設定ファイルに基づいたキー割り当ての完全なセットを表示します。
```

実行してみましょう。`WezTerm`でそのまま`wezterm`コマンドを使えば良いです。

~~~admonish quote title="Command"
```sh
wezterm show-keys
```
~~~

![key-now](img/key-now.webp)

そう、これが現在のキーバインドですね。

## 設定を落とし込む

で、ここで提案なんですが、キーバインドを自分の設定ファイルに落とし込んじゃったらどうかな？と思うわけです。

それをやるにはどうすれば簡単かな〜っていう話になるんですけど、方法はすでにありました。

~~~admonish quote title="Command"
```sh
wezterm show-keys --lua
```
~~~

![key-now-lua](img/key-now-lua.webp)

さすがですね☺️ もはやレールは存在していました。これを自分の設定に持っていけば良いだけです。

ということで、`keybinds.lua`とでもしてここに設定を落とし込みます。

これはもうプロっぽく片付けちゃいましょう。シェル芸というやつです✨

~~~admonish quote title="Command"
```sh
wezterm show-keys --lua > keybinds.lua
```
~~~

`>`を使って出力先をファイルにすると、もうこれだけで流し込めちゃうんですね。簡単😆

```admonish note
あらかじめ`keybinds.lua`を作成しておく必要もありません😉
```

```admonish warning
むしろ同名ファイルが存在している場合は完全に上書きしちゃうみたいなので注意❗

また、上記例のファイル出力先は現在のディレクトリです。

`~/.config/wezterm`に移動するか、出力先を`~/.config/wezterm/keybinds.lua`に指定してください。
```

## 読み込み先を切り替える
ここまでは暗黙的にデフォルト設定が適用されていましたが、これからは自分で作った`keybinds.lua`を使っていきましょう。

~~~admonish example title="wezterm.lua"
```lua
keys = require(“keybinds”).keys,
```
~~~

~~~admonish note
このサイトではまだ取り扱っていませんが、
[Key Tables](https://wezfurlong.org/wezterm/config/key-tables.html)
という機能があって、これを`keybinds.lua`内でカスタマイズしても、このままでは反映されません。

なのでごめんなさい😱 上のコードだけでは混乱の元になってました😭

`keybinds.lua`内で`Key Tables`のカスタマイズをする場合、以下のコードも必要になります。

```lua
key_tables = require('keybinds').key_tables,
```

これで、`keybinds.lua`内で編集した`Key Tables`がちゃんと反映されるようになります🥹
~~~

冒頭のリンクを再掲しますが、一番下にこのようにあります。

```admonish info title="[Default Key Assignments](https://wezfurlong.org/wezterm/config/default-keys.html)"
If you don't want the default assignments to be registered, you can disable all of them with this configuration; if you chose to do this, you must explicitly register every binding.

デフォルトの割り当てを登録したくない場合は、この設定ですべての割り当てを無効にできます。これを選択した場合は、すべてのバインディングを明示的に登録しなければなりません。
```

デフォルト設定は以下で完全に無効化されます。不安に感じるようであればスキップしても大丈夫です。
~~~admonish example title="wezterm.lua"
```lua
disable_default_key_bindings = true,
```
~~~

```admonish success
これでキーバインドの移行が完了しました。まあ、まだ中身は同じなんですけどね😅

さて、もう一つのポイントとして`leader`キーというものがあります。これについてはまた次回。
```
