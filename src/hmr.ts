declare var FuseBox: any; 

const customizedHMRPlugin = {
	hmrUpdate: ({ type, path, content }) => {
		console.log("HMR Update...");
		location.reload();
	}
}

declare var process:any;

let alreadyRegistered = false;
if (!process.env.hmrRegistered) {
	process.env.hmrRegistered = false;
	console.log("Adding HMR plugin");
	FuseBox.addPlugin(customizedHMRPlugin);
}


