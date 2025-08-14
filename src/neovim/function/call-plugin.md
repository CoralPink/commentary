# Call The Plugin

この章もこれで最後です☺️ もうちょっとだけがんばれ❗

```admonish warning title=""
全然隠れてねーってばよ🍥{{footnote:
『NARUTO -ナルト-』(ナルト) は、岸本斉史による日本の漫画。
『週刊少年ジャンプ』(集英社) において、1999年43号から2014年50号まで連載された。
全700話で、単行本は全72巻と外伝1巻。

忍同士が超常的な能力「忍術」「体術」「幻術」「仙術」を駆使して派手な戦いを繰り広げるバトルアクション漫画。
アジア各地の民話や伝承、宗教のオマージュを巧みに取り組んだ世界観の中で主人公と仲間達の友情、裏切りと復讐、
師弟や家族の絆が中心として描かれ、忍の世界とその起源・歴史を含めた重層的なストーリー展開となっている。

中盤以降は主人公であるうずまきナルトが単に戦いではなく "対話" と "許し" を以って平和をもたらそうとするなど
"少年漫画らしからぬ" 要素も含まれるようになり、
読者からの支持が高い「ペイン編」での「ナルトが師である自来也を殺した敵と対話し、和解する。」という描き方は
「ある意味でタブー (苦笑)。少年漫画では普通はやらないやり方だった。」と作者自らが後年述懐している。

本作の主人公のうずまきナルトが
「ニューズウィーク日本版」2006年10月18日号の特集「世界が尊敬する日本人100」に架空の人物として唯一選出され、
2017年に公益財団法人新聞通信調査会がアメリカ、イギリス、フランス、中国、韓国、タイの6カ国で実施した世論調査
「知っている日本人」では、フランスで昭和天皇と安倍晋三に次いでナルトが3位となった。
また、Googleが、2023年の検索ランキングを発表し、カテゴリー別の「世界で最も検索された言葉」では、
アニメ部門で「NARUTO－ナルト－ 疾風伝（Naruto: Shippuden）」が、過去25年間の検索数世界1位を記録した。
この作品きっかけでラーメンを知った人も多く、海外のラーメンブームや売上にも貢献した。
[Wikipedia](https://ja.wikipedia.org/wiki/NARUTO_-ナルト-)より
}}

![konoha-gakure](img/konoha-gakure.webp)
```

## require

少し手順が増えますが、`lesson`ディレクトリを作って、その中に`init.lua`を配置してください。

こんな感じで😉

![make-dir](img/make-dir.webp)

うん😄 そうしたら`lesson/init.lua`にコードを入れておきます。

~~~admonish example title="lesson/init.lua"
```lua
local M = {}

function M.myprint()
  print("You did it! It's working!!")
end

return M
```
~~~

```admonish note
`local M`とかなんやねんっていう疑問は、プラグインを作る側になったら知ることでしょう❗きっと☺️
```

で、これを呼び出したいんですが、結局また`keybinds.lua`を使ってしまいます。

~~~admonish example title="keybinds.lua"
```lua
local lesson = require 'lesson'

vim.keymap.set('n', '<Leader>9', lesson.myprint)
```
~~~

じゃあ、ぽちぽちっと<kbd>Leader</kbd><kbd>9</kbd>で呼んでみましょう...。動くかなぁ〜❓

![call-function5](img/call-function5.webp)

動いたぁ〜❗😆

~~~admonish tip
`local`変数を使わずに以下のように書くこともできます。

```lua
vim.keymap.set('n', '<Leader>9', require('lesson').myprint)
```
~~~

`keymap.set`からプラグインが持っている機能を呼び出すのは、よく見られる使い方です。

```admonish warning title=""
イチャイチャタクティクス🫣

![kakashi](img/kakashi.webp)
```

## :source / require()

`:source`について、`14.1 Warming Up`で触れたんですが、一個気にしたいことがあって、それが`require`です。

`require`には二度目以降の呼び出しはキャッシュを読みにいくっていう賢いとしか言いようがない仕様があるんですけど、
例えば`require`の先をどんなに更新していようとも、`:so`だと更新前のキャッシュを実行するだけになるみたいなんですね。

```admonish info title="[The require Function](https://www.lua.org/pil/8.1.html)"
require controls whether a file has already been run to avoid duplicating the work.

requireは、ファイルが既に実行されているかどうかを制御し、作業の重複を防ぐ。
```

例えば、`Neovim`を終了させずに下の変更を反映させる方法が見つからない...。

```admonish question
上の項でやった`myprint`の文言を変えて...。

![try-reload1](img/try-reload1.webp)

どこで`:so`しても文言に全く変化がない...。

![try-reload2](img/try-reload2.webp)

```

なので、なんか思った通りいかないー❗ってなっても慌てないで😉

```admonish note
わたしはこの辺りが全く掴めないので、いつも再起動しまくってます😆

...。😢
```

`require`のキャッシュを読み直してるだけっていう可能性を疑ったり、`Neovim`を起動し直して試すっていうことも選択のうちに入れておいて下さい😉

```admonish warning title=""
藤井くん❗ここからどうすれば勝てる...❓

![shikamaru](img/shikamaru.webp)
```

## nvim_create_user_command

もう一個だけやっておきたいのは、独自コマンドからプラグインを使うパターンです。

今度は`nvim`ディレクトリまで上がって、`plugin/lesson`ディレクトリを作成してください。

~~~admonish quote title="Command"
```sh
mkdir -p plugin/lesson
```
~~~

![make-dir2](img/make-dir2.webp)

~~~admonish tip
今回のように、2階層以上のディレクトリを作成したい場合、本来は「親ディレクトリから順に作っていかなければエラー」となりますが、

```sh
# -p を使わないと2手かかる
mkdir plugin
mkdir plugin/lesson
```

`-p`オプションを使用することで、このような手間を回避して一気に作成できます。
~~~

これもあんまり深くは潜らず、さらっとだけやります。

~~~admonish info title=":h nvim_create_user_command"
```txt
nvim_create_user_command({name}, {command}, {*opts})
  Create a new user command |user-commands|

  {name} is the name of the new command. The name must begin with an
  uppercase letter.

  {command} is the replacement text or Lua function to execute.

  新しいユーザーコマンドを作成する |user-commands| 。

  {name} は新しいコマンドの名前。名前は大文字で始まる必要がある。
  {command}は、実行する置換テキストまたはLua関数。
```
~~~

それでは、`nvim/plugin/lesson/init.lua`にコードを書きます。

~~~admonish example title="nvim/plugin/lesson/init.lua"
```lua
vim.api.nvim_create_user_command('Order', function()
  if vim.fn.input('Coffee or beer? > ') == 'beer' then
    vim.cmd.echo '"\nCheers!!"'
  end
end, {})
```
~~~

~~~ admonish note
コードは`:h input`の`Example`から持ってきて、`lua`で動くように書き換えました。

```txt
input({opts})
  The result is a String, which is whatever the user typed on
  the command-line.

  結果は String で、ユーザーがコマンドラインで入力したもの。

  Example:
    :if input "Coffee or beer? " == "beer"
    :  echo " Cheers!"
    :endif
```
~~~

`plugin`ディレクトリに置いた`lua`ファイルは`require`などをしなくても自動で読み込まれます。

```admonish note
これもやっぱり`9. Lua Module`で触れてました。`Runtime files`項です😉
```

じゃあ、実際にオーダーしてみましょう。コマンドから`:Order`と入れてみてください。

```vim
:Order
```

```admonish warning title=""
ばあちゃん❓

![tsunade](img/tsunade.webp)
```

Coffee☕ もいいけど、今日はもう終わりだし beer🍺 でいいよね😆

![beer](img/beer.webp)

乾杯❗🍻

![cheers](img/cheers.webp)

```admonish note
飲み終わったら`plugin`ディレクトリは消しておきましょう。`lesson`ディレクトリとrequire、keymapも忘れずに...。
```

```admonish warning title=""
あいやしばらく❗

![jiraiya](img/jiraiya.webp)
```

## Wrap Up

本当はもっと`:h packages`で説明されているような本格的なものを作れたら良かったんだけど、
わたし自身がその領域にまで達していないので、かなりチープな付け焼き刃になってしまっています。

雰囲気くらいは伝わったでしょうか...❓😅

自信を与えてあげられるような内容ではなかったかもしれませんが、
"熱血さえあればそうとも限らないぞ❗❗" ってことで、お互い頑張りましょう🤗

```admonish warning title=""
口寄せ🐸

![naruto](img/naruto.webp)
```

```admonish warning title=""
瞼には目を、歯には抜けを、書きたがるのは万国共通なのか❓😮

![dai-nana-han](img/dai-nana-han.webp)

![minato-kushina](img/minato-kushina.webp)

...いや、島の者の犯行のセンも消えないか🤔
```

```admonish success
<div style="text-align: center">
PLUG-IN WILL RETURN

プラグインは帰ってくる
</div>
```
