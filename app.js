const Discord = require('discord.js');
const client = new Discord.Client();
var request = require('request');
var moment = require('moment');
var killpoints = require('./killpoints/killpoints.js')


client.on('message', message => {
  if (message.content.match(new RegExp(/^!legendary/g)))
  {
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
      if (!char) {
        return;
      }

      var url = 'https://' + realm + '.api.battle.net/wow/character/' + server + '/' + char + '?fields=progression,achievements,statistics&apikey=kr2bfgpv5wtx5entzwkvvq6kqpwfwg7e';
      request(url, function (error, response, body) {
        console.log(response.statusCode) // 200
        var info = JSON.parse(body);
        console.log(info.name);
        var points = killpoints.getKillpoints(info);
        message.reply(killpoints.estimate(points));
      });
    }
  }});



  client.login('MjgxNDY0Mjk4MTE3NTI5NjAw.C4YVmQ.Lq-JS4n4UEThhefD54sixQ19a7I');
