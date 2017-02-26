Design
======

In eval you do everything from the command line.

Rather than writing an exhaustive documentation (of something that doesn't exist yet by the way), I am going to write a story.

Leia loves the YoKai watch games. 
She would like to build a site to show her toys and exchange some of the items.

First she login into sites.ganaye.com.
Her userid is leia.

The black consolse appears.
And this is how it starts.


`create site yokai`

The page will be accessible at <http://sites.ganaye.com/leia/yokai>


> Now that the site is created, she can return to it using the select command `select site yokai`


The site will contain toys. So let's create a page for them.

`create page toys as list of toy`

The site now contains a page toys accessible at this address <http://sites.ganaye.com/leia/yokai/toys>

> Internally the site understood that a table of toys needed to be created. So it automatically used the command `create table toys of toy`.

> Later Leia will use the command `select table toys` to return to a table and amend it.


At this stage the toys table contains no data and no column.
We want to add a few fields to the table.

`add field name`

`add field description as multiLine`

`add field photo as picture`

Then to see what it looks like she enter a few items directly from the console.

`create toy name Jibanyan description "Jibanyan is a Charming Tribe cat Yo-kai, specifically a nekomata."`

And another

`create toy name Komasan description "A Charming Tribe lion dog Yo-kai from the countryside."`

Adding pictures is not easy from the command line.
So she visit the page <http://sites.ganaye.com/leia/yokai> and add the pictures there.

The result is not that great.

So we want to see a nice layout.

`update page toys`














