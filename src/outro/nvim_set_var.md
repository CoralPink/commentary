# 🦸‍♀️nvim_set_var (Disable the provider)

```admonish success title=""
Deep in the jungle, where the mighty tiger lies

Bill and his elephants were taken by surprise

ジャングルの奥深く、強大な虎が横たわる

ビルと象たちは意表を突かれて おでれぇたぞう
```

私事ですが、日本各地が爆弾低気圧でわーわーゆーてた頃、北陸旅行を堪能してきました。

贅沢に３泊も❗

すでに持ち金はマイナスだし、徳政令には期待できないしでもうパニックです😵‍💫

初日は新幹線カードを使ってなんとか金沢までやって来ましたが、
最初の目的地はさらに西の福井なので、ここからは特急カードを使います。

ちょうど「北陸新幹線延伸」と「特急サンダーバード短縮」の節目だったので❗

このサイトに辿り着くような人が "サンダーバード" と聞けば
[Mozilla](https://www.mozilla.org/ja/)の[Thunderbird](https://www.thunderbird.net/ja/)
を思い浮かべるかもしれません。

しかし、ここで言っているのは
[West Japan Railway Company](https://www.westjr.co.jp)のサンダーバードです。

```admonish success title=""
So Captain Marvel zapped him right between the eyes

そこに現れた Captain Marvel 虎の眉間にズバッと一撃
```

"サンダー" というぐらいなんで悪天候に強いのかと思いきや、
強風には弱いそうなので、どちらかといえば "バード" 成分の方が多めな気がします🐦

爆弾低気圧なんて天敵でしょうね😿
この日も琵琶湖をぐるっと迂回して走っていたとかいないとか。

ゆーてわたしもハートウォーミングでやらせてもろ〜てますんで「琵琶湖の風とめたろかぁ😊」 ゆーわけです。

...まあ、実際頼まれても「そんな神通力なかったわぁ❗」ゆーて、すっとぼけますけどね🙄

```admonish note
すでにお気づきかとは思いますが、このサイトは "エセ関西人" がお送りしとるんですわぁ❗🤣

(コッテコテのね❗)
```

![fukui-station](img/fukui-station.webp)

Mozilla とは関係ないけどいいじゃない🦖 とってもハートウォーミング🥰

後ろにある真新しい新幹線ホームにはまだ人がいないので、この辺の地理をよく知らない人間からすると

「ん❓まだ福井来てなかったの😑❓」ってなるんですけど。

だって、長野から延伸した時の CMソングはいかにも福井まで行ける感じで歌ってたじゃん🚄

```admonish success title=""
All the children sing

子供たちはみな歌う
```

```admonish quote title=""
と〜や ま いっしか〜わ ふっくい 🎶
```

「えぇ...😨」ってなるんですけど...❗

まあでも伸びたんなら、もはやどうでもいい❗

```admonish danger title=""
住民は　大歓迎ですぞ！
```

## 🦸 nvim_set_var

~~~admonish info title=":h nvim_set_var"
```txt
nvim_set_var({name}, {value})
  Sets a global (g:) variable.

  Parameters: ~
    • {name}   Variable name
    • {value}  Variable value
```
~~~

`nvim_set_var`こと Captain Marvel{{footnote:
このサイトでは、[nvim_set_var](../neovim/leader.html?highlight=nvim_set#nvim_set_var)をなんかたまに
Captain Marvel と呼称することがあるんでしたねー...。時が経つのは早い。
}}は[Shazam](https://en.wikipedia.org/wiki/Captain_Marvel_(DC_Comics))とも
Superman{{footnote:
Superman は DC Comics の出版するアメリカン・コミックで 1938年に誕生した架空のスーパーヒーロー。
Krypton星から地球に降り立ったヒューマノイド型エイリアンの難民で、超人的な能力を身につけている。
普段はメトロポリスの新聞社 Daily Planet でジャーナリスト Clark Kent として働く。
テレビシリーズ冒頭のナレーションは「弾丸(たま) よりも速く、力は機関車よりも強く、高いビルディングもひとっ跳び❗」。
[Wikipedia](https://en.wikipedia.org/wiki/Superman_(franchise))より}}とも
スッパマンさん{{footnote:
スッパマン は[Dr.スランプ](https://en.wikipedia.org/wiki/Dr._Slump)に登場する
オカカウメ星からやってきた自称正義の味方。
しかし行動はアホそのもので、なおかつ悪質、陰湿、陰険で根に持つタイプ。
村人からは「アホのスッパマン」とコケにされている。
普段はアルバイトでやっているPCB (ペンギン村文化放送局) テレビのレポーター暗悪健太 (くらあく けんた) として変装し、
正体がばれないようにパトロールをしているが、変装はほとんどの村人にバレている。
事件に遭遇すると電話ボックスでコスチュームに着替えて変身するが、敵が自分より強いとわかると相手に媚びへつらう。
[ドラゴンボール](https://en.wikipedia.org/wiki/Dragon_Ball) に登場した際は、レッドリボン軍のブルー将軍に対し最初は立ち向かおうとするが、
電話ボックスを簡単に破壊できることを見せつけられた途端、則巻千兵衛の家への道を教え、自分の車を使わせた。
決め台詞は「ウメボシたべてスッパマン❗」自ら付けたキャッチフレーズ的なものは
「オカメコオロギより速く、トノサマバッタより強く、(価格が) 高いカズノコなどひとっ飛び❗」
[Wikipedia](https://en.wikipedia.org/wiki/List_of_Dr._Slump_characters#Suppaman)より}}
ともまた違った魅力があるのです❗かぁっくいー❤️

```admonish tip
`nvim_set_var`は`global`変数に対して値をセットする汎用的な`API`なので、この節での使い方はあくまでも一例です。

このサイトで示している他の使い方としては
[mapleader](../neovim/leader.html#mapleader)や[maplocalleader](../neovim/leader.html#maplocalleader)などがあります。
```

ぶっちゃけ、このあと出てくるヘルプの文面は少し古く感じられるので、
今となっては特段効果のある`Tips`ではないかもしれません。

ただ、トリはずっと前からこれって決めてたんで、このままいっちゃいます😅

```admonish success title=""
The children asked him if to kill was not a sin

"Not when he looked so fierce," his mummy butted in

子供たちは彼に尋ねた 「殺すことは罪ではないの？」

"相手が獰猛に見えた場合は罪になりません" と彼のママが口を挟んだ
```

```admonish success title=""
"If looks could kill, it would have been us instead of him"

"だってもう見た目からして、虎ではなく私たちが殺されていたでしょう"
```

## 💫 init.lua

このページで示すサンプルコードはトップの`init.lua`に入れるのがいいんじゃないかな〜って思います 🐅

~~~admonish example title="init.lua"
```lua
vim.loader.enable()

--
-- 今回示すコードは、ここに入れていくといいかも〜??
--

require 'options'
require 'appearance'
require 'keybinds'
```
~~~

一人でずっとわーわーゆーとりますが、いよいよこのサイトで扱う`Neovim`最後の節です❗

```admonish success title=""
All the children sing

子供たちはみな歌う
```

```admonish success title=""
Hey, Bungalow Bill{{footnote:
The Continuing Story of Bungalow Bill (by [The Beatles](https://en.wikipedia.org/wiki/The_Beatles)):
この曲は The Beatles がインドで
महर्षि महेश योगी (Maharishi Mahesh Yogi) のもとに滞在していた時、
母親の Nancy Cooke de Herrera を訪ねていた若いアメリカ人、
Rik こと Richard A. Cooke III の虚勢と無教養な態度を嘲笑するものとして Lennon によって書かれた。

発端は象に乗って虎狩りに出かけたときのことだった (伝統的な行為として現地ガイドが提示したとされる)。
象の群れが虎に襲われ、Rik が虎を射殺した。
Nancy によれば、その場にいた全員が Rik の行動の必要性を認識していたが、Lennon の反応は軽蔑的で皮肉なものだったという。

Lennon は後に Playboy のインタビューで、この曲について
「"Bungalow Bill" は、短い休暇を取って哀れな虎を2、3頭撃ち殺した男が、神と共に部落に帰ってくるというストーリーで書いた。
[Jungle Jim](https://en.wikipedia.org/wiki/Jungle_Jim)というキャラクターがいて、
それを[Buffalo Bill](https://en.wikipedia.org/wiki/Buffalo_Bill)と組み合わせた。
10代の社会的コメントのような歌で、ちょっとしたジョークなんだ」と語っている。

McCartney は本作について
「今も僕のお気に入りの一つ。それは今の僕のスタンスとすごく共通するところがあるからだ。
この曲のメッセージは "本当にあの虎を撃つ必要があったのか? お前は立派な男ではなかったのか? お前は勇敢な男ではなかったのか?" というところ。
John はそれを、すごくうまく表現していると思う」と評している。

この曲は Lennon と共に オノ・ヨーコがリード・ヴォーカルをとっており、
The Beatles のメンバー以外がリード・ヴォーカルをとった唯一の曲である。
(...と、日本語のWikipediaには記載があるが、You Know My Name (Look Up The Number) はどういう扱いになっているのか判然としない...)
}}

What did you kill, Bungalow Bill?

おーい Bungalow bill

何を殺したの、Bungalow bill？
```

## 📽️ provider

ゆーて前回と同様、そこまで内容がないので、
北陸地方の風景を混ぜつつ、すっとぼけながらゆる〜く締めに向かいます🤪

### 🐍 Python Integration

[東尋坊](https://www.fuku-e.com/spot/detail_1476.html)名前は知ってるけど〜。

[東尋坊](https://www.fuku-e.com/spot/detail_1476.html)どこにあるかは知らない〜。

![tojinbo](img/tojinbo.webp)

この海には赤マスしかないと思っていた...❗

あれは誇張しすぎた日本海だったということか🤠

~~~admonish info title=":h provider-python"
```txt
Nvim supports Python |remote-plugin|s and the Vim legacy |python3| and
|pythonx| interfaces (which are implemented as remote-plugins).

Note: Only the Vim 7.3 legacy interface is supported, not later features such
as |python-bindeval| (Vim 7.4); use the Nvim API instead. Python 2 is not
supported.


PYTHON QUICKSTART ~

To use Python plugins, you need the "pynvim" module. Run |:checkhealth| to see
if you already have it (some package managers install the module with Nvim
itself).

For Python 3 plugins:
1. Make sure Python 3.4+ is available in your $PATH.
2. Install the module (try "python" if "python3" is missing):
```

```sh
python3 -m pip install --user --upgrade pynvim
```

```txt
The pip `--upgrade` flag ensures that you get the latest version even if
a previous version was already installed.

See also |python-virtualenv|.

Note: The old "neovim" module was renamed to "pynvim".
https://github.com/neovim/neovim/wiki/Following-HEAD#20181118
If you run into problems, uninstall _both_ then install "pynvim" again:
```

```sh
python -m pip uninstall neovim pynvim
python -m pip install --user --upgrade pynvim
```
~~~

だいぶ前に[ちょっとだけ](../neovim/leader.html#admonition-tip)触れていましたが、
ここで改めて`python3_host_prog`と`loaded_python3_provider`を取り上げます。

```admonish note
ヘルプでも触れられていますが、古くは`Python 2`のコンフィグも用意されていましたが、今は`Python 3`だけになっています。
```

このサイトで取り上げてきたプラグインやコードに限って言うと、
`Python`は全く使用していないので、その場合は無効化してしまって構いません😏

```admonish tip
ここで言う「全く使用していない」は "`Neovim`本体の動作には使用していない" という意味です。

「`Python`のコードを書くのに使ってるよー」って言うのとは、また別のおはなしです😉

...の、はずです。
```

#### 🔸python3_host_prog

まず、使用する場合はこれを入れるといいらしいです🐍

~~~admonish info title=":h g:python3_host_prog"
```txt
PYTHON PROVIDER CONFIGURATION ~

Command to start Python 3 (executable, not directory). Setting this makes
startup faster. Useful for working with virtualenvs. Must be set before any
check for has("python3").

Python 3 を起動するコマンド (ディレクトリではなく実行ファイル)。これを設定すると
起動が速くなります。virtualenv を使うときに便利です。このコマンドは
has("python3") の前に設定する必要があります。
```

```vim
let g:python3_host_prog = '/path/to/python3'
```
~~~

上のサンプルコードを`lua`で書くとこんな感じになるはずです 🌜

```lua
vim.api.nvim_set_var('python3_host_prog', '/path/to/python3')
```

```admonish tip
ここには`which`で出てくる`path`を教えてあげると良いです。

わたしは`Python3`も`brew`から入れてるのでこんなんなってます。

![which-python3](img/which-python3.webp)
```

~~~admonish note
わたしは専門外なのでよく知らないんですが... 😅

`virtualenv`などを使う場合は以下を参照❗

```vim
:h python-virtualenv
```
~~~

#### 🔹loaded_python3_provider

で、使用していない場合はこっち 🐍

~~~admonish info title=":h g:loaded_python3_provider"
```txt
To disable Python 3 support:

Python 3 のサポートを無効にするには
```

```vim
let g:loaded_python3_provider = 0
```
~~~

と言うことで、こうなります。

~~~admonish example title="init.lua"
```lua
vim.api.nvim_set_var('loaded_python3_provider', 0)
```
~~~

これで「わざわざ探しに行かなくていいよー」という意思表示になります。

```admonish tip
今後必要になった時は忘れずに切り替えないとだめだぞ😉❤️
```

```admonish note
紹介しておいてなんなん❓ってなりますが、
`python3_host_prog`とは違ってヘルプでも起動時間には言及されていないので、特に意味はないかもしれません😮
```

### 🏉 Ruby Integration

大量の "とやマネー" をもらってしまった〜の図。

![toya-money](img/toya-money.webp)

そのネーミングセンスなど、もはやどうでもいい...❗

```admonish warning title=""
コーラル社長さんは　持ち金が

マイナスにも　めげることなく...
```

```admonish warning title=""
北陸の　応援のためにと

塗炭の苦しみを

乗り越え　かけつけてくれました！
```

```admonish warning title=""
その心意気に　富山の

人々が　持ち金を　ゼロにするために

走りまわってくれました！
```

やったね😆

なんかおかげさまで借金も消えたので、あとはもう簡単に載っけていきます❗

無効化するだけであれば全部同じパターンですから😤

~~~admonish info title=":h provider-ruby"
```txt
Nvim supports Ruby |remote-plugin|s and the Vim legacy |ruby-vim| interface
(which is itself implemented as a Nvim remote-plugin).

RUBY QUICKSTART ~

To use Ruby plugins with Nvim, install the latest "neovim" RubyGem:
```

```sh
gem install neovim
```

```txt
Run |:checkhealth| to see if your system is up-to-date.
```
~~~

#### 🔹loaded_ruby_provider

~~~admonish info title=":h g:loaded_ruby_provider"
```txt
RUBY PROVIDER CONFIGURATION

To disable Ruby support:
```

```vim
let g:loaded_ruby_provider = 0
```
~~~

~~~admonish example title="init.lua"
```lua
vim.api.nvim_set_var('loaded_ruby_provider', 0)
```
~~~

### 🧜‍♀️ Perl integration

モダンとレトロの富山駅。

![toyama-canal](img/toyama-station.webp)

東京の都電が車と同じ右折車線に縦に並んでる様{{footnote:
なんか<a href="img/asukayama.webm" target="_blank">こんな感じ</a>
(リンク先は 20MB あるので注意)。この日はなぜか公園で阿波踊りをやっていたので Chaos に更なる拍車がかかっていた...。
}}も見ていて結構な Chaos っぷりだと思ってるんだけど、
この横並びもなかなかナイスな Chaos and Creation❗

~~~admonish info title=":h provider-perl"
```txt
Nvim supports Perl |remote-plugin|s on Unix platforms. Support for polling STDIN
on MS-Windows is currently lacking from all known event loop implementations.
The Vim legacy |perl-vim| interface is also supported (which is itself
implemented as a Nvim remote-plugin).
https://github.com/jacquesg/p5-Neovim-Ext

Note: Only perl versions from 5.22 onward are supported.

PERL QUICKSTART~

To use perl remote-plugins with Nvim, install the "Neovim::Ext" cpan package:
```

```sh
cpanm -n Neovim::Ext
```

```txt
Run |:checkhealth| to see if your system is up-to-date.
```
~~~

#### 🔹loaded_perl_provider

~~~admonish info title=":h g:loaded_perl_provider"
```txt
PERL PROVIDER CONFIGURATION~
To disable Perl support:
```

```vim
:let g:loaded_perl_provider = 0
```
~~~

~~~admonish example title="init.lua"
```lua
vim.api.nvim_set_var('loaded_perl_provider', 0)
```
~~~

### 🌳 Node.js Integration

[兼六園](https://www.pref.ishikawa.jp/siro-niwa/kenrokuen/)にはアオサギもやってくるらしいよ。

![kenroku-en](img/kenroku-en.webp)

これがアオサギなのかはよくわかんないですけど😅

~~~admonish info title=":h provider-nodejs"
```txt
Nvim supports Node.js |remote-plugin|s.
https://github.com/neovim/node-client/

NODEJS QUICKSTART~

To use javascript remote-plugins with Nvim, install the "neovim" npm package:
```

```sh
npm install -g neovim
```

```txt
Run |:checkhealth| to see if your system is up-to-date.
```
~~~

#### 🔹loaded_node_provider

~~~admonish info title=":h g:loaded_node_provider"
```txt
NODEJS PROVIDER CONFIGURATION~
To disable Node.js support:
```

```vim
:let g:loaded_node_provider = 0
```
~~~

~~~admonish example title="init.lua"
```lua
vim.api.nvim_set_var('loaded_node_provider', 0)
```
~~~

## 🩺 checkhealth

そんなこんなで 4つの`provider`を取り上げてきたわけですが、
これがちゃんと反映されているかについては、毎度お馴染み`checkhealth`で確認できます。

~~~admonish quote
```vim
:che
```
~~~

![provider_checkhealth](img/provider_checkhealth.webp)

全部無効化した場合であれば、こんな表示になるはずです😉

## 🧒 Eh up!

富山駅のコンコースに居た時のことなんだけど、ここにはストリートピアノが置いてあって、
どこからか現れた園児たちがそこで歌い始めたんだよね。

```admonish success title=""
All the children sing

子供たちはみな歌う
```

```admonish quote title=""
きがつけば はるのかぜが

あんなにうたっているよ

ありがとう こころをこめてありがとう

そして さよなら

<audio controls preload="none">
  <source src="audio/children-sing.mp3">
</audio>
```

鼻を啜ってるのか、コートに擦ってるのか、
変な音も入っちゃってるけど、もはやどうでもいい...❗

わたしはたまたま居合わせただけなんだけど、やさしい歌をありがとう🤗

最後に、富山駅からちょっと歩くと[運河](https://www.toyamashi-kankoukyoukai.jp/?tid=100105)のある風景。

![toyama-canal](img/toyama-canal.webp)

...最終回じゃないぞよ もうちっとだけ続くんじゃ 🐢

```admonish success
Eh up!{{footnote:
冒頭のリフレインを繰り返しながらフェード・アウトし、
拍手の後にLennon の "Eh up!" という掛け声が入り、曲間を置かずに While My Guitar Gently Weeps へと移行する。
[Wikipedia](https://en.wikipedia.org/wiki/The_Continuing_Story_of_Bungalow_Bill)より
}}

よお 元気か❗
```
