$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $env:JAVA_HOME) {
    if (Test-Path "C:\Program Files\Java\jdk-24") {
        $env:JAVA_HOME = "C:\Program Files\Java\jdk-24"
    }
}
$mvnCmd = Join-Path $scriptDir ".tools\apache-maven-3.9.9\bin\mvn.cmd"
& $mvnCmd $args
