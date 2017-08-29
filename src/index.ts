// business logic
export {rootProps, ComponentProps} from './react-features/root-props';
import {rootProps} from './react-features/root-props';
export * from './core/functional';
export * from './core/types';
export * from './core/config';
export {privateState, StateProvider, STATE_DEV_MODE_KEY} from './core/private-state';
export * from './core/class-private-state';

//utils
export * from './core/disposers';

// js decor
export * from './class-decor/index';
export * from "./function-decor";

// react decor
export * from './react-decor/common';
export * from './react-decor/react-decorator';
export * from './react-decor/react-decor-class';

// react features
export * from './react-features/disposable-decorator';
export * from './react-features/properties-decorator';

// legacy :
//bases
export * from './old/bases/observable-component';
//mixins
export * from './old/mixins/global-id-decorator';

// custom exports:
import {after as FDAfter, before as FDBefore, middleware as FDMiddleware} from "./function-decor";
import {after as CDAfter, before as CDBefore, middleware as CDMiddleware} from "./class-decor/index";

function mergeFuncAndClass<F extends Function, C extends Function>(fDFunc:F, cDFunc:C) : F & C{
    function ApiHook() {
        if (arguments.length > 1) {
            return cDFunc.apply(null, arguments);
        } else {
            return fDFunc.apply(null, arguments);
        }
    }
    Object.setPrototypeOf(ApiHook, cDFunc);
    return ApiHook as any as F & C;
}

export const before = mergeFuncAndClass(FDBefore, CDBefore);
export const after = mergeFuncAndClass(FDAfter, CDAfter);
export const middleware = mergeFuncAndClass(FDMiddleware, CDMiddleware);



// TODO: remove backward compatible support
export const root = function DEPRECATED(componentProps: any, rootProps: any, blacklist?: any[]): any {
    console.warn(`
    The 'root' namespace is deprecated. 
    please use 'rootProps' to access the same function,
    or consider using @properties `);
    return rootProps(componentProps, rootProps, blacklist);
} as typeof rootProps;
