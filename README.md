# Kajero

Interactive JavaScript notebooks with clever graphing.

You can view a sample notebook [here](http://www.joelotter.com/kajero).

![](https://github.com/JoelOtter/kajero/blob/master/doc/screenshot.png)

## Installation

`npm install -g kajero`

## Commands

You can generate new notebooks directly from Markdown files without using the web editor.

#### `kajero html [file.md]`

Will output generated HTML of a new notebook. You can pipe it to a file like this:

`kajero html [file.md] > output.html`

#### `kajero publish [file.md]`

Will publish your notebook as a gist, and return a unique URL to your new notebook.
