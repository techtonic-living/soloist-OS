// Send TextField build instructions to designAssistant component (node 2002:712)
// Run this in the Figma plugin's browser console (DevTools)

parent.postMessage(
	{
		pluginMessage: {
			type: "apply-textfield-build-notes-to-node",
			payload: { nodeId: "2002:712", mode: "replace" },
		},
	},
	"*"
);

console.log("✅ Sent TextField instructions to designAssistant (node 2002:712)");
