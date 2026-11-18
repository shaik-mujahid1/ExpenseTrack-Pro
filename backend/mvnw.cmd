@echo off
setlocal
set SCRIPT_DIR=%~dp0
if not defined JAVA_HOME (
    if exist "C:\Program Files\Java\jdk-24" set JAVA_HOME=C:\Program Files\Java\jdk-24
)
call "%SCRIPT_DIR%.tools\apache-maven-3.9.9\bin\mvn.cmd" %*
endlocal
