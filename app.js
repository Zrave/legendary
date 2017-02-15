const Discord = require('discord.js');
const client = new Discord.Client();
var request = require('request');
var moment = require('moment');

client.on('ready', () = > {
    console.log('I am ready!');
});

client.on('message', message = > {

if (message.content && message.content.startsWith('!lkp')) {
    var subjectTokens = message.content.split(" ");
    if (subjectTokens.length === 2) {
        var subject = subjectTokens[1];
        var armoryTokens = subject.split("/");
        var realm = 'us', server = 'sargeras', char;
        if (armoryTokens.length === 3) {
            realm = armoryTokens[0];
            server = armoryTokens[1];
            char = armoryTokens[2];
        } else if (armoryTokens.length === 2) {
           server = armoryTokens[0];
            char = armoryTokens[1];
        } else if (armoryTokens.length === 1) {
            char = armoryTokens[0];
        }
        if (!char) {return;}

        var url = 'https://'+realm+'.api.battle.net/wow/character/'+server +'/'+char+'?fields=progression,achievements,statistics&apikey=kr2bfgpv5wtx5entzwkvvq6kqpwfwg7e';
        request(url, function (error, response, body) {
            console.log(response.statusCode) // 200
            console.log(response.headers['content-type']) // 'image/png'
            var info = JSON.parse(body);
            console.log(info.name);
            var killpoints = getKillpoints(info);
            message.reply(estimate(killpoints));
        });
    }
}
});

function getKillpoints(json, chests, emissaries) {
    return Math.round(getDailyKillpoints(json.achievements, emissaries) + getWeeklyChestKillpoints(json.achievements, chests) + getDungeonKillpoints(json) + getRaidKillpoints(json.progression.raids));
}

function getDailyKillpoints(achievements, emissaries) {
    var killpoints = 0;

    var index = achievements.achievementsCompleted.indexOf(10671);

    if (index >= 0) {
        var days110 = emissaries || moment(new Date()).diff(achievements.achievementsCompletedTimestamp[index], 'days');

        killpoints += days110 * 4;
    }

    return killpoints;
}

function getWeeklyChestKillpoints(achievements, chests) {
    var killpoints = 0;

    var index = achievements.achievementsCompleted.indexOf(10671);

    if (index >= 0) {
        var weeklyChests = chests || moment().diff(moment.max(CHEST_AVAILABLE, moment(achievements.achievementsCompletedTimestamp[index])), 'weeks');

        killpoints += weeklyChests * 15;
    }

    return killpoints;
}

function getDungeonKillpoints(json) {
    var normalDungeons = 0;
    var heroicDungeons = 0;
    var mythicDungeons = 0;

    json.statistics.subCategories.find(subCategory = >
    subCategory.id == 14807
).
    subCategories.find(subCategory = > subCategory.id == 15264
).
    statistics.forEach(dungeon = > {
        normalDungeons += (NORMAL_DUNGEONS.indexOf(dungeon.id) < 0) ? 0 : dungeon.quantity;
    heroicDungeons += (HEROIC_DUNGEONS.indexOf(dungeon.id) < 0) ? 0 : dungeon.quantity;
    mythicDungeons += (MYTHIC_DUNGEONS.indexOf(dungeon.id) < 0) ? 0 : dungeon.quantity;
}
)
;

var index = json.achievements.criteria.indexOf(33096);
var mythicPlusDungeons = (index < 0) ? 0 : json.achievements.criteriaQuantity[index];
var mythicZeroDungeons = mythicDungeons - mythicPlusDungeons;

return ((normalDungeons + heroicDungeons) * 2) + (mythicZeroDungeons * 3) + (mythicPlusDungeons * 4);
}

function getRaidKillpoints(raids) {
    var killpoints = 0;

    raids.forEach(function (raid) {
        if (RAIDS.hasOwnProperty(raid.id)) {
            raid.bosses.forEach(function (boss) {
                killpoints += boss.lfrKills * 2;
                killpoints += boss.normalKills * 3;
                killpoints += boss.heroicKills * 4;
                killpoints += boss.mythicKills * 6;
            });
        }
    });

    return killpoints;
}

const API_KEY = 'kr2bfgpv5wtx5entzwkvvq6kqpwfwg7e';

const CHEST_AVAILABLE = moment('2016-09-21');

const KEYSTONES = [
    33096, // Initiate
    33097, // Challenger
    33098, // Conqueror
    32028  // Master
];

const RAIDS = {
    8440: 'Trial of Valor',
    8025: 'Nighthold',
    8026: 'Emerald Nightmare'
};

const NORMAL_DUNGEONS = [
    10878, // Eye of Azshara
    10881, // Darkheart Thicket
    10884, // Neltharion's Lair
    10887, // Halls of Valor
    10890, // Assault on Violet Hold
    10893, // Assault on Violet Hold
    10896, // Vault of the Wardens,
    10899, // Blackrook Hold
    10902  // Maw of Souls
];

const HEROIC_DUNGEONS = [
    10879, // Eye of Azshara
    10882, // Darkheear Thicket
    10885, // Neltharion's Lair
    10888, // Halls of Valor
    10891, // Assault on Violet Hold
    10894, // Assault on Violet Hold
    10897, // Vault of the Wardens,
    10900, // Blackrook Hold
    10903  // Maw of Souls
];

const MYTHIC_DUNGEONS = [
    10880, // Eye of Azshara
    10883, // Darkheart Thicket
    10886, // Neltharion's Lair
    10889, // Halls of Valor
    10892, // Assault on Violet Hold
    10895, // Assault on Violet Hold
    10898, // Vault of the Wardens,
    10901, // Blackrook Hold
    10904, // Maw of Souls
    10907, // Arcway
    10910, // Court of Stars
    11406  // Karazhan
];

var breakpoints = [300, 900, 2000, 3100, 4800, 7000];

function estimate(killpoints) {
    var message;

    if (killpoints > breakpoints[breakpoints.length - 1]) {
        message = 'Wow! You should have received over ' + breakpoints.length + ' legendaries!';
    } else {
        var amount = breakpoints.findIndex(function (breakpoint) {
            return breakpoint > killpoints;
        });

        if (amount == 0) {
            message = "Keep going! Your first legendary will be quick!";
        } else if (amount == 1) {
            message = "You should have received your first legendary by now.";
        } else {
            message = "You should have received " + amount + " legendaries so far.";

        }
        message += " . You have around "+ killpoints + " killpoints and your next legendary will come around " + breakpoints[amount+1] + " killpoints";
    }

    return message;
}


client.login('Mjc1NTI1NzgwMzE3MTQzMDQw.C3B68w.lcNvPpwc2LBZFndLlkKiMwfUZBw');