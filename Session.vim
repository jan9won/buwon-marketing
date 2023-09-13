let SessionLoad = 1
let s:so_save = &g:so | let s:siso_save = &g:siso | setg so=0 siso=0 | setl so=-1 siso=-1
let v:this_session=expand("<sfile>:p")
silent only
silent tabonly
cd ~/Projects/buwon-marketing
if expand('%') == '' && !&modified && line('$') <= 1 && getline(1) == ''
  let s:wipebuf = bufnr('%')
endif
let s:shortmess_save = &shortmess
if &shortmess =~ 'A'
  set shortmess=aoOA
else
  set shortmess=aoO
endif
badd +4 packages/mail-sender/src2/main.ts
badd +1 package.json
badd +4 packages/utils/index.ts
badd +2 packages/data/package.json
badd +2 packages/scraper-mfds/src/fetchers/listProduct.ts
badd +11 packages/mail-sender/src2/CSVMailCreator.test.ts
badd +10 packages/mail-sender/src2/NodeMailerNaverSMTP.test.ts
badd +1 packages/scraper-mfds/src/fetchers/listProductCategory.test.ts
badd +21 packages/utils/incrementalFileNaming.test.ts
badd +35 packages/utils/tsconfig.json
badd +79 tsconfig.json
badd +1 packages/mail-sender/src2/NodeMailerNaverSMTP.ts
badd +2 packages/mail-sender/package.json
badd +32 packages/utils/incrementalFileNaming.ts
badd +74 packages/mail-sender/src2/CSVMailCreator.ts
badd +45 packages/scraper-mfds/src/fetchers/listProductCategory.ts
badd +1 packages/target-scraper/src/mfds-importer/src/constants/index.ts
badd +20 packages/target-scraper/package.json
badd +30 packages/mail-sender/tsconfig.json
badd +30 packages/scraper-mfds/tsconfig.json
badd +2 packages/utils/package.json
badd +5 packages/mail-sender/source/mailing-list-0808.csv
badd +1 packages/target-scraper/src/mfds-importer/src/constants/uri.ts
badd +5 packages/target-scraper/src/mfds-importer/constants/productListColumn.ts
badd +33 packages/target-scraper/src/mfds-importer/constants/foodTypeCode.ts
badd +1 packages/mail-sender/source/mailing-list-0811.csv
badd +1006 node_modules/@types/node/http.d.ts
badd +982 node_modules/@types/node/stream.d.ts
badd +770 packages/target-scraper/src/mfds-importer/src/data_fetchers/listProductCategoryTestResponse.html
badd +898 packages/target-scraper/src/mfds-importer/test_data/listProductTestResponse.html
badd +1 packages/target-scraper/src/tradlinx-forwarder/src/main.ts
badd +1 packages/target-scraper/src/tradlinx-forwarder/src/constants.ts
badd +1 packages/target-scraper/src/mfds-importer/src/data_file_parsers/csv.ts
badd +1 packages/target-scraper/src/mfds-importer/src/data_file_parsers/json.ts
badd +1 packages/target-scraper/src/mfds-importer/src/data_file_parsers/xlsx.ts
badd +1 packages/results/index.ts
badd +12 packages/results/package.json
badd +1 packages/target-scraper/src/mfds-importer/constants/index.ts
badd +3 packages/target-scraper/src/tradlinx-forwarder/src/index.ts
badd +125 node_modules/node-html-parser/dist/nodes/html.d.ts
badd +6 packages/target-scraper/src/mfds-importer/constants/productCategoryListColumn.ts
badd +1 packages/target-scraper/src/mfds-importer/test_data/productCategoryListTestData.ts
badd +122 packages/target-scraper/src/mfds-importer/test_data/productListTestData.ts
badd +1 packages/target-scraper/src/mfds-importer/test_data/productListTestData
badd +1 packages/scraper-mfds/src/fetchers/listProduct.test.ts
badd +11 packages/data/scraper-mfds/source/productCategoryKeyword.csv
badd +1 packages/scraper-tradlinx/src/constants.ts
badd +1 packages/scraper-tradlinx/src/index.ts
badd +5 packages/scraper-mfds/jest.config.js
badd +2 packages/scraper-mfds/package.json
badd +2 packages/scraper-tradlinx/package.json
badd +1 packages/scraper-tradlinx/jest.config.js
badd +1 packages/data/index.ts
badd +39 packages/scraper-mfds/src/constants/foodTypeCode.ts
badd +1 packages/scraper-mfds/src/constants/index.ts
badd +6 packages/scraper-mfds/src/constants/productCategoryListColumn.ts
badd +5 packages/scraper-mfds/src/constants/productListColumn.ts
badd +1 packages/scraper-mfds/src/constants/uri.ts
argglobal
%argdel
edit packages/scraper-mfds/src/fetchers/listProduct.ts
let s:save_splitbelow = &splitbelow
let s:save_splitright = &splitright
set splitbelow splitright
wincmd _ | wincmd |
vsplit
1wincmd h
wincmd w
let &splitbelow = s:save_splitbelow
let &splitright = s:save_splitright
wincmd t
let s:save_winminheight = &winminheight
let s:save_winminwidth = &winminwidth
set winminheight=0
set winheight=1
set winminwidth=0
set winwidth=1
exe 'vert 1resize ' . ((&columns * 30 + 64) / 129)
exe 'vert 2resize ' . ((&columns * 98 + 64) / 129)
argglobal
enew
file NvimTree_1
setlocal fdm=manual
setlocal fde=0
setlocal fmr={{{,}}}
setlocal fdi=#
setlocal fdl=0
setlocal fml=1
setlocal fdn=20
setlocal nofen
lcd ~/Projects/buwon-marketing
wincmd w
argglobal
balt ~/Projects/buwon-marketing/packages/scraper-mfds/tsconfig.json
setlocal fdm=manual
setlocal fde=0
setlocal fmr={{{,}}}
setlocal fdi=#
setlocal fdl=0
setlocal fml=1
setlocal fdn=20
setlocal fen
silent! normal! zE
let &fdl = &fdl
let s:l = 4 - ((3 * winheight(0) + 18) / 36)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 4
normal! 0
lcd ~/Projects/buwon-marketing
wincmd w
2wincmd w
exe 'vert 1resize ' . ((&columns * 30 + 64) / 129)
exe 'vert 2resize ' . ((&columns * 98 + 64) / 129)
tabnext 1
if exists('s:wipebuf') && len(win_findbuf(s:wipebuf)) == 0 && getbufvar(s:wipebuf, '&buftype') isnot# 'terminal'
  silent exe 'bwipe ' . s:wipebuf
endif
unlet! s:wipebuf
set winheight=1 winwidth=20
let &shortmess = s:shortmess_save
let &winminheight = s:save_winminheight
let &winminwidth = s:save_winminwidth
let s:sx = expand("<sfile>:p:r")."x.vim"
if filereadable(s:sx)
  exe "source " . fnameescape(s:sx)
endif
let &g:so = s:so_save | let &g:siso = s:siso_save
doautoall SessionLoadPost
unlet SessionLoad
" vim: set ft=vim :
