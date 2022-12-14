# nvim-scrollbar

่ๅค๐ใฏ้่ฟใงใใใใฎๅใซในใฏใญใผใซใใผใ่ฟฝๅ ใใฆใฟใพใ๐

```admonish info title="[nvim-scrollbar](https://github.com/petertriho/nvim-scrollbar)"
Extensible Neovim Scrollbar

ๆกๅผตๅฏ่ฝใชNeovimในใฏใญใผใซใใผ
```

```admonish abstract title="Requirements"
Neovim >= 0.5.1

nvim-hlslens (optional)

gitsigns.nvim (optional)
```

`nvim-hlslens`ใ`gitsigns.nvim`ใใใจใฃใฆใ่ฆ่ฆใใใใใคใงใใญ๐

ไธกๆนใจใ`optional`ใจใใใใจใงใใใใใใฏใใฒ็ฉๆฅต็ใซๅใๅฅใใฆใใใพใใใโ

```admonish note
ใจใใใใๆๅใใๅใๅฅใใใคใใใง้ฒใใฆใใใงใใใฉใญ๐ธ
```

## Installation

ใใใฏใใๆฌๅฝใซ็ฐกๅใงใใ{{footnote:
ๅๆฒๅบๆใซใฏใ`onenord.nvim`ใไฝฟใฃใฆ่ฒใ่จญๅฎใใใจใใใ๏ผใใชใใฆๆธใใกใใใพใใใใ
ๆนใใฆ็ขบ่ชใใฆใฟใใๅจใๅฟ่ฆใใใพใใใงใใ...ใ
ไฝใ่จญๅฎใใชใใฆใ`onenord.nvim`ใฎๅใฏ็บๆฎใใใฆใใพใโใใใใณใใใใใชใใ๐ฟ
}}

~~~admonish example title="extensions/nvim-scrollbar.lua"
```lua
require('scrollbar').setup()

require('scrollbar.handlers.search').setup()
require("scrollbar.handlers.gitsigns").setup()
```
~~~

```admonish note
ใใ็ดฐใใ่จญๅฎใใใๅ ดๅใฏ
[config](https://github.com/petertriho/nvim-scrollbar#config) ใซใใ Defaults ใๅ็งใใใจ่ฏใใงใใ
```

ใใฎใณใผใใงใฏใ

```lua
require('scrollbar.handlers.search').setup() -- ใใใฏ nvim-hlslens
```

```lua
require("scrollbar.handlers.gitsigns").setup()
```

...ใงใใใใใใฎใใฉใฐใคใณใๅฟ่ฆใจใใพใใ`pakcer`ใซใๆใใจใใฆใใใพใใใ๐ซถ

~~~admonish example title="extensions/init.lua"
```lua
  use {
    'petertriho/nvim-scrollbar',
    config = function() require 'extensions.nvim-scrollbar' end,
    requires = {
      'kevinhwang91/nvim-hlslens', 'lewis6991/gitsigns.nvim',
    },
  }
```
~~~

ๅณๅดใซในใฏใญใผใซใใผใ็พใใพใใใญโ`nvim-hlslens`ใ`gitsigns`ใจใฎ้ฃๆบใใใใใชใงใ๐


|gitsigns|
|:---:|
|![scrollbar-gitsign](img/scrollbar-gitsigns.webp)|

|nvim-hlslens|
|:---:|
|![scrollbar-hlslens](img/scrollbar-hlslens.webp)|

ในใฏใชใผใณใทใงใใใงใฏๅฐใใใใใซใใใใ็ฅใใพใใใใๆค็ดขๆๅญๅใฎ่กใในใฏใญใผใซใใผไธใง่กจ็คบใใใใฆใพใ๐

## Wrap up

ใณใฃใใใใใใใ้ซ้ใงใใใญ๐ตโ๐ซ

ใใ ใใใใใใกใใฃใจๆฅใใงๆธใใใฎใงใใพใ่ฝใก็ใใใๅใใใผใใ้จๅใ่ฟฝ่จใชใไฟฎๆญฃใชใใใฆใใใพใใ

ใจใใใใใจใง...โ

```admonish success title="Assemble"
A very merry Christmasโ๐พ
```

```admonish success title=""
<div style="text-align: center">
<div style="font-size: 300%; line-height: 0;">

WAR

IS

OVER!
</div>
<div style="font-size: 90%; font-weight: bold" >
IF YOU WANT IT
</div>

(ๆฆไบใฏ็ตใใใใใชใใใใๆใใชใ)
</div>
```
