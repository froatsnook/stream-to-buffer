Read entire Stream into a Buffer (server only)

Example
=======
    // The package `node-canvas` provides jpeg data as a stream.  We need a
    // buffer to store in the database.
    var stream = canvas.jpegStream();
    var buffer = streamToBuffer(stream);
    Products.update(productId, {
        $set: {
            thumb: buffer
        }
    });

Why?
====
If you're working with some random package from npm (think `request`,
`node-canvas`, `csv-parse`) there's a good chance it will provide a stream
API.  Using `stream-to-buffer` means you don't have to use `Meteor.wrapAsync`
every time.

This is fiber friendly.  The point is that you don't need any callbacks to get
all the data from the stream.  If you're worried about hanging, use the second
(optional) timeout parameter.

How?
====
Data is buffered while the stream emits "data" events.  Then it is
concatenated and returned when the stream emits the "end" event.

Setup
=====
* Install `meteor install froatsnook:buffer-to-stream`

API
===
    // Convert a Stream to a Buffer.
    var buffer = streamToBuffer(stream);

    // Convert a Stream to a Buffer, but time out (by throwing an Error) after
    // 30 seconds if the stream doesn't emit an "end" event.
    try {
        var buffer = streamToBuffer(stream, 30000); // ms
    } catch(err) {
        console.log("Timed out (or other error): " + err);
    }

License
=======
MIT

