if (Meteor.isServer) {

    Tinytest.add("typeof streamToBuffer === \"function\"", function(test) {
        test.equal(typeof streamToBuffer, "function");
    });

    Tinytest.addAsync("throw when no stream given", function(test, done) {
        try {
            var buffer = streamToBuffer();
            test.equal("did not throw", "did throw");
            done();
        } catch (err) {
            test.equal("did throw", "did throw");
            done();
        }
    });

    Tinytest.addAsync("throw when stream is not readable", function(test, done) {
        var stream = Npm.require("stream");
        var writeStream = new stream.Writable();

        try {
            var buffer = streamToBuffer(writeStream);
            test.equal("did not throw", "did throw");
            done();
        } catch (err) {
            test.equal("did throw", "did throw");
            done();
        }
    });

    Tinytest.addAsync("test with one chunk", function(test, done) {
        var stream = Npm.require("stream");

        var readStream = new stream.Readable();
        readStream.push("test");
        readStream.push(null);

        var buffer = streamToBuffer(readStream);
        test.equal(buffer.toString("ascii"), "test");
        done();
    });

    Tinytest.addAsync("test with multiple chunks", function(test, done) {
        var stream = Npm.require("stream");

        var readStream = new stream.Readable();
        readStream._read = function noop() { };
        for (var i = 0; i <= 10; i++) {
            (function(n) {
                setTimeout(function() {
                    if (n === 10) {
                        readStream.push(null);
                    } else {
                        readStream.push(n.toString());
                    }
                }, 10*n);
            })(i);
        }

        var buffer = streamToBuffer(readStream);
        test.equal(buffer.toString("ascii"), "0123456789");
        done();
    });

    Tinytest.addAsync("timeout when read takes too long", function(test, done) {
        var stream = Npm.require("stream");

        var readStream = new stream.Readable();
        readStream._read = function noop() { };
        setTimeout(function() {
            readStream.push("OK");
            readStream.push(null);
        }, 500);

        try {
            var buffer = streamToBuffer(readStream, 100);
            test.equal("did not throw", "did throw");
            done();
        } catch (err) {
            test.equal("did throw", "did throw");
            done();
        }
    });

    Tinytest.addAsync("do not time out with timeout=0", function(test, done) {
        var stream = Npm.require("stream");

        var readStream = new stream.Readable();
        readStream._read = function noop() { };
        setTimeout(function() {
            readStream.push("OK");
            readStream.push(null);
        }, 100);

        try {
            var buffer = streamToBuffer(readStream, 0);
            test.equal(buffer.toString("ascii"), "OK");
            test.equal("did not throw", "did not throw");
            done();
        } catch (err) {
            test.equal("did throw", "did not throw");
            done();
        }
    });

    Tinytest.addAsync("do not time out with timeout<0", function(test, done) {
        var stream = Npm.require("stream");

        var readStream = new stream.Readable();
        readStream._read = function noop() { };
        setTimeout(function() {
            readStream.push("OK");
            readStream.push(null);
        }, 100);

        try {
            var buffer = streamToBuffer(readStream, -1);
            test.equal(buffer.toString("ascii"), "OK");
            test.equal("did not throw", "did not throw");
            done();
        } catch (err) {
            test.equal("did throw", "did not throw");
            done();
        }
    });

    // Start a server to test HTTP client streams.
    var http = Npm.require("http");
    var server = http.createServer(function(req, res) {
        var url = req.url;

        switch (url) {
            case "/test1":
                res.write("OK");
                res.end();
                break;

            case "/test2":
                res.write("1");
                setTimeout(function() { res.write("2"); }, 10);
                setTimeout(function() { res.write("3"); }, 20);
                setTimeout(function() { res.write("4"); }, 30);
                setTimeout(function() { res.write("5"); }, 40);
                setTimeout(function() { res.end(); }, 50);
                break;
        }
    });

    var port = 10492;
    server.listen(port, "127.0.0.1");

    var requestToStream = Meteor.wrapAsync(function(requestOptions, callback) {
        var req = http.request(requestOptions, function(res) {
            callback(null, res);
        });
        req.end();
    });

    Tinytest.addAsync("GET /test1 (http stream)", function(test, done) {
        var httpStream = requestToStream({
            host: "localhost",
            port: port,
            path: "/test1"
        });
        var buffer = streamToBuffer(httpStream);
        test.equal(buffer.toString("ascii"), "OK");
        done();
    });

    Tinytest.addAsync("GET /test2 (http stream)", function(test, done) {
        var httpStream = requestToStream({
            host: "localhost",
            port: port,
            path: "/test2"
        });
        var buffer = streamToBuffer(httpStream);
        test.equal(buffer.toString("ascii"), "12345");
        done();
    });

} else {
    Tinytest.add("typeof streamToBuffer === \"undefined\"", function(test) {
        test.equal(typeof streamToBuffer, "undefined");
    });
}

