Easy Commands
========

We want a command line type of commands with as little punctuation as possible.
It has to support:
   - unnamed parameters
   - named parameters
   - optional parameters
   - string/number/other litterals
   - array litterals
   - map litterals
For a while I thought of YAML but I don't want my users to have to learn yet another syntax.

JSON would be easier to learn. 

So I am implementing a very lose dialect of javascript but more forgiving.

Technically commands take a single object as parameter.

Simple Commands
---------------
ie:
`Print { "Message":"Hello World" }̀`

   
But we want to make JSON very lenient
   - keywords are case insensitive
   - optionnal brackets
   - brackets can be replaced by parenthesis
   - optionnal member names
   - optionnal commas
   - optionnal quotes
To allow optionnal members, the index of the parameter is used to guess the label.

We end up with:
`Print Hello World`

More advanced Commands
----------------------
ie:
`Printf { "Message":"Hello {name}", "args":{"name":"World"} }̀`


Minimally we end up with:
`Print "Hello {name}" {name:World}`

Here the quotes on the first string are required because it contains a curly bracket.


