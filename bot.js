const Discord = require('discord.js');
const request = require('sync-request');
const config = require( './config.json' );
const client = new Discord.Client();

const updateDate = 11;

// store thee last uri
let last = [];

client.on('ready', ( ) => {
	console.log ( `Logged in as ${client.user.tag}!` );
	console.log ( `Serving ${client.guilds.size} servers` );

	for ( let i = 0; i < config.channels.length; i++ )
	{
		let list = Array.from(client.channels.findAll("name", config.channels[ i ] ));
		for ( let j = 0; j < list.length; j++ )
		{
			setTimeout ( ( channel, uD, index ) => {
				waitNext( channel, uD, index );
			}, millisTo ( 14, 51 ), list[j], updateDate, j );
		}
	}
});

client.on('message', ( msg ) => {
	switch ( msg.content )
	{
		case '!bM' :
		{
			msg.reply( getPicture ( ) );
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
				let uri = getPicture ( null, date );

				if ( !uri )
				{
					msg.reply( "picture not found" );
				}
				else
				{
					msg.reply( uri );
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
	let now = new Date();
	let millis = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minuts, seconds, 0) - now;

	if ( millis < 0 )
	{
	      millis += 24 * 60 * 60 * 1000; // it's after 10am, try 10am tomorrow.
	}
	return ( millis );
}

function getPicture ( calback, date = null )
{
	let target = '';

	if ( ( date != null ) )
	{
		target = '/'+date.getFullYear()+'/'+(date.getMonth()+1)+'/'+date.getDate();
	}

	let data = request('GET', 'http://www.bonjourmadame.fr'+target);
	if  ( !data )
	{
		return ( false );
	}
	data = data.body.toString('utf-8');

	let reg = new RegExp ( /<img[^>]+alt=""[^>]+>/ );
	let result = reg.exec ( data );
	if ( !result )
	{
		return false;
	}

	uri = result[ 0 ].substring( result[ 0 ].indexOf( 'src="' ) + 5 );
	uri = uri.substring( 0, uri.indexOf( '"' ) );
	uri = uri.substring( 0, uri.indexOf( '?' ) );
	if ( calback )
	{
		calback ( uri );
		return  ( true );
	}
	else
	{
		return (uri );
	}

	// <img class="alignnone wp-image-884 size-full jetpack-lazy-image" src="https://i1.wp.com/bonjourmadame.fr/wp-content/uploads/2019/08/190806-1.jpg?resize=960%2C540" alt width="960" height="540" data-recalc-dims="1" data-lazy-srcset="https://i1.wp.com/bonjourmadame.fr/wp-content/uploads/2019/08/190806-1.jpg?w=1920 1920w, https://i1.wp.com/bonjourmadame.fr/wp-content/uploads/2019/08/190806-1.jpg?resize=300%2C169 300w, https://i1.wp.com/bonjourmadame.fr/wp-content/uploads/2019/08/190806-1.jpg?resize=768%2C432 768w, https://i1.wp.com/bonjourmadame.fr/wp-content/uploads/2019/08/190806-1.jpg?resize=1024%2C576 1024w, https://i1.wp.com/bonjourmadame.fr/wp-content/uploads/2019/08/190806-1.jpg?resize=1140%2C641 1140w" data-lazy-sizes="(max-width: 960px) 100vw, 960px" data-lazy-src="https://i1.wp.com/bonjourmadame.fr/wp-content/uploads/2019/08/190806-1.jpg?resize=960%2C540&amp;is-pending-load=1" srcset="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"><noscript><img class="alignnone wp-image-884 size-full" src="https://i1.wp.com/bonjourmadame.fr/wp-content/uploads/2019/08/190806-1.jpg?resize=960%2C540" alt="" width="960" height="540" srcset="https://i1.wp.com/bonjourmadame.fr/wp-content/uploads/2019/08/190806-1.jpg?w=1920 1920w, https://i1.wp.com/bonjourmadame.fr/wp-content/uploads/2019/08/190806-1.jpg?resize=300%2C169 300w, https://i1.wp.com/bonjourmadame.fr/wp-content/uploads/2019/08/190806-1.jpg?resize=768%2C432 768w, https://i1.wp.com/bonjourmadame.fr/wp-content/uploads/2019/08/190806-1.jpg?resize=1024%2C576 1024w, https://i1.wp.com/bonjourmadame.fr/wp-content/uploads/2019/08/190806-1.jpg?resize=1140%2C641 1140w" sizes="(max-width: 960px) 100vw, 960px" data-recalc-dims="1" />
}

function waitNext ( channel, uD = 0, index = 0 )
{
	if ( !channel )
	{
		return false;
	}

	let date = new Date();

	// test the day of the week
	if ( ( date.getDay () == 0 ) ||
		( date.getDay () == 6 ) )
	{ //  if sunday or saturday wait next day
		setTimeout ( () => { waitNext( channel, uD ) }, millisTo ( uD ) ) ;
		return;
	}


	let uri = getPicture ( );

	// test if new picture available
	if ( uri == last[index] )
	{ // if the last picture displayed is se same to the new one retest in 1 hour
		setTimeout ( () => { waitNext( channel, uD ) }, 3600 ) ;
		return;
	}

	last = uri;
	channel.send ( uri );

	setTimeout ( () => { waitNext( channel, uD ) }, millisTo ( uD ) ) ;
}

