# craft-profile

A command-line tool for gathering Craft CMS Profiling data and reporting averages.


### Usage

The basic premise is you provide `craft-profile` with a `baseUrl` and a list of `paths` to visit (URLs are created by appending each `path` to the `baseUrl`) along with a few other parameters. `craft-profile` handles issuing all of the requests, parsing out the profile data, and then aggregating, averaging, and reporting the results.

By default `craft-profile` will print a nicely formatted table to `stdout`.

    $ ./bin/craft-profile -c config.json

    $ ./bin/craft-profile -b http://mysite.dev:3000 \
                         -p /,/foo,/bar,/baz/qux \
                         -i 20

    $ ./bin/craft-profile --base-url=http://localhost:3000 \
                          --paths=/,/foo,/bar,/baz/qux
                          --iterations=20

### Options/Flags:

|short|long|description|
|---|---|---|
-b|--baseUrl|Base URL that paths will be appended to
-p|--paths|Comma-separated list of paths, e.g. "/,/foo,/bar/baz"
-i|--iterations|How many times to load each page
-w|--workers|How much concurrency (how many workers)
-t|--timeout|How long to wait before bailing on a request
-d|--delay|How long to wait before initiating subsequent requests
-o|--output|File to write output to, if not specified the program output will be displayed in the terminal
-c|--config|Relative path to JSON config file (will override the above flags)
 |--verbose|Output additional information while running

This program also accepts a JSON config file on stdin and will output to the specified file if the program's output is redirected.
