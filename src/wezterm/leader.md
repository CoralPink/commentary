# Leader Key
さて、前回はキーバインドを落とし込んだわけですが、今回は`Leader`キーです。

```admonish info title="[Key Binding - Wez's Terminal Emulator](https://wezfurlong.org/wezterm/config/keys.html#leader-key)"
A leader key is a a modal modifier key. If leader is specified in the configuration then pressing that key combination will enable a virtual LEADER modifier.

Leaderキーは、モーダルモディファイアキーです。Leaderキーが設定されている場合、そのキーの組み合わせを押すと、仮想的なリーダーモディファイアが有効になります。
```

`Leader`キーという概念は WezTerm 特有のものではく、`tmux`や`vim`など古参のソフトウェアでも用いられています。

WezTerm でのデフォルトは`CTRL-a`です。[^other]
```admonish note
`CTRL-a` という表記は`control`キーと`a`キーを同時押しすることを示しています。
```

ということで、わたしはもうそのまま`CTRL-a`で設定しています。
デフォルトのままでいいやー、って場合は書かなくてもOKです。

~~~admonish example title="wezterm.lua"
```lua
leader = { key = 'a', mods = 'CTRL', timeout_milliseconds = 2000 },
```
~~~

```admonish note
`timeout_milliseconds`のパラメータを変えていますが、これは後で触れます。デフォルトは`1000`です。
```

`vim`や`tmux`等を使用する場合は、これとバッティングしていないかチェックしときましょう。


```admonish warning
macOSでUS配列なのに日本語IME使うような環境[^minority]では`CTRL-Space`が入力ソースの切り替えに割り当てられています。
OSのショートカットキー等も含め、あらかじめ確認しておきましょう。

他のと被っちゃうと困っちゃいます。
```

## timeout_milliseconds

これは前項で挙げたマニュアルの文章を引用しますが、

```admonish note title="[Leader Key](https://wezfurlong.org/wezterm/config/keys.html#leader-key)"
`LEADER` stays active until a keypress is registered (whether it matches a key binding or not),
or until it has been active for the duration specified by `timeout_milliseconds`, at which point it will automatically cancel itself.

LEADERはキーが登録されるまで（キーバインディングにマッチするかどうかに関わらず）、
あるいはtimeout_millisecondsで指定された時間だけアクティブになり、その時点で自動的にキャンセルされます。
```

`Leader`キーが一回押されたら、とりあえず何か次のキーが押されるか、指定ミリ秒経過するまでは待つよ〜。ってことですね。

例えば、

~~~admonish example title="wezterm.lua"
```lua
{ key = 'u', mods = 'LEADER', action = act.CharSelect },
```
~~~

...と、やる場合、`CTRL-a` → `u`と順番にキーを押す必要があるわけですが、
デフォルトでは、`CTRL-a`から`u`を押すまでが 1000ミリ秒( = 1秒)以内で完結しないといけないわけです。

1秒を長いと見るか短いと見るかは人それぞれなので、これをお好みに調整できるのが、前項の`timeout_milliseconds`です。


## で、もう一回キーバインド

さて、皆さんはお気づきだろうか…。

デフォルトのキー設定では`Leader`キーなんて一切使われていないことに…😨

例えばこれ。

~~~admonish quote title="Default KeyBinds"
```lua
{ key = '"', mods = 'ALT|CTRL', action = act.SplitVertical{ domain =  'CurrentPaneDomain' } },
{ key = '%', mods = 'ALT|CTRL', action = act.SplitHorizontal{ domain =  'CurrentPaneDomain' } },
```
~~~
```admonish note
`ALT|CTRL`は`Alt`キーと`Ctrl`キーを同時押しです。

さらに`"`を押せと言われれば`Shift`キーを押しながら`'`です。[^key]
```
…なんか、難しくないですか？

それだったら、下のようにしたほうが楽じゃないですか？

~~~admonish example title="keybinds.lua"
```lua
{ key = '"', mods = 'LEADER', action = act.SplitVertical { domain = 'CurrentPaneDomain' } },
{ key = '%', mods = 'LEADER', action = act.SplitHorizontal { domain = 'CurrentPaneDomain' } },
```
~~~

`tmux`と同じキーバインドですね。ペイン操作も`WezTerm`に一任しちゃいます。

`tmux`使ってないのに同等の機能が実現できちゃうんですよ？すごくないです！？

もしどこかで`tmux`を使うことがあっても同一操作なので迷わず使えます、たぶん！

~~~admonish note
さらにタイムリーなことに、`Copy Mode`の各種`jump`機能も実装されてました。(9/22時点では`nightly build`だけです。)

[update docs for new copy-mode functions](https://github.com/wez/wezterm/commit/8458b2b62d90cbf3326c39ed5a72ef256588ebe3)

`tmux`のキーバインドを完全に真似るのであれば、`CopyMode`に入るキーバインドはこれですね。
```lua
  { key = '[', mods = 'LEADER', action = act.ActivateCopyMode },
```

`jump`機能はデフォルトのままで`tmux`と同じキーバインドが割り当てられているようなので、そのままいけます。[^copy-mode]
~~~

ということで、キーバインドは色々試してみてほしいです。

```admonish info title="[enum: KeyAssignment - Wez's Terminal Emulator](https://wezfurlong.org/wezterm/config/lua/keyassignment/index.html)"
A KeyAssignment represents a pre-defined function that can be applied to control the Window, Tab, Pane state typically when a key or mouse event is triggered.

KeyAssignment は、キーまたはマウス イベントがトリガーされたときに、通常 Window、Tab、Pane の状態を制御するために適用できる事前定義された関数を表します。
```

```admonish success
キーバインドについてはこのくらいでしょうか。次からは外観を変えていきたいと思います。
```

[^other]: tmux のデフォルトは `CTRL-b`、vimのデフォルトは`\`です。
ちょっと遠い位置に置かれていて大変なので、 Leaderキーのカスタマイズは一般的に行われているみたいです。
メジャーなカスタマイズ先は`CTRL-a`や、`CTRL-j`、`CTRL-,(カンマ)`、`CTRL-Space`あたりでしょうか？

[^minority]: 色んな意味で少数派なんですけどね。わたしもこの環境です。

[^key]: USキーボードの場合。

[^copy-mode]:`3.5 Keybind`で「いや、自分のキーバインドに切り替えたじゃないかー！」と思われた方、ごもっともです。実は`copy-mode`のキーバインドには触れていませんでした。
ちょっとこの辺、複雑ですよね...。また今度改編します...。
