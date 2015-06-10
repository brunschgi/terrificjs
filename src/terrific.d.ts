/// <reference path="es6-promise.d.ts" />
declare module T {
    class Application {
        _ctx: Node;
        _sandbox: Sandbox;
		_config: any;
        _modules: any;
        _id: number;

        constructor(ctx?: Node, config?: any);

        registerModules(ctx?: Node): Module[];
        unregisterModules(modules?: any): void;
        start(modules?: any): Promise<void>;
        stop(modules?: any): void;
        registerModule(ctx: Node, mod: string, namespace?: any): Module;
        registerModule(ctx: Node, mod: string, skins?: string|string[]): Module;
        registerModule(ctx: Node, mod: string, skins?: string|string[], namespace?: any): Module;
        getModuleById(id: number): Module;
    }

    class EventEmitter {
        _listeners: any;
        _sandbox: Sandbox;
        _connected: boolean;

        constructor(sandbox: Sandbox);

        on(event: string, listener: (...allArguments: any[]) => void): EventEmitter;
        addListener(event: string, listener: (...allArguments: any[]) => void): EventEmitter;
        once(event: string, listener: (...allArguments: any[]) => void): EventEmitter;
        off(): EventEmitter;
        off(event: string): EventEmitter;
        off(event: string, listener: Function): EventEmitter;
        removeListener(): EventEmitter;
        removeListener(event: string): EventEmitter;
        removeListener(event: string, listener: Function): EventEmitter;
        removeAllListeners(event: string): EventEmitter;
        emit(...allArguments: any[]): EventEmitter;
        handle(event: string, ...allArguments: any[]): EventEmitter;
        listeners(event: string): ((...allArguments: any[]) => void)[];
        hasListeners(event: string): boolean;
        connect(): EventEmitter;
        disconnect(): EventEmitter;
    }

    class Sandbox {
        _application: Application;
        _eventEmitters: EventEmitter[];

        constructor(application: Application);

        addModules(ctx: Node): Module[];
        removeModules(modules: Node|Module[]): Sandbox;
        getModuleById(id: number): Module;
        getConfig(): any;
        getConfigParam(name: string): any;
        addEventEmitter(eventEmitter: EventEmitter): Sandbox;
        removeEventEmitter(eventEmitter: EventEmitter): Sandbox;
        dispatch(...allArguments: any[]): Sandbox;
    }

    class Module {
        _ctx: Node;
        _sandbox: Sandbox;
        _events: EventEmitter;

        constructor(ctx: Node, sandbox: Sandbox);

        start(resolve: (value?: any) => void, reject: (error?: any) => void): void;
        stop(): void;
    }

	export function createModule(spec: any):Function;
	export function createSkin(spec: any):Function;
}