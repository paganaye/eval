#!/usr/bin/env node

const { FuseBox } = require("fuse-box");
const fuse = FuseBox.init({
    homeDir: "src",
    output: "$name.js",
	 sourceMaps: true
});

fuse.bundle("app")
    .instructions(`>App.ts`)
	 .watch();

fuse.run();

fuse.dev();

//	sourceMap: {
//		bundleReference: "app.js.map",
//		outFile: "app.js.map",
//fuse.devServer("> App.ts", {});

