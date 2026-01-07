import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { V2App } from "./v2/V2App";
import "./index.css";

class ErrorBoundary extends React.Component<
	{ children: React.ReactNode },
	{ hasError: boolean; error: any }
> {
	constructor(props: any) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: any) {
		return { hasError: true, error };
	}

	render() {
		if (this.state.hasError) {
			return (
				<div className="p-5 text-white">
					<h1>Something went wrong.</h1>
					<pre>{this.state.error?.toString()}</pre>
				</div>
			);
		}
		return this.props.children;
	}
}

import { SoloistProvider } from "./context/SoloistContext";
import { ToastProvider } from "./context/ToastContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<ErrorBoundary>
			<SoloistProvider>
				<ToastProvider>
					{new URLSearchParams(globalThis.location.search).has(
						"v2"
					) ? (
						<V2App />
					) : (
						<App />
					)}
				</ToastProvider>
			</SoloistProvider>
		</ErrorBoundary>
	</React.StrictMode>
);
