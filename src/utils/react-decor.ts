import {chain, Class, ClassDecorator, before, after as afterMethod} from "./class-decor";
import * as React from "react";
import {
    CElement,
    ClassicComponent, ClassicComponentClass, ClassType, ComponentClass, ComponentState, DOMElement, ReactElement,
    ReactHTML,
    ReactHTMLElement,
    ReactNode, ReactSVG, ReactSVGElement,
    SFC, SFCElement
} from "react";

import ReactCurrentOwner = require('react/lib/ReactCurrentOwner');
import {mix, MixerData} from "./mixer";

export type RenderResult = JSX.Element | null | false;
export type Rendered<P extends object> = {
    props: P;
    render(): RenderResult;
};

// TODO: make union based of all different overloaded signatures of createElement
export type CreateElementHook<T extends Rendered<any>> =
    <P = object>(instance: T,
                 next: CreateElementNext<P>,
                 type: ElementType<P>,
                 props: P,
                 children: Array<ReactNode>) => ElementReturnType<P>;

export type CreateElementNext<P> = (type: ElementType<P>, props?: P, ...children: Array<ReactNode>) => ReactElement<P>;

export type ElementType<P> =
    keyof ReactHTML
    | keyof ReactSVG
    | string
    | SFC<P>
    | ComponentClass<P>
    | ClassType<P, ClassicComponent<P, ComponentState>, ClassicComponentClass<P>>;
export type ElementReturnType<P> =
    ReactHTMLElement<any>
    | ReactSVGElement
    | DOMElement<P, any>
    | SFCElement<P>
    | ReactElement<P>
    | CElement<P, ClassicComponent<P, ComponentState>>;

/*

 function createElement<P extends HTMLAttributes<T>, T extends HTMLElement>(
 type: keyof ReactHTML,
 props?: ClassAttributes<T> & P,
 ...children: ReactNode[]): ReactHTMLElement<T>;
 function createElement<P extends SVGAttributes<T>, T extends SVGElement>(
 type: keyof ReactSVG,
 props?: ClassAttributes<T> & P,
 ...children: ReactNode[]): ReactSVGElement;
 function createElement<P extends DOMAttributes<T>, T extends Element>(
 type: string,
 props?: ClassAttributes<T> & P,
 ...children: ReactNode[]): DOMElement<P, T>;
 function createElement<P>(
 type: SFC<P>,
 props?: Attributes & P,
 ...children: ReactNode[]): SFCElement<P>;
 function createElement<P>(
 type: ClassType<P, ClassicComponent<P, ComponentState>, ClassicComponentClass<P>>,
 props?: ClassAttributes<ClassicComponent<P, ComponentState>> & P,
 ...children: ReactNode[]): CElement<P, ClassicComponent<P, ComponentState>>;
 function createElement<P, T extends Component<P, ComponentState>, C extends ComponentClass<P>>(
 type: ClassType<P, T, C>,
 props?: ClassAttributes<T> & P,
 ...children: ReactNode[]): CElement<P, T>;
 function createElement<P>(
 type: ComponentClass<P>,
 props?: Attributes & P,
 ...children: ReactNode[]): ReactElement<P>;

 */

const original: typeof React.createElement = React.createElement;
// for root replication use React.cloneElement()

function cleanUpHook(type: React.ComponentClass, props: any, children: Array<ReactNode>) {
    (React as any).createElement = original;
    return original(type, props, ...children);
}

interface ReactMixerData<T extends Rendered<any>> extends MixerData<T> {
    createElementHooks:Array<CreateElementHook<T>>;
}

function isReactMixerData<T extends Rendered<any>>(arg:MixerData<T>): arg is ReactMixerData<T>{
    return !!(arg as ReactMixerData<T>).createElementHooks;
}

function makeBeforeRenderHook<T extends Rendered<any>>(mixerData:ReactMixerData<T>) {
    return (instance: T, args: never[]) => {
        // TODO move boundHook to class-level (keep track of instance in mixerData)
        // monkey-patch React.createElement with our hook
        function boundHook<P = object>(type: ComponentClass<P>, props: P, ...children: Array<ReactNode>) {
            // check if original render is over, then clean up and call original
            if (ReactCurrentOwner.current && ReactCurrentOwner.current._instance === instance) {


                const hookResult = mixerData.createElementHooks[0](instance, original, type, props, children);


                if (hookResult === undefined) { // TODO React.isValidElement()
                    throw new Error('@registerForCreateElement Error: hook returned undefined');
                }
                return hookResult;
            } else {
                return cleanUpHook(type, props, children);
            }
        }

        (React as any).createElement = boundHook;
        return args;
    }
}

export function registerForCreateElement<T extends Rendered<any>>(hook: CreateElementHook<T>): ClassDecorator<T> {
    return function decorator<T1 extends T>(t: Class<T1>) {
        const mixed = mix(t);
        const mixerData = mixed.$mixerData;
        if (isReactMixerData(mixerData)){
            mixerData.createElementHooks.push(hook);
            return mixed;
        } else {
            let reactMD = mixerData as ReactMixerData<T1>;
            reactMD.createElementHooks = [hook];
            const beforeRenderHook = makeBeforeRenderHook(reactMD);
            return before(beforeRenderHook, 'render')(mixed);
        }
    };
}