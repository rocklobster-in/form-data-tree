
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
	if ( input instanceof Map ) {
		const map = new Map();

		for ( const [ key, value ] of input ) {
			const result = excludeBlank( value, filter );

			if ( result ) {
				map.set( key, result );
			}
		}

		if ( map.size ) {
			return map;
		}
	} else {
		if ( 'string' === typeof input ) {
			input = input.trim();
		}

		if ( 'string' === filter ) {
			filter = value => 'string' === typeof value && '' !== value;
		} else if ( 'file' === filter ) {
			filter = value => value instanceof File && value.size;
		}

		if ( filter( input ) ) {
			return input;
		}
	}
};
