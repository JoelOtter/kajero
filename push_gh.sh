#/bin/sh

git push origin `git subtree split --prefix src pages`:gh-pages --force
