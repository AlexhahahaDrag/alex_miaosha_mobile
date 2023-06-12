import { RouteComponent, RouteMeta, RouteRecordRaw, RouteRecordRedirectOption } from "vue-router";

type Lazy<T> = () => Promise<T>;

export interface MenuRouteMeta {
    hideChildrenInMenu?: boolean;
    hiedInMenu?: boolean;
    icon?: string
    authority?: string | string[];
    target?: '_blank' | '_self' | '_parent' | '_top';
    keepAlive?: boolean;
    lock?: boolean;
}

export type MenuDataItem = {
    path: string;
    name?: string;
    children?: MenuDataItem[];
    meta?: MenuRouteMeta & RouteMeta;
    redirect?: RouteRecordRedirectOption;
    component?: RouteComponent | Lazy<RouteComponent>;
} & RouteRecordRaw;