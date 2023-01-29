# tabstop / shiftwidth / expandtab

 さすがは "bufferリゾーン" ですね😆 いきなり "みつごどりモンスター" が飛び出してきました❗

## tabstop

~~~admonish info title=":h tabstop"
```txt
                                'tabstop' 'ts'

'tabstop' 'ts'              number (default 8)
                            local to buffer

  Number of spaces that a <Tab> in the file counts for.  Also see
  the |:retab| command, and the 'softtabstop' option.

  ファイル中の<Tab>がカウントするスペースの数。
  |:retab| コマンドと 'softtabstop' オプションも参照のこと。

  Note: Setting 'tabstop' to any other value than 8 can make your file
  appear wrong in many places, e.g., when printing it.
  The value must be more than 0 and less than 10000.

  注意: 'tabstop' を 8 以外の値に設定すると、ファイルを印刷するときなど、多くの場所で間違って表示されることがある。
  値は0以上10000以下でなければならない。

  There are four main ways to use tabs in Vim:

  Vimでタブを使うには、主に4つの方法がある。
```
~~~

`tabstop`は俗に言う "タブ幅" です。デフォルトのまま`8`ってなってると、古いファイルのような印象を持っちゃうんですが、実際のところはどうなのかな...🤔

単純にタブ幅だけを設定して終わりなら話は簡単なのですが、`Neovim`の場合、この先に出てくるオプションとやや複雑に絡み合っています😓

そのためなのか、ヘルプ (上の抜粋に含まない部分) ではこれらを適切に設定する4つの方法が示されています。

わたしが採用しているのは、オーソドックスな`2.`です☺️

~~~admonish info title=""
```txt
  2. Set 'tabstop' and 'shiftwidth' to whatever you prefer and use
  'expandtab'.  This way you will always insert spaces.  The
  formatting will never be messed up when 'tabstop' is changed.

  'tabstop' と 'shiftwidth' を好きなように設定し、'expandtab'を使用する。
  これで、常にスペースを挿入することができる。'tabstop'を変更しても、書式が乱れることはない。
```
~~~

「`expandtab`を使用すれば、`tabstop`と`shiftwidth`は好きにしちゃっていいよー。」...と読めますね。

一つずつ確認していきましょう😉

## shiftwidth

~~~admonish info title=":h shiftwidth"
```txt
'shiftwidth' 'sw'		  number (default 8)
			                      local to buffer

  Number of spaces to use for each step of (auto)indent.  Used for
  |'cindent'|, |>>|, |<<|, etc.
  When zero the 'ts' value will be used.  Use the |shiftwidth()|
  function to get the effective shiftwidth value.

  オートインデントの各ステップに使用するスペースの数。 |cindent’|、 |>>、 |<< などに使用される。
  ゼロの場合、'ts'の値が使用されます。 有効な shiftwidth の値を得るには |shiftwidth()| 関数を使用する。
```
~~~

`shiftwidth`を "zero" にすれば、`tabstop`と同じ値を使ってくれるそうです。

```admonish note
当たり前だー❗と思われるかもしれませんが、ヘルプで "zero" と言っているのは、`number`型の`0`です。
```

## タブ幅を決める

この2つを別の値に設定して活用するシチュエーション、ちょっとわたしでは想像が及ばないので、もう`0`にしちゃいます😅

`tabstop`の方は、"好きなように設定し"というお言葉に甘えて、お好みの数値を入れましょう😆

~~~admonish example title="options.lua"
```lua
vim.api.nvim_buf_set_option(0, 'tabstop', 2)
vim.api.nvim_buf_set_option(0, 'shiftwidth', 0)
```
~~~

```admonish note
わたしは`2`にしていますが、`4`の方が広く使われているかもしれません。
```

## expandtab

その上で、"`expandtab`を使用する"んでしたね。

~~~admonish example title="options.lua"
```lua
vim.api.nvim_buf_set_option(0, 'expandtab', true)
```
~~~

~~~admonish info title=":h expandtab"
```txt
                                        'expandtab' 'et' 'noexpandtab' 'noet'

'expandtab' 'et'                    boolean (default off)
                                    local to buffer

	In Insert mode: Use the appropriate number of spaces to insert a
	<Tab>.  Spaces are used in indents with the '>' and '<' commands and
	when 'autoindent' is on.  To insert a real tab when 'expandtab' is
	on, use CTRL-V<Tab>.  See also |:retab| and |ins-expandtab|.

  挿入モードの場合: <Tab>を挿入する際に、適切な数のスペースを使用します。
  スペースは '>' と '<' コマンドによるインデントと 'autoindent' がオンのときに使用されます。
  expandtab' がオンの時に本当のタブを挿入するには、CTRL-V<Tab> を使用する。
  |:retab| と |ins-expandtab| も参照のこと。
```
~~~

このオプションが、"常にスペースを挿入することができる" ...の、部分を担っているんですね☺️

### autoindent

ちなみに、`expandtab`のヘルプの中に出てきた`autoindent`を少し見てみると...、

~~~admonish info title=":h autoindent"
```txt
			                              'autoindent' 'ai' 'noautoindent' 'noai'

'autoindent' 'ai'                   boolean (default on)
			                        local to buffer

	Copy indent from current line when starting a new line (typing <CR>
	in Insert mode or when using the "o" or "O" command).

  改行時に現在行のインデントをコピーする
  （挿入モード、<CR>を入力したとき、または "o" や "O" コマンドを使用したとき）。
```
~~~

これはデフォルト`on`なので特に触らなくても平気でしょう。

よーし、これで全ての設定が終わったぞ❗やったね❗❗

## フィナーレ...❓

...って思うじゃないですか😮

実はこれだけだと、起動直後に開いたバッファでしか設定したオプションが有効になりません...。

```admonish note
例えば、単純に`nvim`って起動して、そこから`:e abc.txt`とかして開いたバッファでタブを入力してみると...❓
```

どうしよー😭ってなるんですけど、泣かなくて大丈夫。解決策はちゃんとあるから🤗

```admonish quote title=""
アナウンス『ピンポーン❗
じかんが　きました❗
```

```admonish quote title=""
アナウンス『bufferリ　ゲーム
おわり　でーす❗
```

```admonish question
入り口のおじさん、メガホンで知らせるって言ってなかった❓メガホン...なのかぁ❓
```

```admonish success
`10. Options`章は...❗ なんと...❗

これで終わりです😮

ビックリするぐらい中途半端なので、すごく悩むところではあるんですが...、
でも`Options`というカテゴリでやると不自然になっちゃうんで、やっぱり思い切って章を跨いじゃいます😆

次回、`buffer`解決編に続く。続くったら続く...🐃🐃🐃
```
