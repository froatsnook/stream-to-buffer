Package.describe({
    name: "froatsnook:stream-to-buffer",
    summary: "Read entire Stream into a Buffer (server only)",
    version: "1.0.1",
    git: "https://github.com/froatsnook/streamToBuffer"
});

Package.onUse(function(api) {
    api.versionsFrom("0.9.2");
    api.addFiles("lib/streamToBuffer.js");
    api.export("streamToBuffer", "server");
});

Package.onTest(function(api) {
    api.use("tinytest");
    api.use("froatsnook:stream-to-buffer");

    api.addFiles("test/streamToBuffer-tests.js");
});

