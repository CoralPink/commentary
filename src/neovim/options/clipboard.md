# ClipBoard

そうだそうだ。大事なものを忘れていました😅

~~~admonish info title=":h clipboard"
```
Nvim has no direct connection to the system clipboard. Instead it depends on
a |provider| which transparently uses shell commands to communicate with the
system clipboard or any other clipboard "backend".

Nvim は、システムのクリップボードに直接接続することはできない。
その代わり、システムのクリップボードや他のクリップボードの「バックエンド」と
通信するためにシェルコマンドを透過的に使用するプロバイダに依存する。

To ALWAYS use the clipboard for ALL operations (instead of interacting with
the '+' and/or '*' registers explicitly):  

クリップボードを常に使用する場合 ('+' や '*' を明示的に操作する代わりに以下のようにする):

set clipboard+=unnamedplus

See 'clipboard' for details and options.

詳細とオプションについては、「クリップボード」を参照。
```
~~~

これを設定しておくとクリップボードをシステムと共有できます☺️

要は、クリップボードを介して`Neovim`の文字列を他のアプリケーションに持って行ったり、来たりができるんですね❗便利😆

上のヘルプの中で、ほぼ答えは書いてくれてるんですが、詳細 (`options`の中にある`clipboard`) も確認してみましょう。

```admonish tip
今回、`provider の clipboard`と、`options の clipboard`を見たいのですが、

単純に`clipboard`とすると前者にしか飛べません。後者のように、コマンドを探す場合は`'`で囲うと一発で飛べます。

...確信は無いんですけどね😅

この先でもいくつか出てくるので、頭の片隅にでも置いといていただければ...。
```

~~~admonish info title=":h 'clipboard'"
```
'clipboard' 'cb'	string	(default "")
			            global

    This option is a list of comma-separated names.

    このオプションは、カンマで区切られた名前のリストである。
```
~~~

この先はレジスタの話が出てきて自信がない...😓

~~~admonish info title="unnamed / unnamedplus" collapsible=true
```

  These names are recognized:

  これらの名前は認識される。

						                        clipboard-unnamed
	unnamed
      When included, Vim will use the clipboard register '*'
			for all yank, delete, change and put operations which
			would normally go to the unnamed register.  When a
			register is explicitly specified, it will always be
			used regardless of whether "unnamed" is in 'clipboard'
			or not.  The clipboard register can always be
			explicitly accessed using the "* notation.  Also see
			|clipboard|.

      これを含むと、Vim は通常 unnamed レジスタに行くような yank, delete, change, put 操作に対して、
      クリップボードレジスタ '*' を使用する。
      レジスタが明示的に指定された場合、'clipboard' に unnamed が入っているかどうかに関わらず、
      常にそのレジスタが使用される。 
      クリップボードレジスタは、常に「*」表記で明示的にアクセスすることができる。

						                    clipboard-unnamedplus
	unnamedplus
      A variant of the "unnamed" flag which uses the
			clipboard register '+' (|quoteplus|) instead of
			register '*' for all yank, delete, change and put
			operations which would normally go to the unnamed
			register.  When "unnamed" is also included to the
			option, yank and delete operations (but not put)
			will additionally copy the text into register
			'*'. See |clipboard|.

      unnamed" フラグの亜種で、通常 unnamed レジスタに行くはずの yank, delete, change, put 操作すべてに対して、
      レジスタ '*' の代わりにクリップボードレジスタ '+' (|quoteplus|) を使用する。

      unnamed" がオプションに含まれている場合、
      yank と delete 操作 (put は不可) は、さらにテキストをレジスタ '+' にコピーする。
```
~~~

なんかもうヘルプまみれですが、ここで確認しておきたいのは`clipboard`のデフォルト値ですね。

これを見ると`""`となっているので、特に何も気にしないで、このように書いてしまって問題ないはずです😉

~~~admonish example title="options.lua"
```lua
vim.api.nvim_set_option('clipboard', 'unnamedplus')
```
~~~

もしヘルプに従った書き方にしたい場合は、以下のようになると思います。

```lua
vim.opt.clipboard:append 'unnamedplus'
```

~~~admonish info title=":h vim.opt:append()"
```
  Append a value to string-style options. See |:set+=|

  文字列スタイルのオプションに値を追加する。参照: |:set+=|
```
~~~

もしかしたら`API`を通して`追加`する方法があるのかもしれないんですが、ちょっとわたしが知らなくて...。

とりあえずこの書き方でも同じ動作が実現できるので、お好みで😆

```admonish success
全体のまとめに入っちゃうんですが、

こんな感じでオプションを一個一個確認していくと、デフォルトのままでいいなーって思うものがほとんどなので、
 (デフォルト設定は基本書かない) わたしが使っているグローバルオプションなんてこんなもんです。☺️

次でローカルオプションというものが出てきますが、それもやっぱりわたしが書いているものだけなら大した数じゃないです。

またさらにその先でプラグインとか使い出すと、もうちょっとだけ増えるんですが、それはまたその時に🤗
```
