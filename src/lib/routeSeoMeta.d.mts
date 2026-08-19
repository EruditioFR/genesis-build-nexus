export interface RouteSeoMeta {
  title: string;
  description: string;
  h1: string;
  summary: string;
  schemas?: string[];
}

export declare const SITE_URL: string;
export declare const BRAND: string;
export declare const ROUTE_SEO: Record<string, RouteSeoMeta>;
export declare const ROUTE_BREADCRUMB_LABEL: Record<string, string>;
export declare function getRouteSeo(path: string): RouteSeoMeta | undefined;
