export const dissolveName = name => {
	const found = name.trim().match(
		/^([a-z][0-9a-z:_-]*)((?:\[\s*[a-z][0-9a-z:_-]*\s*\])*)$/i
	);

	if ( ! found ) {
		return [];
	}

	const core = found[ 1 ];
	const layers = found[ 2 ].match( /\[\s*[a-z][0-9a-z:_-]*\s*\]/ig );

	if ( layers ) {
		return [ core, ...layers.map( layer => layer.slice( 1, -1 ).trim() ) ];
	} else {
		return [ core ];
	}
};


export const excludeBlank = ( tree, filter = 'string' ) => {
	if ( tree instanceof Map ) {
		const map = new Map();

		for ( const [ key, value ] of tree ) {
			const result = excludeBlank( value, filter );

			if ( result ) {
				map.set( key, result );
			}
		}

		if ( map.size ) {
			return map;
		}
	} else {
		if ( 'string' === typeof tree ) {
			tree = tree.trim();
		}

		if ( 'string' === filter ) {
			filter = value => 'string' === typeof value && '' !== value;
		} else if ( 'file' === filter ) {
			filter = value => value instanceof File && value.size;
		}

		if ( filter( tree ) ) {
			return tree;
		}
	}
};
