# Holiday Process II

I have made some progress on the JSON display area.

I am wondering how hard it would be to make a holiday request website using the current framework and fix as I go along.

First I need employees.

    #update table holidays
        lastname string
        holidayUsed number
        holidayPending number
        holidayLeft number default value 25
        history array of object
            requestDate date
            from date
            to date
            nbDaysRequested number
            status (select)
                - pending
                - accepted
                - rejected
    

Then we can edit our first user

    #update holidays pascal





What next?
==========

Erratum: This is turning into a todo list.


* we need user messaging with structured data inside

* we need better historization

* we need an offline mode

* we need a state machine
    
✔ Login
========

Done through firebase.
I am overly keen in tying it exclusively to firebase but this is an easy start and we plan to be multi-database at some point.

(in progress) Messaging / Notifications
=========================

We need a way to send/receive emails or messages.
Drop that we send links to pages this way it works on email but also sms tweets...

So we need to be able to send a message to a user.
And we need a notification system with action buttons.

> going a bit further on this. I don't want notification to be specific. The are plenty of building blocks that could be used more generically.

> So we nned buttons but lets make them generic.

> Also we need to be able to show a form coming from some other page but lets make it generic too.

Buttons
=======

We should have a new control type for button
It is not harder to make a button bar so we'll do it.


Frame
=====
When we are in a page we need to be able to display a "frame" that write to a different path.

Read/Write access
=================

We need some fields to be edited only by program or certain users.
I want to keep the ganularity low
Perhaps for each table we have a user group for readers and a user group for writers.


user groups
===========
a user can be part of a set of user groups.
minimally the group guest 
then the group user for logged in users
then some more
and finally admin


historization
=============
* we need better historization

Offline mode
============
* we need an offline mode

State machine
=============
* we need a state machine
A flow is a page.
A flow contains steps.
A flow can split and merge.
I can see graphcet coming

........
========
