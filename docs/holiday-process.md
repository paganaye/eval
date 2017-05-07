# Holiday Process

The holiday process is a somewhat advanced process.
Each employe get allocated 25 days holiday per year.


In Eval there is no files. Everything is a command.
So we should be able to write this entire process through a series of commands.

The site will be <http://docs.ganaye.com/holidays>.

## Step 1 - Screens

We have 3 main pages:

 1) the `Employee Holidays Summary` page

This is where employees can see their remaining days for the year and the status of past requests.
The url will be: <http://docs.ganaye.com/holidays/summary>
The user should be able to cancel a holiday he might have posted earlier.

If an admin want to see an individual user summary page. 
He must the an extra `user` query parameter: <http://docs.ganaye.com/holidays/summary?user=123>

 2) the `Holiday Request` page 
 
This is the page where employees can request a new holiday or update a pending holiday request.
The url will be for example: <http://docs.ganaye.com/holidays/request/123>.

The page will contain the `starting date`, the `end date` and the `number of days` requested.


 3) the `Employee List` page where administrators can see all the employee and edit them.

The system sends email to relevant parties when something happens;

## Step 2 - Tables

How many pages do I need to create?
We could have:

   - Employee

    | Employee | Name          | RemainingDays |
    |----------+---------------+---------------|
    | l        | Pascal GANAYE | 20            |
    | 2        | Donald TRUMP  | 17            |
    | 3        | Angela Merkel | 11            |
    
   - HolidayRequest

    | Employee | Employee | DateFrom   | NbDays | Status   |
    |----------+----------+------------+--------+----------|
    | l        | 1        | 2017-01-01 | 3      | Pending  |
    | 2        | 2        | 2017-01-15 | 4      | Granted  |
    | 3        | 3        | 2017-02-23 | 15     | Rejected |

In this scenario however we want each employee to have his own login and password.  
In that case, it is just simpler not to create an `employee` table but to extend the built-in `user` table.

## Step 3 - Emails

The process uses emails to notifiy parties of new request or status changes.
We'll detail about that as we go along.

# Think again
This should be the "wiki" of web-app.

`define table HolidayRequest ( DateFrom:"date"  DateTo:"date"  
NbDays:"integer" status:("enum" ))`

`define field holidayRequest.status`

`define field user.holidaysLeft`
