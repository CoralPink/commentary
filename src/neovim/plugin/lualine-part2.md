# lualine.nvim Part â¡

```admonish success title=""
<div style="font-size: 500%; text-align: right;">
ð
</div>
<div style="text-align: center;">
<div style="font-size: 280%;">
A Happy New Year!!
</div>

<div style="margin: 30px auto;">
2023å¹´ãã¬ãã£ã¨ã¯ãã¾ãã¾ããã

ä»å¹´ãããããã­ð¤
</div>
</div>
```

ãã®ã¾ã¾æªæ¥ã«çªãé²ãã§ããã®ãè¯ããã§ãããã¡ãã£ã¨å¿æ®ããããã¾ããã

ãã¡ãã`lualine.nvim`ã§ãã

2023å¹´æ©ãããããªãéå»ã«æ»ã£ã¦ãã¾ãã¾ããã`lualine.nvim`ã®ã«ã¹ã¿ãã¤ãºããåãã¾ãâ

...ã¾ãããã£ãæ°é±éãªãã§ããã©ã­ð®
ãã®ç¨åº¦ãªã "æé 88 ãã¤ã«" ã "1.21 ã¸ã´ã¯ãã"{{footnote:
[Back to the Future](https://ja.wikipedia.org/wiki/ããã¯ã»ãã¥ã»ã¶ã»ãã¥ã¼ãã£ã¼) ã®ä¸çã§ãã­ã
âgigawattâï¼ã®ã¬ã¯ããï¼ãèª¤ã£ã¦âjigowattâï¼ã¸ã´ã¯ããï¼ã¨æ¸ããèæ¬ããã®ã¾ã¾æ¡ç¨ããããã ã£ã¦ã (ã©ãããèª¤ãæ¹âð)
[wikipedia](https://ja.wikipedia.org/wiki/ãã­ãªã¢ã³_(ã¿ã¤ã ãã·ã³)#cite_note-jigowatt-2)ããã
}}ãå¿è¦ãªãã§ãããã

```admonish note
ããã§ããã©ã¦ã¶ã®è¡¨ç¤ºå¹ã 750px ããã¨ããã§ãã

ãããããã¨`Nerd Fonts`ã«å¯¾å¿ãããã©ã³ãã»ãã
{{footnote:[ãã­ã°ã©ãã³ã°ãã©ã³ã ç½æº (ã¯ãããï¼HackGen)](https://github.com/yuru7/HackGen)ããâ}}
ãä½¿ç¨ãããããã«ä»çµãã§ãããã§ããå®ã¯â

`lualine.nvim`ã«é¢ãããµã³ãã«ã³ã¼ãã«ã¯`Nerd Fonts`ããã¤ãããå¤ãã«å¥ã£ã¦ãã®ã§ã
PCãªããã©ã¦ã¶ã®ã¦ã£ã³ãã¦ãæ¨ªã«åºãã¦ã¿ãããã¿ãã¬ãããªãæ¨ªè¡¨ç¤ºã«ãã¦ã¿ãããããã£ããè©¦ãã¦ã¿ã¦ã­âºï¸

ã¡ããã¨ç¶ºéºã«ã³ã¼ããè¦ããããð
```

æ¹ãã¦æè¨ãããã§ããããã®ãµã¤ãã«è¨è¼ããã¦ããã«ã¹ã¿ãã¤ãºã¯ "å®å¨ã«" ãããã®å¥½ã¿ã§ä½ã£ã¦ãããã
ããã¾ã§ããããã«å¯¾ãã¦ã³ã¡ã³ããã¦ããã£ã¦ã ããªã®ã§ããæ±²ã¿åãããã®ããã£ããçµã¿è¾¼ãã§ããããã°ãããããã®æãã§ãã

...ã¨ãè¨ããã¨ã§â

ãããã
[ãã®ã·ã¼ã³](https://coralpink.github.io/commentary/neovim/plugin/lualine.html#to-be-continued)ã¾ã§æ»ã£ã¦ããã¾ã...ã

~~~admonish tip title=""
ããããããããã

ãã¿ã®ããã®ãããã®ãã¤ã¥ãã â
~~~

~~~admonish tip title=""
ããã¨ãã¼ãããã¨â

ï½ï½ï½ï½ã®ããããã¸â
~~~

~~~admonish tip title=""
ã¬ãããã´ã¼â
~~~

~~~admonish quote title=""
...ã...ã...ã...
~~~

~~~admonish note title=""
Hey, CaP..., you read me...?

(ã­ã£ãã...ãèãããã...?)
~~~

~~~admonish note title=""
...It's nvim Trainer. Can you hear me...?

(...nvimãã¬ã¼ãã¼ã ãèãããã...?)
~~~

...â

```admonish fail title=""
I'm back. ...I'm back from the future!!

(ãããã¯æ»ã£ã¦ãããã ã...æªæ¥ããæ»ã£ã¦ãããã !!)
```

~~~admonish note title=""
On your next.

(æ¬¡ãè¦ã¦ã¿ãã)
~~~

## options

ãããããæ¬çªã§ããé å¼µã£ã¦ããã¾ãããâ

ã¾ãã¯ãã¼ã¹ã¨ãªãè¨­å®ã2ã¤ã

### separators

~~~admonish info title=":h lualine"
```
SEPARATORS

lualine defines two kinds of separators:

lualine ã¯2ç¨®é¡ã®ã»ãã¬ã¼ã¿ãå®ç¾©ãã¦ãã¾ãã

- `section_separators`   - separators between sections
                           ã»ã¯ã·ã§ã³éã®ã»ãã¬ã¼ã¿ã

- `component_separators` - separators between the different components in sections
                           ã»ã¯ã·ã§ã³åã®ç°ãªãã³ã³ãã¼ãã³ããåºåãã»ãã¬ã¼ã¿
```

```lua
  options = {
    section_separators = { left = 'î´', right = 'î¶' },
    component_separators = { left = 'îµ', right = 'î·' }
  }
```

```
Here, left refers to the left-most sections (a, b, c), and right refers to the
right-most sections (x, y, z).

ããã§ãleft ã¯å·¦ç«¯ã®ã»ã¯ã·ã§ã³(a, b, c)ããright ã¯å³ç«¯ã®ã»ã¯ã·ã§ã³(x, y, z)ãæå³ãã¾ãã
```
~~~

ã¾ãç´°ãããã¨ã¯å¾ã«ãã¾ããããããã¯ããä¾ç¤ºããã¦ããéãã«ãã£ã¡ããã¾ãð

```admonish note
ã¡ãªã¿ã«ããã©ã«ãå¤ã¯ `î°` ã¨ãã `î±` ã¨ã ãªã®ã§ããã£ã¡ã®æ¹ãå¥½ããªå ´åã¯ã¹ã­ãããã¡ãã£ã¦ãã ããã
```

~~~admonish example title="extensions/lualine.lua"
```lua
require('lualine').setup {
  options = {
    section_separators = { left = 'î´', right = 'î¶' },
    component_separators = { left = 'îµ', right = 'î·' },
  },
}
```
~~~

### globalstatus

~~~admonish info title=":h lualine"
```
globalstatus = false,       -- enable global statusline (have a single statusline
                            -- at bottom of neovim instead of one for  every window).
                            -- This feature is only available in neovim 0.7 and higher.

                            ã°ã­ã¼ãã«ã¹ãã¼ã¿ã¹ã©ã¤ã³ãæå¹ã«ãã
                            (åã¦ã£ã³ãã¦ã«1ã¤ã§ã¯ãªããneovim ã®ä¸é¨ã«1ã¤ã®ã¹ãã¼ã¿ã¹ã©ã¤ã³ãè¡¨ç¤ºãã)ã
                            ãã®æ©è½ã¯ãneovim 0.7ä»¥éã§å©ç¨å¯è½ã§ãã
```
~~~

ããã¯ããã©ã«ãã§ç¡å¹ã«ãªã£ã¦ããã®ã§æå¹åãã¾ãããã
`options`ã®ä¸­ã«è¿½è¨ãã¦ãã ããã

~~~admonish example title="extensions/lualine.lua"
```lua
--options = {
    globalstatus = true,
--},
```
~~~

## Check: options

ããã¾ã§ã§ä»¥ä¸ã®ããã«è¦ãç®ã®å¤åãããã¯ãã§ãã

|before|
|:---:|
|![lualine-options-before](img/lualine-options-before.webp)|
|after|
|![lualine-options-before](img/lualine-options-after.webp)|

`separators`ãå¤ãããã¨ã«ãã£ã¦ãã¹ãã¼ã¿ã¹ã©ã¤ã³ãããããããªå°è±¡ã«ãªãã¾ããã­ã

ã¾ãã`global statusline`ã«ãã£ã¦ã¦ã£ã³ãã¦ãåå²ãã¦ãã¹ãã¼ã¿ã¹ã©ã¤ã³ã¯å¸¸ã«ä¸ã¤ã ããè¡¨ç¤ºãããããã«ãªãã¾ããã
ãªãã ãç¡çããæ¼ãè¾¼ã¾ãããããªçª®å±ãªè¡¨ç¤ºãè§£æ¶ããã¦ãã¦ãã¨ã£ã¦ãããæãã§ãã­ð


## Sections

ãã¦ã`separators`é ã§åºã¦ããããã

```
Here, left refers to the left-most sections (a, b, c), and right refers to the
right-most sections (x, y, z).
```

~~~admonish info title=":h lualine-usage-and-customization"
```
Lualine has sections as shown below.
Lualineã«ã¯ä»¥ä¸ã®ãããªã»ã¯ã·ã§ã³ãããã¾ãã

    +-------------------------------------------------+
    | A | B | C                             X | Y | Z |
    +-------------------------------------------------+

Each sections holds its components e.g.Â Vimâs current mode.
åã»ã¯ã·ã§ã³ã¯ãä¾ãã° Vim ã®ç¾å¨ã®ã¢ã¼ãã®ãããªæ§æè¦ç´ ãä¿æãã¾ãã
```
~~~

ããããããã§ãã­ð
ãã®6ã¤ã®ã»ã¯ã·ã§ã³ã`section_separator`ã§åºåãããã¾ãã

ã²ã¨ã¤ã®ã»ã¯ã·ã§ã³ã®ä¸­ã«2ã¤ä»¥ä¸ã®æ©è½ãå¥ãã¦è¡¨ç¤ºãããã¨ãã§ãã¾ãã
ãã®å ´åã¯`component_separators`ã§æ´ã«åºåãããã¾ãã

## statusline

ããããã¨ãããããã£ã¦ã¿ã¾ãããããããã¯ãããªããã¦ã¾ãð

~~~admonish example title="extensions/lualine.lua"
```lua
-- onenord.nvim ã®ã«ã©ã¼ãã¬ãããåå¾ãã
local colors = require('onenord.colors').load()

require('lualine').setup {
--options = {
--  (çç¥...)
--},

  -- options ã¨ååã«ä¸¦ã¹ã¦ãã ããã
  sections = {
    lualine_a = {
      'mode',
    },
    lualine_b = {
      {
        'filename',
        newfile_status = true,
        path = 1,
        shorting_target = 24,
        symbols = { modified = ' _ï', readonly = ' ï', newfile = 'ï' },
      },
    },
    lualine_c = {},

    lualine_x = {
      'encoding',
    },
    lualine_y = {
      { 'filetype', color = { fg = colors.fg } },
    },

    lualine_z = {
      { 'fileformat', icons_enabled = true, separator = { left = 'î¶', right = 'î´' } },
    },
  },
}
```
~~~

```admonish tip
ããã®éµã¨ãç«ã¨ãã©ã£ããæ¾ã£ã¦ããã­ãâãã£ã¦æããããããããªããã§ããããããã®å ´åã¯`Font Book`ããã

ãããªãã¨ãªããã§æ¾ã£ã¦ãã¡ããã¾ãðº

|||
|:---:|:---:|
|![fontbook1](img/fontbook1.webp)|![fontbook2](img/fontbook2.webp)|
```

![meow-meow](img/meow-meow.webp)

ããããããð¥°

## Components

ãªãã¨ãªãå¯ããã¤ããã¨æãã¾ããã`lualine_a`ãã»ã¯ã·ã§ã³`A`ã«å¯¾å¿ãã¦ãã¾ãã
`B`, `C` ã¨ `X`, `Y`, `Z` ãåæ§ã§ãã

ã§ãããããã®ã»ã¯ã·ã§ã³ã®æåã«ããæå­åãæ©è½(ã³ã³ãã¼ãã³ã)ãæå®ãã¦ãã¾ãã

åºæ¬æ©è½ã®ä¸è¦§ã¯æ¬¡ã®éãã

```admonish info title=":h lualine-Available-components"
- `branch` (git branch)
- `buffers` (shows currently available buffers)
- `diagnostics` (diagnostics count from your preferred source)
- `diff` (git diff status)
- `encoding` (file encoding)
- `fileformat` (file format)
- `filename`
- `filesize`
- `filetype`
- `hostname`
- `location` (location in file in line:column format)
- `mode` (vim mode)
- `progress` (%progress in file)
- `searchcount` (number of search matches when hlsearch is active)
- `tabs` (shows currently available tabs)
- `windows` (shows currently available windows)
```

ä»¥ä¸ã«ã¤ãã¦ã¯ãããããè©³ç´°ãç¤ºããã¦ãã¾ãã

```admonish info title=":h lualine-***-component-options"
- `filename` :h lualine-filename-component-options
- `filetype` :h lualine-filetype-component-options
- `fileformat` :h lualine-fileformat-component-options
```

`lualine_y`ã®`colors`ã¨ãã`lualine_z`ã®`separator`ã¨ãã¯ããããããããã®è¶£å³ã§ãã
ããã»ãã¨ã«è¦ãç®ã ãâ

![lualine-sections](img/lualine-sections.webp)

ããããããªæãã§ãã­ð

```admonish note
`lualine_c`ã«ã¯ãããå°ãåã§ç»å ´ããäºå®ã®`LSP`{{footnote:
[Language Server Protocol](https://microsoft.github.io/language-server-protocol/)ã®ç¥ã
Microsoftãéçºãããã®ããªã¼ãã³ã¹ã¿ã³ãã¼ãã«ãªã£ã¦ããããã
ãã®è¾ºã¯[wikipedia](https://en.wikipedia.org/wiki/Language_Server_Protocol)ã§â}}
é¢é£ã®æå ±ãè¡¨ç¤ºãããã¨æã£ã¦ã¾ãã

ã¤ã¡ã¼ã¸ã¨ãã¦ã¯[ããããã¼ã¸](https://coralpink.github.io/commentary/index.html)ã®ããã«ãªãã®ã§ã
ã¾ã è¦ã¬ä»²éã®ç»å ´ãæ¥½ãã¿ã«ãã¦ããã¾ãããâºï¸
```

## To Be Concluded...

```admonish success title="Assemble"
`lualine.nvim`ã¯...â ãªãã¨...â

ã¾ã ç¶ãã¾ãð®

ãã£ã±ãããã¯ããªã¥ã¼ã ãããã¾ãã...ã
ã§ãåºåãã¨ãã¦ã¯ã¨ã¦ãèªç¶ã ã¨æãã®ã§ããã£ã±ãæãåã£ã¦ããä¸åã ãè·¨ãã¾ãð

æ¬¡åã`lualine.nvim` Partâ¢  ã«ç¶ããç¶ãã£ããç¶ã...ððð
```
