# craft-profile

A command-line tool for gathering Craft CMS Profiling data and reporting averages.


### Usage

    $ ./bin/craft-profile -c config.json

    $ .bin/craft-profile -b http://mysite.dev:3000 \
                         -p /,/foo,/bar,/baz/qux \

### Options/Flags:

|short|long|description|
|---|---|---|
-b|--baseUrl|Base URL that paths will be appended to
-p|--paths|Comma-separated list of paths, e.g. "/,/foo,/bar/baz"
-i|--iterations|How many times to load each page
-w|--workers|How much concurrency (how many workers)
-t|--timeout|How long to wait before bailing on a request
-d|--delay|How long to wait before initiating subsequent requests
-v|--verbose|Output additional information while running
-o|--output|File to write output to, if not specified the program output will be displayed in the terminal
-c|--config|Relative path to JSON config file (will override the above flags)

This program also accepts a JSON config file on stdin and will output to the specified file if the program's output is redirected.
