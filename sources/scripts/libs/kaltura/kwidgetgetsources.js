/**
 * Stand alone source grabber.
 */

 if( ! window.kWidget ){
	window.kWidget = {};
}
( function( kWidget ) {
	// Add master exported function:
	kWidget.getSources = function( settings ){
		var sourceApi = new kWidget.api( { 'wid' : '_' + settings.partnerId , 'serviceUrl': 'https://cdnapisec.kaltura.com' } );
		sourceApi.doRequest([
		{
			'contextDataParams' : {
				'referrer' : document.URL,
				'objectType' : 'KalturaEntryContextDataParams',
				'flavorTags': 'all'
                },
			'service' : 'baseentry',
			'entryId' : settings.entryId,
			'action' : 'getContextData'
		},
		{
			'service' : 'baseentry',
			'action' : 'get',
			'version' : '-1',
			'entryId' : settings.entryId
		},
		{
			'service' : 'caption_captionasset',
			'action' : 'list',
			'filter:entryIdEqual' : settings.entryId
		}], function( result ){ // API result
            
			var ks = sourceApi.ks;
			var ipadAdaptiveFlavors = [];
			var iphoneAdaptiveFlavors = [];
			var deviceSources = [];
			var protocol = location.protocol.substr(0, location.protocol.length-1);
			// Set the service url based on protocol type
			var serviceUrl;

			if( protocol == 'https' ){
				serviceUrl = 'https://cdnapisec.kaltura.com';
			} else {
				serviceUrl = 'http://cdnbakmi.kaltura.com';
			}

			var baseUrl = serviceUrl + '/p/' + settings.partnerId +
					'/sp/' + settings.partnerId + '00/playManifest';


			for( var i in result[0]['flavorAssets'] ){

				var asset = result[0]['flavorAssets'][i];

				// Continue if clip is not ready (2)
				if( asset.status != 2  ) {
					continue;
				}

				// Setup a source object:
				var source = {
					/* 'data-bitrate' : asset.bitrate * 8, */
					'data-width' : asset.width,
					'data-height' : asset.height,
					'flavorParamsId': asset.flavorParamsId,
					'flavorId': asset.id,
					'status': asset.status
				};


				var src  = baseUrl + '/entryId/' + asset.entryId;

				// Check if Apple http streaming is enabled and the tags include applembr ( single stream HLS )
				if( asset.tags.indexOf('applembr') != -1 ) {
					src += '/format/applehttp/protocol/'+ protocol + '/a.m3u8';

					deviceSources.push({
						/* 'data-flavorid' : 'AppleMBR', */
						'type' : 'application/vnd.apple.mpegurl',
						'src' : src
					});

					continue;

				} else {
					src += '/flavorId/' + asset.id + '/format/url/protocol/https';
				}

				// add the file extension:
				if( asset.tags.toLowerCase().indexOf('ipad') != -1 ){
					source['src'] = src + '/a.mp4';
					/* source['data-flavorid'] = 'iPad'; */
					source['type'] = 'video/mp4';
				}

				// Check for iPhone src
				if( asset.tags.toLowerCase().indexOf('iphone') != -1 ){
					source['src'] = src + '/a.mp4';
					/* source['data-flavorid'] = 'iPhone'; */
					source['type'] = 'video/mp4';
				}

				// Check for iPhone src with flavor params id
				if( asset.flavorParamsId === 487081) {
					source['src'] = src + '/a.mp4';
					/* source['data-flavorid'] = 'HD/720'; */
					source['type'] = 'video/mp4';
				}

				// Check for ogg source
				if( asset.fileExt &&
					(
						asset.fileExt.toLowerCase() == 'ogg'
						||
						asset.fileExt.toLowerCase() == 'ogv'
						||
						( asset.containerFormat && asset.containerFormat.toLowerCase() == 'ogg' )
					)
				){
					source['src'] = src + '/a.ogg';
					/* source['data-flavorid'] = 'ogg'; */
					source['type'] = 'video/ogg';
				}

				// Check for webm source
				if( asset.fileExt == 'webm'
					||
					asset.tags.indexOf('webm') != -1
					|| // Kaltura transcodes give: 'matroska'
					( asset.containerFormat && asset.containerFormat.toLowerCase() == 'matroska' )
					|| // some ingestion systems give "webm"
					( asset.containerFormat && asset.containerFormat.toLowerCase() == 'webm' )
				){
					source['src'] = src + '/a.webm';
					/* source['data-flavorid'] = 'webm'; */
					source['type'] = 'video/webm';
				}

				// Check for 3gp source
				if( asset.fileExt == '3gp' ){
					source['src'] = src + '/a.3gp';
					/* source['data-flavorid'] = '3gp'; */
					source['type'] = 'video/3gp';
				}

				// Add the device sources
				if( source['src'] ){
					deviceSources.push( source );
				}

				// Check for adaptive compatible flavor:
				if( asset.tags.toLowerCase().indexOf('ipadnew') != -1 ){
					ipadAdaptiveFlavors.push( asset.id );
				}

				if( asset.tags.toLowerCase().indexOf('iphonenew') != -1 ){
					iphoneAdaptiveFlavors.push( asset.id );
				}

			};

			// Add the flavor list adaptive style urls ( multiple flavor HLS ):
			// Create iPad flavor for Akamai HTTP
			if( ipadAdaptiveFlavors.length != 0 ) {
				deviceSources.push({
					/* 'data-flavorid' : 'iPadNew', */
					'type' : 'application/vnd.apple.mpegurl',
					'src' : baseUrl + '/entryId/' + asset.entryId + '/flavorIds/' + ipadAdaptiveFlavors.join(',')  + '/format/applehttp/protocol/' + protocol + '/a.m3u8'
				});
			}

			// Create iPhone flavor for Akamai HTTP
			if(iphoneAdaptiveFlavors.length != 0 ) {
				deviceSources.push({
					/* 'data-flavorid' : 'iPhoneNew', */
					'type' : 'application/vnd.apple.mpegurl',
					'src' : baseUrl + '/entryId/' + asset.entryId + '/flavorIds/' + iphoneAdaptiveFlavors.join(',')  + '/format/applehttp/protocol/' + protocol + '/a.m3u8'
				});
			}

			// callback with device sources, poster
			if( settings.callback ){
				settings.callback({
					'status': result[1]['status'],
					'poster': result[1]['thumbnailUrl'],
					'duration': result[1]['duration'],
					'name': result[1]['name'],
					'entryId' :  result[1]['id'],
					//'description': result[2]['description'],
                    //'captionId': ( ( result[2]['totalCount'] > 0 ) ? result[2]['objects'][0]['id'] : null ),
					'caption': ( ( result[2]['totalCount'] > 0 ) ? result[2]['objects'] : null ),
					'sources': deviceSources
				});
				
			}

		});
	};
} )( window.kWidget );
