
# Use pandoc to render docs


**PDF:**
```
pandoc -N \
--top-level-division=chapter \
--toc \
--pdf-engine=xelatex \
--filter pandoc-crossref \
--variable "geometry=margin=1.2in" \
--variable mainfont="Open Sans" \
--variable sansfont="Open Sans" \
--variable monofont="Monaco" \
--variable fontsize=12pt \
--variable version=2.0 \
md/*.md \
-o pdf/Tacoma_Users_Manual.pdf

```

**PDF with a template:** 
```
pandoc \
--top-level-division=chapter \
--toc \
--pdf-engine=xelatex \
--filter pandoc-crossref \
--template eisvogel \
--number-sections \
md/*.md \
-o pdf/Tacoma_Users_Manual.pdf 


```

**HTML with template:** 
````
pandoc \
--template=GitHub_style.html5 \
--toc \
--top-level-division=chapter \
--number-sections \
--filter pandoc-crossref \
md/*.md* \
-o html/Tacoma_Users_Manual.html


````

**docx:**
````
pandoc \
--pdf-engine=xelatex \
--toc \
--number-sections \
--top-level-division=chapter \
--filter pandoc-crossref \
--reference-doc geo_report.docx \
md/*.md \
-o docx/example.docx
````