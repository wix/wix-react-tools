import {Component, ComponentType, StatelessComponent} from "react";
import {
    DecorReactHooks,
    DecorReacWrapArguments,
    ElementArgs,
    ElementHook,
    isReactClassComponent,
    Stateful,
    StatefulElementHook,
    StatelessDecorReactHooks,
    StatelessElementHook,
    translateName,
    Wrapper
} from "./common";
import {makeRenderWrapper} from "./logic";
import {cloneFunction} from "../functoin-decor/index";
import {InheritedWrapApi} from "../wrappers/index";
import {classDecor, ClassDecorator} from "../class-decor/index";
import {isArray} from "util";

export {
    DecorReactHooks,
    StatelessDecorReactHooks,
    StatefulElementHook,
    StatelessElementHook,
    Wrapper,
    ElementArgs
} from "./common";


export class ReactDecor extends InheritedWrapApi<DecorReacWrapArguments<any>, ComponentType<any>> {

    static readonly instance = new ReactDecor();

    private sfcDecorator: Wrapper<StatelessComponent>;
    private classComponentDecorator: ClassDecorator<Component>;

    // singleton
    private constructor() {
        if (ReactDecor.instance) {
            return ReactDecor.instance;
        }
        super('react-decor');
        const renderWrapper = makeRenderWrapper(this);
        this.sfcDecorator = process.env.NODE_ENV === 'production' ? renderWrapper : translateName(renderWrapper);
        const rawCompClassDecorator = classDecor.method<Component>('render', renderWrapper);
        this.classComponentDecorator = process.env.NODE_ENV === 'production' ? rawCompClassDecorator : translateName(rawCompClassDecorator);
    }

    makeWrapper<P extends object, T extends Component<P> = Component<P>>(wrapperArgs: DecorReacWrapArguments<P, T>): Wrapper<P> ;

    makeWrapper<P extends object, T extends Component<P> = Component<P>>(statelessHooks: StatelessDecorReactHooks<P>, classHooks?: DecorReactHooks<P, T>): Wrapper<P> ;

    makeWrapper<P extends object, T extends Component<P> = Component<P>>(statelessHooks: DecorReacWrapArguments<P, T> | StatelessDecorReactHooks<P>, classHooks?: DecorReactHooks<P, T>): Wrapper<P> {
        if (isArray(statelessHooks)) {
            return super.makeWrapper(makeDecorReacWrapArguments(statelessHooks, classHooks));
        } else {
            return super.makeWrapper(statelessHooks);
        }
    }

// TODO: remove ?
    onRootElement<P extends object, T extends Component<P> = Component<P>>(statelessHook: StatelessElementHook<P>, classHook?: StatefulElementHook<P, T>): Wrapper<P> {
        return this.makeWrapper([asRootOnly(statelessHook)], classHook ? [asRootOnly(classHook)] : undefined);
    }

// TODO: remove ?
    onEachElement<P extends object, T extends Component<P> = Component<P>>(statelessHook: StatelessElementHook<P>, classHook?: StatefulElementHook<P, T>): Wrapper<P> {
        return this.makeWrapper([statelessHook], classHook ? [classHook] : undefined);
    }

    protected mergeArgs(base: DecorReacWrapArguments<any>, addition: DecorReacWrapArguments<any>): DecorReacWrapArguments<any> {
        return {
            statelessHooks: base.statelessHooks.concat(addition.statelessHooks),
            classHooks: base.classHooks.concat(addition.classHooks),
        };
    }

    protected wrappingLogic<T extends ComponentType>(this: ReactDecor, target: T, _args: DecorReacWrapArguments<any>): T {
        let Wrapped = target;
        if (isReactClassComponent(target)) {
            Wrapped = this.classComponentDecorator(target as any) as T;
        } else if (typeof target === 'function') {
            Wrapped = this.sfcDecorator(target as any) as T;
        }
        return Wrapped;
    }
}

export const reactDecor = ReactDecor.instance;

export function makeDecorReacWrapArguments<P extends object, T extends Component<P> = Component<P>>(statelessHooks: StatelessDecorReactHooks<P>, classHooks?: DecorReactHooks<P, T>): DecorReacWrapArguments<P, T> {
    return {
        statelessHooks: statelessHooks,
        classHooks: classHooks || statelessHooks
    };
}

export function asRootOnly<S extends Stateful, P extends object>(hook: ElementHook<S, P>): ElementHook<S, P> {
    return hook.rootOnly ? hook : makeRootOnly(cloneFunction(hook));
}

export function makeRootOnly<S extends Stateful, P extends object>(hook: ElementHook<S, P>): ElementHook<S, P> {
    if (hook.name === 'addChangeRemoveHook') {
        debugger;
    }
    hook.rootOnly = true;
    return hook;
}
