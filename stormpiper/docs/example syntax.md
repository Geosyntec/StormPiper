> **Note**
> This is a note

> **Warning**
> This is a warning


# exports
```
pandoc -N --variable "geometry=margin=1.2in" --variable mainfont="Helvetica" --variable sansfont="Helvetica" --variable monofont="Helvetica" --variable fontsize=12pt --variable version=2.0 1_Introduction.md  --pdf-engine=xelatex --toc -o example.pdf
```

```
pandoc 1_Introduction.md -o example.pdf --from markdown --template eisvogel --pdf-engine=xelatex
```

```
pandoc -N --variable "geometry=margin=1.2in" --variable mainfont="Helvetica" --variable sansfont="Helvetica" --variable monofont="Helvetica" --variable fontsize=12pt --variable version=2.0 0_Title_page.docx  --pdf-engine=xelatex --toc -o TitlePage.pdf
```
```
pandoc 1_Introduction.md -o example.pdf --template eisvogel --number-sections --toc
```

Test table captions:
```
pandoc 1_Introduction.md -o example.pdf --template eisvogel --number-sections --toc -f +table_captions
```
pandoc -s 2_System_Administration.md  -o table.pdf --template eisvogel


Test all chapters
```
pandoc 1_Introduction.md 2_System_Administration.md 3_Map_Explorer.md 4_Results_Viewer.md -o example.pdf --template eisvogel --number-sections --toc
```

```
pandoc 1_Introduction.md 2_System_Administration.md 3_Map_Explorer.md 4_Results_Viewer.md -o example.html  --toc --template=bootstrap_menu.html --metadata title="Users Manual"
```

pandoc 1_Introduction.md 2_System_Administration.md 3_Map_Explorer.md  -o example.html  --toc --template=GitHub_style.html5 --metadata title="Users Manual"
