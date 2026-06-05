"use client";

import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useRef,
	useState,
	type ReactNode,
} from "react";

import { SectionSubheaderBar, type SubheaderSlot } from "./section-subheader-bar";

type TabBridgeValue = {
	active: Record<string, string>;
	reportActive: (channel: string, value: string) => void;
	select: (channel: string, value: string) => void;
	registerHandler: (channel: string, handler: (value: string) => void) => void;
};

const TabBridgeContext = createContext<TabBridgeValue | null>(null);

export function TabBridgeProvider({
	initial,
	children,
}: {
	initial: Record<string, string>;
	children: ReactNode;
}) {
	const [active, setActive] = useState(initial);
	const handlersRef = useRef<Record<string, (value: string) => void>>({});

	const registerHandler = useCallback((channel: string, handler: (value: string) => void) => {
		handlersRef.current[channel] = handler;
	}, []);

	const reportActive = useCallback((channel: string, value: string) => {
		setActive((prev) => (prev[channel] === value ? prev : { ...prev, [channel]: value }));
	}, []);

	const select = useCallback((channel: string, value: string) => {
		handlersRef.current[channel]?.(value);
	}, []);

	const value = useMemo(
		() => ({ active, reportActive, select, registerHandler }),
		[active, reportActive, select, registerHandler],
	);

	return <TabBridgeContext.Provider value={value}>{children}</TabBridgeContext.Provider>;
}

export function useTabBridge() {
	return useContext(TabBridgeContext);
}

export function BridgeSectionSubheader({ slots }: { slots: SubheaderSlot[] }) {
	const bridge = useTabBridge();

	const tabControllers: Record<string, { active?: string; onSelect?: (value: string) => void }> = {};
	for (const slot of slots) {
		if (slot.type === "tabs") {
			tabControllers[slot.id] = {
				active: bridge?.active[slot.id],
				onSelect: bridge ? (value: string) => bridge.select(slot.id, value) : undefined,
			};
		}
	}

	return <SectionSubheaderBar slots={slots} tabControllers={tabControllers} />;
}
