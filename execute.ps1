$revision = git rev-parse HEAD
$buildDate = Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ'

docker build "--build-arg=REVISION=$revision" "--build-arg=BUILD_DATE=$buildDate" -t stans-app .
