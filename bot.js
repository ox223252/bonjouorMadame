const Discord = require('discord.js');
const request = require('sync-request');
const config = require( './config.json' );
const client = new Discord.Client();

const updateDate = 11;
const first = '2018-12-10';

// store thee last uri
let last = "";
let allWorking = false;

process.on('uncaughtException', function (err) {
 	console.error(err);
	console.log("Node NOT Exiting...");
});

client.on('ready', ( ) => {
	console.log ( `Logged in as ${client.user.tag}!` );
	console.log ( `Serving ${client.guilds.size} servers` );

	setTimeout ( ( uD ) => {
		sendAndWaitNext ( uD );
	}, millisTo ( 11 ), updateDate );
});

client.on('message', ( msg ) => {
	if ( msg.content.indexOf ( '!bM' ) != 0 )
	{
		return false;
	}
	let value = msg.content.substring ( 3 );

	let reponceAvailable = false;

	if ( value.indexOf('help') >= 0 )
	{
		msg.reply( "\nbonjour-madame bot to show nice nude and sexy women pictures\n"+
			"`!bM cmd` : comment\n"+
			"`!bM help` : this display\n"+
			"`!bM about` : show some informations about this program\n"+
			"`!bM last` : last picture available on the web site\n"+
			"`!bM random` : random picture between the first and the last\n"+
			"`!bM` = `!bM random`\n"+
			"`!bM all : to display all pictures`\n"+
			"`!bM all from yyy-mm-dd : to display all pictures from defined date`\n"+
			"`!bM stop : to stop display all pictures`\n"+
			"`!bM yyyy-mm-dd` : picture for this date" );
		return;
	}

	if ( value.indexOf('about') >= 0 )
	{
		msg.reply( "\nmade by ox223252\n"+
			"license : GPLv2\n"+
			"github : https://github.com/ox223252/bonjouorMadame\n" );
		return;
	}

	if ( value.indexOf('all') >= 0 )
	{
		// msg.reply( "wait few seconds i'm shearching" );


		let oldest = "";
		if ( value.indexOf ( 'from' ) >= 0 )
		{
			oldest = new Date( value.substring ( value.indexOf ( 'from' ) + 4 ) );
			if ( oldest == "Invalid Date" )
			{ // request specific day's img
				oldest = new Date( first );
			}
		}
		else
		{
			oldest = new Date( first );
		}

		let now = new Date( );
		now.setHours ( 00, 00, 00 );

		let oneDay = 24*60*60*1000;
		let days = Math.round ( Math.abs ( ( oldest.getTime ( ) - now.getTime ( ) ) / oneDay ) ) + 1;

		function msgRpRec( page ) {
			if ( !allWorking ||
				( page < 1 ) )
			{
				return;
			}

			let uri = getPicture ( null, null, page );

			if ( !isGoodUri ( uri ) )
			{ // uri is invalide so just wait next
				msgRpRec ( page - 1 );
			}
			else
			{ // get correct uri
				msg.reply( uri )
					.then ( () => {
						setTimeout ( () => {
							msgRpRec ( page - 1 );
						}, 1000, page );
					});
			}
		}

		allWorking = true;
		msgRpRec ( days );


		reponceAvailable = true;
		return;
	}

	if ( value.indexOf('stop') >= 0 )
	{
		allWorking = false;
		reponceAvailable = true;
	}

	if ( value.indexOf('last') >= 0 )
	{ // request the last img
		msg.reply( getPicture ( ) );
		reponceAvailable = true;
	}

	if ( value.indexOf('first') >= 0 )
	{ // request the first img
		msg.reply( getPicture ( null, new Date ( first ) ) );
		reponceAvailable = true;
	}

	if ( ( value.length == '' ) ||
		( value.indexOf('random') >= 0 ) )
	{ // request random img
		let oldest = new Date( first );
		let now = new Date( );

		let oneDay = 24*60*60*1000;
		let days = Math.round ( Math.abs ( ( oldest.getTime ( ) - now.getTime ( ) ) / oneDay ) );

		let uri = "";
		do
		{
			let page = Math.floor ( Math.random ( ) * days );
			uri = getPicture ( null, null, page );
			if ( !uri )
			{
				console.log( page )
			}
		}
		while ( !isGoodUri( uri ) );

		msg.reply( uri );
		reponceAvailable = true;
	}


	let date = new Date( value );
	if ( date != "Invalid Date" )
	{ // request specific day's img
		let uri = getPicture ( null, date );

		if ( !uri )
		{
			msg.reply( "picture not found" );
		}
		else
		{
			msg.reply( uri );
		}
		reponceAvailable = true;
	}

	if ( !reponceAvailable )
	{
		msg.reply( "can't undertand request");
	}
});

client.on("guildCreate", guild => {
	console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
	client.user.setActivity(`Serving ${client.guilds.size} servers`);
});

client.login( config.token );

function isGoodUri ( uri )
{
	if ( !uri ||
		( uri.indexOf ( "tumblr_p6eaohD9AM1v1wvcuo1_1280" ) >= 0 ) ||
		( uri.indexOf ( "tumblr_p6eakhdEXQ1v1wvcuo1_1280" ) >= 0 ) ||
		( uri.indexOf ( "cropped-tumblr_o6wzsiZO9m1" ) >= 0 ) ||
		( uri.indexOf ( "noclub") >= 0 ) )
	{
		return ( false );
	}
	return ( true );
}

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

function getPicture ( calback, date = null, page = null )
{
	let target = '';

	if ( ( date != null ) )
	{
		target = '/'+date.getFullYear()+'/'+(date.getMonth()+1)+'/'+date.getDate();
	}
	else if ( page != null )
	{
		target = '/page/'+page+'/';
	}

	console.log ( target );
	let data = request('GET', 'http://www.bonjourmadame.fr'+target);
	if  ( !data )
	{
		return ( null );
	}

	data = data.body.toString('utf-8')
	data = data.substring ( data.indexOf ( 'id="page-content"' ) );

	do
	{
		let reg = new RegExp ( /<img[^>]+>/ );
		let result = reg.exec ( data );

		if ( !result )
		{
			return null;
		}

		uri = result[ 0 ].substring( result[ 0 ].indexOf( 'src="' ) + 5 );
		if ( isGoodUri( uri ) )
		{
			break;
		}
		data = data.substring ( data.indexOf ( uri ) + uri.length );
	}
	while ( 1 );
	uri = uri.substring( 0, uri.indexOf( '"' ) );
	uri = uri.substring( 0, uri.indexOf( '?' ) );
	if ( calback )
	{
		calback ( uri );
		return  null;
	}
	else
	{
		return ( uri );
	}

	// <img class="alignnone wp-image-884 size-full jetpack-lazy-image" src="https://i1.wp.com/bonjourmadame.fr/wp-content/uploads/2019/08/190806-1.jpg?resize=960%2C540" alt width="960" height="540" data-recalc-dims="1" data-lazy-srcset="https://i1.wp.com/bonjourmadame.fr/wp-content/uploads/2019/08/190806-1.jpg?w=1920 1920w, https://i1.wp.com/bonjourmadame.fr/wp-content/uploads/2019/08/190806-1.jpg?resize=300%2C169 300w, https://i1.wp.com/bonjourmadame.fr/wp-content/uploads/2019/08/190806-1.jpg?resize=768%2C432 768w, https://i1.wp.com/bonjourmadame.fr/wp-content/uploads/2019/08/190806-1.jpg?resize=1024%2C576 1024w, https://i1.wp.com/bonjourmadame.fr/wp-content/uploads/2019/08/190806-1.jpg?resize=1140%2C641 1140w" data-lazy-sizes="(max-width: 960px) 100vw, 960px" data-lazy-src="https://i1.wp.com/bonjourmadame.fr/wp-content/uploads/2019/08/190806-1.jpg?resize=960%2C540&amp;is-pending-load=1" srcset="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"><noscript><img class="alignnone wp-image-884 size-full" src="https://i1.wp.com/bonjourmadame.fr/wp-content/uploads/2019/08/190806-1.jpg?resize=960%2C540" alt="" width="960" height="540" srcset="https://i1.wp.com/bonjourmadame.fr/wp-content/uploads/2019/08/190806-1.jpg?w=1920 1920w, https://i1.wp.com/bonjourmadame.fr/wp-content/uploads/2019/08/190806-1.jpg?resize=300%2C169 300w, https://i1.wp.com/bonjourmadame.fr/wp-content/uploads/2019/08/190806-1.jpg?resize=768%2C432 768w, https://i1.wp.com/bonjourmadame.fr/wp-content/uploads/2019/08/190806-1.jpg?resize=1024%2C576 1024w, https://i1.wp.com/bonjourmadame.fr/wp-content/uploads/2019/08/190806-1.jpg?resize=1140%2C641 1140w" sizes="(max-width: 960px) 100vw, 960px" data-recalc-dims="1" />
}

function isWeekDay ( date )
{
	console.log( "is week ? "+date.getDay () );
	if ( ( date.getDay () == 0 ) ||
		( date.getDay () == 6 ) )
	{ //  if sunday or saturday wait next day
		return ( false );
	}

	console.log( 'yes : '+date.getFullYear()+'/'+(date.getMonth()+1)+'/'+date.getDate() );
	return ( true );
}

function sendAndWaitNext ( uD = 0 )
{
	let date = new Date();

	// test the day of the week
	if ( !isWeekDay ( date ) )
	{ //  if sunday or saturday wait next day
		console.log( "it's week-end" );
		console.log( " - "+millisTo ( uD ) );
		setTimeout ( () => { sendAndWaitNext( uD ) }, millisTo ( uD ) ) ;
		return;
	}

	let uri = getPicture ( );

	console.log( "it's not week-end" );

	// test if new picture available
	if ( ( uri == last ) ||
		!isGoodUri( uri ) )
	{ // if the last picture displayed is se same to the new one retest in 1 hour
		console.log( " - invalid url" );
		setTimeout ( () => { console.log( uD ); sendAndWaitNext( uD ) }, 3600 ) ;
		return;
	}


	for ( let i = 0; i < config.channels.length; i++ )
	{
		let list = Array.from(client.channels.findAll("name", config.channels[ i ] ));

		for ( let j = 0; j < list.length; j++ )
		{
			list[j].send ( uri );
		}
	}


	last = uri;
	// channel.send ( uri );

	console.log( "wait new" );

	setTimeout ( () => { sendAndWaitNext( uD ) }, millisTo ( uD ) ) ;
}
