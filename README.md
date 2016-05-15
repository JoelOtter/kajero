# Kajero

Interactive JavaScript notebooks with clever graphing.

You can view a sample notebook [here](http://www.joelotter.com/kajero).

![](https://github.com/JoelOtter/kajero/blob/master/doc/screenshot.png)

## Features

- It's just Markdown - a Kajero notebook is just a Markdown document with a script attached.
- Every notebook is fully editable in the browser, and can be saved as Markdown or HTML.
- Notebooks can also be published as Gists, generating a unique URL for your notebook.
- JavaScript code blocks can be executed. They're treated as functions, with their return value visualised. Kajero can visualise arrays and objects, similar to the Chrome object inspector.
    - Code blocks can be set to run automatically when the notebook loads. They can also be set to hidden, so that only the result is visible.
- Data sources can be defined. These will be automatically fetched when the notebook is loaded, and made available for use inside code blocks.
- Includes [Reshaper](https://github.com/JoelOtter/reshaper), for automatic reshaping of structured data.
- Includes D3, NVD3 and [Jutsu](https://github.com/JoelOtter/jutsu), a very simple graphing library which uses Reshaper to transform arbitrary data into a form that can be graphed.

### Related projects

- [Reshaper](https://github.com/JoelOtter/reshaper) - reshape data to match a schema
- [Smolder](https://github.com/JoelOtter/smolder) - a library wrapper that attempts to reshape data going into your functions, using Reshaper
- [Jutsu](https://github.com/JoelOtter/jutsu) - a simple graphing library, with support for Smolder

## Note on contributions

Kajero is part of my master's project at Imperial College London. Please do file issues if you have feedback or find bugs. However, as it needs to be my own work, I won't be able to merge any pull requests until the end of June. Apologies for the inconvenience!

## Command-line tools

Kajero includes a couple of simple command-line tools for users who don't want to use the inline editor to create their notebooks.

### Installation

`npm install -g kajero`

### Commands

You can generate new notebooks directly from Markdown files without using the web editor.

- #### `kajero html [file.md]`

Will output generated HTML of a new notebook. You can pipe it to a file like this:

`kajero html [file.md] > output.html`

- #### `kajero publish [file.md]`

Will publish your notebook as a gist, and return a unique URL to your new notebook.
