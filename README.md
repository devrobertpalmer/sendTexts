# sendTexts
Send a text message to members of a list.

## Setup
This is a node script and requires a recent version of node.  I am using v15.9.0 at the point of writing.  

Install node on a Mac: https://nodejs.org/en/download/

It also requires apple script.

## Usage
<pre>
Usage: node sendAllMessages.js [options]

Example: node sendAllMessages.js -adults -men -list:FullList.json -hi -message:"hey, any update on your ministering?" -dry

Uses iMessages to send a text message to members on the specified list.

Other required files:

LandLineList.json......The list of phone numbers that are known to be unable to recieve text messages.

SkipList.json..........The list of phone numbers who'se owners have asked to not recieve any more messages.

Groups to send to:

-adults................Include members ages 18 and over.

-children..............Include members ages 11 and under.

-elders................Include members who hold the Melchezedek Priesthood.

-men...................Include male members.

-women.................Include female members.

-youth.................Include members ages 12 to 17.

Who to send to:

-list:<file>...........The membership list in JSON format. This is required.

-name:<name>...........Filter to members who'se names include the given substring.

-only:<list>...........Limit the message to the list of members who'se names appear in <list>.  Format is a JSON array of strings.  The entries must match the member's preferred name.

Help understanding what is going to happen:

-dry...................Do everything but send the message.

-help..................Print this help file.

-v.....................Verbose output.


The message:

-hi....................Include a personalized salutation using the member's first name, such as: "Hi Fred --".

-message:<message>.....The message to send to the included members.  Be sure to put double quotes around a message that includes spaces.


What happened:

-noSummary.............Exclude the summary at the end.

-summary:blocked.......Include the summary of members that were excluded because their number is in ./SkipList.json

-summary:invalid.......Include the summary of members that were excluded because their number is in ./LandLineList.json

-summary:unknown.......Include the summary of members that had no valid phone number in the list.

-summary:sent..........Include the summary of members that had a message sent to them.
</pre>
