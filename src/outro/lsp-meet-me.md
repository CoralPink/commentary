# 🍑 LSP (Meet Me)

このサイトを見たな❗これでお前とも縁ができた❗

![search-console](img/search-console.webp)

個人でやってる趣味 (暇つぶしとも言う😅) にしては、なかなか身に余る光栄です。

```admonish danger title=""
やあ やあ やあ！

祭りだ 祭りだ！
```

舟を出せ❗いざ鬼退治❗❗

## ☕ Previously

ちょっとだけ むか〜し、むかしのおさらい。

~~~admonish example title="extensions/mason.lua"
```lua
require('mason').setup {
  ui = {
    check_outdated_packages_on_open = false,
    border = 'single',
  },
}

require('mason-lspconfig').setup()
```
~~~

固有の設定を必要としなければ、
これだけで`mason.nvim`でインストールした`LSP`は全てカバーできていましたね😆

~~~admonish tip
このサイトでは`packer`と外観の統一感を持たせる目的で`mason`に[border](../neovim/lsp/mason.html#border)を入れていました。

`lazy`を使う場合、これはもう無いほうが統一感が出ていいかも〜😪

```diff
require('mason').setup {
  ui = {
    check_outdated_packages_on_open = false,
-   border = 'single',
  },
}
```
~~~

```admonish danger title=""
袖振り合うも他生の縁！

躓く石も縁の端くれ！
```

## 🧠 Additional Setup

ここから一歩進めて、「固有の設定を入れてみよう」というのがこの節のおはなしです。

```admonish note title="脳人"
このページは 2025/05/08 に、以下の環境にあわせてサンプルコードを書き直しています。

> :h mason-lspconfig-requirements

* neovim >= 0.11.0
* mason.nvim >= 2.0.0
* nvim-lspconfig >= 2.0.0

諸々、細かいところまで把握しきれていないのは許して😘
```

```admonish danger title=""
共に踊れば繋がる縁！

この世は楽園！
```

## 🕶️ runtimepath

そういえば、あるところに`runtimepath`というものがおりました。

~~~admonish info title=":h runtimepath"
```txt
                                               'runtimepath' 'rtp' vimfiles
'runtimepath' 'rtp' string (default "$XDG_CONFIG_HOME/nvim,
                                     $XDG_CONFIG_DIRS[1]/nvim,
                                     $XDG_CONFIG_DIRS[2]/nvim,
                                     …
                                     $XDG_DATA_HOME/nvim[-data]/site,
                                     $XDG_DATA_DIRS[1]/nvim/site,
                                     $XDG_DATA_DIRS[2]/nvim/site,
                                     …
                                     $VIMRUNTIME,
                                     …
                                     $XDG_DATA_DIRS[2]/nvim/site/after,
                                     $XDG_DATA_DIRS[1]/nvim/site/after,
                                     $XDG_DATA_HOME/nvim[-data]/site/after,
                                     …
                                     $XDG_CONFIG_DIRS[2]/nvim/after,
                                     $XDG_CONFIG_DIRS[1]/nvim/after,
                                     $XDG_CONFIG_HOME/nvim/after")
                            global
    List of directories to be searched for these runtime files:
        filetype.lua	filetypes |new-filetype|
        autoload/	automatically loaded scripts |autoload-functions|
        colors/	color scheme files |:colorscheme|
        compiler/	compiler files |:compiler|
        doc/		documentation |write-local-help|
        ftplugin/	filetype plugins |write-filetype-plugin|
        indent/	indent scripts |indent-expression|
        keymap/	key mapping files |mbyte-keymap|
        lang/		menu translations |:menutrans|
        lsp/		LSP client configurations |lsp-config|
        lua/		|Lua| plugins
        menu.vim	GUI menus |menu.vim|
        pack/		packages |:packadd|
        parser/	|treesitter| syntax parsers
        plugin/	plugin scripts |write-plugin|
        queries/	|treesitter| queries
        rplugin/	|remote-plugin| scripts
        spell/	spell checking files |spell|
        syntax/	syntax files |mysyntaxfile|
        tutor/	tutorial files |:Tutor|

  And any other file searched for with the |:runtime| command.
```
~~~

大きなリストが どんぶらこ〜 どんぶらこ〜 と流れてきましたが、とりあえずここでの おはなし は
"プラグイン設定は`lua`に、LSPクライアント設定は`lsp`に行きました。" ということだけです👵

...いや、"行くべきです" と言うべきか👴

だからもし、こんな感じになってるとしたら...

```txt
.
├── init.lua
├── lazy-lock.json
├── lua
│   ├── extensions
│   │   ├── ...
│   ├── ...
│
└── snippets
    ├── ...
```

トップディレクトリ (`.config/nvim`) でこんなんしましょう🐱

```sh
mkdir lsp
```

そしたらこんなんなりますね🌳

```diff
 .
 ├── init.lua
 ├── lazy-lock.json
+├── lsp
 ├── lua
 │   ├── extensions
 │   │   ├── ...
 │   ├── ...
 │
 └── snippets
     ├── ...
```

この節で示すコードは、この`lsp`ディレクトリにファイルを新規で作成していきます。

~~~admonish note title="脳人"
先に示したほうがイメージがつくと思うので出しちゃいますが、最終的にはこんな形になります🌳🌳🌳

```diff
 .
 ├── init.lua
 ├── lazy-lock.json
+├── lsp
+│   ├── ccls.lua
+│   ├── lua_ls.lua
+│   ├── rust_analyzer.lua
+│   └── sourcekit.lua
 ├── lua
 │   ├── extensions
 │   │   ├── ...
 │   ├── ...
 │
 └── snippets
     ├── ...
```

当然ながら、これらを実際にインストールするかどうかはおまかせします😆
~~~

```admonish danger title=""
悩みなんざ吹っ飛ばせ！

笑え 笑え！
```

### 🐵 lua_ls (Lua)

```admonish note title=""
探してた この心うっきうき暴れさせて
```

```admonish info title="[lua-language-server](https://github.com/LuaLS/lua-language-server)"
The Lua language server provides various language features for Lua to make development easier and faster.
With nearly a million installs in Visual Studio Code, it is the most popular extension for Lua language support.

Lua 言語サーバーは、Lua の様々な言語機能を提供し、開発をより簡単かつ高速にします。
Visual Studio Code に 100万近くインストールされており、Lua 言語をサポートする最も人気のある拡張機能です。

[See our website for more info](https://luals.github.io).
```

100万とか言わないでください。1Kが霞むんで🤣

わたしはだいぶ長〜い間気づきませんでしたが、
`nvim-lspconfig`の[lua_ls](https://github.com/neovim/nvim-lspconfig/blob/master/doc/configs.md#lua_ls)を参考にして、
以下のようにしてみると...。

~~~admonish example title="lsp/lua_ls.lua"
```lua
vim.lsp.config('lua_ls', {
  on_init = function(client)
    if client.workspace_folders then
      local path = client.workspace_folders[1].name
      if
        path ~= vim.fn.stdpath('config')
        and (vim.uv.fs_stat(path .. '/.luarc.json') or vim.uv.fs_stat(path .. '/.luarc.jsonc'))
      then
        return
      end
    end

    client.config.settings.Lua = vim.tbl_deep_extend('force', client.config.settings.Lua, {
      runtime = {
        -- Tell the language server which version of Lua you're using (most
        -- likely LuaJIT in the case of Neovim)
        version = 'LuaJIT',
        -- Tell the language server how to find Lua modules same way as Neovim
        -- (see `:h lua-module-load`)
        path = {
          'lua/?.lua',
          'lua/?/init.lua',
        },
      },
      -- Make the server aware of Neovim runtime files
      workspace = {
        checkThirdParty = false,
        library = {
          vim.env.VIMRUNTIME
          -- Depending on the usage, you might want to add additional paths
          -- here.
          -- '${3rd}/luv/library'
          -- '${3rd}/busted/library'
        }
      }
    })
  end,
  settings = {
    Lua = {}
  }
})
```
~~~

こうすると`Neovim`固有のAPIが`lua_ls`を通して補完候補に現れます😉

![nvim-cmp-lua-ls](img/nvim-cmp-lua-ls.webp)

[fidget.nvim](../neovim/lsp/fidget.html#七--try)を使用しているのであれば、ここでもパワーが溜まってきただろう❗❗

![fidget-lua-ls](img/fidget-lua-ls.webp)

`Neovim`を使う場合はこれを置いておくと楽しいです🤗

### 🐶 rust-analyzer (Rust)

```admonish example title=""
冒険はいつだってワンだふる
```

```admonish info title="[rust-analyzer](https://github.com/rust-lang/rust-analyzer)"
rust-analyzer is a modular compiler frontend for the Rust language.
It is a part of a larger rls-2.0 effort to create excellent IDE support for Rust.

rust-analyzer は、Rust 言語用のモジュラー・コンパイラ・フロントエンドです。
Rust の優れた IDE サポートを作成するための、より大きな rls-2.0 の取り組みの一部です。
```

と、いうことで`Rust`にはこれがいいんじゃないかと思うんだけど、
どこを見て持ってきたのかが思い出せなくて見つからない...😑

~~~admonish example title="lsp/rust_analyzer.lua"
```lua
vim.lsp.config('rust_analyzer', {
  settings = {
    ['rust-analyzer'] = {
      diagnostic = { enable = false },
      assist = { importGranularity = 'module', importPrefix = 'self' },
      cargo = { allFeatures = true, loadOutDirsFromCheck = true },
      procMacro = { enable = true },
    },
  },
})
```
~~~

#### 🐦 Clippy

```admonish quote title=""
繋がってく縁と縁 出会いは少しトリッキー
```

```admonish info title="[Clippy](https://github.com/rust-lang/rust-clippy)"
A collection of lints to catch common mistakes and improve your [Rust](https://github.com/rust-lang/rust) code.

[There are over 700 lints included in this crate!](https://rust-lang.github.io/rust-clippy/master/index.html)

Lints are divided into categories, each with a default [lint level](https://doc.rust-lang.org/rustc/lints/levels.html).
You can choose how much Clippy is supposed to ~~annoy~~ help you by changing the lint level by category

よくあるミスを発見し、あなたの[Rust](https://github.com/rust-lang/rust)コードを改善するための lint のコレクションです。

[この crate には 700以上のリントが含まれています！](https://rust-lang.github.io/rust-clippy/master/index.html)

Lints はカテゴリに分かれており、
それぞれデフォルトの[lint level](https://doc.rust-lang.org/rustc/lints/levels.html) を持っています。
カテゴリごとに lint level を変更することで、Clippy がどの程度あなたを ~~迷惑~~ 手助けするかを選択できます。
```

これはちょっと確認してないんですが、
`Clippy`は`mason.nvim`からは入らないんじゃないかな❓

`Rust`の環境を入れると、たぶん自然にインストールされてるやつです。

~~~admonish example title="lsp/rust_analyzer.lua"
```diff
vim.lsp.config('rust_analyzer', {
  settings = {
    ['rust-analyzer'] = {
      diagnostic = { enable = false },
      assist = { importGranularity = 'module', importPrefix = 'self' },
      cargo = { allFeatures = true, loadOutDirsFromCheck = true },
      procMacro = { enable = true },
+     checkOnSave = { enable = true },
+     command = { 'clippy' },
    },
  },
})
```
~~~

![angry-clippy](img/angry-clippy.webp)

こんな感じで、`rustc`に混じって`clippy`も怒るようになります😱

## 👹 If mason is not available

```admonish warning title=""
打ち解けりゃ鬼も笑う
```

普段使っている言語によっては`mason.nvim`にない`LSP`を使用したいこともあると思うんですが、
まあ大抵はなんとかなります😗

さっき流れてきたリストの中に

```txt
plugin/	plugin scripts |write-plugin|
```

というものがありました。これを割って食べましょう🍑

同じ要領で、トップに`plugin`ディレクトリと、その中に`lsp-manual.lua`を作成します。

```diff
 .
 ├── init.lua
 ├── lazy-lock.json
 ├── lsp
 │   ├── ccls.lua
 │   ├── lua_ls.lua
 │   ├── rust_analyzer.lua
 │   └── sourcekit.lua
 ├── lua
 │   ├── extensions
 │   │   ├── ...
 │   ├── ...
 │
+├── plugin
+│   └── lsp-manual.lua
 └── snippets
     ├── ...
```

```admonish warning
既に`plugin`ディレクトリが存在している場合、中身はそのままにして`lsp-manual.lua`を作成すれば良いです。

(`lua`ファイルの方の名前はなんでも平気です 🌛)
```

~~~admonish example title="plugin/lsp-manual.lua"
```lua
local manual_lsp = {
  -- ここに オトモたち を追加していきます
}

vim.lsp.enable(manual_lsp)
```
~~~

こうしておくと、`lsp-manual.lua`が自動的に読み込まれて、`mason.nvim`管理下にいない`lsp`を有効化できます。

...と、いうことで 私が使っている (入っているだけとも言う😅) `lsp`を例にして おみこし は続きます 🐦‍🔥

### 🐲 SourceKit-LSP (Swift)

```admonish question title=""
見える景色がちょっとずつ違う
```

```admonish info title="[SourceKit-LSP](https://github.com/apple/sourcekit-lsp)"
SourceKit-LSP is an implementation of the [Language Server Protocol](https://microsoft.github.io/language-server-protocol/) (LSP)
for Swift and C-based languages. It provides features like code-completion and jump-to-definition to editors that support LSP.
SourceKit-LSP is built on top of [sourcekitd](https://github.com/apple/swift/tree/main/tools/SourceKit)
and [clangd](https://clang.llvm.org/extra/clangd.html) for high-fidelity language support,
and provides a powerful source code index as well as cross-language support.
SourceKit-LSP supports projects that use the Swift Package Manager.

SourceKit-LSP は、Swift と C ベースの言語のための [Language Server Protocol](https://microsoft.github.io/language-server-protocol/)(LSP) の実装です。
LSP をサポートするエディタにコード補完や定義へのジャンプなどの機能を提供します。
SourceKit-LSP は、[sourcekitd](https://github.com/apple/swift/tree/main/tools/SourceKit)と[clangd](https://clang.llvm.org/extra/clangd.html)の上に構築され、忠実度の高い言語サポートを実現し、
強力なソースコードインデックスとクロスランゲージのサポートを提供します。
SourceKit-LSP は Swift Package Manager を使用するプロジェクトをサポートします。
```

`macOS`で`Xcode`をインストールしている環境であれば、これも自然に入ってます。

~~~admonish example title="lsp/sourcekit.lua"
```lua
vim.lsp.config('sourcekit', {
  filetypes = { 'swift', 'objective-c', 'objective-cpp' },
})
```
~~~

~~~admonish example title="plugin/lsp-manual.lua"
```diff
 local manual_lsp = {
+  'sourcekit'
 }

vim.lsp.enable(manual_lsp)
```
~~~

![sourcekit-lsp](img/sourcekit-lsp.webp)

だいぶ古いスクリーンショットだからなんか妙に余裕ないけど許して (その一) 😅

### 🐯 ccls (C/C++)

```admonish warning title=""
みなさまのお手を拝借
```

```admonish info title="[ccls](https://github.com/MaskRay/ccls)"
ccls, which originates from [cquery](https://github.com/jacobdufault/cquery), is a C/C++/Objective-C language server.

ccls は[cquery](https://github.com/jacobdufault/cquery)に由来する、C/C++/Objective-C 言語サーバーです。
```

これは`brew`とか`apt`とか使えばお手軽にインストールできますね😉

~~~admonish example title="lsp/ccls.lua"
```lua
vim.lsp.config('ccls', {
  init_options = {
    compilationDatabaseDirectory = 'build',
    index = {
      threads = 0,
    },
    clang = {
      extraArgs = { '--std=c++20' },
      excludeArgs = { '-frounding-math' },
    },
  },
})
```
~~~

~~~admonish example title="plugin/lsp-manual.lua"
```diff
 local manual_lsp = {
+ 'ccls',
  'sourcekit'
}

 vim.lsp.enable(manual_lsp)
```
~~~

![ccls](img/ccls.webp)

だいぶ古いスクリーンショットだからなんか妙に余裕ないけど許して (その二) 😅

## 🦈 Root Directory

ちなみになんですが...。

毎度のことながら、なんかじょーずにいかないなーと思ったら`LspInfo`を確認してみましょう。

![root-directory](img/root-not-found.webp)

...もし`root directory`が`Not found.`(認識されていない状態) だと、
それは "履 い て な い" らしいんです、PAAAANTS!! 🤷‍♀️

![root-directory](img/root-directory.webp)

だいぶ古いスクリーンショットだからなんか妙に余裕ないけど許して(その三) 😅

## 🍑 Don't Boo! ドンブラザーズ

さて "立春 🌸" の前に "節分 🫘" です。色々仕切り直していきましょう❗

豆をまいて...、年の数だけ数えながら豆を食べて...。

そのあとはノーカウントで食べ放題だ😆

どこの家でもそうだろう❓😏

...違うの⁉️

```admonish success
So, let's get the party started!
```

```admonish danger title=""
じか〜い、じかい。
```

```admonish danger title=""
なに？ 王様戦xxxxングオージャーが最終回？？

だったら俺たちも最終回だ。MVP を決めてやる。
```

<div style="margin-top: 4rem"></div>
<div style="text-align: center; font-size: 400%; line-height: 0;">
🐵 🍑 🐦

🐶 🐲 👹
</div>

**さようなら、ドンブラザーズ{{footnote:
『暴太郎戦隊ドンブラザーズ』（あばたろうせんたいドンブラザーズ）は、2022年3月6日から2023年2月26日まで
テレビ朝日系列で放送された東映制作の特撮テレビドラマ、および作中で主人公たちが変身するヒーローの名称。
モチーフは日本を代表するおとぎ話の一つ・『桃太郎』であり、
同作品に登場する人物・動物をモデルにした桃井タロウと 4人の個性豊かなオトモたちが、
人々を守るため、そして自分の願いを叶えるために脳人やヒトツ鬼と戦う。
「暴太郎」という名称は、「アバター戦隊」か「桃太郎戦隊」かで悩んでいた企画陣に対し、
ある人物が両方をまとめて「暴太郎」にすればいいと意見を出して採用された。
[Wikipedia](https://ja.wikipedia.org/wiki/暴太郎戦隊ドンブラザーズ)より
}}
❗**

```admonish danger title=""
MVP とは、俺のことだ！！

17.7話 「フィナーレいさみあし
{{footnote: 実際は`nvim_get_option_value`の おはなしで、このサイトの最終回まではあと 3回...か、4回❗}}
」という おはなし。
```
