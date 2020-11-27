interface QueryObject {
    key: string,
    value: QueryValueList,
}

type QueryValue = string | undefined;
type QueryValueList = QueryValue[];
type QueryObjectList = QueryObject[];

/**
 *
 * @param value
 */
function decode(value: string): string {
    return decodeURI(value);
}

/**
 *
 * @param value
 */
function encode(value: string): string {
    return encodeURI(value);
}

function isString(value?: any): value is string {
    return typeof value === "string";
}

function isNil(value?: any): value is null | undefined {
    return value === null || typeof value === 'undefined';
}

function isArray(value?: any): value is any[] {
    return Array.isArray(value);
}

/**
 * URLを分解、URLBuilderオブジェクトにパーツを収納する
 * @param obj
 * @param url
 */
function parseURL(obj: URLBuilder, url: string): void {
    const pattern = url.match(/^(?:(\w.+?):)?(?:\/\/(?:(.+?)(?::(.+?))?@)?([^\/:]+)(?::([0-9]+))?\/?)?([^?#]*?)?(?:\?(.*?))?(?:#(.*?))?$/);

    if (isArray(pattern)) {
        obj.scheme = pattern[1] || "";
        obj.user = pattern[2] || "";
        obj.password = pattern[3] || "";
        obj.host = pattern[4] || "";
        obj.port = pattern[5] || "";
        obj.path = pattern[6] || "";
        obj.query = new QueryBuilder(pattern[7] || "");
        obj.hash = pattern[8] || "";

    }
}

/**
 * クエリ文字列を分解、QueryBuilderオブジェクトにパーツを収納する
 * @param obj
 * @param query
 */
function parseQuery(obj: QueryBuilder, query: string): QueryBuilder {
    const queries = query.split("&");

    queries.forEach((value: string) => {
        if (value.length == 0) {
            return;
        }

        const param = value.match(/^(.*?)(?:=(.*))$/);

        if (param) {
            obj.add(decode(param[1]), decode(param[2]));
        } else {
            obj.add(decode(value), undefined);
        }
    });

    return obj;
}

/**
 * URLBuilderオブジェクトをURL形式に変換する
 * @param obj
 */
function buildURL(obj: URLBuilder): string {
    let url = "";

    if (obj.scheme != "") {
        url += obj.scheme + ":";
    }

    if (obj.host != "") {
        url += "//";

        if (obj.user != "") {
            url += obj.user;
            if (obj.password != "") {
                url += ":" + obj.password;
            }
            url += "@";
        }

        url += obj.host;

        if (obj.port != "") {
            url += ":" + obj.port;
        }

        url += "/";
    }

    if (obj.path != "") {
        url += obj.path;
    }

    const query = obj.query.build();

    if (query !== "") {
        url += "?" + obj.query.build();
    }

    if (obj.hash) {
        url += "#" + encode(obj.hash);
    }


    return url;
}

/**
 * QueryBuilderをクエリ文字列に変換する
 * @param obj
 */
function buildQuery(obj: QueryBuilder): string {
    const args: string[] = [];

    obj.keys.forEach((key) => {
        const values = obj.get(key);

        if (isNil(values)) {
            return;
        }

        for (let value of values) {
            if (isNil(value)) {
                args.push(encode(key));
            } else {
                args.push(encode(key) + "=" + encode(value));
            }
        }
    });

    return args.join("&");
}

/**
 * URLBuilderオブジェクト
 */
export class URLBuilder {
    public scheme: string = "";
    public user: string = "";
    public password: string = "";
    public host: string = "";
    public port: string = "";
    public path: string = "";
    public query!: QueryBuilder;
    public hash: string = "";

    /**
     * コンストラクタ
     * @param url
     */
    constructor(url: string = "") {
        parseURL(this, url);
    }

    /**
     * オブジェクトをURL文字列に変換する
     */
    build(): string {
        return buildURL(this);
    }

    /**
     * 現在のURLからオブジェクトを作成する
     */
    current(): URLBuilder {
        return new URLBuilder(window.location.toString() || "");
    }
}

/**
 * QueryBuilderオブジェクト
 */
export class QueryBuilder {
    private query: QueryObjectList = [];

    /**
     * コンストラクタ
     * @param query
     */
    constructor(query: string = "") {
        parseQuery(this, query);
    }

    /**
     * オブジェクトをクエリ文字列に変換する
     */
    build(): string {
        return buildQuery(this);
    }

    /**
     * 登録済みキーリストを取得する
     */
    get keys(): string[] {
        const keys: string[] = [];

        this.query.forEach((v) => {
            keys.push(v.key);
        });

        return keys;
    }

    /**
     * キーの数を返却する
     */
    get length(): number {
        return this.query.length;
    }

    /**
     * 対象キーが登録されている位置を返却する
     * @param key
     */
    indexOf(key: string): number {
        return this.keys.indexOf(key);
    }

    /**
     * 対象キーが登録されているかを判定する
     * @param key
     */
    has(key: string): boolean {
        return this.indexOf(key) >= 0;
    }

    /**
     * 対象キーの値を1つだけ、返却する
     * @param key
     */
    single(key: string): QueryValue | null {
        const value = this.get(key);

        if (isNil(value) || value.length == 0) {
            return null;
        }

        return value[0];
    }

    /**
     * 対象キーの値を配列で返却する
     * @param key
     */
    get(key: string): QueryValueList | null {
        return this.getByIndex(this.indexOf(key));
    }

    /**
     * インデックス値で値を取得する
     * @param index
     */
    getByIndex(index: number): QueryValueList | null {
        if (this.query[index]) {
            return this.query[index].value;
        }

        return null;
    }

    /**
     * 指定したキーの値を設定する。既にキーがある場合は、値を上書きする
     * @param key
     * @param value
     */
    set(key: string, ...value: QueryValueList): this {
        const index = this.indexOf(key);

        if (index < 0) {
            this.query.push({key: key, value: value});
        } else {
            this.query[index] = {key: key, value: value};
        }

        return this;
    }

    /**
     * 設定したキーに値を追加する。
     * @param key
     * @param value
     */
    add(key: string, ...value: QueryValueList): this {
        const index = this.indexOf(key);

        if (index < 0) {
            this.query.push({key: key, value: value});
        } else {
            value.forEach((v) => {
                this.query[index].value.push(v);
            });
        }

        return this;
    }

    /**
     * 指定したキーを削除する
     * @param key
     */
    drop(key: string): this {
        const length = this.length;
        this.query = this.query.filter((value) => {
            return key != value.key;
        });

        return this;
    }

    /**
     *
     * @param queries
     * @param replace
     */
    merge(queries: string | QueryBuilder, replace: boolean = false): this {
        if (isString(queries)) {
            queries = new QueryBuilder(queries);
        }

        const keys = queries.keys;

        for (let index = 0; index < keys.length; index++) {
            const
                key = keys[index],
                values = queries.get(key);

            if (values === null || values.length === 0) {
                if (replace) {
                    this.drop(key);
                }
            } else {
                if (replace) {
                    this.set(key, ...values);
                } else {
                    this.add(key, ...values);
                }
            }
        }

        return this;
    }

    /**
     * すべてのキーと値を削除する
     */
    clear(): this {
        this.query = [];

        return this;
    }
}