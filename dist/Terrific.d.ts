/// <reference path="es6-promise.d.ts" />
declare module T {
    class Application {
        _ctx: Node;
        _sandbox: Sandbox;
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

    class Connector {
        _listeners: any;
        _sandbox: Sandbox;
        _connected: boolean;

        constructor(sandbox: Sandbox);

        on(event: string, listener: (...allArguments: any[]) => void): Connector;
        addListener(event: string, listener: (...allArguments: any[]) => void): Connector;
        once(event: string, listener: (...allArguments: any[]) => void): Connector;
        off(): Connector;
        off(event: string): Connector;
        off(event: string, listener: Function): Connector;
        removeListener(): Connector;
        removeListener(event: string): Connector;
        removeListener(event: string, listener: Function): Connector;
        removeAllListeners(event: string): Connector;
        emit(...allArguments: any[]): Connector;
        handle(event: string, ...allArguments: any[]): Connector;
        listeners(event: string): ((...allArguments: any[]) => void)[];
        hasListeners(event: string): boolean;
        connect(): Connector;
        disconnect(): Connector;
    }

    class Sandbox {
        _application: Application;
        _config: any;
        _connectors: Connector[];

        constructor(application: Application, config: any);

        addModules(ctx: Node): Module[];
        removeModules(modules: Node|Module[]): Sandbox;
        getModuleById(id: number): Module;
        getConfig(): any;
        getConfigParam(name: string): any;
        addConnector(connector: Connector): Sandbox;
        removeConnector(connector: Connector): Sandbox;
        dispatch(...allArguments: any[]): Sandbox;
    }

    class Module {
        _ctx: Node;
        _sandbox: Sandbox;
        _events: Connector;

        constructor(ctx: Node, sandbox: Sandbox);

        start(resolve: (value?: any) => void, reject: (error?: any) => void): void;
        stop(): void;
    }
}