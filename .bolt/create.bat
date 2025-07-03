echo off
setlocal

:: Lista dos nomes de arquivos
set files=articles auth modal user filters rewards courses notifications messages settings sidebar support home profile global-modals article-card modal-confirm modal-article modal-context article-form article-list article-search article-filters

:: Loop para criar os arquivos com extensão .ts
for %%f in (%files%) do (
    echo. > %%f.ts
    echo Criado: %%f.ts
)

endlocal