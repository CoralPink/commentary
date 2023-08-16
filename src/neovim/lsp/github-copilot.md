# (Extra) GitHub Copilot

浮かれていて完全に忘れていましたが、
`copilot.lua`を使用するためには`GitHub Copilot`への登録が必要です✈️

そして、これは`有料`のサブスクリプションサービスです。

30日間の無料体験が提供されますが、あらかじめ支払い情報を求められます🦧

(おそらく、クレジットカードもしくは PayPal アカウントのどちらか。)

```admonish tip
`13歳以上`の`学生`・`教職員`なら認証を受ければ`無料`で利用できるそうです。羨ましい❗
```

```admonish note
このページの内容は、
[GitHubの個人アカウント](https://docs.github.com/en/get-started/signing-up-for-github/signing-up-for-a-new-github-account)
の作成までは終わっていることを前提としています 🦦
```

## Quickstart

ちょっと長いので日本語訳だけ載せます。

```admonish info title="[Quickstart for GitHub Copilot](https://docs.github.com/en/copilot/quickstart)"
GitHub Copilotは、GitHub Copilot for Individualsで個人アカウント、
GitHub Copilot for Businessで組織アカウントで管理することができます。

GitHub Copilotは、認証された学生、教職員、人気のあるオープンソースプロジェクトのメンテナーであれば無料で利用できます。
学生、教師、人気のあるオープンソースプロジェクトのメンテナでない場合は、
1回限りの30日間トライアルでGitHub Copilotを無料で試すことができます。
無料トライアル後、継続して使用するには有料のサブスクリプションが必要です。
詳しくは、
[GitHub Copilotの課金について](https://docs.github.com/en/billing/managing-billing-for-github-copilot/about-billing-for-github-copilot)
をご覧ください。
```

### Apply to GitHub Global Campus as a student

```admonish info title="[Apply to GitHub Global Campus as a student](https://docs.github.com/en/education/explore-the-benefits-of-teaching-and-learning-with-github-education/github-global-campus-for-students/apply-to-github-global-campus-as-a-student)"
[Requirements](https://docs.github.com/en/education/explore-the-benefits-of-teaching-and-learning-with-github-education/github-global-campus-for-students/apply-to-github-global-campus-as-a-student#requirements)

GitHub Student Developer Packやその他の特典を含むGitHub Global Campusを利用するには、以下の条件があります：

- 高等学校、中等教育学校、大学、ホームスクール、または同様の教育機関など、学位または卒業証書を授与するコースに在籍していること
- 学校発行のEメールアドレスを持っていること、または現在の学生であることを証明する書類をアップロードしていること
- [GitHubの個人アカウント](https://docs.github.com/en/get-started/signing-up-for-github/signing-up-for-a-new-github-account)を持っていること
- 13歳以上であること

在学を証明する書類とは、在学日付が記載された学生証の写し、授業スケジュール、成績表、所属・在籍確認書などです。

在学中、定期的に在学状況の再確認を求められる場合があります。
```

```admonish tip
学校の許可は必要ありませんが、つまずいてしまったり、不安があるようなら`信頼できる`先生や大人に訊いてみよう❗
```

## Authentication

わたしのうっすい記憶と、とりあえず撮っておいたスクリーンショットで手順を示してみます。

取り上げてはみますが、あくまで雰囲気程度に汲んでください❗

...OK❓

じゃあ`copilot.lua`を起動しましょう😉

~~~admonish quote
```vim
:Takeoff
```
~~~

```admonish question
これ、うろ覚えなんですが...、真っ先にこんなのが現れてたんでしたっけ❓

![copilot-no-access](img/copilot-no-access.webp)

出てきた場合は`1`を入力すれば勝手にブラウザが開いて先に進め...た気がする❗
```

~~~admonish note
もし上記が現れない場合は以下のコマンドを実行します。

```vim
:Copilot auth
```

ポップアップが出てきました。

![copilot-onetime](img/copilot-onetime.webp)

ここからはブラウザ上での作業です。

指示通り、[https://github.com/login/device](https://github.com/login/device) からログインして、
`Neovim`上に表示されている`one-time code`を入力しましょう。

![copilot-activation](img/copilot-activation.webp)

問題なく通過できますよね😉

![copilot-congratulations](img/copilot-congratulations.webp)
~~~

### Get access to GitHub Copilot

`GitHub Copilot`への登録がまだ済んでいない場合は、ここから各種情報の入力に進みます。

![github-reg1](img/github-reg1.webp)

初めてだと、ここが一番困りますよね...。
Japan の Address ってどうやって表記するの...❓

![github-reg2](img/github-reg2.webp)

~~~admonish note
Web検索すると、例えばこんな例で説明されてたりします。

```txt
東京都庁
163-8001 東京都新宿区西新宿2丁目8-1
2-8-1 Nishishinjuku, Shinjuku-ku, 163-8001, Tokyo, Japan
```

わたしはこれを参考にしました😅
~~~

頑張って乗り越えて❗❗

### GitHub Copilot is now ready to pair!

そんなこんなありまして、なんとか辿り着きました❗

![copilot-ready-to-pair](img/copilot-ready-to-pair.webp)

そのほかのアプリケーションや、なんなら`Neovim`のガイドまでオフィシャルに用意してくれてるんですが、
そのまま自分の`Neovim`に戻りましょう 🐈

![copilot-authenticated](img/copilot-authenticated.webp)

```txt
Waiting, it might take a while and this popup will auto close once done

しばらくお待ちください。このポップアップは完了すると自動的に閉じます。
```

とのことなので、ちょっと待ってみましょう。(そんなに長くは掛からなかったはずです。)

完了したら、以下のコマンドを実行してみてください。

~~~admonish quote
```vim
:Copilot
```
~~~

![copilot-online](img/copilot-online.webp)

無事に`Online`と表示されましたね😆

```admonish warning
`copilot.lua`は、一部のファイルタイプ (例えば`Markdown`など) では起動しないようなデフォルト設定がされているので注意❗
```

## Wrap up

```admonish success
おめでとう❗ 登録完了です🎉

次のページでは、`copilot-cmp`を用いて、いよいよ`Neovim`上で`GitHub Copilot`を動かします👩‍✈️
```
