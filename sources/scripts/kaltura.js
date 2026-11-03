/*
 * Looks up a Kaltura entry's playable sources, poster, duration, and captions
 * through the Kaltura API (v3), using an anonymous widget session.
 *
 * Replaces Kaltura's deprecated v2 player library (mwEmbed), which was only
 * used for this lookup. Playback itself is handled by VideoJS.
 */

const SERVICE_URL = 'https://cdnapisec.kaltura.com';
const FLAVOR_READY = 2;

function getKalturaSources( partnerId, entryId ) {

    const ks = '{1:result:ks}';

    const request = {
        format: 1,
        apiVersion: '3.1',
        clientTag: 'sbplus',
        1: {
            service: 'session',
            action: 'startWidgetSession',
            widgetId: '_' + partnerId
        },
        2: {
            ks: ks,
            service: 'baseentry',
            action: 'getContextData',
            entryId: entryId,
            contextDataParams: {
                objectType: 'KalturaEntryContextDataParams',
                referrer: document.URL,
                flavorTags: 'all'
            }
        },
        3: {
            ks: ks,
            service: 'baseentry',
            action: 'get',
            version: -1,
            entryId: entryId
        },
        4: {
            ks: ks,
            service: 'caption_captionasset',
            action: 'list',
            filter: {
                objectType: 'KalturaAssetFilter',
                entryIdEqual: entryId
            }
        }
    };

    return fetch( SERVICE_URL + '/api_v3/service/multirequest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify( request )
    } )
    .then( ( response ) => {

        if ( !response.ok ) {
            throw new Error( 'Kaltura API request failed with HTTP ' + response.status );
        }

        return response.json();

    } )
    .then( ( results ) => {

        if ( !Array.isArray( results ) ) {
            throw new Error( 'Unexpected Kaltura API response' );
        }

        results.forEach( ( result ) => {
            if ( result && result.objectType === 'KalturaAPIException' ) {
                throw new Error( 'Kaltura API error: ' + result.message );
            }
        } );

        const context = results[1];
        const entry = results[2];
        const captions = results[3];
        const baseUrl = SERVICE_URL + '/p/' + partnerId + '/sp/' + partnerId + '00/playManifest/entryId/' + entryId;

        const sources = ( context.flavorAssets || [] )
            .filter( ( asset ) => asset.status === FLAVOR_READY )
            .map( ( asset ) => ( {
                flavorParamsId: asset.flavorParamsId,
                flavorId: asset.id,
                status: asset.status,
                width: asset.width,
                height: asset.height,
                src: baseUrl + '/flavorId/' + asset.id + '/format/url/protocol/https/a.' + ( asset.fileExt || 'mp4' )
            } ) );

        return {
            status: entry.status,
            poster: entry.thumbnailUrl,
            duration: entry.duration,
            name: entry.name,
            entryId: entry.id,
            caption: captions && captions.totalCount > 0 ? captions.objects : null,
            sources: sources
        };

    } );

}

export { getKalturaSources };
