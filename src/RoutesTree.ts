import { EventEmitter } from "events";
import Router, { IRoute } from "halter/lib/router";
import {
    cloneElement,
    ComponentClass,
    createElement,
    FunctionComponent,
    ReactElement
} from "react";

export interface IRouteLocation {
    name: string;
    params: Map<string, string>;
    query: Map<string, string>;
}

export interface IRouteComponentBaseProps {
    location: IRouteLocation;
}

export type RouteAcceptedComponents<T> = ComponentClass<T> | FunctionComponent<T> | null;

/**
 * React component types that are accepted by IRouteDefinition
 */
export type RouteComponentClass = RouteAcceptedComponents<any> | {
    default: RouteAcceptedComponents<any>;
};

export type ReplaceStateFunction = (name: string, params?: Map<string, string>, query?: Map<string, string>) => void;
export type GetComponentFunction = () => RouteComponentClass | Promise<RouteComponentClass>;

export interface IRouteDefinition {
    name?: string;
    path?: string;
    component?: RouteComponentClass;
    onBefore?: IRoute["onBefore"];
    getComponent?: GetComponentFunction;
    childRoutes?: IRouteDefinition[];
}

export interface IRouteRenderInformation {
    name: string[];
    path: string[];
    onBefore: Array<IRoute["onBefore"]>;
    component: GetComponentFunction[];
}

export default class RoutesTree extends EventEmitter {
    private cachedChildrens = new Map<string, ReactElement | null>();
    constructor(private router: Router, private callback: (node: ReactElement | null) => void) {
        super();
    }

    public createRoutes(
        routes: IRouteDefinition[],
        parent?: IRouteRenderInformation
    ) {
        for(const route of routes) {
            if(route.childRoutes) {
                this.createRoutes(route.childRoutes, this.getRouteData(route, parent));
                continue;
            }
            const data = this.getRouteData(route, parent);
            const childrenKey = data.name.join('/');

            this.router.on({
                callback: async (name, params, query) => {
                    const props = {
                        location: {
                            name,
                            params,
                            query
                        }
                    };
                    const children = await new Promise<ReactElement | null>(async (resolve) => {
                        const cachedChildren = this.cachedChildrens.get(childrenKey);
                        if(cachedChildren) {
                            resolve(cachedChildren);
                            return;
                        }
                        const component = await this.getChildren(data.component.slice(0), props);
                        this.cachedChildrens.set(childrenKey, component);
                        resolve(component);
                    });
                    if(children === null) {
                        this.callback(null);
                        return;
                    }
                    this.callback(cloneElement(children, props));
                },
                name: data.name.join("."),
                path: data.path.join("/").replace(/\/{1,}/g, "/"),
                async onBefore(match, replaceState, pushState) {
                    for(const onBefore of data.onBefore) {
                        if(!onBefore) {
                            continue;
                        }
                        await onBefore(match, replaceState, pushState);
                    }
                }
            });
        }
    }

    private fillRouteData(
        route: IRouteDefinition,
        { name, path, onBefore, component }: IRouteRenderInformation
    ) {
        if(route.name) {
            name.push(route.name);
        }
        if(route.path) {
            path.push(route.path);
        }
        if(route.onBefore) {
            onBefore.push(route.onBefore);
        }
        if(route.component) {
            const c = route.component;
            component.push(() => c);
        } else if(route.getComponent) {
            component.push(route.getComponent);
        } else if(!route.childRoutes) {
            throw new Error("You should either define `getComponent` or `component` property of route");
        }
    }

    private getRouteData(
        route: IRouteDefinition,
        parent?: IRouteRenderInformation
    ) {
        const name: string[] = [];
        const path: string[] = [];
        const onBefore: Array<IRoute["onBefore"]> = [];
        const component: GetComponentFunction[] = [];
        if(parent) {
            name.push(...parent.name);
            path.push(...parent.path);
            if(parent.onBefore) {
                onBefore.push(...parent.onBefore);
            }
            if(parent.component) {
                component.push(...parent.component);
            }
        }
        this.fillRouteData(route, {
            component,
            name,
            onBefore,
            path
        });
        return {
            component,
            name,
            onBefore,
            path
        };
    }

    private async getChildren(component: GetComponentFunction[], props: any): Promise<ReactElement | null> {
        const item = component.shift();
        if(!item) {
            return null;
        }

        let Component: any = await item();

        if(Component.__esModule) {
            Component = Component.default;
        }

        const children = await this.getChildren(component, props);

        return createElement(Component, props, children);
    }
}
