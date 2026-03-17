# Function

この章では`function`について、書き連ねていきます😉

`Lua`の話題の趣が強くなっていますが、この辺りの内容が少しでも分かっているとプラグインの導入もスムーズになるはずです。

乗り越えていってください❗

<video preload="none" width="1280" height="720" data-poster="img/kawaguchiko-hanabi-thumbnail.webp">
  <source src="img/kawaguchiko-hanabi.webm" type="video/webm">
  Your browser does not support the video/webm.
</video>

...内容とは全然関係ないんだけど、花火打ち上がってたんで載っけときます🎆

ただの気まぐれです⭐

```admonish success
これはまだ前哨戦。Civil War です❗
```

<div style="margin-top: 16em"></div>

## 💍 Loreley

<div style="color: #999999; font-size: 90%;">

```admonish quote title=""
Jeder wollt sie zur Frau

Doch ihr Herz war nicht mehr frei

Denn sie hat nur einen geliebt

誰もが彼女を妻にと望んだ

しかし 彼女の心はもう誰のものにもならない

彼女は ただ一人を愛していたから
```

```admonish quote title=""
Doch der zog in den Krieg

Und er kehrte nicht mehr Heim

Es gab nichts mehr was ihr noch blieb

しかし その人は出征に就いた

そして二度と 帰ってはこなかった

彼女には もう何も残されていない
```

```admonish note title=""
Und sie saß auf einem Felsen überm Tal

Wo der Rhein am tiefsten war

君は谷を見下ろす岩の上に座り込んでいたんだ

そこはライン川が最も深くなる場所
```

```admonish quote title=""
Und dort sang sie ihr Lied

Und wer hörte, wie sie sang

Der vergaß dabei die Gefahr

彼女は唄った

その歌を耳にした者は

目の前の危険でさえ 忘れてしまう
```

<div style="text-align: center">
<div style="margin-top: 4em">
Loreley{{footnote: Loreley (by [Dschinghis Khan](https://de.wikipedia.org/wiki/Dschinghis_Khan)):
Dshinghis Khan が発表した3枚目のアルバム[Wir sitzen alle im selben Boot](https://en.wikipedia.org/wiki/Wir_sitzen_alle_im_selben_Boot)
("我々は皆同じ船に乗っている") に収録された楽曲。
}} ley ley

Unter dir da fließt der Rhein
</div>

<div style="margin-top: 2em">
Loreley の眼下には ライン川が流れる
</div>

<div style="margin-top: 4em">
Wie ein blaues Band

Durch das weite schöne Land
</div>

<div style="margin-top: 2em">
広く美しい大地を

青いリボンのように
</div>

<div style="margin-top: 4em">
Loreley ley ley

Du sitzt dort im Sonnenschein

Und du kämmst dein goldenes Haar
</div>

<div style="margin-top: 2em">
Loreley は陽だまりの中で

金色の髪を梳く
</div>

<div style="margin-top: 4em">
Loreley ley ley

Schiffe zieh'n an dir vorbei
</div>

<div style="margin-top: 2em">
舟は傍を通り過ぎる
</div>

<div style="margin-top: 4em">
Und wer dich dort sieht

Wird verzaubert durch dein Lied
</div>

<div style="margin-top: 2em">
Loreley を見た者は

皆その歌に魅せられる
</div>

<div style="margin-top: 4em">
Loreley ley ley

Viele kehrten nicht mehr Heim

Aber lang lang lang ist's her
</div>

<div style="margin-top: 2em">
多くの者が家路に着くことはなかった

だがそれは 遙か遙かの昔話
</div>
</div>

<div style="margin-top: 4em"></div>

```admonish quote title=""
Und ihr Lied klang so süß wie ein längst vergess'ner Traum

Schon von weitem hörte man sie

その歌は とても甘く響く

まるで 遠い昔に忘れ去られた夢のように

遠く離れようとも 彼女の歌声は聴こえた
```

```admonish quote title=""
Und die fischer im Boot fuhr'n vorbei

Im Morgengraun und ihr Bild vergaßen sie nie

漁師たちは 夜明け前に舟で通り過ぎた

しかし 彼女の姿を忘れることができなかった
```

```admonish note title=""
Und so manches Boot zerbrach am schroffen Stein

Weil die Männer sie nur sah'n

多くの舟が 険しい岩に砕け散る

男たちはたった一目 君に魅せられただけだったのに
```

```admonish quote title=""
Doch sie schaute bloß weg, wenn der Strudel sie verschlang

渦が漁師を飲み込もうとも、彼女はただ目を逸らすだけだった
```

```admonish danger title=""
Ihr hat keiner leid getan

もう 誰を哀れむこともない
```

<div style="text-align: center">
<div style="margin-top: 4em">
Loreley ley ley

Unter dir da fließt der Rhein
</div>

<div style="margin-top: 4em">
Wie ein blaues Band

Durch das weite schöne Land
</div>

<div style="margin-top: 4em">
Loreley ley ley

Du sitzt dort im Sonnenschein

Und du kämmst dein goldenes Haar
</div>

<div style="margin-top: 4em">
Loreley ley ley

Schiffe zieh'n an dir vorbei

</div>

<div style="margin-top: 4em">
Und wer dich dort sieht

Wird verzaubert durch dein Lied
</div>

<div style="margin-top: 4em">
Loreley ley ley

Viele kehrten nicht mehr Heim

Aber lang lang lang ist's her
</div>
</div>

<div style="margin-top: 4em"></div>

```admonish quote title=""
Und ein Prinz hörte auch von der schönen Loreley

Und er schwor sich, sie wird bald mein

ある王子もまた 美しき Loreley の噂を耳にした

そして誓った、すぐに彼女を自分のものにして見せる
```

```admonish quote title=""
Und so fuhren sie los auf dem alten vater Rhein

王子達は 古き父なるライン川へと船出した
```

```admonish danger title=""
Doch sie tranken viel zu viel Wein!

だが 彼らは吞みすぎたんだ!
```

<div style="text-align: center">
<div style="margin-top: 4em">
Wein, wein, wein, wein

Auf die Loreley
</div>

<div style="margin-top: 2em">
飲め、飲め、飲め、飲め

Loreley のために
</div>

<div style="margin-top: 4em">
Wer glaubt an Zauberei
</div>

<div style="margin-top: 2em">
魔力など 信じるものか
</div>

<div style="margin-top: 4em">
Wein, wein, wein, wein

Schenkt noch mal ein
</div>

<div style="margin-top: 2em">
泣け、泣け、泣け、泣け

もっと掬え
</div>

<div style="margin-top: 4em">
Gott möge uns verzeih'n
</div>

<div style="margin-top: 2em">
神よ 我らを赦し 救い賜え
</div>

<div style="margin-top: 4em"></div>
</div>

```admonish quote title=""
Und sie sang noch ihr Lied, und sie kämmte noch ihr Haar

Als das Boot schon versunken war

船が沈んだあとも 彼女は唄い続ける

金色の髪を梳きながら
```

<div style="text-align: center">
<div style="margin-top: 4em">
Loreley ley ley

Unter dir da fließt der Rhein
</div>

<div style="margin-top: 4em">
Wie ein blaues Band

Durch das weite schöne Land
</div>

<div style="margin-top: 4em">
Loreley ley ley

Dort du sitzt im Sonnenschein

Kämmst du dein goldenes Haar
</div>

<div style="margin-top: 4em">
Loreley ley ley

Schiffe zieh'n an dir vorbei
</div>

</div>
</div>

<div style="text-align: center; font-size: 90%">
<div style="margin-top: 4em">
Und man hört noch heut

Den Gesang aus alter Zeit
</div>

<div style="margin-top: 2em">
そして今もなお 人々は耳にする

遙か昔の歌声を
</div>

<div style="margin-top: 4em">
Loreley ley ley

Doch man sieht dich heut nicht mehr

Auf den steilen Felsen
</div>

<div style="margin-top: 2em">
しかし今はもう その険しい岩の上に

Loreley の姿はない
</div>

<div style="margin-top: 4em">
Loreley ley ley...
</div>
</div>

<div style="margin-top: 4em"></div>

<div style="font-size: 84%">

> Unter dir da fließt der Rhein
>
> Wie ein blaues Band
>
> Durch das weite schöne Land

</div>

<div style="margin-top: 4em"></div>
