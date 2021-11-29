/* eslint-disable */
/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */
import { HTMLStencilElement, JSXBase } from "@stencil/core/internal";
import { Icons } from "../shared-web/components/ap-icon/ap-icon";
import { PromiseState, RouteMatch } from "../shared-web";
import { App } from "./app/app";
export namespace Components {
    interface ApError {
        "msgs": {
    main: string;
    close: string;
    showErrors: string;
    datetime: (d: number) => string;
  };
        "repo": string;
        "showError": (error: any) => Promise<void>;
    }
    interface ApIcon {
        "icon"?: Icons;
    }
    interface ApImage {
        "href"?: string;
        "srcPromise"?: PromiseState<string>;
    }
    interface ApInput {
        "label"?: string;
        "maxLength"?: number;
        "textarea"?: boolean;
        "value"?: string;
    }
    interface ApLoading {
    }
    interface ApModal {
    }
    interface ApRoot {
        "componentProps"?: { [k: string]: any };
        "defaultPath": string;
        "redirect"?: (p: string) => string | undefined;
        "routeMatches": RouteMatch[];
    }
    interface ApSpinner {
    }
    interface ApStyle {
    }
    interface ApTextview {
        "text"?: string;
    }
    interface AppHome {
        "activePage": boolean;
        "app": App;
    }
    interface AppRoom {
        "activePage": boolean;
        "app": App;
        "roomID": string;
    }
    interface AppRoot {
    }
}
declare global {
    interface HTMLApErrorElement extends Components.ApError, HTMLStencilElement {
    }
    var HTMLApErrorElement: {
        prototype: HTMLApErrorElement;
        new (): HTMLApErrorElement;
    };
    interface HTMLApIconElement extends Components.ApIcon, HTMLStencilElement {
    }
    var HTMLApIconElement: {
        prototype: HTMLApIconElement;
        new (): HTMLApIconElement;
    };
    interface HTMLApImageElement extends Components.ApImage, HTMLStencilElement {
    }
    var HTMLApImageElement: {
        prototype: HTMLApImageElement;
        new (): HTMLApImageElement;
    };
    interface HTMLApInputElement extends Components.ApInput, HTMLStencilElement {
    }
    var HTMLApInputElement: {
        prototype: HTMLApInputElement;
        new (): HTMLApInputElement;
    };
    interface HTMLApLoadingElement extends Components.ApLoading, HTMLStencilElement {
    }
    var HTMLApLoadingElement: {
        prototype: HTMLApLoadingElement;
        new (): HTMLApLoadingElement;
    };
    interface HTMLApModalElement extends Components.ApModal, HTMLStencilElement {
    }
    var HTMLApModalElement: {
        prototype: HTMLApModalElement;
        new (): HTMLApModalElement;
    };
    interface HTMLApRootElement extends Components.ApRoot, HTMLStencilElement {
    }
    var HTMLApRootElement: {
        prototype: HTMLApRootElement;
        new (): HTMLApRootElement;
    };
    interface HTMLApSpinnerElement extends Components.ApSpinner, HTMLStencilElement {
    }
    var HTMLApSpinnerElement: {
        prototype: HTMLApSpinnerElement;
        new (): HTMLApSpinnerElement;
    };
    interface HTMLApStyleElement extends Components.ApStyle, HTMLStencilElement {
    }
    var HTMLApStyleElement: {
        prototype: HTMLApStyleElement;
        new (): HTMLApStyleElement;
    };
    interface HTMLApTextviewElement extends Components.ApTextview, HTMLStencilElement {
    }
    var HTMLApTextviewElement: {
        prototype: HTMLApTextviewElement;
        new (): HTMLApTextviewElement;
    };
    interface HTMLAppHomeElement extends Components.AppHome, HTMLStencilElement {
    }
    var HTMLAppHomeElement: {
        prototype: HTMLAppHomeElement;
        new (): HTMLAppHomeElement;
    };
    interface HTMLAppRoomElement extends Components.AppRoom, HTMLStencilElement {
    }
    var HTMLAppRoomElement: {
        prototype: HTMLAppRoomElement;
        new (): HTMLAppRoomElement;
    };
    interface HTMLAppRootElement extends Components.AppRoot, HTMLStencilElement {
    }
    var HTMLAppRootElement: {
        prototype: HTMLAppRootElement;
        new (): HTMLAppRootElement;
    };
    interface HTMLElementTagNameMap {
        "ap-error": HTMLApErrorElement;
        "ap-icon": HTMLApIconElement;
        "ap-image": HTMLApImageElement;
        "ap-input": HTMLApInputElement;
        "ap-loading": HTMLApLoadingElement;
        "ap-modal": HTMLApModalElement;
        "ap-root": HTMLApRootElement;
        "ap-spinner": HTMLApSpinnerElement;
        "ap-style": HTMLApStyleElement;
        "ap-textview": HTMLApTextviewElement;
        "app-home": HTMLAppHomeElement;
        "app-room": HTMLAppRoomElement;
        "app-root": HTMLAppRootElement;
    }
}
declare namespace LocalJSX {
    interface ApError {
        "msgs"?: {
    main: string;
    close: string;
    showErrors: string;
    datetime: (d: number) => string;
  };
        "repo": string;
    }
    interface ApIcon {
        "icon"?: Icons;
    }
    interface ApImage {
        "href"?: string;
        "srcPromise"?: PromiseState<string>;
    }
    interface ApInput {
        "label"?: string;
        "maxLength"?: number;
        "textarea"?: boolean;
        "value"?: string;
    }
    interface ApLoading {
    }
    interface ApModal {
        "onClose"?: (event: CustomEvent<any>) => void;
    }
    interface ApRoot {
        "componentProps"?: { [k: string]: any };
        "defaultPath"?: string;
        "redirect"?: (p: string) => string | undefined;
        "routeMatches": RouteMatch[];
    }
    interface ApSpinner {
    }
    interface ApStyle {
    }
    interface ApTextview {
        "text"?: string;
    }
    interface AppHome {
        "activePage": boolean;
        "app": App;
    }
    interface AppRoom {
        "activePage": boolean;
        "app": App;
        "roomID": string;
    }
    interface AppRoot {
    }
    interface IntrinsicElements {
        "ap-error": ApError;
        "ap-icon": ApIcon;
        "ap-image": ApImage;
        "ap-input": ApInput;
        "ap-loading": ApLoading;
        "ap-modal": ApModal;
        "ap-root": ApRoot;
        "ap-spinner": ApSpinner;
        "ap-style": ApStyle;
        "ap-textview": ApTextview;
        "app-home": AppHome;
        "app-room": AppRoom;
        "app-root": AppRoot;
    }
}
export { LocalJSX as JSX };
declare module "@stencil/core" {
    export namespace JSX {
        interface IntrinsicElements {
            "ap-error": LocalJSX.ApError & JSXBase.HTMLAttributes<HTMLApErrorElement>;
            "ap-icon": LocalJSX.ApIcon & JSXBase.HTMLAttributes<HTMLApIconElement>;
            "ap-image": LocalJSX.ApImage & JSXBase.HTMLAttributes<HTMLApImageElement>;
            "ap-input": LocalJSX.ApInput & JSXBase.HTMLAttributes<HTMLApInputElement>;
            "ap-loading": LocalJSX.ApLoading & JSXBase.HTMLAttributes<HTMLApLoadingElement>;
            "ap-modal": LocalJSX.ApModal & JSXBase.HTMLAttributes<HTMLApModalElement>;
            "ap-root": LocalJSX.ApRoot & JSXBase.HTMLAttributes<HTMLApRootElement>;
            "ap-spinner": LocalJSX.ApSpinner & JSXBase.HTMLAttributes<HTMLApSpinnerElement>;
            "ap-style": LocalJSX.ApStyle & JSXBase.HTMLAttributes<HTMLApStyleElement>;
            "ap-textview": LocalJSX.ApTextview & JSXBase.HTMLAttributes<HTMLApTextviewElement>;
            "app-home": LocalJSX.AppHome & JSXBase.HTMLAttributes<HTMLAppHomeElement>;
            "app-room": LocalJSX.AppRoom & JSXBase.HTMLAttributes<HTMLAppRoomElement>;
            "app-root": LocalJSX.AppRoot & JSXBase.HTMLAttributes<HTMLAppRootElement>;
        }
    }
}
