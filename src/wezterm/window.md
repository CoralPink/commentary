# Window

ここではウィンドウの設定を行なっていきます。

## Color Schemes
Wezterm では数多くのカラースキームを内蔵しているため、簡単に設定が可能です。

以下から好きなカラースキームを選んで指定します。

```admonish info title="[Color Schemes](https://wezfurlong.org/wezterm/colorschemes/index.html)"
735 Color schemes listed by first letter

735種類のカラースキーム一覧
```

お気に入りのカラースキームは見つかりましたか？

わたしは`Catppuccin Mocha`を愛用しているので、以下のようになりました🥰
~~~admonish example title="wezterm.lua"
```lua
color_scheme = 'Catppuccin Mocha',
```
~~~

```admonish note
ちなみに、このWebページのカラースキームも`Catppuccin`を使ってたりします。

セルフサービスなので、左上のパレットアイコンからお好みで淹れて
{{footnote: 誤字じゃないです。[カプチーノ](https://ja.wikipedia.org/wiki/カプチーノ)なので❗}}みてください😄
```

## window_background_opacity

```admonish info title="[Colors & Appearance - Wez's Terminal Emulator](https://wezfurlong.org/wezterm/config/appearance.html#window-background-opacity)"
If your Operating System provides Compositing support then WezTerm is able to specify the alpha channel value for the background content

オペレーティングシステムがコンポジットをサポートしている場合、WezTerm は背景コンテンツのアルファチャンネル値を指定することができます。
```
アルファチャンネル値には 0.0 から 1.0 までの値を用います。

透過値はお好みで。わたしはこんな感じで。

~~~admonish example title="wezterm.lua"
```lua
window_background_opacity = 0.93,
```
~~~

## 一旦確認…
さて、ここまでで`wezterm.lua`は以下のようになりました。

~~~admonish example title="wezterm.lua"
```lua
return {
	color_scheme = "Catppuccin Mocha",
	window_background_opacity = 0.93,
}
```
~~~
~~~admonish warning
ここまでの書き方が解りにくかったらごめんなさい...😢

wezterm.lua に記述する場合、基本的には return {} の中に記述していきます。
~~~

![opacity](img/opacity.webp)


```admonish success
カラースキームについては、白文字しかない状態だと「ちょっと何言ってるかわかんない」ですが、透過は確認できましたね😄

次は、せっかく設定したカラースキームを見たいので、少し脇に逸れてプロンプトを変えてみましょう。
```
