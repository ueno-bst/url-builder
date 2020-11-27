declare type QueryValue = string | undefined;
declare type QueryValueList = QueryValue[];
/**
 * URLBuilderオブジェクト
 */
export declare class URLBuilder {
    scheme: string;
    user: string;
    password: string;
    host: string;
    port: string;
    path: string;
    query: QueryBuilder;
    hash: string;
    /**
     * コンストラクタ
     * @param url
     */
    constructor(url?: string);
    /**
     * オブジェクトをURL文字列に変換する
     */
    build(): string;
    /**
     * 現在のURLからオブジェクトを作成する
     */
    current(): URLBuilder;
}
/**
 * QueryBuilderオブジェクト
 */
export declare class QueryBuilder {
    private query;
    /**
     * コンストラクタ
     * @param query
     */
    constructor(query?: string);
    /**
     * オブジェクトをクエリ文字列に変換する
     */
    build(): string;
    /**
     * 登録済みキーリストを取得する
     */
    get keys(): string[];
    /**
     * キーの数を返却する
     */
    get length(): number;
    /**
     * 対象キーが登録されている位置を返却する
     * @param key
     */
    indexOf(key: string): number;
    /**
     * 対象キーが登録されているかを判定する
     * @param key
     */
    has(key: string): boolean;
    /**
     * 対象キーの値を1つだけ、返却する
     * @param key
     */
    single(key: string): QueryValue | null;
    /**
     * 対象キーの値を配列で返却する
     * @param key
     */
    get(key: string): QueryValueList | null;
    /**
     * インデックス値で値を取得する
     * @param index
     */
    getByIndex(index: number): QueryValueList | null;
    /**
     * 指定したキーの値を設定する。既にキーがある場合は、値を上書きする
     * @param key
     * @param value
     */
    set(key: string, ...value: QueryValueList): this;
    /**
     * 設定したキーに値を追加する。
     * @param key
     * @param value
     */
    add(key: string, ...value: QueryValueList): this;
    /**
     * 指定したキーを削除する
     * @param key
     */
    drop(key: string): this;
    /**
     *
     * @param queries
     * @param replace
     */
    merge(queries: string | QueryBuilder, replace?: boolean): this;
    /**
     * すべてのキーと値を削除する
     */
    clear(): this;
}
export {};
//# sourceMappingURL=index.d.ts.map