import * as React from 'react';
import { PureComponent } from 'react';
import { Router } from 'halter';
// import { History } from 'history';
import { IRoute } from '../../halter/lib/router';

export type ReplaceStateFunction = (state: any, title: string, route: string) => void;
export type GetComponentFunction = () => (React.ReactNode | Promise<React.ReactNode>);

export interface RouteDefinition {
    name?: string;
    path?: string;
    component?: React.ReactNode;
    onBefore?: IRoute["onBefore"];
    getComponent?: GetComponentFunction;
    childRoutes?: RouteDefinition[];
}

export interface RouterViewProps {
    routes: RouteDefinition[];
    router: Router;
}

export interface RouteRenderInformation {
    name: string[];
    path: string[];
    onBefore: Array<IRoute["onBefore"]>;
    component: GetComponentFunction[];
}

export default class RouterView extends PureComponent<RouterViewProps, {
    children?: React.ReactNode;
}> {
    public _initPromise?: Promise<void>;
    constructor(props: RouterViewProps) {
        super(props);
        this.state = {};
    }

    fillRouteData(route: RouteDefinition, { name, path, onBefore, component }: RouteRenderInformation) {
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
            component.push(() => {
                return c;
            });
        } else if(route.getComponent) {
            component.push(route.getComponent);
        } else if(!route.childRoutes) {
            throw new Error('You should either define `getComponent` or `component` property of route');
        }
    }

    getRouteData(route: RouteDefinition, parent?: RouteRenderInformation) {
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
            name,
            path,
            onBefore,
            component
        });
        return {
            name,
            path,
            onBefore,
            component
        };
    }

    async getChildren(component: GetComponentFunction[], props: any): Promise<React.ReactNode | null> {
        const item = component.shift();
        if(item) {
            let Component: any = await item();

            if(Component.__esModule) {
                Component = Component.default;
            }

            const children = await this.getChildren(component, props);

            return React.createElement(Component, props, children);
        }
        return null;
    }
    
    async createRoutes(routes: RouteDefinition[], parent?: RouteRenderInformation) {
        for(const route of routes) {
            if(route.childRoutes) {
                this.createRoutes(route.childRoutes, this.getRouteData(route, parent));
                continue;
            }
            const data = this.getRouteData(route, parent);

            this.props.router.on({
                name: data.name.join('.'),
                path: data.path.join('/').replace(/\/{1,}/g, '/'),
                async onBefore(match, replaceState, pushState) {
                    for(const onBefore of data.onBefore) {
                        if(!onBefore) {
                            continue;
                        }
                        await onBefore(match, replaceState, pushState);
                    }
                },
                callback: async (name, params, query) => {
                    const children = await this.getChildren(data.component.slice(0), {
                        location: {
                            name,
                            params,
                            query
                        }
                    });
                    this.setState({
                        children
                    });
                }
            });
        }
    }

    componentWillUnmount() {
    }

    componentDidMount() {
        this._initPromise = new Promise(async (resolve, reject) => {
            try {
                this.createRoutes(await this.props.routes);
                await this.props.router.init();
                resolve();
            } catch(reason) {
                reject(reason);
            }
        });
    }

    render() {
        const {
            children
        } = this.state;

        if(children)
            return children;

        return <div/>;
    }
}
