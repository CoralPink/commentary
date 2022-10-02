# DPI Detection

前回は手動でフォントサイズの切り替えを行いましたが、今回はこれを`dpi`の変更を検知して自動で切り替わるようにします。

## まず前置き

さて、これまでにも何度か出てきていた`wezterm.on`ですが、以下のような説明がありました。

```admonish info title="[wezterm.on(event_name, callback)](https://wezfurlong.org/wezterm/config/lua/wezterm/on.html)"
wezterm.on can register multiple callbacks for the same event; internally an ordered list of callbacks is maintained for each event.
When the event is emitted, each of the registered callbacks is called in the order that they were registered.

wezterm.on は、同じイベントに対して複数のコールバックを登録することができます; 内部的には、各イベントに対してコールバックの順序付きリストが維持されます。
イベントが発信されると、登録された各コールバックは、登録された順に呼び出されます。
```

これを踏まえた上で、`update-status`をもう一個作ります。[^a]

```admonish info title="[update-status](https://wezfurlong.org/wezterm/config/lua/window-events/update-status.html)"
There is no defined return value for the event, but its purpose is to allow you the chance to carry out some activity and then ultimately call window:set_right_status or window:set_left_status.

このイベントの戻り値は定義されていませんが、その目的は、何らかの活動を行い、最終的に window:set_right_status または window:set_left_status を呼び出す機会を提供することです。
```

説明にもある通り、「最終的に`window:set_right_status`または`window:set_left_status`を呼び出す目的」のものであるため、
なんかコレじゃないとは思っていますが、他に方法が見つけられませんでした😢

```admonish note
今後の仕様追加・変更によって、より自然に実現できるかもしれませんね。
```

## では実装

`event.lua`に追記していきます。

~~~admonish example title="event.lua"
```lua
local DPI_CHANGE_NUM = 140
local DPI_CHANGE_FONT_SIZE = 10.0

local prev_dpi = 0

wezterm.on('trigger-dpi', function(window, dpi)
  local overrides = window:get_config_overrides() or {}
  overrides.font_size = dpi >= DPI_CHANGE_NUM and DPI_CHANGE_FONT_SIZE or nil

  window:set_config_overrides(overrides)
end)

wezterm.on('update-status', function(window, pane)
  local dpi = window:get_dimensions().dpi

  if dpi == prev_dpi then
    return
  end

  wezterm.emit('trigger-dpi', window, dpi)

  prev_dpi = dpi
end)
```
~~~

`dpi`と`font_size`周辺の値はわたしの環境にあわせてぼや〜っと決め打ちにしてるので適宜調整してください。

動作としては、`dpi`に変更があったらカスタムイベントの`trigger-dpi`を呼んでフォントサイズを切り替えます。
`trigger-dpi`自体は手動でフォントサイズを切り替える処理とほぼ同じですね。

```admonish note
理由はちょっとよくわからなかったのですが、

カスタムイベントに渡した`window`に対しての`get_config_overrides().dpi`が上手くいかなかったので、
`wezterm.emit('trigger-dpi', window, dpi)`として`dpi`も渡しています。これであれば動くみたいです。
```

```admonish success
なんか、すごい簡単でしたね😆

既に用意されているロジックをつなぐだけ☺️
```

[^a]:ステータスバーの飾り付けの際にも使用しましたね。
