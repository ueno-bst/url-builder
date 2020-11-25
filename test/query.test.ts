import {describe, it} from "mocha";
import {assert} from "chai";
import {URLBuilder} from "../index";

describe("QueryBuilder Test", () => {
    it("Full URL", () => {
        const url = "http://test.com/path?query_args=example#hash";
        const object = new URLBuilder(url);
        assert.equal(object.build(), url);
    });

    it("Domain Only", () => {
        const i = new URLBuilder("test.com");
        assert.equal(i.build(), "test.com");
    });

    it("Domain + Port", () => {
        const url = "test.com:80";
        const object = new URLBuilder(url);
        assert.equal(object.build(), url);
    });

    it("Schema + User + Password + Domain + Port", () => {
        const url = "https://user:password@test.com:4080/";
        const object = new URLBuilder(url);
        assert.equal(object.build(), url);
    });

    it("User + Password + Domain + Port", () => {
        const url = "user:password@test.com:4080";
        const object = new URLBuilder(url);
        assert.equal(object.build(), url);
    });

    it("Set Query 1", () => {
        const url = "test.com:4000/index";
        const object = new URLBuilder(url);

        object.query.set("bool", "");
        object.query.set("string", "text");
        object.query.set("number", "123");
        object.query.set("float", "124.333");
        object.query.set("array", "1", "2", "3");

        assert.equal(object.build(), "test.com:4000/index?bool=&string=text&number=123&float=124.333&array=1&array=2&array=3");
    });
});

