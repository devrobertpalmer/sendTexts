const fs = require('fs')
const { exec } = require('child_process')

let memberList = './TestList.json'
let skipList = '../SkipList.json'
let landLineList = '../LandLineList.json'
let men = false
let women = false
let adults = false
let youth = false
let eldersOnly = false
let verbose = false
let dry = false
let messageCount = 0
let nameFilter = 'ALL'
let includeHi = false
let message = "This is a test message."
let service = 'SMS'
let summary = true
let listBlocked = false
let listInvalid = false
let listSent = false
let listUnknown = false
let useOnlyList = false
let onlyList = './OnlyList.json'
let sentMembersPreferredName = []

function getValue(theArg) {
    return theArg.substring(theArg.indexOf(':') + 1)
}

function printHelp() {
    console.log("Usage: node sendAllMessages.js [options]");
    console.log("Example: node sendAllMessages.js -adults -men -list:FullList.json -hi -message:\"hey, any update on your ministering?\" -dry");
    console.log("Uses iMessages to send a text message to members on the specified list.");
    console.log();
    console.log("Other required files:");
    console.log("LandLineList.json......The list of phone numbers that are known to be unable to recieve text messages.");
    console.log("SkipList.json..........The list of phone numbers who'se owners have asked to not recieve any more messages.");
    console.log();
    console.log("Groups to send to:");
    console.log("-adults................Include members ages 18 and over.");
    console.log("-children..............Include members ages 11 and under.");
    console.log("-elders................Include members who hold the Melchezedek Priesthood.");
    console.log("-men...................Include male members.");
    console.log("-women.................Include female members.");
    console.log("-youth.................Include members ages 12 to 17.");
    console.log();
    console.log("Who to send to:");
    console.log("-list:<file>...........The membership list in JSON format. This is required.");
    console.log("-name:<name>...........Filter to members who'se names include the given substring.");
    console.log("-only:<list>...........Limit the message to the list of members who'se names appear in <list>.  Format is a JSON array of strings.  The entries must match the member's preferred name.");
    console.log();
    console.log("Help understanding what is going to happen:");
    console.log("-dry...................Do everything but send the message.");
    console.log("-help..................Print this help file.");
    console.log("-v.....................Verbose output.");
    console.log();
    console.log("The message:");
    console.log("-hi....................Include a personalized salutation using the member's first name, such as: \"Hi Fred --\".");
    console.log("-message:<message>.....The message to send to the included members.  Be sure to put double quotes around a message that includes spaces.");
    console.log();
    console.log("What happened:");
    console.log("-noSummary.............Exclude the summary at the end.");
    console.log("-summary:blocked.......Include the summary of members that were excluded because their number is in ./SkipList.json");
    console.log("-summary:invalid.......Include the summary of members that were excluded because their number is in ./LandLineList.json");
    console.log("-summary:unknown.......Include the summary of members that had no valid phone number in the list.");
    console.log("-summary:sent..........Include the summary of members that had a message sent to them.");
}

process.argv.forEach(arg => {
    if (arg.includes('-list:')) {
        memberList = getValue(arg);
    }
    if (arg.includes('-v')) {
        verbose = true;
    }
    if (arg.includes('-men')) {
        men = true;
    }
    if (arg.includes('-women')) {
        women = true;
    }
    if (arg.includes('-adults')) {
        adults = true;
    }
    if (arg.includes('-youth')) {
        youth = true;
    }
    if (arg.includes('-children')) {
        children = true;
    }
    if (arg.includes('-elders')) {
        eldersOnly = true;
    }
    if (arg.includes('-dry')) {
        dry = true;
    }
    if (arg.includes('-name:')) {
        nameFilter = getValue(arg);
    }
    if (arg.includes('-hi')) {
        includeHi = true;
    }
    if (arg.includes('-message:')) {
        message = getValue(arg);
    }
    if (arg.includes('-noSummary')) {
        summary = false;
    }
    if (arg.includes('-summary:blocked')) {
        listBlocked = true;
    }
    if (arg.includes('-summary:invalid')) {
        listInvalid = true;
    }
    if (arg.includes('-summary:unknown')) {
        listUnknown = true;
    }
    if (arg.includes('-summary:sent')) {
        listSent = true;
    }
    if (arg.includes('-only:')) {
        useOnlyList = true;
        onlyList = getValue(arg);
    }
    if (arg.includes('-help')) {
        printHelp();
        process.exit(0);
    }
})

if (!fs.existsSync(memberList)) {
    console.log('Input file is not on the file system: ' + memberList);
    process.exit(1);
}

if (!fs.existsSync(skipList)) {
    console.log('Skip list is not on the file system: ' + skipList);
    process.exit(1);
}

let includeList = [];
if (useOnlyList) {
    includeList = JSON.parse(fs.readFileSync(onlyList, 'utf8'));
}

function include(member) {
    let gender = false;
    let age = false;
    let priesthood = false;
    let name = false;
    let shouldSkip = false;
    let use = false;
    if (men) {
        if (member.sex == 'M') {
            gender = true;
        }
    }
    if (women) {
        if (member.sex == 'F') {
            gender = true;
        }
    }
    if (adults && !youth) {
        if (member.age >= 18) {
            age = true
        }
    }
    if (youth && ! adults) {
        if (member.age < 18 && member.age >= 12) {
            age = true;
        } 
    }
    if (youth && adults) {
        age = true;
    }
    if (eldersOnly) {
        if (member.priesthoodOffice == 'ELDER' || member.priesthoodOffice == 'HIGH_PRIEST') {
            priesthood = true;
        }
    } else {
        priesthood = true;
    }
    if (nameFilter != 'ALL') {
        if (member.nameFormats.listPreferredLocal.includes(nameFilter)) {
            name = true;
        }
    } else {
        name = true;
    }
    if (verbose) {
        console.log("person: " + member.nameFormats.listPreferredLocal + " gender: " + gender + " age: " + age + " priesthood: " + priesthood + " name: " + name);
    }
    if (useOnlyList) {
        for (var i = 0; i < includeList.length; i++) {
            if (member.nameFormats.listPreferredLocal.includes(includeList[i])) {
                use = true;
                sentMembersPreferredName.push(includeList[i]);
                break;
            }
        }
    } else {
        use = true;
    }
    return gender && age && priesthood && name && use;
}

function sanitizePhoneNumber(phoneNumber) {
    if (phoneNumber == null) {
        return null;
    }
    let justNumber = phoneNumber.replaceAll(" ", "").replaceAll("(", "").replaceAll(")", "").replaceAll("-", "").replaceAll(".", "");
    if (justNumber.charAt(0) == '1') {
        justNumber = justNumber.substring(1);
    }
    return justNumber;
}

try {
    const members = JSON.parse(fs.readFileSync(memberList, 'utf8'));
    const skip = JSON.parse(fs.readFileSync(skipList, 'utf8'));
    const landLines = JSON.parse(fs.readFileSync(landLineList, 'utf8'));
    let skippedMembers = [];
    let invalidMembers = [];
    let noMembers = [];
    let sentMembers = [];
    let alreadySent = [];
    if (verbose) {
        console.log(members);
    }
    members.forEach(member => {
        if (include(member)) {
            let phoneNumber = member.phoneNumber;
            if (phoneNumber == null) {
                phoneNumber = member.householdPhoneNumber;
            }
            let sanitizedNumber = sanitizePhoneNumber(phoneNumber);
            const fullName = member.nameFormats.givenPreferredLocal  + " " + member.nameFormats.familyPreferredLocal;
            if (sanitizedNumber == null) {
                if (verbose) {
                    console.log("No phone number for " + fullName);
                }
                noMembers.push(fullName);
            } else if (landLines.includes(sanitizedNumber)) { 
                if (verbose) {
                    console.log("Skipping " + fullName + " due to " + phoneNumber + " being a known land line.");
                }
                invalidMembers.push(fullName);
            } else if (skip.includes(sanitizedNumber)) {
                if (verbose) {
                    console.log("Skipping " + fullName + " due to skip list at " + skipList);
                }
                skippedMembers.push(fullName);
            } else if (sanitizedNumber.length != 10) {
                console.log("Skipping " + fullName + " due to invalid number length " + sanitizedNumber);
            } else if (alreadySent.includes(sanitizedNumber)) {
                console.log("Skipping " + fullName + " because " + sanitizedNumber + " has already received a text.");
            } else  {
                console.log("Sending message to " + fullName + " at " + sanitizedNumber);
                let messageToSend = message;
                if (includeHi) {
                    let firstName = member.nameFormats.givenPreferredLocal;
                    if (firstName.includes(' ')) {
                        firstName = firstName.split(' ')[0];
                    }
                    messageToSend = 'Hi ' + firstName + " -- " + message;
                }
                if (verbose) {
                    console.log("Message: " + messageToSend);
                }
                alreadySent.push(sanitizedNumber);
                if (!dry) {
                    exec('/usr/bin/osascript sendMessage.scpt ' + sanitizedNumber + ' "' + messageToSend + '"', (err, stdout, stderr) => {
                        if (err) {
                            console.log("Error: " + err);
                        } else {
                            if (stdout != null && stdout.length > 0) {
                                console.log("Stdout: " + stdout);
                            }
                            if (stderr != null && stderr.length > 0) {
                                console.log("Stderr: " + stderr);
                            }
                        }
                    });
                }
                sentMembers.push(fullName);
            }
        }
    });
    if (summary) {
        console.log("Total messages sent: " + sentMembers.length);
        console.log("Total messages blocked: " + skippedMembers.length);
        console.log("Invalid phone numbers: " + invalidMembers.length);
        console.log("No known phone number: " + noMembers.length);
        if (listBlocked) {
            console.log("Members who have requested no texts:");
            skippedMembers.forEach(person => console.log(person));
        }
        if (listInvalid) {
            console.log("Members with numbers that cannot recieve text messages:");
            invalidMembers.forEach(person => console.log(person));
        }
        if (listUnknown) {
            console.log("Members with no valid number:");
            noMembers.forEach(person => console.log(person));
        }
        if (listSent) {
            console.log("Members that seem to have recieved the text:");
            sentMembe
            rs.forEach(person => console.log(person));
        }
        if (useOnlyList && !sentMembersPreferredName.length > 0) {
            console.log("Members on the only list that did not recieve the text:");
            includeList.forEach(person => {
                if (!sentMembersPreferredName.includes(person)) { 
                    console.log(person); 
                }
            });
        }
    }


} catch (err) {
    console.error(err);
}
