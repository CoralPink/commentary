# Font 

これはもう、ほんとに好きなフォントでいいです。

以下に再掲しますが、`Starship`を使用する場合も`WezTerm`であれば`Nerd Font`を考慮する必要がありません😆

```admonish info title="[wezterm.nerdfonts](https://wezfurlong.org/wezterm/config/lua/wezterm/nerdfonts.html)"
WezTerm includes Nerd Font Symbols Font as a default font fallback which means that these
special symbols are available even without requiring you to use a patched font.

WezTerm は Nerd Font Symbols Font をデフォルトのフォントのフォールバックとして含んでおり、
これはパッチされたフォントを使わなくてもこれらの特殊記号が利用可能であることを意味します。
```

ただ、環境にもよるかもしれませんが、デフォルトのままだと日本語がイマイチ...😢

![font-roboto](img/font-roboto.webp)

なんてことがあるので、次項に続くわけです。

## プログラミングフォント Firge (ファージ)

例として、わたしが普段お世話になっているフォントを紹介します。

```admonish info title="[GitHub - yuru7/Firge](https://github.com/yuru7/Firge)"
Fira Mono と源真ゴシックを合成したプログラミングフォント Firge (ファージ)
```

「ダウンロードはこちら」というリンクから、お言葉に甘えて`FirgeNerd_v0.2.0.zip`をダウンロードします。ありがとー💕

```admonish note
`Nerd Font`いらないって言いながら`Nerd`とか言ってんの何なの⁉️ ってなっちゃうんですが、なんかごめんなさい。
```

## インストール
フォントのインストールは OS の作業になるので、`macOS`のやり方だけ軽く載せます。

...基本的にはどのOSでも、ダウンロードしてきたファイルを開けば「インストールしますか？」的なの出てきますよね。多分。

やればできる!!

![font1](img/font1.webp)
![font2](img/font2.webp)
![font3](img/font3.webp)

ほらできた🤗

## WezTerm 設定
で、このフォントを`WezTerm`に設定すれば良さそう。

~~~admonish example title="wezterm.lua"
```lua
font = require("wezterm").font("Firge35Nerd Console"),
```
~~~

```admonish info title="[wezterm.font](https://wezfurlong.org/wezterm/config/lua/wezterm/font.html)"
The first parameter is the name of the font; the name can be one of the following types of names:

- The font family name, eg: "JetBrains Mono". The family name doesn't include any style information (such as weight, stretch or italic), which can be specified via the attributes parameter. This is the recommended name to use for the font, as it the most compatible way to resolve an installed font.
- The computed full name, which is the family name with the sub-family (which incorporates style information) appended, eg: "JetBrains Mono Regular”.
- (Since 20210502-154244-3f7122cb) The postscript name, which is an ostensibly unique name identifying a given font and style that is encoded into the font by the font designer.

最初のパラメータはフォントの名前です。この名前は、以下のタイプの名前のいずれかになります。

- フォントファミリ名、例："JetBrains Mono 「JetBrains Mono" のようなフォントファミリーの名前です。このファミリー名にはスタイル情報（ウェイト、ストレッチ、イタリックなど）は含まれませんが、これは属性パラメータで指定できます。これは、インストールされているフォントを解決するための最も互換性のある方法であるため、フォントに使用する推奨される名前です。
- 計算されたフルネームは、ファミリー名にサブファミリー（スタイル情報を含む）を追加したもので、例．例えば、「JetBrains Mono Regular」です。
- (20210502-154244-3f7122cb 以降) ポストスクリプト名。これは、フォントデザイナーがフォントにエンコードした、与えられたフォントとスタイルを識別する表向きユニークな名前です。
```

わたしは`Firge35NerdConsole-Regular.ttf`をインストールして、ファミリー名の`Firge35Nerd Console`で指定しています。

```admonish note
ファミリー名は`Font Book`アプリケーションで確認できます。「識別子」項目の中ですね。

出ていない場合は「情報を確認する(`command + i`)」をポチッと。

![font-info](img/font-info.webp)
```

フォントサイズも指定できるので、一緒に入れておきましょう。

~~~admonish example title="wezterm.lua"
```lua
font_size = 12.0,
```
~~~

```admonish info title="[font_size](https://wezfurlong.org/wezterm/config/lua/config/font_size.html)"
Specifies the size of the font, measured in points.

You may use fractional point sizes, such as 13.3, to fine tune the size.

フォントのサイズをポイント数で指定します。

13.3 のような小数点のサイズを使用して、サイズを微調整することができます。
```

上の例はデフォルト値そのままですが、お好みで調整してください。

```admonish success
どうでしょう？明らかに日本語が綺麗になりました❗️

![font-firge](img/font-firge.webp)

やったね🤗
```
