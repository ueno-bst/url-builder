"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mocha_1 = require("mocha");
const chai_1 = require("chai");
const index_1 = require("../index");
mocha_1.describe("QueryBuilder Test", () => {
    mocha_1.it("Full URL", () => {
        const url = "http://test.com/path?query_args=example#hash";
        const object = new index_1.URLBuilder(url);
        chai_1.assert.equal(object.build(), url);
    });
    mocha_1.it("Domain Only", () => {
        const i = new index_1.URLBuilder("test.com");
        chai_1.assert.equal(i.build(), "test.com");
    });
    mocha_1.it("Domain + Port", () => {
        const url = "test.com:80";
        const object = new index_1.URLBuilder(url);
        chai_1.assert.equal(object.build(), url);
    });
    mocha_1.it("Schema + User + Password + Domain + Port", () => {
        const url = "https://user:password@test.com:4080/";
        const object = new index_1.URLBuilder(url);
        chai_1.assert.equal(object.build(), url);
    });
    mocha_1.it("User + Password + Domain + Port", () => {
        const url = "user:password@test.com:4080";
        const object = new index_1.URLBuilder(url);
        chai_1.assert.equal(object.build(), url);
    });
    mocha_1.it("Set Query 1", () => {
        const url = "test.com:4000/index";
        const object = new index_1.URLBuilder(url);
        object.query.set("bool", "");
        object.query.set("string", "text");
        object.query.set("number", "123");
        object.query.set("float", "124.333");
        object.query.set("array", "1", "2", "3");
        chai_1.assert.equal(object.build(), "test.com:4000/index?bool=&string=text&number=123&float=124.333&array=1&array=2&array=3");
    });
});
//# sourceMappingURL=query.test.js.map