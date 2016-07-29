#!/bin/bash

set -exv

PROJECT_PATH="$PWD"


PUBLISH_BRANCHES="master develop"
if [ "$TRAVIS_REPO_SLUG" == "realazthat/glsl-quad" ] && [ "$TRAVIS_PULL_REQUEST" == "false" ] && [[ $PUBLISH_BRANCHES =~ "$TRAVIS_BRANCH" ]]; then

  echo -e "Publishing generated static data...\n"


  cd $HOME
  
  rm -rf gh-pages
  git clone --quiet --branch=gh-pages https://${GH_TOKEN}@github.com/realazthat/glsl-quad gh-pages > /dev/null

  cd gh-pages
  touch .nojekyll
  
  git rm -rf --ignore-unmatch "./$TRAVIS_BRANCH/www"
  mkdir -p "./$TRAVIS_BRANCH/www"
  cp -Rf "$PROJECT_PATH/www/" "./$TRAVIS_BRANCH/www/"
  cp -Rf "$PROJECT_PATH/dist/" "./$TRAVIS_BRANCH/dist/"
  git add -f .
  git -c user.email="travis@travis-ci.org" -c user.name="travis-ci" \
        commit -m "Latest 'generated static data' on successful travis build $TRAVIS_BUILD_NUMBER auto-pushed to gh-pages/$TRAVIS_BRANCH"
  git push -fq origin gh-pages > /dev/null

  echo -e "Published generated static data to gh-pages.\n"
  
fi
