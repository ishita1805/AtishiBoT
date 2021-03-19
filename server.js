require('dotenv').config();
const { Client, Channel } = require('discord.js');
const client = new Client();
const axios = require('axios');
const cheerio = require('cheerio');

let googleKey = process.env.GOOGLE_KEY
let csx = process.env.CSX
let googleKeyMusic = process.env.GOOGLE_KEY_METROLYRICS
let csxMusic = process.env.CSX_METROLYRICS

client.on('ready',() => {
    client.user.setActivity('Your Server',{type: 'WATCHING'})
    const Guilds = client.guilds.cache.map(guild => guild.name);
})

const prefix = process.env.PREFIX;

client.on('message', (message) => {
    // ignoring bot messages
    if(message.author.bot) return;
    //1. help command (atishi help) 
    if (message.content.startsWith(prefix+ " help") ) {
        message.channel.send(`
        **Help commands:**
        atishi hi
        atishi bye
        atishi date 
        atishi time
        atishi inspire
        atishi google "..."
        atishi lyrics "..."
        atishi kick "@.."
        `);
    }
    //2. send today's date (atishi date) 
    if (message.content.startsWith(prefix+ " date") ) {
        const date = new Date().toLocaleDateString('en-US');
        message.channel.send(`today's date is ${date}, have a great day`);
    }
    //3. send current time (atishi time) 
    if (message.content.startsWith(prefix+ " time") ) {
        const date = new Date();
        var time = date.toLocaleTimeString();
        message.channel.send(`It's ${time}, get going with your agendas for today!`);
    }
    //4. google something (atishi google '..') 
    if (message.content.startsWith(prefix) &&  message.content.includes("google")) {
        let src = message.content.replace(`${prefix} google`,"");
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
            message.channel.send(`An error occured, please try again later`);
        })
      
    }
    //5. hi (atishi hi) 
    if (message.content.startsWith(prefix+ " hi") ) {
        message.reply(`Hiii <3`);
    }
    //6. bye (atishi bye) 
    if (message.content.startsWith(prefix+ " bye") ) {
        message.reply(`Going so soon? Bye :(`);
    }
    //7. lyrics (atishi lyrics '..') 
    if(message.content.startsWith(prefix+" lyrics") &&  message.content.includes("lyrics")){
        let song = message.content.replace(`${prefix} lyrics`,"");
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

    // ---------------------- to do -----------------------------------------
    //8. send a random quote command (atishi inspire)
    if (message.content.startsWith(prefix+ " inspire me") ) {
        message.channel.send('Inspiring quote');
    }
    //9. kick (atishi kick @..)
    if(message.content.startsWith(prefix+" kick") &&  message.content.includes("kick")){
        let id = message.content.replace(`${prefix} kick`,"");
        message.channel.send(`Atishi kicked ${id} from the server`);
    }
})

client.login(process.env.DISCORD_BOT_TOKEN);




// send a hello message on connecting to a new server
// console.log(Guilds);
// console.log(`${client.user.tag} has logged in.`);

/*
Help commands:
atishi create role ""
atishi give role "..." "@.."
atishi roast "@.."
atishi simp "@.."
atishi gaymeter "@.."
atishi marvel "@.."
*/

// https://leovoel.github.io/embed-visualizer/
// console.log(`[${message.author.tag}] ${message.content}`);
