#!/usr/bin/env bash
set -e
set -o pipefail

echo "-----"

echo "Running unit tests and code coverage for cds"
exec 5>&1
output=$(ng test cds --watch=false --sourceMap --code-coverage --browsers=ChromeHeadless | tee /dev/fd/5)
coverage=$(echo $output | grep -i "does not meet global threshold" || true)
if [[ -n "$coverage" ]]; then
    echo "Error: Tests did not meet coverage expectations"
    exit 1
fi

echo "Running unit tests and code coverage for Spartacus core"
exec 5>&1
output=$(ng test core --watch=false --sourceMap --code-coverage --browsers=ChromeHeadless | tee /dev/fd/5)
coverage=$(echo $output | grep -i "does not meet global threshold" || true)
if [[ -n "$coverage" ]]; then
    echo "Error: Tests did not meet coverage expectations"
    exit 1
fi

echo "Running unit tests and code coverage for storefront library"
exec 5>&1
output=$(ng test storefrontlib --sourceMap --watch=false --code-coverage --browsers=ChromeHeadless | tee /dev/fd/5)
coverage=$(echo $output | grep -i "does not meet global threshold" || true)
if [[ -n "$coverage" ]]; then
    echo "Error: Tests did not meet coverage expectations"
    exit 1
fi

echo "Running unit tests for schematics"
cd projects/schematics
yarn
yarn test
cd ../..

if [[ $1 == '-h' ]]; then
    echo "Usage: $0 [sonar (to run sonar scan)]"
    exit 1
    elif [[ $1 == 'sonar' ]]; then

    echo "Running SonarCloud scan"
    sonar-scanner \
    -Dsonar.projectKey=sap_cloud-commerce-spartacus-storefront \
    -Dsonar.organization=sap \
    -Dsonar.host.url=https://sonarcloud.io \
    -Dsonar.login=$SONAR_TOKEN
fi

