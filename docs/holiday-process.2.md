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

* We need some fields to be edited only by program or certain users.

... seems awfully complex.
Perhaps we could just deal with access rights at table level.

* need a way to send/receive emails or messages

drop that we send links to pages this way it works on email but also sms tweets...

* we need user messaging with structured data inside

* we need better historization

* we need an offline mode

So
==

Let's do login

and let's do messages

I am overly keen in tying it exclusively to firebase but this is an easy start and we plan to be multi-database at some point.














