# Status Bar

今度はステータスバーを飾り付けちゃおっかなーと思います😆

`status.lua`というファイルを追加しましょう。

~~~admonish example title="status.lua"
```lua
local wezterm = require 'wezterm'

wezterm.on('update-status', function(window, pane)
end)
```
~~~

もうお馴染みですね😉 `wezterm.lua`から読み込みましょう。

~~~admonish example title="wezterm.lua"
```lua
require 'status'

-- ↓ ここまでで色々と記述してきたところ
return {
  -- 〜
}
```
~~~

さて、`wezterm.on`を利用して`update-status`イベントをフックします。

```admonish info title="[update-status](https://wezfurlong.org/wezterm/config/lua/window-events/update-status.html)"
The update-status event is emitted periodically (based on the interval specified by the status_update_interval configuration value).

There is no defined return value for the event, but its purpose is to allow you the chance to carry out some activity and then ultimately call window:set_right_status or window:set_left_status.

update-status イベントは定期的に発行されます (status_update_interval 設定値で指定された間隔に基づく)。

このイベントの戻り値は定義されていませんが、その目的は、何らかの活動を行い、最終的に window:set_right_status または window:set_left_status を呼び出す機会を提供することです。
```

とのことなので、`wezterm.lua`の中でステータス更新間隔を指定しておきましょう。

~~~admonish example title="wezterm.lua"
```lua
return {
  status_update_interval = 1000,
}
```
~~~

```admonish info title="[status_update_interval](https://wezfurlong.org/wezterm/config/lua/config/status_update_interval.html)"
Specifies the number of milliseconds that need to elapse between triggering the update-right-status hook.

update-right-status フックのトリガーとなるまでに必要なミリ秒を指定します。
```

デフォルトは`1000ミリ秒(=1秒)`です。そのままで良ければ必要ありません。

```admonish warning
ドキュメントでは`update-right-status`となっていますが、前出の`update-status`が後継仕様となっているので、こちらを使っていきます。
```

```admonish success
それでは次に進みましょう❗
```
