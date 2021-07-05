# sendTexts
Send a text message to members of a list.

## Setup
This is a node script and requires a recent version of node.  I am using v15.9.0 at the point of writing.  

Install node on a Mac: https://nodejs.org/en/download/

It also requires apple script.

## Usage
For the skip lists below, numbers are trimmed such that there is no leading or trailing whitespace and all parenthesis, dashes, spaces, and dots are removed before comparing with numbers in the skip list.

<ul>
<li>Use `LandLineList.json` to skip sending messages to those numbers that you find out are unable to recieve text messages.  
<li>Use `SkipList.json` to skip sending messages to those numbers that respond to you that they wish you would not send them messages. 
</ul>

The [ExampleOnly.json](./ExampleOnly.json) file is a list of names that will be the only names from your list that will receive your text message.  This is optional.

Confirm by using `-dry` before sending to see who will receive your message.

Also, it is recommended that you try texting yourself using the `-names:<my name>` option to reduce the sending just to yourself.  

The script uses SMS to send the message.

<pre>
Usage: node sendAllMessages.js [options]

Example: node sendAllMessages.js -adults -men -list:FullList.json -hi -message:"hey, any update on your ministering?" -dry

Uses iMessages to send a text message to members on the specified list from your phone number.

Other required files:

LandLineList.json......The list of phone numbers that are known to be unable to recieve text messages.
SkipList.json..........The list of phone numbers whose owners have asked to not recieve any more messages.

Groups to send to:

-adults................Include members ages 18 and over.
-children..............Include members ages 11 and under.
-elders................Include members who hold the Melchizedek Priesthood.
-men...................Include male members.
-women.................Include female members.
-youth.................Include members ages 12 to 17.

Who to send to:

-list:file...........The membership list in JSON format. This is required.
-name:name...........Filter to members whose names include the given substring.
-only:list...........Limit the message to the list of members whose names appear in list.  Format is a JSON array of strings.  The entries must match the member's preferred name.

Help understanding what is going to happen:

-dry...................Do everything but send the message.
-help..................Print this help file.
-v.....................Verbose output.

The message:

-hi....................Include a personalized salutation using the member's first name, such as: "Hi Fred --".
-message:"message".....The message to send to the included members.  Be sure to put double quotes around a message that includes spaces.

What happened:

-noSummary.............Exclude the summary at the end.
-summary:blocked.......Include the summary of members that were excluded because their number is in ./SkipList.json
-summary:invalid.......Include the summary of members that were excluded because their number is in ./LandLineList.json
-summary:unknown.......Include the summary of members that had no valid phone number in the list.
-summary:sent..........Include the summary of members that had a message sent to them.
</pre>

## How to get the JSON list you want to use to send your messages

Getting the JSON list is up to you.  For some data providers, I recommend logging into your data provider with your username and password, navigating to the list page, opening the Chrome debugging tools by pressing `F12`, navigating to the network tab in the debugging tools and then selecting the operation with name 'member-list'.  The Response window will contain the list.  Copy this and paste it into a file and use it directly.

## Known issues

If you end your message with an '!' such as "This is an exciting message!" you should put a space between the '!' and the '"' like this: -message:"This is an exciting message! ".  

