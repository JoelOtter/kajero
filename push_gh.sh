#/bin/sh

git push origin pages --force
git push origin `git subtree split --prefix src pages`:gh-pages --force
