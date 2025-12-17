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


export const excludeBlank = tree => {
	if ( tree instanceof Map ) {
		const map = new Map();

		for ( const [ key, value ] of tree ) {
			const result = excludeBlank( value );

			if (
				result instanceof Map && 0 < result.size ||
				result instanceof File && 0 < result.size ||
				'string' === typeof result && '' !== result
			) {
				map.set( key, result );
			}
		}

		return map;
	} else if ( tree instanceof File ) {
		return tree;
	} else {
		const value = String( tree );
		return value.trim();
	}
};
