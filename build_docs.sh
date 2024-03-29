#!/usr/bin/env sh

# This file is used to build and deploy the docs to the dist branch

DIST_BRANCH="dist"
BASE_DIR="/home/runner/work/htmlmark"

git stash && git stash clear

echo "Building Started...."
cd demo || exit
pnpm build
cd .. || exit
echo "Building Completed."


echo "Deploying Started...."
mkdir -p "${BASE_DIR}""/temp"
mv docs "${BASE_DIR}""/temp"
rm -rf docs

git fetch origin ${DIST_BRANCH}
git checkout ${DIST_BRANCH}

cp -r "${BASE_DIR}"/temp/docs/* .

curr_date=$(date)

if [ -n "$(git status --porcelain)" ]; then
  git add .
  git -c user.name="Kiran Parajuli" \
   -c user.email="kiranparajuli589@gmail.com" \
    commit -m "Update the build code @ ""${curr_date}"
  git push origin ${DIST_BRANCH}
fi

rm -rf "${BASE_DIR}""/temp"
echo "Deploying Docs Has Completed!"
