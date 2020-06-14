import * as React from "react";
import { IPointerMatch } from "halter/lib/pointer";
import { UpdateStateCallback } from "halter/lib/router";

/**
 * Component type that we expect to deal with (no properties)
 */
export type ComponentType = React.ExoticComponent<{}> | React.ComponentType<{}>;

export interface IRouteBase {
    name: string;
    path?: string;
    onBefore?: (match: IPointerMatch, replace: UpdateStateCallback, push: UpdateStateCallback) => void;
}

export interface IRouteSync extends IRouteBase {
    component?: ComponentType;
}

export interface IRouteAsync extends IRouteBase {
    getComponent: () => Promise<{
        default: ComponentType;
    }>;
}

export type DistributiveExtend<T, U extends object> = (
    T extends object ? T & U : never
);

export type Route = IRouteSync | IRouteAsync;

export type RouteDefinition = DistributiveExtend<Route, {
    childRoutes?: RouteDefinition[];
}> | {
    routes: Route[];
    childRoutes?: RouteDefinition[];
};
