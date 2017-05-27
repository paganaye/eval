var FuseBox: any = (window as any).FuseBox;

const customizedHMRPlugin = {
	hmrUpdate: ({ type, path, content }) => {
		console.log("HMR Update...");
		location.reload();
	}
}

let alreadyRegistered = false;
if (!process.env.hmrRegistered) {
	process.env.hmrRegistered = false;
	console.log("Adding HMR plugin");
	FuseBox.addPlugin(customizedHMRPlugin);
}


