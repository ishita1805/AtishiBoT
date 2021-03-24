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
    // const Guilds = client.guilds.cache.map(guild => guild.name);
})

const prefix = process.env.PREFIX;

const randNo = (limit) => {
    const thatNo = Math.floor(Math.random() * limit);
    return thatNo;
};

client.on('message', (message) => {
    // ignoring bot messages
    if(message.author.bot) return;

    // basic + helpful commands
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
        atishi create role "..."
        atishi delete role "..."
        atishi assign role "..." "@.."
        atishi remove role "..." "@.."

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
    //5. send a random quote command (atishi inspire)
     if (message.content.startsWith(prefix+ " inspire") ) {
        axios.get('https://api.quotesnewtab.com/v1/quotes/random')
            .then((data)=>message.channel.send(`"${data.data.quote}"~${data.data.author}`))
            .catch(()=>message.channel.send('Something went wrong'))
    }
    //6. hi (atishi hi) 
    if (message.content.startsWith(prefix+ " hi") ) {
        message.reply(`Hiii <3`);
    }
    //7. bye (atishi bye) 
    if (message.content.startsWith(prefix+ " bye") ) {
        message.reply(`Going so soon? Bye :(`);
    }

    // music related
    //8. lyrics (atishi lyrics '..') 
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
    // -------------------- to do ---------------------- //
    // play a song, pause a song, stop a song 

    // fun commands
    //9. Gaymeter (atishi gaymeter "@.."")
    if (message.content.startsWith(prefix+ " gaymeter") ) {
        const mem = message.mentions.members.first();
        message.channel.send(`${mem} is ${Math.floor(Math.random() * 100)}% gay `)
    }
    //10. Roast (atishi roast "@...")
    if (message.content.startsWith(prefix+ " roast") ) {
        const mem = message.mentions.members.first();
        if(!mem){ message.channel.send(`Please provide a valid member name`); return; }
        message.channel.send(`Fetching your roast..`); 
        axios.get('https://evilinsult.com/generate_insult.php?lang=en&type=json')
            .then((resp)=>message.channel.send(`${mem} ${resp.data.insult}`))
            .catch(()=>message.channel.send(`An error occured`))
    } 
    //11. Meme (atishi meme)
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
    //12. kick (atishi kick @..)
    if(message.content.startsWith(prefix+" kick")){
        if(message.guild.ownerID !== message.author.id){
            message.channel.send(`Only admins can kick other users! sorry`);
            return;
        }
        else {
            message.mentions.members.map((member)=>{
                member
                    .kick()
                    .then((member) => message.channel.send(`Atishi kicked ${member.displayName} from the server`))
            })
        }
    }
    //13. ban (atishi ban @..)
    if(message.content.startsWith(prefix+" ban")){
        if(message.guild.ownerID !== message.author.id){
            message.channel.send(`Only admins can ban other users! sorry`);
            return;
        }
        else {
            message.mentions.members.map((member)=>{
                member
                    .ban()
                    .then((member) => message.channel.send(`Atishi banned ${member.displayName} from the server`))
            })
        }
    }
    //14. create role  (atishi create role "...")
    if(message.content.startsWith(prefix+" create role")){
        if(message.guild.ownerID !== message.author.id){
            message.channel.send(`Only admins can create roles`);
            return;
        }
        let role = message.content.replace(`${prefix} create role`,"");
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
    //15. delete role  (atishi delete role "...")
     if(message.content.startsWith(prefix+" delete role")){
        if(message.guild.ownerID !== message.author.id){
            message.channel.send(`Only admins can delete roles`);
            return;
        }
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
    //16. assign role  (atishi assign role "...")
    if(message.content.startsWith(prefix+" assign role")){
        if(message.guild.ownerID !== message.author.id){
            message.channel.send(`Only admins can assign roles`);
            return;
        }
        let role_string = message.content.replace(`${prefix} assign role `,"");
        var res = role_string.substr(0,role_string.indexOf(' '));
        let role = message.guild.roles.cache.find(x => x.name === res);
        if(!role){
            message.channel.send(`No role "${res}" exists`)
        } else {
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
    //17. unassign role  (atishi remove role "...")
    if(message.content.startsWith(prefix+" remove role")){
        if(message.guild.ownerID !== message.author.id){
            message.channel.send(`Only admins can create roles`);
            return;
        }
        let role_string = message.content.replace(`${prefix} remove role `,"");
        var res = role_string.substr(0,role_string.indexOf(' '));
        let role = message.guild.roles.cache.find(x => x.name === res);
       
        message.mentions.members.map((m)=>{
            if(m.roles.cache.some(role => role.name === res)){
                console.log('till here')
                m.roles
                    .remove(role)
                    .then(()=>message.channel.send(`Role ${res} removed for user ${m.displayName}`))
                    .catch(()=>message.channel.send(`An error occured in removing role ${res} for ${m.displayName}`))
            } else message.channel.send(`${m.displayName} doesn't have a role ${res}`)
        })
    }
    //18. create a textchannel
    if(message.content.startsWith(prefix+" tchannel")){
         if(message.guild.ownerID !== message.author.id){
            message.channel.send(`Only admins can create text channels`);
            return;
        }
        let channel = message.content.replace(`${prefix} tchannel `,"");
        message.guild.channels.create(channel,"text")
            .then(()=>message.channel.send(`text channel "${channel}" created`))
            .catch(()=>message.channel.send(`An error occured`))
    }
    //19. create a voicechannel
    if(message.content.startsWith(prefix+" vchannel")){
        if(message.guild.ownerID !== message.author.id){
            message.channel.send(`Only admins can create voice channels`);
            return;
        }
        let channel = message.content.replace(`${prefix} vchannel `,"");
        message.guild.channels.create(channel,{
            type: 'voice'
        })
            .then(()=>message.channel.send(`voice channel "${channel}" created`))
            .catch(()=>message.channel.send(`An error occured`))
    }
    //20. delete a textchannel
    if(message.content.startsWith(prefix+" tcdel")){
        if(message.guild.ownerID !== message.author.id){
           message.channel.send(`Only admins can create text channels`);
           return;
       }
       let channel = message.content.replace(`${prefix} tcdel `,"");
       const fetchedChannel = message.guild.channels.cache.find(r => {return r.type==='text' && r.name === channel});
       fetchedChannel.delete()
           .then(()=>message.channel.send(`text channel "${channel}" deleted`))
           .catch(()=>message.channel.send(`An error occured`))
    }
   //21. delete a voicechannel
   if(message.content.startsWith(prefix+" vcdel")){
       if(message.guild.ownerID !== message.author.id){
           message.channel.send(`Only admins can create voice channels`);
           return;
       }
       let channel = message.content.replace(`${prefix} vcdel `,"");
       const fetchedChannel = message.guild.channels.cache.find(r => {return r.type==='voice' && r.name === channel});
       fetchedChannel.delete()
           .then(()=>message.channel.send(`voice channel "${channel}" deleted`))
           .catch(()=>message.channel.send(`An error occured`))
   }

    // -------------------- to do ---------------------- //
    // Marvel 
    // which marvel character are you
    // get a marvel comic strip
})

client.login(process.env.DISCORD_BOT_TOKEN);






/*
TODO TASKS

Reddit ----
atishi roast "@.."
atishi simp "@.."
atishi meme ""

Marvel ----
atishi marvel "@.." --> tells which marvel character you are
atishi marvelcomic ---> random comic strip to read

Music ----
atishi play ".."
atishi pause
atishit stop

Games ----
1. madlips

Extra ----
send a hello message on connecting to a new server
console.log(Guilds);
console.log(`${client.user.tag} has logged in.`);

*/

// Links:
// https://leovoel.github.io/embed-visualizer/
// https://stackoverflow.com/questions/62815577/discord-js-creating-channels-within-categories
