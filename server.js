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
        atishi gaymeter "@.."
        atishi google "..."
        atishi lyrics "..."
        atishi kick "@.."
        atishi ban "@.."
        atishi create "..."
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
    if(message.content.startsWith(prefix+" lyrics")){
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
    //8. send a random quote command (atishi inspire)
    if (message.content.startsWith(prefix+ " inspire") ) {
        axios.get('https://api.quotesnewtab.com/v1/quotes/random')
            .then((data)=>message.channel.send(`"${data.data.quote}"~${data.data.author}`))
            .catch(()=>message.channel.send('Something went wrong'))
    }
    //9. Gaymeter (atishi gaymeter "@.."")
    if (message.content.startsWith(prefix+ " gaymeter") ) {
        let name = message.content.replace(`${prefix} gaymeter`,"");
        message.channel.send(`${name} is ${Math.floor(Math.random() * 100)}% gay `)

    }
   //10. kick (atishi kick @..)
    if(message.content.startsWith(prefix+" kick")){
        if(message.guild.ownerID !== message.author.id){
            message.channel.send(`Only admins can kick other users! sorry`);
        }
        else {
            message.mentions.members.map((member)=>{
                member
                    .kick()
                    .then((member) => message.channel.send(`Atishi kicked ${member.displayName} from the server`))
            })
        }
    }
    //11. ban (atishi ban @..)
    if(message.content.startsWith(prefix+" ban")){
        if(message.guild.ownerID !== message.author.id){
            message.channel.send(`Only admins can ban other users! sorry`);
        }
        else {
            message.mentions.members.map((member)=>{
                member
                    .ban()
                    .then((member) => message.channel.send(`Atishi banned ${member.displayName} from the server`))
            })
        }
    }
    // 12. create role  (atishi create "...")
    if(message.content.startsWith(prefix+" create role")){
        let role = message.content.replace(`${prefix} create role`,"");
        message.guild.roles.create({
            data: {
              name: role,
              color: 'BLUE',
            },
            reason: role,
          })
            .then(()=>message.channel.send(`${role} created`))
            .catch(()=>message.channel.send(`An error occured`))
    }

    // ---------------------- to do -----------------------------------------

     // 13. delete role  (atishi delete role "...")
     if(message.content.startsWith(prefix+" delete role")){
        let ROLE = message.content.replace(`${prefix} delete role `,"");
        message.guild.roles.fetch()
        .then((res)=>{
            res.cache.map((role)=>{
                if(role.name === ROLE){
                    role.delete()
                    .then(()=>message.channel.send(`${ROLE} deleted from server`))
                    .catch(()=>message.channel.send('An error occured'))
                }
            })
        })
        .catch(()=>message.channel.send('An error occured'))
        
    }
     // 14. assign role  (atishi assign role "...")
     if(message.content.startsWith(prefix+" assign role")){
        let role_string = message.content.replace(`${prefix} assign role `,"");
        var res = role_string.split(" ");
        console.log(res);
        // 0th index is role (create if it doesn't exist)
    }

})

client.login(process.env.DISCORD_BOT_TOKEN);




// send a hello message on connecting to a new server
// console.log(Guilds);
// console.log(`${client.user.tag} has logged in.`);

/*

Reddit
atishi roast "@.."
atishi simp "@.."
atishi meme ""

atishi marvel "@.." --> tells which marvel character you are
atishi marvelfam "..."  ---> tells all marvel relations
atishi marvelcomic ---> random comic strip to read

Music
atishi play ".."
atishi pause
atishit stop

games
1. madlips
*/

// https://leovoel.github.io/embed-visualizer/
// console.log(`[${message.author.tag}] ${message.content}`);
