
/**
 * Returns components of the given name.
 *
 * @param {string} name - Field name, such as 'abc' or 'abc[de]'.
 * @return {Array} Single dimension array of name components.
 */
export const dissolveName = name => {
	const found = name.trim().match(
		/^([a-z][0-9a-z:_-]*)((?:\[\s*(?:[a-z][0-9a-z:_-]*|[0-9]*)\s*\])*)$/i
	);

	if ( ! found ) {
		return [];
	}

	const trunk = found[ 1 ];
	const layers = found[ 2 ].match( /\[.*?\]/ig );

	if ( layers ) {
		return [ trunk, ...layers.map( layer => layer.slice( 1, -1 ).trim() ) ];
	} else {
		return [ trunk ];
	}
};


/**
 * Outputs the input value from which blank values are excluded.
 */
export const excludeBlank = ( input, filter = 'string' ) => {
	if ( 'string' === filter ) {
		filter = value => 'string' === typeof value && '' !== value.trim();
	} else if ( 'file' === filter ) {
		filter = value => value instanceof File && value.size;
	}

	input ??= '';

	if ( ! ( input instanceof Object ) ) {
		input = String( input );
	}

	if ( 'string' === typeof input || input instanceof File ) {
		return filter( input ) ? input : undefined;
	} else {
		const output = {};

		for ( const [ key, value ] of Object.entries( input ) ) {
			const result = excludeBlank( value, filter );

			if ( result ) {
				output[ key ] = result;
			}
		}

		return Object.values( output ).length ? output : undefined;
	}
};
