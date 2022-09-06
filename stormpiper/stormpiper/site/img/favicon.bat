set file="%~f1"

SETLOCAL ENABLEDELAYEDEXPANSION
for %%x in (16, 24, 32, 40, 48, 64) do (
   echo %%x

   convert -background transparent %file% -resize %%xx%%x -trim %file%-tmp-%%x.png
)

convert %file%-tmp-*.png %file%.ico
del %file%-tmp-*.png
pause
