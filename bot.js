const Discord = require('discord.js');
const request = require('request')
const config = require( './config.json' );
const client = new Discord.Client();

client.on('ready', ( ) => {
	console.log ( `Logged in as ${client.user.tag}!` );
	console.log ( `Serving ${client.guilds.size} servers` );

	for ( let i = 0; i < config.channels.length; i++ )
	{
		setTimeout ( ( id ) => {
			waitNex( client.channels.find("name",id) );
		}, millisTo ( 11 ), config.channels[ i ] );
	}
});

client.on('message', ( msg ) => {
	switch ( msg.content )
	{
		case '!bM' :
		{
			getPicture ( (uri)=>{ msg.reply(uri); } );
			break;
		}
		default:
		{
			if ( msg.content.indexOf ( '!bM' ) != 0 )
			{
				return false;
			}
			var value = msg.content.substring ( 3 );
			
			var date = new Date( value );
			if ( date != "Invalid Date" )
			{
				if ( !getPicture ( (uri)=>{ msg.reply(uri); }, date ) )
				{
					msg.reply( "picture not found" );
				}
			}
			else
			{
				msg.reply( "can't undertand request");
			}
			break;
		}
	}
});

client.on("guildCreate", guild => {
	console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
	client.user.setActivity(`Serving ${client.guilds.size} servers`);
});

client.login( config.token );

function millisTo( hours = 0, minuts = 0, seconds = 0 )
{
	var now = new Date();
	var  millis = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minuts, seconds, 0) - now;

	if ( millis < 0 )
	{
	      millis += 24 * 60 * 60 * 1000; // it's after 10am, try 10am tomorrow.
	}
	return ( millis );
}

function getPicture ( calback, date = null )
{
	var target = '';

	if ( ( date != null ) )
	{
		target = '/'+date.getFullYear()+'/'+(date.getMonth()+1)+'/'+date.getDate();
	}

	return ( request({uri: 'http://www.bonjourmadame.fr'+target}, function(err, response, body){
		var reg = new RegExp ( /<img[^>]+alt=""[^>]+>/ );
		var result = reg.exec ( body );
		if ( !result )
		{
			return false;
		}

		var uri = result[ 0 ].substring( result[ 0 ].indexOf( 'src="' ) + 5 );
		uri = uri.substring( 0, uri.indexOf( '"' ) );
		uri = uri.substring( 0, uri.indexOf( '?' ) );
		calback ( uri );
		return  ( true );
	}) );

	// <img class="alignnone wp-image-884 size-full jetpack-lazy-image" src="https://i1.wp.com/bonjourmadame.fr/wp-content/uploads/2019/08/190806-1.jpg?resize=960%2C540" alt width="960" height="540" data-recalc-dims="1" data-lazy-srcset="https://i1.wp.com/bonjourmadame.fr/wp-content/uploads/2019/08/190806-1.jpg?w=1920 1920w, https://i1.wp.com/bonjourmadame.fr/wp-content/uploads/2019/08/190806-1.jpg?resize=300%2C169 300w, https://i1.wp.com/bonjourmadame.fr/wp-content/uploads/2019/08/190806-1.jpg?resize=768%2C432 768w, https://i1.wp.com/bonjourmadame.fr/wp-content/uploads/2019/08/190806-1.jpg?resize=1024%2C576 1024w, https://i1.wp.com/bonjourmadame.fr/wp-content/uploads/2019/08/190806-1.jpg?resize=1140%2C641 1140w" data-lazy-sizes="(max-width: 960px) 100vw, 960px" data-lazy-src="https://i1.wp.com/bonjourmadame.fr/wp-content/uploads/2019/08/190806-1.jpg?resize=960%2C540&amp;is-pending-load=1" srcset="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"><noscript><img class="alignnone wp-image-884 size-full" src="https://i1.wp.com/bonjourmadame.fr/wp-content/uploads/2019/08/190806-1.jpg?resize=960%2C540" alt="" width="960" height="540" srcset="https://i1.wp.com/bonjourmadame.fr/wp-content/uploads/2019/08/190806-1.jpg?w=1920 1920w, https://i1.wp.com/bonjourmadame.fr/wp-content/uploads/2019/08/190806-1.jpg?resize=300%2C169 300w, https://i1.wp.com/bonjourmadame.fr/wp-content/uploads/2019/08/190806-1.jpg?resize=768%2C432 768w, https://i1.wp.com/bonjourmadame.fr/wp-content/uploads/2019/08/190806-1.jpg?resize=1024%2C576 1024w, https://i1.wp.com/bonjourmadame.fr/wp-content/uploads/2019/08/190806-1.jpg?resize=1140%2C641 1140w" sizes="(max-width: 960px) 100vw, 960px" data-recalc-dims="1" />
}

function waitNex ( channel )
{
	if ( !channel )
	{
		return false;
	}

	var date = new Date();
	if ( ( date.getDay () > 0 ) &&
		( date.getDay () < 6 ) )
	{
		getPicture ( (uri) => { channel.send(uri) } );
	}

	setTimeout ( () => { waitNex( channel ) }, millisTo ( 11 ) ) ;
}

