import type { components } from "../generated/ws.ts";
import type {
	components as alertComponents,
	WsAlertSubscribeMap,
	WsAlertEventDataMap,
	WsAlertEventName,
} from "../generated/ws-alerts.ts";

export type WsSchemas = components["schemas"];
export type WsAlertSchemas = alertComponents["schemas"];
export type { WsAlertSubscribeMap, WsAlertEventDataMap, WsAlertEventName };
