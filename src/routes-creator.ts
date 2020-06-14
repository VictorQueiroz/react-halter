import { IRouteBase, RouteDefinition } from './types';
import { lazy } from 'react';
import * as React from 'react';

export interface IRouteInfo {
    name: string;
    path?: string;
    onBefore?: IRouteBase;
    component?: React.ComponentType<{}>;
}

export type CreatedRoute = IRouteInfo[];

export function createRoutes(
    route: RouteDefinition,
    line = new Array<IRouteInfo>()
): CreatedRoute[] {
    const lines = new Array<CreatedRoute>();
    /**
     * Route defining a single parent for all child routes
     */
    if(!('routes' in route)) {
        let component: React.ComponentType<{}> | undefined;
        if('getComponent' in route) {
            component = lazy(route.getComponent);
        } else {
            if(route.component) {
                component = route.component;
            }
        }
        let ch: IRouteInfo = {
            name: route.name,
            path: route.path,
            component
        };
        if(route.onBefore) {
            ch = {
                ...ch,
                onBefore: route.onBefore
            };
        }
        const newLine = line.concat([ch]);
        if(route.childRoutes && route.childRoutes.length) {
            for(const child of route.childRoutes) {
                lines.push(...createRoutes(
                    child,
                    newLine
                ));
            }
        } else {
            lines.push(newLine);
        }
    } else {
        for(const parent of route.routes) {
            lines.push(...createRoutes({
                ...parent,
                childRoutes: route.childRoutes
            }, line));
        }
    }
    return lines;
}
