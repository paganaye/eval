#!/usr/bin/env node

const { FuseBox } = require("fuse-box");
const fuse = FuseBox.init({
    homeDir: "src",
    output: "$name.js",
	 sourceMaps: true,
	 cache: true
});

fuse.bundle("app")
    .instructions(`>App.ts`)
	 .watch()
	 .hmr();

fuse.run();
fuse.dev();

