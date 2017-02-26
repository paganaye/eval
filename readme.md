Eval 
====

Eval aim is to create a language to build websites.

It is nowhere near to be available for public release.
When ready, a demo of the language will be available at [eval.ganaye.com/demo](http://eval.ganaye.com/demo|)

If you're interested in this, here are the instructions to get and run it on your own machine.

Usage
=====
There are 3 ways to use Eval:
   - as a user 
   - as a site designer
   - as a contributor 


Users Documentation
===================
There is no special instruction to use a site made with Eval.
I am going to put some commands here however that can be used by site designers but also power users.
<http://eval.ganaye.com/usage>

Site designer Documentation
===========================
The site designer documentation is available at this address:
<http://eval.ganaye.com/design>

Contributor Documentation
=========================
If you're a already creating sites with eval. You might want to go a step further modify the way Eval work.
This is what contributors do.

1 - Prerequisites
------------------
Install the following prerequisites and check their versions:

   `node --version` (6.9.5 minimum)

   `npm --version` (4.2.0 minimum)


2 - Get source and dependencies
-------------------------------

`git clone https://github.com/paganaye/eval.git`

`cd eval`

`npm install`

you'll see a few red and yellow line.
ignore them


3 - Compile the source and run a development server
---------------------------------------------------
Fuse is what node use to compile the source and run the development web server.
You only have to run:

`./fuse.js`

4 - Enjoy
---------

Open a browser at this address <http://localhost:4444/>

You should see a blank page with the Eval console.


