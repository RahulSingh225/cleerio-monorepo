import { SQL, SQLWrapper } from 'drizzle-orm';
import { AnyPgTable } from 'drizzle-orm/pg-core';
import { Database } from '../db';
export declare abstract class BaseRepository<T extends AnyPgTable> {
    protected readonly table: T;
    protected readonly _db: Database;
    constructor(table: T, _db?: Database);
    protected get tenantId(): string | null;
    protected withTenant(filter?: SQL | SQLWrapper): SQL | undefined;
    protected createQuery(): import("drizzle-orm/pg-core").PgSelectBase<any, any, "single", {} | Record<any, "not-null">, true, never, {
        [x: string]: any;
    }[], any>;
    findMany(options?: {
        where?: SQL | SQLWrapper;
        limit?: number;
        offset?: number;
        orderBy?: SQL | SQL[];
    }): Promise<{
        [x: string]: any;
    }[]>;
    findFirst(where?: SQL | SQLWrapper): Promise<{
        [x: string]: any;
    }>;
    count(where?: SQL | SQLWrapper): Promise<number>;
    insert(data: any | any[]): Promise<any[] | import("pg").QueryResult<never>>;
    update(where: SQL | SQLWrapper, data: any): Promise<{
        [x: string]: any;
    }[]>;
    delete(where: SQL | SQLWrapper): Promise<any[] | import("pg").QueryResult<never>>;
}
