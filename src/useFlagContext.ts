import { startTransition, useContext } from "react";
import FlagContext, { type IFlagContextValue } from "./FlagContext";
import type { UnleashClient } from "unleash-proxy-client";

const methods = {
	on: (event: string, callback: Function, ctx?: any): UnleashClient => {
		console.error("on() must be used within a FlagProvider");
		return mockUnleashClient;
	},
	off: (event: string, callback?: Function): UnleashClient => {
		console.error("off() must be used within a FlagProvider");
		return mockUnleashClient;
	},
	updateContext: async () => {
		console.error("updateContext() must be used within a FlagProvider");
		return undefined;
	},
	isEnabled: () => {
		console.error("isEnabled() must be used within a FlagProvider");
		return false;
	},
	getVariant: () => {
		console.error("getVariant() must be used within a FlagProvider");
		return { name: "disabled", enabled: false };
	}
};

const mockUnleashClient = {
	...methods,
	toggles: [],
	impressionDataAll: {},
	context: {},
	storage: {},
	start: () => {},
	stop: () => {},
	isReady: () => false,
	getError: () => null,
	getAllToggles: () => []
} as unknown as UnleashClient;

const defaultContextValue: IFlagContextValue = {
	...methods,
	client: mockUnleashClient,
	isInitiallyReady: false,
	startTransition,
};

export function useFlagContext() {
	const context = useContext(FlagContext);
	if (!context) {
		console.error("useFlagContext() must be used within a FlagProvider");
		return defaultContextValue;
	}

	return context;
}
