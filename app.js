require('dotenv').config();
const { MessageEmbed, Client } = require('discord.js');
const client = new Client();
const axios = require('axios');
const cheerio = require('cheerio');
const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');
const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');
const marvelList = require('./marvelList');
const PORT = process.env.PORT;
const express = require('express');
const app = express();
const path = require('path'); 
const e = require('express');
const publicDir = path.join(__dirname,'./public')


app.use(express.static(publicDir)) 

app.get('/',(req,res)=>{
    res.sendFile(__dirname + '/views/index.html');
})

let googleKey = process.env.GOOGLE_KEY
let csx = process.env.CSX
let googleKeyMusic = process.env.GOOGLE_KEY_METROLYRICS
let csxMusic = process.env.CSX_METROLYRICS

client.on('ready',() => {
    client.user.setActivity('atishi -h',{type: 'PLAYING'})
})

var dispatcher;
var smallTalkVar = false;
var music = false;
const prefix = process.env.PREFIX;

// functions

const randNo = (limit) => {
    const thatNo = Math.floor(Math.random() * limit);
    return thatNo;
};
const playFunc = async (message, args) => {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.channel.send('You need to be in a channel to execute this command!');
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has('CONNECT')) return message.channel.send('You dont have the correct permissins');
    if (!permissions.has('SPEAK')) return message.channel.send('You dont have the correct permissins');

    const validURL = (str) =>{
        var regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
        if(!regex.test(str)){
            return false;
        } return true;
    }
    if(validURL(args)){
        // return message.reply(`${args} to be played`);
        const  connection = await voiceChannel.join();
        const stream  = ytdl(args, {filter: 'audioonly'});
        dispatcher = connection.play(stream)
        dispatcher.on('finish', () =>{
            voiceChannel.leave();
            message.channel.send('leaving channel');
        })
        dispatcher.on('error', error =>
        {
        console.log(error)
        });
        await message.reply(`:thumbsup: Now Playing ***Your Link!***`)
        return;
    }
    const  connection = await voiceChannel.join();
    const videoFinder = async (query) => {
        const videoResult = await ytSearch(query);
        return (videoResult.videos.length > 1) ? videoResult.videos[0] : null;
    }
    const video = await videoFinder(args);
    if(video){
        // return message.reply(`${video.url} to be played`);
        const stream  = ytdl(video.url, {filter: 'audioonly'});
        const dispatcher = connection.play(stream)
        dispatcher.on('start', () =>{
            music = true;
        })
        dispatcher.on('finish', () =>{
            // music = false;
            // voiceChannel.leave();
            // message.channel.send('Thanks for using the music service :heart: !');
        })
        dispatcher.on('error', error =>
        {
        console.log(error)
        });
        await message.reply(`:thumbsup: Now Playing ***${video.title}***`)
        return
    } else {
        message.channel.send('No video results found');
    }
}
const stopFunc = async (message) => {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.channel.send('You need to be in a channel to execute this command!');
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has('CONNECT')) return message.channel.send('You dont have the correct permissins');
    if (!permissions.has('SPEAK')) return message.channel.send('You dont have the correct permissins');
    music=false;
    voiceChannel.leave()
    await message.channel.send('Thanks for using the music service :heart: !');
}
async function smallTalk(message) {
    const sessionId = uuid.v4();
    const projectId = process.env.PROJECT_ID
    const sessionClient = new dialogflow.SessionsClient({
        keyFilename: "./bot-config.json"
    });
    const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);
    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: message.content,
          languageCode: 'en-US',
        },
      },
    };

    const responses = await sessionClient.detectIntent(request);
    const result = responses[0].queryResult;
    await  message.reply(result.fulfillmentText);
  }

client.on('message', (message) => {
    // ignoring bot messages
    if(message.author.bot) return;

    // atishi help commands
    if (message.content === prefix+ " -h" ) {
        const Embed = new MessageEmbed()
        .setTitle('AtishiBot Help Commands')
        .setDescription('AtishiBoT offers a wide range of features, explore them with these help commands. [visit for more](http://google.com)\u200B')
        .setThumbnail('https://i.imgur.com/wSTFkRM.png')
        .addFields(
            { name: `Chatbot :robot:\u0009`, value: '`atishi -h talk`', inline: true},
            { name: `Play Music :musical_score:\u0009`, value: '`atishi -h music`', inline: true },
            { name: `Fun :joy:\u0009`, value: '`atishi -h fun`', inline: true },
            { name: `Assist :innocent:\u0009`, value: '`atishi -h assist`', inline: true },  
            { name: `Moderator :pencil2:\u0009`, value: '`atishi -h moderate`', inline: true },
            { name: `Marvel :heartpulse:\u0009`, value: '`atishi -h marvel`', inline: true },       
            { name: `Report a bug\u0009`, value: 'Help us improve! [Report a big here](http://google.com)', inline: true },       
        )
        .setColor('#f5bf42')
        .setTimestamp()
        .setFooter('Ishita Kabra', 'https://i.imgur.com/wSTFkRM.png');
        message.channel.send(Embed);
    }
    if (message.content.startsWith(prefix+ " -h talk") ) {
        const Embed = new MessageEmbed()
        .setTitle('AtishiBot Help Commands')
        .setDescription('Use these commands to talk to atishi. Type something like:  "hi, how are you?". [visit for more](http://google.com)\u200B')
        .setThumbnail('https://i.imgur.com/wSTFkRM.png')
        .addFields(
            { name: 'Initiate chatbot! :wave:', value: '`atishi hi`', inline: true },
            { name: 'Stop chatbot! :open_hands:', value: '`atishi bye`', inline: true },
        )
        .setColor('#f5bf42')
        .setTimestamp()
        .setFooter('Ishita Kabra', 'https://i.imgur.com/wSTFkRM.png');
        message.channel.send(Embed);
    }
    if (message.content.startsWith(prefix+ " -h music") ) {
        const Embed = new MessageEmbed()
        .setTitle('AtishiBot Help Commands')
        .setDescription('Use these music commands to play songs or get song lyrics right here on youtube. [visit for more](http://google.com)\u200B')
        .setThumbnail('https://i.imgur.com/wSTFkRM.png')
        .addFields(
            { name: 'Get song lyrics :musical_score:', value: 'atishi lyrics "..."', inline: true },
            { name: 'Play a song :headphones:', value: 'atishi play "..."', inline: true },
            { name: 'Stop a song :mute:\u200B', value: 'atishi stop "..."\u200B', inline: true },
        )
        .setColor('#f5bf42')
        .setTimestamp()
        .setFooter('Ishita Kabra', 'https://i.imgur.com/wSTFkRM.png');
        message.channel.send(Embed);
    }
    if (message.content.startsWith(prefix+ " -h fun") ) {
        const Embed = new MessageEmbed()
        .setTitle('AtishiBot Help Commands')
        .setDescription('Bored? Can atishi interest you in a meme? or a roast perhaps?". [visit for more](http://google.com)\u200B')
        .setThumbnail('https://i.imgur.com/wSTFkRM.png')
        .addFields(
            { name: 'Roast someone :smiling_imp:', value: 'atishi roast "@.."\u200B', inline: true },
            { name: 'Get a meme :joy:"\u200B', value: 'atishi meme', inline: true },
            { name: 'Simpmeter :pinching_hand:', value: 'atishi simpmeter "@.."', inline: true },
        )
        .setColor('#f5bf42')
        .setTimestamp()
        .setFooter('Ishita Kabra', 'https://i.imgur.com/wSTFkRM.png');
        message.channel.send(Embed);
    }
    if (message.content.startsWith(prefix+ " -h assist") ) {
        const Embed = new MessageEmbed()
        .setTitle('AtishiBot Help Commands')
        .setDescription('Get the date, time or google anything you like. [visit for more](http://google.com)\u200B')
        .setThumbnail('https://i.imgur.com/wSTFkRM.png')
        .addFields(
            { name: 'Feeling low? Get an inspirational quote :innocent:', value: 'atishi inspire', inline: false },
            { name: "Get today's date :calendar: ", value: 'atishi date', inline: true },
            { name: 'Get current time :alarm_clock:\u200B', value: 'atishi time\u200B', inline: true },
            { name: 'Google anything :globe_with_meridians:\u200B', value: 'atishi google ".."\u200B', inline: true }, 
        )
        .setColor('#f5bf42')
        .setTimestamp()
        .setFooter('Ishita Kabra', 'https://i.imgur.com/wSTFkRM.png');
        message.channel.send(Embed);
    }
    if (message.content.startsWith(prefix+ " -h moderate") ) {
        const Embed = new MessageEmbed()
        .setTitle('AtishiBot Help Commands')
        .setDescription('Perform basic moderator task with ease. [visit for more](http://google.com)\u200B')
        .setThumbnail('https://i.imgur.com/wSTFkRM.png')
        .addFields(
            { name: 'Kick user :person_walking:', value: 'atishi kick', inline: true },
            { name: 'Ban  user :man_walking:', value: 'atishi ban', inline: true },
            { name: 'Create a role :pencil2:', value: 'atishi createRole "..."', inline: true },
            { name: 'Delete a role :wastebasket:\u200B', value: 'atishi deleteRole "..."\u200B', inline: true },
            { name: 'Assign user role :pencil:', value: 'atishi assignRole "..." "@.."', inline: true },
            { name: 'Remove user role :wastebasket:', value: 'atishi removeRole "..." "@.."', inline: true },
            { name: 'Create text channel :closed_book:', value: 'atishi createTC "..."', inline: true },
            { name: 'Delete text channel :wastebasket:\u200B', value: 'atishi deleteTC "..."\u200B', inline: true },
            { name: 'Create voice channel :loud_sound:', value: 'atishi createVC "..."', inline: true },
            { name: 'Delete voice channel :wastebasket:\n', value: 'atishi deleteVC "..."\n', inline: true },  
        )
        .setColor('#f5bf42')
        .setTimestamp()
        .setFooter('Ishita Kabra', 'https://i.imgur.com/wSTFkRM.png');
        message.channel.send(Embed);
    }
    if (message.content.startsWith(prefix+ " -h marvel") ) {
        const Embed = new MessageEmbed()
        .setTitle('AtishiBot Help Commands')
        .setDescription('Find out which marvel character you are. [visit for more](http://google.com)\u200B')
        .setThumbnail('https://i.imgur.com/wSTFkRM.png')
        .addFields(
            { name: 'Which marvel character are you :heartpulse:', value: 'atishi earth616', inline: true },
        )
        .setColor('#f5bf42')
        .setTimestamp()
        .setFooter('Ishita Kabra', 'https://i.imgur.com/wSTFkRM.png');
        message.channel.send(Embed);
    }

    // atishi small talk (hi, bye commands and functions)
    if (message.content.startsWith(prefix+ " hi") ) {
        // message.reply(`Hiii <3`);
        smallTalkVar=true;
    }
    if (message.content.startsWith(prefix+ " bye") ) {
        smallTalkVar=false;
        message.reply(`Going so soon? Bye :(. Thanks for using the small talk feature on AtishiBoT`);
    }
    if(smallTalkVar) {
        if (!message.content.startsWith(prefix+ " -h")) smallTalk(message);
    }

    if(!smallTalkVar){
            //assist commands - date, time, google, inspire
            if (message.content.startsWith(prefix+ " date") ) {
                const date = new Date().toLocaleDateString('en-US');
                const Embed = new MessageEmbed()
                .setColor('#f5bf42')
                .setTitle(`Today's date is ${date}`)
                .setAuthor('AtishiBoT', 'https://i.imgur.com/wSTFkRM.png')
                .setDescription('Have a great day :innocent:')
                .setTimestamp()
                .setFooter('Ishita Kabra', 'https://i.imgur.com/wSTFkRM.png');
                message.channel.send(Embed);
            }
            if (message.content.startsWith(prefix+ " time") ) {
                const date = new Date();
                var time = date.toLocaleTimeString();
                const Embed = new MessageEmbed()
                .setColor('#f5bf42')
                .setTitle(`The time right now is ${time}`)
                .setAuthor('AtishiBoT', 'https://i.imgur.com/wSTFkRM.png')
                .setDescription('Get going with your agendas for today!:alarm_clock:')
                .setTimestamp()
                .setFooter('Ishita Kabra', 'https://i.imgur.com/wSTFkRM.png');
                message.channel.send(Embed);
            }
            if (message.content.startsWith(prefix) &&  message.content.includes("google")) {
                let src = message.content.replace(`${prefix} google`,"");
                if(src.trim().length===0) {
                    message.channel.send("You must enter something for atishi to google, try something like: atishi google AtishiBoT");
                    return;
                }
                axios.get('https://www.googleapis.com/customsearch/v1',{
                    params:{
                        key: googleKey,
                        cx: csx,
                        safe:"off",
                        q: src,
                    }
                })
                .then(({data})=>{
                    message.channel.send(`title: ${data.items[0].title}`);
                    message.channel.send(`link: ${data.items[0].link}`);
                })
                .catch(()=>{
                    message.channel.send(`Could not find any matches relevant to your search! please try something else`);
                })
            
            }
            if (message.content.startsWith(prefix+ " inspire") ) {
                axios.get('https://api.quotesnewtab.com/v1/quotes/random')
                    .then((data)=>message.channel.send(`"${data.data.quote}"~${data.data.author}`))
                    .catch(()=>message.channel.send('Something went wrong'))
            }

            // music commands - play, stop, lyrics
            if(message.content.startsWith(prefix+" lyrics")){
                let song = message.content.replace(`${prefix} lyrics`,"");
                var regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
                if(song.trim().length===0) {
                    message.channel.send("You must enter a song name. Try: atishi lyrics zaalima");
                    return;
                }
                if(regex.test(song)) {
                    message.channel.send("You cannot enter a URL");
                    return;
                }
                // message.channel.send(`song: ${song}`);
                axios.get('https://www.googleapis.com/customsearch/v1',{
                    params:{
                        key: googleKeyMusic,
                        cx: csxMusic,
                        safe:"off",
                        q: song,
                    }
                })
                .then(({data})=>{
                    axios.get(data.items[0].link)
                    .then((res)=>{
                        var $ = cheerio.load(res.data)
                        var data =$('.verse');
                        console.log(data.text());
                        message.channel.send(data.text().substring(0,2000));
                    })
                    .catch(()=>message.channel.send(`An error occured, please try again later`))
                })
                .catch(()=>{
                    message.channel.send(`An error occured, please try again later`);
                })
            }  
            if(message.content.startsWith(prefix+" ply")){
                let song = message.content.replace(`${prefix} ply`,"");
                // checking second argument
                if(song.trim().length === 0) return message.channel.send('You need to send the second argument!');
                else {
                    playFunc(message, song)
                }
            }
            if(message.content.startsWith(prefix+' stop')){
                if(!music) return message.channel.send('No song is playing');
                stopFunc(message);
            }

            //fun commands - simpmeter, roast, meme
            if (message.content.startsWith(prefix+ " simpmeter") ) {
                const mem = message.mentions.members.first();
                if(!mem) return message.channel.send('Mention someone to simp');
                message.channel.send(`${mem} is ${Math.floor(Math.random() * 100)}% simp `)
            }
            if (message.content.startsWith(prefix+ " roast") ) {
                const mem = message.mentions.members.first();
                if(!mem) return message.channel.send(`Please provide a valid member name`);
                message.channel.send(`Fetching your roast..`); 
                axios.get('https://evilinsult.com/generate_insult.php?lang=en&type=json')
                    .then((resp)=>message.channel.send(`${mem} ${resp.data.insult}`))
                    .catch(()=>message.channel.send(`An error occured`))
            } 
            if (message.content.startsWith(prefix+ " meme") ) {
                message.channel.send(`Fetching your meme..`); 
                const mainUrl = `https://www.reddit.com/r/dankmemes/random/.json`;
                axios.get(mainUrl)
                    .then((response) => {
                        let res = response.data[0].data.children[0].data
                        message.channel.send(`${res.url}`);
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            }

            // Moderator - change owner to admin permission
            if(message.content.startsWith(prefix+" kick")){
                if(message.guild.ownerID !== message.author.id){
                    message.channel.send(`Only admins can kick other users! sorry`);
                    return;
                }
                else {
                    const mem = message.mentions.members.first();
                    if(!mem) return message.channel.send(`Please provide valid member names to kick`);
                    message.mentions.members.map((member)=>{
                        member
                            .kick()
                            .then((member) => message.channel.send(`Atishi kicked ${member.displayName} from the server`))
                    })
                }
            }
            if(message.content.startsWith(prefix+" ban")){
                if(message.guild.ownerID !== message.author.id){
                    message.channel.send(`Only admins can ban other users! sorry`);
                    return;
                }
                else {
                    const mem = message.mentions.members.first();
                    if(!mem) return message.channel.send(`Please provide valid member names to ban`);
                    message.mentions.members.map((member)=>{
                        member
                            .ban()
                            .then((member) => message.channel.send(`Atishi banned ${member.displayName} from the server`))
                    })
                }
            }
            if(message.content.startsWith(prefix+" createRole")){
                if(message.guild.ownerID !== message.author.id){
                    message.channel.send(`Only admins can create roles`);
                    return;
                }
                let role = message.content.replace(`${prefix} createRole`,"");
                if(!role.trim()) return message.channel.send(`Please give a valid role name`);
                message.guild.roles.create({
                    data: {
                    name: role,
                    color: 'RANDOM',
                    },
                    reason: role,
                })
                    .then(()=>message.channel.send(`${role} created`))
                    .catch(()=>message.channel.send(`An error occured`))
            }
            if(message.content.startsWith(prefix+" deleteRole")){
                if(message.guild.ownerID !== message.author.id){
                    message.channel.send(`Only admins can delete roles`);
                    return;
                }
                let ROLE = message.content.replace(`${prefix} deleteRole `,"");
            
                message.guild.roles.fetch()
                .then((res)=>{
                    res.cache.map((role)=>{
                        if(role.name === ROLE){
                            role.delete()
                            .then(()=>message.channel.send(`${ROLE} deleted from server`))
                            .catch(()=>message.channel.send('An error occured'))
                        }
                        else return message.channel.send('Please enter a valid role name')
                    })
                })
                .catch(()=>message.channel.send('An error occured'))
                
            }
            if(message.content.startsWith(prefix+" assignRole")){
                if(message.guild.ownerID !== message.author.id){
                    message.channel.send(`Only admins can assign roles`);
                    return;
                }
                let role_string = message.content.replace(`${prefix} assignRole `,"");
                var res = role_string.substr(0,role_string.indexOf(' '));
                let role = message.guild.roles.cache.find(x => x.name === res);
                if(!role){
                    message.channel.send(`No role "${res}" exists`)
                } else {
                    const mem = message.mentions.members.first();
                    if(!mem) return message.channel.send(`Please provide valid member names`);
                    message.mentions.members.map((m)=>{
                        if(!m.roles.cache.some(role => role.name === res)) {
                            m.roles.add(role)
                            .then(()=>message.channel.send(`Role ${res} assigned to ${m.displayName}`))
                            .catch(()=>message.channel.send(`An error occured in assigning role ${res} to ${m.displayName}`))
                        }
                        else message.channel.send(`Role ${res} already assigned to ${m.displayName}!`)
                    })
                }
            }
            if(message.content.startsWith(prefix+" removeRole")){
                if(message.guild.ownerID !== message.author.id){
                    message.channel.send(`Only admins can create roles`);
                    return;
                }
                let role_string = message.content.replace(`${prefix} removeRole `,"");
                var res = role_string.substr(0,role_string.indexOf(' '));
                let role = message.guild.roles.cache.find(x => x.name === res);
                const mem = message.mentions.members.first();
                if(!mem) return message.channel.send(`Please provide valid member names`);
                message.mentions.members.map((m)=>{
                    if(m.roles.cache.some(role => role.name === res)){
                        m.roles
                            .remove(role)
                            .then(()=>message.channel.send(`Role ${res} removed for user ${m.displayName}`))
                            .catch(()=>message.channel.send(`An error occured in removing role ${res} for ${m.displayName}`))
                    } else message.channel.send(`${m.displayName} doesn't have a role ${res}`)
                })
            }
            if(message.content.startsWith(prefix+" createTC")){
                if(message.guild.ownerID !== message.author.id){
                    message.channel.send(`Only admins can create text channels`);
                    return;
                }
                let channel = message.content.replace(`${prefix} createTC `,"");
                if(!channel.trim()) return message.channel.send(`Please give a valid channel name`);
                message.guild.channels.create(channel,"text")
                    .then(()=>message.channel.send(`text channel "${channel}" created`))
                    .catch(()=>message.channel.send(`An error occured`))
            }
            if(message.content.startsWith(prefix+" createVC")){
                if(message.guild.ownerID !== message.author.id){
                    message.channel.send(`Only admins can create voice channels`);
                    return;
                }
                let channel = message.content.replace(`${prefix} createVC `,"");
                if(!channel.trim()) return message.channel.send(`Please give a valid channel name`);
                message.guild.channels.create(channel,{
                    type: 'voice'
                })
                    .then(()=>message.channel.send(`voice channel "${channel}" created`))
                    .catch(()=>message.channel.send(`An error occured`))
            }
            if(message.content.startsWith(prefix+" deleteTC")){
                if(message.guild.ownerID !== message.author.id){
                message.channel.send(`Only admins can create text channels`);
                return;
            }
            let channel = message.content.replace(`${prefix} deleteTC `,"");
            const fetchedChannel = message.guild.channels.cache.find(r => {return r.type==='text' && r.name === channel});
            if(!fetchedChannel) return message.channel.send(`No such channel found`);
            fetchedChannel.delete()
                .then(()=>message.channel.send(`text channel "${channel}" deleted`))
                .catch(()=>message.channel.send(`An error occured`))
            }
            if(message.content.startsWith(prefix+" deleteVC")){
                if(message.guild.ownerID !== message.author.id){
                    message.channel.send(`Only admins can create voice channels`);
                    return;
                }
                let channel = message.content.replace(`${prefix} deleteVC `,"");
                const fetchedChannel = message.guild.channels.cache.find(r => {return r.type==='voice' && r.name === channel});
                if(!fetchedChannel) return message.channel.send(`No such channel found`);
                fetchedChannel.delete()
                    .then(()=>message.channel.send(`voice channel "${channel}" deleted`))
                    .catch(()=>message.channel.send(`An error occured`))
            }

            // Marvel 
            // which marvel character are you
            if(message.content.startsWith(prefix+" earth616")){
                const mainUrl = `https://marvel.fandom.com/wiki/${marvelList[randNo(100)]}(Earth-616)`;
                var regex = '^\[[0-9]+$\]'
                axios.get(mainUrl)
                    .then((response) => {
                        var $ = cheerio.load(response.data);
                        var history =$('.mw-parser-output');
                        var stats = $('figure');
                        var appear = $('.pi-horizontal-group')
                        var name = $('aside').first().find('h2').first();
                        var quote = $('.quote').find('span') 
                        console.log(name.text());
                        message.channel.send(stats.find('a').attr('href'));
                        message.channel.send(`***Name: ${name.text()}***`)
                        message.channel.send(`***Quote: ***${quote.text().trim().replace(/\s+/g, " ")}`);
                        message.channel.send(`***Trivia:*** ${history.find('p').slice(1,5).text().trim()}`);
                        message.channel.send(appear.text().trim().replace(/\s+/g, " ").replace('First Appearance','***First Appearance:*** '));

                    })
                    .catch((err) => {
                        console.log(err);
                    });

            }
    }
    
    // -------------------- to do ---------------------- //
    // resume and pause a song 
})

client.login(process.env.DISCORD_BOT_TOKEN);



app.listen(PORT,()=>{
    console.log('this is local host '+ PORT)
})



/*
TODO TASKS


Music ----
atishi pause and resume


Extra ----
send a hello message on connecting to a new server
console.log(Guilds);
console.log(`${client.user.tag} has logged in.`);

*/
