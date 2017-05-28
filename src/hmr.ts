var FuseBox: any = FuseBox || (window as any).FuseBox;

const customizedHMRPlugin = {
	hmrUpdate: ({ type, path, content }) => {
		console.log("HMR Update...");
		location.reload();
	}
}

//var process: any = process || (window as any).process;

let alreadyRegistered = false;
if (!process.env.hmrRegistered) {
	process.env.hmrRegistered = false;
	console.log("Adding HMR plugin");
	FuseBox.addPlugin(customizedHMRPlugin);
}


