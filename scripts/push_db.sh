#!/bin/bash
./use_dev.sh

pushd ..
npx prisma db push
popd