#!/usr/bin/env bash
set -eu
cd "$(dirname "$0")"
sdk=${ANDROID_HOME:?Cần Android SDK}
tools="$sdk/build-tools/35.0.0"
platform="$sdk/platforms/android-34/android.jar"
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT
mkdir -p "$work/classes" "$work/dex" build
javac -source 8 -target 8 -bootclasspath "$platform" -d "$work/classes" src/vn/bd/raloixml/Main.java
"$tools/d8" --min-api 26 --lib "$platform" --output "$work/dex" "$work"/classes/vn/bd/raloixml/*.class
"$tools/aapt2" compile --dir res -o "$work/res.zip"
"$tools/aapt2" link -I "$platform" --manifest AndroidManifest.xml -A assets -o "$work/app.apk" "$work/res.zip"
(cd "$work/dex" && zip -q "$work/app.apk" classes.dex)
"$tools/zipalign" -f 4 "$work/app.apk" build/TraLoiXML-unsigned.apk
