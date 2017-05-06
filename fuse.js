#!/usr/bin/env node

const FuseboxLibrary = require("fuse-box");
const FuseBox = FuseboxLibrary.FuseBox;

const fuse = FuseBox.init({
	homeDir: "src/",
	outFile: "./app.js",
	sourceMap: {
		bundleReference: "app.js.map",
		outFile: "app.js.map",
	}
});

fuse.devServer("> App.ts", {});

