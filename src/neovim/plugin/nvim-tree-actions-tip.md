# Tips (vim.iter)

突然ですがニュースです。

ニュースとは言うものの最新ではないです❗最先端からは遅れてます😅

~~~admonish info title="news"
```txt
Notable changes in Nvim 0.10 from 0.9                                    *news*

For changes in Nvim 0.9, see |news-0.9|.

                                       Type |gO| to see the table of contents.
```
~~~

```admonish tip title=""
I once had a girl

Or should I say she once had me

僕にはかつて彼女がいた

いや 彼女には僕がいたと言うべきか {{footnote:
歌詞は、冒頭でほのめかされているように、Lennon が当時の妻 Cynthia に気付かれないように、他の女性と関係を持っていたことを表している。
}}
```

## Added Features

これちょっと面白いやつ。

~~~admonish info title=":h news-added"
```txt
ADDED FEATURES                                                     *news-added*

The following new APIs or features were added.

以下の新しいAPIや機能が追加されました。

• vim.iter() provides a generic iterator interface for tables and Lua
iterators luaref-in.

テーブルとLuaのための汎用イテレータインターフェースを提供する
```
~~~

```admonish tip title=""
She showed me her room

Isn’t it good Norwegian wood{{footnote:
Norwegian Wood (This Bird Has Flown) (by [The Beatles](https://en.wikipedia.org/wiki/The_Beatles)):
主に Lennon が作曲し、McCartney が作詞に参加した。
[Bob Dylan](https://en.wikipedia.org/wiki/Bob_Dylan)の内省的な歌詞に影響を受けたこの曲は、
ソングライターとしての Beatles の成長のマイルストーンと考えられている。
この曲には Harisson が演奏するシタールのパートがあり、洋楽ロックのレコーディングにインドの弦楽器が初めて登場した。
}}?

僕は彼女の部屋に招かれた

いいじゃない？ ノルウェーの木かな
```

### vim.iter()

書いてあることそのままなんですが、`Nvim 0.10`からはこんな書き方ができるようになります。

```admonish note
次項より使用しているサンプルコードは
[15.11.1 Actions](../plugin/nvim-tree-actions.html) 節で作成したものです。
```

```admonish tip title=""
She asked me to stay

And she told me to sit anywhere

彼女は 泊まっていって と言い

どこでも好きなところに座って と付け加えた
```

```admonish tip title=""
So I looked around

And I noticed there wasn't a chair

僕はあたりを見回したが

椅子なんてものは どこにもない
```

#### createTreeActions

~~~admonish quote title="Nvim 0.9"
```lua
local function createTreeActions()
  for _, cmd in pairs(command) do
    table.insert(menuCommand, { name = cmd[3], handler = cmd[2] })
  end
end
```
~~~

~~~admonish example title="Nvim 0.10"
```lua
local function createTreeActions()
  vim.iter(command):map(function(x)
    table.insert(menuCommand, { handler = x[2], name = x[3] })
  end)
end
```
~~~

誰もが「なんやこいつ😮」と思っていた`_`がいなくなりました。

```admonish tip title=""
I sat on the rug

Biding my time, drinking her wine

僕はラグの上に座り

ワインを飲みながら 時間をやり過ごした
```

```admonish tip title=""
We talked until two

And then she said, "It's time for bed"

二人で夜更けまで語り合うと

やがて 彼女は “もう寝る時間よ” と言った
```

#### on_attach

~~~admonish quote title="Nvim 0.9"
```lua
function M.on_attach(bufnr)
  local opts = function(desc)
    return { desc = 'nvim-tree: ' .. desc, buffer = bufnr, nowait = true }
  end

  for _, cmd in pairs(command) do
    if (string.len(cmd[1]) > 0) then
      vim.keymap.set('n', cmd[1], cmd[2], opts(cmd[3]))
    end
  end
end
```
~~~

~~~admonish example title="Nvim 0.10"
```lua
function M.on_attach(bufnr)
  local opts = function(desc)
    return { desc = 'nvim-tree: ' .. desc, buffer = bufnr, nowait = true }
  end

  vim
    .iter(command)
    :filter(function(x)
      return string.len(x[1]) > 0
    end)
    :map(function(x)
      vim.keymap.set('n', x[1], x[2], opts(x[3]))
    end)
end
```
~~~

上の例は`Stylua`に素直に従っているのですが、
わたしはこの改行位置に、若干のクセを感じざるを得ません❗

まあ、そこはお好みで😉

```admonish tip title=""
She told me she worked in the morning

And started to laugh

彼女は 朝から仕事なの と笑いながら言った
```

```admonish tip title=""
I told her I didn't

And crawled off to sleep in the bath

僕は違うよ と返したが

風呂場で這うようにして眠りにつく
```

## Wrap Up

```admonish tip title=""
And when I awoke I was alone

This bird has flown

目が覚めたら 僕は一人だった

小鳥は飛び去っていたんだ
```

効率面とか速度面で見た場合に優位性があるのかどうかは、
ぶっちゃけよく知らないんですが...。

```admonish success title="Assemble"
でも、なんかエレガント🩷👗
```

> So I lit a fire
>
> Isn’t it good Norwegian wood?
>
> だから僕は火をつけてやった
>
> いいじゃない？ ノルウェーの木だもんな{{footnote:
Paul McCartney は曲の最後の節についてコメントをしている。
「僕らの考えでは、あの男は何らかの復讐をしなければならなかった。
"暖を取るために火をつけた" という意味でもよかったし、"彼女の家の装飾は素晴らしかった" で終わっても良かった。
でもそうじゃなくて、復讐のためにその "クソみたいな場所" を燃やして、それをそのままにして楽器屋に行ったってことなんだ」
[Wikipedia](https://en.wikipedia.org/wiki/Norwegian_Wood_(This_Bird_Has_Flown))より
}}
