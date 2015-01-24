if (Meteor.isServer) {
    var asyncRead = function _streamToBuffer(stream, timeout, callback) {
        // If called with 2 args, use default timeout (no timeout).
        if (typeof timeout === "function") {
            callback = timeout;
            timeout = 0;
        }

        if (!stream || typeof stream !== "object") {
            callback("streamToBuffer: first argument must be a stream.");
            return;
        }

        if (!stream.readable) {
            callback("streamToBuffer: only works on readable streams.");
            return;
        }

        // Can avoid an additional loop during Buffer.concat by keeping track
        // of the length.
        var totalLength = 0;

        // Make sure the callback isn't called twice.
        var returned = false;

        // As data is read, append buffers onto an Array.
        var buffers = [];
        stream.on("data", function(data) {
            buffers.push(data);
            totalLength += data.length;
        });

        // Concatenate buffers and return with success when "end" event is
        // emitted.
        stream.on("end", function() {
            if (returned) {
                return;
            }

            var buffer = Buffer.concat(buffers, totalLength);
            returned = true;
            callback(null, buffer);
        });

        // Forward any stream errors.
        stream.on("error", function(err) {
            if (returned) {
                return;
            }

            returned = true;
            callback(err);
        });

        // Prepare timeout (if provided by caller).
        if (typeof timeout === "number" && timeout > 0) {
            Meteor.setTimeout(function() {
                if (returned) {
                    return;
                }

                returned = true;
                callback("streamToBuffer: timed out");
            }, timeout);
        }
    };

    // Export streamToBuffer.
    if (typeof Meteor.wrapAsync !== "undefined") {
        streamToBuffer = Meteor.wrapAsync(asyncRead);
    } else {
        streamToBuffer = Meteor._wrapAsync(asyncRead);
    }
}

