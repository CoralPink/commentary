# Introduction

このサイトでは、わたしが普段使っている`WezTerm`と`Neovim`の設定例 (`dotfiles`) を紹介しています🤗

全ての設定を網羅しているわけではなく、あくまで自分で使っている設定に対してのコメントです。

もしこれが、見てくれた人のヒントになったり、何かの役に立ったりしたら嬉しいです😌

```admonish success title=""
![goal](goal.webp)

<div style="text-align: right;font-style: italic;" >
    Screenshot of wezterm on macOS, running Neovim and etc...
</div>
```

```admonish fail title=""
This site introduces `WezTerm` and `Neovim` `dotfiles` that I usually use.

But Japanese only for now. I want to make an English site too❗
```

```admonish note title="このサイトが想定している読者"
`WezTerm`セクションでは、目安として`Homebrew`などのパッケージマネージャーをコマンドで扱える程度を想定しています。
(ファイル操作から一歩踏み出せてるイメージ☺️)

ターミナルコマンドを使う場面は限られていますし、例示も全て行っているつもりではありますが、
コマンド操作を行ったことがないと、どうしても不安が残ります😓

その代わり、ファイルの編集自体は`Xcode`や`Visual Studio Code`などのGUIアプリケーションでも構いません。
これについては`3.Configuration`で示します。
```

```admonish note title=""
`Neovim`セクションでは、一転して`Neovim`自身でのファイル編集を前提としています。

全く初めてだと大変かもしれませんが、もし少しでも興味があったらチャレンジしてもらえると楽しめると思います☺️
```

## Operating Environment

わたしの使用する環境が`macOS`なので、説明やイメージも主にこれを使用しています。

```admonish warning
必要なソフトウェアと設定さえ整っていれば、どのOSでも通用するはずですが、
100%自信を持っているわけではありません。その点はご了承ください。
```

## Personal Thoughts on AI Applications

```admonish info title=""
このサイトは、基本的にわたし自身や多くの人の創作・制作で成り立っていますが、以下の2つの点でAIを活用しています。

- AI翻訳ツールを使っています。
- 場合によっては、AIが生成したプログラムコードを使用することがあります。

わたしはAIの進歩に肯定的です。単純に面白そうだし、日本語しか扱えないわたしにとって他言語への翻訳は欠かせなくなっています。

しかし、「AIと人間を並べて比較しようとする人」には反対です。

競争ではなく、共存こそ目指すべき形であると思います❗
```

```admonish info title=""
This site is essentially built on the creation and production of myself and many others, but uses AI in the following two respects.

- We use AI translation tools.
- In some cases, I use AI-generated program code.

I am positive about the progress of AI. It simply looks interesting, and translation into other languages is indispensable for me,
as I can only handle Japanese.

However, I am against "those who try to compare AI and humans side by side”.

I believe that coexistence, not competition, is the form we should be aiming for❗
```
