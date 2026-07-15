declare module "node:sqlite" {
  export interface StatementResultingChanges {
    changes: number | bigint;
    lastInsertRowid: number | bigint;
  }

  export class StatementSync {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    run(...params: any[]): StatementResultingChanges;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get(...params: any[]): any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    all(...params: any[]): any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    iterate(...params: any[]): IterableIterator<any>;
    setAllowBareNamedParameters(enabled: boolean): void;
    setReadBigInts(enabled: boolean): void;
  }

  export interface DatabaseSyncOptions {
    open?: boolean;
    readOnly?: boolean;
    enableForeignKeyConstraints?: boolean;
    enableDoubleQuotedStringLiterals?: boolean;
    timeout?: number;
  }

  export class DatabaseSync {
    constructor(location: string, options?: DatabaseSyncOptions);
    open(): void;
    close(): void;
    exec(sql: string): void;
    prepare(sql: string): StatementSync;
    createFunction(name: string, fn: (...args: unknown[]) => unknown): void;
    [Symbol.dispose](): void;
  }
}
