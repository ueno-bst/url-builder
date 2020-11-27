(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.QueryBuilder = exports.URLBuilder = void 0;
    /**
     *
     * @param value
     */
    function decode(value) {
        return decodeURI(value);
    }
    /**
     *
     * @param value
     */
    function encode(value) {
        return encodeURI(value);
    }
    function isString(value) {
        return typeof value === "string";
    }
    function isNil(value) {
        return value === null || typeof value === 'undefined';
    }
    function isArray(value) {
        return Array.isArray(value);
    }
    /**
     * URLを分解、URLBuilderオブジェクトにパーツを収納する
     * @param obj
     * @param url
     */
    function parseURL(obj, url) {
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
    function parseQuery(obj, query) {
        const queries = query.split("&");
        queries.forEach((value) => {
            if (value.length == 0) {
                return;
            }
            const param = value.match(/^(.*?)(?:=(.*))$/);
            if (param) {
                obj.add(decode(param[1]), decode(param[2]));
            }
            else {
                obj.add(decode(value), undefined);
            }
        });
        return obj;
    }
    /**
     * URLBuilderオブジェクトをURL形式に変換する
     * @param obj
     */
    function buildURL(obj) {
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
    function buildQuery(obj) {
        const args = [];
        obj.keys.forEach((key) => {
            const values = obj.get(key);
            if (isNil(values)) {
                return;
            }
            for (let value of values) {
                if (isNil(value)) {
                    args.push(encode(key));
                }
                else {
                    args.push(encode(key) + "=" + encode(value));
                }
            }
        });
        return args.join("&");
    }
    /**
     * URLBuilderオブジェクト
     */
    class URLBuilder {
        /**
         * コンストラクタ
         * @param url
         */
        constructor(url = "") {
            this.scheme = "";
            this.user = "";
            this.password = "";
            this.host = "";
            this.port = "";
            this.path = "";
            this.hash = "";
            parseURL(this, url);
        }
        /**
         * オブジェクトをURL文字列に変換する
         */
        build() {
            return buildURL(this);
        }
        /**
         * 現在のURLからオブジェクトを作成する
         */
        current() {
            return new URLBuilder(window.location.toString() || "");
        }
    }
    exports.URLBuilder = URLBuilder;
    /**
     * QueryBuilderオブジェクト
     */
    class QueryBuilder {
        /**
         * コンストラクタ
         * @param query
         */
        constructor(query = "") {
            this.query = [];
            parseQuery(this, query);
        }
        /**
         * オブジェクトをクエリ文字列に変換する
         */
        build() {
            return buildQuery(this);
        }
        /**
         * 登録済みキーリストを取得する
         */
        get keys() {
            const keys = [];
            this.query.forEach((v) => {
                keys.push(v.key);
            });
            return keys;
        }
        /**
         * キーの数を返却する
         */
        get length() {
            return this.query.length;
        }
        /**
         * 対象キーが登録されている位置を返却する
         * @param key
         */
        indexOf(key) {
            return this.keys.indexOf(key);
        }
        /**
         * 対象キーが登録されているかを判定する
         * @param key
         */
        has(key) {
            return this.indexOf(key) >= 0;
        }
        /**
         * 対象キーの値を1つだけ、返却する
         * @param key
         */
        single(key) {
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
        get(key) {
            return this.getByIndex(this.indexOf(key));
        }
        /**
         * インデックス値で値を取得する
         * @param index
         */
        getByIndex(index) {
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
        set(key, ...value) {
            const index = this.indexOf(key);
            if (index < 0) {
                this.query.push({ key: key, value: value });
            }
            else {
                this.query[index] = { key: key, value: value };
            }
            return this;
        }
        /**
         * 設定したキーに値を追加する。
         * @param key
         * @param value
         */
        add(key, ...value) {
            const index = this.indexOf(key);
            if (index < 0) {
                this.query.push({ key: key, value: value });
            }
            else {
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
        drop(key) {
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
        merge(queries, replace = false) {
            if (isString(queries)) {
                queries = new QueryBuilder(queries);
            }
            const keys = queries.keys;
            for (let index = 0; index < keys.length; index++) {
                const key = keys[index], values = queries.get(key);
                if (values === null || values.length === 0) {
                    if (replace) {
                        this.drop(key);
                    }
                }
                else {
                    if (replace) {
                        this.set(key, ...values);
                    }
                    else {
                        this.add(key, ...values);
                    }
                }
            }
            return this;
        }
        /**
         * すべてのキーと値を削除する
         */
        clear() {
            this.query = [];
            return this;
        }
    }
    exports.QueryBuilder = QueryBuilder;
});
//# sourceMappingURL=index.js.map