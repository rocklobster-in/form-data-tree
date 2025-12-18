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

			if (
				result instanceof Map && result.size ||
				'string' === filter && 'string' === typeof result && '' !== result ||
				'file' === filter && result instanceof File && result.size ||
				'function' === typeof filter && filter( key, result )
			) {
				map.set( key, result );
			}
		}

		return map;
	} else {
		if ( 'string' === typeof tree ) {
			tree = tree.trim();
		}

		return tree;
	}
};
